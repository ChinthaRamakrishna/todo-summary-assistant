import { render, screen, fireEvent } from '../utils/test-utils';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { vi } from 'vitest';

// Mock console.error to avoid noise in test output
const originalConsoleError = console.error;
console.error = vi.fn();

// Component that throws an error
const BuggyComponent = () => {
  throw new Error('Test error');
  return null;
};

describe('ErrorBoundary', () => {
  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Oops, something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should reset error boundary when Try Again is clicked', () => {
    render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );

    // Verify error UI is shown
    expect(screen.getByText('Oops, something went wrong')).toBeInTheDocument();
    
    // Click try again
    fireEvent.click(screen.getByText('Try Again'));
    
    // Verify error UI is still shown (since we're still rendering the buggy component)
    expect(screen.getByText('Oops, something went wrong')).toBeInTheDocument();
  });
}); 