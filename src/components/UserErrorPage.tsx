"use client";

import React from 'react';
import { AlertTriangle, Home, RefreshCw, Bug, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface UserErrorPageProps {
  errorId?: string;
  errorType?: string;
  title?: string;
  message?: string;
  showReportButton?: boolean;
  onRetry?: () => void;
}

export default function UserErrorPage({
  errorId,
  errorType = 'general',
  title = "Sorry, something went wrong",
  message = "We're experiencing some technical difficulties. Our team has been notified and is working to fix this issue.",
  showReportButton = true,
  onRetry
}: UserErrorPageProps) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleReportBug = () => {
    if (errorId) {
      // Open help page with error ID
      window.open(`/help?error=${errorId}`, '_blank');
    } else {
      // Open general help page
      window.open('/help', '_blank');
    }
  };

  const getErrorIcon = () => {
    switch (errorType) {
      case 'network':
        return <RefreshCw className="w-8 h-8 text-orange-500" />;
      case 'permission':
        return <AlertTriangle className="w-8 h-8 text-red-500" />;
      case 'database':
        return <Bug className="w-8 h-8 text-red-600" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-red-500" />;
    }
  };

  const getErrorColor = () => {
    switch (errorType) {
      case 'network':
        return 'text-orange-600 dark:text-orange-400';
      case 'permission':
        return 'text-red-600 dark:text-red-400';
      case 'database':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-red-600 dark:text-red-400';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            {getErrorIcon()}
          </div>
          <CardTitle className={`text-2xl font-bold ${getErrorColor()}`}>
            {title}
          </CardTitle>
          <CardDescription className="text-lg">
            {message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error Report Notification */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Bug className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Error Report Sent Automatically
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  We've automatically reported this error to our team. We'll fix it as soon as possible.
                </p>
                {errorId && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-mono">
                    Error ID: {errorId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* What you can do */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">What you can do:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Try refreshing the page</li>
              <li>• Go back to the previous page</li>
              <li>• Return to the home page</li>
              <li>• Check your internet connection</li>
              <li>• Try again in a few minutes</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleRetry}
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              onClick={handleGoBack}
              className="flex-1"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            
            <Button 
              onClick={handleGoHome}
              className="flex-1"
              variant="outline"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>

          {/* Report Bug Button */}
          {showReportButton && (
            <div className="pt-4 border-t">
              <Button 
                onClick={handleReportBug}
                variant="ghost"
                className="w-full"
              >
                <Bug className="w-4 h-4 mr-2" />
                Report This Issue
              </Button>
            </div>
          )}

          {/* Additional Help */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              If this problem persists, please contact our support team.
            </p>
            <p className="mt-1">
              We apologize for any inconvenience caused.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
