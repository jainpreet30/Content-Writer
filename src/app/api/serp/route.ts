import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ suggestions: [] });
    }

    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Autocomplete failed');
    }

    const data = await response.json();
    const suggestions = data[1] || [];

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error('Autocomplete API Error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { query, apiKey, country, location } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'Serper.dev API key is required' }, { status: 400 });
    }

    const body: any = { q: query };
    if (country) {
      const gl = country.split('_')[0];
      body.gl = gl;
    }
    if (location) {
      body.location = location;
    }

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey.trim(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Serper API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const organic = data.organic || [];

    // Map to required format: title, url, snippet
    const results = organic.map((item: any) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet || '',
    }));

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('SERP Search API Error:', error);
    return NextResponse.json({ error: error.message || 'SERP search failed' }, { status: 500 });
  }
}
