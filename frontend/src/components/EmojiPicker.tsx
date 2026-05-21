import { useState, useRef, useEffect } from 'react'

interface EmojiPickerProps {
    onSelect: (emoji: string) => void
    position?: 'top' | 'bottom'
}

const EMOJI_CATEGORIES = {
    'Smileys': ['ðŸ˜€', 'ðŸ˜ƒ', 'ðŸ˜„', 'ðŸ˜', 'ðŸ˜†', 'ðŸ˜…', 'ðŸ¤£', 'ðŸ˜‚', 'ðŸ™‚', 'ðŸ˜Š', 'ðŸ˜‡', 'ðŸ¥°', 'ðŸ˜', 'ðŸ¤©', 'ðŸ˜˜', 'ðŸ˜—', 'ðŸ˜š', 'ðŸ˜‹', 'ðŸ˜›', 'ðŸ˜œ', 'ðŸ¤ª', 'ðŸ˜', 'ðŸ¤‘', 'ðŸ¤—', 'ðŸ¤­', 'ðŸ¤«', 'ðŸ¤”', 'ðŸ¤', 'ðŸ¤¨', 'ðŸ˜', 'ðŸ˜‘', 'ðŸ˜¶', 'ðŸ˜', 'ðŸ˜’', 'ðŸ™„', 'ðŸ˜¬', 'ðŸ¤¥', 'ðŸ˜Œ', 'ðŸ˜”', 'ðŸ˜ª', 'ðŸ¤¤', 'ðŸ˜´', 'ðŸ˜·', 'ðŸ¤’', 'ðŸ¤•', 'ðŸ¤¢', 'ðŸ¤®', 'ðŸ¤§', 'ðŸ¥µ', 'ðŸ¥¶', 'ðŸ¥´', 'ðŸ˜µ', 'ðŸ¤¯', 'ðŸ¤ ', 'ðŸ¥³', 'ðŸ¥¸', 'ðŸ˜Ž', 'ðŸ¤“', 'ðŸ§'],
    'Gestures': ['ðŸ‘‹', 'ðŸ¤š', 'ðŸ–ï¸', 'âœ‹', 'ðŸ––', 'ðŸ‘Œ', 'ðŸ¤Œ', 'ðŸ¤', 'âœŒï¸', 'ðŸ¤ž', 'ðŸ¤Ÿ', 'ðŸ¤˜', 'ðŸ¤™', 'ðŸ‘ˆ', 'ðŸ‘‰', 'ðŸ‘†', 'ðŸ–•', 'ðŸ‘‡', 'â˜ï¸', 'ðŸ‘', 'ðŸ‘Ž', 'âœŠ', 'ðŸ‘Š', 'ðŸ¤›', 'ðŸ¤œ', 'ðŸ‘', 'ðŸ™Œ', 'ðŸ‘', 'ðŸ¤²', 'ðŸ¤', 'ðŸ™', 'âœï¸', 'ðŸ’…', 'ðŸ¤³', 'ðŸ’ª', 'ðŸ¦¾', 'ðŸ¦¿', 'ðŸ¦µ', 'ðŸ¦¶', 'ðŸ‘‚', 'ðŸ¦»', 'ðŸ‘ƒ', 'ðŸ§ ', 'ðŸ«€', 'ðŸ«', 'ðŸ¦·', 'ðŸ¦´', 'ðŸ‘€', 'ðŸ‘ï¸', 'ðŸ‘…', 'ðŸ‘„'],
    'Hearts': ['â¤ï¸', 'ðŸ§¡', 'ðŸ’›', 'ðŸ’š', 'ðŸ’™', 'ðŸ’œ', 'ðŸ–¤', 'ðŸ¤', 'ðŸ¤Ž', 'ðŸ’”', 'â£ï¸', 'ðŸ’•', 'ðŸ’ž', 'ðŸ’“', 'ðŸ’—', 'ðŸ’–', 'ðŸ’˜', 'ðŸ’', 'ðŸ’Ÿ', 'â™¥ï¸', 'ðŸ’Œ', 'ðŸ’‹', 'ðŸ«¶'],
    'Objects': ['ðŸ’¬', 'ðŸ’­', 'ðŸ—¯ï¸', 'ðŸ’¢', 'ðŸ’¥', 'ðŸ’«', 'ðŸ’¦', 'ðŸ’¨', 'ðŸ•³ï¸', 'ðŸ’£', 'ðŸ’¬', 'ðŸ‘ï¸â€ðŸ—¨ï¸', 'ðŸ—¨ï¸', 'ðŸ—¯ï¸', 'ðŸ’­', 'â­', 'ðŸŒŸ', 'âœ¨', 'ðŸ’«', 'ðŸŽ‰', 'ðŸŽŠ', 'ðŸŽ', 'ðŸ†', 'ðŸ¥‡', 'ðŸ¥ˆ', 'ðŸ¥‰', 'âš½', 'ðŸ€', 'ðŸˆ', 'âš¾', 'ðŸ¥Ž', 'ðŸŽ¾', 'ðŸ', 'ðŸ‰', 'ðŸ¥', 'ðŸŽ±', 'ðŸª€', 'ðŸ“', 'ðŸ¸', 'ðŸ’', 'ðŸ‘', 'ðŸ¥', 'ðŸ', 'ðŸªƒ', 'ðŸ¥…', 'â›³', 'ðŸª', 'ðŸ¹', 'ðŸŽ£', 'ðŸ¤¿', 'ðŸ¥Š', 'ðŸ¥‹', 'ðŸŽ½', 'ðŸ›¹', 'ðŸ›¼', 'ðŸ›·', 'â›¸ï¸', 'ðŸ¥Œ', 'ðŸŽ¿', 'â›·ï¸', 'ðŸ‚'],
    'Nature': ['ðŸŒ¸', 'ðŸ’®', 'ðŸµï¸', 'ðŸŒ¹', 'ðŸ¥€', 'ðŸŒº', 'ðŸŒ»', 'ðŸŒ¼', 'ðŸŒ·', 'ðŸŒ±', 'ðŸª´', 'ðŸŒ²', 'ðŸŒ³', 'ðŸŒ´', 'ðŸŒµ', 'ðŸŒ¾', 'ðŸŒ¿', 'â˜˜ï¸', 'ðŸ€', 'ðŸ', 'ðŸ‚', 'ðŸƒ', 'ðŸªº', 'ðŸª¹', 'ðŸ‡', 'ðŸˆ', 'ðŸ‰', 'ðŸŠ', 'ðŸ‹', 'ðŸŒ', 'ðŸ', 'ðŸ¥­', 'ðŸŽ', 'ðŸ', 'ðŸ', 'ðŸ‘', 'ðŸ’', 'ðŸ“', 'ðŸ«', 'ðŸ¥', 'ðŸ…', 'ðŸ«’', 'ðŸ¥¥', 'ðŸ¥‘', 'ðŸ†', 'ðŸ¥”', 'ðŸ¥•', 'ðŸŒ½', 'ðŸŒ¶ï¸', 'ðŸ«‘', 'ðŸ¥’', 'ðŸ¥¬', 'ðŸ¥¦', 'ðŸ§„', 'ðŸ§…', 'ðŸ„', 'ðŸ¥œ', 'ðŸ«˜', 'ðŸŒ°'],
    'Food': ['ðŸ•', 'ðŸ”', 'ðŸŸ', 'ðŸŒ­', 'ðŸ¿', 'ðŸ§ˆ', 'ðŸ¥ž', 'ðŸ§‡', 'ðŸ§€', 'ðŸ–', 'ðŸ—', 'ðŸ¥©', 'ðŸ¥“', 'ðŸ±', 'ðŸ˜', 'ðŸ™', 'ðŸš', 'ðŸ›', 'ðŸœ', 'ðŸ', 'ðŸ ', 'ðŸ¢', 'ðŸ£', 'ðŸ¤', 'ðŸ¥', 'ðŸ¥®', 'ðŸ¡', 'ðŸ¥Ÿ', 'ðŸ¥ ', 'ðŸ¥¡', 'ðŸ¦€', 'ðŸ¦ž', 'ðŸ¦', 'ðŸ¦‘', 'ðŸ¦ª', 'ðŸ¦', 'ðŸ§', 'ðŸ¨', 'ðŸ©', 'ðŸª', 'ðŸŽ‚', 'ðŸ°', 'ðŸ§', 'ðŸ¥§', 'ðŸ«', 'ðŸ¬', 'ðŸ­', 'ðŸ®', 'ðŸ¯', 'ðŸ¼', 'ðŸ¥›', 'â˜•', 'ðŸ«–', 'ðŸµ', 'ðŸ¶', 'ðŸ¾', 'ðŸ·', 'ðŸ¸', 'ðŸ¹', 'ðŸº', 'ðŸ»', 'ðŸ¥‚', 'ðŸ¥ƒ', 'ðŸ«—', 'ðŸ¥¤', 'ðŸ§‹', 'ðŸ§ƒ', 'ðŸ§‰', 'ðŸ§Š'],
}

