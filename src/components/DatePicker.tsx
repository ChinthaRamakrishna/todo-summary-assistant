import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onSelect: (date: Date | undefined) => void
  className?: string
  fromDate?: Date
  toDate?: Date
  placeholder?: string
}

export function DatePicker({ 
  date, 
  onSelect, 
  className,
  fromDate = new Date(), // Default to today
  toDate,
  placeholder = "Set due date"
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MM/dd/yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          initialFocus
          fromDate={fromDate}
          toDate={toDate}
          disabled={(date) => {
            // Disable dates before today
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const currentDate = new Date(date)
            currentDate.setHours(0, 0, 0, 0)
            return currentDate < today
          }}
        />
      </PopoverContent>
    </Popover>
  )
} 