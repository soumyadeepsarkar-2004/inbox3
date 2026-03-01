import { useState, useEffect, useRef, useCallback } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { profileManager, type UserProfile } from '../lib/profileManager';
import { encryptionManager } from '../lib/encryptionManager';
import { uploadFile } from '../lib/ipfs';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a display URL for an avatar value (IPFS CID or data URL). */
export function resolveAvatarUrl(avatar: string | undefined): string | undefined {
    if (!avatar) return undefined;
    if (avatar.startsWith('data:') || avatar.startsWith('blob:') || avatar.startsWith('http')) {
        return avatar;
    }
    return `https://gateway.pinata.cloud/ipfs/${avatar}`;
}

/** Convert a File to a base64 data URL. */
function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProfileEditor() {
    const { account } = useWallet();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [usernameError, setUsernameError] = useState('');

    useEffect(() => {
        if (!account?.address) return;
        const existing = profileManager.getProfile(account.address.toString());
        if (existing) {
            setProfile(existing);
            setUsername(existing.username ?? '');
            setBio(existing.bio ?? '');
            setPreviewUrl(resolveAvatarUrl(existing.avatar));
        }
    }, [account]);

    const showToast = useCallback((type: 'success' | 'error', text: string) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), 4000);
    }, []);

    // ── Avatar upload ──────────────────────────────────────────────────────────

    const processFile = useCallback(async (file: File) => {
        if (!account?.address) return;

        if (!file.type.startsWith('image/')) {
            showToast('error', 'Please select a valid image file (JPG, PNG, GIF, WebP)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast('error', 'Image must be under 5 MB');
            return;
        }

        setUploading(true);
        try {
            const dataUrl = await fileToDataUrl(file);
            setPreviewUrl(dataUrl);

            const addr = account.address.toString();
            let current = profileManager.getProfile(addr);
            if (!current) {
                current = profileManager.createProfile(addr, username.trim() || addr.slice(0, 8));
            }

            profileManager.updateAvatar(addr, dataUrl);
            setProfile(profileManager.getProfile(addr));

            try {
                const cid = await uploadFile(file);
                if (cid && !cid.startsWith('mock-') && !cid.startsWith('fallback-')) {
                    profileManager.updateAvatar(addr, cid);
                    setProfile(profileManager.getProfile(addr));
                    setPreviewUrl(`https://gateway.pinata.cloud/ipfs/${cid}`);
                }
            } catch {
                // IPFS not configured — data URL already saved locally
            }

            showToast('success', 'Profile picture updated');
        } catch (err) {
            console.error('Avatar processing failed:', err);
            showToast('error', 'Could not process image. Please try another file.');
        } finally {
            setUploading(false);
        }
    }, [account, username, showToast]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
        e.target.value = '';
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, [processFile]);

    // ── Save profile ───────────────────────────────────────────────────────────

    const handleSave = async () => {
        if (!account?.address) return;

        const trimmed = username.trim();
        if (!trimmed) {
            setUsernameError('Username is required');
            return;
        }
        if (trimmed.length < 2) {
            setUsernameError('Username must be at least 2 characters');
            return;
        }
        setUsernameError('');
        setSaving(true);
        try {
            await encryptionManager.initializeKeys(account.address.toString());
            const publicKey = encryptionManager.getPublicKeyHex();
            const addr = account.address.toString();

            const base: UserProfile = profile ?? {
                address: addr,
                username: trimmed,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const updated: UserProfile = {
                ...base,
                username: trimmed,
                bio: bio.trim(),
                publicKey,
                updatedAt: Date.now(),
            };
            profileManager.saveProfile(updated);
            setProfile(updated);
            showToast('success', 'Profile saved successfully');
        } catch (err) {
            console.error('Save failed:', err);
            showToast('error', 'Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (!account) {
        return (
            <div className="py-12 text-center text-(--text-muted)">
                Connect your wallet to manage your profile
            </div>
        );
    }

    const addr = account.address.toString();
    const initials = (username || addr).slice(0, 2).toUpperCase();

    return (
        <div className="relative">
            {toast && (
                <div className={`absolute -top-2 left-0 right-0 z-50 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2.5 shadow-lg ${ toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white' }`}>
                    {toast.type === 'success' ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    )}
                    {toast.text}
                </div>
            )}

            <div className="pt-6 space-y-5">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-2">
                    <div
                        className={`relative group cursor-pointer rounded-full select-none transition-all ${dragOver ? 'ring-4 ring-(--primary-brand) ring-offset-2' : ''}`}
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        title="Click or drag & drop to change photo"
                    >
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-(--bg-secondary) border-2 border-(--border-color) flex items-center justify-center">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-(--text-muted)">{initials}</span>
                            )}
                        </div>
                        {!uploading && (
                            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                            </div>
                        )}
                        {uploading && (
                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                    <button type="button" onClick={() => !uploading && fileInputRef.current?.click()} disabled={uploading} className="text-sm font-medium text-(--primary-brand) hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                        {uploading ? 'Uploading…' : previewUrl ? 'Change photo' : 'Upload photo'}
                    </button>
                    <p className="text-xs text-(--text-muted)">JPG, PNG or GIF · max 5 MB</p>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
                </div>

                {/* Username */}
                <div>
                    <label className="block text-sm font-medium text-(--text-primary) mb-1.5">Username <span className="text-red-400">*</span></label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); setUsernameError(''); }}
                        placeholder="e.g. satoshi"
                        maxLength={30}
                        className={`w-full px-4 py-2.5 bg-(--bg-secondary) border rounded-xl text-(--text-primary) placeholder:text-(--text-muted) text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-brand)/40 transition-all ${usernameError ? 'border-red-400' : 'border-(--border-color)'}`}
                    />
                    {usernameError ? <p className="text-xs text-red-400 mt-1">{usernameError}</p> : <p className="text-xs text-(--text-muted) mt-1">{username.length}/30 characters</p>}
                </div>

                {/* Bio */}
                <div>
                    <label className="block text-sm font-medium text-(--text-primary) mb-1.5">Bio</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="A short bio about yourself…"
                        maxLength={200}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-(--bg-secondary) border border-(--border-color) rounded-xl text-(--text-primary) placeholder:text-(--text-muted) text-sm focus:outline-none focus:ring-2 focus:ring-(--primary-brand)/40 transition-all resize-none"
                    />
                    <p className="text-xs text-(--text-muted) mt-1">{bio.length}/200 characters</p>
                </div>

                {/* Wallet Address */}
                <div>
                    <label className="block text-sm font-medium text-(--text-primary) mb-1.5">Wallet Address</label>
                    <div className="flex items-center gap-2">
                        <input type="text" value={addr} readOnly className="flex-1 px-4 py-2.5 bg-(--bg-secondary) border border-(--border-color) rounded-xl text-(--text-muted) font-mono text-xs truncate" />
                        <button type="button" onClick={() => navigator.clipboard.writeText(addr).then(() => showToast('success', 'Address copied'))} className="p-2.5 rounded-xl border border-(--border-color) text-(--text-muted) hover:text-(--text-primary) hover:border-(--primary-brand) transition-all shrink-0" title="Copy address">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <button type="button" onClick={handleSave} disabled={saving || uploading} className="w-full py-3 bg-(--primary-brand) text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {saving ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
                    ) : (
                        <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Save Profile</>
                    )}
                </button>

                {profile && (
                    <p className="text-xs text-(--text-muted) text-center">Last updated {new Date(profile.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                )}
            </div>
        </div>
    );
}
