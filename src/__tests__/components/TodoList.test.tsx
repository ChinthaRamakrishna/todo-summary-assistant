import { render, screen, act, within, fireEvent } from '../utils/test-utils';
import { TodoList } from '@/components/TodoList';
import { vi } from 'vitest';
import { useTodos } from '@/hooks/useTodos';
import { useAddTodo } from '@/hooks/useAddTodo';
import { useDeleteTodo } from '@/hooks/useDeleteTodo';
import { useToggleTodo } from '@/hooks/useToggleTodo';
import type { Todo } from '@/lib/types';
import { TodoSort, type SortBy } from '@/components/TodoSort';

// Mock the hooks
vi.mock('@/hooks/useTodos', () => ({
  useTodos: vi.fn(),
}));

vi.mock('@/hooks/useAddTodo', () => ({
  useAddTodo: vi.fn(),
}));

vi.mock('@/hooks/useDeleteTodo', () => ({
  useDeleteTodo: vi.fn(),
}));

vi.mock('@/hooks/useToggleTodo', () => ({
  useToggleTodo: vi.fn(),
}));

vi.mock('@/components/TodoSort', () => ({
  TodoSort: vi.fn().mockImplementation(({ value, onChange }: { value: SortBy; onChange: (value: SortBy) => void }) => {
    return (
      <div data-testid="todo-sort">
        <select 
          data-testid="todo-sort-select" 
          value={value} 
          onChange={(e) => onChange(e.target.value as SortBy)}
        >
          <option value="latest">Latest First</option>
          <option value="due-date">Due Date</option>
          <option value="priority">Priority</option>
        </select>
      </div>
    );
  }),
}));

