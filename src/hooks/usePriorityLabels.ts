'use client'

import { useState, useCallback, useEffect } from 'react'
import type { PriorityLabel } from '@/types'
import {
  getLabelsByUser,
  createLabel as serviceCreate,
  updateLabel as serviceUpdate,
  deleteLabel as serviceDelete,
} from '@/services/priorityLabelService'

export function usePriorityLabels(userId: string) {
  const [labels, setLabels] = useState<PriorityLabel[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await getLabelsByUser(userId)
      setLabels(data)
    } catch {
      // leave labels as []
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  const createLabel = useCallback(async (data: Omit<PriorityLabel, 'id' | 'createdAt'>) => {
    const label = await serviceCreate(data)
    await load()
    return label
  }, [load])

  const updateLabel = useCallback(async (id: string, updates: Partial<PriorityLabel>) => {
    const label = await serviceUpdate(id, updates)
    await load()
    return label
  }, [load])

  const deleteLabel = useCallback(async (id: string) => {
    await serviceDelete(id)
    await load()
  }, [load])

  return { labels, loading, refresh: load, createLabel, updateLabel, deleteLabel }
}
