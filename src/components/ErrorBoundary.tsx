import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

// Types
type ErrorBoundaryProps = {
  /** The components that this error boundary wraps */
  children: ReactNode;
  /** Optional custom fallback UI to show when an error occurs */
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  /** Whether an error has occurred */
  hasError: boolean;
  /** The error that was caught, if any */
  error: Error | null;
};

/**
 * A component that catches JavaScript errors anywhere in its child component tree.
 * It logs the errors and displays a fallback UI instead of the component tree that crashed.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Initialize state
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  /**
   * Called when an error occurs during rendering, in a lifecycle method, or in the constructor of a child component.
   * Used to update the state to show the fallback UI.
   */
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      error 
    };
  }

  /**
   * Called after an error has been thrown by a descendant component.
   * Used for logging errors.
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('Uncaught error:', error);
    console.error('Error info:', errorInfo);
  }

  /**
   * Resets the error boundary state, allowing the component to try rendering again.
   */
  private handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null 
    });
  };

  public render() {
    // If there's an error, show the fallback UI
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise show default error UI
      return this.props.fallback || (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Oops, something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={this.handleReset}>
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
} 