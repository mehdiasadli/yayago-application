'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, Clock, XCircle, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
      variant: 'default' as const,
      icon: ShieldAlert,
      title: 'Verification Required',
      description: 'To book a car, you need to verify your identity. This helps keep our community safe.',
      actionText: 'Start Verification',
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
    },
    PENDING: {
      variant: 'default' as const,
      icon: Clock,
      title: 'Verification Pending',
      description: 'Your documents are being reviewed. This usually takes 1-2 business days.',
      actionText: null,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
    },
    REJECTED: {
      variant: 'destructive' as const,
      icon: XCircle,
      title: 'Verification Rejected',
      description: rejectionReason || 'Your verification was not approved. Please try again with clear photos.',
      actionText: 'Try Again',
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
    },
    EXPIRED: {
      variant: 'default' as const,
      icon: AlertCircle,
      title: 'Verification Expired',
      description: 'Your verification has expired. Please submit new documents to continue booking.',
      actionText: 'Renew Verification',
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
    },
  };

  const config = bannerConfig[status];
  const Icon = config.icon;

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center justify-between p-3 rounded-lg border',
          config.bgColor,
          className
        )}
      >
        <div className='flex items-center gap-2'>
          <Icon className={cn('size-4', config.iconColor)} />
          <span className='text-sm font-medium'>{config.title}</span>
        </div>
        {config.actionText && (
          <Button size='sm' variant='outline' onClick={openModal}>
            {config.actionText}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Alert className={cn(config.bgColor, className)}>
      <Icon className={cn('size-5', config.iconColor)} />
      <AlertTitle className='font-semibold'>{config.title}</AlertTitle>
      <AlertDescription className='mt-1'>
        <p className='text-sm'>{config.description}</p>
        {config.actionText && (
          <Button
            variant='outline'
            size='sm'
            className='mt-3'
            onClick={openModal}
          >
            {config.actionText}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

export default VerificationBanner;

