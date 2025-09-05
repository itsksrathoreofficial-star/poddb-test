"use client";

import React from 'react';
import { useEffect } from 'react';
import UserErrorPage from '@/components/UserErrorPage';
import { logJSError } from '@/lib/error-tracking';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error
    logJSError(error, {
      additionalData: {
        digest: error.digest,
        page: 'global-error.tsx',
        isGlobalError: true
      }
    });
  }, [error]);

  return (
    <html>
      <body>
        <UserErrorPage
          errorId={error.digest}
          errorType="critical"
          title="Critical Error"
          message="A critical error occurred. Our team has been notified and is working to fix this issue immediately."
          onRetry={reset}
        />
      </body>
    </html>
  );
}
