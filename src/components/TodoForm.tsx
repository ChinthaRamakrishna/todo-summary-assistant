import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { DatePicker } from './DatePicker';
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Todo } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const todoFormSchema = z.object({
  text: z.string().min(1, 'Task text is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.date().optional(),
});

type TodoFormData = z.infer<typeof todoFormSchema>;

interface TodoFormProps {
  onSubmit: (data: Omit<Todo, 'id' | 'created_at'>) => Promise<void>;
  isSubmitting: boolean;
}

export function TodoForm({ onSubmit, isSubmitting }: TodoFormProps) {
  const [showDescription, setShowDescription] = useState(false);

  const form = useForm<TodoFormData>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      text: '',
      description: '',
      priority: 'low',
    },
  });

  const handleSubmit = async (data: TodoFormData) => {
    await onSubmit({
      text: data.text.trim(),
      description: data.description?.trim(),
      completed: false,
      priority: data.priority,
      status: 'todo',
      due_date: data.due_date?.toISOString(),
      user_id: '', // This will be set by the parent component
    });

    // Reset form
    form.reset();
    setShowDescription(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mb-6" data-testid="todo-form">
        <div className="flex-1">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    data-testid="todo-input"
                    placeholder="What needs to be done?"
                    className="text-lg py-6 w-full"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-28" data-testid="priority-select">
                      <SelectValue className="text-sm" placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem className='cursor-pointer text-sm' value="low" data-testid="priority-option-low">Low</SelectItem>
                      <SelectItem className='cursor-pointer text-sm' value="medium" data-testid="priority-option-medium">Medium</SelectItem>
                      <SelectItem className='cursor-pointer text-sm' value="high" data-testid="priority-option-high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <DatePicker 
                    date={field.value} 
                    onSelect={field.onChange}
                    className="w-[180px]"
                    data-testid="due-date-picker"
                  />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDescription(!showDescription)}
              className="text-gray-500 hover:text-gray-700"
              data-testid="toggle-description-button"
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
            type="submit"
            size="lg" 
            className="px-6"
            variant="outline"
            disabled={isSubmitting}
            data-testid="submit-button"
          >
            {isSubmitting ? 'Adding...' : 'Add Task'}
          </Button>
        </div>
        {showDescription && (
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    data-testid="description-textarea"
                    placeholder="Add a more detailed description..."
                    className="min-h-[100px]"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </form>
    </Form>
  );
} 