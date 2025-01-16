import { render, screen, fireEvent } from '../utils/test-utils';
import { vi } from 'vitest';
import { TodoItem } from '@/components/TodoItem';
import type { Todo } from '@/lib/types';

const mockTodo: Todo = {
  id: '1',
  text: 'Test Todo',
  description: 'Test Description',
  completed: false,
  priority: 'medium',
  status: 'todo',
  user_id: 'test-user',
  created_at: new Date().toISOString(),
  due_date: new Date().toISOString(),
};

const mockHandlers = {
  onToggleComplete: vi.fn(),
  onDelete: vi.fn(),
};

describe('TodoItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders todo item correctly', async () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggleComplete={mockHandlers.onToggleComplete}
        onDelete={mockHandlers.onDelete}
        isUpdating={false}
        isDeleting={false}
      />
    );

    // Check if todo text is rendered
    expect(await screen.findByText(mockTodo.text)).toBeInTheDocument();
    
    // Check if the card has the correct priority-based styling
    const card = screen.getByText(mockTodo.text).closest('.bg-yellow-50\\/50');
    expect(card).toBeInTheDocument();
  });

  it('calls onToggleComplete when checkbox is clicked', async () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggleComplete={mockHandlers.onToggleComplete}
        onDelete={mockHandlers.onDelete}
        isUpdating={false}
        isDeleting={false}
      />
    );

    const checkbox = await screen.findByRole('checkbox', {
      name: 'Mark "Test Todo" as complete'
    });
    await fireEvent.click(checkbox);

    expect(mockHandlers.onToggleComplete).toHaveBeenCalledWith(mockTodo.id, false);
  });

  it('calls onDelete when delete button is clicked', async () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggleComplete={mockHandlers.onToggleComplete}
        onDelete={mockHandlers.onDelete}
        isUpdating={false}
        isDeleting={false}
      />
    );

    const deleteButton = await screen.findByRole('button', {
      name: 'Delete "Test Todo"'
    });
    await fireEvent.click(deleteButton);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTodo.id);
  });

  it('shows and hides description when chevron button is clicked', async () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggleComplete={mockHandlers.onToggleComplete}
        onDelete={mockHandlers.onDelete}
        isUpdating={false}
        isDeleting={false}
      />
    );

    // Description should be visible by default (since mockTodo has a description)
    expect(await screen.findByText('Test Description')).toBeInTheDocument();

    // Find the chevron button
    const chevronButton = await screen.findByRole('button', {
      name: 'Hide description'
    });
    await fireEvent.click(chevronButton);

    // Description should be hidden
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();

    // Click again to show
    await fireEvent.click(chevronButton);
    expect(await screen.findByText('Test Description')).toBeInTheDocument();
  });
}); 