import { render, screen, act } from '../utils/test-utils';
import { TodoForm } from '@/components/TodoForm';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';

describe('TodoForm', () => {
  const mockOnSubmit = vi.fn();

  beforeAll(() => {
    // Mock scrollIntoView since it's not available in JSDOM
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form with all fields', async () => {
    await act(async () => {
      render(<TodoForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    });

    // Check if all form elements are present
    expect(screen.getByTestId('todo-form')).toBeInTheDocument();
    expect(screen.getByTestId('todo-input')).toBeInTheDocument();
    expect(screen.getByTestId('priority-select')).toBeInTheDocument();
    expect(screen.getByTestId('date-picker-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-description-button')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    
    // Description textarea should not be visible initially
    expect(screen.queryByTestId('description-textarea')).not.toBeInTheDocument();
  });

  it('should show description textarea when toggle button is clicked', async () => {
    await act(async () => {
      render(<TodoForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    });

    // Click the toggle button
    const toggleButton = screen.getByTestId('toggle-description-button');
    await act(async () => {
      await toggleButton.click();
    });

    // Description textarea should now be visible
    expect(screen.getByTestId('description-textarea')).toBeInTheDocument();
  });

  it('should disable submit button when isSubmitting is true', async () => {
    await act(async () => {
      render(<TodoForm onSubmit={mockOnSubmit} isSubmitting={true} />);
    });

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Adding...');
  });

  it('should submit form with correct data when all fields are filled', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<TodoForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    });

    // Fill in the required text field
    const todoInput = screen.getByTestId('todo-input');
    await user.type(todoInput, 'Test todo');

    // Add description
    const toggleButton = screen.getByTestId('toggle-description-button');
    await act(async () => {
      await toggleButton.click();
    });
    const descriptionTextarea = screen.getByTestId('description-textarea');
    await user.type(descriptionTextarea, 'Test description');

    // Submit the form
    const submitButton = screen.getByTestId('submit-button');
    await act(async () => {
      await submitButton.click();
    });

    // Check if onSubmit was called with correct data
    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      text: 'Test todo',
      description: 'Test description',
      priority: 'low', // Default priority
      completed: false,
      status: 'todo',
    }));
  });

  it('should not submit form when required fields are empty', async () => {
    await act(async () => {
      render(<TodoForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    });

    // Try to submit without filling required fields
    const submitButton = screen.getByTestId('submit-button');
    await act(async () => {
      await submitButton.click();
    });

    // Check that onSubmit was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
}); 