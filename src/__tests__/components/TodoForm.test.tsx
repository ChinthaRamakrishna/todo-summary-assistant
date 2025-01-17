import { render, screen, act } from '../utils/test-utils';
import { TodoForm } from '@/components/TodoForm';
import { vi } from 'vitest';

describe('TodoForm', () => {
  const mockOnSubmit = vi.fn();

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
}); 