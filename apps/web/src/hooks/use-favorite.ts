'use client';

import { useCallback, useOptimistic, useTransition } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

interface UseFavoriteOptions {
  listingSlug: string;
  /** Initial favorite state if known (to avoid extra query) */
  initialIsFavorite?: boolean;
  /** Called when favorite status changes */
  onToggle?: (isFavorite: boolean) => void;
}

interface UseFavoriteReturn {
  /** Current favorite status (optimistic) */
  isFavorite: boolean;
  /** Whether an operation is in progress */
  isPending: boolean;
  /** Toggle favorite status with optimistic update */
  toggleFavorite: () => void;
  /** Add to favorites */
  addFavorite: () => void;
  /** Remove from favorites */
  removeFavorite: () => void;
}

/**
 * Hook for managing favorite status of a listing with optimistic updates
 *
 * @example
 * ```tsx
 * const { isFavorite, isPending, toggleFavorite } = useFavorite({
 *   listingSlug: 'my-listing',
 * });
 *
 * return (
 *   <Button onClick={toggleFavorite} disabled={isPending}>
 *     <Heart className={isFavorite ? 'fill-current' : ''} />
 *   </Button>
 * );
 * ```
 */
export function useFavorite({ listingSlug, initialIsFavorite, onToggle }: UseFavoriteOptions): UseFavoriteReturn {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const [isPending, startTransition] = useTransition();

  // Query to check favorite status (skipped if initialIsFavorite is provided)
  // skip if not authorized
  const { data: checkData } = useQuery({
    ...orpc.users.checkFavorite.queryOptions({
      input: { listingSlug },
    }),
    enabled: initialIsFavorite === undefined && !!session?.user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Determine actual favorite state
  const actualIsFavorite = initialIsFavorite ?? checkData?.isFavorite ?? false;

  // Optimistic state
  const [optimisticIsFavorite, setOptimisticIsFavorite] = useOptimistic(actualIsFavorite);

  // Add favorite mutation
  const addMutation = useMutation({
    ...orpc.users.addFavorite.mutationOptions({
      onSuccess: () => {
        // Use ORPC's key() for partial matching invalidation
        queryClient.invalidateQueries({ queryKey: orpc.users.checkFavorite.key() });
        queryClient.invalidateQueries({ queryKey: orpc.users.listFavorites.key() });
        queryClient.invalidateQueries({ queryKey: orpc.users.getAccountOverview.key() });
        onToggle?.(true);
      },
      onError: (error: any) => {
        toast.error('Failed to add to favorites', {
          description: error.message,
        });
      },
    }),
  });

  // Remove favorite mutation
  const removeMutation = useMutation({
    ...orpc.users.removeFavorite.mutationOptions({
      onSuccess: () => {
        // Use ORPC's key() for partial matching invalidation
        queryClient.invalidateQueries({ queryKey: orpc.users.checkFavorite.key() });
        queryClient.invalidateQueries({ queryKey: orpc.users.listFavorites.key() });
        queryClient.invalidateQueries({ queryKey: orpc.users.getAccountOverview.key() });
        onToggle?.(false);
      },
      onError: (error: any) => {
        toast.error('Failed to remove from favorites', {
          description: error.message,
        });
      },
    }),
  });

  const addFavorite = useCallback(() => {
    startTransition(async () => {
      setOptimisticIsFavorite(true);
      try {
        await addMutation.mutateAsync({ listingSlug });
      } catch {
        // Error handled by mutation onError
      }
    });
  }, [listingSlug, addMutation, setOptimisticIsFavorite]);

  const removeFavorite = useCallback(() => {
    startTransition(async () => {
      setOptimisticIsFavorite(false);
      try {
        await removeMutation.mutateAsync({ listingSlug });
      } catch {
        // Error handled by mutation onError
      }
    });
  }, [listingSlug, removeMutation, setOptimisticIsFavorite]);

  const toggleFavorite = useCallback(() => {
    if (optimisticIsFavorite) {
      removeFavorite();
    } else {
      addFavorite();
    }
  }, [optimisticIsFavorite, addFavorite, removeFavorite]);

  return {
    isFavorite: optimisticIsFavorite,
    isPending: isPending || addMutation.isPending || removeMutation.isPending,
    toggleFavorite,
    addFavorite,
    removeFavorite,
  };
}
