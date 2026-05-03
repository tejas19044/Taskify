'use client'

import { useState, useCallback, useEffect } from 'react'
import type { UserSettings } from '@/types'
import { getSettings, updateSettings as serviceUpdate } from '@/services/settingsService'

const DEFAULTS: UserSettings = {
  userId: '', workingMode: '5-day', boardMode: 'current-week',
  defaultDashboardRange: 'this-week', defaultDailyHours: 8, perDayOverrides: {},
}

export function useSettings(userId: string) {
  const [settings, setSettings] = useState<UserSettings>({ ...DEFAULTS, userId })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await getSettings(userId)
      setSettings(data)
    } catch {
      // leave settings as defaults
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    const updated = await serviceUpdate(userId, updates)
    setSettings(updated)
    return updated
  }, [userId])

  return { settings, loading, updateSettings, refresh: load }
}
