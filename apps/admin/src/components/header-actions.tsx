import { LucideIcon } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import React from 'react';
import Link from 'next/link';

interface HeaderActionButton extends React.ComponentProps<typeof Button> {
  label: string;
  Icon?: LucideIcon;
  iconClassName?: string;
  href?: string;
}

interface HeaderActionsProps extends React.ComponentProps<'div'> {
  buttons?: HeaderActionButton[];
}

export default function HeaderActions({ buttons, className, ...props }: HeaderActionsProps) {
  if (!buttons || buttons.length === 0) return null;

  return (
    <div {...props} className={cn('flex items-center gap-2', className)}>
      {buttons.map((button) => (
        <React.Fragment key={button.label}>
          {button.href ? (
            <Button {...button} asChild>
              <Link href={button.href}>
                {button.Icon && <button.Icon className={cn('size-4', button.iconClassName)} />}
                {button.label}
              </Link>
            </Button>
          ) : (
            <Button {...button}>
              {button.Icon && <button.Icon className={cn('size-4', button.iconClassName)} />}
              {button.label}
            </Button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
