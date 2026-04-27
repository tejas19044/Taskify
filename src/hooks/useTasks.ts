'use client'

import { useState, useCallback } from 'react'
import type { Task } from '@/types'
import {
  getTasksByUser,
  createTask as serviceCreate,
  updateTask as serviceUpdate,
  deleteTask as serviceDelete,
  moveTask as serviceMove,
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

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      const task = serviceUpdate(id, updates)
      setTasks(getTasksByUser(userId))
      return task
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

  const moveTask = useCallback(
    (id: string, newDate: string | null) => {
      const task = serviceMove(id, newDate)
      setTasks(getTasksByUser(userId))
      return task
    },
    [userId]
  )

  return { tasks, refresh, createTask, updateTask, deleteTask, moveTask }
}
