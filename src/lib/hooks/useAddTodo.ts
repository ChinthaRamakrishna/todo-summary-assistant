import { useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/lib/auth';
import type { Todo } from '@/lib/types';
import { useTodos } from './useTodos';

export function useAddTodo() {
  const { user } = useAuth();
  const { addTodo: addTodoMutation } = useTodos();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addTodo = async (newTodo: Omit<Todo, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return;

    try {
      // Create the optimistic todo
      const optimisticTodo: Todo = {
        id: crypto.randomUUID(),
        ...newTodo,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };

      // Optimistically update the UI
      queryClient.setQueryData(['todos', user.id], (old: Todo[] = []) => [optimisticTodo, ...old]);

      // Make the API call
      await addTodoMutation.mutateAsync({
        ...newTodo,
        user_id: user.id,
      });

      toast({
        title: "Todo added",
        description: "Your todo has been added successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error('Failed to add todo:', error);
      toast({
        variant: "destructive",
        title: "Failed to add todo",
        description: "There was an error adding your todo. Please try again.",
      });
    }
  };

  return {
    addTodo,
    isAdding: addTodoMutation.isPending
  };
} 