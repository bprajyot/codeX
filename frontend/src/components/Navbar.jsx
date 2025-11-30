import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button } from './Button'
import { 
  Trophy, User, LogOut, Crown, Home, Zap, Users, Info, 
  ChevronDown, Code, Trophy as TrophyIcon 
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import logo from "../assets/logo.png"

export const Navbar = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const navItems = [
    { name: 'Home', icon: Home, path: '/dashboard' },
    { name: 'Ranked', icon: Trophy, path: '/ranked' },
    { name: 'Casual', icon: Users, path: '/casual' },
    { name: 'Custom', icon: Zap, path: '/custom' },
    { name: 'Practice', icon: Code, path: '/practice' },
    { name: 'About', icon: Info, path: '/about' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    // add in case req: bg-slate-900/70 border-b border-slate-800/80 shadow-2xl
    <nav className="relative bg-slate-900/70 border-b border-slate-800/80 shadow-2xl backdrop-blur-2xl  z-50">
      {/* Animated Glow Lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60" />
      <div className="absolute inset-x-0 top-1 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40 blur-sm" />

      <div className="max-w-8xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">

          {/* Left: Logo */}
          <div 
            className="group flex items-center gap-4 cursor-pointer" 
            onClick={() => navigate('/dashboard')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/50 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative p-2 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                <img src={logo} alt="CodeX" className="w-9 h-9 object-contain filter brightness-0 invert" />
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter">
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  CodeX
                </span>
              </h1>
              <p className="text-xs font-bold tracking-widest text-emerald-500/80">Go for Coding Battles</p>
            </div>
          </div>

          {/* Center: Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl px-2 py-2 shadow-lg">
            {navItems.map((item) => {
              const active = isActive(item.path)
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`
                    relative group flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300
                    ${active 
                      ? 'text-white bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 shadow-lg' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }
                  `}
                >
                  {active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl blur-xl" />
                  )}
                  <item.icon className={`w-4 h-4 ${active ? 'text-emerald-400' : ''}`} />
                  <span className="relative z-10">{item.name}</span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
                </button>
              )
            })}
          </div>

          {/* Right: Profile Dropdown */}
          {profile && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="group flex items-center gap-3 px-4 py-3 bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 shadow-xl"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 via-cyan-400 to-emerald-400 p-0.5 shadow-lg">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                      <User className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                  {/* <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-4 border-slate-900 animate-pulse" /> */}
                </div>

                {/* Username + ELO */}
                {/* <div className="text-left hidden lg:block">
                  <p className="text-sm font-bold text-white">{profile.username}</p>
                  <div className="flex items-center gap-1">
                    <TrophyIcon className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs font-bold text-emerald-400">{profile.elo} ELO</span>
                  </div>
                </div> */}

                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setDropdownOpen(false)}
                  />
                  
                  <div className="absolute right-0 mt-3 w-80 bg-slate-800/70 backdrop-blur-2xl border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-5 border-b border-slate-700/50 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 p-0.5 shadow-xl">
                          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                            <User className="w-8 h-8 text-emerald-400" />
                          </div>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-white">{profile.username}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                              {profile.elo} ELO
                            </span>
                            {profile.elo >= 2000 && <Crown className="w-5 h-5 text-yellow-500 animate-pulse" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <p className="text-3xl font-black text-emerald-400">{profile.wins}</p>
                        <p className="text-sm text-slate-400 mt-1">Wins</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-black text-red-400">{profile.losses}</p>
                        <p className="text-sm text-slate-400 mt-1">Losses</p>
                      </div>
                    </div>

                    <div className="px-5 pb-4">
                      <Button
                        onClick={() => {
                          signOut()
                          setDropdownOpen(false)
                        }}
                        className="w-full group relative overflow-hidden bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <LogOut className="w-5 h-5" />
                          Logout
                        </span>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}