import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Todo } from '@/lib/types';
import { useState, useEffect } from 'react';

const priorityStyles = {
  high: "bg-red-50/50 hover:bg-red-50",
  medium: "bg-yellow-50/50 hover:bg-yellow-50",
  low: "bg-green-50/50 hover:bg-green-50",
} as const;

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function TodoItem({ 
  todo, 
  onToggleComplete, 
  onDelete,
  isUpdating,
  isDeleting
}: TodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(!!todo.description);

  // Update expanded state when todo changes
  useEffect(() => {
    setIsExpanded(!!todo.description);
  }, [todo.description]);

  return (
    <Card 
      className={cn(
        "transition-all",
        !todo.completed && priorityStyles[todo.priority],
        todo.completed && "bg-gray-50/50 hover:bg-gray-50"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => onToggleComplete(todo.id, todo.completed)}
            className="h-5 w-5"
            disabled={isUpdating}
            aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
          />
          <div className="flex-1">
            <span className={`text-lg ${
              todo.completed 
                ? 'line-through text-gray-400' 
                : 'text-gray-700'
            }`}>
              {todo.text}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {todo.description && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-500 hover:text-gray-700"
                aria-label={`${isExpanded ? 'Hide' : 'Show'} description`}
                aria-expanded={isExpanded}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-gray-400">
                Created {new Date(todo.created_at).toLocaleDateString()}
              </span>
              {todo.due_date && (
                <span className="text-xs text-gray-400">
                  Due {new Date(todo.due_date).toLocaleDateString()}
                </span>
              )}
            </div>
            <Button 
              variant="destructive" 
              size="icon"
              onClick={() => onDelete(todo.id)}
              className="hover:bg-gray-100 hover:text-gray-700 transition-colors"
              disabled={isDeleting}
              aria-label={`Delete "${todo.text}"`}
            >
              {isDeleting ? (
                <span className="h-4 w-4">...</span>
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        {todo.description && isExpanded && (
          <div className="pl-8 pr-4 py-2 mt-2 text-gray-600 text-sm border-t">
            {todo.description}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 