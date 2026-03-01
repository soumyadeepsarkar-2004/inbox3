import { useState } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useMetrics } from './PerformanceDashboard'

interface CreateGroupModalProps {
    isOpen: boolean
    onClose: () => void
    contractAddress: string
    onGroupCreated: () => void
}

export default function CreateGroupModal({ isOpen, onClose, contractAddress, onGroupCreated }: CreateGroupModalProps) {
    const { signAndSubmitTransaction } = useWallet()
    const [groupName, setGroupName] = useState('')
    const [loading, setLoading] = useState(false)
    const { incrementGroupsJoined } = useMetrics()

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!groupName.trim()) return

        setLoading(true)
        try {
            const response = await signAndSubmitTransaction({
                data: {
                    function: `${contractAddress}::Inbox3::create_group`,
                    typeArguments: [],
                    functionArguments: [groupName]
                }
            })
            console.log('Group created:', response)

            incrementGroupsJoined()
            onGroupCreated()
            onClose()
            setGroupName('')
        } catch (error) {
            console.error('Error creating group:', error)
            alert('Failed to create group. See console for details.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-(--bg-card) w-full max-w-md p-8 rounded-[2.5rem] border border-(--border-color) shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-(--text-primary) tracking-tight uppercase">New Group</h2>
                        <p className="text-[10px] text-(--text-muted) font-bold tracking-widest uppercase">Establish decentralized circle</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-(--text-muted) ml-1">
                            Identity / Name
                        </label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full px-5 py-4 bg-(--bg-secondary) border border-(--border-color) rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-sm text-(--text-primary) placeholder:text-(--text-muted)"
                            placeholder="e.g. Alpha Collective"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 active:scale-95"
                        >
                            {loading ? 'Initializing...' : 'Create Group Interface'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-4 bg-(--bg-secondary) text-(--text-secondary) rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-(--bg-tertiary) transition-all"
                            disabled={loading}
                        >
                            Back to Hub
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
