import { useState } from 'react';
import { useTodos } from '@/hooks/useTodos';
import { useAddTodo } from '@/hooks/useAddTodo';
import { useDeleteTodo } from '@/hooks/useDeleteTodo';
import { useToggleTodo } from '@/hooks/useToggleTodo';
import { TodoSkeleton } from './TodoSkeleton';
import { TodoForm } from './TodoForm';
import { TodoItem } from './TodoItem';
import { TodoSort, type SortBy } from './TodoSort';
import { Separator } from "@/components/ui/separator";

const priorityOrder = {
  high: 0,
  medium: 1,
  low: 2,
} as const;

export function TodoList() {
  const { todos, isLoading } = useTodos();
  const { addTodo, isAdding } = useAddTodo();
  const { deleteTodo, isDeleting } = useDeleteTodo();
  const { toggleTodo, isToggling } = useToggleTodo();
  const [sortBy, setSortBy] = useState<SortBy>('latest');

  // Sort todos based on selected option
  const sortedTodos = todos?.slice().sort((a, b) => {
    // Always move completed todos to the end
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // Then apply the selected sort
    switch (sortBy) {
      case 'latest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'due-date':
        // Handle cases where due_date might be undefined
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      case 'priority':
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      default:
        return 0;
    }
  });

  // Split todos into incomplete and complete
  const incompleteTodos = sortedTodos?.filter(todo => !todo.completed) || [];
  const completeTodos = sortedTodos?.filter(todo => todo.completed) || [];

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto" data-testid="todo-list-loading">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <TodoSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto" data-testid="todo-list">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <TodoForm 
          onSubmit={addTodo}
          isSubmitting={isAdding}
        />

        <TodoSort 
          value={sortBy}
          onChange={setSortBy}
        />

        <div className="space-y-3" data-testid="incomplete-todos">
          {incompleteTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggleComplete={toggleTodo}
              onDelete={deleteTodo}
              isUpdating={isToggling}
              isDeleting={isDeleting}
            />
          ))}
          
          {completeTodos.length > 0 && incompleteTodos.length > 0 && (
            <div className="py-4" data-testid="todo-separator">
              <Separator className="bg-gray-200" />
            </div>
          )}

          {completeTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggleComplete={toggleTodo}
              onDelete={deleteTodo}
              isUpdating={isToggling}
              isDeleting={isDeleting}
            />
          ))}
          
          {!todos?.length && (
            <div className="text-center py-12" data-testid="empty-state">
              <p className="text-gray-500 text-lg">No tasks yet. Add one above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 