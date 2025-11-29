'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Matcher } from 'react-day-picker';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  defaultDate?: Date;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  min?: Date;
  max?: Date;
  disabled?: Matcher | Matcher[] | undefined;
  defaultMonth?: Date;
  buttonClassName?: string;
}

export default function DatePicker({
  defaultDate,
  date,
  setDate,
  placeholder = 'Pick a date range',
  min,
  max,
  disabled,
  defaultMonth,
  buttonClassName,
}: DatePickerProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleApply = () => {
    if (date) {
      setDate(date);
    }

    setIsPopoverOpen(false);
  };

  const handleReset = () => {
    setDate(defaultDate);
    setIsPopoverOpen(false);
  };

  const handleSelect = (selected: Date | undefined) => {
    if (min && selected && selected < min) {
      setDate(min);
      return;
    }

    if (max && selected && selected > max) {
      setDate(max);
      return;
    }

    setDate(selected);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button type='button' variant='outline' className={cn('w-[200px] rounded-full', buttonClassName)}>
          <CalendarIcon />
          {date ? format(date, 'LLL dd, y') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          autoFocus
          mode='single'
          defaultMonth={defaultMonth || date}
          showOutsideDays={false}
          selected={date}
          onSelect={handleSelect}
          disabled={disabled}
        />
        <div className='flex items-center justify-end gap-1.5 border-t border-border p-3'>
          <Button variant='outline' onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
