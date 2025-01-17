import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useToggleTodo } from '@/hooks/useToggleTodo';
import { useAuth } from '@/lib/auth';
import { useTodos } from '@/hooks/useTodos';
import { useToast } from '@/hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@supabase/supabase-js';

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

describe('useToggleTodo', () => {
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

  const mockQueryClient = {
    setQueryData: vi.fn(),
  };

  const mockToast = {
    toast: vi.fn(),
    dismiss: vi.fn(),
    toasts: [],
  };

  const mockUpdateTodoMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser, loading: false });
    vi.mocked(useQueryClient).mockReturnValue(mockQueryClient as any);
    vi.mocked(useToast).mockReturnValue(mockToast);
    vi.mocked(useTodos).mockReturnValue({ updateTodo: mockUpdateTodoMutation } as any);
  });

  it('should toggle a todo from incomplete to complete', async () => {
    const { result } = renderHook(() => useToggleTodo());
    const todoId = 'test-todo-id';
    const currentCompleted = false;

    await act(async () => {
      await result.current.toggleTodo(todoId, currentCompleted);
    });

    // Verify optimistic update
    expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
      ['todos', mockUser.id],
      expect.any(Function)
    );

    // Verify API call
    expect(mockUpdateTodoMutation.mutateAsync).toHaveBeenCalledWith({
      id: todoId,
      completed: true,
    });

    // Verify success toast
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Todo updated',
      description: 'Todo marked as completed.',
      variant: 'success',
    });
  });

  it('should toggle a todo from complete to incomplete', async () => {
    const { result } = renderHook(() => useToggleTodo());
    const todoId = 'test-todo-id';
    const currentCompleted = true;

    await act(async () => {
      await result.current.toggleTodo(todoId, currentCompleted);
    });

    // Verify API call with correct completed state
    expect(mockUpdateTodoMutation.mutateAsync).toHaveBeenCalledWith({
      id: todoId,
      completed: false,
    });

    // Verify success toast with correct message
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Todo updated',
      description: 'Todo marked as incomplete.',
      variant: 'success',
    });
  });

  it('should handle errors when toggling a todo', async () => {
    const error = new Error('Failed to update todo');
    mockUpdateTodoMutation.mutateAsync.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useToggleTodo());
    const todoId = 'test-todo-id';
    const currentCompleted = false;

    await act(async () => {
      await result.current.toggleTodo(todoId, currentCompleted);
    });

    // Verify optimistic update was reverted
    expect(mockQueryClient.setQueryData).toHaveBeenCalledTimes(2);
    expect(mockQueryClient.setQueryData).toHaveBeenLastCalledWith(
      ['todos', mockUser.id],
      expect.any(Function)
    );

    // Verify error toast
    expect(mockToast.toast).toHaveBeenCalledWith({
      variant: 'destructive',
      title: 'Failed to update todo',
      description: 'There was an error updating your todo. Please try again.',
    });
  });

  it('should expose isToggling state', () => {
    mockUpdateTodoMutation.isPending = true;
    const { result } = renderHook(() => useToggleTodo());

    expect(result.current.isToggling).toBe(true);
  });
}); 