'use client';

import { ArrowLeftIcon, CircleUserRoundIcon, Trash2Icon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
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

  // Internal state for the cropped image preview (blob URL for display)
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Track if user explicitly removed the image
  const [isRemoved, setIsRemoved] = useState(false);

  // Ref to track the previous file ID to detect new uploads
  const previousFileIdRef = useRef<string | undefined | null>(null);

  // State to store the desired crop area in pixels
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // State for zoom level
  const [zoom, setZoom] = useState(1);

  // Callback for Cropper to provide crop data
  const handleCropChange = useCallback((pixels: Area | null) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!previewUrl || !fileId || !croppedAreaPixels) {
      console.error('Missing data for apply:', {
        croppedAreaPixels,
        fileId,
        previewUrl,
      });
      if (fileId) {
        removeFile(fileId);
        setCroppedAreaPixels(null);
      }
      return;
    }

    try {
      // Get the cropped image blob
      const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels);

      if (!croppedBlob) {
        throw new Error('Failed to generate cropped image blob.');
      }

      // Convert blob to base64 for API
      const base64 = await blobToBase64(croppedBlob);

      // Create preview URL for display
      const newPreviewUrl = URL.createObjectURL(croppedBlob);

      // Revoke the old preview URL if it exists
      if (croppedPreviewUrl) {
        URL.revokeObjectURL(croppedPreviewUrl);
      }

      // Set the preview URL and clear removed state
      setCroppedPreviewUrl(newPreviewUrl);
      setIsRemoved(false);

      // Call the onChange callback with base64
      onChange?.(base64);
      onBlobChange?.(croppedBlob);

      // Clean up the source file from useFileUpload
      removeFile(fileId);

      // Close the dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error during apply:', error);
      setIsDialogOpen(false);
    }
  };

  const handleCancel = () => {
    // Clean up the source file
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

    // Revoke cropped preview URL if exists
    if (croppedPreviewUrl) {
      URL.revokeObjectURL(croppedPreviewUrl);
    }

    // Clear internal state
    setCroppedPreviewUrl(null);
    setIsRemoved(true);

    // Notify parent - use empty string to indicate explicit removal
    onChange?.('');
    onBlobChange?.(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    const currentPreviewUrl = croppedPreviewUrl;
    return () => {
      if (currentPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(currentPreviewUrl);
      }
    };
  }, [croppedPreviewUrl]);

  // Effect to open dialog when a *new* file is ready
  useEffect(() => {
    if (fileId && fileId !== previousFileIdRef.current) {
      setIsDialogOpen(true);
      setCroppedAreaPixels(null);
      setZoom(1);
    }
    previousFileIdRef.current = fileId;
  }, [fileId]);

  // Reset isRemoved when value prop changes (e.g., after successful save)
  useEffect(() => {
    if (value) {
      setIsRemoved(false);
    }
  }, [value]);

  // Determine what image to show:
  // 1. If user explicitly removed -> show nothing
  // 2. If we have a cropped preview (new upload) -> show that
  // 3. Otherwise -> show the value prop (existing image)
  const displayImage = isRemoved ? null : croppedPreviewUrl || value;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className='relative inline-flex'>
        {/* Drop area */}
        <button
          aria-label={displayImage ? 'Change image' : 'Upload image'}
          className={cn(
            'relative flex items-center justify-center overflow-hidden rounded-full border border-input border-dashed outline-none transition-colors',
            'hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
            'has-disabled:pointer-events-none has-[img]:border-none has-disabled:opacity-50',
            'data-[dragging=true]:bg-accent/50',
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
            <img alt='Avatar' className='size-full object-cover' src={displayImage} />
          ) : (
            <div aria-hidden='true' className='flex items-center justify-center text-muted-foreground'>
              {fallback ? (
                <span className='text-lg font-medium'>{fallback}</span>
              ) : (
                <CircleUserRoundIcon className='size-1/2 opacity-60' />
              )}
            </div>
          )}
        </button>

        {/* Remove button */}
        {displayImage && !disabled && (
          <Button
            aria-label='Remove image'
            className='-top-1 -right-1 absolute size-6 rounded-full border-2 border-background shadow-none focus-visible:border-background'
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
        <DialogContent className='gap-0 p-0 sm:max-w-140 [&>button]:hidden'>
          <DialogDescription className='sr-only'>Crop image dialog</DialogDescription>
          <DialogHeader className='contents space-y-0 text-left'>
            <DialogTitle className='flex items-center justify-between border-b p-4 text-base'>
              <div className='flex items-center gap-2'>
                <Button
                  aria-label='Cancel'
                  className='-my-1 opacity-60'
                  onClick={handleCancel}
                  size='icon'
                  type='button'
                  variant='ghost'
                >
                  <ArrowLeftIcon aria-hidden='true' />
                </Button>
                <span>Crop image</span>
              </div>
              <Button autoFocus className='-my-1' disabled={!previewUrl} onClick={handleApply} type='button'>
                Apply
              </Button>
            </DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <Cropper
              className='h-96 sm:h-120'
              image={previewUrl}
              onCropChange={handleCropChange}
              onZoomChange={setZoom}
              zoom={zoom}
            >
              <CropperDescription />
              <CropperImage />
              <CropperCropArea />
            </Cropper>
          )}
          <DialogFooter className='border-t px-4 py-6'>
            <div className='mx-auto flex w-full max-w-80 items-center gap-4'>
              <ZoomOutIcon aria-hidden='true' className='shrink-0 opacity-60' size={16} />
              <Slider
                aria-label='Zoom slider'
                defaultValue={[1]}
                max={3}
                min={1}
                onValueChange={(value) => setZoom(value[0])}
                step={0.1}
                value={[zoom]}
              />
              <ZoomInIcon aria-hidden='true' className='shrink-0 opacity-60' size={16} />
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AvatarUpload;
