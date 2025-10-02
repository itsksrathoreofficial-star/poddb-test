
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/integrations/supabase/server';
import StaticCategoriesPage from './StaticCategoriesPage';

// Enable static generation
export const dynamic = 'force-static';
export const revalidate = false; // Fully static, no revalidation

// Pre-fetch categories data at build time
async function getCategoriesData() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data, error } = await supabase.rpc('get_all_categories' as any);
    if (error) {
      console.warn('Warning: Could not fetch categories data during build:', error.message);
      return [];
    }
    return data || [];
  } catch (error: any) {
    console.warn('Warning: Could not fetch categories data during build:', error.message);
    return [];
  }
}

export default async function CategoriesPage() {
  const categoriesData = await getCategoriesData();

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading categories...</span>
        </div>
      </div>
    }>
      <StaticCategoriesPage initialData={categoriesData} />
    </Suspense>
  );
}
