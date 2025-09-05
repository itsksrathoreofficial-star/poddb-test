
"use client";
import { Search } from 'lucide-react';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import HelpCenterPage from './page';

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHelpRoot = pathname === '/help';

  return (
    <div className="bg-background text-foreground">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto py-12 text-center">
          <h1 className="text-4xl font-bold">How can we help you?</h1>
          <p className="mt-2 text-muted-foreground">Search our knowledge base or browse by category.</p>
          <div className="mt-6 max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Describe your issue"
                className="pl-12 pr-4 py-3 text-base h-12"
                // This state will be lifted up or managed via context/zustand in a larger app
                // For now, we pass it down to the page component on the root help page.
              />
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-12">
        {children}
      </main>
    </div>
  );
}
