
import { HardHat } from 'lucide-react';
import React from 'react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center p-8 space-y-6">
        <HardHat className="h-24 w-24 mx-auto text-primary animate-pulse" />
        <h1 className="text-4xl md:text-5xl font-bold">
          Site Under Maintenance
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          We&apos;re currently performing some scheduled maintenance. We should be back online shortly. Thank you for your patience!
        </p>
      </div>
    </div>
  );
}
