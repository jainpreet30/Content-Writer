'use client';

import React, { useState } from 'react';
import { useWriterStore } from '@/store/useWriterStore';
import { 
  Sparkles, 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Clock,
  Settings2
} from 'lucide-react';
import canvasConfetti from 'canvas-confetti';

interface LogEntry {
  id: string;
  message: string;
  status: 'pending' | 'loading' | 'success' | 'error';
}

export default function AutopilotWriter() {
  const {
    mainKeyword,
    setMainKeyword,
    apiKeys,
    setStep,
    setEditorContent,
    setOutline,
    setCompetitorEntities,
    setAiEntities,
    setCompetitorNGrams,
    setAiPickedNGrams,
    setAiGeneratedNGrams,
    setUniqueNGrams,
    setNlpKeywords,
    setSkipGrams,
    setTotalWordTarget,
    totalWordTarget,
    seoRules,
  } = useWriterStore();

  const [provider, setProvider] = useState<'openai' | 'gemini' | 'deepseek'>('openai');
  const [targetWords, setTargetWords] = useState(totalWordTarget || 2000);
  const [competitorUrls, setCompetitorUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addLog = (message: string, status: LogEntry['status'] = 'pending') => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      status,
    };
    setLogs((prev) => [...prev, entry]);
    return entry.id;
  };

  const updateLog = (id: string, updates: Partial<LogEntry>) => {
    setLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, ...updates } : log))
    );
  };

  const handleAddUrl = () => {
    if (urlInput.trim() && !competitorUrls.includes(urlInput.trim())) {
      setCompetitorUrls((prev) => [...prev, urlInput.trim()]);
      setUrlInput('');
    }
  };

  const handleRemoveUrl = (url: string) => {
    setCompetitorUrls((prev) => prev.filter((u) => u !== url));
  };

  const runAutopilot = async () => {
    if (!mainKeyword.trim()) {
      setErrorMsg('Please specify a target primary keyword.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setLogs([]);

    let stepId = '';
    try {
      setTotalWordTarget(targetWords);

      // --- Step 1: SERP URLs Research ---
      stepId = addLog('Researching competitor URLs...', 'loading');
      let urls = [...competitorUrls];

      if (urls.length === 0 && apiKeys.serper) {
        updateLog(stepId, { message: 'Fetching SERPs via Serper.dev...' });
        try {
          const res = await fetch('/api/serp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: mainKeyword, apiKey: apiKeys.serper }),
          });
          const data = await res.json();
          if (res.ok && data.results) {
            urls = data.results.slice(0, 3).map((r: any) => r.url);
            updateLog(stepId, { 
              message: `Found ${urls.length} top competitor links via Google SERP search.`, 
              status: 'success' 
            });
          } else {
            updateLog(stepId, { 
              message: 'Serper.dev call skipped or failed. Proceeding with AI Research mode.', 
              status: 'success' 
            });
          }
        } catch (e) {
          updateLog(stepId, { 
            message: 'Failed to search SERP. Proceeding with AI Research mode.', 
            status: 'success' 
          });
        }
      } else if (urls.length > 0) {
        updateLog(stepId, { 
          message: `Using ${urls.length} manually specified competitor links.`, 
          status: 'success' 
        });
      } else {
        updateLog(stepId, { 
          message: 'No competitor links specified. Proceeding with AI Research mode.', 
          status: 'success' 
        });
      }

      // --- Step 2: Scraping Competitor Structures ---
      stepId = addLog('Analyzing competitor content structures...', 'loading');
      let extractedHeadings: any[] = [];
      let fullScrapedText = '';

      if (urls.length > 0) {
        // Scrape all competitor URLs and merge their content
        const scrapeResults = await Promise.allSettled(
          urls.slice(0, 3).map(url =>
            fetch('/api/scrape', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url }),
            }).then(r => r.json())
          )
        );

        for (const result of scrapeResults) {
          if (result.status === 'fulfilled' && result.value?.headings) {
            // Use headings from the first successfully scraped URL
            if (extractedHeadings.length === 0) {
              extractedHeadings = result.value.headings.map((h: any) => ({
                id: h.id,
                type: h.type,
                text: h.text,
                wordCountTarget: 200,
              }));
            }
            // Accumulate text from all scraped pages for richer context
            if (result.value.fullText) {
              fullScrapedText += '\n\n' + result.value.fullText;
            }
          }
        }

        if (extractedHeadings.length > 0) {
          updateLog(stepId, {
            message: `Scraped ${urls.length} competitor URL(s) — ${extractedHeadings.length} headings, ${Math.round(fullScrapedText.length / 5)} estimated words of context.`,
            status: 'success',
          });
        } else {
          updateLog(stepId, { message: 'Scraping returned no headings. Creating AI outline...' });
        }
      }

      // If scraping failed or was skipped, generate a high-fidelity AI outline
      if (extractedHeadings.length === 0) {
        updateLog(stepId, { message: 'Generating customized outline structure using AI...' });
        try {
          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: 'outline',
              keyword: mainKeyword,
              provider,
              apiKeys,
            }),
          });
          const data = await res.json();
          if (res.ok && data.outline) {
            extractedHeadings = data.outline.map((h: any, idx: number) => ({
              id: `h_${idx}_${Math.random().toString(36).substr(2, 5)}`,
              type: h.type,
              text: h.text,
              wordCountTarget: 200,
            }));
            updateLog(stepId, { 
              message: `Generated custom outline using AI (${extractedHeadings.length} headings).`, 
              status: 'success' 
            });
          }
        } catch (e) {
          console.error('Failed to generate AI outline:', e);
        }

        // If AI outline call failed, use the smart offline fallback outlines
        if (extractedHeadings.length === 0) {
          updateLog(stepId, { message: 'AI outline generation failed. Building structured offline outline...' });
          
          const kwLower = mainKeyword.toLowerCase();
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
              { type: 'H2', text: 'Introduction to ' + mainKeyword },
              { type: 'H2', text: 'Why ' + mainKeyword + ' Matters' },
              { type: 'H3', text: 'Key Benefits and Advantages' },
              { type: 'H3', text: 'Common Challenges to Avoid' },
              { type: 'H2', text: 'Core Strategies for Implementation' },
              { type: 'H3', text: 'Step-by-Step Execution Guide' },
              { type: 'H2', text: 'Future Trends & Expert Tips' },
              { type: 'H2', text: 'Conclusion & Summary' }
            ];
          }

          extractedHeadings = fallbackOutline.map((h, idx) => ({
            id: `h_${idx}_${Math.random().toString(36).substr(2, 5)}`,
            type: h.type as 'H2' | 'H3' | 'H4',
            text: h.text,
            wordCountTarget: 200,
          }));
        }

        // Scale budgets to match targetWords
        const baseSum = extractedHeadings.reduce((sum, h) => sum + h.wordCountTarget, 0);
        extractedHeadings = extractedHeadings.map(h => ({
          ...h,
          wordCountTarget: Math.max(Math.round(((h.wordCountTarget / baseSum) * targetWords) / 50) * 50, 100)
        }));

        updateLog(stepId, { 
          message: `Created outline structure (${extractedHeadings.length} headers).`, 
          status: 'success' 
        });
      }
      setOutline(extractedHeadings);

      // --- Step 3: NLP Token Extraction & Keywords Analysis ---
      stepId = addLog('Running NLP semantic keyword analysis...', 'loading');
      let activeEntities: string[] = [];
      let activeNGrams: string[] = [];

      try {
        const res = await fetch('/api/nlp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword: mainKeyword, text: fullScrapedText }),
        });
        const data = await res.json();
        if (res.ok) {
          // Initialize Zustand lists
          const compEntities = data.entities?.competitor || [];
          const generatedEntities = data.entities?.ai || [];
          const compNGrams = data.nGrams?.competitor || [];
          const pickedNGrams = data.nGrams?.aiPicked || [];
          const genNGrams = data.nGrams?.aiGenerated || [];
          const uNGrams = data.nGrams?.unique || [];

          setCompetitorEntities(compEntities);
          setAiEntities(generatedEntities);
          setCompetitorNGrams(compNGrams);
          setAiPickedNGrams(pickedNGrams);
          setAiGeneratedNGrams(genNGrams);
          setUniqueNGrams(uNGrams);
          setNlpKeywords(data.nlpKeywords || []);
          setSkipGrams(data.skipGrams || []);

          activeEntities = [...new Set([...compEntities, ...generatedEntities])].slice(0, 15);
          activeNGrams = [...new Set([
            ...compNGrams,
            ...pickedNGrams,
            ...genNGrams,
            ...uNGrams
          ])].slice(0, 15);

          updateLog(stepId, { 
            message: `Extracted NLP tokens (${activeEntities.length} entities, ${activeNGrams.length} n-grams).`, 
            status: 'success' 
          });
        } else {
          updateLog(stepId, { message: 'NLP processing failed. Using heuristic fallbacks.', status: 'success' });
        }
      } catch (e) {
        updateLog(stepId, { message: 'NLP processing error. Using heuristic fallbacks.', status: 'success' });
      }

      // --- Step 4: Allocating Budgets ---
      stepId = addLog('Allocating heading word budgets...', 'loading');
      try {
        const res = await fetch('/api/wordcount', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keyword: mainKeyword,
            keywords: [...activeEntities, ...activeNGrams],
            outline: extractedHeadings,
            apiKeys,
            targetWords: targetWords
          }),
        });
        const data = await res.json();
        if (res.ok && data.wordCounts) {
          const finalOutline = extractedHeadings.map(h => ({
            ...h,
            wordCountTarget: data.wordCounts[h.id] || h.wordCountTarget
          }));
          setOutline(finalOutline);
          extractedHeadings = finalOutline;
          updateLog(stepId, { message: 'Calculated heading-level word budgets.', status: 'success' });
        } else {
          updateLog(stepId, { message: 'Word count allocation failed. Using offline heuristics.', status: 'success' });
        }
      } catch (e) {
        updateLog(stepId, { message: 'Word count allocation error. Using offline heuristics.', status: 'success' });
      }

      // --- Step 5: Compiling System Prompt & Generating content ---
      stepId = addLog('Compiling expert prompt & generating content...', 'loading');

      const activeRules = seoRules.filter(r => r.active).map(r => r.promptGuideline);

      // Trim competitor content to ~4000 chars to keep prompt efficient
      const competitorSnippet = fullScrapedText
        ? fullScrapedText.replace(/\s+/g, ' ').trim().slice(0, 4000)
        : '';

      const compiledPrompt = `You are a senior content writer and SEO expert. Write a comprehensive, deeply informative article about "${mainKeyword}".

PRIMARY KEYWORD: ${mainKeyword}
TARGET WORD COUNT: ${targetWords} words (±10%)
TONE: Professional, educational, authoritative — written for someone who genuinely wants to understand this topic.

ARTICLE OUTLINE (follow this structure exactly):
${extractedHeadings.map((h, i) => `${i + 1}. [${h.type}] ${h.text} → ~${h.wordCountTarget} words`).join('\n')}

KEY TERMS & ENTITIES TO INCLUDE NATURALLY:
${activeEntities.slice(0, 12).join(', ')}

IMPORTANT LSI PHRASES TO WEAVE IN:
${activeNGrams.slice(0, 12).join(', ')}

${competitorSnippet ? `COMPETITOR CONTEXT (use this to understand what the topic covers, do NOT copy — use it as a knowledge base):
<COMPETITOR_CONTEXT>
${competitorSnippet}
</COMPETITOR_CONTEXT>

