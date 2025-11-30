// FILE: frontend/src/pages/Custom.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Navbar } from '../components/Navbar'
import { UserPlus, Copy, Check, Loader2 } from 'lucide-react'

export const Custom = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('create')
    const [inviteCode, setInviteCode] = useState('')
    const [generatedCode, setGeneratedCode] = useState('')
    const [matchId, setMatchId] = useState('')
    const [creating, setCreating] = useState(false)
    const [joining, setJoining] = useState(false)
    const [waiting, setWaiting] = useState(false)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState('')

    const pollIntervalRef = useRef(null)

    useEffect(() => {
        if (!waiting || !matchId) return

        const pollMatchStatus = async () => {
            try {
                const { data, error } = await supabase
                    .from('matches')
                    .select('status')
                    .eq('id', matchId)
                    .single()

                if (error) throw error
                if (data?.status === 'active') {
                    clearInterval(pollIntervalRef.current)
                    navigate(`/arena/${matchId}`)
                }
            } catch (err) {
                console.error('Polling error:', err)
            }
        }

        pollIntervalRef.current = setInterval(pollMatchStatus, 2000)
        pollMatchStatus()

        return () => clearInterval(pollIntervalRef.current)
    }, [waiting, matchId, navigate])

    const handleCreateMatch = async () => {
        if (creating) return
        setCreating(true)
        setError('')

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Not authenticated')

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/queue/custom/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const err = await response.json().catch(() => ({}))
                throw new Error(err.error || 'Failed to create match')
            }

            const data = await response.json()
            setGeneratedCode(data.invite_code)
            setMatchId(data.match_id)
            setWaiting(true)
        } catch (err) {
            setError(err.message || 'Failed to create match')
        } finally {
            setCreating(false)
        }
    }

    const handleJoinMatch = async () => {
        const code = inviteCode.trim()
        if (code.length !== 6) {
            setError('Please enter a valid 6-character code')
            return
        }

        setJoining(true)
        setError('')

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Not authenticated')

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/queue/custom/join`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ invite_code: code })
            })

            if (!response.ok) {
                const err = await response.json().catch(() => ({}))
                throw new Error(err.error || 'Invalid or expired code')
            }

            const data = await response.json()
            navigate(`/arena/${data.match_id}`)
        } catch (err) {
            setError(err.message || 'Failed to join match')
        } finally {
            setJoining(false)
        }
    }

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(generatedCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            setError('Failed to copy')
        }
    }

    const handleCancelWait = () => {
        setWaiting(false)
        setGeneratedCode('')
        setMatchId('')
    }

    useEffect(() => setError(''), [activeTab])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 pt-12">
                {/* Premium Header */}
                <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-2xl mb-5">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/8 via-emerald-600/6 to-teal-600/8" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="relative p-10 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div className="relative">
                                {/* Emerald glow behind icon */}
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 blur-2xl opacity-60 scale-150" />
                                <div className="relative p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl">
                                    <UserPlus className="w-16 h-16 text-white" />
                                </div>
                            </div>

                            <div>
                                <h1 className="text-5xl font-black text-white tracking-tighter">Custom Challenges</h1>
                                <p className="text-xl text-slate-400 mt-2 font-light">Challenge friends • Private matches • Full control</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveTab('create')}
                                className={`px-10 py-5 rounded-2xl font-bold text-lg transition-all ${activeTab === 'create' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                            >
                                Create Room
                            </button>
                            <button
                                onClick={() => setActiveTab('join')}
                                className={`px-10 py-5 rounded-2xl font-medium border ${activeTab === 'join' ? 'bg-white/10 border-white/30 text-white' : 'border-white/10 text-slate-400 hover:bg-white/5 hover:border-white/20'}`}
                            >
                                Join with Code
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-6 pb-20">

                    {/* Error */}
                    {error && (
                        <div className="mb-8 p-5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-center font-medium backdrop-blur-sm">
                            {error}
                        </div>
                    )}

                    {/* CREATE TAB */}
                    {activeTab === 'create' && (
                        <div className="backdrop-blur-xl bg-gradient-to-r from-slate-950 via-slate-900 to-black border border-white/10 rounded-2xl p-10 shadow-2xl">
                            {!waiting ? (
                                <div className="text-center space-y-10">
                                    <div>
                                        <h2 className="text-4xl font-light text-white">Host a Private Duel</h2>
                                        <p className="text-slate-400 mt-4">Generate a code and challenge anyone</p>
                                    </div>

                                    <button
                                        onClick={handleCreateMatch}
                                        disabled={creating}
                                        className="px-16 py-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xl rounded-2xl shadow-2xl transition-all hover:scale-105 hover:shadow-emerald-500/40 disabled:opacity-70"
                                    >
                                        {creating ? (
                                            <>Creating Room <Loader2 className="inline ml-3 w-6 h-6 animate-spin" /></>
                                        ) : (
                                            'Create Private Match'
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center space-y-10">
                                    <p className="text-2xl text-slate-300">Share this code with your opponent</p>
                                    <div className="inline-block">
                                        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-10 shadow-2xl">
                                            <div className="text-6xl font-black tracking-widest text-emerald-400 select-all">
                                                {generatedCode}
                                            </div>
                                            <button
                                                onClick={handleCopyCode}
                                                className="mt-8 px-10 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl flex items-center gap-3 mx-auto transition-all"
                                            >
                                                {copied ? (
                                                    <>Copied! <Check className="w-5 h-5" /></>
                                                ) : (
                                                    <>Copy Code <Copy className="w-5 h-5" /></>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCancelWait}
                                        className="text-slate-400 hover:text-white underline"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* JOIN TAB */}
                    {activeTab === 'join' && (
                        <div className="backdrop-blur-xl bg-gradient-to-r from-slate-950 via-slate-900 to-black border border-white/10 rounded-3xl p-10 shadow-2xl">
                            <div className="max-w-md mx-auto space-y-10">
                                <div className="text-center">
                                    <h2 className="text-4xl font-light text-white">Enter Invite Code</h2>
                                    <p className="text-slate-400 mt-3">6-character code from your opponent</p>
                                </div>

                                <input
                                    type="text"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                    placeholder="ABC123"
                                    maxLength={6}
                                    className="w-full px-8 py-10 bg-white/5 border border-white/20 rounded-2xl text-center text-5xl font-black tracking-widest text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-emerald-400 transition-all"
                                    autoFocus
                                />

                                <button
                                    onClick={handleJoinMatch}
                                    disabled={joining || inviteCode.length !== 6}
                                    className="w-full py-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xl rounded-2xl shadow-2xl transition-all hover:scale-105 hover:shadow-emerald-500/40"
                                >
                                    {joining ? 'Joining...' : 'Enter Duel'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}