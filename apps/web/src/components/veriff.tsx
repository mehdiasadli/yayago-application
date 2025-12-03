'use client';

import { useEffect, useRef, useState } from 'react';
import { createVeriffFrame, MESSAGES } from '@veriff/incontext-sdk';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Declare the global Veriff type
declare global {
  interface Window {
    Veriff: (options: {
      apiKey: string;
      parentId: string;
      onSession: (error: Error | null, response: { verification: { url: string } }) => void;
    }) => {
      setParams: (params: { person?: { givenName?: string; lastName?: string }; vendorData?: string }) => void;
      mount: (options?: { submitBtnText?: string; loadingText?: string }) => void;
    };
  }
}

interface VeriffIntegrationProps {
  firstName?: string;
  lastName?: string;
  vendorData?: string;
  onVerificationComplete?: () => void;
}

// Load script manually
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    if (document.querySelector(`script[src="${src}"]`)) {
      console.log('[Veriff] Script already in DOM');
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      console.log('[Veriff] Script loaded via manual injection');
      resolve();
    };
    script.onerror = (e) => {
      console.error('[Veriff] Script failed to load:', e);
      reject(new Error('Failed to load Veriff SDK'));
    };
    document.head.appendChild(script);
    console.log('[Veriff] Script element added to head');
  });
}

export default function VeriffIntegration({
  firstName,
  lastName,
  vendorData,
  onVerificationComplete,
}: VeriffIntegrationProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    console.log('[Veriff] Component mounted, starting initialization...');

    const initVeriff = async () => {
      try {
        // Load the script
        await loadScript('https://cdn.veriff.me/sdk/js/1.5/veriff.min.js');

        // Wait a tick for the script to execute
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log('[Veriff] Checking window.Veriff:', typeof window.Veriff);

        if (typeof window.Veriff !== 'function') {
          throw new Error('Veriff SDK not available after script load');
        }

        console.log('[Veriff] Creating Veriff instance...');

        const veriff = window.Veriff({
          apiKey: process.env.NEXT_PUBLIC_VERIFF_API_KEY || 'bd1bcf3d-1031-4a77-97b8-75a2d38cc41e',
          parentId: 'veriff-root',
          onSession: (err, response) => {
            console.log('[Veriff] onSession:', { err, response });
            if (err) {
              toast.error(err instanceof Error ? err.message : 'Failed to create session');
              return;
            }

            createVeriffFrame({
              url: response.verification.url,
              onEvent: (msg: string) => {
                console.log('[Veriff] Event:', msg);
                switch (msg) {
                  case MESSAGES.STARTED:
                    break;
                  case MESSAGES.FINISHED:
                    toast.success('Verification completed!');
                    onVerificationComplete?.();
                    break;
                  case MESSAGES.CANCELED:
                    toast.info('Verification cancelled');
                    break;
                }
              },
            });
          },
        });

        console.log('[Veriff] Setting params...');
        veriff.setParams({
          person: {
            givenName: firstName || ' ',
            lastName: lastName || ' ',
          },
          vendorData: vendorData || ' ',
        });

        console.log('[Veriff] Mounting...');
        veriff.mount({
          submitBtnText: 'Start Verification',
          loadingText: 'Please wait...',
        });

        console.log('[Veriff] Mount complete!');
        setStatus('ready');
      } catch (err) {
        console.error('[Veriff] Initialization error:', err);
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
        setStatus('error');
        toast.error('Failed to initialize verification');
      }
    };

    initVeriff();
  }, [firstName, lastName, vendorData, onVerificationComplete]);

  return (
    <div className='w-full'>
      {status === 'error' && (
        <div className='w-full max-w-md mx-auto p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg mb-4'>
          <p className='text-red-600 dark:text-red-400 text-sm'>Error: {errorMessage}</p>
        </div>
      )}

      {status === 'loading' && (
        <div className='w-full max-w-md mx-auto flex items-center justify-center py-8'>
          <Loader2 className='size-6 animate-spin text-muted-foreground' />
          <span className='ml-2 text-muted-foreground'>Loading verification...</span>
        </div>
      )}

      {/* Veriff mounts its UI here */}
      <div className='w-full max-w-md mx-auto'>
        <div id='veriff-root' className='w-full' />
      </div>
    </div>
  );
}
