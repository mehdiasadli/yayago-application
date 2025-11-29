'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { orpc } from '@/utils/orpc';
import { toast } from 'sonner';
import {
  ImageIcon,
  Video,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  Star,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MediaItem {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  status: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  isPrimary: boolean;
  url: string;
  alt: string | null;
  width: number;
  height: number;
  displayOrder: number;
}

interface MediaVerificationCardProps {
  media: MediaItem[];
  listingSlug: string;
}

function getVerificationBadgeVariant(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'REJECTED':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export default function MediaVerificationCard({ media, listingSlug }: MediaVerificationCardProps) {
  const queryClient = useQueryClient();
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  const { mutateAsync: updateMediaVerification, isPending } = useMutation(
    orpc.listings.updateMediaVerification.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['listings'] });
        setSelectedMedia(null);
        setActionType(null);
        setRejectionReason('');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update media verification');
      },
    })
  );

  const handleAction = async () => {
    if (!selectedMedia || !actionType) return;

    await updateMediaVerification({
      mediaId: selectedMedia.id,
      verificationStatus: actionType === 'approve' ? 'APPROVED' : 'REJECTED',
      rejectionReason: actionType === 'reject' ? rejectionReason : undefined,
    });

    toast.success(`Media ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
  };

  const pendingCount = media.filter((m) => m.verificationStatus === 'PENDING').length;
  const approvedCount = media.filter((m) => m.verificationStatus === 'APPROVED').length;
  const rejectedCount = media.filter((m) => m.verificationStatus === 'REJECTED').length;

  const MIN_APPROVED_IMAGES = 4;
  const canApproveListing = approvedCount >= MIN_APPROVED_IMAGES;

  return (
    <>
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2 text-base'>
                <ImageIcon className='size-4' />
                Media Verification ({media.length})
              </CardTitle>
              <CardDescription>Review and verify listing images</CardDescription>
            </div>
            <div className='flex gap-2'>
              <Badge variant='warning' className='text-xs'>
                <Clock className='size-3 mr-1' />
                {pendingCount} Pending
              </Badge>
              <Badge variant='success' className='text-xs'>
                <CheckCircle className='size-3 mr-1' />
                {approvedCount} Approved
              </Badge>
              {rejectedCount > 0 && (
                <Badge variant='destructive' className='text-xs'>
                  <XCircle className='size-3 mr-1' />
                  {rejectedCount} Rejected
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Minimum images warning */}
          {!canApproveListing && (
            <Alert variant='warning'>
              <AlertTriangle className='size-4' />
              <AlertDescription>
                At least {MIN_APPROVED_IMAGES} images must be approved before this listing can be verified.
                Currently {approvedCount} approved.
              </AlertDescription>
            </Alert>
          )}

          {/* Media Grid */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {media.map((m) => (
              <div
                key={m.id}
                className='relative group rounded-lg overflow-hidden bg-muted border cursor-pointer'
                onClick={() => setPreviewMedia(m)}
              >
                {/* Image/Video */}
                <div className='aspect-video'>
                  {m.type === 'IMAGE' ? (
                    <img src={m.url} alt={m.alt || ''} className='w-full h-full object-cover' />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <Video className='size-8 text-muted-foreground' />
                    </div>
                  )}
                </div>

                {/* Status overlay */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />

                {/* Top badges */}
                <div className='absolute top-2 left-2 right-2 flex justify-between'>
                  <Badge variant={getVerificationBadgeVariant(m.verificationStatus)} className='text-xs'>
                    {m.verificationStatus === 'PENDING' && <Clock className='size-3 mr-1' />}
                    {m.verificationStatus === 'APPROVED' && <CheckCircle className='size-3 mr-1' />}
                    {m.verificationStatus === 'REJECTED' && <XCircle className='size-3 mr-1' />}
                    {m.verificationStatus}
                  </Badge>
                  {m.isPrimary && (
                    <Badge variant='warning' className='text-xs'>
                      <Star className='size-3 mr-1 fill-current' />
                      Primary
                    </Badge>
                  )}
                </div>

                {/* Action buttons (shown on hover) */}
                {m.verificationStatus === 'PENDING' && (
                  <div className='absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <Button
                      size='sm'
                      className='flex-1 h-8'
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMedia(m);
                        setActionType('approve');
                      }}
                    >
                      <CheckCircle className='size-3 mr-1' />
                      Approve
                    </Button>
                    <Button
                      size='sm'
                      variant='destructive'
                      className='flex-1 h-8'
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMedia(m);
                        setActionType('reject');
                      }}
                    >
                      <XCircle className='size-3 mr-1' />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {media.length === 0 && (
            <div className='text-center py-8 text-muted-foreground'>
              <ImageIcon className='size-12 mx-auto mb-2 opacity-30' />
              <p>No media uploaded for this listing</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewMedia !== null} onOpenChange={(open) => !open && setPreviewMedia(null)}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Media Preview</DialogTitle>
          </DialogHeader>
          {previewMedia && (
            <div className='space-y-4'>
              <div className='aspect-video bg-muted rounded-lg overflow-hidden'>
                {previewMedia.type === 'IMAGE' ? (
                  <img
                    src={previewMedia.url}
                    alt={previewMedia.alt || ''}
                    className='w-full h-full object-contain'
                  />
                ) : (
                  <video src={previewMedia.url} controls className='w-full h-full' />
                )}
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex gap-2'>
                  <Badge variant={getVerificationBadgeVariant(previewMedia.verificationStatus)}>
                    {previewMedia.verificationStatus}
                  </Badge>
                  {previewMedia.isPrimary && <Badge variant='warning'>Primary</Badge>}
                </div>
                <div className='text-sm text-muted-foreground'>
                  {previewMedia.width} × {previewMedia.height}
                </div>
              </div>
              {previewMedia.verificationStatus === 'PENDING' && (
                <div className='flex gap-2'>
                  <Button
                    className='flex-1'
                    onClick={() => {
                      setSelectedMedia(previewMedia);
                      setActionType('approve');
                      setPreviewMedia(null);
                    }}
                  >
                    <CheckCircle className='size-4 mr-2' />
                    Approve
                  </Button>
                  <Button
                    variant='destructive'
                    className='flex-1'
                    onClick={() => {
                      setSelectedMedia(previewMedia);
                      setActionType('reject');
                      setPreviewMedia(null);
                    }}
                  >
                    <XCircle className='size-4 mr-2' />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={selectedMedia !== null && actionType !== null} onOpenChange={(open) => {
        if (!open) {
          setSelectedMedia(null);
          setActionType(null);
          setRejectionReason('');
        }
      }}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              {actionType === 'approve' ? (
                <>
                  <CheckCircle className='size-5 text-green-500' />
                  Approve Media
                </>
              ) : (
                <>
                  <XCircle className='size-5 text-red-500' />
                  Reject Media
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'This media will be visible to public users on the listing.'
                : 'This media will be hidden. Please provide a reason.'}
            </DialogDescription>
          </DialogHeader>

          <div className='py-4'>
            {actionType === 'reject' && (
              <div className='space-y-2'>
                <Label htmlFor='reason'>Rejection Reason</Label>
                <Textarea
                  id='reason'
                  placeholder='Explain why this media is being rejected...'
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {actionType === 'approve' && selectedMedia && (
              <div className='aspect-video bg-muted rounded-lg overflow-hidden'>
                <img
                  src={selectedMedia.url}
                  alt=''
                  className='w-full h-full object-contain'
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setSelectedMedia(null);
                setActionType(null);
                setRejectionReason('');
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={handleAction}
              disabled={isPending || (actionType === 'reject' && !rejectionReason.trim())}
            >
              {isPending ? (
                <>
                  <Loader2 className='size-4 animate-spin mr-2' />
                  Processing...
                </>
              ) : actionType === 'approve' ? (
                <>
                  <CheckCircle className='size-4 mr-2' />
                  Approve
                </>
              ) : (
                <>
                  <XCircle className='size-4 mr-2' />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

