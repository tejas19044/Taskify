'use client'

import { useState, useCallback } from 'react'
import type { Priority } from '@/types'
import {
  getPrioritiesByUser,
  createPriority as serviceCreate,
  updatePriority as serviceUpdate,
  deletePriority as serviceDelete,
} from '@/services/priorityService'

export function usePriorities(userId: string) {
  const [priorities, setPriorities] = useState<Priority[]>(() => getPrioritiesByUser(userId))

  const refresh = useCallback(() => {
    setPriorities(getPrioritiesByUser(userId))
  }, [userId])

  const createPriority = useCallback(
    (data: Omit<Priority, 'id' | 'createdAt'>) => {
      const p = serviceCreate(data)
      setPriorities(getPrioritiesByUser(userId))
      return p
    },
    [userId]
  )

  const updatePriority = useCallback(
    (id: string, updates: Partial<Priority>) => {
      const p = serviceUpdate(id, updates)
      setPriorities(getPrioritiesByUser(userId))
      return p
    },
    [userId]
  )

  const deletePriority = useCallback(
    (id: string) => {
      serviceDelete(id)
      setPriorities(getPrioritiesByUser(userId))
    },
    [userId]
  )

  return { priorities, refresh, createPriority, updatePriority, deletePriority }
}
