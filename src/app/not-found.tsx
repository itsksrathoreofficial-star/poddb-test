import React from 'react';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            Page Not Found
          </CardTitle>
          <CardDescription className="text-lg">
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* What you can do */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">What you can do:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Check the URL for typos</li>
              <li>• Go back to the previous page</li>
              <li>• Return to the home page</li>
              <li>• Use the search function to find what you're looking for</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            
            <Button 
              onClick={() => window.history.back()}
              className="flex-1"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Search Suggestion */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Looking for something specific? Try our{' '}
              <Link href="/search" className="text-primary hover:underline">
                search function
              </Link>
              {' '}or browse our{' '}
              <Link href="/explore" className="text-primary hover:underline">
                podcast directory
              </Link>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}