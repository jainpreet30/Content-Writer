'use client';

import React, { useState } from 'react';
import { useWriterStore, AlphabeticSuggestion } from '@/store/useWriterStore';
import { Search, Sparkles, CheckSquare, Square } from 'lucide-react';

export default function Step8AutoSuggest() {
  const {
    mainKeyword,
    alphabetics,
    setAlphabetics,
    toggleAlphabeticChecked,
    apiKeys,
  } = useWriterStore();

  const [loading, setLoading] = useState(false);
  const [filtering, setFiltering] = useState(false);

  const handleRunAutocompleteLoop = async () => {
    if (!mainKeyword) return;
    setLoading(true);
    try {
      const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
      const suggestionsList: AlphabeticSuggestion[] = [];

      // Run autocomplete queries concurrently or sequentially
      // For speed and stability, we run fetch requests for a subset or simulate full variations
      // We query autocomplete for each letter: keyword + letter
      const queries = alphabet.map(async (char) => {
        try {
          const res = await fetch(`/api/serp?q=${encodeURIComponent(`${mainKeyword} ${char}`)}`);
          const data = await res.json();
          // Take top 3 suggestions per character
          const list = (data.suggestions || []).slice(0, 3).map((kw: string) => ({
            letter: char.toUpperCase(),
            keyword: kw,
            checked: true,
          }));
          return list;
        } catch (e) {
          return [];
        }
      });

      const results = await Promise.all(queries);
      const flattened = results.flat();

      if (flattened.length > 0) {
        setAlphabetics(flattened);
      } else {
        // Fallback default suggestions if Google Suggest is rate-limited or offline
        generateFallbackSuggestions();
      }
    } catch (e) {
      console.error(e);
      generateFallbackSuggestions();
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackSuggestions = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    const fallbacks: AlphabeticSuggestion[] = [];
    
    letters.forEach(char => {
      fallbacks.push({
        letter: char,
        keyword: `${mainKeyword} for ${char.toLowerCase()} businesses`,
        checked: true,
      });
      fallbacks.push({
        letter: char,
        keyword: `${mainKeyword} software ${char.toLowerCase()}`,
        checked: true,
      });
    });
    
    setAlphabetics(fallbacks);
  };

  const handleAiFilter = async () => {
    if (alphabetics.length === 0) return;
    setFiltering(true);
    try {
      const res = await fetch('/api/autosuggest/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: mainKeyword,
          suggestions: alphabetics.map(a => a.keyword),
          apiKeys
        })
      });
      const data = await res.json();
      if (data.relevance) {
        const updated = alphabetics.map(item => ({
          ...item,
          checked: !!data.relevance[item.keyword]
        }));
        setAlphabetics(updated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFiltering(false);
    }
  };

  const aToZ = alphabetics.filter(item => /^[A-Z]$/.test(item.letter));
  const zeroToNine = alphabetics.filter(item => /^[0-9]$/.test(item.letter));

  // Group by letter
  const groupByLetter = (items: AlphabeticSuggestion[]) => {
    const groups: Record<string, AlphabeticSuggestion[]> = {};
    items.forEach(item => {
      if (!groups[item.letter]) groups[item.letter] = [];
      groups[item.letter].push(item);
    });
    return groups;
  };

  const azGroups = groupByLetter(aToZ);
  const numGroups = groupByLetter(zeroToNine);

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Search className="w-5 h-5 text-violet-400" />
          <span>A-Z & 0-9 Autocomplete Loop</span>
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Automatically query autocomplete suggest engines to find long-tail keyword variations. Check or uncheck terms to include in targets.
        </p>
      </div>

      {/* Trigger Button */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleRunAutocompleteLoop}
          disabled={loading || filtering || !mainKeyword}
          className="px-6 py-2.5 bg-[#1b1f3c] hover:bg-[#252c58] border border-[#2a315c] font-bold text-sm text-white rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
        >
          <Search className="w-4 h-4 text-violet-400" />
          <span>{loading ? 'Running Autocomplete Loop...' : 'Search Autocomplete'}</span>
        </button>

        {alphabetics.length > 0 && (
          <button
            onClick={handleAiFilter}
            disabled={loading || filtering}
            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 font-bold text-sm text-white rounded-xl flex items-center gap-1.5 transition disabled:opacity-50 shadow-lg shadow-violet-600/10"
          >
            <Sparkles className="w-4 h-4" />
            <span>{filtering ? 'AI Selecting Relevant...' : 'AI Filter Relevance'}</span>
          </button>
        )}
      </div>

      {alphabetics.length === 0 && !loading && (
        <div className="text-center py-10 bg-[#141829] border border-[#232948] rounded-xl">
          <p className="text-sm text-gray-400 italic">No search autocomplete data loaded. Click "Search Autocomplete" above to start the loop.</p>
        </div>
      )}

      {alphabetics.length > 0 && (
        <div className="space-y-8">
          {/* A-Z Letter Variations */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest border-b border-[#232948] pb-1">
              A-Z Letter Variations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(azGroups).map(([letter, groupItems]) => (
                <div key={letter} className="bg-[#141829] border border-[#232948] rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-[#1d2b24] border-b border-[#203a2c] px-3.5 py-1.5 flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-400">+{letter}</span>
                  </div>
                  <div className="p-3.5 space-y-2">
                    {groupItems.map((item) => (
                      <button
                        key={item.keyword}
                        onClick={() => toggleAlphabeticChecked(item.keyword)}
                        className="w-full text-left flex items-start gap-2 group transition"
                      >
                        {item.checked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-600 group-hover:text-gray-400 shrink-0 mt-0.5" />
                        )}
                        <span className={`text-[11px] leading-tight ${item.checked ? 'text-gray-200' : 'text-gray-500 line-through'}`}>
                          {item.keyword}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 0-9 Number Variations */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-[#232948] pb-1">
              0-9 Number Variations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(numGroups).map(([num, groupItems]) => (
                <div key={num} className="bg-[#141829] border border-[#232948] rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-[#18233d] border-b border-[#23355e] px-3.5 py-1.5 flex items-center justify-between">
                    <span className="text-xs font-black text-blue-400">+{num}</span>
                  </div>
                  <div className="p-3.5 space-y-2">
                    {groupItems.map((item) => (
                      <button
                        key={item.keyword}
                        onClick={() => toggleAlphabeticChecked(item.keyword)}
                        className="w-full text-left flex items-start gap-2 group transition"
                      >
                        {item.checked ? (
                          <CheckSquare className="w-4 h-4 text-blue-450 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-600 group-hover:text-gray-400 shrink-0 mt-0.5" />
                        )}
                        <span className={`text-[11px] leading-tight ${item.checked ? 'text-gray-200' : 'text-gray-500 line-through'}`}>
                          {item.keyword}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
