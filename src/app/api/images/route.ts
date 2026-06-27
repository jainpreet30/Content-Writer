import { NextRequest, NextResponse } from 'next/server';

interface CuratedImage {
  imageUrl: string;
  title: string;
  source: string;
}

function getCategoryRelevantImages(kw: string): CuratedImage[] {
  const kwLower = kw.toLowerCase();

  // Category 1: Video, Edit, Design, Creative, Media, Photo, Audio, Graphic, Art, Film, Sound
  if (kwLower.includes('video') || kwLower.includes('edit') || kwLower.includes('design') || kwLower.includes('photo') || kwLower.includes('audio') || kwLower.includes('graphic') || kwLower.includes('creative') || kwLower.includes('art') || kwLower.includes('sound') || kwLower.includes('film') || kwLower.includes('camera')) {
    if (kwLower.includes('mobile') || kwLower.includes('phone') || kwLower.includes('android') || kwLower.includes('ios') || kwLower.includes('iphone') || kwLower.includes('ipad') || kwLower.includes('app ') || kwLower.endsWith('app') || kwLower.includes('apps')) {
      return [
        { imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80', title: 'Mobile phone video editing app workspace', source: 'Unsplash' },
        { imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=80', title: 'Smart phone screen displaying application configuration', source: 'Unsplash' },
        { imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', title: 'Mobile smartphone on desk displaying visual UI', source: 'Unsplash' },
        { imageUrl: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=800&q=80', title: 'Recording audio and video on phone', source: 'Unsplash' }
      ];
    }
    return [
      { imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80', title: 'Desktop professional video editing workspace', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=800&q=80', title: 'Professional cinema camera on rigging setup', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80', title: 'Audio mixing board and microphone studio setup', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80', title: 'Creative graphic design studio desk', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80', title: 'Digital illustration tablet and stylus pen', source: 'Unsplash' }
    ];
  }

  // Category 2: Software, Testing, QA, Coding, Development, IT, Database, Server, Web
  if (kwLower.includes('software') || kwLower.includes('test') || kwLower.includes('qa') || kwLower.includes('code') || kwLower.includes('develop') || kwLower.includes('company') || kwLower.includes('agency') || kwLower.includes('database') || kwLower.includes('server') || kwLower.includes('web') || kwLower.includes('tech') || kwLower.includes('ahmedabad')) {
    return [
      { imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80', title: 'Software engineer code screen close up', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', title: 'Data analytics and quality assurance dashboard', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', title: 'Web development workspace with laptop and diagrams', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80', title: 'Developer team testing user interface of mobile application', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80', title: 'Datacenter server rack network connection', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', title: 'Ahmedabad modern IT business park exterior glass building', source: 'Unsplash' }
    ];
  }

  // Category 3: Finance, Money, Crypto, Stock, Invest, Wealth, Pricing, Cost
  if (kwLower.includes('finance') || kwLower.includes('money') || kwLower.includes('crypto') || kwLower.includes('bitcoin') || kwLower.includes('stock') || kwLower.includes('invest') || kwLower.includes('pricing') || kwLower.includes('cost') || kwLower.includes('wealth')) {
    return [
      { imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80', title: 'Stock market candlestick trading charts', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&w=800&q=80', title: 'Physical gold Bitcoin coin on keyboard', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80', title: 'Financial planning calculator and papers', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80', title: 'Wallet with credit cards on table', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80', title: 'Piggy bank coins savings growth concept', source: 'Unsplash' }
    ];
  }

  // Category 4: Health, Fit, Diet, Medical, Doctor, Nutrition, Wellness
  if (kwLower.includes('health') || kwLower.includes('fit') || kwLower.includes('diet') || kwLower.includes('medical') || kwLower.includes('doctor') || kwLower.includes('nutrition') || kwLower.includes('wellness') || kwLower.includes('gym')) {
    return [
      { imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80', title: 'Fitness gym weights and active lifestyle training', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80', title: 'Healthy food nutrition bowl with organic vegetables', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80', title: 'Yoga meditation class practicing mindfulness', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=800&q=80', title: 'Medical doctor office desk with stethoscope', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80', title: 'Running workout training outdoor track', source: 'Unsplash' }
    ];
  }

  // Category 5: Travel, Hotel, Flight, Trip, Tour, Beach
  if (kwLower.includes('travel') || kwLower.includes('hotel') || kwLower.includes('flight') || kwLower.includes('trip') || kwLower.includes('tour') || kwLower.includes('beach') || kwLower.includes('vacation')) {
    return [
      { imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80', title: 'Commercial airplane in flight high above clouds', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', title: 'Sunny beach with blue ocean water', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&q=80', title: 'Luggage suitcase packing for travel vacation', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80', title: 'Travel roadmap with compass search planning', source: 'Unsplash' },
      { imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', title: 'Luxury hotel room lobby interior design', source: 'Unsplash' }
    ];
  }

  // Default: General SEO, Business, Marketing, Content
  return [
    { imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', title: 'SEO marketing strategy data charts', source: 'Unsplash' },
    { imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80', title: 'Creative copywriting pen writing on book', source: 'Unsplash' },
    { imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80', title: 'Social media management statistics charts', source: 'Unsplash' },
    { imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80', title: 'Collaborative business team brainstorming ideas', source: 'Unsplash' },
    { imageUrl: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=800&q=80', title: 'Email marketing campaign newsletter dispatch', source: 'Unsplash' }
  ];
}

async function fetchWikimediaImages(query: string): Promise<CuratedImage[]> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=15&prop=imageinfo&iiprop=url&format=json&origin=*`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'ContentWriterApp/1.0 (https://localhost:3000; contact@example.com) Mozilla/5.0'
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    const pages = data.query?.pages || {};
    const images: CuratedImage[] = [];
    
    for (const id in pages) {
      const page = pages[id];
      const imgUrl = page.imageinfo?.[0]?.url;
      const title = page.title || '';
      if (imgUrl && (imgUrl.endsWith('.jpg') || imgUrl.endsWith('.jpeg') || imgUrl.endsWith('.png'))) {
        images.push({
          imageUrl: imgUrl,
          title: title.replace(/^File:/, '').replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
          source: 'Wikimedia Commons'
        });
      }
    }
    return images;
  } catch (e) {
    console.error('Failed to fetch from Wikimedia Commons:', e);
    return [];
  }
}

async function fetchOpenverseImages(query: string): Promise<CuratedImage[]> {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=12`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'ContentWriterApp/1.0 (https://localhost:3000; contact@example.com) Mozilla/5.0'
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results = data.results || [];
    return results
      .filter((r: any) => r.url && (r.url.endsWith('.jpg') || r.url.endsWith('.jpeg') || r.url.endsWith('.png') || r.url.includes('flickr.com')))
      .map((r: any) => ({
        imageUrl: r.url,
        title: r.title || 'Related Image',
        source: 'Openverse'
      }));
  } catch (e) {
    console.error('Failed to fetch from Openverse:', e);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { query = '', apiKeys = {} } = await req.json();

    if (!query) {
      return NextResponse.json({ images: getCategoryRelevantImages('SEO') });
    }

    const serperKey = apiKeys.serper || process.env.SERPER_API_KEY;

    if (serperKey) {
      try {
        const response = await fetch('https://google.serper.dev/images', {
          method: 'POST',
          headers: {
            'X-API-KEY': serperKey.trim(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ q: query }),
        });

        if (response.ok) {
          const data = await response.json();
          const rawImages = data.images || [];

          // Exclude images containing logos, icons, vector, or branding terms
          const filtered = rawImages
            .filter((img: any) => {
              const title = (img.title || '').toLowerCase();
              const source = (img.source || '').toLowerCase();
              const parentUrl = (img.parentPageUrl || '').toLowerCase();
              const imgUrl = (img.imageUrl || '').toLowerCase();

              const brandingKeywords = ['logo', 'icon', 'symbol', 'vector', 'branded', 'transparent', 'png', 'svg', 'watermark'];
              return !brandingKeywords.some(kw => 
                title.includes(kw) || 
                source.includes(kw) || 
                parentUrl.includes(kw) ||
                imgUrl.includes(kw)
              );
            })
            .map((img: any) => ({
              imageUrl: img.imageUrl,
              title: img.title || 'Related Image',
              source: img.source || 'Google Images'
            }))
            .slice(0, 10);

          if (filtered.length > 0) {
            return NextResponse.json({ images: filtered });
          }
        }
      } catch (err) {
        console.error('Serper search failed, falling back to Wikimedia:', err);
      }
    }

    // Try Wikimedia Commons search as a free dynamic fallback
    try {
      const wikiImages = await fetchWikimediaImages(query);
      if (wikiImages.length >= 3) {
        return NextResponse.json({ images: wikiImages });
      }
    } catch (e) {
      console.error('Wikimedia Commons fallback search failed:', e);
    }

    // Try Openverse search as a second free dynamic fallback
    try {
      const openverseImages = await fetchOpenverseImages(query);
      if (openverseImages.length > 0) {
        return NextResponse.json({ images: openverseImages });
      }
    } catch (e) {
      console.error('Openverse fallback search failed:', e);
    }

    // Curated offline category fallback
    return NextResponse.json({ images: getCategoryRelevantImages(query) });
  } catch (error: any) {
    console.error('Image search API error:', error);
    return NextResponse.json({ images: getCategoryRelevantImages('SEO') });
  }
}

