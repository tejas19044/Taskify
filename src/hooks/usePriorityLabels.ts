'use client'

import { useState, useCallback } from 'react'
import type { PriorityLabel } from '@/types'
import {
  getLabelsByUser,
  createLabel as serviceCreate,
  updateLabel as serviceUpdate,
  deleteLabel as serviceDelete,
} from '@/services/priorityLabelService'

export function usePriorityLabels(userId: string) {
  const [labels, setLabels] = useState<PriorityLabel[]>(() => getLabelsByUser(userId))

  const refresh = useCallback(() => {
    setLabels(getLabelsByUser(userId))
  }, [userId])

  const createLabel = useCallback(
    (data: Omit<PriorityLabel, 'id' | 'createdAt'>) => {
      const label = serviceCreate(data)
      setLabels(getLabelsByUser(userId))
      return label
    },
    [userId]
  )

  const updateLabel = useCallback(
    (id: string, updates: Partial<PriorityLabel>) => {
      const label = serviceUpdate(id, updates)
      setLabels(getLabelsByUser(userId))
      return label
    },
    [userId]
  )

  const deleteLabel = useCallback(
    (id: string) => {
      serviceDelete(id)
      setLabels(getLabelsByUser(userId))
    },
    [userId]
  )

  return { labels, refresh, createLabel, updateLabel, deleteLabel }
}
