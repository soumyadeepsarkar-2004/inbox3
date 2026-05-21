import { useState, useEffect, useRef } from 'react';
import { profileManager, type Contact } from '../lib/profileManager';

interface ContactsListProps {
    onSelectContact?: (address: string) => void;
}

export default function ContactsList({ onSelectContact }: ContactsListProps) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newContact, setNewContact] = useState({ address: '', username: '', notes: '' });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = () => {
        const allContacts = profileManager.getContacts();
        setContacts(allContacts);
    };

    const handleAddContact = () => {
        if (!newContact.address.trim() || !newContact.username.trim()) {
            showMessage('error', 'Address and username are required');
            return;
        }

        try {
            profileManager.addContact({
                address: newContact.address.trim(),
                username: newContact.username.trim(),
                notes: newContact.notes.trim()
            });

            loadContacts();
            setNewContact({ address: '', username: '', notes: '' });
            setShowAddForm(false);
            showMessage('success', 'Contact added successfully');
        } catch (error) {
            showMessage('error', error instanceof Error ? error.message : 'Failed to add contact');
        }
    };

    const handleRemoveContact = (address: string) => {
        if (!confirm('Are you sure you want to remove this contact?')) return;

        try {
            profileManager.removeContact(address);
            loadContacts();
            showMessage('success', 'Contact removed');
        } catch {
            showMessage('error', 'Failed to remove contact');
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
                searchInputRef.current?.blur();
                setSearchQuery('');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const filteredContacts = searchQuery.trim()
        ? profileManager.searchContacts(searchQuery)
        : contacts;

    return (
        <div className="contacts-view animate-fade-in">
            <div className="flex items-center justify-between mb-6 bg-secondary p-4 rounded-lg border border-border">
                <div>
                    <h2 className="text-xl font-black text-foreground tracking-tight uppercase">Contacts</h2>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Add and manage your contacts</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={`btn ${showAddForm ? 'btn--ghost' : 'btn--primary'} py-2! px-5! rounded-lg! text-xs font-black uppercase tracking-widest`}
                >
                    {showAddForm ? 'Cancel' : '+ Add New'}
                </button>
            </div>

            {message && (
                <div
                    className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success'
                        ? 'bg-(--success-light) text-green-500 border border-green-500/20'
                        : 'bg-(--error-light) text-destructive border border-destructive/20'
                        }`}
                >
                    {message.text}
                </div>
            )}

            {/* Add Contact Form */}
            {showAddForm && (
                <div className="mb-6 p-6 bg-card/50 liquid-glass  rounded-[2.5rem] border border-primary/20 shadow-xl shadow-indigo-500/5 animate-scale-in">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-5 text-primary">New Contact</h3>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Wallet Address *</label>
                            <input
                                type="text"
                                value={newContact.address}
                                onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                                placeholder="0x... (Aptos Address)"
                                className="w-full px-5 py-3.5 bg-secondary/50 border border-border/50 rounded-2xl focus:border-primary outline-none transition-all text-xs font-mono"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Name *</label>
                            <input
                                type="text"
                                value={newContact.username}
                                onChange={(e) => setNewContact({ ...newContact, username: e.target.value })}
                                placeholder="e.g. Satoshi"
                                maxLength={30}
                                className="w-full px-5 py-3.5 bg-secondary/50 border border-border/50 rounded-2xl focus:border-primary outline-none transition-all text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Notes (optional)</label>
                            <textarea
                                value={newContact.notes}
                                onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                                placeholder="Security notes, relationship, etc..."
                                rows={2}
                                className="w-full px-5 py-3.5 bg-secondary/50 border border-border/50 rounded-2xl focus:border-primary outline-none transition-all text-sm resize-none"
                            />
                        </div>

                        <button
                            onClick={handleAddContact}
                            className="w-full mt-2 py-4 bg-linear-to-br from-indigo-400 to-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                        >
                            Add Contact
                        </button>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="mb-6 relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                </div>
                <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search contacts..."
                    className="w-full pl-12 pr-12 py-4 bg-secondary/50 border border-border/50 rounded-2xl focus:focus:bg-card focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground/50 font-medium"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-black/5 hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                )}
                {!searchQuery && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-focus-within:opacity-0 transition-opacity hidden sm:block">
                        <span className="text-[10px] font-black text-muted-foreground border border-border/50 px-1.5 py-0.5 rounded-md bg-black/20">/</span>
                    </div>
                )}
            </div>

            {/* Contacts List */}
            {filteredContacts.length === 0 ? (
                <div className="text-center py-16 bg-secondary rounded-2xl border-2 border-dashed border-border">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {searchQuery ? 'No contacts found' : 'No contacts yet'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto px-1 custom-scrollbar">
                    {filteredContacts.map((contact) => (
                        <div
                            key={contact.address}
                            className="p-4 bg-card/50 liquid-glass  rounded-2xl border border-border/50 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="relative">
                                        {contact.avatar ? (
                                            <img
                                                src={contact.avatar?.startsWith('data:') || contact.avatar?.startsWith('http') ? contact.avatar : `https://gateway.pinata.cloud/ipfs/${contact.avatar}`}
                                                alt={contact.username}
                                                className="w-12 h-12 rounded-2xl object-cover border-2 border-secondary shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-white/5 to-white/10 flex items-center justify-center border border-border/50">
                                                <span className="text-sm text-foreground font-black">
                                                    {contact.username.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-card"></div>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-foreground tracking-tight truncate">{contact.username}</h3>
                                        <p className="text-[10px] font-mono text-muted-foreground truncate mt-0.5 opacity-60 tracking-wider font-bold">{contact.address}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {onSelectContact && (
                                        <button
                                            onClick={() => onSelectContact(contact.address)}
                                            className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-90"
                                            title="Send message"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                            </svg>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleRemoveContact(contact.address)}
                                        className="w-10 h-10 rounded-xl bg-destructive/10 text-red-500 flex items-center justify-center hover:bg-destructive hover:text-white transition-all active:scale-90"
                                        title="Remove contact"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {contact.notes && (
                                <div className="mt-3 pt-3 border-t border-border/30">
                                    <p className="text-[11px] text-muted-foreground italic line-clamp-2 leading-relaxed">
                                        <span className="font-black uppercase text-[9px] not-italic mr-2 opacity-40">Notes:</span>
                                        {contact.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8 pt-6 border-t border-border text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'}
                </p>
            </div>
        </div>
    );
}
