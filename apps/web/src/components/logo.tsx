import { cn } from '@/lib/utils';
import Image from 'next/image';

export const Logo = (props: Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>) => {
  return (
    <Image
      src='/logos/icon-rounded-brand.svg'
      width={100}
      height={100}
      {...props}
      className={cn('size-10', props.className)}
      alt='YayaGO Logo'
    />
  );
};