` : ''}CONTENT QUALITY RULES:
- Write as a subject-matter expert explaining to an intelligent reader, not a generic marketing piece.
- Every section must have real substance: concrete examples, numbers, comparisons, or practical explanations.
- Do NOT use AI clichés: "In today's digital landscape", "game-changer", "harness the power", "it's important to note", "dive into", "leverage", "cutting-edge".
- Vary sentence length — mix short punchy sentences with detailed technical ones.
- Use <strong> for key terms on first mention. Use <ul>/<ol> for lists of 3+ items instead of paragraph blocks.
- Use <table> for any comparisons, feature matrices, or side-by-side evaluations.
- Paragraphs must be 2–4 sentences max. No walls of text.
- Accuracy matters: only state facts that are true about ${mainKeyword}.
${activeRules.length > 0 ? `
ADDITIONAL SEO GUIDELINES:
${activeRules.map((rule, idx) => `${idx + 1}. ${rule}`).join('\n')}` : ''}

Return ONLY clean HTML (H2, H3, H4, P, UL, OL, LI, STRONG, EM, TABLE, TR, TH, TD, IMG tags). No markdown fences, no backtick code blocks, no conversational intro or outro text.`;

      updateLog(stepId, { message: 'Sending to AI content engine...' });

      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'write',
          prompt: compiledPrompt,
          keyword: mainKeyword,
          provider,
          apiKeys,
          outline: extractedHeadings,
          entities: activeEntities,
          ngrams: activeNGrams,
          competitorContent: fullScrapedText,
          targetWords,
        }),
      });

      const genData = await genRes.json();
      if (!genRes.ok || !genData.content) {
        throw new Error(genData.error || 'Failed to generate content from AI engine.');
      }

      setEditorContent(genData.content);
      updateLog(stepId, { message: 'Article generated successfully!', status: 'success' });

      // Celebrate!
      canvasConfetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Navigate to the editor (Step 13)
      setTimeout(() => {
        setStep(13);
      }, 1000);

    } catch (e: any) {
      console.error(e);
      if (stepId) {
        updateLog(stepId, { message: `Generation failed: ${e.message}`, status: 'error' });
      }
      setErrorMsg(e.message || 'An error occurred during Autopilot generation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Autopilot Content Writer</h2>
          <p className="text-sm text-gray-400 mt-1">
            Input a keyword, configure basic criteria, and let the background engine analyze, outline, and generate a fully optimized draft instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Keyword Input */}
          <div className="bg-[#141829] border border-[#232948]/80 rounded-2xl p-5 space-y-2.5 shadow-md">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Primary Target Keyword</label>
            <input
              type="text"
              value={mainKeyword}
              onChange={(e) => setMainKeyword(e.target.value)}
              placeholder="e.g. Best SEO Tools for Small Business"
              className="w-full px-4 py-3 bg-[#191d35] border border-[#2a315c] rounded-xl outline-none text-sm text-white placeholder-gray-500 focus:border-violet-500 transition"
              disabled={loading}
            />
          </div>

          {/* Competitors URL Input */}
          <div className="bg-[#141829] border border-[#232948]/80 rounded-2xl p-5 space-y-4 shadow-md">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Competitor URLs (Optional)
              </label>
              <p className="text-[11px] text-gray-500 mt-1">
                If omitted, the engine will search Google SERPs automatically (requires Serper API key) or run AI-only semantic research.
              </p>
            </div>

            {/* List */}
            {competitorUrls.length > 0 && (
              <div className="space-y-2">
                {competitorUrls.map((url) => (
                  <div key={url} className="flex items-center gap-2 bg-[#191d35] border border-[#2a315c] px-3 py-2 rounded-xl">
                    <span className="text-xs text-gray-300 truncate flex-1">{url}</span>
                    <button
                      onClick={() => handleRemoveUrl(url)}
                      className="p-1 hover:bg-rose-950/40 rounded-lg text-rose-400 border border-transparent hover:border-rose-900/40 transition"
                      disabled={loading}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add box */}
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/competitor-post"
                className="flex-1 px-3 py-2 bg-[#191d35] border border-[#2a315c] rounded-xl outline-none text-xs text-white placeholder-gray-500 focus:border-violet-500 transition"
                disabled={loading}
              />
              <button
                onClick={handleAddUrl}
                className="px-3 py-2 bg-[#1d223f] hover:bg-[#272d54] text-xs font-bold text-gray-200 border border-[#2a315c] rounded-xl flex items-center gap-1 transition"
                disabled={loading}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Configuration Column */}
        <div className="space-y-4">
          <div className="bg-[#141829] border border-[#232948]/80 rounded-2xl p-5 space-y-4 shadow-md">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-violet-400" />
              <span>Writer Options</span>
            </h3>

            {/* AI Model selector */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-gray-400">AI LLM Provider</label>
              <select
                value={provider}
                onChange={(e: any) => setProvider(e.target.value)}
                className="w-full px-3 py-2 bg-[#191d35] border border-[#2a315c] rounded-xl outline-none text-xs text-white focus:border-violet-500 transition"
                disabled={loading}
              >
                <option value="openai">OpenAI (gpt-4o-mini)</option>
                <option value="gemini">Gemini 2.5 Flash</option>
                <option value="deepseek">DeepSeek Chat</option>
              </select>
            </div>

            {/* Target word count */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-semibold">
                <span className="text-gray-400">Target Word Count</span>
                <span className="text-violet-400 font-bold">{targetWords} words</span>
              </div>
              <input 
                type="range"
                min="600"
                max="4000"
                step="100"
                value={targetWords}
                onChange={(e) => setTargetWords(parseInt(e.target.value))}
                className="w-full accent-violet-600 h-1 bg-[#232948] rounded-lg appearance-none cursor-pointer"
                disabled={loading}
              />
              <div className="flex justify-between text-[9px] text-gray-500">
                <span>600 words</span>
                <span>4000 words</span>
              </div>
            </div>

            {/* Warning if no key configured */}
            {provider === 'openai' && !apiKeys.openai && (
              <div className="p-2.5 bg-amber-950/20 border border-amber-500/20 rounded-xl text-[10px] text-amber-300 flex items-start gap-1.5 leading-relaxed">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>No OpenAI API Key saved. Will default to local high-fidelity generator fallback.</span>
              </div>
            )}
            {provider === 'gemini' && !apiKeys.gemini && (
              <div className="p-2.5 bg-amber-950/20 border border-amber-500/20 rounded-xl text-[10px] text-amber-300 flex items-start gap-1.5 leading-relaxed">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>No Gemini API Key saved. Will default to local high-fidelity generator fallback.</span>
              </div>
            )}
            {provider === 'deepseek' && !apiKeys.deepseek && (
              <div className="p-2.5 bg-amber-950/20 border border-amber-500/20 rounded-xl text-[10px] text-amber-300 flex items-start gap-1.5 leading-relaxed">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>No DeepSeek API Key saved. Will default to local high-fidelity generator fallback.</span>
              </div>
            )}

            {/* Launch button */}
            <button
              onClick={runAutopilot}
              disabled={loading}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-violet-600/20 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-white fill-white" />
                  <span>Start Autopilot Generation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Logs and Output progress */}
      {(loading || logs.length > 0) && (
        <div className="bg-[#101223] border border-[#1e223d]/60 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>Autopilot Engine Execution Logs</span>
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-xs leading-normal">
                {log.status === 'loading' && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400 shrink-0 mt-0.5" />
                )}
                {log.status === 'success' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                {log.status === 'error' && (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                )}
                {log.status === 'pending' && (
                  <span className="w-3.5 h-3.5 rounded-full border border-gray-600 shrink-0 mt-0.5" />
                )}
                <span className={`flex-1 ${
                  log.status === 'error' ? 'text-rose-300 font-medium' :
                  log.status === 'success' ? 'text-gray-300' : 'text-gray-400'
                }`}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-950/20 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-start gap-2 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <strong className="font-bold text-rose-200">Execution Blocked:</strong> {errorMsg}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
