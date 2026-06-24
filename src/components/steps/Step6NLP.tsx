'use client';

import React, { useState } from 'react';
import { useWriterStore } from '@/store/useWriterStore';
import { Tag, Sparkles, X, Plus } from 'lucide-react';

export default function Step6NLP() {
  const {
    mainKeyword,
    competitorContent,
    nlpKeywords,
    setNlpKeywords,
    excludedNLPKeywords,
    toggleNlpKeywordExclusion,
  } = useWriterStore();

  const [loading, setLoading] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  const handleExtractNLP = async () => {
    if (!competitorContent) return;
    setLoading(true);
    try {
      const res = await fetch('/api/nlp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: competitorContent, keyword: mainKeyword }),
      });
      const data = await res.json();
      if (data.nlpKeywords) {
        setNlpKeywords(data.nlpKeywords || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddManualKeyword = () => {
    if (newKeyword.trim()) {
      setNlpKeywords([...nlpKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const isExcluded = (kw: string) => excludedNLPKeywords.includes(kw);

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Tag className="w-5 h-5 text-violet-400" />
          <span>NLP & LSI Keywords</span>
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Identify Latent Semantic Indexing (LSI) and NLP keywords that frequently appear in search-intent matching pages.
        </p>
      </div>

      {/* Control Triggers */}
      <div className="flex gap-3">
        <button
          onClick={handleExtractNLP}
          disabled={loading || !competitorContent}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 font-bold text-sm text-white rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
        >
          <span>{loading ? 'Processing...' : 'Extract NLP Keywords'}</span>
        </button>
      </div>

      {/* Manual Input */}
      <div className="flex gap-2 max-w-md">
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          placeholder="Add manual keyword..."
          className="flex-1 px-4 py-2 bg-[#191d35] border border-[#2a315c] rounded-xl outline-none text-sm text-white placeholder-gray-500 focus:border-violet-500 transition"
        />
        <button
          onClick={handleAddManualKeyword}
          className="px-4 py-2 bg-[#1d223f] hover:bg-[#272d54] text-xs font-bold text-gray-200 border border-[#2c335f] rounded-xl flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Keywords List */}
      <div className="bg-[#141829] border border-[#232948] rounded-xl p-5 space-y-3">
        <div className="flex justify-between items-center border-b border-[#232948] pb-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Active NLP/LSI Keywords ({nlpKeywords.length})
          </span>
          <button 
            onClick={() => nlpKeywords.forEach(k => { if(!isExcluded(k)) toggleNlpKeywordExclusion(k); })}
            className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
          >
            Ignore All
          </button>
        </div>

        <div className="flex flex-wrap gap-2 max-h-[350px] overflow-y-auto pr-1">
          {nlpKeywords.map((keyword) => {
            const excluded = isExcluded(keyword);
            return (
              <button
                key={keyword}
                onClick={() => toggleNlpKeywordExclusion(keyword)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition ${
                  excluded
                    ? 'bg-rose-950/20 text-rose-400/60 border-rose-950/40 line-through opacity-50'
                    : 'bg-[#1b253c]/40 text-blue-300 border-blue-900/40 hover:bg-[#243355]/40'
                }`}
              >
                <span>{keyword}</span>
                {!excluded && <X className="w-3 h-3 text-blue-400 shrink-0" />}
              </button>
            );
          })}

          {nlpKeywords.length === 0 && (
            <p className="text-xs text-gray-500 italic py-2">Click "Extract NLP Keywords" or add manually.</p>
          )}
        </div>
      </div>
    </div>
  );
}
