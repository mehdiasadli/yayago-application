import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  titleContainerClassName?: string;
  childrenContainerClassName?: string;
}

export default function PageHeader({
  title,
  description,
  children,
  className,
  titleClassName,
  descriptionClassName,
  titleContainerClassName,
  childrenContainerClassName,
}: PageHeaderProps) {
  return (
    <header className={cn('flex items-center justify-between gap-2', className)}>
      <div className={cn('flex flex-col gap-1', titleContainerClassName)}>
        <h1 className={cn('text-2xl font-bold', titleClassName)}>{title}</h1>
        {description && <p className={cn('text-sm text-muted-foreground', descriptionClassName)}>{description}</p>}
      </div>
      <div className={cn('ml-auto', childrenContainerClassName)}>{children}</div>
    </header>
  );
}
