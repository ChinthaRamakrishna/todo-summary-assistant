import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'
import { useAuth } from '../auth'
import type { Todo } from '../types'

export function useTodos() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: todos, isLoading } = useQuery({
    queryKey: ['todos', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Todo[]
    },
    enabled: !!user,
  })

  const addTodo = useMutation({
    mutationFn: async (newTodo: Omit<Todo, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('todos')
        .insert(newTodo)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.id] })
    },
  })

  const updateTodo = useMutation({
    mutationFn: async ({ id, ...todo }: Partial<Todo> & { id: string }) => {
      const { data, error } = await supabase
        .from('todos')
        .update(todo)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.id] })
    },
  })

  const deleteTodo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.id] })
    },
  })

  return {
    todos,
    isLoading,
    addTodo,
    updateTodo,
    deleteTodo,
  }
} 