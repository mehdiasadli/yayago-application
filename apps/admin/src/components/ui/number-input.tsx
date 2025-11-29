'use client';

import { cn } from '@/lib/utils';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { Button, Group, Input, Label, NumberField } from 'react-aria-components';

interface NumberInputProps extends React.ComponentProps<typeof NumberField> {
  inputProps?: Omit<React.ComponentProps<typeof Input>, 'placeholder' | 'className'>;
  buttonClassName?: string;
  groupClassName?: string;
  iconClassName?: string;
  // usable input props
  inputClassName?: string;
  placeholder?: string;
}

export default function NumberInput({
  inputProps,
  buttonClassName,
  groupClassName,
  iconClassName,
  inputClassName,
  placeholder,
  ...props
}: NumberInputProps) {
  return (
    <NumberField {...props}>
      <Group
        className={cn(
          'relative inline-flex h-9 w-full items-center overflow-hidden rounded-md border border-input text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:opacity-50 data-focus-within:border-ring data-focus-within:ring-[3px] data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:border-destructive data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40',
          groupClassName
        )}
      >
        <Button
          slot='decrement'
          className={cn(
            '-ms-px flex aspect-square h-[inherit] items-center justify-center rounded-s-md border border-input bg-background text-sm text-muted-foreground/80 transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            buttonClassName
          )}
        >
          <MinusIcon size={16} aria-hidden='true' className={cn(iconClassName)} />
        </Button>
        <Input
          {...inputProps}
          className={cn('w-full grow px-3 py-2 text-center text-foreground tabular-nums', inputClassName)}
          placeholder={placeholder}
        />
        <Button
          slot='increment'
          className={cn(
            '-me-px flex aspect-square h-[inherit] items-center justify-center rounded-e-md border border-input bg-background text-sm text-muted-foreground/80 transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            buttonClassName
          )}
        >
          <PlusIcon size={16} aria-hidden='true' className={cn(iconClassName)} />
        </Button>
      </Group>
    </NumberField>
  );
}
