'use client'

import { useState, useCallback, useEffect } from 'react'
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
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await getTasksByUser(userId)
      setTasks(data)
    } catch {
      // leave tasks as []
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  const createTask = useCallback(async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task = await serviceCreate(data)
    await load()
    return task
  }, [load])

  const createRecurringTasks = useCallback(async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, rule: RecurrenceRule) => {
    const created = await serviceCreateRecurring(data, rule)
    await load()
    return created
  }, [load])

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const task = await serviceUpdate(id, updates)
    await load()
    return task
  }, [load])

  const updateAllInSeries = useCallback(async (recurringGroupId: string, updates: Partial<Task>) => {
    await serviceUpdateSeries(recurringGroupId, updates)
    await load()
  }, [load])

  const deleteTask = useCallback(async (id: string) => {
    await serviceDelete(id)
    await load()
  }, [load])

  const deleteAllInSeries = useCallback(async (recurringGroupId: string) => {
    await serviceDeleteSeries(recurringGroupId)
    await load()
  }, [load])

  const moveTask = useCallback(async (id: string, newDate: string | null, halfDay?: 'am' | 'pm') => {
    const task = await serviceMove(id, newDate, halfDay)
    await load()
    return task
  }, [load])

  return {
    tasks,
    loading,
    refresh: load,
    createTask,
    createRecurringTasks,
    updateTask,
    updateAllInSeries,
    deleteTask,
    deleteAllInSeries,
    moveTask,
  }
}
