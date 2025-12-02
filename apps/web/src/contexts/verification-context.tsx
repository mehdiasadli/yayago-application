'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { authClient } from '@/lib/auth-client';
import { VerificationModal } from '@/components/verification-modal';
import type { GetVerificationStatusOutputType } from '@yayago-app/validators';

interface VerificationContextValue {
  /** Current verification status */
  status: GetVerificationStatusOutputType | undefined;
  /** Whether the status is loading */
  isLoading: boolean;
  /** Whether the user is verified (approved) */
  isVerified: boolean;
  /** Whether verification is required (not submitted or rejected) */
  isVerificationRequired: boolean;
  /** Whether verification is pending review */
  isPending: boolean;
  /** Open the verification modal */
  openModal: () => void;
  /** Close the verification modal */
  closeModal: () => void;
  /** Refetch the verification status */
  refetch: () => void;
  /** Check if user can book (verified) and open modal if not */
  requireVerification: () => boolean;
}

const VerificationContext = createContext<VerificationContextValue | null>(null);

interface VerificationProviderProps {
  children: ReactNode;
}

export function VerificationProvider({ children }: VerificationProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const { data: status, isLoading, refetch } = useQuery({
    ...orpc.users.getVerificationStatus.queryOptions(),
    enabled: !!session?.user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const isVerified = status?.status === 'APPROVED';
  const isVerificationRequired = status?.status === 'NOT_SUBMITTED' || status?.status === 'REJECTED';
  const isPending = status?.status === 'PENDING';

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleComplete = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['users', 'getVerificationStatus'] });
  }, [queryClient]);

  // Helper function to check verification and open modal if needed
  const requireVerification = useCallback((): boolean => {
    if (!session?.user) {
      return false; // Not logged in
    }
    if (isVerified) {
      return true; // Already verified
    }
    // Not verified - open modal
    openModal();
    return false;
  }, [session?.user, isVerified, openModal]);

  const value: VerificationContextValue = {
    status,
    isLoading,
    isVerified,
    isVerificationRequired,
    isPending,
    openModal,
    closeModal,
    refetch: () => refetch(),
    requireVerification,
  };

  return (
    <VerificationContext.Provider value={value}>
      {children}
      <VerificationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onComplete={handleComplete}
      />
    </VerificationContext.Provider>
  );
}

export function useVerification(): VerificationContextValue {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
}

export default VerificationProvider;

