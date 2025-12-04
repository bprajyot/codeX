// frontend/src/pages/Casual.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMatchmaking } from '../hooks/useMatchmaking'
import { Navbar } from '../components/Navbar'
import { Button } from '../components/Button'
import { Loader2, Swords, Shield, Smile, Zap, Trophy, Heart, Coffee, Target, Crown, Users, Timer } from 'lucide-react'

export const Casual = () => {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { inQueue, activeMatch, loading, error, joinQueue, leaveQueue } = useMatchmaking(user?.id)

  useEffect(() => {
    if (activeMatch) navigate(`/arena/${activeMatch.id}`)
  }, [activeMatch, navigate])

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
                  <Swords className="w-16 h-16 text-white" />
                </div>
              </div>

              <div>
                <h1 className="text-5xl font-black text-white tracking-tighter">Casual Arena</h1>
                <p className="text-xl text-slate-400 mt-2 font-light">No Ratings • No Pressure • Pure Growth</p>
              </div>
            </div>

            {!inQueue && (
              <Button
                onClick={() => joinQueue('casual')}
                disabled={loading}
                className="group relative px-10 py-5 text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/40"
              >
                <span className="flex items-center gap-4">
                  {loading ? (
                    <>Scanning Arena <Loader2 className="w-6 h-6 animate-spin ml-2" /></>
                  ) : (
                    <><Zap className="w-6 h-6" /> Enter Arena</>
                  )}
                </span>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">

            {/* In Queue State */}
            {inQueue ? (
              <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-emerald-500/50 rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-bl from-emerald-500/8 via-emerald-600/6 to-teal-600/8" />
                <div className="relative p-20 text-center">
                  <div className="inline-flex items-center justify-center w-36 h-36 bg-gradient-to-r from-emerald-500/8 via-emerald-600/6 to-teal-600/8 rounded-full border-2 border-emerald-500/50 mb-10">
                    <Loader2 className="w-20 h-20 text-emerald-400 animate-spin" />
                  </div>

                  <h2 className="text-5xl font-black text-white mb-5">
                    <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      Finding Practice Partner...
                    </span>
                  </h2>
                  <p className="text-xl text-slate-300 mb-12">Same skill level • No stakes • Pure fun</p>

                  <div className="flex justify-center gap-6 mb-12">
                    <Users className="w-10 h-10 text-emerald-400 animate-pulse" />
                    <Timer className="w-10 h-10 text-cyan-400 animate-pulse" />
                    <Smile className="w-10 h-10 text-purple-400 animate-pulse" />
                  </div>

                  <Button
                    onClick={leaveQueue}
                    className="px-12 py-5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-2xl transition-all hover:scale-105"
                  >
                    Cancel Search
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* ELO Protection Banner */}
                {/* <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-emerald-500/40 rounded-3xl p-10 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 blur-2xl" />
                  <div className="relative flex items-center gap-8">
                    <div className="p-5 bg-emerald-500/20 rounded-3xl">
                      <Shield className="w-16 h-16 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-4xl font-black text-white">Your Rating is 100% Protected</h3>
                      <p className="text-xl text-emerald-400 font-light mt-2">Play freely — nothing counts</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mt-10">
                    {[
                      { label: 'Current ELO', value: profile?.elo ?? 0, color: 'text-emerald-400' },
                      { label: 'Total Wins', value: profile?.wins ?? 0, color: 'text-cyan-400' },
                      { label: 'Total Losses', value: profile?.losses ?? 0, color: 'text-purple-400' }
                    ].map((stat, i) => (
                      <div key={i} className="text-center">
                        <div className={`text-5xl font-black ${stat.color} drop-shadow-lg`}>
                          {stat.value}
                          {stat.label === 'Current ELO' && profile?.elo >= 2000 && (
                            <Crown className="inline-block w-10 h-10 text-yellow-500 ml-3 animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-3 font-medium">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div> */}

                {/* Benefits Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { icon: Smile, title: 'Zero Pressure', desc: 'Experiment without fear' },
                    { icon: Zap, title: 'Real Opponents', desc: 'Same matchmaking as ranked' },
                    { icon: Coffee, title: 'Warm Up Freely', desc: 'Perfect before ranked sessions' },
                    { icon: Target, title: 'Master Patterns', desc: 'Try new approaches safely' },
                    { icon: Heart, title: 'Learn Faster', desc: 'Mistakes don’t cost Ratings' },
                    { icon: Swords, title: 'Pure Fun', desc: 'Enjoy coding battles' }
                  ].map((item, i) => {
                    const Icon = item.icon
                    return (
                      <div key={i} className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 hover:border-emerald-500/40 transition-all duration-300 group">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl w-fit mb-5 group-hover:scale-110 transition-transform">
                          <Icon className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-slate-400">{item.desc}</p>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">

            {/* Casual vs Ranked */}
            <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-4">
                <Swords className="w-8 h-8 text-emerald-400" />
                Casual vs Ranked
              </h3>
              <div className="space-y-6">
                {[
                  { text: 'ELO Fully Protected', icon: Shield, color: 'text-emerald-400' },
                  { text: 'No Stats Impact', icon: Heart, color: 'text-purple-400' },
                  // { text: 'Same Matchmaking Quality', icon: Users, color: 'text-cyan-400' },
                  { text: 'Perfect for Practice', icon: Coffee, color: 'text-indigo-400' }
                ].map((item, i) => {
                  const Icon = item.icon
                  return (
                    <div key={i} className="flex items-center gap-5 p-5 bg-slate-800/60 rounded-2xl border border-slate-700/50">
                      <Icon className={`w-10 h-10 ${item.color}`} />
                      <span className="text-lg font-medium text-white">{item.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Practice Tips */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-8">Practice Like a Pro</h3>
              <ul className="space-y-5 text-slate-300">
                {[
                  'Focus on understanding, not speed',
                  'Try multiple different solutions',
                  'Test edge cases thoroughly',
                  'Write clean, readable code',
                  'Have fun — this is your playground'
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full mt-2 animate-pulse" />
                    <span className="text-lg">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-10 p-8 bg-red-500/10 border border-red-500/40 rounded-3xl text-center">
            <p className="text-xl font-bold text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}