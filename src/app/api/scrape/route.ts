import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch competitor page: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract headings
    const headings: { type: 'H2' | 'H3' | 'H4'; text: string; id: string }[] = [];
    $('h2, h3, h4').each((index, element) => {
      const type = element.tagName.toUpperCase() as 'H2' | 'H3' | 'H4';
      const text = $(element).text().trim();
      if (text) {
        headings.push({
          id: `heading_${index}_${Math.random().toString(36).substr(2, 5)}`,
          type,
          text,
        });
      }
    });

    // Extract paragraphs content for token calculations
    const paragraphs: string[] = [];
    $('p').each((_, element) => {
      const text = $(element).text().trim();
      if (text) paragraphs.push(text);
    });

    const fullText = paragraphs.join(' ');
    const wordCount = fullText.split(/\s+/).filter(Boolean).length;

    return NextResponse.json({
      headings,
      fullText: fullText.slice(0, 100000), // Limit text size
      wordCount,
    });
  } catch (error: any) {
    console.error('Scrape API Error:', error);
    return NextResponse.json({ error: error.message || 'Scrape failed' }, { status: 500 });
  }
}
