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

// ─── Detect keyword intent type ───────────────────────────────────────────────
type KeywordIntent = 'informational' | 'commercial' | 'navigational' | 'transactional';

function detectIntent(kw: string): KeywordIntent {
  const kwLower = kw.toLowerCase();
  const informationalPatterns = [
    /^what (is|are|does|do)/,
    /^how (to|does|do|can)/,
    /^why (is|are|does|do)/,
    /^when (is|are|does|do)/,
    /^(introduction|intro) to/,
    /\b(explained?|definition|meaning|overview|guide|tutorial|understand|learn|examples?)\b/,
    /\b(vs|versus|difference between|compare)\b/,
    /\b(types? of|kinds? of|categories? of|list of)\b/
  ];
  const commercialPatterns = [
    /\b(best|top|review|hire|agency|service|company|firm|provider|software|tool|platform|price|cost|cheap|affordable)\b/
  ];

  if (informationalPatterns.some(p => p.test(kwLower))) return 'informational';
  if (commercialPatterns.some(p => p.test(kwLower))) return 'commercial';
  return 'informational'; // default to informational — safer than commercial
}

// ─── Extract the core subject from "What is X" style keywords ─────────────────
function extractCoreTopic(kw: string): string {
  return kw
    .replace(/^(what (is|are)|how (to|does|do|can)|why (is|are)|introduction to|intro to)\s+/i, '')
    .replace(/\s+(explained?|definition|meaning|overview|guide|tutorial)$/i, '')
    .trim();
}

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
    const words = gram.split(' ');
    if (words.every(w => STOP_WORDS.has(w))) continue;
    nGrams[gram] = (nGrams[gram] || 0) + 1;
  }
  return nGrams;
}

function calculateSkipGrams(tokens: string[], maxSkip: number = 2): Record<string, number> {
  const skipGrams: Record<string, number> = {};
  for (let i = 0; i < tokens.length; i++) {
    const w1 = tokens[i];
    if (STOP_WORDS.has(w1)) continue;
    for (let skip = 0; skip <= maxSkip; skip++) {
      const j = i + 1 + skip;
      if (j >= tokens.length) break;
      const w2 = tokens[j];
      if (STOP_WORDS.has(w2)) continue;
      const pair = [w1, w2].sort().join(' ');
      skipGrams[pair] = (skipGrams[pair] || 0) + 1;
    }
  }
  return skipGrams;
}

