import { NextResponse } from 'next/server';
import { generateHomeSEOCombinations } from '@/lib/home-seo-generator';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  try {
    const combinations = await generateHomeSEOCombinations();
    
    return NextResponse.json({
      success: true,
      combinations: combinations,
      total: combinations.length
    });
  } catch (error) {
    console.error('Error generating home SEO combinations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate home SEO combinations',
        combinations: []
      },
      { status: 500 }
    );
  }
}
