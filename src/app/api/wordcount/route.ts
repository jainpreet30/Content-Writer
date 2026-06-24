import { NextRequest, NextResponse } from 'next/server';

interface HeadingItem {
  id: string;
  type: 'H2' | 'H3' | 'H4';
  text: string;
}

function calculateOfflineWordCounts(keyword: string, keywords: string[], outline: HeadingItem[], targetWords: number): Record<string, number> {
  const kwLower = (keyword || '').toLowerCase();
  const kwWords = kwLower.split(/\s+/).filter(w => w.length > 2);
  
  const totalTargetWords = targetWords || 2000;
  const weights: Record<string, number> = {};
  let totalWeight = 0;
  
  outline.forEach((heading, index) => {
    const textLower = heading.text.toLowerCase();
    
    // 1. Base weight by heading type
    let weight = 1.0;
    if (heading.type === 'H2') weight = 2.0;
    else if (heading.type === 'H3') weight = 1.3;
    else if (heading.type === 'H4') weight = 0.8;
    
    // 2. Position-based adjustments (Intro/Outro sections need lower word budget)
    const isIntro = index === 0 || textLower.includes('intro') || textLower.includes('welcome') || textLower.includes('start');
    const isOutro = index === outline.length - 1 || textLower.includes('conclus') || textLower.includes('summary') || textLower.includes('final') || textLower.includes('outro');
    
    if (isIntro || isOutro) {
      weight *= 0.6;
    }
    
    // 3. Keyword overlap score
    let keywordScore = 1.0;
    if (kwLower && textLower.includes(kwLower)) {
      keywordScore += 2.0; // direct keyword match gets extra weight
    } else if (kwWords.length > 0) {
      const matchCount = kwWords.filter(word => textLower.includes(word)).length;
      keywordScore += matchCount * 0.75;
    }
    
    // 3b. Additional keywords match
    if (keywords && keywords.length > 0) {
      let matchedCount = 0;
      keywords.forEach(k => {
        if (k && k.toLowerCase() !== kwLower && textLower.includes(k.toLowerCase())) {
          matchedCount++;
        }
      });
      keywordScore += matchedCount * 0.4; // give extra weight per keyword matched
    }
    
    // 4. Critical SEO triggers
    const criticalSEOTriggers = ['best', 'top', 'review', 'compare', 'vs', 'alternative', 'guide', 'how to', 'tips', 'strategy', 'cost', 'pricing', 'features', 'picks'];
    criticalSEOTriggers.forEach(trigger => {
      if (textLower.includes(trigger)) {
        keywordScore += 0.5;
      }
    });

    // 5. Complexity score based on heading character length
    const lengthBonus = Math.min(heading.text.length / 50, 1.0);
    keywordScore += lengthBonus;

    // 6. Character hash variance to guarantee non-uniform values
    let charHash = 0;
    for (let i = 0; i < heading.text.length; i++) {
      charHash += heading.text.charCodeAt(i);
    }
    const variance = 0.8 + ((charHash % 5) * 0.1); // minor variance multiplier [0.8 - 1.2]

    const finalWeight = weight * keywordScore * variance;
    weights[heading.id] = finalWeight;
    totalWeight += finalWeight;
  });

  const results: Record<string, number> = {};
  outline.forEach(heading => {
    const weight = weights[heading.id] || 1;
    let count = Math.round((weight / totalWeight) * totalTargetWords);
    // Round to nearest 50 words
    count = Math.max(Math.round(count / 50) * 50, 100); // minimum 100 words
    results[heading.id] = count;
  });

  return results;
}

export async function POST(req: NextRequest) {
  try {
    const { keyword = '', keywords = [], outline = [], apiKeys = {}, targetWords = 2000 } = await req.json();

    if (!outline || outline.length === 0) {
      return NextResponse.json({ error: 'Outline is required' }, { status: 400 });
    }

    const openAiKey = apiKeys.openai || process.env.OPENAI_API_KEY;
    const geminiKey = apiKeys.gemini || process.env.GEMINI_API_KEY;
    const deepseekKey = apiKeys.deepseek || process.env.DEEPSEEK_API_KEY;

    // A. Use OpenAI if key exists
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
              content: 'You are an SEO word count budget allocator. Return ONLY a valid JSON object mapping the exact heading ID keys to word count numbers. No markdown wrapping.'
            },
            {
              role: 'user',
              content: `Keyword: "${keyword}". Allocate an optimal target word count for each heading based on its SEO importance and depth. Take into account the following target keywords that should be covered: ${keywords.join(', ')}. Headings covering more important/complex keywords should get larger budgets. Total words across headings should sum up to roughly ${targetWords} words. Here is the list:\n${JSON.stringify(outline)}`
            }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = JSON.parse(data.choices?.[0]?.message?.content || '{}');
        return NextResponse.json({ budgets: content });
      }
    }

    // B. Use Gemini if key exists
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
                  text: `Analyze this keyword: "${keyword}". Allocate an optimal target word count for each of these headings so the total sums to roughly ${targetWords} words. Take into account these target keywords that should be covered: ${keywords.join(', ')}. Headings covering more keywords or more complex/important topics should receive larger word budgets. Return ONLY a valid JSON object mapping the heading ID to the target word count number (e.g. {"heading_id_1": 250}). Do not include any backticks or markdown formatting. Outline: ${JSON.stringify(outline)}`
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
        return NextResponse.json({ budgets: content });
      }
    }

    // C. Use DeepSeek if key exists
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
              content: 'You are an SEO word count budget allocator. Return ONLY a valid JSON object mapping heading ID keys to word count numbers.'
            },
            {
              role: 'user',
              content: `Keyword: "${keyword}". Allocate optimal target word count budgets for each heading (total summing to ~${targetWords}). Consider these target keywords that should be covered: ${keywords.join(', ')}. Headings covering more of these keywords should get a higher word budget. Outline: ${JSON.stringify(outline)}`
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = JSON.parse(data.choices?.[0]?.message?.content || '{}');
        return NextResponse.json({ budgets: content });
      }
    }

    // D. Smart Offline Heuristic Fallback
    const offlineBudgets = calculateOfflineWordCounts(keyword, keywords, outline, targetWords);
    return NextResponse.json({ budgets: offlineBudgets });
  } catch (error: any) {
    console.error('Wordcount Route Error:', error);
    return NextResponse.json({ error: 'Failed to allocate word budgets' }, { status: 500 });
  }
}
