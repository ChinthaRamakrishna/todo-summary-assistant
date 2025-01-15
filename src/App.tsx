import { TodoList } from './components/TodoList'
import { Toaster } from './components/ui/toaster'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Auth } from './components/Auth'
import { AuthProvider, useAuth } from './lib/auth'
import { supabase } from './lib/supabase'
import { Button } from './components/ui/button'

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <Auth />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-left mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              A Simple Todo App by CURSOR Ai
            </h1>
            <p className="text-gray-500">Stay organized, get things done.</p>
          </div>
          <Button
            onClick={() => supabase.auth.signOut()}
            variant="outline"
            className="hover:bg-destructive hover:text-destructive-foreground"
          >
            Sign Out
          </Button>
        </div>
        <ErrorBoundary>
          <TodoList />
        </ErrorBoundary>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}

export default App
