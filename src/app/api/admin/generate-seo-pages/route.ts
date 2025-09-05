import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';

// GET method to fetch existing SEO combinations
export async function GET() {
  try {
    const dataDir = join(process.cwd(), 'data');
    const combinationsPath = join(dataDir, 'seo-combinations.json');
    
    try {
      const combinationsData = await readFile(combinationsPath, 'utf-8');
      const combinations = JSON.parse(combinationsData);
      
      return NextResponse.json({
        success: true,
        combinations: combinations,
        total: combinations.length
      });
    } catch (error) {
      // File doesn't exist yet, return empty combinations
      return NextResponse.json({
        success: true,
        combinations: [],
        total: 0
      });
    }
  } catch (error: any) {
    console.error('Error fetching SEO combinations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SEO combinations', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { combinations } = await request.json();

    if (!combinations || !Array.isArray(combinations)) {
      return NextResponse.json(
        { error: 'Invalid combinations data' },
        { status: 400 }
      );
    }

    // Create data directory if it doesn't exist
    const dataDir = join(process.cwd(), 'data');
    try {
      await mkdir(dataDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Save SEO combinations
    const combinationsPath = join(dataDir, 'seo-combinations.json');
    await writeFile(combinationsPath, JSON.stringify(combinations, null, 2));

    // Generate sample data for preview
    const sampleData = combinations.slice(0, 20).map(combo => ({
      ...combo,
      sampleTitle: combo.title,
      sampleDescription: combo.description,
      estimatedTraffic: Math.floor(Math.random() * 1000) + 100,
      competitionLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
    }));

    const samplePath = join(dataDir, 'seo-samples.json');
    await writeFile(samplePath, JSON.stringify(sampleData, null, 2));

    // Generate sitemap entries for SEO pages
    const sitemapEntries = combinations.map(combo => ({
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://poddb.pro'}${combo.url}`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: combo.priority
    }));

    const sitemapPath = join(dataDir, 'seo-sitemap-entries.json');
    await writeFile(sitemapPath, JSON.stringify(sitemapEntries, null, 2));

    return NextResponse.json({
      success: true,
      message: 'SEO pages generated successfully',
      stats: {
        totalPages: combinations.length,
        highPriority: combinations.filter(c => c.priority >= 0.9).length,
        mediumPriority: combinations.filter(c => c.priority >= 0.7 && c.priority < 0.9).length,
        lowPriority: combinations.filter(c => c.priority < 0.7).length,
        estimatedKeywords: combinations.length * 10,
        estimatedSearchQueries: combinations.length * 50
      }
    });

  } catch (error: any) {
    console.error('Error generating SEO pages:', error);
    return NextResponse.json(
      { error: 'Failed to generate SEO pages', details: error.message },
      { status: 500 }
    );
  }
}
