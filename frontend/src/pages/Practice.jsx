// frontend/src/pages/Practice.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Navbar } from '../components/Navbar'
import { Search, ChevronRight, Timer, Target, Code } from 'lucide-react'

export const Practice = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [problems, setProblems] = useState([])
  const [filteredProblems, setFilteredProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadProblems()
  }, [])

  useEffect(() => {
    filterProblems()
  }, [problems, selectedDifficulty, searchQuery])

  const loadProblems = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .order('difficulty', { ascending: true })
        .order('title', { ascending: true })

      if (error) throw error
      setProblems(data || [])
    } catch (error) {
      console.error('Error loading problems:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProblems = () => {
    let filtered = [...problems]

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(p => p.difficulty === selectedDifficulty)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      )
    }

    setFilteredProblems(filtered)
  }

  const startPractice = async (problemId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/practice/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ problem_id: problemId })
      })

      if (!response.ok) throw new Error('Failed to start practice')
      const data = await response.json()
      navigate(`/arena/${data.match_id}`)
    } catch (error) {
      console.error('Error starting practice:', error)
      alert('Failed to start practice session')
    }
  }

  const difficultyStyles = {
    easy: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-400' },
    hard: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', dot: 'bg-rose-400' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Header */}
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
                  <Code className="w-16 h-16 text-white" />
                </div>
              </div>

              <div>
                <h1 className="text-5xl font-light text-white tracking-tight">
                  Practice Arena
                </h1>
                <p className="text-lg text-slate-400 mt-3">
                  Unlimited time • No pressure • Pure skill building
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problems..."
                className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-white/30 transition-all"
              />
            </div>

            <div className="flex gap-3">
              {['all', 'easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-6 py-3 rounded-xl font-medium capitalize transition-all ${selectedDifficulty === diff
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                >
                  {diff === 'all' ? 'All Levels' : diff}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 text-sm text-slate-400">
            Showing <span className="text-emerald-400 font-medium">{filteredProblems.length}</span> of {problems.length} problems
          </div>
        </div>

        {/* Problems List */}
        {loading ? (
          <div className="text-center py-32">
            <div className="inline-block w-12 h-12 border-4 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
            <p className="mt-6 text-slate-400">Loading problems...</p>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-20 text-center">
            <div className="text-6xl mb-6">No problems found</div>
            <p className="text-slate-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProblems.map((problem, index) => {
              const style = difficultyStyles[problem.difficulty] || difficultyStyles.medium

              return (
                <div
                  key={problem.id}
                  className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
                  onClick={() => startPractice(problem.id)}
                >
                  <div className="flex items-center justify-between gap-8">
                    <div className="flex items-center gap-8 flex-1">
                      <div className="text-3xl font-light text-slate-500 w-12">
                        {String(index + 1).padStart(2, '0')}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-2xl font-medium text-white group-hover:text-emerald-400 transition-colors">
                            {problem.title}
                          </h3>
                          <div className={`px-4 py-1.5 rounded-full text-sm font-medium border ${style.border} ${style.bg} ${style.text}`}>
                            <span className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                              {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                            </span>
                          </div>
                        </div>

                        <p className="text-slate-400 line-clamp-2">
                          {problem.description.split('\n')[0]}
                        </p>

                        <div className="flex items-center gap-8 mt-5 text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4 text-emerald-400" />
                            <span>Unlimited time</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-cyan-400" />
                            <span>{problem.test_cases?.length || 0} test cases</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom Note */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500">
            Practice mode does not affect your ELO • Focus on learning and mastery
          </p>
        </div>
      </div>
    </div>
  )
}