function extractEntities(text: string): string[] {
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

// ─── Generate intent-aware dynamic tokens ─────────────────────────────────────
function generateDynamicTokens(keywordStr: string) {
  const kw = keywordStr ? keywordStr.trim() : 'topic';
  const kwLower = kw.toLowerCase();
  const intent = detectIntent(kw);
  const coreTopic = extractCoreTopic(kw);
  const coreTopicLower = coreTopic.toLowerCase();

  let aiEntities: string[] = [];
  let aiPickedNGrams: string[] = [];
  let aiGeneratedNGrams: string[] = [];
  let uniqueNGrams: string[] = [];

  // ── Informational / Educational intent ────────────────────────────────────
  if (intent === 'informational') {

    // AI / Machine Learning / Neural Networks / NLP / Deep Learning
    if (coreTopicLower.includes('neural') || coreTopicLower.includes('rnn') || coreTopicLower.includes('lstm') || coreTopicLower.includes('deep learning') || coreTopicLower.includes('machine learning') || coreTopicLower.includes('ai') || coreTopicLower.includes('artificial intelligence') || coreTopicLower.includes('nlp') || coreTopicLower.includes('transformer') || coreTopicLower.includes('gpt') || coreTopicLower.includes('language model') || coreTopicLower.includes('computer vision') || coreTopicLower.includes('reinforcement')) {
      aiEntities = ['TensorFlow', 'PyTorch', 'Keras', 'scikit-learn', 'Hugging Face', 'Google Brain', 'DeepMind', 'NVIDIA CUDA', 'Jupyter Notebook', 'Python', 'NumPy', 'pandas'];
      aiPickedNGrams = [`${coreTopic} architecture`, `${coreTopic} explained`, `how ${coreTopic} works`, `${coreTopic} vs transformer`, `${coreTopic} applications`, `${coreTopic} training`];
      aiGeneratedNGrams = ['backpropagation through time', 'vanishing gradient problem', 'sequence to sequence model', 'hidden state memory', 'recurrent connections', 'gradient descent optimization'];
      uniqueNGrams = ['long short-term memory', 'gated recurrent unit', 'bidirectional neural network', 'attention mechanism', 'encoder decoder architecture', 'natural language processing pipeline'];
    }

    // Mathematics / Statistics / Data Science
    else if (coreTopicLower.includes('algorithm') || coreTopicLower.includes('data science') || coreTopicLower.includes('statistic') || coreTopicLower.includes('math') || coreTopicLower.includes('calculus') || coreTopicLower.includes('probability') || coreTopicLower.includes('regression') || coreTopicLower.includes('classification')) {
      aiEntities = ['Python', 'R', 'NumPy', 'pandas', 'scikit-learn', 'Matplotlib', 'Jupyter', 'SciPy', 'Statsmodels'];
      aiPickedNGrams = [`${coreTopic} explained`, `${coreTopic} example`, `${coreTopic} tutorial`, `${coreTopic} in Python`, `${coreTopic} formula`, `${coreTopic} applications`];
      aiGeneratedNGrams = ['statistical inference', 'hypothesis testing', 'feature engineering', 'model evaluation', 'cross-validation', 'overfitting prevention'];
      uniqueNGrams = ['bias-variance tradeoff', 'confusion matrix interpretation', 'ROC AUC score', 'dimensionality reduction', 'ensemble learning'];
    }

    // Programming / Coding / Software Development
    else if (coreTopicLower.includes('programming') || coreTopicLower.includes('coding') || coreTopicLower.includes('python') || coreTopicLower.includes('javascript') || coreTopicLower.includes('java') || coreTopicLower.includes('api') || coreTopicLower.includes('framework') || coreTopicLower.includes('database') || coreTopicLower.includes('sql')) {
      aiEntities = ['GitHub', 'Stack Overflow', 'Visual Studio Code', 'Docker', 'Kubernetes', 'AWS Lambda', 'PostgreSQL', 'MongoDB', 'Redis', 'REST API'];
      aiPickedNGrams = [`${coreTopic} example`, `${coreTopic} tutorial`, `${coreTopic} best practices`, `${coreTopic} interview questions`, `${coreTopic} cheat sheet`];
      aiGeneratedNGrams = ['object oriented programming', 'version control system', 'continuous integration', 'test driven development', 'microservices architecture'];
      uniqueNGrams = ['SOLID principles', 'design patterns', 'clean code practices', 'code review workflow', 'dependency injection'];
    }

    // Biology / Science / Nature
    else if (coreTopicLower.includes('biology') || coreTopicLower.includes('cell') || coreTopicLower.includes('dna') || coreTopicLower.includes('protein') || coreTopicLower.includes('evolution') || coreTopicLower.includes('ecology') || coreTopicLower.includes('chemistry') || coreTopicLower.includes('physics')) {
      aiEntities = ['NCBI', 'PubMed', 'Nature', 'Science', 'Cell', 'PNAS', 'WHO', 'NIH'];
      aiPickedNGrams = [`${coreTopic} explained`, `${coreTopic} definition`, `${coreTopic} function`, `${coreTopic} examples`, `${coreTopic} types`];
      aiGeneratedNGrams = ['scientific research methodology', 'peer reviewed studies', 'experimental design', 'control group', 'statistical significance'];
      uniqueNGrams = ['systematic review', 'meta-analysis', 'double-blind study', 'evidence-based medicine', 'clinical trial phases'];
    }

    // History / Geography / Social Science
    else if (coreTopicLower.includes('history') || coreTopicLower.includes('war') || coreTopicLower.includes('revolution') || coreTopicLower.includes('empire') || coreTopicLower.includes('culture') || coreTopicLower.includes('society') || coreTopicLower.includes('economics') || coreTopicLower.includes('politics')) {
      aiEntities = ['Wikipedia', 'Britannica', 'National Archives', 'Smithsonian', 'Library of Congress', 'UN', 'World Bank'];
      aiPickedNGrams = [`${coreTopic} history`, `${coreTopic} timeline`, `${coreTopic} causes`, `${coreTopic} effects`, `${coreTopic} significance`];
      aiGeneratedNGrams = ['primary source analysis', 'historical context', 'cause and effect', 'social movement', 'political ideology'];
      uniqueNGrams = ['historiographical debate', 'revisionist interpretation', 'long-term consequences', 'geopolitical impact'];
    }

    // Generic Informational (safe fallback — does NOT inject brand names)
    else {
      aiEntities = []; // Return empty — don't inject random brands for unknown informational topics
      aiPickedNGrams = [`${coreTopic} explained`, `${coreTopic} definition`, `how ${coreTopic} works`, `${coreTopic} examples`, `${coreTopic} types`, `${coreTopic} benefits`];
      aiGeneratedNGrams = [`${coreTopic} for beginners`, `understanding ${coreTopic}`, `${coreTopic} overview`, `introduction to ${coreTopic}`, `${coreTopic} applications`];
      uniqueNGrams = [`complete guide to ${coreTopic}`, `${coreTopic} step by step`, `${coreTopic} in simple terms`];
    }
  }

  // ── Commercial / Transactional intent ─────────────────────────────────────
  else {
    if (kwLower.includes('video') || kwLower.includes('edit') || kwLower.includes('design') || kwLower.includes('photo') || kwLower.includes('audio') || kwLower.includes('graphic') || kwLower.includes('render') || kwLower.includes('media') || kwLower.includes('creative')) {
      if (kwLower.includes('mobile') || kwLower.includes('phone') || kwLower.includes('android') || kwLower.includes('ios') || kwLower.includes('app')) {
        aiEntities = ['CapCut Mobile', 'LumaFusion', 'KineMaster', 'InShot App', 'VN Video Editor', 'Adobe Premiere Rush', 'Splice App', 'Alight Motion', 'FilmoraGo', 'iMovie Mobile'];
      } else {
        aiEntities = ['Adobe Premiere Pro', 'DaVinci Resolve', 'Final Cut Pro', 'CapCut PC', 'Filmora', 'CyberLink PowerDirector', 'Avid Media Composer'];
      }
      aiPickedNGrams = [`best ${kw}`, `top ${kw}`, `${kw} comparison`, `free ${kw}`, `professional ${kw}`, `${kw} for beginners`];
      aiGeneratedNGrams = [`${kw} review`, `${kw} features`, `${kw} pricing`, `${kw} tutorial`, `${kw} alternatives`];
      uniqueNGrams = [`${kw} pros and cons`, `${kw} 2026 rankings`, `${kw} for small business`];
    } else if (kwLower.includes('health') || kwLower.includes('medical') || kwLower.includes('fit') || kwLower.includes('diet') || kwLower.includes('nutrition')) {
      aiEntities = ['Mayo Clinic', 'WebMD', 'Healthline', 'CDC', 'WHO', 'NHS', 'FDA'];
      aiPickedNGrams = [`best ${kw}`, `${kw} benefits`, `${kw} side effects`, `${kw} dosage`, `${kw} guide`];
      aiGeneratedNGrams = [`${kw} for weight loss`, `${kw} for beginners`, `${kw} meal plan`, `${kw} tips`];
      uniqueNGrams = [`evidence-based ${kw}`, `doctor recommended ${kw}`, `${kw} clinical study`];
    } else if (kwLower.includes('finance') || kwLower.includes('money') || kwLower.includes('crypto') || kwLower.includes('bitcoin') || kwLower.includes('invest')) {
      aiEntities = ['Bloomberg', 'Investopedia', 'Forbes', 'Yahoo Finance', 'Coinbase', 'Binance', 'NerdWallet'];
      aiPickedNGrams = [`best ${kw}`, `${kw} strategy`, `${kw} returns`, `${kw} risks`, `${kw} for beginners`];
      aiGeneratedNGrams = [`${kw} portfolio`, `${kw} market analysis`, `${kw} tips`, `${kw} 2026`];
      uniqueNGrams = [`${kw} tax implications`, `${kw} risk management`, `${kw} long term`];
    } else if (kwLower.includes('travel') || kwLower.includes('hotel') || kwLower.includes('flight') || kwLower.includes('trip')) {
      aiEntities = ['Tripadvisor', 'Booking.com', 'Expedia', 'Airbnb', 'Skyscanner', 'Yelp'];
      aiPickedNGrams = [`best ${kw}`, `cheap ${kw}`, `top ${kw}`, `${kw} deals`, `${kw} guide`];
      aiGeneratedNGrams = [`${kw} tips`, `${kw} packages`, `${kw} on budget`, `${kw} itinerary`];
      uniqueNGrams = [`hidden gems ${kw}`, `off-season ${kw}`, `${kw} travel hacks`];
    } else if (kwLower.includes('seo') || kwLower.includes('marketing') || kwLower.includes('keyword')) {
      aiEntities = ['Ahrefs', 'Semrush', 'Moz', 'Ubersuggest', 'Google Search Console', 'Google Analytics'];
      aiPickedNGrams = [`best ${kw}`, `${kw} tools`, `${kw} strategy`, `${kw} checklist`, `${kw} audit`];
      aiGeneratedNGrams = [`${kw} for small business`, `${kw} 2026 trends`, `advanced ${kw} techniques`];
      uniqueNGrams = [`${kw} ROI calculation`, `${kw} KPIs`, `${kw} automation`];
    } else {
      // Generic commercial
      aiEntities = ['Google', 'Microsoft', 'AWS', 'HubSpot', 'Salesforce'];
      aiPickedNGrams = [`best ${kw}`, `top ${kw}`, `${kw} services`, `${kw} guide`, `${kw} reviews`];
      aiGeneratedNGrams = [`${kw} for startups`, `affordable ${kw}`, `${kw} solutions`, `professional ${kw}`];
      uniqueNGrams = [`${kw} comparison 2026`, `${kw} buying guide`, `${kw} checklist`];
    }
  }

  return { aiEntities, aiPickedNGrams, aiGeneratedNGrams, uniqueNGrams };
}

export async function POST(req: NextRequest) {
  try {
    const { text = '', keyword = '' } = await req.json();

    const tokens = text ? getTokens(text) : [];

    // 1. Entities from scraped text
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

    // 4. NLP / LSI Keywords
    const uniGrams = text ? calculateNGrams(tokens, 1) : {};
    const sortedNLP = Object.entries(uniGrams)
      .filter(([word]) => !STOP_WORDS.has(word))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40)
      .map(entry => entry[0]);

    // 5. Generate intent-aware fallback tokens
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
