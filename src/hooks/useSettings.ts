'use client'

import { useState, useCallback } from 'react'
import type { UserSettings } from '@/types'
import { getSettings, updateSettings as serviceUpdate } from '@/services/settingsService'

export function useSettings(userId: string) {
  const [settings, setSettings] = useState<UserSettings>(() => getSettings(userId))

  const updateSettings = useCallback(
    (updates: Partial<UserSettings>) => {
      const updated = serviceUpdate(userId, updates)
      setSettings(updated)
      return updated
    },
    [userId]
  )

  const refresh = useCallback(() => {
    setSettings(getSettings(userId))
  }, [userId])

  return { settings, updateSettings, refresh }
}
