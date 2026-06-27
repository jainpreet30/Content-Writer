import { NextRequest, NextResponse } from 'next/server';

const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
  'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
  'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
  'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
  'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now',
  'com', 'www', 'http', 'https', 'co', 'io'
]);

function getTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .split(/[\s_]+/)
    .filter((token) => token.length > 1);
}

function calculateNGrams(tokens: string[], n: number): Record<string, number> {
  const nGrams: Record<string, number> = {};
  for (let i = 0; i <= tokens.length - n; i++) {
    const gram = tokens.slice(i, i + n).join(' ');
    // Filter out if all words in n-gram are stop words
    const words = gram.split(' ');
    if (words.every(w => STOP_WORDS.has(w))) continue;
    
    nGrams[gram] = (nGrams[gram] || 0) + 1;
  }
  return nGrams;
}

function calculateSkipGrams(tokens: string[], maxSkip: number = 2): Record<string, number> {
  const skipGrams: Record<string, number> = {};
  // Skip grams are pairs of tokens within sliding window of size maxSkip + 2
  for (let i = 0; i < tokens.length; i++) {
    const w1 = tokens[i];
    if (STOP_WORDS.has(w1)) continue;
    
    for (let skip = 0; skip <= maxSkip; skip++) {
      const j = i + 1 + skip;
      if (j >= tokens.length) break;
      const w2 = tokens[j];
      if (STOP_WORDS.has(w2)) continue;
      
      const pair = [w1, w2].sort().join(' '); // sorting makes it direction-agnostic
      skipGrams[pair] = (skipGrams[pair] || 0) + 1;
    }
  }
  return skipGrams;
}

function extractEntities(text: string): string[] {
  // Extract capitalized words or sequences (e.g. Google, Ubersuggest, Semrush)
  const matches = text.match(/\b[A-Z][a-zA-Z0-9-]{2,}\b/g) || [];
  const freq: Record<string, number> = {};
  
  matches.forEach(match => {
    if (STOP_WORDS.has(match.toLowerCase())) return;
    freq[match] = (freq[match] || 0) + 1;
  });
  
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(entry => entry[0]);
}

