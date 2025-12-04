'use client';

import {
  CircleUserRoundIcon,
  Trash2Icon,
  ZoomInIcon,
  ZoomOutIcon,
  CropIcon,
  CheckIcon,
  XIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useFileUpload } from '@/hooks/use-file-upload';
import { Button } from '@/components/ui/button';
import { Cropper, CropperCropArea, CropperDescription, CropperImage } from '@/components/ui/cropper';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

// Define type for pixel crop area
type Area = { x: number; y: number; width: number; height: number };

// Helper function to create a cropped image blob
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputWidth: number = 400,
  outputHeight: number = 400
): Promise<Blob | null> {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, outputWidth, outputHeight);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        0.9
      );
    });
  } catch (error) {
    console.error('Error in getCroppedImg:', error);
    return null;
  }
}

// Convert blob to base64 data URL
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export interface AvatarUploadProps {
  /** Current image URL (can be external URL or base64) */
  value?: string | null;
  /** Callback when image changes - returns base64 data URL, empty string (removed), or undefined (unchanged) */
  onChange?: (value: string | null) => void;
  /** Callback with the raw blob for custom handling */
  onBlobChange?: (blob: Blob | null) => void;
  /** Fallback text/initials when no image */
  fallback?: string;
  /** Size of the avatar in pixels */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether the upload is disabled */
  disabled?: boolean;
  /** Max file size in bytes (default 5MB) */
  maxSize?: number;
  /** Custom className for the container */
  className?: string;
}

const sizeClasses = {
  sm: 'size-12',
  md: 'size-16',
  lg: 'size-24',
  xl: 'size-32',
};

const fallbackTextSizes = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