describe('TodoList', () => {
  const mockTodos: Todo[] = [
    {
      id: '1',
      text: 'Test todo 1',
      completed: false,
      priority: 'low',
      status: 'todo',
      created_at: new Date('2024-01-01').toISOString(),
      due_date: new Date('2024-02-01').toISOString(),
      user_id: 'test-user',
    },
    {
      id: '2',
      text: 'Test todo 2',
      completed: false,
      priority: 'high',
      status: 'todo',
      created_at: new Date('2024-01-02').toISOString(),
      due_date: new Date('2024-01-15').toISOString(),
      user_id: 'test-user',
    },
    {
      id: '3',
      text: 'Test todo 3',
      completed: true,
      priority: 'medium',
      status: 'completed',
      created_at: new Date('2024-01-03').toISOString(),
      due_date: new Date('2024-02-15').toISOString(),
      user_id: 'test-user',
    },
  ];

  const mockHooks = () => {
    vi.mocked(useTodos).mockReturnValue({
      todos: mockTodos,
      isLoading: false,
      addTodo: { mutateAsync: vi.fn(), isPending: false } as any,
      updateTodo: { mutateAsync: vi.fn(), isPending: false } as any,
      deleteTodo: { mutateAsync: vi.fn(), isPending: false } as any,
    });

    vi.mocked(useAddTodo).mockReturnValue({
      addTodo: vi.fn(),
      isAdding: false,
    });

    vi.mocked(useDeleteTodo).mockReturnValue({
      deleteTodo: vi.fn(),
      isDeleting: false,
    });

    vi.mocked(useToggleTodo).mockReturnValue({
      toggleTodo: vi.fn(),
      isToggling: false,
    });
  };

  beforeEach(() => {
    mockHooks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state', async () => {
    vi.mocked(useTodos).mockReturnValue({
      todos: [],
      isLoading: true,
      addTodo: { mutateAsync: vi.fn(), isPending: false } as any,
      updateTodo: { mutateAsync: vi.fn(), isPending: false } as any,
      deleteTodo: { mutateAsync: vi.fn(), isPending: false } as any,
    });

    await act(async () => {
      render(<TodoList />);
    });

    expect(screen.getByTestId('todo-list-loading')).toBeInTheDocument();
  });

  it('should show empty state when there are no todos', async () => {
    vi.mocked(useTodos).mockReturnValue({
      todos: [],
      isLoading: false,
      addTodo: { mutateAsync: vi.fn(), isPending: false } as any,
      updateTodo: { mutateAsync: vi.fn(), isPending: false } as any,
      deleteTodo: { mutateAsync: vi.fn(), isPending: false } as any,
    });

    await act(async () => {
      render(<TodoList />);
    });

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No tasks yet. Add one above!')).toBeInTheDocument();
  });

  it('should render todos correctly', async () => {
    await act(async () => {
      render(<TodoList />);
    });

    expect(screen.getByTestId('todo-list')).toBeInTheDocument();
    expect(screen.getByTestId('incomplete-todos')).toBeInTheDocument();
    
    // Check if todos are rendered
    expect(screen.getByText('Test todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test todo 2')).toBeInTheDocument();
  });

  it('should show separator when there are both complete and incomplete todos', async () => {
    await act(async () => {
      render(<TodoList />);
    });

    expect(screen.getByTestId('todo-separator')).toBeInTheDocument();
  });

  it('should not show separator when there are only incomplete todos', async () => {
    const incompleteTodos = mockTodos.filter(todo => !todo.completed);
    vi.mocked(useTodos).mockReturnValue({
      todos: incompleteTodos,
      isLoading: false,
      addTodo: { mutateAsync: vi.fn(), isPending: false } as any,
      updateTodo: { mutateAsync: vi.fn(), isPending: false } as any,
      deleteTodo: { mutateAsync: vi.fn(), isPending: false } as any,
    });

    await act(async () => {
      render(<TodoList />);
    });

    expect(screen.queryByTestId('todo-separator')).not.toBeInTheDocument();
  });

  it('should sort todos by latest by default', async () => {
    const sortedTodos = [
      {
        ...mockTodos[0],
        created_at: new Date('2024-01-02').toISOString(),
      },
      {
        ...mockTodos[1],
        created_at: new Date('2024-01-01').toISOString(),
      },
    ];

    vi.mocked(useTodos).mockReturnValue({
      todos: sortedTodos,
      isLoading: false,
      addTodo: { mutateAsync: vi.fn(), isPending: false } as any,
      updateTodo: { mutateAsync: vi.fn(), isPending: false } as any,
      deleteTodo: { mutateAsync: vi.fn(), isPending: false } as any,
    });

    await act(async () => {
      render(<TodoList />);
    });

    const todoElements = screen.getAllByText(/Test todo/);
    expect(todoElements[0]).toHaveTextContent('Test todo 1');
    expect(todoElements[1]).toHaveTextContent('Test todo 2');
  });

  it('should sort todos by priority when priority sort is selected', async () => {
    await act(async () => {
      render(<TodoList />);
    });

    // Get the mocked TodoSort component and directly call its onChange
    const mockTodoSort = vi.mocked(TodoSort);
    const onChangeProp = mockTodoSort.mock.calls[0][0].onChange;
    
    // Call the onChange handler with 'priority'
    await act(async () => {
      onChangeProp('priority');
    });

    // Get all todo items
    const todoItems = screen.getAllByTestId(/^todo-item$/);
    
    // Verify todos are sorted by priority (high -> medium -> low)
    expect(within(todoItems[0]).getByTestId('todo-item-text')).toHaveTextContent('Test todo 2'); // high priority
    expect(within(todoItems[1]).getByTestId('todo-item-text')).toHaveTextContent('Test todo 1'); // low priority
    expect(within(todoItems[2]).getByTestId('todo-item-text')).toHaveTextContent('Test todo 3'); // medium priority (completed)
  });

  it('should sort todos by due date when due date sort is selected', async () => {
    await act(async () => {
      render(<TodoList />);
    });

    // Get the mocked TodoSort component and directly call its onChange
    const mockTodoSort = vi.mocked(TodoSort);
    const onChangeProp = mockTodoSort.mock.calls[0][0].onChange;
    
    // Call the onChange handler with 'due-date'
    await act(async () => {
      onChangeProp('due-date');
    });

    // Get all todo items
    const todoItems = screen.getAllByTestId(/^todo-item$/);
    
    // Verify todos are sorted by due date (earliest -> latest)
    expect(within(todoItems[0]).getByTestId('todo-item-text')).toHaveTextContent('Test todo 2'); // Jan 15
    expect(within(todoItems[1]).getByTestId('todo-item-text')).toHaveTextContent('Test todo 1'); // Feb 1
    expect(within(todoItems[2]).getByTestId('todo-item-text')).toHaveTextContent('Test todo 3'); // Feb 15 (completed)
  });
}); 