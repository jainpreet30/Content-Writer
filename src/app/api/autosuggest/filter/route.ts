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
  'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'
]);

export async function POST(req: NextRequest) {
  try {
    const { keyword = '', suggestions = [], apiKeys = {} } = await req.json();

    if (!suggestions || suggestions.length === 0) {
      return NextResponse.json({ relevance: {} });
    }

    const openAiKey = apiKeys.openai || process.env.OPENAI_API_KEY;
    const geminiKey = apiKeys.gemini || process.env.GEMINI_API_KEY;
    const deepseekKey = apiKeys.deepseek || process.env.DEEPSEEK_API_KEY;

    // A. Use OpenAI
    if (openAiKey) {
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
              content: 'You are an SEO relevance filter. Return ONLY a valid JSON object mapping each input suggestion keyword to a boolean (true if highly relevant to the primary topic, false otherwise). No markdown formatting or extra text.'
            },
            {
              role: 'user',
              content: `Primary keyword: "${keyword}". Review these suggestions and return the JSON object: ${JSON.stringify(suggestions)}`
            }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = JSON.parse(data.choices?.[0]?.message?.content || '{}');
        return NextResponse.json({ relevance: content });
      }
    }

    // B. Use Gemini
    if (geminiKey) {
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
                  text: `You are an SEO relevance filter. Primary keyword: "${keyword}". Analyze the following autocomplete suggestions: ${JSON.stringify(suggestions)}. Decide which ones are highly relevant and which are irrelevant to the topic. Return ONLY a valid JSON object mapping each suggestion string to a boolean (true for relevant, false for irrelevant). Do not include markdown code block formatting or backticks.`
                }
              ]
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
        const content = JSON.parse(text);
        return NextResponse.json({ relevance: content });
      }
    }

    // C. Use DeepSeek
    if (deepseekKey) {
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
              content: 'You are an SEO relevance filter. Return ONLY a valid JSON object mapping each suggestion to a boolean indicating relevance.'
            },
            {
              role: 'user',
              content: `Primary keyword: "${keyword}". Filter these suggestions: ${JSON.stringify(suggestions)}`
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = JSON.parse(data.choices?.[0]?.message?.content || '{}');
        return NextResponse.json({ relevance: content });
      }
    }

    // D. Smart Offline Heuristic Fallback
    const kwLower = keyword.toLowerCase();
    const kwWords = kwLower.split(/\s+/).filter((w: string) => w.length > 2 && !STOP_WORDS.has(w));
    const relevanceMap: Record<string, boolean> = {};
    
    suggestions.forEach((s: string) => {
      const sLower = s.toLowerCase();
      // Match if the suggestion contains the main keyword, or any of its main words, or if the main keyword contains the suggestion
      const isDirectMatch = sLower.includes(kwLower) || kwLower.includes(sLower);
      const isWordMatch = kwWords.length > 0 && kwWords.some((word: string) => sLower.includes(word));
      relevanceMap[s] = isDirectMatch || isWordMatch;
    });

    return NextResponse.json({ relevance: relevanceMap });
  } catch (error: any) {
    console.error('Autosuggest Filter Route Error:', error);
    return NextResponse.json({ error: 'Failed to filter suggestions' }, { status: 500 });
  }
}
