// frontend/src/hooks/useHints.js
import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'

export const useHints = (matchId) => {
  const [hintStatus, setHintStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load hint status
  const loadHintStatus = async () => {
    if (!matchId) return

    try {
      const response = await apiFetch(`/api/hint/${matchId}/status`)
      if (response.ok) {
        const data = await response.json()
        setHintStatus(data)
      }
    } catch (err) {
      console.error('Failed to load hint status:', err)
    }
  }

  useEffect(() => {
    loadHintStatus()
  }, [matchId])

  // Request a hint
  const requestHint = async (userCode, executionOutput = '', errorMessages = '') => {
    setLoading(true)
    setError('')

    try {
      const response = await apiFetch(`/api/hint/${matchId}/request`, {
        method: 'POST',
        body: JSON.stringify({
          user_code: userCode,
          execution_output: executionOutput,
          error_messages: errorMessages
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get hint')
      }

      // Reload status
      await loadHintStatus()

      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    hintStatus,
    loading,
    error,
    requestHint,
    reloadStatus: loadHintStatus
  }
}