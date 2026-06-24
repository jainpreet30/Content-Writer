'use client';

import React from 'react';
import { useWriterStore } from '@/store/useWriterStore';
import { CalendarRange, Sparkles } from 'lucide-react';

export default function Step2WordCount() {
  const {
    mainKeyword,
    apiKeys,
    outline,
    updateHeading,
    batchSetWordCounts,
    totalWordTarget,
    setTotalWordTarget,
    competitorEntities,
    aiEntities,
    excludedEntities,
    aiPickedNGrams,
    aiGeneratedNGrams,
    uniqueNGrams,
    competitorNGrams,
    excludedNGrams,
    nlpKeywords,
    excludedNLPKeywords,
    skipGrams,
    excludedSkipGrams,
  } = useWriterStore();

  const [loading, setLoading] = React.useState(false);
  const [statusText, setStatusText] = React.useState('');

  const handleWordCountChange = (id: string, value: string) => {
    const val = parseInt(value, 10);
    if (!isNaN(val)) {
      updateHeading(id, { wordCountTarget: val });
    } else if (value === '') {
      updateHeading(id, { wordCountTarget: 0 });
    }
  };

  const handleAiAllocate = async () => {
    if (outline.length === 0) return;
    setLoading(true);

    let activeProvider = 'offline';
    if (apiKeys?.openai) activeProvider = 'openai';
    else if (apiKeys?.gemini) activeProvider = 'gemini';
    else if (apiKeys?.deepseek) activeProvider = 'deepseek';

    if (activeProvider !== 'offline') {
      setStatusText(`AI Allocating via ${activeProvider.toUpperCase()}...`);
    } else {
      setStatusText('Running semantic importance model...');
    }

    // Compile keywords currently extracted (if any)
    const activeEntities = [...new Set([...competitorEntities, ...aiEntities])].filter(e => !excludedEntities.includes(e));
    const activeNGrams = [...new Set([...competitorNGrams, ...aiPickedNGrams, ...aiGeneratedNGrams, ...uniqueNGrams])].filter(n => !excludedNGrams.includes(n));
    const activeNLP = nlpKeywords.filter(k => !excludedNLPKeywords.includes(k));
    const activeSkip = skipGrams.filter(s => !excludedSkipGrams.includes(s));
    const allKeywords = [...new Set([mainKeyword, ...activeEntities, ...activeNGrams, ...activeNLP, ...activeSkip])].filter(Boolean);

    try {
      const res = await fetch('/api/wordcount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: mainKeyword,
          keywords: allKeywords,
          targetWords: totalWordTarget || 2000,
          outline: outline.map(h => ({ id: h.id, type: h.type, text: h.text })),
          apiKeys
        })
      });
      const data = await res.json();
      if (data.budgets) {
        Object.entries(data.budgets).forEach(([id, count]) => {
          updateHeading(id, { wordCountTarget: Number(count) });
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  const totalWords = outline.reduce((sum, h) => sum + (h.wordCountTarget || 0), 0);

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-violet-400" />
            <span>Word Count budgets per Heading</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Optional at first: leave any heading blank to skip strict targeting. Targets are enforced in the AI prompt only after you set them.
          </p>
        </div>

        {/* Global batch overrides & AI */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleAiAllocate}
            disabled={loading || outline.length === 0}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-xs font-extrabold text-white rounded-xl flex items-center gap-1.5 transition disabled:opacity-50 shadow-lg shadow-violet-600/10"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? (statusText || 'Allocating...') : 'AI Assign Budgets'}</span>
          </button>

          <div className="flex items-center gap-2 bg-[#141829] border border-[#232948] p-2 rounded-xl">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2 pr-1">Set all to:</span>
            {[150, 200, 300, 500].map((num) => (
              <button
                key={num}
                onClick={() => batchSetWordCounts(num)}
                className="px-3 py-1.5 rounded-lg bg-violet-600/10 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/20 text-xs font-bold transition"
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Global Target Word Count Config */}
      <div className="bg-[#141829] border border-[#232948] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-250">Target Article Word Count</h3>
          <p className="text-xs text-gray-400 mt-0.5">Specify the desired total word target. AI allocation will distribute it across headings based on importance.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={totalWordTarget || ''}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) setTotalWordTarget(val);
              else if (e.target.value === '') setTotalWordTarget(0);
            }}
            placeholder="2000"
            className="w-28 px-4 py-2.5 bg-[#191d35] border border-[#2a315c] rounded-xl outline-none text-sm text-center text-white focus:border-violet-500 transition font-bold"
          />
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">words</span>
        </div>
      </div>

      {/* Heading Budgets List */}
      <div className="bg-[#141829] border border-[#232948] rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-[#232948] pb-3 mb-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Heading Structure</span>
          <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
            Total Target Word Count: <span className="text-white text-sm font-black">{totalWords}</span> words
          </span>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {outline.map((heading) => (
            <div key={heading.id} className="flex items-center justify-between gap-4 bg-[#191d35] border border-[#2a315c] p-3.5 rounded-xl">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`px-2 py-0.5 text-[10px] font-black rounded-md border ${
                  heading.type === 'H2'
                    ? 'bg-violet-950/40 text-violet-300 border-violet-850/50'
                    : heading.type === 'H3'
                    ? 'bg-pink-950/40 text-pink-300 border-pink-850/50'
                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-850/50'
                }`}>
                  {heading.type}
                </span>
                <span className="text-sm text-gray-200 truncate">{heading.text}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  value={heading.wordCountTarget || ''}
                  onChange={(e) => handleWordCountChange(heading.id, e.target.value)}
                  placeholder="0"
                  className="w-20 px-3 py-1.5 bg-[#141829] border border-[#2a315c] rounded-lg outline-none text-sm text-center text-white placeholder-gray-600 focus:border-violet-500 transition font-bold"
                />
                <span className="text-xs text-gray-500">words</span>
              </div>
            </div>
          ))}

          {outline.length === 0 && (
            <p className="text-xs text-gray-500 italic py-6 text-center">
              Please go back to Step 2 and extract or create headings first!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
