import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export const useMatchmaking = (userId) => {
  const [inQueue, setInQueue] = useState(false)
  const [activeMatch, setActiveMatch] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const checkStatus = useCallback(async () => {
    if (!userId) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/queue/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to check status')

      const data = await response.json()
      setInQueue(data.in_queue)
      
      // Only set active match if it's actually active
      if (data.active_match && data.active_match.status === 'active') {
        setActiveMatch(data.active_match)
      } else {
        setActiveMatch(null)
      }
    } catch (err) {
      console.error('Error checking status:', err)
      setError(err.message)
    }
  }, [userId])

  const joinQueue = async (mode = 'ranked') => {
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/queue/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mode })
      })

      if (!response.ok) throw new Error('Failed to join queue')

      setInQueue(true)
    } catch (err) {
      console.error('Error joining queue:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const leaveQueue = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/queue/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to leave queue')

      setInQueue(false)
    } catch (err) {
      console.error('Error leaving queue:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!userId) return

    checkStatus()

    // Poll for status every 2 seconds when in queue
    const interval = setInterval(() => {
      if (inQueue || !activeMatch) {
        checkStatus()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [userId, inQueue, activeMatch, checkStatus])

  return {
    inQueue,
    activeMatch,
    loading,
    error,
    joinQueue,
    leaveQueue,
    checkStatus
  }
}