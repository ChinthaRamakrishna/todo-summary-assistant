import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from './DatePicker';
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Todo } from '@/lib/types';

interface TodoFormProps {
  onSubmit: (data: Omit<Todo, 'id' | 'created_at'>) => Promise<void>;
  isSubmitting: boolean;
}

export function TodoForm({ onSubmit, isSubmitting }: TodoFormProps) {
  const [newTodo, setNewTodo] = useState('');
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [dueDate, setDueDate] = useState<Date>();

  const handleSubmit = async () => {
    if (!newTodo.trim()) return;

    await onSubmit({
      text: newTodo.trim(),
      description: description.trim() || undefined,
      completed: false,
      priority,
      status: 'todo',
      due_date: dueDate?.toISOString(),
      user_id: '', // This will be set by the parent component
    });

    // Reset form
    setNewTodo('');
    setDescription('');
    setPriority('low');
    setDueDate(undefined);
    setShowDescription(false);
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex-1">
        <Input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !showDescription && handleSubmit()}
          placeholder="What needs to be done?"
          className="text-lg py-6 w-full"
        />
      </div>
      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
            <SelectTrigger className="w-28">
              <SelectValue className="text-sm" placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem className='cursor-pointer text-sm' value="low">Low</SelectItem>
              <SelectItem className='cursor-pointer text-sm' value="medium">Medium</SelectItem>
              <SelectItem className='cursor-pointer text-sm' value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <DatePicker 
            date={dueDate} 
            onSelect={setDueDate}
            className="w-[180px]"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDescription(!showDescription)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showDescription ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Details
              </>
            )}
          </Button>
        </div>
        <Button 
          size="lg" 
          onClick={handleSubmit} 
          className="px-6"
          variant="outline"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Task'}
        </Button>
      </div>
      {showDescription && (
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a more detailed description..."
          className="min-h-[100px]"
        />
      )}
    </div>
  );
} 