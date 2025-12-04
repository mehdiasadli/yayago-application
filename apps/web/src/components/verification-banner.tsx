'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Clock, XCircle, ShieldAlert, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { orpc } from '@/utils/orpc';
import { authClient } from '@/lib/auth-client';
import { useVerification } from '@/contexts/verification-context';

interface VerificationBannerProps {
  className?: string;
  compact?: boolean;
}

export function VerificationBanner({ className, compact = false }: VerificationBannerProps) {
  const { data: session } = authClient.useSession();
  const { openModal } = useVerification();

  const { data: verificationStatus, isLoading } = useQuery({
    ...orpc.users.getVerificationStatus.queryOptions(),
    enabled: !!session?.user,
  });

  // Don't show anything if not logged in, still loading, or already approved
  if (!session?.user || isLoading || !verificationStatus) {
    return null;
  }

  const { status, rejectionReason } = verificationStatus;

  // Don't show banner if approved
  if (status === 'APPROVED') {
    return null;
  }

  const bannerConfig = {
    NOT_SUBMITTED: {
      icon: ShieldAlert,
      title: 'Complete Your Verification',
      description: 'Verify your identity to unlock car bookings and help keep our community safe.',
      actionText: 'Start Verification',
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-500',
      gradientFrom: 'from-blue-500/10',
      gradientVia: 'via-cyan-500/5',
      gradientTo: 'to-transparent',
      borderColor: 'border-blue-500/20',
      titleColor: 'text-blue-700 dark:text-blue-300',
      buttonGradient: 'from-blue-500 to-cyan-500',
      accentOrb: 'bg-blue-500/20',
      secondaryOrb: 'bg-cyan-500/10',
    },
    PENDING: {
      icon: Clock,
      title: 'Verification In Progress',
      description: 'Your documents are being reviewed. This usually takes 1-2 business days.',
      actionText: null,
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-500',
      gradientFrom: 'from-amber-500/10',
      gradientVia: 'via-yellow-500/5',
      gradientTo: 'to-transparent',
      borderColor: 'border-amber-500/20',
      titleColor: 'text-amber-700 dark:text-amber-300',
      buttonGradient: '',
      accentOrb: 'bg-amber-500/20',
      secondaryOrb: 'bg-yellow-500/10',
    },
    REJECTED: {
      icon: XCircle,
      title: 'Verification Unsuccessful',
      description: rejectionReason || 'Your verification was not approved. Please try again with clear photos.',
      actionText: 'Try Again',
      iconBg: 'bg-red-500/15',
      iconColor: 'text-red-500',
      gradientFrom: 'from-red-500/10',
      gradientVia: 'via-rose-500/5',
      gradientTo: 'to-transparent',
      borderColor: 'border-red-500/20',
      titleColor: 'text-red-700 dark:text-red-300',
      buttonGradient: 'from-red-500 to-rose-500',
      accentOrb: 'bg-red-500/20',
      secondaryOrb: 'bg-rose-500/10',
    },
    EXPIRED: {
      icon: AlertCircle,
      title: 'Verification Expired',
      description: 'Your verification has expired. Please submit new documents to continue booking.',
      actionText: 'Renew Verification',
      iconBg: 'bg-orange-500/15',
      iconColor: 'text-orange-500',
      gradientFrom: 'from-orange-500/10',
      gradientVia: 'via-amber-500/5',
      gradientTo: 'to-transparent',
      borderColor: 'border-orange-500/20',
      titleColor: 'text-orange-700 dark:text-orange-300',
      buttonGradient: 'from-orange-500 to-amber-500',
      accentOrb: 'bg-orange-500/20',
      secondaryOrb: 'bg-amber-500/10',
    },
  };

  const config = bannerConfig[status];
  const Icon = config.icon;

  if (compact) {
    return (
      <div
        className={cn(
          'relative overflow-hidden flex items-center justify-between p-3 rounded-xl border bg-card',
          config.borderColor,
          className
        )}
      >
        {/* Subtle gradient background */}
        <div
          className={cn(
            'absolute inset-0 bg-linear-to-r opacity-50',
            config.gradientFrom,
            config.gradientVia,
            config.gradientTo
          )}
        />

        <div className='relative flex items-center gap-3'>
          <div className={cn('p-1.5 rounded-lg', config.iconBg)}>
            <Icon className={cn('size-4', config.iconColor)} />
          </div>
          <span className={cn('text-sm font-medium', config.titleColor)}>{config.title}</span>
        </div>
        {config.actionText && (
          <Button
            size='sm'
            onClick={openModal}
            className={cn(
              'relative gap-1.5 rounded-lg bg-linear-to-r text-white border-0 shadow-sm hover:opacity-90',
              config.buttonGradient
            )}
          >
            {config.actionText}
            <ChevronRight className='size-3.5' />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden rounded-2xl border bg-card shadow-sm', config.borderColor, className)}>
      {/* Background effects */}
      <div className='absolute inset-0 overflow-hidden'>
        {/* Base gradient */}
        <div
          className={cn('absolute inset-0 bg-linear-to-br', config.gradientFrom, config.gradientVia, config.gradientTo)}
        />

        {/* Floating orbs */}
        <div
          className={cn('absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-60', config.accentOrb)}
        />
        <div
          className={cn('absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-2xl opacity-40', config.secondaryOrb)}
        />

        {/* Subtle pattern */}
        <div
          className='absolute inset-0 opacity-[0.02]'
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      {/* Content */}
      <div className='relative px-5 py-4 sm:px-6 sm:py-5'>
        <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
          {/* Icon and text */}
          <div className='flex items-start sm:items-center gap-4 flex-1'>
            <div className={cn('p-3 rounded-xl shrink-0', config.iconBg)}>
              <Icon className={cn('size-6', config.iconColor)} />
            </div>
            <div className='space-y-1'>
              <h3 className={cn('font-semibold text-base', config.titleColor)}>{config.title}</h3>
              <p className='text-sm text-muted-foreground leading-relaxed'>{config.description}</p>
            </div>
          </div>

          {/* Action button */}
          {config.actionText && (
            <Button
              onClick={openModal}
              className={cn(
                'gap-2 rounded-xl bg-linear-to-r text-white border-0 shadow-lg hover:opacity-90 transition-opacity shrink-0 h-11 px-5',
                config.buttonGradient,
                `shadow-${config.iconColor.replace('text-', '')}/25`
              )}
            >
              <Sparkles className='size-4' />
              {config.actionText}
              <ChevronRight className='size-4' />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerificationBanner;
