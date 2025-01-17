import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useTodos } from '@/hooks/useTodos';
import { useAuth } from '@/lib/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '@supabase/supabase-js';
import type { Todo } from '@/lib/types';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

describe('useTodos', () => {
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
      id: 'test-todo-1',
      text: 'Test todo 1',
      completed: false,
      priority: 'high',
      status: 'todo',
      user_id: mockUser.id,
      created_at: new Date().toISOString(),
    },
    {
      id: 'test-todo-2',
      text: 'Test todo 2',
      completed: true,
      priority: 'low',
      status: 'completed',
      user_id: mockUser.id,
      created_at: new Date().toISOString(),
    },
  ];

  const mockQueryClient = {
    invalidateQueries: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ user: mockUser, loading: false });
    vi.mocked(useQueryClient).mockReturnValue(mockQueryClient as any);
    vi.mocked(useQuery).mockReturnValue({
      data: mockTodos,
      isLoading: false,
    } as any);
  });

  it('should fetch todos successfully', async () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toEqual(mockTodos);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return empty array when user is not authenticated', async () => {
    vi.mocked(useAuth).mockReturnValueOnce({ user: null, loading: false });
    vi.mocked(useQuery).mockReturnValueOnce({
      data: [],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle database error when fetching todos', async () => {
    const mockError = new Error('Database error');
    vi.mocked(useQuery).mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      error: mockError,
    } as any);

    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should add a todo successfully', async () => {
    const newTodo = {
      text: 'New todo',
      completed: false,
      priority: 'medium' as const,
      status: 'todo' as const,
      user_id: mockUser.id,
    };

    let onSuccessCallback: () => void;

    vi.mocked(useMutation).mockImplementation((options: any) => {
      onSuccessCallback = options.onSuccess;
      return {
        mutateAsync: vi.fn().mockImplementation(async () => {
          const result = {
            id: 'new-todo-id',
            ...newTodo,
            created_at: new Date().toISOString(),
          };
          onSuccessCallback();
          return result;
        }),
        isPending: false,
      } as any;
    });

    const { result } = renderHook(() => useTodos());
    await act(async () => {
      await result.current.addTodo.mutateAsync(newTodo);
    });

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['todos', mockUser.id],
    });
  });

  it('should update a todo successfully', async () => {
    const todoUpdate = {
      id: 'test-todo-1',
      completed: true,
    };

    let onSuccessCallback: () => void;

    vi.mocked(useMutation).mockImplementation((options: any) => {
      onSuccessCallback = options.onSuccess;
      return {
        mutateAsync: vi.fn().mockImplementation(async () => {
          const result = {
            ...mockTodos[0],
            ...todoUpdate,
          };
          onSuccessCallback();
          return result;
        }),
        isPending: false,
      } as any;
    });

    const { result } = renderHook(() => useTodos());
    await act(async () => {
      await result.current.updateTodo.mutateAsync(todoUpdate);
    });

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['todos', mockUser.id],
    });
  });

  it('should delete a todo successfully', async () => {
    const todoId = 'test-todo-1';

    let onSuccessCallback: () => void;

    vi.mocked(useMutation).mockImplementation((options: any) => {
      onSuccessCallback = options.onSuccess;
      return {
        mutateAsync: vi.fn().mockImplementation(async () => {
          onSuccessCallback();
          return undefined;
        }),
        isPending: false,
      } as any;
    });

    const { result } = renderHook(() => useTodos());
    await act(async () => {
      await result.current.deleteTodo.mutateAsync(todoId);
    });

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['todos', mockUser.id],
    });
  });
}); 