const QUICK_REACTIONS = ['ðŸ‘', 'â¤ï¸', 'ðŸ˜‚', 'ðŸ˜®', 'ðŸ˜¢', 'ðŸŽ‰', 'ðŸ”¥', 'ðŸ’¯']

export default function EmojiPicker({ onSelect, position = 'bottom' }: EmojiPickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('Smileys')
    const [search, setSearch] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleEmojiClick = (emoji: string) => {
        onSelect(emoji)
        setIsOpen(false)
    }

    const filteredEmojis = search
        ? Object.values(EMOJI_CATEGORIES).flat().filter(emoji => emoji.includes(search))
        : EMOJI_CATEGORIES[activeCategory]

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
                title="Add Emoji"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className={`absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 z-120 w-[320px] bg-card rounded-2xl shadow-xl border border-border overflow-hidden animate-fade-in`}
                >
                    {/* Quick Reactions */}
                    <div className="flex gap-1 p-3 border-b border-border bg-secondary">
                        {QUICK_REACTIONS.map(emoji => (
                            <button
                                type="button"
                                key={emoji}
                                onClick={() => handleEmojiClick(emoji)}
                                className="flex-1 text-xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-card"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="p-2 border-b border-border">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search emoji..."
                            className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border-none outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Category Tabs */}
                    {!search && (
                        <div className="flex gap-1 p-2 border-b border-border overflow-x-auto">
                            {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                                <button
                                    type="button"
                                    key={cat}
                                    onClick={() => setActiveCategory(cat as keyof typeof EMOJI_CATEGORIES)}
                                    className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${activeCategory === cat
                                        ? 'bg-primary text-white'
                                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Emoji Grid */}
                    <div className="p-2 h-48 overflow-y-auto grid grid-cols-8 gap-1">
                        {filteredEmojis.map((emoji, index) => (
                            <button
                                type="button"
                                key={`${emoji}-${index}`}
                                onClick={() => handleEmojiClick(emoji)}
                                className="text-xl p-1 rounded-lg hover:bg-secondary hover:scale-110 transition-all"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
