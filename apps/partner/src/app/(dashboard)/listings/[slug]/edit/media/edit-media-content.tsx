'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  ImageIcon,
  Video,
  Upload,
  X,
  Star,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Camera,
  Film,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { orpc } from '@/utils/orpc';
import type { FindOneListingOutputType } from '@yayago-app/validators';
import { formatEnumValue } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EditMediaContentProps {
  listing: FindOneListingOutputType;
}

interface NewMediaItem {
  file: File;
  url: string;
  type: 'IMAGE' | 'VIDEO';
  isPrimary: boolean;
  uploading?: boolean;
  uploaded?: boolean;
  error?: string;
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

export default function EditMediaContent({ listing }: EditMediaContentProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [newMediaItems, setNewMediaItems] = useState<NewMediaItem[]>([]);
  const [deleteMediaId, setDeleteMediaId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Add media mutation
  const { mutateAsync: addMedia } = useMutation(orpc.listings.addMedia.mutationOptions());

  // Delete media mutation
  const { mutate: deleteMedia, isPending: isDeleting } = useMutation(
    orpc.listings.deleteMedia.mutationOptions({
      onSuccess: () => {
        toast.success('Media deleted');
        queryClient.invalidateQueries({ queryKey: ['listings'] });
        setDeleteMediaId(null);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete media');
      },
    })
  );

  // Set primary mutation
  const { mutate: setPrimaryMedia, isPending: isSettingPrimary } = useMutation(
    orpc.listings.setPrimaryMedia.mutationOptions({
      onSuccess: () => {
        toast.success('Primary image updated');
        queryClient.invalidateQueries({ queryKey: ['listings'] });
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to set primary image');
      },
    })
  );

  // Handle new file drops
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newItems: NewMediaItem[] = acceptedFiles.map((file) => {
      const isVideo = file.type.startsWith('video/');
      return {
        file,
        url: URL.createObjectURL(file),
        type: isVideo ? 'VIDEO' : 'IMAGE',
        isPrimary: false,
      };
    });
    setNewMediaItems((prev) => [...prev, ...newItems]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'video/*': ['.mp4', '.mov', '.webm'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeNewItem = (index: number) => {
    setNewMediaItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload all new media
  const uploadNewMedia = async () => {
    if (newMediaItems.length === 0) return;

    setIsUploading(true);
    let uploaded = 0;

    try {
      for (const item of newMediaItems) {
        // Convert file to base64
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(item.file);
        });

        // Get image dimensions
        let width = 1920;
        let height = 1080;
        if (item.type === 'IMAGE') {
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              width = img.width;
              height = img.height;
              resolve();
            };
            img.onerror = () => {
              // Use default dimensions if image fails to load
              console.warn('Failed to load image for dimension reading, using defaults');
              resolve();
            };
            img.src = item.url;
          });
        }

        // Upload to server (will be PENDING verification)
        await addMedia({
          slug: listing.slug,
          media: {
            type: item.type,
            url: dataUrl,
            width,
            height,
            size: item.file.size,
            mimeType: item.file.type,
            isPrimary: false, // New uploads can't be primary until verified
          },
        });

        uploaded++;
        setUploadProgress(Math.round((uploaded / newMediaItems.length) * 100));
      }

      toast.success(`${uploaded} file(s) uploaded. They will be visible after admin verification.`);
      setNewMediaItems([]);
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload media');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const existingMedia = listing.media || [];
  const images = existingMedia.filter((m) => m.type === 'IMAGE');
  const videos = existingMedia.filter((m) => m.type === 'VIDEO');
  const pendingCount = existingMedia.filter((m) => m.verificationStatus === 'PENDING').length;
  const approvedCount = existingMedia.filter((m) => m.verificationStatus === 'APPROVED').length;

  return (
    <div className='space-y-6'>
      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Media Overview</CardTitle>
          <CardDescription>
            {existingMedia.length} media files ({images.length} images, {videos.length} videos)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex gap-4'>
            <Badge variant='success' className='text-sm'>
              <CheckCircle className='size-3 mr-1' />
              {approvedCount} Approved
            </Badge>
            {pendingCount > 0 && (
              <Badge variant='warning' className='text-sm'>
                <Clock className='size-3 mr-1' />
                {pendingCount} Pending Review
              </Badge>
            )}
          </div>
          {pendingCount > 0 && (
            <p className='text-sm text-muted-foreground mt-3'>
              Pending media will be reviewed by our team before being visible to renters.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Verification Notice */}
      <Alert>
        <AlertTriangle className='size-4' />
        <AlertTitle>Media Verification Required</AlertTitle>
        <AlertDescription>
          All new uploads require admin verification before they become visible. At least 4 approved images are needed
          for your listing to be approved.
        </AlertDescription>
      </Alert>

      {/* Existing Media */}
      {existingMedia.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Media</CardTitle>
            <CardDescription>
              Click on an image to set it as primary (only approved images can be primary)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {existingMedia.map((media) => (
                <div
                  key={media.id}
                  className={`relative group aspect-video rounded-xl overflow-hidden bg-muted border-2 ${
                    media.isPrimary ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'border-transparent'
                  }`}
                >
                  {media.type === 'IMAGE' ? (
                    <img src={media.url} alt={media.alt || ''} className='w-full h-full object-cover' />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center bg-muted'>
                      <Video className='size-10 text-muted-foreground' />
                    </div>
                  )}

                  {/* Status overlay */}
                  <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2'>
                    {media.type === 'IMAGE' && !media.isPrimary && media.verificationStatus === 'APPROVED' && (
                      <Button
                        size='sm'
                        variant='secondary'
                        onClick={() => setPrimaryMedia({ slug: listing.slug, mediaId: media.id })}
                        disabled={isSettingPrimary}
                        title='Set as primary'
                      >
                        <Star className='size-4' />
                      </Button>
                    )}
                    <Button size='sm' variant='destructive' onClick={() => setDeleteMediaId(media.id)} title='Delete'>
                      <Trash2 className='size-4' />
                    </Button>
                  </div>

                  {/* Badges */}
                  <div className='absolute top-2 left-2 flex flex-col gap-1'>
                    <Badge variant={getVerificationBadgeVariant(media.verificationStatus)} className='text-xs'>
                      {media.verificationStatus === 'APPROVED' && <CheckCircle className='size-3 mr-1' />}
                      {media.verificationStatus === 'PENDING' && <Clock className='size-3 mr-1' />}
                      {media.verificationStatus === 'REJECTED' && <XCircle className='size-3 mr-1' />}
                      {formatEnumValue(media.verificationStatus)}
                    </Badge>
                  </div>

                  {media.isPrimary && (
                    <Badge className='absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-500 text-yellow-950 shadow-md'>
                      <Star className='size-3 fill-current mr-1' />
                      Primary
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload New Media */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New Media</CardTitle>
          <CardDescription>Add more photos and videos to your listing</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className='flex flex-col items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary'>
                <Upload className='size-6' />
              </div>
              <div>
                <p className='font-semibold'>{isDragActive ? 'Drop your files here...' : 'Drag & drop files here'}</p>
                <p className='text-sm text-muted-foreground'>or click to browse</p>
              </div>
              <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                <span className='flex items-center gap-1'>
                  <Camera className='size-3' /> JPEG, PNG, WebP
                </span>
                <span className='flex items-center gap-1'>
                  <Film className='size-3' /> MP4, MOV, WebM
                </span>
              </div>
            </div>
          </div>

          {/* New uploads preview */}
          {newMediaItems.length > 0 && (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <p className='text-sm font-medium'>{newMediaItems.length} file(s) ready to upload</p>
                <Button onClick={uploadNewMedia} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className='size-4 animate-spin mr-2' />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className='size-4 mr-2' />
                      Upload All
                    </>
                  )}
                </Button>
              </div>

              {isUploading && <Progress value={uploadProgress} className='h-2' />}

              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {newMediaItems.map((item, index) => (
                  <div
                    key={index}
                    className='relative group aspect-video rounded-xl overflow-hidden bg-muted border-2 border-dashed border-primary/30'
                  >
                    {item.type === 'IMAGE' ? (
                      <img src={item.url} alt={`New upload ${index + 1}`} className='w-full h-full object-cover' />
                    ) : (
                      <video src={item.url} className='w-full h-full object-cover' />
                    )}

                    <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center'>
                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={() => removeNewItem(index)}
                        disabled={isUploading}
                      >
                        <X className='size-4' />
                      </Button>
                    </div>

                    <Badge variant='outline' className='absolute top-2 left-2 bg-background/80'>
                      {item.type === 'IMAGE' ? (
                        <ImageIcon className='size-3 mr-1' />
                      ) : (
                        <Video className='size-3 mr-1' />
                      )}
                      New
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex justify-end'>
        <Button variant='outline' onClick={() => router.push(`/listings/${listing.slug}/edit`)}>
          Done
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteMediaId !== null} onOpenChange={(open) => !open && setDeleteMediaId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this media? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMediaId && deleteMedia({ slug: listing.slug, mediaId: deleteMediaId })}
              disabled={isDeleting}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isDeleting ? (
                <>
                  <Loader2 className='size-4 animate-spin mr-2' />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
