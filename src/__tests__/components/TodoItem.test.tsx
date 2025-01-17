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
  const testID = 'test-todo';

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
        testID={testID}
      />
    );

    // Check if todo text is rendered
    expect(screen.getByTestId(`${testID}-text`)).toHaveTextContent(mockTodo.text);
    
    // Check if the card has the correct priority-based styling
    const card = screen.getByTestId(testID);
    expect(card).toHaveClass('bg-yellow-50/50');

    // Check if dates are rendered
    expect(screen.getByTestId(`${testID}-created-date`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testID}-due-date`)).toBeInTheDocument();
  });

  it('calls onToggleComplete when checkbox is clicked', async () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggleComplete={mockHandlers.onToggleComplete}
        onDelete={mockHandlers.onDelete}
        isUpdating={false}
        isDeleting={false}
        testID={testID}
      />
    );

    const checkbox = screen.getByTestId(`${testID}-checkbox`);
    fireEvent.click(checkbox);

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
        testID={testID}
      />
    );

    const deleteButton = screen.getByTestId(`${testID}-delete`);
    fireEvent.click(deleteButton);

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
        testID={testID}
      />
    );

    // Description should be visible by default (since mockTodo has a description)
    expect(screen.getByTestId(`${testID}-description`)).toBeInTheDocument();

    // Find and click the expand button
    const expandButton = screen.getByTestId(`${testID}-expand`);
    fireEvent.click(expandButton);

    // Description should be hidden
    expect(screen.queryByTestId(`${testID}-description`)).not.toBeInTheDocument();

    // Click again to show
    fireEvent.click(expandButton);
    expect(screen.getByTestId(`${testID}-description`)).toBeInTheDocument();
  });
}); 