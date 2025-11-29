'use client';

import { useMemo, useState, useTransition } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Loader2Icon } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ActionButtonProps<T> extends Omit<React.ComponentProps<typeof Button>, 'onClick' | 'onError'> {
  onAction: () => Promise<{
    data?: T;
    message?: string;
    error?: string;
  }>;

  defaultErrorMessage?: string;
  defaultSuccessMessage?: string;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  onStart?: () => void;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  onFinished?: (data?: T, error?: string) => void;

  dialog?: {
    title?: string;
    description?: string;
    content?: React.ReactNode;
    cancelLabel?: React.ReactNode;
    confirmLabel?: React.ReactNode;
  };
}

export function ActionButton<T>({
  onAction,
  children,
  defaultErrorMessage,
  defaultSuccessMessage,
  showErrorToast = true,
  showSuccessToast = true,
  onStart,
  onSuccess,
  onError,
  onFinished,
  dialog,
  ...props
}: ActionButtonProps<T>) {
  const [open, setOpen] = useState(false);
  const [isloading, startTransition] = useTransition();

  const handleClick = async () => {
    if (!dialog) {
      handleConfirm();
    } else {
      setOpen(true);
    }
  };

  const handleConfirm = () => {
    startTransition(async () => {
      onStart?.();

      const data = await onAction();

      if (data.error && typeof data.error === 'string') {
        if (showErrorToast) toast.error(data.error || defaultErrorMessage || 'An unexpected error occurred');
        onError?.(data.error || defaultErrorMessage || 'An unexpected error occurred');
      } else if (data.data !== undefined) {
        if (showSuccessToast) toast.success(data.message || defaultSuccessMessage || 'Completed successfully');
        onSuccess?.(data.data);
      }

      onFinished?.(data.data, data.error);
    });
  };

  const isOpen = useMemo(() => {
    if (!dialog) return false;
    return isloading || open;
  }, [dialog, isloading, open]);

  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button onClick={handleClick} disabled={isloading} {...props}>
          {isloading ? <Loader2Icon className='w-4 h-4 animate-spin' /> : children}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          {dialog?.title && <AlertDialogTitle>{dialog.title}</AlertDialogTitle>}
          {dialog?.description && <AlertDialogDescription>{dialog.description}</AlertDialogDescription>}
        </AlertDialogHeader>
        {dialog?.content ?? null}
        <AlertDialogFooter>
          <AlertDialogCancel>{dialog?.cancelLabel ?? 'Cancel'}</AlertDialogCancel>
          <AlertDialogAction disabled={isloading} onClick={handleConfirm}>
            {isloading ? <Loader2Icon className='w-4 h-4 animate-spin' /> : (dialog?.confirmLabel ?? 'Confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
