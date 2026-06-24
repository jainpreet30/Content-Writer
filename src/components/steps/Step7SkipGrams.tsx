'use client';

import React, { useState } from 'react';
import { useWriterStore } from '@/store/useWriterStore';
import { Tag, Sparkles, X, Plus } from 'lucide-react';

export default function Step7SkipGrams() {
  const {
    mainKeyword,
    competitorContent,
    skipGrams,
    setSkipGrams,
    excludedSkipGrams,
    toggleSkipGramExclusion,
  } = useWriterStore();

  const [loading, setLoading] = useState(false);
  const [newGram, setNewGram] = useState('');

  const handleGenerateSkipGrams = async () => {
    if (!competitorContent) return;
    setLoading(true);
    try {
      const res = await fetch('/api/nlp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: competitorContent, keyword: mainKeyword }),
      });
      const data = await res.json();
      if (data.skipGrams) {
        setSkipGrams(data.skipGrams || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddManualSkipGram = () => {
    if (newGram.trim()) {
      setSkipGrams([...skipGrams, newGram.trim()]);
      setNewGram('');
    }
  };

  const isExcluded = (sg: string) => excludedSkipGrams.includes(sg);

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Tag className="w-5 h-5 text-violet-400" />
          <span>Skip-Gram Words Analysis</span>
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Calculate Skip-Grams (word pairs that frequently exist within a fixed sliding distance window of each other).
        </p>
      </div>

      {/* Control Triggers */}
      <div className="flex gap-3">
        <button
          onClick={handleGenerateSkipGrams}
          disabled={loading || !competitorContent}
          className="w-full py-3 bg-[#ec4899] hover:bg-[#db2777] text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50"
        >
          <span>{loading ? 'Analyzing...' : 'Generate Skip-Gram Words'}</span>
        </button>
      </div>

      {/* Manual Input */}
      <div className="flex gap-2 max-w-md">
        <input
          type="text"
          value={newGram}
          onChange={(e) => setNewGram(e.target.value)}
          placeholder="Add manual skip-gram..."
          className="flex-1 px-4 py-2 bg-[#191d35] border border-[#2a315c] rounded-xl outline-none text-sm text-white placeholder-gray-500 focus:border-violet-500 transition"
        />
        <button
          onClick={handleAddManualSkipGram}
          className="px-4 py-2 bg-[#1d223f] hover:bg-[#272d54] text-xs font-bold text-gray-200 border border-[#2c335f] rounded-xl flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Skip Grams List */}
      <div className="bg-[#141829] border border-[#232948] rounded-xl p-5 space-y-3">
        <div className="flex justify-between items-center border-b border-[#232948] pb-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Skip-Gram Dominant Words ({skipGrams.length})
          </span>
          <button 
            onClick={() => skipGrams.forEach(sg => { if(!isExcluded(sg)) toggleSkipGramExclusion(sg); })}
            className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
          >
            Ignore All
          </button>
        </div>

        <div className="flex flex-wrap gap-2 max-h-[350px] overflow-y-auto pr-1">
          {skipGrams.map((gram) => {
            const excluded = isExcluded(gram);
            return (
              <button
                key={gram}
                onClick={() => toggleSkipGramExclusion(gram)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition ${
                  excluded
                    ? 'bg-rose-950/20 text-rose-400/60 border-rose-950/40 line-through opacity-50'
                    : 'bg-[#311c25]/60 text-rose-300 border-rose-800/30 hover:bg-[#432634]/60'
                }`}
              >
                <span>{gram}</span>
                {!excluded && <X className="w-3 h-3 text-rose-450 shrink-0" />}
              </button>
            );
          })}

          {skipGrams.length === 0 && (
            <p className="text-xs text-gray-500 italic py-2">Click "Generate Skip-Gram Words" or add manually.</p>
          )}
        </div>
      </div>
    </div>
  );
}
