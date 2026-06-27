import { NextRequest, NextResponse } from 'next/server';

interface HeadingItem {
  id: string;
  type: 'H2' | 'H3' | 'H4';
  text: string;
  wordCountTarget: number;
}

function getKeywordRelevantEntities(kw: string): string[] {
  const kwLower = kw.toLowerCase();
  if (kwLower.includes('video') || kwLower.includes('edit') || kwLower.includes('design') || kwLower.includes('photo') || kwLower.includes('audio') || kwLower.includes('graphic') || kwLower.includes('render') || kwLower.includes('media') || kwLower.includes('creative') || kwLower.includes('software') || kwLower.includes('pc')) {
    if (kwLower.includes('mobile') || kwLower.includes('phone') || kwLower.includes('android') || kwLower.includes('ios') || kwLower.includes('iphone') || kwLower.includes('ipad') || kwLower.includes('app ') || kwLower.endsWith('app') || kwLower.includes('apps')) {
      return ['CapCut Mobile', 'LumaFusion', 'KineMaster', 'InShot App', 'VN Video Editor', 'Adobe Premiere Rush', 'Splice App', 'Alight Motion', 'FilmoraGo', 'iMovie Mobile'];
    }
    return ['Adobe Premiere Pro', 'DaVinci Resolve', 'Final Cut Pro', 'CapCut PC', 'Filmora', 'CyberLink PowerDirector', 'Avid Media Composer'];
  }
  if (kwLower.includes('health') || kwLower.includes('medical') || kwLower.includes('fit') || kwLower.includes('diet') || kwLower.includes('nutrition')) {
    return ['Mayo Clinic', 'WebMD', 'Healthline', 'CDC', 'WHO', 'NHS', 'FDA'];
  }
  if (kwLower.includes('finance') || kwLower.includes('money') || kwLower.includes('crypto') || kwLower.includes('bitcoin') || kwLower.includes('invest')) {
    return ['Bloomberg', 'Investopedia', 'Forbes', 'Yahoo Finance', 'Coinbase', 'Binance', 'NerdWallet'];
  }
  if (kwLower.includes('travel') || kwLower.includes('hotel') || kwLower.includes('flight') || kwLower.includes('trip')) {
    return ['Tripadvisor', 'Booking.com', 'Expedia', 'Airbnb', 'Skyscanner', 'Yelp'];
  }
  if (kwLower.includes('seo') || kwLower.includes('marketing') || kwLower.includes('content') || kwLower.includes('keyword')) {
    return ['Ahrefs', 'Semrush', 'Moz', 'Ubersuggest', 'Google Search Console', 'Google Analytics'];
  }
  return ['Google', 'Microsoft', 'Apple', 'Adobe', 'Amazon', 'ChatGPT', 'OpenAI'];
}

function getKeywordRelevantNGrams(kw: string): string[] {
  const kwLower = kw.toLowerCase();
  if (kwLower.includes('video') || kwLower.includes('edit') || kwLower.includes('design') || kwLower.includes('creative') || kwLower.includes('pc')) {
    if (kwLower.includes('mobile') || kwLower.includes('phone') || kwLower.includes('android') || kwLower.includes('ios') || kwLower.includes('iphone') || kwLower.includes('ipad') || kwLower.includes('app ') || kwLower.endsWith('app') || kwLower.includes('apps')) {
      return ['mobile video editing', 'best mobile video editor', 'edit videos on phone', 'video editing app', 'smartphone video editor', 'mobile production app'];
    }
    return ['video editing software', 'best video editor', 'PC video editing', 'video production tools', 'edit videos on PC', 'professional video editing'];
  }
  return [
    `best ${kw}`,
    `top ${kw} in 2026`,
    `${kw} reviews`,
    `${kw} comparison`,
    `how to use ${kw}`,
    `professional ${kw}`
  ];
}

interface CuratedImage {
  imageUrl: string;
  title: string;
}

