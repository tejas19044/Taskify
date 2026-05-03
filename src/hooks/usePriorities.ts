'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Priority } from '@/types'
import {
  getPrioritiesByUser,
  createPriority as serviceCreate,
  updatePriority as serviceUpdate,
  deletePriority as serviceDelete,
} from '@/services/priorityService'

export function usePriorities(userId: string) {
  const [priorities, setPriorities] = useState<Priority[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await getPrioritiesByUser(userId)
      setPriorities(data)
    } catch {
      // leave priorities as []
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  const createPriority = useCallback(async (data: Omit<Priority, 'id' | 'createdAt'>) => {
    const p = await serviceCreate(data)
    await load()
    return p
  }, [load])

  const updatePriority = useCallback(async (id: string, updates: Partial<Priority>) => {
    const p = await serviceUpdate(id, updates)
    await load()
    return p
  }, [load])

  const deletePriority = useCallback(async (id: string) => {
    await serviceDelete(id)
    await load()
  }, [load])

  return { priorities, loading, refresh: load, createPriority, updatePriority, deletePriority }
}
