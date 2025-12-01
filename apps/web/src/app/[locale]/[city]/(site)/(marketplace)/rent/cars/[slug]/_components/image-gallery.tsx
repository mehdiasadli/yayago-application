'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Star, Zap, Heart, Share2, Car, Expand, X, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export interface MediaItem {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  alt: string | null;
  isPrimary: boolean;
  width: number;
  height: number;
}

interface ImageGalleryProps {
  media: MediaItem[];
  title: string;
  isFeatured: boolean;
  hasInstantBooking: boolean;
}

export default function ImageGallery({ media, title, isFeatured, hasInstantBooking }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const images = media.filter((m) => m.type === 'IMAGE');
  const videos = media.filter((m) => m.type === 'VIDEO');
  const currentMedia = images[currentIndex];

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') setIsFullscreen(false);
    },
    [goToNext, goToPrevious]
  );

  if (images.length === 0) {
    return (
      <div className='aspect-[16/9] rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center'>
        <Car className='size-32 text-muted-foreground/20' />
      </div>
    );
  }

  return (
    <>
      <div className='space-y-4' onKeyDown={handleKeyDown} tabIndex={0}>
        {/* Main Image */}
        <div className='relative aspect-[16/9] rounded-2xl overflow-hidden bg-black group'>
          <img
            src={currentMedia?.url}
            alt={currentMedia?.alt || title}
            className='w-full h-full object-cover transition-transform duration-500'
          />

          {/* Gradient overlays */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none' />

          {/* Top badges */}
          <div className='absolute top-4 left-4 flex flex-wrap gap-2 z-10'>
            {isFeatured && (
              <Badge className='bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 border-0 shadow-lg px-3 py-1'>
                <Star className='size-3.5 fill-current mr-1.5' />
                Featured
              </Badge>
            )}
            {hasInstantBooking && (
              <Badge className='bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-lg px-3 py-1'>
                <Zap className='size-3.5 mr-1.5' />
                Instant Booking
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className='absolute top-4 right-4 flex gap-2 z-10'>
            <Button
              size='icon'
              variant='ghost'
              className={cn(
                'size-10 rounded-full backdrop-blur-md transition-all',
                isFavorite ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/20 text-white hover:bg-white/30'
              )}
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={cn('size-5', isFavorite && 'fill-current')} />
            </Button>
            <Button
              size='icon'
              variant='ghost'
              className='size-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30'
            >
              <Share2 className='size-5' />
            </Button>
            <Button
              size='icon'
              variant='ghost'
              className='size-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30'
              onClick={() => setIsFullscreen(true)}
            >
              <Expand className='size-5' />
            </Button>
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <Button
                size='icon'
                variant='ghost'
                className='absolute left-4 top-1/2 -translate-y-1/2 size-12 rounded-full bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity'
                onClick={goToPrevious}
              >
                <ChevronLeft className='size-6' />
              </Button>
              <Button
                size='icon'
                variant='ghost'
                className='absolute right-4 top-1/2 -translate-y-1/2 size-12 rounded-full bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity'
                onClick={goToNext}
              >
                <ChevronRight className='size-6' />
              </Button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className='absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm'>
              <span className='font-medium'>
                {currentIndex + 1} / {images.length}
              </span>
            </div>
          )}

          {/* Dots indicator */}
          {images.length > 1 && images.length <= 10 && (
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5'>
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    'transition-all rounded-full',
                    idx === currentIndex ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className='flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted'>
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  'relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden transition-all',
                  idx === currentIndex
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'opacity-60 hover:opacity-100'
                )}
              >
                <img src={img.url} alt={img.alt || ''} className='w-full h-full object-cover' />
              </button>
            ))}
            {videos.map((video) => (
              <button
                key={video.id}
                className='relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden opacity-60 hover:opacity-100 transition-opacity bg-muted'
              >
                <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
                  <Play className='size-6 text-white fill-white' />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className='max-w-[95vw] max-h-[95vh] p-0 bg-black border-0'>
          <DialogTitle className='sr-only'>{title} - Image Gallery</DialogTitle>
          <div className='relative w-full h-[90vh]' onKeyDown={handleKeyDown} tabIndex={0}>
            <img src={currentMedia?.url} alt={currentMedia?.alt || title} className='w-full h-full object-contain' />

            <Button
              size='icon'
              variant='ghost'
              className='absolute top-4 right-4 size-10 rounded-full bg-white/10 text-white hover:bg-white/20'
              onClick={() => setIsFullscreen(false)}
            >
              <X className='size-5' />
            </Button>

            {images.length > 1 && (
              <>
                <Button
                  size='icon'
                  variant='ghost'
                  className='absolute left-4 top-1/2 -translate-y-1/2 size-14 rounded-full bg-white/10 text-white hover:bg-white/20'
                  onClick={goToPrevious}
                >
                  <ChevronLeft className='size-8' />
                </Button>
                <Button
                  size='icon'
                  variant='ghost'
                  className='absolute right-4 top-1/2 -translate-y-1/2 size-14 rounded-full bg-white/10 text-white hover:bg-white/20'
                  onClick={goToNext}
                >
                  <ChevronRight className='size-8' />
                </Button>
              </>
            )}

            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm text-white'>
              <span className='font-medium'>
                {currentIndex + 1} / {images.length}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
