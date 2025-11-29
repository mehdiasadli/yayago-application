'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, Video, Upload, X, Star, AlertCircle, Camera, Film, CheckCircle2 } from 'lucide-react';
import { MediaItem } from '../create-listing-form';
import { Card, CardContent } from '@/components/ui/card';

interface MediaStepProps {
  mediaItems: MediaItem[];
  setMediaItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;
}

export default function MediaStep({ mediaItems, setMediaItems }: MediaStepProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newItems: MediaItem[] = acceptedFiles.map((file, index) => {
        const isVideo = file.type.startsWith('video/');
        const isFirst = mediaItems.length === 0 && index === 0;
        return {
          file,
          url: URL.createObjectURL(file),
          type: isVideo ? 'VIDEO' : 'IMAGE',
          isPrimary: isFirst && !isVideo,
        };
      });
      setMediaItems((prev) => [...prev, ...newItems]);
    },
    [mediaItems.length, setMediaItems]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'video/*': ['.mp4', '.mov', '.webm'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeItem = (index: number) => {
    setMediaItems((prev) => {
      const newItems = prev.filter((_, i) => i !== index);
      // If we removed the primary, make the first image primary
      if (prev[index].isPrimary && newItems.length > 0) {
        const firstImageIndex = newItems.findIndex((item) => item.type === 'IMAGE');
        if (firstImageIndex !== -1) {
          newItems[firstImageIndex] = { ...newItems[firstImageIndex], isPrimary: true };
        }
      }
      return newItems;
    });
  };

  const setPrimary = (index: number) => {
    setMediaItems((prev) =>
      prev.map((item, i) => ({
        ...item,
        isPrimary: i === index,
      }))
    );
  };

  const images = mediaItems.filter((item) => item.type === 'IMAGE');
  const videos = mediaItems.filter((item) => item.type === 'VIDEO');

  return (
    <div className='space-y-8'>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className='flex flex-col items-center gap-4'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <Upload className='size-8' />
          </div>
          <div>
            <p className='text-lg font-semibold'>
              {isDragActive ? 'Drop your files here...' : 'Drag & drop files here'}
            </p>
            <p className='text-muted-foreground mt-1'>or click to browse from your device</p>
          </div>
          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
            <span className='flex items-center gap-1'>
              <Camera className='size-4' /> JPEG, PNG, WebP
            </span>
            <span className='flex items-center gap-1'>
              <Film className='size-4' /> MP4, MOV, WebM
            </span>
          </div>
          <p className='text-xs text-muted-foreground'>Maximum file size: 50MB</p>
        </div>
      </div>

      {/* Photo Tips */}
      <Alert>
        <CheckCircle2 className='size-4' />
        <AlertTitle>Photo Tips for Better Bookings</AlertTitle>
        <AlertDescription>
          <ul className='grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2'>
            <li className='flex items-center gap-2'>
              <span className='size-1.5 rounded-full bg-primary' />
              Use high-quality, well-lit photos
            </li>
            <li className='flex items-center gap-2'>
              <span className='size-1.5 rounded-full bg-primary' />
              Include exterior shots from multiple angles
            </li>
            <li className='flex items-center gap-2'>
              <span className='size-1.5 rounded-full bg-primary' />
              Show the interior, dashboard, and trunk
            </li>
            <li className='flex items-center gap-2'>
              <span className='size-1.5 rounded-full bg-primary' />
              Highlight any special features
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Media Stats */}
      {mediaItems.length > 0 && (
        <div className='flex items-center gap-6'>
          <Card className='flex-1'>
            <CardContent className='flex items-center gap-3 p-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500'>
                <ImageIcon className='size-5' />
              </div>
              <div>
                <p className='text-2xl font-bold'>{images.length}</p>
                <p className='text-sm text-muted-foreground'>Images</p>
              </div>
            </CardContent>
          </Card>
          <Card className='flex-1'>
            <CardContent className='flex items-center gap-3 p-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500'>
                <Video className='size-5' />
              </div>
              <div>
                <p className='text-2xl font-bold'>{videos.length}</p>
                <p className='text-sm text-muted-foreground'>Videos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Media Preview */}
      {mediaItems.length > 0 && (
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>Uploaded Media</h3>
          <p className='text-sm text-muted-foreground'>
            Click the star icon to set the primary photo (shown in search results)
          </p>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {mediaItems.map((item, index) => (
              <div
                key={index}
                className={`relative group aspect-video rounded-xl overflow-hidden bg-muted border-2 ${
                  item.isPrimary ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'border-transparent'
                }`}
              >
                {item.type === 'IMAGE' ? (
                  <img src={item.url} alt={`Upload ${index + 1}`} className='w-full h-full object-cover' />
                ) : (
                  <video src={item.url} className='w-full h-full object-cover' />
                )}

                {/* Overlay */}
                <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2'>
                  {item.type === 'IMAGE' && !item.isPrimary && (
                    <Button
                      size='sm'
                      variant='secondary'
                      onClick={() => setPrimary(index)}
                      className='shadow-lg'
                      title='Set as primary'
                    >
                      <Star className='size-4' />
                    </Button>
                  )}
                  <Button
                    size='sm'
                    variant='destructive'
                    onClick={() => removeItem(index)}
                    className='shadow-lg'
                    title='Remove'
                  >
                    <X className='size-4' />
                  </Button>
                </div>

                {/* Badges */}
                <div className='absolute top-2 left-2 flex gap-1'>
                  <Badge variant={item.type === 'IMAGE' ? 'secondary' : 'primary'} className='shadow-md'>
                    {item.type === 'IMAGE' ? <ImageIcon className='size-3' /> : <Video className='size-3' />}
                  </Badge>
                  {item.isPrimary && (
                    <Badge className='bg-yellow-500 hover:bg-yellow-500 text-yellow-950 shadow-md'>
                      <Star className='size-3 fill-current' />
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Media Message */}
      {mediaItems.length === 0 && (
        <div className='text-center py-12 bg-muted/30 rounded-xl border border-dashed'>
          <ImageIcon className='size-16 mx-auto mb-4 text-muted-foreground/50' />
          <p className='text-lg font-medium'>No media uploaded yet</p>
          <p className='text-sm text-muted-foreground mt-1'>At least one image is required to create a listing</p>
        </div>
      )}

      {/* Warning if no images */}
      {mediaItems.length > 0 && images.length === 0 && (
        <Alert variant='destructive'>
          <AlertCircle className='size-4' />
          <AlertTitle>No Images</AlertTitle>
          <AlertDescription>
            You've uploaded videos but no images. At least one image is required as the primary listing photo.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
