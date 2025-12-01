'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'approve' | 'reject';
  onConfirm: (status: 'APPROVED' | 'REJECTED', reason?: string) => Promise<void>;
  isLoading: boolean;
  listingTitle: string;
}

export default function VerificationDialog({
  open,
  onOpenChange,
  type,
  onConfirm,
  isLoading,
  listingTitle,
}: VerificationDialogProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = async () => {
    await onConfirm(type === 'approve' ? 'APPROVED' : 'REJECTED', type === 'reject' ? reason : undefined);
    setReason('');
  };

  const isApprove = type === 'approve';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {isApprove ? (
              <>
                <CheckCircle className='size-5 text-green-500' />
                Approve Listing
              </>
            ) : (
              <>
                <XCircle className='size-5 text-red-500' />
                Reject Listing
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isApprove
              ? `Are you sure you want to approve "${listingTitle}"? This will make the listing visible to renters.`
              : `Are you sure you want to reject "${listingTitle}"? The organization will need to update and resubmit.`}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {isApprove ? (
            <Alert className='bg-green-500/10 border-green-500/30'>
              <CheckCircle className='size-4 text-green-500' />
              <AlertDescription>
                After approval, the listing status will change to <strong>Available</strong> and will appear in search
                results for potential renters.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert variant='destructive'>
                <AlertTriangle className='size-4' />
                <AlertDescription>
                  The listing will be marked as rejected. Please provide a reason so the organization knows what to fix.
                </AlertDescription>
              </Alert>

              <div className='space-y-2'>
                <Label htmlFor='reason'>Rejection Reason *</Label>
                <Textarea
                  id='reason'
                  placeholder='Explain why this listing is being rejected and what needs to be fixed...'
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className='resize-none'
                />
                <p className='text-xs text-muted-foreground'>
                  This message will be visible to the organization owner.
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={isApprove ? 'primary' : 'destructive'}
            onClick={handleConfirm}
            disabled={isLoading || (!isApprove && !reason.trim())}
          >
            {isLoading ? (
              <>
                <Loader2 className='size-4 animate-spin' />
                Processing...
              </>
            ) : isApprove ? (
              <>
                <CheckCircle className='size-4' />
                Approve
              </>
            ) : (
              <>
                <XCircle className='size-4' />
                Reject
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

