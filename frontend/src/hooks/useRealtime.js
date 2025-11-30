import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export const useRealtime = (matchId, onUpdate) => {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!matchId) return

    const channel = supabase
      .channel(`match:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`
        },
        (payload) => {
          if (onUpdate) {
            onUpdate(payload.new)
          }
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, onUpdate])

  return { connected }
}