export function AvatarUpload({
  value,
  onChange,
  onBlobChange,
  fallback,
  size = 'lg',
  disabled = false,
  maxSize = 5 * 1024 * 1024,
  className,
}: AvatarUploadProps) {
  const [
    { files, isDragging },
    { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, removeFile, getInputProps },
  ] = useFileUpload({
    accept: 'image/*',
    maxSize,
  });

  const previewUrl = files[0]?.preview || null;
  const fileId = files[0]?.id;

  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const previousFileIdRef = useRef<string | undefined | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [zoom, setZoom] = useState(1);

  const handleCropChange = useCallback((pixels: Area | null) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!previewUrl || !fileId || !croppedAreaPixels) {
      if (fileId) {
        removeFile(fileId);
        setCroppedAreaPixels(null);
      }
      return;
    }

    try {
      const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels);

      if (!croppedBlob) {
        throw new Error('Failed to generate cropped image blob.');
      }

      const base64 = await blobToBase64(croppedBlob);
      const newPreviewUrl = URL.createObjectURL(croppedBlob);

      if (croppedPreviewUrl) {
        URL.revokeObjectURL(croppedPreviewUrl);
      }

      setCroppedPreviewUrl(newPreviewUrl);
      setIsRemoved(false);

      onChange?.(base64);
      onBlobChange?.(croppedBlob);

      removeFile(fileId);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error during apply:', error);
      setIsDialogOpen(false);
    }
  };

  const handleCancel = () => {
    if (fileId) {
      removeFile(fileId);
    }
    setCroppedAreaPixels(null);
    setZoom(1);
    setIsDialogOpen(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (croppedPreviewUrl) {
      URL.revokeObjectURL(croppedPreviewUrl);
    }

    setCroppedPreviewUrl(null);
    setIsRemoved(true);

    onChange?.('');
    onBlobChange?.(null);
  };

  useEffect(() => {
    const currentPreviewUrl = croppedPreviewUrl;
    return () => {
      if (currentPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(currentPreviewUrl);
      }
    };
  }, [croppedPreviewUrl]);

  useEffect(() => {
    if (fileId && fileId !== previousFileIdRef.current) {
      setIsDialogOpen(true);
      setCroppedAreaPixels(null);
      setZoom(1);
    }
    previousFileIdRef.current = fileId;
  }, [fileId]);

  useEffect(() => {
    if (value) {
      setIsRemoved(false);
    }
  }, [value]);

  const displayImage = isRemoved ? null : croppedPreviewUrl || value;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className='relative inline-flex group'>
        <button
          aria-label={displayImage ? 'Change image' : 'Upload image'}
          className={cn(
            'relative flex items-center justify-center overflow-hidden rounded-full outline-none transition-all',
            'border-2 border-dashed border-muted-foreground/20 hover:border-primary/50',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            displayImage && 'border-solid border-transparent',
            'data-[dragging=true]:border-primary data-[dragging=true]:scale-105',
            sizeClasses[size],
            disabled && 'pointer-events-none opacity-50'
          )}
          data-dragging={isDragging || undefined}
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          type='button'
          disabled={disabled}
        >
          {displayImage ? (
            <>
              <img alt='Avatar' className='size-full object-cover' src={displayImage} />
              <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity'>
                <span className='text-white text-xs font-medium'>Change</span>
              </div>
            </>
          ) : (
            <div aria-hidden='true' className='flex flex-col items-center justify-center text-muted-foreground'>
              {fallback ? (
                <span className={cn('font-semibold', fallbackTextSizes[size])}>{fallback}</span>
              ) : (
                <CircleUserRoundIcon className='size-1/2 opacity-60' />
              )}
            </div>
          )}
        </button>

        {displayImage && !disabled && (
          <Button
            aria-label='Remove image'
            className={cn(
              'absolute -top-1 -right-1 size-6 rounded-full p-0',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              'border-2 border-background'
            )}
            onClick={handleRemove}
            size='icon'
            type='button'
            variant='destructive'
          >
            <Trash2Icon className='size-3' />
          </Button>
        )}

        <input
          {...getInputProps()}
          aria-label='Upload image file'
          className='sr-only'
          tabIndex={-1}
          disabled={disabled}
        />
      </div>

      {/* Cropper Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className='gap-0 p-0 sm:max-w-md overflow-hidden rounded-2xl [&>button]:hidden'>
          <DialogDescription className='sr-only'>Crop image dialog</DialogDescription>
          <DialogHeader className='contents space-y-0 text-left'>
            <DialogTitle className='flex items-center justify-between border-b px-4 py-3'>
              <div className='flex items-center gap-2'>
                <CropIcon className='size-4 text-muted-foreground' />
                <span className='font-medium'>Crop Image</span>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleCancel}
                  className='h-8 px-2'
                >
                  <XIcon className='size-4' />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {previewUrl && (
            <div className='relative'>
              <Cropper
                className='h-64 sm:h-80 bg-zinc-950'
                image={previewUrl}
                onCropChange={handleCropChange}
                onZoomChange={setZoom}
                zoom={zoom}
              >
                <CropperDescription />
                <CropperImage />
                <CropperCropArea className='rounded-full' />
              </Cropper>
              
              <div className='absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white text-xs'>
                {Math.round(zoom * 100)}%
              </div>
            </div>
          )}
          
          <DialogFooter className='flex-col gap-4 border-t p-4'>
            <div className='flex w-full items-center gap-3'>
              <ZoomOutIcon className='size-4 text-muted-foreground shrink-0' />
              <Slider
                aria-label='Zoom slider'
                defaultValue={[1]}
                max={3}
                min={1}
                onValueChange={(value) => setZoom(value[0])}
                step={0.01}
                value={[zoom]}
                className='flex-1'
              />
              <ZoomInIcon className='size-4 text-muted-foreground shrink-0' />
            </div>
            <div className='flex w-full gap-2'>
              <Button
                variant='outline'
                onClick={handleCancel}
                className='flex-1'
              >
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={!previewUrl}
                className='flex-1'
              >
                <CheckIcon className='size-4 mr-1.5' />
                Apply
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AvatarUpload;
