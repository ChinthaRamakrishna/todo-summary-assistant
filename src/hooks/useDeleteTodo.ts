import { useQueryClient } from '@tanstack/react-query';
import { useToast } from "./useToast";
import { useAuth } from '@/lib/auth';
import type { Todo } from '@/lib/types';
import { useTodos } from './useTodos';

export function useDeleteTodo() {
  const { user } = useAuth();
  const { deleteTodo: deleteTodoMutation } = useTodos();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteTodo = async (id: string) => {
    // Store the current todos before deletion    
    const previousTodos = queryClient.getQueryData(['todos', user?.id]) as Todo[] | undefined;
    
    // If we don't have the todos in cache, we can't proceed with optimistic delete
    if (!previousTodos) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete todo. Please try again.",
      });
      return;
    }

    try {
      // Optimistically update the UI
      queryClient.setQueryData(['todos', user?.id], (old: Todo[] = []) =>
        old.filter(todo => todo.id !== id)
      );

      // Make the API call
      await deleteTodoMutation.mutateAsync(id);

      toast({
        title: "Todo deleted",
        description: "Your todo has been deleted successfully.",
        variant: "success",
      });
    } catch (error) {
      // Restore the todo on error
      queryClient.setQueryData(['todos', user?.id], previousTodos);
      
      console.error('Failed to delete todo:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete todo",
        description: "There was an error deleting your todo. Please try again.",
      });
    }
  };

  return {
    deleteTodo,
    isDeleting: deleteTodoMutation.isPending
  };
} 