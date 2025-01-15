import { Skeleton } from "@/components/ui/skeleton";

export function TodoSkeleton() {
  // Array of 3 items for skeleton loading
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((index) => (
        <div 
          key={index}
          className="flex items-center gap-3 p-4 rounded-lg border border-gray-100"
        >
          <Skeleton className="h-5 w-5 rounded" /> {/* Checkbox */}
          <Skeleton className="h-6 flex-1" /> {/* Todo text */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" /> {/* Date */}
            <Skeleton className="h-9 w-16" /> {/* Delete button */}
          </div>
        </div>
      ))}
    </div>
  );
} 