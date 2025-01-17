import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useAddTodo } from '@/hooks/useAddTodo';
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

describe('useAddTodo', () => {
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

  const mockAddTodoMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  };

  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser, loading: false });
    vi.mocked(useQueryClient).mockReturnValue(mockQueryClient as any);
    vi.mocked(useToast).mockReturnValue(mockToast);
    vi.mocked(useTodos).mockReturnValue({ addTodo: mockAddTodoMutation } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should add a todo successfully', async () => {
    const { result } = renderHook(() => useAddTodo());
    const newTodo = {
      text: 'Test todo',
      description: 'Test description',
      priority: 'high',
      status: 'todo',
      completed: false,
    } as const;

    await act(async () => {
      await result.current.addTodo(newTodo);
    });

    // Verify optimistic update
    expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
      ['todos', mockUser.id],
      expect.any(Function)
    );

    // Verify API call
    expect(mockAddTodoMutation.mutateAsync).toHaveBeenCalledWith({
      ...newTodo,
      user_id: mockUser.id,
    });

    // Verify success toast
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Todo added',
      description: 'Your todo has been added successfully.',
      variant: 'success',
    });
  });

  it('should handle errors when adding a todo', async () => {
    const error = {
      code: '400',
      message: 'Failed to add todo',
    };
    mockAddTodoMutation.mutateAsync.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAddTodo());
    const newTodo = {
      text: 'Test todo',
      priority: 'high',
      status: 'todo',
      completed: false,
    } as const;

    await result.current.addTodo(newTodo);

    // Verify error toast
    expect(mockToast.toast).toHaveBeenCalledWith({
      variant: 'destructive',
      title: 'Failed to add todo',
      description: 'There was an error adding your todo. Please try again.',
    });
  });

  it('should not proceed if user is not authenticated', async () => {
    vi.mocked(useAuth).mockReturnValueOnce({ user: null, loading: false });

    const { result } = renderHook(() => useAddTodo());
    const newTodo = {
      text: 'Test todo',
      priority: 'high',
      status: 'todo',
      completed: false,
    } as const;

    await act(async () => {
      await result.current.addTodo(newTodo);
    });

    // Verify no API call was made
    expect(mockAddTodoMutation.mutateAsync).not.toHaveBeenCalled();
    // Verify no optimistic update was made
    expect(mockQueryClient.setQueryData).not.toHaveBeenCalled();
  });

  it('should expose isAdding state', () => {
    mockAddTodoMutation.isPending = true;
    const { result } = renderHook(() => useAddTodo());

    expect(result.current.isAdding).toBe(true);
  });
}); 