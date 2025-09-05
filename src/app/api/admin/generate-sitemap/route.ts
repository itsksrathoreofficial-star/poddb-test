import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
    try {
        const { xmlContent, urls } = await request.json();

        if (!xmlContent) {
            return NextResponse.json(
                { error: 'XML content is required' },
                { status: 400 }
            );
        }

        // Ensure public directory exists
        const publicDir = join(process.cwd(), 'public');
        
        // Write sitemap.xml to public directory
        const sitemapPath = join(publicDir, 'sitemap.xml');
        await writeFile(sitemapPath, xmlContent, 'utf8');

        // Also create a robots.txt if it doesn't exist
        const robotsPath = join(publicDir, 'robots.txt');
        const robotsContent = `User-agent: *
Allow: /

Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://poddb.pro'}/sitemap.xml`;

        try {
            await writeFile(robotsPath, robotsContent, 'utf8');
        } catch (error) {
            // robots.txt might already exist, that's okay
            console.log('Could not update robots.txt:', error);
        }

        return NextResponse.json({
            success: true,
            message: 'Sitemap generated successfully',
            urlsCount: urls?.length || 0,
            sitemapPath: '/sitemap.xml'
        });

    } catch (error: any) {
        console.error('Error generating sitemap:', error);
        return NextResponse.json(
            { error: 'Failed to generate sitemap', details: error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Return current sitemap status
        return NextResponse.json({
            success: true,
            message: 'Sitemap API is working',
            endpoints: {
                generate: 'POST /api/admin/generate-sitemap',
                status: 'GET /api/admin/generate-sitemap'
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to get sitemap status', details: error.message },
            { status: 500 }
        );
    }
}
