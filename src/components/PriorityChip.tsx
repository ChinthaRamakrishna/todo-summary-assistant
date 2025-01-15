import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Priority = 'low' | 'medium' | 'high';

interface PriorityChipProps {
  priority: Priority;
  className?: string;
}

const priorityVariants = {
  high: 'bg-red-100 hover:bg-red-100 text-red-700 border-transparent',
  medium: 'bg-yellow-100 hover:bg-yellow-100 text-yellow-700 border-transparent',
  low: 'bg-green-100 hover:bg-green-100 text-green-700 border-transparent'
} as const;

export function PriorityChip({ priority, className }: PriorityChipProps) {
  return (
    <Badge 
      variant="outline"
      className={cn(
        'capitalize',
        priorityVariants[priority],
        className
      )}
    >
      {priority}
    </Badge>
  );
} 