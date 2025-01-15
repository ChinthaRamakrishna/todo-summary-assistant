import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

export type SortBy = 'latest' | 'due-date' | 'priority';

interface TodoSortProps {
  value: SortBy;
  onChange: (value: SortBy) => void;
}

export function TodoSort({ value, onChange }: TodoSortProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-medium text-gray-700">Your Tasks</h2>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem className="cursor-pointer" value="latest">Latest First</SelectItem>
          <SelectItem className="cursor-pointer" value="due-date">Due Date</SelectItem>
          <SelectItem className="cursor-pointer" value="priority">Priority</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 