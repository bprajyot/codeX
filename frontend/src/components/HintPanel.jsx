// frontend/src/components/HintPanel.jsx
import { useState, useEffect } from 'react'
import { Lightbulb, Loader2, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from './Button'
import { apiFetch } from '../lib/api'

export const HintPanel = ({ 
  matchId, 
  matchMode, 
  userCode, 
  executionOutput, 
  errorMessages
}) => {

  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hintInfo, setHintInfo] = useState(null)
  const [currentHint, setCurrentHint] = useState(null)
  const [hintHistory, setHintHistory] = useState([])
  const [error, setError] = useState('')

  // Load initial hint info/history
  useEffect(() => {
    if (matchId) {
      loadHintStatus()
      loadHintHistory()
    }
  }, [matchId])

  /** -------------------------------
   * LOAD HINT STATUS
   --------------------------------*/
  const loadHintStatus = async () => {
    try {
      const response = await apiFetch(`/api/hint/${matchId}/status`)
      if (response.ok) {
        const data = await response.json()
        setHintInfo(data.hint_info)
      }
    } catch (err) {
      console.error('Failed to load hint status:', err)
    }
  }

  /** -------------------------------
   * LOAD HINT HISTORY
   --------------------------------*/
  const loadHintHistory = async () => {
    try {
      const response = await apiFetch(`/api/hint/${matchId}/history`)
      if (response.ok) {
        const data = await response.json()
        setHintHistory(data.hints || [])
      }
    } catch (err) {
      console.error('Failed to load hint history:', err)
    }
  }

  /** -------------------------------
   * REQUEST HINT
   --------------------------------*/
  const requestHint = async () => {
    if (!userCode || userCode.trim().length < 10) {
      setError('Please write some code before requesting a hint')
      return
    }

    setLoading(true)
    setError('')
    setCurrentHint(null)

    try {
      const response = await apiFetch(
        `/api/hint/${matchId}/request`,
        {
          method: 'POST',
          body: JSON.stringify({
            user_code: userCode,
            execution_output: executionOutput,
            error_messages: errorMessages
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          const waitMatch = data.error.match(/wait ([\d.]+)s/)
          setError(waitMatch ? `⏳ ${data.error}` : data.error)
        } else if (response.status === 403) {
          setError(`🚫 ${data.error}`)
        } else {
          setError(data.error || 'Failed to get hint')
        }
        return
      }

      // Success
      setCurrentHint(data.hint)
      setHintInfo(data.hint_info)
      setHintHistory([
        ...hintHistory,
        { hint: data.hint, timestamp: new Date().toISOString() }
      ])
      setIsOpen(true)

    } catch (err) {
      setError('Failed to request hint. Please try again.')
      console.error('Hint request error:', err)
    } finally {
      setLoading(false)
    }
  }

  /** --------------------------------
   * DISABLE IN RANKED MODE
   --------------------------------*/
  if (matchMode === 'ranked') return null

  const getModeColor = () => {
    switch (matchMode) {
      case 'casual': return 'indigo'
      case 'custom': return 'emerald'
      case 'practice': return 'pink'
      default: return 'slate'
    }
  }

  const color = getModeColor()
  const canRequest = hintInfo?.can_request_more !== false

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-lg overflow-hidden">

      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-${color}-500/20 rounded-lg`}>
            <Lightbulb className={`w-5 h-5 text-${color}-400`} />
          </div>
          <div>
            <h3 className="font-bold text-white">AI Hints</h3>
            {hintInfo && (
              <p className="text-xs text-slate-400">
                {hintInfo.hints_limit === 'unlimited' 
                  ? 'Unlimited hints available'
                  : `${hintInfo.hints_remaining} of ${hintInfo.hints_limit} remaining`}
              </p>
            )}
          </div>
        </div>

        {isOpen 
          ? <ChevronUp className="w-5 h-5 text-slate-400" />
          : <ChevronDown className="w-5 h-5 text-slate-400" />
        }
      </div>

      {/* Body */}
      {isOpen && (
        <div className="p-4 border-t border-slate-700 space-y-4">

          {/* Request Hint Button */}
          <Button
            onClick={requestHint}
            disabled={loading || !canRequest}
            className={`w-full flex items-center justify-center gap-2 bg-${color}-500 hover:bg-${color}-600 disabled:opacity-50`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Hint...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4" />
                {canRequest ? 'Get Hint' : 'Limit Reached'}
              </>
            )}
          </Button>

          {/* Hint Info */}
          {hintInfo && (
            <div className={`bg-${color}-500/10 border border-${color}-500/30 rounded-lg p-3`}>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className={`w-4 h-4 text-${color}-400`} />
                <span className={`text-${color}-300 font-medium`}>
                  {hintInfo.message}
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-300">{error}</span>
              </div>
            </div>
          )}

          {/* Current Hint */}
          {currentHint && (
            <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className={`w-5 h-5 text-${color}-400 flex-shrink-0 mt-0.5`} />
                <div>
                  <h4 className={`font-bold text-${color}-400 mb-2`}>Latest Hint:</h4>
                  <p className="text-white text-sm leading-relaxed">{currentHint}</p>
                </div>
              </div>
            </div>
          )}

          {/* Hint History */}
          {hintHistory.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-400 mb-2">
                Previous Hints ({hintHistory.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {hintHistory.slice().reverse().map((hint, idx) => (
                  <div 
                    key={idx} 
                    className="bg-slate-900/30 border border-slate-700 rounded p-3"
                  >
                    <p className="text-white text-xs leading-relaxed">{hint.hint}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(hint.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mode Info */}
          <div className="text-xs text-slate-500 text-center pt-2 border-t border-slate-700">
            {matchMode === 'casual' && '⚠️ Hints limited to 3 in casual mode'}
            {matchMode === 'custom' && '✨ Unlimited hints in custom matches'}
            {matchMode === 'practice' && '🎓 Unlimited hints in practice mode'}
          </div>
        </div>
      )}
    </div>
  )
}
