export interface Todo {
  id: string;
  text: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  due_date?: string;
  created_at: string;
  user_id: string;
}

export type Database = {
  public: {
    Tables: {
      todos: {
        Row: Todo
        Insert: Omit<Todo, 'id' | 'created_at'>
        Update: Partial<Omit<Todo, 'id' | 'created_at'>>
      }
    }
  }
} 