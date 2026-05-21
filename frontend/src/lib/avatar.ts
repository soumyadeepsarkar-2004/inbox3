/** Returns a display URL for an avatar value (IPFS CID or data URL). */
export function resolveAvatarUrl(avatar: string | undefined): string | undefined {
    if (!avatar) return undefined
    if (avatar.startsWith('data:') || avatar.startsWith('blob:') || avatar.startsWith('http')) {
        return avatar
    }
    return `https://gateway.pinata.cloud/ipfs/${avatar}`
}
