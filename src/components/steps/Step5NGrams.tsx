'use client';

import React, { useState } from 'react';
import { useWriterStore } from '@/store/useWriterStore';
import { Tag, Sparkles, X, Plus } from 'lucide-react';

export default function Step5NGrams() {
  const {
    mainKeyword,
    competitorContent,
    competitorNGrams,
    setCompetitorNGrams,
    aiPickedNGrams,
    setAiPickedNGrams,
    aiGeneratedNGrams,
    setAiGeneratedNGrams,
    uniqueNGrams,
    setUniqueNGrams,
    excludedNGrams,
    toggleNGramExclusion,
  } = useWriterStore();

  const [loading, setLoading] = useState(false);
  const [newNGram, setNewNGram] = useState('');

  const handleExtractNGrams = async () => {
    if (!competitorContent) return;
    setLoading(true);
    try {
      const res = await fetch('/api/nlp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: competitorContent, keyword: mainKeyword }),
      });
      const data = await res.json();
      if (data.nGrams) {
        setCompetitorNGrams(data.nGrams.competitor || []);
        setAiPickedNGrams(data.nGrams.aiPicked || []);
        setAiGeneratedNGrams(data.nGrams.aiGenerated || []);
        setUniqueNGrams(data.nGrams.unique || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAiPickBest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/nlp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: competitorContent || '', keyword: mainKeyword }),
      });
      const data = await res.json();
      if (data.nGrams && data.nGrams.aiPicked) {
        setAiPickedNGrams(data.nGrams.aiPicked);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAiGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/nlp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: competitorContent || '', keyword: mainKeyword }),
      });
      const data = await res.json();
      if (data.nGrams && data.nGrams.aiGenerated) {
        setAiGeneratedNGrams(data.nGrams.aiGenerated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUniqueNGrams = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/nlp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: competitorContent || '', keyword: mainKeyword }),
      });
      const data = await res.json();
      if (data.nGrams && data.nGrams.unique) {
        setUniqueNGrams(data.nGrams.unique);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddManualNGram = () => {
    if (newNGram.trim()) {
      setCompetitorNGrams([...competitorNGrams, newNGram.trim()]);
      setNewNGram('');
    }
  };

  const isExcluded = (ngram: string) => excludedNGrams.includes(ngram);

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Tag className="w-5 h-5 text-violet-400" />
          <span>SEO N-Grams Analysis</span>
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Calculate N-grams (2-word & 3-word combinations) from competitor content. Click any tag to exclude it.
        </p>
      </div>

      {/* Control Triggers */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExtractNGrams}
          disabled={loading || !competitorContent}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 font-bold text-sm text-white rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
        >
          <span>{loading ? 'Processing...' : 'Extract Competitor'}</span>
        </button>

        <button
          onClick={handleAiPickBest}
          className="px-5 py-2.5 bg-[#251f1f] hover:bg-[#342b2b] border border-[#482828] font-bold text-sm text-amber-400 rounded-xl flex items-center gap-1.5 transition"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>AI Pick Best</span>
        </button>

        <button
          onClick={handleAiGenerate}
          className="px-5 py-2.5 bg-[#1b1f3c] hover:bg-[#262c55] border border-[#2b335a] font-bold text-sm text-violet-400 rounded-xl flex items-center gap-1.5 transition"
        >
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span>AI Generate</span>
        </button>

        <button
          onClick={handleUniqueNGrams}
          className="px-5 py-2.5 bg-[#132822] hover:bg-[#1a382e] border border-[#1b3e34] font-bold text-sm text-emerald-400 rounded-xl flex items-center gap-1.5 transition"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Unique N-Grams</span>
        </button>
      </div>

      {/* Manual Input */}
      <div className="flex gap-2 max-w-md">
        <input
          type="text"
          value={newNGram}
          onChange={(e) => setNewNGram(e.target.value)}
          placeholder="Add manual n-gram..."
          className="flex-1 px-4 py-2 bg-[#191d35] border border-[#2a315c] rounded-xl outline-none text-sm text-white placeholder-gray-500 focus:border-violet-500 transition"
        />
        <button
          onClick={handleAddManualNGram}
          className="px-4 py-2 bg-[#1d223f] hover:bg-[#272d54] text-xs font-bold text-gray-200 border border-[#2c335f] rounded-xl flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* N-Grams Grid (4 sections) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitor N-Grams */}
        <div className="bg-[#141829] border border-[#232948] rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center border-b border-[#232948] pb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Competitor N-Grams ({competitorNGrams.length})
            </span>
            <button 
              onClick={() => competitorNGrams.forEach(n => { if(!isExcluded(n)) toggleNGramExclusion(n); })}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
            >
              Ignore All
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-[250px] overflow-y-auto pr-1">
            {competitorNGrams.map((ngram) => {
              const excluded = isExcluded(ngram);
              return (
                <button
                  key={ngram}
                  onClick={() => toggleNGramExclusion(ngram)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition ${
                    excluded
                      ? 'bg-rose-950/20 text-rose-400/60 border-rose-950/40 line-through opacity-50'
                      : 'bg-violet-950/40 text-violet-300 border-violet-850/50 hover:bg-violet-900/40'
                  }`}
                >
                  <span>{ngram}</span>
                  {!excluded && <X className="w-3 h-3 text-violet-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Picked N-Grams */}
        <div className="bg-[#141829] border border-[#232948] rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center border-b border-[#232948] pb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              ★ AI Picked N-Grams ({aiPickedNGrams.length})
            </span>
            <button 
              onClick={() => aiPickedNGrams.forEach(n => { if(!isExcluded(n)) toggleNGramExclusion(n); })}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
            >
              Ignore All
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-[250px] overflow-y-auto pr-1">
            {aiPickedNGrams.map((ngram) => {
              const excluded = isExcluded(ngram);
              return (
                <button
                  key={ngram}
                  onClick={() => toggleNGramExclusion(ngram)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition ${
                    excluded
                      ? 'bg-rose-950/20 text-rose-400/60 border-rose-950/40 line-through opacity-50'
                      : 'bg-[#2a2216]/50 text-amber-300 border-amber-800/40 hover:bg-[#382e20]/50'
                  }`}
                >
                  <span>{ngram}</span>
                  {!excluded && <X className="w-3 h-3 text-amber-450 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Generated N-Grams */}
        <div className="bg-[#141829] border border-[#232948] rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center border-b border-[#232948] pb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              AI Generated N-Grams ({aiGeneratedNGrams.length})
            </span>
            <button 
              onClick={() => aiGeneratedNGrams.forEach(n => { if(!isExcluded(n)) toggleNGramExclusion(n); })}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
            >
              Ignore All
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-[250px] overflow-y-auto pr-1">
            {aiGeneratedNGrams.map((ngram) => {
              const excluded = isExcluded(ngram);
              return (
                <button
                  key={ngram}
                  onClick={() => toggleNGramExclusion(ngram)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition ${
                    excluded
                      ? 'bg-rose-950/20 text-rose-400/60 border-rose-950/40 line-through opacity-50'
                      : 'bg-[#201529]/60 text-purple-300 border-purple-800/30 hover:bg-[#2b1f38]/60'
                  }`}
                >
                  <span>{ngram}</span>
                  {!excluded && <X className="w-3 h-3 text-purple-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Unique N-Grams */}
        <div className="bg-[#141829] border border-[#232948] rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center border-b border-[#232948] pb-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              💡 Unique N-Grams ({uniqueNGrams.length})
            </span>
            <button 
              onClick={() => uniqueNGrams.forEach(n => { if(!isExcluded(n)) toggleNGramExclusion(n); })}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
            >
              Ignore All
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-[250px] overflow-y-auto pr-1">
            {uniqueNGrams.map((ngram) => {
              const excluded = isExcluded(ngram);
              return (
                <button
                  key={ngram}
                  onClick={() => toggleNGramExclusion(ngram)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition ${
                    excluded
                      ? 'bg-rose-950/20 text-rose-400/60 border-rose-950/40 line-through opacity-50'
                      : 'bg-[#10271d]/60 text-emerald-300 border-emerald-800/30 hover:bg-[#1a382b]/60'
                  }`}
                >
                  <span>{ngram}</span>
                  {!excluded && <X className="w-3 h-3 text-emerald-450 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
