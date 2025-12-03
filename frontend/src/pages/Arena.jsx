import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRealtime } from '../hooks/useRealtime'
import { supabase } from '../lib/supabaseClient'
import { Navbar } from '../components/Navbar'
import { Button } from '../components/Button'
import { EditorWindow } from '../components/EditorWindow'
import { Console } from '../components/Console'
import { ProblemPane } from '../components/ProblemPane'
import { MatchStatus } from '../components/MatchStatus'
import { HintPanel } from '../components/HintPanel'
import { Play, Send, Clock, AlertTriangle, FileText, Terminal } from 'lucide-react'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const Arena = () => {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [match, setMatch] = useState(null)
  const [problem, setProblem] = useState(null)
  const [player1, setPlayer1] = useState(null)
  const [player2, setPlayer2] = useState(null)
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [runCooldown, setRunCooldown] = useState(0)
  const [submitCooldown, setSubmitCooldown] = useState(0)
  const [isBanned, setIsBanned] = useState(false)
  const [banMessage, setBanMessage] = useState('')
  const [authToken, setAuthToken] = useState(null)
  const [isHintSidebarOpen, setIsHintSidebarOpen] = useState(false)
  const [activeLeftPanel, setActiveLeftPanel] = useState('problem')
  const [winnerName, setWinnerName] = useState(null)

  const loadMatchData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      setAuthToken(token)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/match/${matchId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to load match')

      const data = await response.json()
      setMatch(data.match)
      setProblem(data.problem)
      setPlayer1(data.player1)
      setPlayer2(data.player2)
      setCode(data.problem.starter_code || '')
    } catch (err) {
      navigate('/dashboard')
    }
  }, [matchId, navigate])

  useEffect(() => {
    loadMatchData()
    const savedCode = localStorage.getItem(`code_${matchId}`)
    if (savedCode) setCode(savedCode)
  }, [matchId, loadMatchData])

  useEffect(() => {
    if (code && matchId) {
      localStorage.setItem(`code_${matchId}`, code)
    }
  }, [code, matchId])

  useEffect(() => {
    if (runCooldown > 0) {
      const timer = setTimeout(() => setRunCooldown(Math.max(0, runCooldown - 0.1)), 100)
      return () => clearTimeout(timer)
    }
  }, [runCooldown])

  useEffect(() => {
    if (submitCooldown > 0) {
      const timer = setTimeout(() => setSubmitCooldown(Math.max(0, submitCooldown - 0.1)), 100)
      return () => clearTimeout(timer)
    }
  }, [submitCooldown])

  const handleMatchUpdate = useCallback((updatedMatch) => {
    setMatch(updatedMatch)

    if (updatedMatch.status === 'completed' && !winnerName) {
      let winner = "It's a Draw!"

      if (updatedMatch.winner_id) {
        if (updatedMatch.winner_id === user?.id) {
          winner = 'You Won!'
        } else if (updatedMatch.winner_id === player1?.id) {
          winner = player1?.username || 'Player 1'
        } else if (updatedMatch.winner_id === player2?.id) {
          winner = player2?.username || 'Player 2'
        }
      }

      setWinnerName(winner)
    }
  }, [user?.id, player1, player2, winnerName])

  useRealtime(matchId, handleMatchUpdate)

  const runCode = async () => {
    if (runCooldown > 0) {
      setError(`Please wait ${runCooldown.toFixed(1)}s before running code again`)
      return
    }

    setLoading(true)
    setError('')
    setOutput('')
    setActiveLeftPanel('console')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!problem?.test_cases?.length) {
        setError('No test cases available')
        setLoading(false)
        return
      }

      let allResults = []
      let allPassed = true

      for (let i = 0; i < problem.test_cases.length; i++) {
        if (i > 0 && runCooldown > 0) await sleep(runCooldown * 1000)

        const testCase = problem.test_cases[i]

        const wrappedCode = `
import json
${code}

if __name__ == "__main__":
    try:
        input_lines = """${testCase.input}""".strip().split('\\n')
        import re
        func_match = re.search(r'def\\s+(\\w+)\\s*\\(', """${code.replace(/"/g, '\\"')}""")
        if not func_match:
            print("ERROR: No function definition found")
            exit(1)
        func_name = func_match.group(1)
        func = globals()[func_name]
        args = []
        for line in input_lines:
            try:
                args.append(json.loads(line))
            except:
                try:
                    args.append(int(line))
                except:
                    args.append(line.strip())
        result = func(*args)
        print(json.dumps(result))
    except Exception as e:
        print(f"ERROR: {str(e)}")
`

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/execute`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            source_code: wrappedCode,
            language: 'python',
            stdin: '',
            expected_output: testCase.expected_output
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          if (response.status === 429) {
            const match = errorData.error.match(/wait ([\d.]+) seconds/)
            if (match) {
              const waitTime = parseFloat(match[1])
              setRunCooldown(waitTime)
              await sleep(waitTime * 1000)
              i--
              continue
            }
          }
          if (response.status === 403) {
            setIsBanned(true)
            setBanMessage(errorData.error)
          }
          throw new Error(errorData.error || 'Execution failed')
        }

        const data = await response.json()
        const result = data.result
        const actualOutput = result.stdout ? result.stdout.trim() : ''
        const expectedOutput = testCase.expected_output.trim()
        const passed = actualOutput === expectedOutput && result.status_id === 3

        if (!passed) allPassed = false

        allResults.push({
          testCase: i + 1,
          input: testCase.input,
          expectedOutput,
          actualOutput,
          passed,
          error: result.stderr || result.compile_output || result.message || '',
          time: result.time,
          memory: result.memory
        })

        if (i < problem.test_cases.length - 1) await sleep(300)
      }

      setRunCooldown(3)

      let outputText = '=== Test Results ===\n\n'
      allResults.forEach(r => {
        const inputLines = r.input.split('\n')
        outputText += `Test Case ${r.testCase}:\n`
        outputText += inputLines.length === 1 
          ? `  Input: ${inputLines[0]}\n`
          : `  Input:\n${inputLines.map(l => `    ${l}`).join('\n')}\n`
        outputText += `  Expected Output: ${r.expectedOutput}\n`
        outputText += `  Your Output: ${r.actualOutput || '(none)'}\n`
        outputText += `  Status: ${r.passed ? 'PASSED' : 'FAILED'}\n`
        if (r.time) outputText += `  Runtime: ${r.time}s\n`
        if (r.memory) outputText += `  Memory: ${(r.memory / 1024).toFixed(2)} MB\n`
        if (r.error && !r.passed) outputText += `  Error: ${r.error}\n\n`
      })

      const passedCount = allResults.filter(r => r.passed).length
      outputText += `=== Summary ===\nPassed: ${passedCount}/${allResults.length} test cases\n`
      if (allPassed) {
        outputText += `\nAll test cases passed! You can now submit your solution.`
        setOutput(outputText)
      } else {
        outputText += `\nSome test cases failed. Review and fix your code.`
        setError(outputText)
      }
    } catch (err) {
      setError(err.message || 'Failed to execute code')
    } finally {
      setLoading(false)
    }
  }

  const submitSolution = async () => {
    if (submitCooldown > 0) {
      setError(`Please wait ${submitCooldown.toFixed(1)}s before submitting again`)
      return
    }

    setSubmitting(true)
    setError('')
    setActiveLeftPanel('console')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const testResults = []
      for (let i = 0; i < problem.test_cases.length; i++) {
        if (i > 0 && submitCooldown > 0) await sleep(submitCooldown * 1000)

        const testCase = problem.test_cases[i]
        const wrappedCode = `
import json
${code}

if __name__ == "__main__":
    try:
        input_lines = """${testCase.input}""".strip().split('\\n')
        import re
        func_match = re.search(r'def\\s+(\\w+)\\s*\\(', """${code.replace(/"/g, '\\"')}""")
        if not func_match:
            print("ERROR: No function definition found")
            exit(1)
        func_name = func_match.group(1)
        func = globals()[func_name]
        args = []
        for line in input_lines:
            try:
                args.append(json.loads(line))
            except:
                try:
                    args.append(int(line))
                except:
                    args.append(line.strip())
        result = func(*args)
        print(json.dumps(result))
    except Exception as e:
        print(f"ERROR: {str(e)}")
`

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/execute`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            source_code: wrappedCode,
            language: 'python',
            stdin: '',
            expected_output: testCase.expected_output
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          if (response.status === 429) {
            const match = errorData.error.match(/wait ([\d.]+) seconds/)
            if (match) {
              const waitTime = parseFloat(match[1])
              setSubmitCooldown(waitTime)
              await sleep(waitTime * 1000)
              i--
              continue
            }
          }
          throw new Error(errorData.error || 'Execution failed')
        }

        const data = await response.json()
        const actualOutput = data.result.stdout ? data.result.stdout.trim() : ''
        const expectedOutput = testCase.expected_output.trim()
        const passed = actualOutput === expectedOutput && data.result.status_id === 3
        testResults.push({ passed, ...data.result })

        if (i < problem.test_cases.length - 1) await sleep(300)
      }

      const passedAll = testResults.every(r => r.passed)

      const submitResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/match/${matchId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          result: {
            code,
            test_results: testResults,
            passed_all: passedAll,
            submitted_at: new Date().toISOString()
          }
        })
      })

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json()
        if (submitResponse.status === 429) {
          const match = errorData.error.match(/wait ([\d.]+) seconds/)
          if (match) setSubmitCooldown(parseFloat(match[1]))
        }
        if (submitResponse.status === 403) {
          setIsBanned(true)
          setBanMessage(errorData.error)
        }
        throw new Error(errorData.error || 'Submit failed')
      }

      const submitData = await submitResponse.json()
      setMatch(submitData.match)
      setSubmitCooldown(3)

      if (passedAll) {
        setOutput('All test cases passed! Submission successful.')
      } else {
        setError(`${testResults.filter(r => r.passed).length}/${testResults.length} test cases passed`)
      }
    } catch (err) {
      setError(err.message || 'Failed to submit solution')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLeaveArena = () => setShowLeaveConfirm(true)

  const confirmLeave = async () => {
    if (match?.status === 'active') {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        const winnerId = match.player1_id === user?.id ? match.player2_id : match.player1_id

        await fetch(`${import.meta.env.VITE_API_URL}/api/match/${matchId}/forfeit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ winner_id: winnerId })
        })
      } catch (err) {}
    }

    localStorage.removeItem(`code_${matchId}`)
    navigate('/dashboard')
  }

  if (!match || !problem) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-white">Loading arena...</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[35%] bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setActiveLeftPanel('problem')}
              className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 ${activeLeftPanel === 'problem' ? 'bg-slate-700 text-white border-b-2 border-purple-500' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">Problem</span>
            </button>
            <button
              onClick={() => setActiveLeftPanel('console')}
              className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 ${activeLeftPanel === 'console' ? 'bg-slate-700 text-white border-b-2 border-green-500' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
            >
              <Terminal className="w-5 h-5" />
              <span className="font-medium">Console</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {activeLeftPanel === 'problem' ? (
              <ProblemPane problem={problem} />
            ) : (
              <Console output={output} error={error} loading={loading || submitting} />
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleLeaveArena}
                className="flex items-center gap-2 text-slate-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            </div>

            <MatchStatus match={match} currentUserId={user?.id} player1={player1} player2={player2} />

            {(runCooldown > 0 || submitCooldown > 0) && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 my-4">
                <div className="flex items-center gap-3 text-yellow-400">
                  <Clock className="w-5 h-5" />
                  <div className="flex-1">
                    {runCooldown > 0 && (
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Run Cooldown:</span>
                        <span className="text-sm font-bold">{runCooldown.toFixed(1)}s</span>
                      </div>
                    )}
                    {submitCooldown > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Submit Cooldown:</span>
                        <span className="text-sm font-bold">{submitCooldown.toFixed(1)}s</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2 h-1 bg-yellow-900/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 transition-all duration-100"
                    style={{ width: `${Math.max((runCooldown / 3) * 100, (submitCooldown / 3) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col px-6 pb-6">
            <div className="flex-1 bg-slate-800/60 border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
              <EditorWindow value={code} onChange={setCode} language="python" />
            </div>

            <div className="mt-6 flex gap-4 justify-end">
              <button
                onClick={() => setIsHintSidebarOpen(true)}
                className="z-40 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-8 rounded-xl shadow-2xl flex items-center gap-3 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 16.5a3.374 3.374 0 00-2.687-1.313l-.548-.547z" />
                </svg>
                Get Hint
              </button>
              <Button
                onClick={runCode}
                disabled={loading || submitting || runCooldown > 0}
                className="flex items-center gap-3 px-6 py-3 text-lg"
              >
                <Play className="w-5 h-5" />
                {runCooldown > 0 ? `Wait ${runCooldown.toFixed(1)}s` : loading ? 'Running...' : 'Run Code'}
              </Button>

              <Button
                variant="secondary"
                onClick={submitSolution}
                disabled={loading || submitting || match?.status !== 'active' || submitCooldown > 0}
                className="flex items-center gap-3 px-6 py-3 text-lg"
              >
                <Send className="w-5 h-5" />
                {submitCooldown > 0 ? `Wait ${submitCooldown.toFixed(1)}s` : submitting ? 'Submitting...' : 'Submit Solution'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className={`fixed inset-y-0 right-0 w-96 bg-slate-800 border-l border-slate-700 shadow-2xl z-50 transform transition-transform duration-300 ${isHintSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 16.5a3.374 3.374 0 00-2.687-1.313l-.548-.547z" />
              </svg>
              AI Hints
            </h2>
            <button onClick={() => setIsHintSidebarOpen(false)} className="text-slate-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <HintPanel
              matchId={matchId}
              matchMode={match?.mode || 'ranked'}
              userCode={code}
              executionOutput={output}
              errorMessages={error}
              token={authToken}
            />
          </div>
        </div>
      </div>

      {isHintSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsHintSidebarOpen(false)} />
      )}

      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Leave Arena?</h3>
            <p className="text-slate-300 mb-6">
              {match?.status === 'active'
                ? "The match is still active. Leaving now will forfeit the match."
                : "Are you sure you want to leave?"}
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowLeaveConfirm(false)}>Cancel</Button>
              <Button variant="danger" onClick={confirmLeave}>Leave Arena</Button>
            </div>
          </div>
        </div>
      )}

      {isBanned && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-red-900/90 border-4 border-red-500 rounded-2xl p-10 max-w-3xl mx-4 backdrop-blur-xl shadow-2xl">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-20 h-20 text-white" strokeWidth={3} />
              </div>
              <h2 className="text-5xl font-black text-white mb-6 tracking-tight">
                AI CODE DETECTED
              </h2>
              <div className="bg-red-950/70 rounded-xl p-8 mb-8 border-2 border-red-600/50">
                <p className="text-2xl text-red-200 font-bold mb-4">{banMessage}</p>
                <p className="text-xl text-red-300 font-medium">
                  You have been <span className="text-white font-black">DISQUALIFIED</span> from this match and temporarily banned.
                </p>
              </div>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-red-900 transition-all"
              >
                Return to Dashboard Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {winnerName && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 backdrop-blur-md bg-black/70" />
          <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white border-4 border-emerald-500 rounded-3xl p-12 max-w-2xl mx-4 shadow-2xl text-center">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-emerald-300 drop-shadow-2xl mb-8">
              {winnerName === 'You Won!' ? 'VICTORY!' : winnerName.includes('Draw') ? 'DRAW' : 'DEFEAT'}
            </h1>
            <div className="text-4xl md:text-6xl font-bold text-white mb-12">
              {winnerName}
            </div>
            <Button
              onClick={() => navigate('/dashboard')}
              className="px-16 py-6 text-2xl font-bold bg-gradient-to-l from-slate-950 via-slate-900 to-black text-white border-2 border-emerald-100 shadow-2xl transform hover:scale-105 transition-all"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}