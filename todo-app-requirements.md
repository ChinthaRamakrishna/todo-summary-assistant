# Todo Application Technical Requirements

## 1. System Overview
The application will be a modern, responsive todo list manager that allows users to create, manage, and organize their tasks efficiently.

## 2. Technical Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: 
  - React's built-in useState and useContext for UI state
  - TanStack Query for server state
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Form Handling**: React Hook Form with Zod validation
- **Testing**: Jest and React Testing Library
- **Build Tool**: Vite

### Backend & Infrastructure
- **Backend Service**: Supabase
  - PostgreSQL Database
  - Auto-generated RESTful and GraphQL APIs
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Built-in Authentication
  - Storage for attachments
- **Deployment**: Vercel (frontend)
- **CI/CD**: GitHub Actions
- **Version Control**: Git with GitHub

### Project Setup
```bash
# Create new Vite project with React + TypeScript
npm create vite@latest todo-app -- --template react-ts

# Install core dependencies
npm install @supabase/supabase-js @tanstack/react-query @hookform/resolvers/zod zod react-hook-form
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install -D tailwindcss postcss autoprefixer @types/node
```

### Base Configuration
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from './types' // Generated types from Supabase

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```
```typescript
// src/types/database.types.ts
export type Todo = {
  id: string
  title: string
  completed: boolean
  user_id: string
  created_at: string
}

export type TodoList = {
  id: string
  name: string
  todos: Todo[]
  user_id: string
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      todos: {
        Row: Todo
        Insert: Omit<Todo, 'id' | 'created_at'>
        Update: Partial<Omit<Todo, 'id' | 'created_at'>>
      }
      lists: {
        Row: TodoList
        Insert: Omit<TodoList, 'id' | 'created_at'>
        Update: Partial<Omit<TodoList, 'id' | 'created_at'>>
      }
    }
  }
}
```

### Common Hooks and Utilities

```typescript
// src/hooks/useTodos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Todo } from '../types/database.types'

export function useTodos(listId: string) {
  const queryClient = useQueryClient()

  const { data: todos, isLoading } = useQuery({
    queryKey: ['todos', listId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('list_id', listId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })

  const addTodo = useMutation({
    mutationFn: async (newTodo: Omit<Todo, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('todos')
        .insert(newTodo)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', listId] })
    },
  })

  return {
    todos,
    isLoading,
    addTodo,
  }
}
```
### Component Structure Example
```typescript
// src/components/ui/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = ({ className, variant, size, ...props }: ButtonProps) => {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
}
```

### Real-time Updates Example
```typescript
// src/hooks/useRealtimeUpdates.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useRealtimeUpdates(listId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel(`todos:${listId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `list_id=eq.${listId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['todos', listId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [listId, queryClient])
}
```
### Form Validation Example
```typescript
// src/lib/schemas.ts
import { z } from 'zod'

export const todoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.date().optional(),
})

// src/components/TodoForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { todoSchema } from '../lib/schemas'
import type { TodoFormData } from '../types'

export function TodoForm({ onSubmit }: { onSubmit: (data: TodoFormData) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
      {/* Other fields */}
    </form>
  )
}
```
### Error Boundary
```typescript
// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || <h1>Sorry.. there was an error</h1>
    }

    return this.props.children
  }
}
```

## 3. Core Features

### User Management
- [x] User registration and authentication with Supabase
- [x] Session handling with refresh tokens
- [ ] Password reset functionality
- [ ] Profile management

### Todo Management
- [x] Create todos with text and description
- [x] Read todos with optimistic updates
- [x] Update todo completion status
- [x] Delete todos with optimistic updates
- [x] Priority levels (Low, Medium, High)
- [x] Due dates
- [x] Task status tracking (Complete/Incomplete)
- [x] Priority-based color coding
- [ ] Task categorization with labels/tags
- [ ] Bulk actions (delete, update status)
- [ ] Real-time updates for collaborative lists
- [ ] File attachments for todos
- [ ] Offline support with background sync
- [ ] Due date reminders

### Organization & UI/UX
- [x] Modern UI with shadcn components
- [x] Loading states with skeletons
- [x] Error boundaries for error handling
- [x] Toast notifications for user feedback
- [x] Sort by latest, due date, priority
- [x] Separate completed/incomplete tasks
- [x] Responsive design
- [ ] List creation and management
- [ ] Drag-and-drop reordering
- [ ] Advanced filtering options
- [ ] Search functionality
- [ ] Archive completed tasks
- [ ] Keyboard shortcuts
- [ ] Mobile-optimized interface

## 4. Technical Requirements

### Frontend Requirements
- [x] Responsive design (mobile-first approach)
- [x] Client-side form validation with Zod
- [x] Optimistic updates for better UX
- [x] Error boundary implementation
- [x] Loading states and skeletons
- [x] Proper error handling and user feedback
- [x] Toast notifications for actions
- [ ] Offline capability using Service Workers
- [ ] Accessibility compliance (WCAG 2.1)
- [ ] Real-time subscription management
- [ ] File upload progress indicators
- [ ] Virtual scrolling for large lists
- [ ] Service worker registration
- [ ] Progressive Web App (PWA) setup

### Security Requirements
- [x] Row Level Security (RLS) policies in Supabase
- [x] Protected API routes
- [x] Secure session management with Supabase Auth
- [x] SQL injection prevention (via Supabase)
- [x] API request validation
- [ ] Secure file upload handling
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Secure headers
- [ ] Regular security audits
- [ ] Content Security Policy (CSP)
- [ ] Two-factor authentication (2FA)

### Performance Requirements
- [x] Efficient bundle size with Vite
- [x] API caching with React Query
- [ ] Page load time < 2 seconds
- [ ] Time to Interactive < 3 seconds
- [ ] API response time < 200ms
- [ ] Lighthouse score > 90
- [ ] Image optimization
- [ ] Code splitting
- [ ] Lazy loading of components
- [ ] Memory leak prevention
- [ ] Database query optimization
- [ ] CDN integration

### Testing Requirements
- [ ] Unit tests coverage > 80%
- [ ] Integration tests for critical paths
- [ ] E2E tests for main user flows
- [ ] Performance testing
- [ ] Security testing
- [ ] Accessibility testing
- [ ] Mock service worker setup
- [ ] Snapshot testing
- [ ] Visual regression testing
- [ ] Load testing

## 5. Database Schema (Supabase)

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Todos table
create table todos (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  description text,
  completed boolean default false,
  priority text check (priority in ('low', 'medium', 'high')),
  due_date timestamptz,
  created_at timestamptz default now()
);

-- RLS Policies
alter table todos enable row level security;

-- Users can only view their own todos
create policy "Users can view their own todos"
  on todos for select
  using (auth.uid() = user_id);

-- Users can only insert their own todos
create policy "Users can create their own todos"
  on todos for insert
  with check (auth.uid() = user_id);

-- Users can only update their own todos
create policy "Users can update their own todos"
  on todos for update
  using (auth.uid() = user_id);

-- Users can only delete their own todos
create policy "Users can delete their own todos"
  on todos for delete
  using (auth.uid() = user_id);
```

