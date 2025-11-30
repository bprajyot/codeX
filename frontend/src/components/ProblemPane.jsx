export const ProblemPane = ({ problem }) => {
  if (!problem) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Loading problem...</p>
        </div>
      </div>
    )
  }

  const difficultyColors = {
    easy: {
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      badge: 'from-emerald-400 to-emerald-600'
    },
    medium: {
      bg: 'bg-amber-500/20',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      badge: 'from-amber-400 to-orange-500'
    },
    hard: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500/30',
      badge: 'from-red-400 to-pink-500'
    }
  }

  const colors = difficultyColors[problem.difficulty?.toLowerCase()] || difficultyColors.medium

  return (
    <div className="h-full flex flex-col bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-50 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-7 py-6 border-b border-slate-700/50 bg-gradient-to-r from-purple-900/20 via-transparent to-transparent">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {problem.title}
          </h2>

          <div className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider text-xs border ${colors.border} ${colors.bg} ${colors.text} shadow-lg shadow-black/20`}>
            <span className={`bg-gradient-to-r ${colors.badge} bg-clip-text text-transparent`}>
              {problem.difficulty || 'Medium'}
            </span>
          </div>
        </div>

        {/* Subtle metadata */}
        <div className="flex items-center gap-6 text-xs text-slate-400 mt-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Time Limit: 2s</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2v-6" />
            </svg>
            <span>Memory: 256 MB</span>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-7 py-6 space-y-8">
        <div className="prose prose-invert max-w-none">
          <div className="text-slate-300 leading-relaxed text-base whitespace-pre-wrap font-light tracking-wide">
            {problem.description}
          </div>
        </div>

        {/* Test Cases Section */}
        <div className="pt-6 border-t border-slate-700/60">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              Test Cases
            </h3>
            <div className="text-3xl font-bold text-purple-400">
              {problem.test_cases?.length || 0}
            </div>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed">
            Your solution must pass <span className="text-purple-300 font-semibold">all {problem.test_cases?.length || 0} hidden test cases</span> to be accepted.
          </p>

          {/* Optional: Show sample input/output if available */}
          {problem.sample_input && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sample Input</div>
                <pre className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 font-mono text-sm text-slate-300">
                  {problem.sample_input}
                </pre>
              </div>
              <div>
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Expected Output</div>
                <pre className="bg-slate-800/60 border border-emerald-700/30 rounded-xl p-4 font-mono text-sm text-emerald-300">
                  {problem.sample_output || problem.expected_output}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Signature / Function Name Hint */}
        {problem.function_signature && (
          <div className="mt-8 p-5 bg-purple-900/20 border border-purple-700/40 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-purple-300 font-semibold">Function Signature</span>
            </div>
            <code className="text-sm font-mono text-purple-200 bg-black/30 px-3 py-1.5 rounded-lg">
              {problem.function_signature}
            </code>
          </div>
        )}
      </div>
    </div>
  )
}