function generateDynamicTokens(keywordStr: string) {
  const kw = keywordStr ? keywordStr.trim() : 'SEO Tools';
  const kwLower = kw.toLowerCase();
  
  let aiEntities: string[] = [];
  
  if (kwLower.includes('video') || kwLower.includes('edit') || kwLower.includes('design') || kwLower.includes('photo') || kwLower.includes('audio') || kwLower.includes('graphic') || kwLower.includes('render') || kwLower.includes('media') || kwLower.includes('creative')) {
    if (kwLower.includes('mobile') || kwLower.includes('phone') || kwLower.includes('android') || kwLower.includes('ios') || kwLower.includes('iphone') || kwLower.includes('ipad') || kwLower.includes('app ') || kwLower.endsWith('app') || kwLower.includes('apps')) {
      aiEntities = [
        'CapCut Mobile', 'LumaFusion', 'KineMaster', 'InShot App', 'VN Video Editor', 
        'Adobe Premiere Rush', 'Splice App', 'Alight Motion', 'FilmoraGo', 'iMovie Mobile'
      ];
    } else {
      aiEntities = [
        'Adobe Premiere Pro', 'DaVinci Resolve', 'Final Cut Pro', 'CapCut PC', 'Filmora', 
        'Avid Media Composer', 'PowerDirector', 'HitFilm', 'Sony Vegas Pro', 
        'Lightworks', 'Shotcut', 'Adobe After Effects', 'Photoshop', 'Canva'
      ];
    }
  } else if (kwLower.includes('test') || kwLower.includes('qa') || kwLower.includes('quality') || kwLower.includes('automation') || kwLower.includes('software')) {
    aiEntities = [
      'Selenium', 'Appium', 'Cypress', 'Playwright', 'Jira', 'TestRail', 
      'BrowserStack', 'Jenkins', 'GitHub', 'GitLab', 'Clutch', 'GoodFirms', 
      'SonarQube', 'Postman', 'JMeter', 'JUnit', 'TestNG', 'QA outsourcing'
    ];
  } else if (kwLower.includes('health') || kwLower.includes('medical') || kwLower.includes('fitness') || kwLower.includes('doctor') || kwLower.includes('clinic') || kwLower.includes('diet') || kwLower.includes('nutrition') || kwLower.includes('weight')) {
    aiEntities = [
      'Mayo Clinic', 'WebMD', 'Healthline', 'CDC', 'WHO', 'Fitbit', 'MyFitnessPal', 
      'Strava', 'MyPlate', 'PubMed', 'NHS', 'FDA', 'Health Canada', 'Mayo Clinic Proceedings'
    ];
  } else if (kwLower.includes('finance') || kwLower.includes('money') || kwLower.includes('crypto') || kwLower.includes('bitcoin') || kwLower.includes('investing') || kwLower.includes('trading') || kwLower.includes('bank') || kwLower.includes('credit')) {
    aiEntities = [
      'Bloomberg', 'Investopedia', 'Forbes', 'Yahoo Finance', 'Coinbase', 'Binance', 
      'Nasdaq', 'Dow Jones', 'SEC', 'Fidelity', 'Vanguard', 'Robinhood', 'NerdWallet'
    ];
  } else if (kwLower.includes('travel') || kwLower.includes('hotel') || kwLower.includes('flight') || kwLower.includes('tourism') || kwLower.includes('vacation') || kwLower.includes('trip')) {
    aiEntities = [
      'Tripadvisor', 'Booking.com', 'Expedia', 'Airbnb', 'Skyscanner', 'Lonely Planet', 
      'Google Flights', 'Yelp', 'Trivago', 'Kayak', 'Hotels.com'
    ];
  } else if (kwLower.includes('shop') || kwLower.includes('store') || kwLower.includes('buy') || kwLower.includes('ecommerce') || kwLower.includes('retail') || kwLower.includes('business') || kwLower.includes('product')) {
    aiEntities = [
      'Amazon', 'Shopify', 'eBay', 'Etsy', 'Stripe', 'PayPal', 'WooCommerce', 
      'Walmart', 'Target', 'Alibaba', 'Salesforce', 'HubSpot', 'BigCommerce'
    ];
  } else if (kwLower.includes('seo') || kwLower.includes('marketing') || kwLower.includes('content') || kwLower.includes('keyword')) {
    aiEntities = [
      'Ahrefs', 'Semrush', 'Moz', 'Ubersuggest', 'Google Search Console', 
      'Google Analytics', 'Yoast SEO', 'Screaming Frog', 'SpyFu', 'Mangools', 
      'KWFinder', 'AnswerThePublic', 'Surfer SEO', 'RankMath', 'Majestic SEO'
    ];
  } else {
    // Default fallback mixes generic tech/business with general tools
    aiEntities = [
      'Google', 'Microsoft', 'AWS', 'ChatGPT', 'OpenAI', 'Clutch', 'GoodFirms',
      'HubSpot', 'Salesforce', 'Slack', 'Zoom', 'Trello', 'Asana', 'Jira'
    ];
  }

  // Extract words from the keyword to inject as related entities
  const kwWords = kw.split(/\s+/).map(w => w.replace(/[^\w]/g, '')).filter(w => w.length > 2);
  const capitalizedKwWords = kwWords.map(w => w.charAt(0).toUpperCase() + w.slice(1));
  
  // Merge and deduplicate
  aiEntities = [...new Set([...capitalizedKwWords, ...aiEntities])].slice(0, 20);

  const aiPickedNGrams = [
    `top ${kw}`,
    `best ${kw}`,
    `${kw} services`,
    `${kw} guide`,
    `${kw} reviews`,
    `hire ${kw}`,
    `outsourcing ${kw}`,
    `compare ${kw}`,
    `quality ${kw}`,
    `enterprise ${kw}`
  ];

  const aiGeneratedNGrams = [
    `${kw} for startups`,
    `affordable ${kw}`,
    `free ${kw}`,
    `custom ${kw} solutions`,
    `trusted ${kw} agency`,
    `local ${kw} near me`,
    `${kw} checklist`,
    `cheap ${kw}`,
    `professional ${kw}`
  ];

  const uniqueNGrams = [
    `bootstrapped ${kw} strategies`,
    `niche ${kw} benchmarks`,
    `frugal founder ${kw} manual`,
    `stealth ${kw} audit checklist`,
    `on-demand ${kw} sprint cycles`,
    `industry-leading ${kw} frameworks`
  ];

  return {
    aiEntities,
    aiPickedNGrams,
    aiGeneratedNGrams,
    uniqueNGrams
  };
}

export async function POST(req: NextRequest) {
  try {
    const { text = '', keyword = '' } = await req.json();

    const tokens = text ? getTokens(text) : [];

    // 1. Entities
    const entities = text ? extractEntities(text) : [];

    // 2. N-Grams (2-grams and 3-grams)
    const biGrams = text ? calculateNGrams(tokens, 2) : {};
    const triGrams = text ? calculateNGrams(tokens, 3) : {};
    const combinedNGrams = { ...biGrams, ...triGrams };

    const sortedNGrams = Object.entries(combinedNGrams)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(entry => entry[0]);

    // 3. Skip-Grams
    const skipGramsMap = text ? calculateSkipGrams(tokens, 2) : {};
    const sortedSkipGrams = Object.entries(skipGramsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(entry => entry[0]);

    // 4. NLP / LSI Keywords (Highly frequent 1-grams that are not stop words)
    const uniGrams = text ? calculateNGrams(tokens, 1) : {};
    const sortedNLP = Object.entries(uniGrams)
      .filter(([word]) => !STOP_WORDS.has(word))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40)
      .map(entry => entry[0]);

    // Generate dynamic fallback tokens based on the query keyword
    const { aiEntities, aiPickedNGrams, aiGeneratedNGrams, uniqueNGrams } = generateDynamicTokens(keyword);

    return NextResponse.json({
      entities: {
        competitor: entities,
        ai: aiEntities,
      },
      nGrams: {
        competitor: sortedNGrams,
        aiPicked: aiPickedNGrams,
        aiGenerated: aiGeneratedNGrams,
        unique: uniqueNGrams,
      },
      nlpKeywords: sortedNLP,
      skipGrams: sortedSkipGrams,
    });
  } catch (error: any) {
    console.error('NLP API Error:', error);
    return NextResponse.json({ error: 'NLP processing failed' }, { status: 500 });
  }
}
