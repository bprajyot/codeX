// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Navbar } from '../components/Navbar'
import { supabase } from '../lib/supabaseClient'
import { Trophy, Swords, UserPlus, Code, Crown, Medal, Award, TrendingUp, Zap, Flame } from 'lucide-react'

export const Dashboard = () => {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [topThree, setTopThree] = useState([])

  useEffect(() => {
    const loadTopThree = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('elo', { ascending: false })
        .limit(3)
      if (data) setTopThree(data)
    }
    loadTopThree()
  }, [])

  const modes = [
    { id: 'ranked',   title: 'Ranked',   desc: 'Fight for ranking',                    icon: Trophy,   color: 'from-amber-500 to-orange-600',   glow: 'emerald-400' },
    { id: 'casual',   title: 'Casual',   desc: 'Play without stakes',                  icon: Swords,   color: 'from-purple-500 to-indigo-600', glow: 'cyan-400' },
    { id: 'custom',   title: 'Custom',   desc: 'Private battles with friends',         icon: UserPlus, color: 'from-emerald-500 to-teal-600',   glow: 'emerald-400' },
    { id: 'practice', title: 'Practice', desc: 'Solo coding, no pressure',             icon: Code,     color: 'from-pink-500 to-rose-600',      glow: 'purple-400' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Hero */}
        <div className="mb-16 text-center">
          <h1 className="text-6xl font-black text-white tracking-tighter">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              {profile?.username || 'Warrior'}
            </span>
          </h1>
          {/* <p className="text-xl text-slate-400 mt-4 font-light">Choose your arena</p> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Area */}
          <div className="lg:col-span-2 space-y-8">

            {/* Stats Card */}
            <div className="relative overflow-hidden bg-slate-900/50 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
              <div className="relative p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <TrendingUp className="w-7 h-7 text-emerald-400" />
                    Your Stats
                  </h2>
                  {profile?.elo >= 2000 && <Crown className="w-8 h-8 text-yellow-500 animate-pulse" />}
                </div>

                <div className="grid grid-cols-4 gap-6">
                  {[
                    { label: 'ELO', value: profile?.elo ?? 0, color: 'text-emerald-400', glow: true },
                    { label: 'Wins', value: profile?.wins ?? 0, color: 'text-cyan-400' },
                    { label: 'Losses', value: profile?.losses ?? 0, color: 'text-rose-400' },
                    { label: 'Win Rate', value: profile && profile.wins + profile.losses > 0
                        ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100) + '%'
                        : '0%', color: 'text-purple-400' }
                  ].map((stat, i) => (
                    <div key={i} className="text-center group">
                      <div className={`text-5xl font-black ${stat.color} ${stat.glow ? 'drop-shadow-lg' : ''}`}>
                        {stat.value}
                      </div>
                      <p className="text-sm text-slate-500 mt-2 font-medium">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Game Modes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modes.map((mode) => {
                const Icon = mode.icon
                return (
                  <div
                    key={mode.id}
                    onClick={() => navigate(`/${mode.id}`)}
                    className="group relative overflow-hidden bg-slate-900/50 backdrop-blur-2xl border border-slate-800/80 rounded-3xl cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:border-slate-700"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-10 group-hover:opacity-30 transition-opacity duration-500`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />

                    <div className="relative p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl group-hover:scale-110 transition-transform duration-300">
                          <Icon className={`w-10 h-10 text-${mode.glow}`} />
                        </div>
                        {/* <Zap className={`w-6 h-6 text-${mode.glow} opacity-0 group-hover:opacity-100 transition-opacity`} /> */}
                      </div>

                      <h3 className="text-3xl font-bold text-white mb-3">{mode.title}</h3>
                      <p className="text-slate-400 text-sm">{mode.desc}</p>

                      <div className="mt-8">
                        <span className={`text-sm font-bold text-${mode.glow} group-hover:underline underline-offset-4`}>
                          Enter Arena →
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <div className="sticky top-8 bg-slate-900/50 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-800/80 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Top Legends</h2>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {topThree.length === 0 ? (
                  <p className="text-center text-slate-500 py-12">Loading champions...</p>
                ) : (
                  topThree.map((player, i) => {
                    const medals = [
                      { Icon: Crown, color: 'text-amber-400', bg: 'from-amber-500 to-orange-600', rank: 'bg-gradient-to-br from-amber-500 to-orange-600' },
                      { Icon: Medal, color: 'text-slate-300', bg: 'from-slate-400 to-slate-600', rank: 'bg-gradient-to-br from-slate-400 to-slate-600' },
                      { Icon: Award, color: 'text-orange-400', bg: 'from-orange-500 to-red-600', rank: 'bg-gradient-to-br from-orange-500 to-red-600' },
                    ]
                    const { Icon: MedalIcon, color, rank } = medals[i]
                    const isYou = player.id === user?.id

                    return (
                      <div key={player.id} className="relative group">
                        <div className={`absolute -inset-1 bg-gradient-to-r ${medals[i].bg} opacity-20 blur-xl group-hover:opacity-40 transition duration-500`} />
                        <div className="relative bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex items-center gap-5">

                          <div className={`${rank} text-white font-black text-sm w-10 h-10 rounded-full flex items-center justify-center shadow-2xl`}>
                            #{i + 1}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <p className="text-xl font-bold text-white">{player.username}</p>
                              {isYou && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold">YOU</span>}
                              {player.elo >= 2200 && <Flame className="w-5 h-5 text-orange-500 animate-pulse" />}
                            </div>
                            <p className="text-sm text-slate-500">
                              {player.wins ?? 0}W • {player.losses ?? 0}L
                            </p>
                          </div>

                          <div className="text-right">
                            <div className={`text-3xl font-black ${color}`}>
                              {player.elo ?? 0}
                            </div>
                            <div className="text-xs text-slate-500">ELO</div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}