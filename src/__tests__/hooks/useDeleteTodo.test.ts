import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useDeleteTodo } from '@/hooks/useDeleteTodo';
import { useAuth } from '@/lib/auth';
import { useTodos } from '@/hooks/useTodos';
import { useToast } from '@/hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@supabase/supabase-js';
import type { Todo } from '@/lib/types';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useTodos', () => ({
  useTodos: vi.fn(),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(),
}));

describe('useDeleteTodo', () => {
  const mockUser: User = {
    id: 'test-user-id',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    role: 'authenticated',
    email: 'test@example.com',
  };

  const mockTodos: Todo[] = [
    {
      id: 'test-todo-id',
      text: 'Test todo',
      completed: false,
      priority: 'high',
      status: 'todo',
      user_id: mockUser.id,
      created_at: new Date().toISOString(),
    }
  ];

  const mockQueryClient = {
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
  };

  const mockToast = {
    toast: vi.fn(),
    dismiss: vi.fn(),
    toasts: [],
  };

  const mockDeleteTodoMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  };

  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser, loading: false });
    vi.mocked(useQueryClient).mockReturnValue(mockQueryClient as any);
    vi.mocked(useToast).mockReturnValue(mockToast);
    vi.mocked(useTodos).mockReturnValue({ deleteTodo: mockDeleteTodoMutation } as any);
    mockQueryClient.getQueryData.mockReturnValue(mockTodos);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should delete a todo successfully', async () => {
    const { result } = renderHook(() => useDeleteTodo());
    const todoId = 'test-todo-id';

    await act(async () => {
      await result.current.deleteTodo(todoId);
    });

    // Verify cache was checked
    expect(mockQueryClient.getQueryData).toHaveBeenCalledWith(['todos', mockUser.id]);

    // Verify optimistic update
    expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
      ['todos', mockUser.id],
      expect.any(Function)
    );

    // Verify API call
    expect(mockDeleteTodoMutation.mutateAsync).toHaveBeenCalledWith(todoId);

    // Verify success toast
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Todo deleted',
      description: 'Your todo has been deleted successfully.',
      variant: 'success',
    });
  });

  it('should handle missing cache data', async () => {
    mockQueryClient.getQueryData.mockReturnValueOnce(undefined);

    const { result } = renderHook(() => useDeleteTodo());
    const todoId = 'test-todo-id';

    await act(async () => {
      await result.current.deleteTodo(todoId);
    });

    // Verify error toast when cache is missing
    expect(mockToast.toast).toHaveBeenCalledWith({
      variant: 'destructive',
      title: 'Error',
      description: 'Could not delete todo. Please try again.',
    });

    // Verify no API call was made
    expect(mockDeleteTodoMutation.mutateAsync).not.toHaveBeenCalled();
    // Verify no optimistic update was attempted
    expect(mockQueryClient.setQueryData).not.toHaveBeenCalled();
  });

  it('should handle errors when deleting a todo', async () => {
    const error = {
      code: '400',
      message: 'Failed to delete todo',
    };
    mockDeleteTodoMutation.mutateAsync.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useDeleteTodo());
    const todoId = 'test-todo-id';

    await result.current.deleteTodo(todoId);

    // Verify cache was restored
    expect(mockQueryClient.setQueryData).toHaveBeenLastCalledWith(
      ['todos', mockUser.id],
      mockTodos
    );

    // Verify error toast
    expect(mockToast.toast).toHaveBeenCalledWith({
      variant: 'destructive',
      title: 'Failed to delete todo',
      description: 'There was an error deleting your todo. Please try again.',
    });
  });

  it('should expose isDeleting state', () => {
    mockDeleteTodoMutation.isPending = true;
    const { result } = renderHook(() => useDeleteTodo());

    expect(result.current.isDeleting).toBe(true);
  });
}); 