function getCategoryRelevantImages(kw: string): CuratedImage[] {
  const kwLower = kw.toLowerCase();

  // Category 1: Video, Edit, Design, Creative, Media, Photo, Audio, Graphic, Art, Film, Sound
  if (kwLower.includes('video') || kwLower.includes('edit') || kwLower.includes('design') || kwLower.includes('photo') || kwLower.includes('audio') || kwLower.includes('graphic') || kwLower.includes('creative') || kwLower.includes('art') || kwLower.includes('sound') || kwLower.includes('film') || kwLower.includes('camera')) {
    if (kwLower.includes('mobile') || kwLower.includes('phone') || kwLower.includes('android') || kwLower.includes('ios') || kwLower.includes('iphone') || kwLower.includes('ipad') || kwLower.includes('app ') || kwLower.endsWith('app') || kwLower.includes('apps')) {
      return [
        { imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80', title: 'Mobile phone video editing app workspace' },
        { imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=80', title: 'Smart phone screen displaying application configuration' },
        { imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', title: 'Mobile smartphone on desk displaying visual UI' },
        { imageUrl: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=800&q=80', title: 'Recording audio and video on phone' }
      ];
    }
    return [
      { imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80', title: 'Desktop professional video editing workspace' },
      { imageUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=800&q=80', title: 'Professional cinema camera on rigging setup' },
      { imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80', title: 'Audio mixing board and microphone studio setup' },
      { imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80', title: 'Creative graphic design studio desk' },
      { imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80', title: 'Digital illustration tablet and stylus pen' }
    ];
  }

  // Category 2: Software, Testing, QA, Coding, Development, IT, Database, Server, Web
  if (kwLower.includes('software') || kwLower.includes('test') || kwLower.includes('qa') || kwLower.includes('code') || kwLower.includes('develop') || kwLower.includes('company') || kwLower.includes('agency') || kwLower.includes('database') || kwLower.includes('server') || kwLower.includes('web') || kwLower.includes('tech') || kwLower.includes('ahmedabad')) {
    return [
      { imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80', title: 'Software engineer code screen close up' },
      { imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', title: 'Data analytics and quality assurance dashboard' },
      { imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', title: 'Web development workspace with laptop and diagrams' },
      { imageUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80', title: 'Developer team testing user interface of mobile application' },
      { imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80', title: 'Datacenter server rack network connection' },
      { imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', title: 'Ahmedabad modern IT business park exterior glass building' }
    ];
  }

  // Category 3: Finance, Money, Crypto, Stock, Invest, Wealth, Pricing, Cost
  if (kwLower.includes('finance') || kwLower.includes('money') || kwLower.includes('crypto') || kwLower.includes('bitcoin') || kwLower.includes('stock') || kwLower.includes('invest') || kwLower.includes('pricing') || kwLower.includes('cost') || kwLower.includes('wealth')) {
    return [
      { imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80', title: 'Stock market candlestick trading charts' },
      { imageUrl: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&w=800&q=80', title: 'Physical gold Bitcoin coin on keyboard' },
      { imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80', title: 'Financial planning calculator and papers' },
      { imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80', title: 'Wallet with credit cards on table' },
      { imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80', title: 'Piggy bank coins savings growth concept' }
    ];
  }

  // Category 4: Health, Fit, Diet, Medical, Doctor, Nutrition, Wellness
  if (kwLower.includes('health') || kwLower.includes('fit') || kwLower.includes('diet') || kwLower.includes('medical') || kwLower.includes('doctor') || kwLower.includes('nutrition') || kwLower.includes('wellness') || kwLower.includes('gym')) {
    return [
      { imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80', title: 'Fitness gym weights and active lifestyle training' },
      { imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80', title: 'Healthy food nutrition bowl with organic vegetables' },
      { imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80', title: 'Yoga meditation class practicing mindfulness' },
      { imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=800&q=80', title: 'Medical doctor office desk with stethoscope' },
      { imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80', title: 'Running workout training outdoor track' }
    ];
  }

  // Category 5: Travel, Hotel, Flight, Trip, Tour, Beach
  if (kwLower.includes('travel') || kwLower.includes('hotel') || kwLower.includes('flight') || kwLower.includes('trip') || kwLower.includes('tour') || kwLower.includes('beach') || kwLower.includes('vacation')) {
    return [
      { imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80', title: 'Commercial airplane in flight high above clouds' },
      { imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', title: 'Sunny beach with blue ocean water' },
      { imageUrl: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&q=80', title: 'Luggage suitcase packing for travel vacation' },
      { imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80', title: 'Travel roadmap with compass search planning' },
      { imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', title: 'Luxury hotel room lobby interior design' }
    ];
  }

  // Default: General SEO, Business, Marketing, Content
  return [
    { imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', title: 'SEO marketing strategy data charts' },
    { imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80', title: 'Creative copywriting pen writing on book' },
    { imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80', title: 'Social media management statistics charts' },
    { imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80', title: 'Collaborative business team brainstorming ideas' },
    { imageUrl: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=800&q=80', title: 'Email marketing campaign newsletter dispatch' }
  ];
}

async function fetchWikimediaImages(query: string): Promise<{ imageUrl: string; title: string; source: string }[]> {
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
    const images = [];
    
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

async function fetchOpenverseImages(query: string): Promise<{ imageUrl: string; title: string; source: string }[]> {
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

function sanitizeImages(html: string, maxImages: number = 3): string {
  if (!html) return html;
  try {
    const cheerio = require('cheerio');
    const $ = cheerio.load(html, null, false);
    const seen = new Set();
    let count = 0;
    
    $('img').each((i: number, el: any) => {
      const src = $(el).attr('src');
      if (!src || seen.has(src) || count >= maxImages) {
        $(el).remove();
      } else {
        seen.add(src);
        count++;
      }
    });
    return $.html();
  } catch (e) {
    console.error('Error sanitizing images:', e);
    // Regular expression fallback
    const seenRegex = new Set();
    let regexCount = 0;
    return html.replace(/<img[^>]+src="([^"]+)"[^>]*>/gi, (match, src) => {
      if (seenRegex.has(src) || regexCount >= maxImages) {
        return '';
      }
      seenRegex.add(src);
      regexCount++;
      return match;
    });
  }
}

function getMatchingCompetitorSentences(
  headingText: string,
  competitorText: string,
  entities: string[],
  nGrams: string[],
  usedSentences: Set<string>,
  maxCount: number = 4
): string[] {
  if (!competitorText || competitorText.length < 100) return [];

  const sentences = competitorText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 25 && s.length < 300);

  if (sentences.length === 0) return [];

  const stopWords = new Set(['and', 'the', 'for', 'with', 'about', 'from', 'this', 'that', 'these', 'those', 'best', 'top', 'software', 'company', 'tools', 'tool', 'guide', 'review', 'reviews', 'what', 'where', 'when', 'how', 'why', 'who']);
  const headingWords = headingText.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
  
  const scored = sentences.map(sentence => {
    if (usedSentences.has(sentence)) {
      return { sentence, score: -100 };
    }
    
    let score = 0;
    let headingMatchCount = 0;
    const sLower = sentence.toLowerCase();
    
    headingWords.forEach(word => {
      if (sLower.includes(word)) {
        score += 15;
        headingMatchCount++;
      }
    });
    
    entities.forEach(entity => {
      if (sLower.includes(entity.toLowerCase())) score += 3;
    });
    
    nGrams.forEach(ngram => {
      if (sLower.includes(ngram.toLowerCase())) score += 1;
    });
    
    if (headingWords.length > 0 && headingMatchCount === 0) {
      score -= 10;
    }

    const spamWords = ['copyright', 'all rights reserved', 'click here', 'read more', 'privacy policy', 'subscribe', 'newsletter', 'login', 'sign up'];
    spamWords.forEach(spam => {
      if (sLower.includes(spam)) score -= 30;
    });

    return { sentence, score };
  });

  const topSentences = scored
    .filter(item => item.score > 8)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCount)
    .map(item => item.sentence);

  topSentences.forEach(s => {
    usedSentences.add(s);
  });
  return topSentences;
}

function getStringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
}

function matchCase(original: string, replacement: string): string {
  if (original === original.toUpperCase()) return replacement.toUpperCase();
  if (original[0] === original[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement.toLowerCase();
}

function extractHeadingsFromHtml(html: string): string[] {
  const headings: string[] = [];
  const regex = /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const headingText = match[1].replace(/<[^>]*>/g, '').trim();
    headings.push(headingText.toLowerCase());
  }
  return headings;
}

interface Section {
  headingType: 'H2' | 'H3' | 'H4' | 'INTRO';
  headingText: string;
  headingHtml: string;
  contentHtml: string;
}

function parseSections(html: string): Section[] {
  const sections: Section[] = [];
  const headingRegex = /(<h([2-4])[^>]*>([\s\S]*?)<\/h\2>)/gi;
  let match;
  
  // First, extract any intro content before the first heading
  const firstHeadingMatch = headingRegex.exec(html);
  headingRegex.lastIndex = 0; // reset
  
  if (firstHeadingMatch) {
    const introContent = html.substring(0, firstHeadingMatch.index).trim();
    if (introContent) {
      sections.push({
        headingType: 'INTRO',
        headingText: '',
        headingHtml: '',
        contentHtml: introContent
      });
    }
  } else {
    if (html.trim()) {
      sections.push({
        headingType: 'INTRO',
        headingText: '',
        headingHtml: '',
        contentHtml: html.trim()
      });
    }
    return sections;
  }
  
  const matches: { tagHtml: string; level: 'H2' | 'H3' | 'H4'; text: string; index: number }[] = [];
  while ((match = headingRegex.exec(html)) !== null) {
    matches.push({
      tagHtml: match[1],
      level: `H${match[2]}` as 'H2' | 'H3' | 'H4',
      text: match[3].replace(/<[^>]*>/g, '').trim(),
      index: match.index
    });
  }
  
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const nextIndex = (i + 1 < matches.length) ? matches[i + 1].index : html.length;
    const contentStart = current.index + current.tagHtml.length;
    const contentHtml = html.substring(contentStart, nextIndex).trim();
    
    sections.push({
      headingType: current.level,
      headingText: current.text,
      headingHtml: current.tagHtml,
      contentHtml
    });
  }
  
  return sections;
}


function getKeywordAwareLayout(
  headingText: string,
  index: number,
  finalKeyword: string,
  ent1: string,
  ent2: string,
  ng1: string,
  ng2: string,
  competitorContent: string,
  usedSentences: Set<string>
): string {
  const textLower = headingText.toLowerCase();
  const kwLower = finalKeyword.toLowerCase();
  const hash = getStringHash(headingText) + index;

  // 1. Identify Layout Type
  let layoutType: 'comparison' | 'list' | 'step' | 'price' | 'faq' | 'service' | 'general' = 'general';

  if (textLower.includes('vs') || textLower.includes('compare') || textLower.includes('comparison') || textLower.includes('difference') || textLower.includes('alternative') || kwLower.includes('vs')) {
    layoutType = 'comparison';
  } else if (textLower.includes('how to') || textLower.includes('guide') || textLower.includes('step') || textLower.includes('tutorial') || textLower.includes('implement') || textLower.includes('setup') || textLower.includes('configure') || textLower.includes('process') || textLower.includes('method') || textLower.includes('workflow')) {
    layoutType = 'step';
  } else if (textLower.includes('pricing') || textLower.includes('cost') || textLower.includes('package') || textLower.includes('tier') || textLower.includes('plan') || textLower.includes('budget')) {
    layoutType = 'price';
  } else if (textLower.includes('faq') || textLower.includes('question') || textLower.includes('answer') || textLower.includes('frequently asked')) {
    layoutType = 'faq';
  } else if (textLower.includes('best') || textLower.includes('top') || textLower.includes('rank') || textLower.includes('review') || textLower.includes('choice') || textLower.includes('software') || textLower.includes('app') || textLower.includes('tool')) {
    layoutType = 'list';
  } else if (textLower.includes('company') || textLower.includes('agency') || textLower.includes('service') || textLower.includes('firm') || textLower.includes('provider') || kwLower.includes('company') || kwLower.includes('agency') || kwLower.includes('service')) {
    layoutType = 'service';
  }

  // 2. Extract competitor sentences
  const matchedSentences = getMatchingCompetitorSentences(headingText, competitorContent, [ent1, ent2], [ng1, ng2], usedSentences, 5);

  // 3. Generate HTML based on Layout
  if (layoutType === 'comparison') {
    const introSentence = matchedSentences[0] || `Choosing the right option for <strong>${headingText}</strong> depends on what matters most to your <strong>${finalKeyword}</strong> workflow.`;
    const detailSentence1 = matchedSentences[1] || `<strong>${ent1}</strong> stands out for its streamlined setup and lower learning curve.`;
    const detailSentence2 = matchedSentences[2] || `On the other hand, focusing on <strong>${ng1}</strong> metrics reveals which option handles real-world workloads better.`;
    const outroSentence = matchedSentences[3] || `The right pick ultimately comes down to your budget, team size, and how fast you need results.`;

    return `
      <p>${introSentence}</p>
      <p>The comparative matrix below evaluates the primary metrics for <strong>${headingText}</strong>:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #2a315c;">
        <thead>
          <tr style="background-color: #141829; color: #fff;">
            <th style="border: 1px solid #2a315c; padding: 10px; text-align: left;">Metric</th>
            <th style="border: 1px solid #2a315c; padding: 10px; text-align: left;">Comparative Details</th>
            <th style="border: 1px solid #2a315c; padding: 10px; text-align: left;">Evaluation State</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #2a315c; padding: 10px;"><strong>Integration Scope</strong></td>
            <td style="border: 1px solid #2a315c; padding: 10px;">${detailSentence1}</td>
            <td style="border: 1px solid #2a315c; padding: 10px;">Supported</td>
          </tr>
          <tr>
            <td style="border: 1px solid #2a315c; padding: 10px;"><strong>Performance Output</strong></td>
            <td style="border: 1px solid #2a315c; padding: 10px;">${detailSentence2}</td>
            <td style="border: 1px solid #2a315c; padding: 10px;">Optimal</td>
          </tr>
          <tr>
            <td style="border: 1px solid #2a315c; padding: 10px;"><strong>Pricing / Cost</strong></td>
            <td style="border: 1px solid #2a315c; padding: 10px;">Variable subscription and enterprise plans are available.</td>
            <td style="border: 1px solid #2a315c; padding: 10px;">Flexible</td>
          </tr>
        </tbody>
      </table>
      <p>${outroSentence}</p>
    `;
  }

  if (layoutType === 'list') {
    const introSentence = matchedSentences[0] || `Here is what actually matters when evaluating <strong>${headingText}</strong> for your <strong>${finalKeyword}</strong> needs.`;
    const pro1 = matchedSentences[1] || `Setup is straightforward — most users can get started with <strong>${ent1}</strong> in under 15 minutes.`;
    const pro2 = matchedSentences[2] || `Resource usage stays low even under heavy workloads, which keeps costs predictable.`;
    const con1 = matchedSentences[3] || `Advanced customization requires some manual configuration that is not immediately obvious.`;
    const con2 = matchedSentences[4] || `The default reporting dashboard is limited — you may need to connect a third-party analytics tool.`;

    return `
      <p>${introSentence}</p>
      
      <p><strong>Key Capabilities and Specifications:</strong></p>
      <ul>
        <li><strong>Scalable Architecture:</strong> Designed to connect smoothly with <strong>${ent1}</strong> endpoints.</li>
        <li><strong>Optimized Workflows:</strong> Fully tailored to handle demanding <strong>${ng2}</strong> targets.</li>
        <li><strong>Accessibility:</strong> Simplified configuration settings for rapid deployment.</li>
      </ul>

      <p><strong>Pros:</strong></p>
      <ul>
        <li><strong>Pro:</strong> ${pro1}</li>
        <li><strong>Pro:</strong> ${pro2}</li>
      </ul>

      <p><strong>Cons:</strong></p>
      <ul>
        <li><strong>Con:</strong> ${con1}</li>
        <li><strong>Con:</strong> ${con2}</li>
      </ul>
    `;
  }

  if (layoutType === 'step') {
    const introSentence = matchedSentences[0] || `Getting <strong>${headingText}</strong> right takes a clear sequence of steps. Rushing this usually creates more problems than it solves.`;
    const step1 = matchedSentences[1] || `First, set up your access credentials and connect to <strong>${ent1}</strong>. Verify that everything authenticates correctly before moving on.`;
    const step2 = matchedSentences[2] || `Next, define the key metrics you want to track for <strong>${ng1}</strong>. Having baseline numbers makes it much easier to measure improvement.`;
    const step3 = matchedSentences[3] || `Run a test with a small dataset to catch formatting issues or configuration errors before scaling up.`;
    const step4 = matchedSentences[4] || `Once testing looks clean, roll out changes incrementally. Monitor performance closely for the first 48 hours.`;

    return `
      <p>${introSentence}</p>
      <p><strong>Step-by-Step Implementation Guide:</strong></p>
      <ol>
        <li><strong>Staging Preparation:</strong> ${step1}</li>
        <li><strong>Metrics Baselining:</strong> ${step2}</li>
        <li><strong>Performance Verification:</strong> ${step3}</li>
        <li><strong>Production Deployment:</strong> ${step4}</li>
      </ol>
      <p>Adhering to this structured approach minimizes deployment risks and helps maintain high quality standards.</p>
    `;
  }

  if (layoutType === 'price') {
    const introSentence = matchedSentences[0] || `Understanding the pricing models for <strong>${headingText}</strong> helps teams select the most cost-effective solution for <strong>${finalKeyword}</strong>.`;
    const rowDetail1 = matchedSentences[1] || `Designed for individuals seeking standard <strong>${ng1}</strong> features without complex dependencies.`;
    const rowDetail2 = matchedSentences[2] || `Designed for growing teams requiring full integration with <strong>${ent1}</strong> platforms.`;
    const rowDetail3 = matchedSentences[3] || `Designed for enterprise needs with dedicated servers, advanced security, and <strong>${ent2}</strong> hooks.`;

    return `
      <p>${introSentence}</p>
      <p>Below is a breakdown of the standard pricing tiers observed for these packages:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #2a315c;">
        <thead>
          <tr style="background-color: #141829; color: #fff;">
            <th style="border: 1px solid #2a315c; padding: 10px; text-align: left;">Plan Level</th>
            <th style="border: 1px solid #2a315c; padding: 10px; text-align: left;">Inclusions & Fit</th>
            <th style="border: 1px solid #2a315c; padding: 10px; text-align: left;">Estimated Cost</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #2a315c; padding: 10px;"><strong>Starter Tier</strong></td>
            <td style="border: 1px solid #2a315c; padding: 10px;">${rowDetail1}</td>
            <td style="border: 1px solid #2a315c; padding: 10px;">Free / $19 per month</td>
          </tr>
          <tr>
            <td style="border: 1px solid #2a315c; padding: 10px;"><strong>Growth / Pro Plan</strong></td>
            <td style="border: 1px solid #2a315c; padding: 10px;">${rowDetail2}</td>
            <td style="border: 1px solid #2a315c; padding: 10px;">$49 - $99 per month</td>
          </tr>
          <tr>
            <td style="border: 1px solid #2a315c; padding: 10px;"><strong>Enterprise Solutions</strong></td>
            <td style="border: 1px solid #2a315c; padding: 10px;">${rowDetail3}</td>
            <td style="border: 1px solid #2a315c; padding: 10px;">Custom Quote</td>
          </tr>
        </tbody>
      </table>
      <p>Selecting a plan should be based on your active workload volumes and scaling requirements.</p>
    `;
  }

  if (layoutType === 'faq') {
    const introSentence = matchedSentences[0] || `These are the questions that come up most often about <strong>${headingText}</strong> and how it connects to <strong>${finalKeyword}</strong>.`;
    const ans1 = matchedSentences[1] || `Start by configuring your account with <strong>${ent1}</strong> and making sure your permissions are set up correctly. Most issues during setup trace back to authentication.`;
    const ans2 = matchedSentences[2] || `Check your <strong>${ng1}</strong> numbers weekly and remove anything that is outdated or duplicated. Small maintenance habits prevent bigger problems.`;
    const ans3 = matchedSentences[3] || `Yes — <strong>${ent2}</strong> maintains backward compatibility, so upgrading should not break existing configurations.`;

    return `
      <p>${introSentence}</p>
      
      <p><strong>Q1: What is the initial setup process for this system?</strong></p>
      <p>${ans1}</p>
      
      <p><strong>Q2: How can performance bottlenecks be avoided?</strong></p>
      <p>${ans2}</p>
      
      <p><strong>Q3: Is it compatible with older legacy integrations?</strong></p>
      <p>${ans3}</p>
    `;
  }

  if (layoutType === 'service') {
    const introSentence = matchedSentences[0] || `Picking the right provider for <strong>${headingText}</strong> makes a real difference in your <strong>${finalKeyword}</strong> results.`;
    const detailList1 = matchedSentences[1] || `Good providers build custom strategies around <strong>${ent1}</strong> rather than applying the same template to every client.`;
    const detailList2 = matchedSentences[2] || `They also automate <strong>${ng1}</strong> tracking so you can focus on decision-making instead of data collection.`;
    const detailList3 = matchedSentences[3] || `Look for providers that run regular audits and maintain compliance standards with platforms like <strong>${ent2}</strong>.`;

    return `
      <p>${introSentence}</p>
      <p><strong>Core Service Offerings & Scope:</strong></p>
      <ul>
        <li><strong>Strategic Planning:</strong> ${detailList1}</li>
        <li><strong>Automated Execution:</strong> ${detailList2}</li>
        <li><strong>Quality Auditing:</strong> ${detailList3}</li>
      </ul>
      <p>Partnering with a certified service team minimizes setup delays and keeps operations aligned with industry standards.</p>
    `;
  }

  // Default General Layout
  const p1 = matchedSentences[0] || `When it comes to <strong>${headingText}</strong>, the most effective approach depends on your specific goals within <strong>${finalKeyword}</strong>. Teams that use <strong>${ent1}</strong> often see faster results because they can identify what works before committing resources.`;
  const p2 = matchedSentences[1] || `One thing worth paying attention to is <strong>${ng1}</strong>. Getting this right can make a noticeable difference in outcomes. <strong>${ent2}</strong> provides useful benchmarks for tracking progress and spotting issues early.`;
  const p3 = matchedSentences[2] || `A practical tip: start small, measure your <strong>${ng2}</strong> results carefully, and then scale what works. This iterative approach consistently outperforms trying to do everything at once.`;

  return `
    <p>${p1}</p>
    <p>${p2}</p>
    <p>${p3}</p>
  `;
}

// Smart offline fallback generator that builds a high-fidelity, natural-sounding, 1500+ word article with keyword research content
async function generateOfflineArticle(kw: string, outline: HeadingItem[], entities: string[], nGrams: string[], competitorContent: string = ''): Promise<string> {
  const finalKeyword = kw || 'SEO Optimization';
  const finalEntities = entities.length >= 2 ? entities : getKeywordRelevantEntities(finalKeyword);
  const finalNGrams = nGrams.length >= 2 ? nGrams : getKeywordRelevantNGrams(finalKeyword);

  let articleHtml = '';
  
  // 1. Add Main Title
  articleHtml += `<h1>The Complete Guide to ${finalKeyword} (${new Date().getFullYear()})</h1>\n`;
  
  // Determine relevant images based on keyword — track used URLs to prevent duplicates
  let curatedImages: { imageUrl: string; title: string }[] = [];
  try {
    const wikiImages = await fetchWikimediaImages(finalKeyword);
    curatedImages = wikiImages.map(img => ({ imageUrl: img.imageUrl, title: img.title }));
  } catch (e) {
    console.error('Failed to get Wikimedia Commons images for offline article:', e);
  }

  // Try Openverse if we have fewer than 3 images
  if (curatedImages.length < 3) {
    try {
      const openverseImages = await fetchOpenverseImages(finalKeyword);
      const existingUrls = new Set(curatedImages.map(img => img.imageUrl));
      for (const img of openverseImages) {
        if (!existingUrls.has(img.imageUrl)) {
          curatedImages.push({ imageUrl: img.imageUrl, title: img.title });
          existingUrls.add(img.imageUrl);
        }
      }
    } catch (e) {
      console.error('Failed to get Openverse images for offline article:', e);
    }
  }

  // Fall back to category curated images if we still have fewer than 3 images
  if (curatedImages.length < 3) {
    const fallbackImages = getCategoryRelevantImages(finalKeyword);
    const existingUrls = new Set(curatedImages.map(img => img.imageUrl));
    for (const img of fallbackImages) {
      if (!existingUrls.has(img.imageUrl)) {
        curatedImages.push({ imageUrl: img.imageUrl, title: img.title });
        existingUrls.add(img.imageUrl);
      }
    }
  }

  const usedImageIndices = new Set<number>();
  
  // Insert ONE hero image after the title
  const mainImage = curatedImages[0];
  usedImageIndices.add(0);
  articleHtml += `<img src="${mainImage.imageUrl}" alt="${mainImage.title}" class="rounded-xl max-w-full h-auto border border-[#2a315c] my-6 shadow-md" />\n`;
  articleHtml += `<p>Whether you are just getting started or looking to refine an existing workflow, understanding <strong>${finalKeyword}</strong> is essential for long-term success. This guide breaks down the practical steps, tools, and strategies that professionals use to get measurable results. Every section is structured to give you actionable takeaways you can apply right away.</p>\n`;

  // 2. Generate sections based on outline
  const headingsToProcess = outline.length > 0 ? outline : [
    { id: '1', type: 'H2', text: 'Understanding the Foundations', wordCountTarget: 300 },
    { id: '2', type: 'H2', text: 'Core Methodologies & Architecture', wordCountTarget: 300 },
    { id: '3', type: 'H3', text: 'Implementation Details', wordCountTarget: 200 },
    { id: '4', type: 'H2', text: 'Optimizing and Measuring Performance', wordCountTarget: 300 },
    { id: '5', type: 'H2', text: 'Industry Best Practices', wordCountTarget: 300 },
    { id: '6', type: 'H2', text: 'Conclusion and Next Steps', wordCountTarget: 200 }
  ] as HeadingItem[];

  const usedSentences = new Set<string>();
  let lastImageHeadingIndex = 0;

  headingsToProcess.forEach((heading, index) => {
    const textLower = heading.text.toLowerCase();
    const ent1 = finalEntities[index % finalEntities.length];
    const ent2 = finalEntities[(index + 1) % finalEntities.length];
    const ng1 = finalNGrams[index % finalNGrams.length];
    const ng2 = finalNGrams[(index + 2) % finalNGrams.length] || finalNGrams[0];

    const headingTag = heading.type.toLowerCase();
    articleHtml += `<${headingTag}>${heading.text}</${headingTag}>\n`;

    // Insert at most ONE additional unique image (only for H2 headings, max 3 images total in article, spaced out by 3+ headings)
    if (heading.type === 'H2' && index > 0 && (index - lastImageHeadingIndex) >= 3 && usedImageIndices.size < Math.min(3, curatedImages.length)) {
      // Find the next unused image index
      let imgIndex = -1;
      for (let ci = 1; ci < curatedImages.length; ci++) {
        if (!usedImageIndices.has(ci)) {
          imgIndex = ci;
          break;
        }
      }
      if (imgIndex !== -1) {
        usedImageIndices.add(imgIndex);
        lastImageHeadingIndex = index;
        const img = curatedImages[imgIndex];
        articleHtml += `<img src="${img.imageUrl}" alt="${img.title}" class="rounded-xl max-w-full h-auto border border-[#2a315c] my-6 shadow-md" />\n`;
      }
    }

    if (textLower.includes('intro') || textLower.includes('welcome') || textLower.includes('start') || textLower.includes('overview') || index === 0) {
      const matched = getMatchingCompetitorSentences(heading.text, competitorContent, [ent1, ent2], [ng1, ng2], usedSentences, 3);
      const s1 = matched[0] || `Before diving into the specifics, it helps to understand what ${heading.text.toLowerCase()} actually involves and why it matters for <strong>${finalKeyword}</strong>. The difference between a good outcome and a great one often comes down to preparation.`;
      const s2 = matched[1] || `Tools like <strong>${ent1}</strong> give teams a concrete starting point by surfacing real data instead of guesswork. When you base your decisions on actual metrics, the results tend to speak for themselves.`;
      const s3 = matched[2] || `One pattern that consistently appears across successful projects is a focus on <strong>${ng1}</strong>. Getting this right early saves significant rework later in the process.`;
      
      articleHtml += `
        <p>${s1}</p>
        <p>${s2}</p>
        <p>${s3}</p>
      `;
    } else if (textLower.includes('conclusion') || textLower.includes('summary') || textLower.includes('final') || textLower.includes('outro') || index === headingsToProcess.length - 1) {
      const matched = getMatchingCompetitorSentences(heading.text, competitorContent, [ent1, ent2], [ng1, ng2], usedSentences, 3);
      const s1 = matched[0] || `Getting <strong>${finalKeyword}</strong> right is not a one-time effort — it requires ongoing attention and regular adjustments based on what the data tells you.`;
      const s2 = matched[1] || `Start with the fundamentals covered in this guide, leverage platforms like <strong>${ent1}</strong> and <strong>${ent2}</strong> for tracking, and build from there.`;
      const s3 = matched[2] || `The teams that see the best results are the ones that treat <strong>${ng2}</strong> as a continuous process rather than a checklist item. Stay consistent, measure everything, and iterate.`;

      articleHtml += `
        <p>${s1}</p>
        <p>${s2}</p>
        <p>${s3}</p>
      `;
    } else {
      articleHtml += getKeywordAwareLayout(heading.text, index, finalKeyword, ent1, ent2, ng1, ng2, competitorContent, usedSentences);
    }
  });

  return articleHtml;
}

export async function POST(req: NextRequest) {
  try {
    const { 
      mode = 'write',
      existingContent = '',
      recommendations = [],
      targetWords = 2000,
      prompt, 
      apiKeys = {}, 
      outline = [], 
      keyword = '', 
      entities = [], 
      ngrams = [],
      provider = 'openai',
      competitorContent = ''
    } = await req.json();

    const openAiKey = apiKeys.openai || process.env.OPENAI_API_KEY;
    const geminiKey = apiKeys.gemini || process.env.GEMINI_API_KEY;
    const deepseekKey = apiKeys.deepseek || process.env.DEEPSEEK_API_KEY;

    // --- Mode: Outline Generation ---
    if (mode === 'outline') {
      const outlinePrompt = `You are an expert SEO Content Planner. I need a comprehensive, logical article outline for the primary keyword: "${keyword}".
Generate between 5 to 10 headings. If the keyword implies a list, comparison, or ranking (like "best", "top", "reviews"), you MUST include specific, popular items (e.g., specific software names, tools, or products) as H3 subheadings.
Return ONLY a valid JSON array of objects with exactly two keys: "type" (must be "H2", "H3", or "H4") and "text" (the heading title). Do not include markdown code block formatting or backticks.`;

      // A. OpenAI Outline
      if (openAiKey && provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are an SEO outline generator. Return ONLY raw JSON array. No conversational intro/outro text, no backticks, no markdown formatting.' },
              { role: 'user', content: outlinePrompt }
            ],
            temperature: 0.5,
          })
        });

        if (response.ok) {
          const data = await response.json();
          let content = data.choices?.[0]?.message?.content || '';
          content = content.replace(/```json/gi, '').replace(/```/gi, '').trim();
          return NextResponse.json({ outline: JSON.parse(content) });
        }
      }

      // B. Gemini Outline
      if (geminiKey && provider === 'gemini') {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { parts: [{ text: outlinePrompt }] }
            ],
            generationConfig: { temperature: 0.5 }
          })
        });

        if (response.ok) {
          const data = await response.json();
          let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
          return NextResponse.json({ outline: JSON.parse(text) });
        }
      }

      // C. DeepSeek Outline
      if (deepseekKey && provider === 'deepseek') {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${deepseekKey}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: 'You are an SEO outline generator. Return ONLY raw JSON array. No conversational intro/outro text, no backticks, no markdown formatting.' },
              { role: 'user', content: outlinePrompt }
            ],
            temperature: 0.5,
          })
        });

        if (response.ok) {
          const data = await response.json();
          let content = data.choices?.[0]?.message?.content || '';
          content = content.replace(/```json/gi, '').replace(/```/gi, '').trim();
          return NextResponse.json({ outline: JSON.parse(content) });
        }
      }

      // D. Smart Offline Outline Fallback based on keyword
      const kwLower = keyword.toLowerCase();
      let fallbackOutline = [];
      if (kwLower.includes('video') || kwLower.includes('edit') || kwLower.includes('design') || kwLower.includes('photo') || kwLower.includes('audio') || kwLower.includes('graphic') || kwLower.includes('creative') || kwLower.includes('pc') || kwLower.includes('software')) {
        if (kwLower.includes('mobile') || kwLower.includes('phone') || kwLower.includes('android') || kwLower.includes('ios') || kwLower.includes('iphone') || kwLower.includes('ipad') || kwLower.includes('app ') || kwLower.endsWith('app') || kwLower.includes('apps')) {
          fallbackOutline = [
            { type: 'H2', text: 'Introduction to Mobile Video Editing in 2026' },
            { type: 'H2', text: 'Key Requirements for Mobile Video Apps' },
            { type: 'H2', text: 'Top Mobile Video Editing Apps Ranked' },
            { type: 'H3', text: '1. CapCut Mobile (Best Overall)' },
            { type: 'H3', text: '2. LumaFusion (Best for iOS Professionals)' },
            { type: 'H3', text: '3. KineMaster (Best Multi-Track Editor)' },
            { type: 'H2', text: 'Comparison Criteria: How to Choose a Mobile Editor' },
            { type: 'H2', text: 'Conclusion and Final Recommendations' }
          ];
        } else {
          fallbackOutline = [
            { type: 'H2', text: 'Introduction to PC Video Editing in 2026' },
            { type: 'H2', text: 'Key Hardware Requirements for PC Editors' },
            { type: 'H2', text: 'Top Video Editing Software Ranked' },
            { type: 'H3', text: '1. Adobe Premiere Pro (Best Overall)' },
            { type: 'H3', text: '2. DaVinci Resolve (Best for Color Grading)' },
            { type: 'H3', text: '3. CyberLink PowerDirector (Best for Beginners)' },
            { type: 'H2', text: 'Comparison Criteria: What to Look For' },
            { type: 'H2', text: 'Conclusion and Final Recommendations' }
          ];
        }
      } else if (kwLower.includes('health') || kwLower.includes('medical') || kwLower.includes('fit') || kwLower.includes('diet') || kwLower.includes('nutrition')) {
        fallbackOutline = [
          { type: 'H2', text: 'Understanding Healthy Living and Wellness' },
          { type: 'H2', text: 'Core Pillars of Fitness and Strength' },
          { type: 'H2', text: 'Top Recommended Diet Plans' },
          { type: 'H3', text: '1. Mediterranean Diet (Best for Heart Health)' },
          { type: 'H3', text: '2. DASH Diet (Best for Hypertension)' },
          { type: 'H3', text: '3. Plant-Based Diet (Best for Longevity)' },
          { type: 'H2', text: 'Developing a Personalized Routine' },
          { type: 'H2', text: 'Summary of Expert Recommendations' }
        ];
      } else if (kwLower.includes('finance') || kwLower.includes('money') || kwLower.includes('crypto') || kwLower.includes('invest')) {
        fallbackOutline = [
          { type: 'H2', text: 'Introduction to Modern Wealth Management' },
          { type: 'H2', text: 'Core Investment Strategies for 2026' },
          { type: 'H2', text: 'Top Trading and Investing Platforms' },
          { type: 'H3', text: '1. Coinbase (Best for Cryptocurrency)' },
          { type: 'H3', text: '2. Vanguard (Best for Long-Term Index Funds)' },
          { type: 'H3', text: '3. Robinhood (Best for Active Retail Traders)' },
          { type: 'H2', text: 'Risk Management and Portfolio Allocation' },
          { type: 'H2', text: 'Conclusion and Next Steps' }
        ];
      } else {
        fallbackOutline = [
          { type: 'H2', text: 'Understanding the Foundations of ' + keyword },
          { type: 'H2', text: 'Core Methodologies & Architecture' },
          { type: 'H3', text: 'Key Pillars of Success' },
          { type: 'H3', text: 'Common Obstacles to Avoid' },
          { type: 'H2', text: 'Step-by-Step Implementation Guide' },
          { type: 'H2', text: 'Measuring Performance & Optimization' },
          { type: 'H2', text: 'Conclusion and Summary' }
        ];
      }
      return NextResponse.json({ outline: fallbackOutline });
    }

    // --- Dynamic Image Searching based on Keyword ---
    let imageUrls: string[] = [];
    const serperKey = apiKeys.serper || process.env.SERPER_API_KEY;
    const targetKw = keyword || (prompt ? (prompt.split('\n')[0] || '').replace('PRIMARY KEYWORD:', '').trim() : 'SEO');
    
    if (serperKey && targetKw) {
      try {
        const imageRes = await fetch('https://google.serper.dev/images', {
          method: 'POST',
          headers: {
            'X-API-KEY': serperKey.trim(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ q: targetKw }),
        });
        if (imageRes.ok) {
          const imageData = await imageRes.json();
          const rawImages = imageData.images || [];
          imageUrls = rawImages
            .filter((img: any) => {
              const title = (img.title || '').toLowerCase();
              const brandingKeywords = ['logo', 'icon', 'symbol', 'vector', 'transparent', 'png', 'svg', 'watermark'];
              return !brandingKeywords.some(kw => title.includes(kw));
            })
            .map((img: any) => img.imageUrl)
            .slice(0, 3);
        }
      } catch (e) {
        console.error('Failed to fetch images during generation:', e);
      }
    }

    if (imageUrls.length < 3 && targetKw) {
      try {
        const wikiImages = await fetchWikimediaImages(targetKw);
        const wikiUrls = wikiImages.map(img => img.imageUrl);
        imageUrls = [...new Set([...imageUrls, ...wikiUrls])];
      } catch (e) {
        console.error('Failed to fetch fallback Wikimedia images:', e);
      }
    }

    if (imageUrls.length < 3 && targetKw) {
      try {
        const openverseImages = await fetchOpenverseImages(targetKw);
        const openverseUrls = openverseImages.map(img => img.imageUrl);
        imageUrls = [...new Set([...imageUrls, ...openverseUrls])];
      } catch (e) {
        console.error('Failed to fetch fallback Openverse images:', e);
      }
    }

    if (imageUrls.length < 3) {
      const curated = getCategoryRelevantImages(targetKw);
      const curatedUrls = curated.map(img => img.imageUrl);
      imageUrls = [...new Set([...imageUrls, ...curatedUrls])];
    }

    // Deduplicate image URLs to avoid passing the same URL multiple times to the LLM
    const uniqueImageUrls = [...new Set(imageUrls)].slice(0, 3);
    
    if (uniqueImageUrls.length < 3) {
      const curated = getCategoryRelevantImages(targetKw);
      for (const img of curated) {
        if (!uniqueImageUrls.includes(img.imageUrl)) {
          uniqueImageUrls.push(img.imageUrl);
        }
        if (uniqueImageUrls.length >= 3) break;
      }
    }

    let activePrompt = prompt;
    if (mode === 'optimize') {
      activePrompt = `You are a senior human editor rewriting a draft article about "${targetKw}".

Your job is to transform this draft into a polished, publication-ready article that reads like it was written by a subject-matter expert — not an AI.

<CURRENT_DRAFT>
${existingContent}
</CURRENT_DRAFT>

<TARGET_OUTLINE>
${outline.map((h: any) => `- [${h.type}] ${h.text} (target ~${h.wordCountTarget || 200} words)`).join('\n')}
</TARGET_OUTLINE>

<OPTIMIZATION_TASKS>
You MUST address every single one of these:
${recommendations.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}
</OPTIMIZATION_TASKS>

<RULES>
- Keep all existing H2/H3/H4 headings. Add any missing headings from the outline.
- Write naturally. Use short sentences mixed with longer ones. Vary paragraph length. Include specific numbers, examples, and comparisons where relevant.
- Do NOT use phrases like "In today's digital landscape", "it's important to note", "in conclusion", "dive into", "game-changer", "cutting-edge", "leverage", "harness the power", "take your X to the next level". Write like a real person.
- Each under-optimized keyword from the tasks above must appear at least 2-3 times naturally in the body text.
- Each overstuffed keyword must be reduced to 3-4 mentions maximum — replace extras with synonyms.
- The final article MUST be at least ${targetWords} words. Expand thin sections with real substance: examples, data points, how-to details, or comparisons.
- If no <img> tags exist in the draft, insert exactly ONE image using this URL:
  ${uniqueImageUrls[0] || ''}
  with a descriptive alt attribute. Do NOT insert more than 2 images total.
- Return ONLY clean HTML (H2, H3, H4, P, UL, OL, LI, STRONG, EM, IMG, TABLE tags). No markdown fences, no backticks, no conversational text before or after.
</RULES>`;
    } else if (mode === 'write') {
      // Build a structured write prompt that produces high-quality content
      // Ensure we have at least 2 distinct image URLs for top and mid placement
      const img1 = uniqueImageUrls[0] || '';
      const img2 = uniqueImageUrls[1] || uniqueImageUrls[0] || '';
      const imageInstruction = img1
        ? `\n\nIMAGE PLACEMENT RULES (STRICTLY FOLLOW):\n- Insert exactly ONE <img> tag near the top of the article (after the first paragraph) using this URL:\n  IMAGE_1: ${img1}\n- Insert exactly ONE more <img> tag roughly in the middle of the article using this URL:\n  IMAGE_2: ${img2}\n- Each <img> MUST have a unique, descriptive alt attribute relevant to its placement context.\n- Do NOT use IMAGE_1 and IMAGE_2 interchangeably — IMAGE_1 goes near the top, IMAGE_2 goes in the middle.\n- Do NOT insert more than 2 images total. Do NOT repeat the same URL twice.`
        : '';
      const totalWordTarget = targetWords || outline.reduce((sum: number, h: any) => sum + (h.wordCountTarget || 200), 0) || 2000;
      activePrompt = `${prompt}${imageInstruction}\n\nCRITICAL WRITING RULES:\n- TOTAL WORD COUNT TARGET: Write exactly ${totalWordTarget} words of body text (±10%). Do NOT write more. If you reach the target before all headings, trim each section proportionally. If you finish all headings under target, expand the last few sections.\n- Write like a knowledgeable human, not a marketing brochure. Mix short punchy sentences with detailed explanations.\n- Do NOT use cliché phrases: "In today's digital landscape", "game-changer", "harness the power", "take it to the next level", "dive into", "it's important to note".\n- Include specific examples, numbers, and comparisons to make each section substantive.\n- Return ONLY clean HTML (H2, H3, H4, P, UL, OL, LI, STRONG, EM, IMG, TABLE tags). No markdown fences or backticks.`;
    }

    // A. Check for OpenAI Generation
    if (provider === 'openai' && openAiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a senior content writer who produces detailed, human-quality articles. Your writing sounds natural — like a knowledgeable person explaining something to a peer. You vary sentence length, include specific examples and data, and avoid generic filler. Output valid clean HTML only (H2, H3, H4, P, UL, OL, LI, STRONG, EM, IMG, TABLE tags — no HTML head/body wraps, no markdown fences). IMPORTANT: Always complete every section fully. Never stop mid-sentence or mid-section.'
            },
            {
              role: 'user',
              content: activePrompt
            }
          ],
          temperature: 0.72,
          max_tokens: 8192
        })
      });

      if (response.ok) {
        const data = await response.json();
        let content = data.choices?.[0]?.message?.content || '';
        content = content.replace(/```html/gi, '').replace(/```/gi, '').trim();
        return NextResponse.json({ content: sanitizeImages(content) });
      } else {
        const errText = await response.text();
        console.error('OpenAI Error:', errText);
      }
    }

    // B. Check for Gemini Generation
    if (provider === 'gemini' && geminiKey) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: activePrompt
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.72
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        let content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        // Clean markdown backticks if any
        content = content.replace(/```html/g, '').replace(/```/g, '');
        return NextResponse.json({ content: sanitizeImages(content.trim()) });
      } else {
        const errText = await response.text();
        console.error('Gemini Error:', errText);
      }
    }

    // C. Check for DeepSeek Generation
    if (provider === 'deepseek' && deepseekKey) {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a senior content writer who produces detailed, human-quality articles. Your writing sounds natural — like a knowledgeable person explaining something to a peer. You vary sentence length, include specific examples and data, and avoid generic filler. Output valid clean HTML only (H2, H3, H4, P, UL, OL, LI, STRONG, EM, IMG, TABLE tags — no HTML head/body wraps, no markdown fences). IMPORTANT: Always complete every section fully. Never stop mid-sentence or mid-section.'
            },
            {
              role: 'user',
              content: activePrompt
            }
          ],
          temperature: 0.72,
          max_tokens: 8192
        })
      });

      if (response.ok) {
        const data = await response.json();
        let content = data.choices?.[0]?.message?.content || '';
        content = content.replace(/```html/gi, '').replace(/```/gi, '').trim();
        return NextResponse.json({ content: sanitizeImages(content) });
      } else {
        const errText = await response.text();
        console.error('DeepSeek Error:', errText);
      }
    }

    // D. Offline Fallback
    if (mode === 'optimize') {
      const toAddMap = new Map<string, number>();
      const toTrim: string[] = [];
      
      recommendations.forEach((rec: string) => {
        const match = rec.match(/"([^"]+)"/);
        if (match && match[1]) {
          const kw = match[1];
          if (rec.toLowerCase().includes('add "') || rec.toLowerCase().includes('under-optimized: add "') || rec.toLowerCase().includes('need at least')) {
            const needMatch = rec.match(/need at least (\d+)/);
            const currentMatch = rec.match(/currently (\d+) mentions/);
            const need = needMatch ? parseInt(needMatch[1], 10) : 4;
            const current = currentMatch ? parseInt(currentMatch[1], 10) : 0;
            const times = Math.max(1, need - current);
            toAddMap.set(kw, Math.max(toAddMap.get(kw) || 0, times));
          } else if (rec.toLowerCase().includes('reduce "') || rec.toLowerCase().includes('stuffing detected: reduce "') || rec.toLowerCase().includes('limit is')) {
            toTrim.push(kw);
          }
        }
      });

      const toAdd = Array.from(toAddMap.entries()).map(([kw, times]) => ({ kw, times }));

      const finalKeyword = targetKw || 'SEO Optimization';
      const finalEntities = entities.length >= 2 ? entities : getKeywordRelevantEntities(finalKeyword);
      const finalNGrams = ngrams.length >= 2 ? ngrams : getKeywordRelevantNGrams(finalKeyword);
      const usedSentences = new Set<string>();

      // Parse existing sections
      const existingSections = parseSections(existingContent);
      const finalSections: Section[] = [];

      // Preserve intro content if any
      const introSec = existingSections.find(s => s.headingType === 'INTRO');
      if (introSec) {
        finalSections.push(introSec);
      }

      // Rebuild matching the outline
      outline.forEach((outlineItem: any, index: number) => {
        const normOutlineText = normalizeText(outlineItem.text);
        const matchedSection = existingSections.find(s => 
          s.headingType === outlineItem.type && 
          (normalizeText(s.headingText).includes(normOutlineText) || normOutlineText.includes(normalizeText(s.headingText)))
        );

        if (matchedSection) {
          finalSections.push(matchedSection);
        } else {
          // Generate new section matching the missing outline heading
          const ent1 = finalEntities[index % finalEntities.length];
          const ent2 = finalEntities[(index + 1) % finalEntities.length];
          const ng1 = finalNGrams[index % finalNGrams.length];
          const ng2 = finalNGrams[(index + 2) % finalNGrams.length] || finalNGrams[0];

          let content = '';
          const textLower = outlineItem.text.toLowerCase();

          if (textLower.includes('intro') || textLower.includes('welcome') || textLower.includes('start') || textLower.includes('overview') || index === 0) {
            const matched = getMatchingCompetitorSentences(outlineItem.text, competitorContent, [ent1, ent2], [ng1, ng2], usedSentences, 3);
            const s1 = matched[0] || `As we begin exploring the dimensions of <strong>${outlineItem.text}</strong>, establishing a solid contextual foundation is essential. In many respects, aligning your objectives with <strong>${finalKeyword}</strong> is the first step toward building a highly resilient strategy.`;
            const s2 = matched[1] || `A key aspect of this initial phase involves utilizing modern platforms like <strong>${ent1}</strong> to analyze baselines and discover hidden opportunities. By maintaining a clean workflow, teams can prepare their environment for future scaling.`;
            const s3 = matched[2] || `Furthermore, keeping a strong focus on <strong>${ng1}</strong> ensures that the experience remains intuitive and highly performant. Simple, transparent workflows often outperform over-engineered alternatives.`;
            content = `<p>${s1}</p><p>${s2}</p><p>${s3}</p>`;
          } else if (textLower.includes('conclusion') || textLower.includes('summary') || textLower.includes('final') || textLower.includes('outro') || index === outline.length - 1) {
            const matched = getMatchingCompetitorSentences(outlineItem.text, competitorContent, [ent1, ent2], [ng1, ng2], usedSentences, 3);
            const s1 = matched[0] || `In conclusion, establishing a robust framework for <strong>${outlineItem.text}</strong> is a continuous journey of testing, learning, and refinement. Achieving long-term efficiency in <strong>${finalKeyword}</strong> relies on standardizing quality controls.`;
            const s2 = matched[1] || `We encourage you to integrate reliable insights from tools like <strong>${ent1}</strong> directly into your active pipelines. Focus on automating routine checks with <strong>${ent2}</strong> to measure your progress.`;
            const s3 = matched[2] || `By keeping a close eye on your <strong>${ng2}</strong> metrics and eliminating redundant steps, you can build a system that is both agile and highly performant for years to come.`;
            content = `<p>${s1}</p><p>${s2}</p><p>${s3}</p>`;
          } else {
            content = getKeywordAwareLayout(outlineItem.text, index, finalKeyword, ent1, ent2, ng1, ng2, competitorContent, usedSentences);
          }

          const tag = outlineItem.type.toLowerCase();
          finalSections.push({
            headingType: outlineItem.type,
            headingText: outlineItem.text,
            headingHtml: `<${tag}>${outlineItem.text}</${tag}>`,
            contentHtml: content
          });
        }
      });

      // Keep any custom user-added sections not present in outline
      existingSections.forEach(s => {
        if (s.headingType === 'INTRO') return;
        const inOutline = outline.some((oi: any) => 
          oi.type === s.headingType && 
          (normalizeText(oi.text).includes(normalizeText(s.headingText)) || normalizeText(s.headingText).includes(normalizeText(oi.text)))
        );
        if (!inOutline) {
          finalSections.push(s);
        }
      });

      // Elaborate thin sections if total word count is still under target
      let optimizedText = finalSections.map(s => {
        if (s.headingType === 'INTRO') return s.contentHtml;
        return `${s.headingHtml}\n${s.contentHtml}`;
      }).join('\n');

      let currentWordCount = optimizedText.split(/\s+/).filter(Boolean).length;
      if (currentWordCount < targetWords) {
        const sectionsToElaborate = finalSections.filter(s => s.headingType !== 'INTRO');
        if (sectionsToElaborate.length > 0) {
          let sectionIndex = 0;
          let attempts = 0;
          const maxAttempts = 150; // Safe threshold to prevent infinite loops
          while (currentWordCount < targetWords && attempts < maxAttempts) {
            const sec = sectionsToElaborate[sectionIndex % sectionsToElaborate.length];
            const ent1 = finalEntities[sectionIndex % finalEntities.length];
            const ng1 = finalNGrams[sectionIndex % finalNGrams.length];
            
            const matched = getMatchingCompetitorSentences(sec.headingText, competitorContent, [ent1], [ng1], usedSentences, 2);
            let elaboration = '';
            if (matched.length > 0) {
              elaboration = `<p>${matched.join(' ')}</p>`;
            } else {
              const generalTemplates = [
                `<p>Looking more closely at <strong>${sec.headingText}</strong>, one thing becomes clear: teams that track their <strong>${ng1}</strong> metrics from the start make fewer costly mistakes later. <strong>${ent1}</strong> makes this easier by providing real-time visibility into what is working and what is not.</p>`,
                `<p>A common mistake here is skipping the testing phase. Even a quick audit of your current setup can reveal gaps that would otherwise go unnoticed. Professionals who work with <strong>${ent1}</strong> regularly recommend running periodic checks to stay ahead of issues.</p>`,
                `<p>The practical value of this approach shows up in the numbers. Organizations that maintain consistent quality standards for <strong>${ng1}</strong> typically see better results with less rework. Small, regular improvements add up faster than occasional large overhauls.</p>`,
                `<p>What separates good results from great ones in this area is attention to detail. Double-checking your <strong>${ng1}</strong> settings and validating outputs against known benchmarks keeps everything running smoothly as you scale.</p>`,
                `<p>For teams working with <strong>${ent1}</strong>, the recommended practice is to establish a review cadence \u2014 weekly for active projects, monthly for maintenance. This habit catches drift early and keeps your <strong>${ng1}</strong> performance on track.</p>`
              ];
              const templateIdx = (getStringHash(sec.headingText) + sectionIndex) % generalTemplates.length;
              elaboration = generalTemplates[templateIdx];
            }
            
            sec.contentHtml += `\n${elaboration}`;
            
            optimizedText = finalSections.map(s => {
              if (s.headingType === 'INTRO') return s.contentHtml;
              return `${s.headingHtml}\n${s.contentHtml}`;
            }).join('\n');
            currentWordCount = optimizedText.split(/\s+/).filter(Boolean).length;
            sectionIndex++;
            attempts++;
          }
        }
      }

      // Add under-optimized keywords naturally (density/mentions times)
      if (toAdd.length > 0) {
        const paragraphs = optimizedText.split('</p>');
        if (paragraphs.length > 1) {
          let paragraphIndex = 0;
          toAdd.forEach(({ kw, times }) => {
            for (let t = 0; t < times; t++) {
              let matchedSentence = '';
              const compContentStr = (competitorContent || '') as string;
              if (compContentStr && compContentStr.length > 100) {
                const sentences = compContentStr.split(/(?<=[.!?])\s+/).map(s => s.trim());
                const match = sentences.find(s => s.toLowerCase().includes(kw.toLowerCase()) && s.length > 30 && s.length < 200 && !usedSentences.has(s));
                if (match) {
                  matchedSentence = match;
                  usedSentences.add(match);
                }
              }

              if (!matchedSentence) {
                const templates = [
                  `Working with <strong>${kw}</strong> is a standard part of most professional setups.`,
                  `Teams that prioritize <strong>${kw}</strong> tend to avoid the most common pitfalls.`,
                  `Getting <strong>${kw}</strong> right early makes everything downstream easier to manage.`,
                  `<strong>${kw}</strong> plays a direct role in the quality of your final output.`,
                  `Experienced practitioners recommend reviewing <strong>${kw}</strong> at regular intervals.`,
                  `Skipping <strong>${kw}</strong> often leads to issues that are expensive to fix later.`
                ];
                const templateIndex = (getStringHash(kw) + paragraphIndex + t) % templates.length;
                matchedSentence = templates[templateIndex];
              }

              const pIdx = paragraphIndex % (paragraphs.length - 1);
              paragraphs[pIdx] += ` ${matchedSentence}`;
              paragraphIndex++;
            }
          });
          optimizedText = paragraphs.join('</p>');
        } else {
          toAdd.forEach(({ kw, times }) => {
            const listItems = Array.from({ length: times }, (_, t) => {
              return `<li>Focusing on <strong>${kw}</strong> is essential for optimizing system output.</li>`;
            }).join('\n');
            optimizedText += `\n<ul>\n${listItems}\n</ul>\n`;
          });
        }
      }

      // Reduce frequency of stuffed keywords using case-aware matchCase synonym rotation
      const kwLower = (finalKeyword || '').toLowerCase();
      let synonymPool = ["these approaches", "standard methods", "core processes", "the parameters", "established concepts"];
      if (kwLower.includes('video') || kwLower.includes('edit') || kwLower.includes('design') || kwLower.includes('photo') || kwLower.includes('audio') || kwLower.includes('creative')) {
        synonymPool = ["media suite", "creative workflows", "editing tools", "production software", "the editor", "design systems"];
      } else if (kwLower.includes('software') || kwLower.includes('test') || kwLower.includes('qa') || kwLower.includes('code') || kwLower.includes('develop')) {
        synonymPool = ["efficient platform", "modern solutions", "selected tools", "the systems", "related frameworks", "current utility"];
      }

      toTrim.forEach((kw, index) => {
        const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
        let matchCount = 0;
        optimizedText = optimizedText.replace(regex, (match: string) => {
          matchCount++;
          if (matchCount > 3) {
            const syn = synonymPool[(index + matchCount) % synonymPool.length];
            return matchCase(match, syn);
          }
          return match;
        });
      });

      // Add image if missing
      const imgCount = (optimizedText.match(/<img/gi) || []).length;
      if (imgCount === 0 && imageUrls.length > 0) {
        const firstHeadingEnd = optimizedText.search(/<\/h[2-4]>/i);
        if (firstHeadingEnd !== -1) {
          const tagMatch = optimizedText.match(/<\/h[2-4]>/i);
          const tagEndPos = firstHeadingEnd + (tagMatch ? tagMatch[0].length : 5);
          const imageHtml = `\n<img src="${imageUrls[0]}" alt="${finalKeyword}" class="rounded-xl max-w-full h-auto border border-[#2a315c] my-6 shadow-md" />\n`;
          optimizedText = optimizedText.slice(0, tagEndPos) + imageHtml + optimizedText.slice(tagEndPos);
        } else {
          const imageHtml = `<img src="${imageUrls[0]}" alt="${finalKeyword}" class="rounded-xl max-w-full h-auto border border-[#2a315c] my-6 shadow-md" />\n`;
          optimizedText = imageHtml + optimizedText;
        }
      }

      return NextResponse.json({ content: sanitizeImages(optimizedText) });
    }

    const fallbackContent = await generateOfflineArticle(targetKw, outline, entities, ngrams, competitorContent);
    return NextResponse.json({ content: sanitizeImages(fallbackContent) });
  } catch (error: any) {
    console.error('Generate Route Error:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
