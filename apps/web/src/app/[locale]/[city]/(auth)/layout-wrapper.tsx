'use client';

import { ChevronLeftIcon } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { FloatingPaths } from '@/components/floating-paths';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { Link } from '@/lib/navigation/navigation-client';

export default function AuthLayoutWrapper({ children }: React.PropsWithChildren) {
  return (
    <main className='relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2'>
      <div className='relative hidden h-full flex-col border-r bg-secondary p-10 lg:flex dark:bg-secondary/20'>
        <div className='absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background' />
        <Logo className='mr-auto' />

        <div className='z-10 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-xl'>
              &ldquo;This Platform has helped me to save time and serve my clients faster than ever before.&rdquo;
            </p>
            <footer className='font-mono font-semibold text-sm'>~ Ali Hassan</footer>
          </blockquote>
        </div>
        <div className='absolute inset-0'>
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>
      <div className='relative flex min-h-screen flex-col justify-center p-4'>
        <div aria-hidden className='-z-10 absolute inset-0 isolate opacity-60 contain-strict'>
          <div className='-translate-y-87.5 absolute top-0 right-0 h-320 w-140 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)]' />
          <div className='absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] [translate:5%_-50%]' />
          <div className='-translate-y-87.5 absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]' />
        </div>
        <div className='absolute top-7 left-5 right-5 flex items-center justify-between gap-3'>
          <Button asChild className='' variant='ghost'>
            <Link href='/'>
              <ChevronLeftIcon />
              Home
            </Link>
          </Button>
          <AnimatedThemeToggler />
        </div>
        <div className='mx-auto space-y-4 sm:w-sm'>{children}</div>
      </div>
    </main>
  );
}
