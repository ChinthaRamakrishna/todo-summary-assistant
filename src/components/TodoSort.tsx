import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

export type SortBy = 'latest' | 'due-date' | 'priority';

interface TodoSortProps {
  value: SortBy;
  onChange: (value: SortBy) => void;
  testID?: string;
}

export function TodoSort({ value, onChange, testID = 'todo-sort' }: TodoSortProps) {
  return (
    <div className="flex items-center justify-between mb-4" data-testid={testID}>
      <h2 className="text-lg font-medium text-gray-700" data-testid={`${testID}-title`}>Your Tasks</h2>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]" data-testid={`${testID}-trigger`}>
          <ArrowUpDown className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem className="cursor-pointer" value="latest" data-testid={`${testID}-option-latest`}>Latest First</SelectItem>
          <SelectItem className="cursor-pointer" value="due-date" data-testid={`${testID}-option-due-date`}>Due Date</SelectItem>
          <SelectItem className="cursor-pointer" value="priority" data-testid={`${testID}-option-priority`}>Priority</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 