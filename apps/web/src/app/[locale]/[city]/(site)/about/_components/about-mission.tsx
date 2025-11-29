import { cn } from '@/lib/utils';
import { Eye, Heart, Target, type LucideIcon } from 'lucide-react';

export function AboutMission() {
  return (
    <div className='grid md:grid-cols-3'>
      <FeatureBox
        title='Our Mission'
        description='To democratize access to mobility by creating a seamless, secure, and transparent marketplace for car rentals.'
        icon={Target}
      />
      <FeatureBox
        title='Our Vision'
        description='To become the region’s most trusted platform for vehicle sharing, fostering a community of verified hosts and happy drivers.'
        icon={Eye}
      />
      <FeatureBox
        title='Our Values'
        description='We believe in transparency, reliability, and putting the customer first in every interaction we facilitate.'
        icon={Heart}
        className='border-b-0 md:border-r-0'
      />
    </div>
  );
}

type FeatureBoxProps = React.ComponentProps<'div'> & {
  icon: LucideIcon;
  title: string;
  description: string;
};

function FeatureBox({ title, description, className, icon: Icon, ...props }: FeatureBoxProps) {
  return (
    <div className={cn('flex flex-col justify-between border-b md:border-r md:border-b-0', className)} {...props}>
      <div className='flex items-center gap-x-3 border-b bg-secondary/50 p-4 dark:bg-secondary/20'>
        <Icon className='size-5 text-muted-foreground' strokeWidth={1} />
        <h2 className='font-heading font-medium text-lg tracking-wider'>{title}</h2>
      </div>
      <div className='flex grow items-center p-4 py-8 text-muted-foreground text-sm leading-relaxed'>{description}</div>
    </div>
  );
}
