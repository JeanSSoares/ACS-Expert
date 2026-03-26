import { useEffect, useState } from 'react'
import { flushQueue } from '@/services/offlineQueue'

export function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
      flushQueue()
    }
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return online
}
