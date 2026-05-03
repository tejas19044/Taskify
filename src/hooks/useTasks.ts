'use client'

import { useState, useCallback } from 'react'
import type { Task, RecurrenceRule } from '@/types'
import {
  getTasksByUser,
  createTask as serviceCreate,
  updateTask as serviceUpdate,
  deleteTask as serviceDelete,
  moveTask as serviceMove,
  createRecurringTasks as serviceCreateRecurring,
  updateTaskSeries as serviceUpdateSeries,
  deleteTaskSeries as serviceDeleteSeries,
} from '@/services/taskService'

export function useTasks(userId: string) {
  const [tasks, setTasks] = useState<Task[]>(() => getTasksByUser(userId))

  const refresh = useCallback(() => {
    setTasks(getTasksByUser(userId))
  }, [userId])

  const createTask = useCallback(
    (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      const task = serviceCreate(data)
      setTasks(getTasksByUser(userId))
      return task
    },
    [userId]
  )

  const createRecurringTasks = useCallback(
    (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, rule: RecurrenceRule) => {
      const created = serviceCreateRecurring(data, rule)
      setTasks(getTasksByUser(userId))
      return created
    },
    [userId]
  )

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      const task = serviceUpdate(id, updates)
      setTasks(getTasksByUser(userId))
      return task
    },
    [userId]
  )

  const updateAllInSeries = useCallback(
    (recurringGroupId: string, updates: Partial<Task>) => {
      serviceUpdateSeries(recurringGroupId, updates)
      setTasks(getTasksByUser(userId))
    },
    [userId]
  )

  const deleteTask = useCallback(
    (id: string) => {
      serviceDelete(id)
      setTasks(getTasksByUser(userId))
    },
    [userId]
  )

  const deleteAllInSeries = useCallback(
    (recurringGroupId: string) => {
      serviceDeleteSeries(recurringGroupId)
      setTasks(getTasksByUser(userId))
    },
    [userId]
  )

  const moveTask = useCallback(
    (id: string, newDate: string | null, halfDay?: 'am' | 'pm') => {
      const task = serviceMove(id, newDate, halfDay)
      setTasks(getTasksByUser(userId))
      return task
    },
    [userId]
  )

  return {
    tasks,
    refresh,
    createTask,
    createRecurringTasks,
    updateTask,
    updateAllInSeries,
    deleteTask,
    deleteAllInSeries,
    moveTask,
  }
}
