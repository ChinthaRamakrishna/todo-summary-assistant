import { useQueryClient } from '@tanstack/react-query';
import { useToast } from "./useToast";
import { useAuth } from '@/lib/auth';
import type { Todo } from '@/lib/types';
import { useTodos } from './useTodos';

export function useToggleTodo() {
  const { user } = useAuth();
  const { updateTodo } = useTodos();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      // Optimistically update the UI
      queryClient.setQueryData(['todos', user?.id], (old: Todo[] = []) =>
        old.map(todo =>
          todo.id === id ? { ...todo, completed: !completed } : todo
        )
      );

      // Make the API call
      await updateTodo.mutateAsync({
        id,
        completed: !completed
      });

      toast({
        title: "Todo updated",
        description: `Todo marked as ${!completed ? 'completed' : 'incomplete'}.`,
        variant: "success",
      });
    } catch (error) {
      // Revert optimistic update on error
      queryClient.setQueryData(['todos', user?.id], (old: Todo[] = []) =>
        old.map(todo =>
          todo.id === id ? { ...todo, completed } : todo
        )
      );
      console.error('Failed to toggle todo:', error);
      toast({
        variant: "destructive",
        title: "Failed to update todo",
        description: "There was an error updating your todo. Please try again.",
      });
    }
  };

  return {
    toggleTodo,
    isToggling: updateTodo.isPending
  };
} 