'use client';

import React, { useState, useEffect } from 'react';
import { useWriterStore } from '@/store/useWriterStore';
import { 
  FileText, 
  Sparkles, 
  HelpCircle,
  MessageSquare,
  Bookmark,
  Compass,
  LayoutGrid
} from 'lucide-react';

export default function Step3Content() {
  const {
    competitors,
    competitorContent,
    setCompetitorContent,
    styleAnalysis,
    setStyleAnalysis,
  } = useWriterStore();

  const [selectedUrl, setSelectedUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (competitors.length > 0 && !selectedUrl) {
      setSelectedUrl(competitors[0].url);
    }
  }, [competitors, selectedUrl]);

  const handleExtractContent = async () => {
    if (!selectedUrl) return;
    setLoading(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: selectedUrl }),
      });
      const data = await res.json();
      if (data.fullText) {
        setCompetitorContent(data.fullText);
        // Automatically extract style elements from text using mock analysis
        triggerMockStyleAnalysis(data.fullText);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const triggerMockStyleAnalysis = (text: string) => {
    // Basic heuristics to determine style analysis parameters
    const wordsCount = text.split(/\s+/).filter(Boolean).length;
    let tone = 'Formal';
    let sentenceStyle = 'Technical';
    let vocabulary = 'Advanced';
    let structure = 'Chronological';

    if (wordsCount > 1000) {
      tone = 'Conversational';
      sentenceStyle = 'Analytical';
      vocabulary = 'Intermediate';
      structure = 'Problem-Solution';
    }

    setStyleAnalysis({
      tone,
      sentenceStyle,
      vocabulary,
      structure,
    });
  };

  const wordCount = competitorContent.split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-violet-400" />
          <span>Competitor Content Analysis</span>
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Paste competitor content to inspire AI writing style (optional).
        </p>
      </div>

      {/* Optional Alert Info Box */}
      <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-xl">
        <p className="text-xs text-amber-300 leading-relaxed">
          <strong>⚠️ This step is optional</strong>
          <br />
          Paste competitor content to help AI understand the writing style, tone, and structure used in top-ranking articles. This helps create content that matches search intent.
        </p>
      </div>

      {/* Extract Content */}
      <div className="bg-[#141829] border border-[#232948] rounded-xl p-5 space-y-4">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
          Extract Content from Competitors
        </label>
        
        <div className="flex flex-col md:flex-row gap-3">
          <select
            value={selectedUrl}
            onChange={(e) => setSelectedUrl(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-[#191d35] border border-[#2a315c] rounded-xl outline-none text-sm text-white focus:border-violet-500 transition"
          >
            {competitors.map((c) => (
              <option key={c.url} value={c.url}>
                {c.url}
              </option>
            ))}
            {competitors.length === 0 && (
              <option value="">-- No Competitors Added --</option>
            )}
          </select>

          <button
            onClick={handleExtractContent}
            disabled={loading || !selectedUrl}
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 font-bold text-sm text-white rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <span>{loading ? 'Extracting...' : 'Extract'}</span>
          </button>
        </div>
      </div>

      {/* Manual Content Area */}
      <div className="bg-[#141829] border border-[#232948] rounded-xl p-5 space-y-2">
        <div className="flex justify-between items-center mb-1">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Add Content Manually</label>
          <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">{wordCount} words</span>
        </div>
        <textarea
          value={competitorContent}
          onChange={(e) => {
            setCompetitorContent(e.target.value);
            if (e.target.value.length > 50) {
              triggerMockStyleAnalysis(e.target.value);
            }
          }}
          placeholder="Paste competitor article text, notes, or excerpts here. Plain text will be formatted automatically when added."
          rows={6}
          className="w-full px-4 py-3 bg-[#191d35] border border-[#2a315c] rounded-xl outline-none text-sm text-white placeholder-gray-500 focus:border-violet-500 transition"
        />
      </div>

      {/* Style Analysis Pillars Display */}
      <div className="bg-[#141829] border border-[#232948] rounded-xl p-5 space-y-4">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">AI Will Analyze</label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#241a1a] border border-[#522929] p-4 rounded-xl flex flex-col items-center justify-center text-center">
            <MessageSquare className="w-6 h-6 text-orange-400 mb-2" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Writing Tone</h4>
            <span className="text-sm font-semibold text-orange-300 mt-1">{styleAnalysis.tone || 'Formal'}</span>
            <span className="text-[10px] text-gray-500 mt-0.5">Formal, casual, conversational</span>
          </div>

          <div className="bg-[#161f2f] border border-[#273d5e] p-4 rounded-xl flex flex-col items-center justify-center text-center">
            <Bookmark className="w-6 h-6 text-sky-400 mb-2" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sentence Style</h4>
            <span className="text-sm font-semibold text-sky-300 mt-1">{styleAnalysis.sentenceStyle || 'Technical'}</span>
            <span className="text-[10px] text-gray-500 mt-0.5">Length and complexity</span>
          </div>

          <div className="bg-[#18231a] border border-[#29422e] p-4 rounded-xl flex flex-col items-center justify-center text-center">
            <Compass className="w-6 h-6 text-emerald-400 mb-2" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Vocabulary Level</h4>
            <span className="text-sm font-semibold text-emerald-300 mt-1">{styleAnalysis.vocabulary || 'Advanced'}</span>
            <span className="text-[10px] text-gray-500 mt-0.5">Technical vs simple</span>
          </div>

          <div className="bg-[#251829] border border-[#4d2954] p-4 rounded-xl flex flex-col items-center justify-center text-center">
            <LayoutGrid className="w-6 h-6 text-pink-400 mb-2" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Content Structure</h4>
            <span className="text-sm font-semibold text-pink-300 mt-1">{styleAnalysis.structure || 'Standard'}</span>
            <span className="text-[10px] text-gray-500 mt-0.5">How ideas flow</span>
          </div>
        </div>
      </div>
    </div>
  );
}
