import { render, screen, act } from '../utils/test-utils';
import { Auth } from '@/components/Auth';
import { vi } from 'vitest';

// Mock Supabase Auth UI component
vi.mock('@supabase/auth-ui-react', () => ({
  Auth: vi.fn().mockImplementation(() => (
    <div data-testid="supabase-auth">Supabase Auth UI</div>
  )),
}));

describe('Auth', () => {
  it('should render the auth component with welcome message', async () => {
    await act(async () => {
      render(<Auth />);
    });
    
    // Check for welcome message
    expect(screen.getByText('Welcome to Todo App')).toBeInTheDocument();
    
    // Check that Supabase Auth UI is rendered
    expect(screen.getByTestId('supabase-auth')).toBeInTheDocument();
  });
}); 