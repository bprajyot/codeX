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
import  Timer  from '../components/Timer'  // ← Your simple timer
import { Play, Send } from 'lucide-react'

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

  const loadMatchData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

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
      console.error('Error loading match:', err)
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

  const handleMatchUpdate = useCallback((updatedMatch) => {
    setMatch(updatedMatch)
    if (updatedMatch.status === 'completed') {
      setTimeout(() => navigate('/dashboard'), 5000)
    }
  }, [navigate])

  useRealtime(matchId, handleMatchUpdate)

  const runCode = async () => {
    setLoading(true)
    setError('')
    setOutput('')

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
          const err = await response.json()
          throw new Error(err.error || 'Execution failed')
        }

        const data = await response.json()
        const result = data.result
        const actual = result.stdout?.trim() || ''
        const expected = testCase.expected_output.trim()
        const passed = actual === expected && result.status_id === 3

        if (!passed) allPassed = false

        allResults.push({
          testCase: i + 1,
          input: testCase.input,
          expectedOutput: expected,
          actualOutput: actual,
          passed,
          error: result.stderr || result.compile_output || '',
          time: result.time,
          memory: result.memory
        })
      }

      let outputText = '=== Test Results ===\\n\\n'
      allResults.forEach(r => {
        const lines = r.input.split('\\n')
        outputText += `Test Case ${r.testCase}:\\n`
        outputText += lines.length === 1 ? `  Input: ${lines[0]}\\n` : `  Input:\\n${lines.map(l => `    ${l}`).join('\\n')}\\n`
        outputText += `  Expected: ${r.expectedOutput}\\n`
        outputText += `  Your Output: ${r.actualOutput || '(none)'}\\n`
        outputText += `  Status: ${r.passed ? 'PASSED' : 'FAILED'}\\n`
        if (r.time) outputText += `  Time: ${r.time}s\\n`
        if (r.memory) outputText += `  Memory: ${(r.memory / 1024).toFixed(2)} MB\\n`
        if (r.error && !r.passed) outputText += `  Error: ${r.error}\\n\\n`
      })

      const passed = allResults.filter(r => r.passed).length
      outputText += `=== Summary ===\\nPassed: ${passed}/${allResults.length}\\n`

      if (allPassed) {
        outputText += '\\nAll tests passed! You can submit.'
        setOutput(outputText)
      } else {
        outputText += '\\nKeep trying!'
        setError(outputText)
      }
    } catch (err) {
      setError('Execution error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const submitSolution = async () => {
    setSubmitting(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const testResults = []
      for (const testCase of problem.test_cases) {
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

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/execute`, {
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

        const data = await res.json()
        const actual = data.result.stdout?.trim() || ''
        const expected = testCase.expected_output.trim()
        const passed = actual === expected && data.result.status_id === 3
        testResults.push({ passed, ...data.result })
      }

      const passedAll = testResults.every(r => r.passed)

      const submitRes = await fetch(`${import.meta.env.VITE_API_URL}/api/match/${matchId}/submit`, {
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

      const submitData = await submitRes.json()
      setMatch(submitData.match)

      if (passedAll) {
        setOutput('All tests passed! Submitted successfully.')
      } else {
        setError(`${testResults.filter(r => r.passed).length}/${testResults.length} passed`)
      }
    } catch (err) {
      setError('Submit failed: ' + err.message)
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
      } catch (err) {
        console.error('Forfeit error:', err)
      }
    }

    localStorage.removeItem(`code_${matchId}`)
    navigate('/dashboard')
  }

  const cancelLeave = () => setShowLeaveConfirm(false)

  if (!match || !problem) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading arena...</div>
      </div>
    )
  }

  const difficulty = (problem?.difficulty || 'easy').toLowerCase()

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <Navbar />

      <div className="flex-1 flex flex-col overflow-hidden p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleLeaveArena}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* This keeps player names exactly as before */}
        {/* <MatchStatus
          match={match}
          currentUserId={user?.id}
          player1={player1}
          player2={player2}
        /> */}

        {/* Timer only appears during active match */}
        {match.status === 'active' && (
          <div className="mb-4 bg-slate-800/60 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
            <div className="text-white font-mono">{player1.username} V/S {player2.username}</div>
            <Timer difficulty={difficulty} />
          </div>
        )}

        <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
          <div className="col-span-3 bg-slate-800/40 border border-slate-700 rounded-lg overflow-auto p-3">
            <ProblemPane problem={problem} />
          </div>

          <div className="col-span-6 pb-3 rounded-lg bg-slate-800/40 border border-slate-700 flex flex-col overflow-hidden">
            <div className="flex-1 border border-slate-700 rounded-lg overflow-hidden">
              <EditorWindow value={code} onChange={setCode} language="python" />
            </div>

            <div className="mt-3 mx-5 flex gap-5">
              <Button onClick={runCode} disabled={loading || submitting} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Run Code
              </Button>

              <Button
                variant="secondary"
                onClick={submitSolution}
                disabled={loading || submitting || match?.status !== 'active'}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Solution
              </Button>
            </div>
          </div>

          <div className="col-span-3 bg-slate-800/40 border border-slate-700 rounded-lg overflow-auto p-3">
            <Console output={output} error={error} loading={loading || submitting} />
          </div>
        </div>
      </div>

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
              <Button variant="outline" onClick={cancelLeave}>Cancel</Button>
              <Button variant="danger" onClick={confirmLeave}>Leave Arena</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}