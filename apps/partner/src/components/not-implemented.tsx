import { cn } from '@/lib/utils';

interface NotImplementedProps {
  title?: string;
  description?: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function NotImplemented({
  title = 'Not implemented yet',
  description = 'This page has not been implemented yet. Please check back later.',
  className,
  titleClassName,
  descriptionClassName,
}: NotImplementedProps) {
  return (
    <div className={cn('flex flex-col justify-center mt-8', className)}>
      <h1 className={cn('text-2xl font-bold', titleClassName)}>{title}</h1>
      <p className={cn('text-sm text-muted-foreground', descriptionClassName)}>{description}</p>
    </div>
  );
}
