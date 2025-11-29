import { cn } from '@/lib/utils';

interface AuthHeaderProps {
  title: React.ReactNode;
  description: React.ReactNode;
  containerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function AuthHeader({
  title,
  description,
  containerClassName,
  titleClassName,
  descriptionClassName,
}: AuthHeaderProps) {
  return (
    <div className={cn('flex flex-col space-y-1', containerClassName)}>
      <h1 className={cn('font-bold text-2xl tracking-wide', titleClassName)}>{title}</h1>
      <p className={cn('text-base text-muted-foreground', descriptionClassName)}>{description}</p>
    </div>
  );
}
