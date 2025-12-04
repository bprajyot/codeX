// frontend/src/pages/Ranked.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMatchmaking } from '../hooks/useMatchmaking'
import { Navbar } from '../components/Navbar'
import { Button } from '../components/Button'
import {
  ArrowLeft, Loader2, Trophy, Target, Swords, Shield,
  Crown, Zap, Flame, AlertTriangle, Timer
} from 'lucide-react'

export const Ranked = () => {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { inQueue, activeMatch, loading, error, joinQueue, leaveQueue } = useMatchmaking(user?.id)

  useEffect(() => {
    if (activeMatch) navigate(`/arena/${activeMatch.id}`)
  }, [activeMatch, navigate])

  const getDifficultyForElo = (elo) => {
    if (elo < 1100) return { level: 'Easy', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
    if (elo < 1300) return { level: 'Easy-Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' }
    if (elo < 1500) return { level: 'Medium', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' }
    if (elo < 1700) return { level: 'Medium-Hard', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' }
    return { level: 'Hard', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' }
  }

  const difficulty = getDifficultyForElo(profile?.elo || 1200)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-2xl mb-10">
          {/* Subtle emerald background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/8 via-emerald-600/6 to-teal-600/8" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="relative p-10 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="relative">
                {/* Emerald glow behind icon */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 blur-2xl opacity-60 scale-150" />
                <div className="relative p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl">
                  <Trophy className="w-16 h-16 text-white" />
                </div>
              </div>

              <div>
                <h1 className="text-5xl font-black text-white tracking-tighter">Ranked Arena</h1>
                <p className="text-xl text-slate-400 mt-2 font-light">Where legends are forged</p>
              </div>
            </div>

            {!inQueue && (
              <Button
                onClick={() => joinQueue('ranked')}
                disabled={loading}
                className="group relative px-10 py-5 text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/40"
              >
                <span className="flex items-center gap-3">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
                  {loading ? 'Searching...' : 'Enter Arena'}
                </span>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* In Queue State */}
            {inQueue ? (
              <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-2xl border border-slate-500/40 rounded-3xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/8 via-emerald-600/6 to-teal-600/8" />
                <div className="relative p-16 text-center">
                  <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-emerald-500/8 via-emerald-600/6 to-teal-600/8 rounded-full mb-8 border border-amber-500/40">
                    <Loader2 className="w-16 h-16 text-amber-400 animate-spin" />
                  </div>

                  <h2 className="text-4xl font-black text-white mb-4">Finding Worthy Opponent...</h2>
                  <p className="text-xl text-slate-400 mb-10">Matching you with a player near {profile?.elo || 1200} Ratings</p>

                  <div className="flex justify-center gap-4 mb-10">
                    <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>

                  <Button
                    onClick={leaveQueue}
                    className="px-10 py-4 bg-red-600/80 hover:bg-red-600 text-white font-bold rounded-2xl shadow-xl transition-all hover:scale-105"
                  >
                    Cancel Search
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Stats Overview */}
                <div className="grid grid-cols-4 gap-6">
                  {[
                    { label: 'ELO', value: profile?.elo ?? 0, color: 'text-emerald-400', glow: true },
                    { label: 'Wins', value: profile?.wins ?? 0, color: 'text-cyan-400' },
                    { label: 'Losses', value: profile?.losses ?? 0, color: 'text-rose-400' },
                    {
                      label: 'Win Rate', value: profile && profile.wins + profile.losses > 0
                        ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100) + '%'
                        : '0%', color: 'text-purple-400'
                    }
                  ].map((stat, i) => (
                    <div key={i} className="relative overflow-hidden bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 text-center group hover:border-slate-700 transition-all">
                      <div className={`text-5xl font-black ${stat.color} ${stat.glow ? 'drop-shadow-lg' : ''}`}>
                        {stat.value}
                      </div>
                      <p className="text-sm text-slate-500 mt-3 font-medium">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Expected Difficulty */}
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <Target className="w-8 h-8 text-orange-400" />
                    <h2 className="text-2xl font-bold text-white">Expected Challenge</h2>
                  </div>
                  <div className={`relative overflow-hidden bg-gradient-to-br ${difficulty.bg} border ${difficulty.border} rounded-2xl p-8`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-2">Based on your {profile?.elo} Ratings </p>
                        <p className="text-4xl font-black text-white">
                          You will face <span className={difficulty.color}>{difficulty.level}</span> problems
                        </p>
                      </div>
                      <Shield className={`w-20 h-20 ${difficulty.color} opacity-80`} />
                    </div>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { icon: Target, title: 'Skill-Based Matchmaking', desc: 'Opponents matched to your exact level' },
                    { icon: Trophy, title: 'True ELO System', desc: 'Win big, lose fair — climb or fall' },
                    { icon: Swords, title: 'First to Solve Wins', desc: 'Speed + accuracy = victory' },
                    { icon: Timer, title: 'Live 1v1 Battles', desc: 'Real-time competition, no bots' },
                  ].map((feat, i) => {
                    const Icon = feat.icon
                    return (
                      <div key={i} className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-7 hover:border-slate-700 transition-all">
                        <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl w-fit mb-5">
                          <Icon className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
                        <p className="text-sm text-slate-400">{feat.desc}</p>
                      </div>
                    )
                  })}
                </div>

                {/* Fair Play Warning */}
                {/* <div className="bg-red-500/10 border border-red-500/40 backdrop-blur-2xl rounded-3xl p-7">
                  <div className="flex items-start gap-5">
                    <div className="p-4 bg-red-500/20 rounded-2xl">
                      <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-400 mb-2">Fair Play Enforced</h3>
                      <p className="text-slate-300">
                        AI code detection is <span className="text-red-400 font-bold">active</span>. Using AI tools = instant loss + 5-minute ban.
                      </p>
                    </div>
                  </div>
                </div> */}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">

            {/* How It Works */}
            <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <Zap className="w-7 h-7 text-amber-400" />
                How Ranked Works
              </h3>
              <div className="space-y-6">
                {[
                  'Matched with similar Rating opponent',
                  'Both get the same problem',
                  'First correct submission wins',
                  'Winner gains Rating • Loser loses Rating'
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-5">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg">
                      {i + 1}
                    </div>
                    <p className="text-slate-300">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tips */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/30 backdrop-blur-2xl rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Pro Tips</h3>
              <ul className="space-y-4 text-slate-300">
                {['Test thoroughly before submit', 'Optimize for speed', 'Read constraints twice', 'Never use AI — you will be caught'].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Flame className="w-5 h-5 text-orange-400 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-8 p-6 bg-red-500/10 border border-red-500/40 rounded-2xl text-red-400 text-center font-medium">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}