'use client';

import React, { useState } from 'react';
import { useWriterStore } from '@/store/useWriterStore';
import { Tag, Sparkles, X, Plus } from 'lucide-react';

export default function Step4Entities() {
  const {
    mainKeyword,
    competitorContent,
    competitorEntities,
    setCompetitorEntities,
    aiEntities,
    setAiEntities,
    excludedEntities,
    toggleEntityExclusion,
  } = useWriterStore();

  const [loading, setLoading] = useState(false);
  const [newEntity, setNewEntity] = useState('');

  const handleExtractEntities = async () => {
    if (!competitorContent) return;
    setLoading(true);
    try {
      const res = await fetch('/api/nlp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: competitorContent, keyword: mainKeyword }),
      });
      const data = await res.json();
      if (data.entities) {
        setCompetitorEntities(data.entities.competitor || []);
        setAiEntities(data.entities.ai || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAiEntities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/nlp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: competitorContent || '', keyword: mainKeyword }),
      });
      const data = await res.json();
      if (data.entities && data.entities.ai) {
        setAiEntities(data.entities.ai);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddManualEntity = () => {
    if (newEntity.trim()) {
      setCompetitorEntities([...competitorEntities, newEntity.trim()]);
      setNewEntity('');
    }
  };

  const isExcluded = (entity: string) => excludedEntities.includes(entity);

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Tag className="w-5 h-5 text-violet-400" />
          <span>SEO Entities Extraction</span>
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Extract competitor brand mentions, software tools, and prominent SEO entities. Click any tag to exclude it from the final prompt.
        </p>
      </div>

      {/* Control Triggers */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExtractEntities}
          disabled={loading || !competitorContent}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 font-bold text-sm text-white rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
        >
          <span>{loading ? 'Extracting...' : 'Extract from Competitors'}</span>
        </button>

        <button
          onClick={handleGenerateAiEntities}
          className="px-5 py-2.5 bg-[#1b1f3c] hover:bg-[#262c55] border border-[#2b335a] font-bold text-sm text-violet-400 rounded-xl flex items-center gap-1.5 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate AI Entities</span>
        </button>
      </div>

      {/* Manual Input */}
      <div className="flex gap-2 max-w-md">
        <input
          type="text"
          value={newEntity}
          onChange={(e) => setNewEntity(e.target.value)}
          placeholder="Add manual entity..."
          className="flex-1 px-4 py-2 bg-[#191d35] border border-[#2a315c] rounded-xl outline-none text-sm text-white placeholder-gray-500 focus:border-violet-500 transition"
        />
        <button
          onClick={handleAddManualEntity}
          className="px-4 py-2 bg-[#1d223f] hover:bg-[#272d54] text-xs font-bold text-gray-200 border border-[#2c335f] rounded-xl flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Entities Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitor Entities */}
        <div className="bg-[#141829] border border-[#232948] rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center border-b border-[#232948] pb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Competitor Entities ({competitorEntities.length})
            </span>
            <button 
              onClick={() => competitorEntities.forEach(e => { if(!isExcluded(e)) toggleEntityExclusion(e); })}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
            >
              Ignore All
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-1">
            {competitorEntities.map((entity) => {
              const excluded = isExcluded(entity);
              return (
                <button
                  key={entity}
                  onClick={() => toggleEntityExclusion(entity)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition ${
                    excluded
                      ? 'bg-rose-950/20 text-rose-400/60 border-rose-950/40 line-through opacity-50'
                      : 'bg-violet-950/40 text-violet-300 border-violet-850/50 hover:bg-violet-900/40'
                  }`}
                >
                  <span>{entity}</span>
                  {!excluded && <X className="w-3 h-3 text-violet-400 shrink-0" />}
                </button>
              );
            })}

            {competitorEntities.length === 0 && (
              <p className="text-xs text-gray-500 italic py-2">Click "Extract from Competitors" to begin or add manually.</p>
            )}
          </div>
        </div>

        {/* AI-Generated Entities */}
        <div className="bg-[#141829] border border-[#232948] rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center border-b border-[#232948] pb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              AI-Generated Entities ({aiEntities.length})
            </span>
            <button 
              onClick={() => aiEntities.forEach(e => { if(!isExcluded(e)) toggleEntityExclusion(e); })}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
            >
              Ignore All
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-1">
            {aiEntities.map((entity) => {
              const excluded = isExcluded(entity);
              return (
                <button
                  key={entity}
                  onClick={() => toggleEntityExclusion(entity)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition ${
                    excluded
                      ? 'bg-rose-950/20 text-rose-400/60 border-rose-950/40 line-through opacity-50'
                      : 'bg-pink-950/40 text-pink-300 border-pink-850/50 hover:bg-pink-900/40'
                  }`}
                >
                  <span>{entity}</span>
                  {!excluded && <X className="w-3 h-3 text-pink-400 shrink-0" />}
                </button>
              );
            })}

            {aiEntities.length === 0 && (
              <p className="text-xs text-gray-500 italic py-2">Click "Generate AI Entities" to view suggested targets.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
