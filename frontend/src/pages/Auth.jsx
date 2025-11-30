import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'
import { Trophy, Loader2, Zap, Crown } from 'lucide-react'
import logo from "../assets/logo.png"

export const Auth = () => {
  const navigate = useNavigate()
  const { signIn, signUp, user } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    navigate('/dashboard')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        if (!username.trim()) {
          setError('Username is required')
          setLoading(false)
          return
        }
        const { error } = await signUp(email, password, username)
        if (error) throw error
        alert('Sign up successful! Please check your email to verify your account.')
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Top Glow Lines (matching Navbar) */}
      {/* <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60" />
      <div className="absolute inset-x-0 top-1 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40 blur-sm" /> */}

      {/* Animated Background Orbs */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-emerald-500/10 to-transparent rounded-full blur-3xl" />
      </div> */}

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Hero Title */}
        <div className="flex flex-col items-center mb-12">
          <div className="group flex items-center gap-5 cursor-pointer" onClick={() => navigate('/')}>
            {/* Logo with insane hover glow (exactly like Navbar) */}
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/50 blur-xl rounded-full" />
              <div className="relative p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl shadow-2xl">
                <img src={logo} alt="CodeX" className="w-12 h-12 object-contain filter brightness-0 invert" />
              </div>
            </div>

            <div>
              <h1 className="text-6xl font-black tracking-tighter">
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  CodeX
                </span>
              </h1>
              <p className="text-sm font-bold tracking-widest text-emerald-400/80 -mt-1">
                GO FOR CODING BATTLES
              </p>
            </div>
          </div>
        </div>

        {/* Auth Card – Premium Glassmorphism */}
        <div className="relative group">
          {/* Outer Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r  rounded-3xl blur-2xl opacity-60 group-hover:opacity-90 transition-all duration-1000" />
          
          <div className="relative bg-gradient-to-t from-slate-950 via-slate-900 to-black backdrop-blur-2xl border border-slate-700/60 rounded-3xl p-10 shadow-2xl ring-1 ring-white/10">
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Username Field (Sign Up only) */}
              {isSignUp && (
                <div className="space-y-3">
                  <label className="text-sm font-bold tracking-wide text-emerald-400">USERNAME</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700/70 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 shadow-inner"
                    placeholder="Your legendary alias..."
                    required={isSignUp}
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-3">
                <label className="text-sm font-bold tracking-wide text-emerald-400">EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700/70 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 shadow-inner"
                  placeholder="warrior@codex.arena"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-3">
                <label className="text-sm font-bold tracking-wide text-emerald-400">PASSWORD</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700/70 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 shadow-inner"
                  placeholder="••••••••••••"
                  required
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-2xl backdrop-blur-sm animate-in slide-in-from-top-2">
                  <p className="text-red-400 text-center font-semibold">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden py-5 text-lg font-black tracking-wider rounded-2xl bg-slate-800 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-2xl transform transition-all duration-300 hover:scale-[1.02] active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Creating Account</span>
                    </>
                  ) : (
                    <>
                      {isSignUp ? 'Sign Up' : 'Log In'}
                    </>
                  )}
                </span>
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 transition-transform duration-700 group-hover/button:translate-x-full" />
              </Button>
            </form>

            {/* Toggle */}
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                }}
                className="text-emerald-400 hover:text-cyan-400 font-bold tracking-wide transition-all duration-300 hover:underline underline-offset-4"
              >
                {isSignUp
                  ? 'Already a legend? → Sign In'
                  : 'New blood? → Create Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}