## 6. Frontend Integration

### Supabase Client Setup
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Real-time Subscriptions
```typescript
// Subscribe to todos changes
supabase
  .channel('todos')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'todos',
      filter: `list_id=eq.${listId}`
    },
    (payload) => {
      // Handle real-time updates
    }
  )
  .subscribe()
```

## 7. Development Workflow
1. Set up Supabase project
2. Configure RLS policies
3. Test real-time functionality
4. Deploy frontend to Vercel
5. Manual QA review
6. Production deployment approval

## 8. Testing Requirements
- Unit tests coverage > 80%
- Integration tests for critical paths
- E2E tests for main user flows
- Performance testing
- Security testing
- Accessibility testing
- Mocking Supabase client in tests
- Testing real-time subscriptions
- Testing RLS policies

### 8.1 Frontend Testing
```typescript
// Example of testing a todo creation component
import { render, screen, fireEvent } from '@testing-library/react'
import { TodoCreate } from './TodoCreate'
import { supabase } from '../lib/supabase'

// Mock Supabase client
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        data: { id: 1, title: 'New Todo' },
        error: null
      }))
    }))
  }
}))

describe('TodoCreate', () => {
  it('creates a new todo', async () => {
    render(<TodoCreate />)
    
    const input = screen.getByPlaceholderText('Add a new todo')
    fireEvent.change(input, { target: { value: 'New Todo' } })
    fireEvent.click(screen.getByText('Add'))
    
    expect(supabase.from).toHaveBeenCalledWith('todos')
    // Add more assertions
  })
})
```

## 9. Documentation Requirements
- API documentation (OpenAPI)
- Setup instructions
- Deployment guide
- Contributing guidelines
- Architecture diagrams
- User documentation
- Supabase schema documentation
- RLS policies documentation
- Real-time subscription patterns

## 10. Monitoring and Analytics
- Supabase Dashboard monitoring
- Database performance metrics
- API usage tracking
- Storage usage monitoring
- Authentication analytics

## 11. Phased Implementation
1. Phase 1: Core CRUD functionality
2. Phase 2: Authentication and user management
3. Phase 3: Real-time features
4. Phase 4: Offline support
5. Phase 5: Advanced features (file attachments, drag-drop)

## 12. Performance Optimizations
- Implement virtual scrolling for large lists
- Use connection pooling for Supabase queries
- Implement proper cache invalidation strategies
- Add debouncing for real-time updates

## 13. Development Priorities
1. Set up CI/CD pipeline early
2. Implement core features with proper error handling
3. Add comprehensive test coverage incrementally
4. Focus on accessibility from the start
5. Regular security audits during development

## 14. File Structure
```
todo-app/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── datepicker.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   └── toast.tsx
│   │   ├── Auth.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── TodoForm.tsx
│   │   ├── TodoItem.tsx
│   │   ├── TodoList.tsx
│   │   └── TodoSort.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── supabase.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAddTodo.ts
│   │   ├── useDeleteTodo.ts
│   │   ├── useToggleTodo.ts
│   │   └── useTodos.ts
│   ├── assets/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── db/
│   └── schema.sql
├── public/
├── .env
├── .env.test
├── .gitignore
├── .postcssrc
├── components.json
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```