"use client";

import React from 'react';
import { useEffect } from 'react';
import UserErrorPage from '@/components/UserErrorPage';
import { logJSError } from '@/lib/error-tracking';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error
    logJSError(error, {
      additionalData: {
        digest: error.digest,
        page: 'error.tsx',
        isNextError: true
      }
    });
  }, [error]);

  return (
    <UserErrorPage
      errorId={error.digest}
      errorType="javascript"
      title="Something went wrong"
      message="We're experiencing some technical difficulties. Our team has been notified and is working to fix this issue."
      onRetry={reset}
    />
  );
}
