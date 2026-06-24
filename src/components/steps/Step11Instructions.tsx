'use client';

import React from 'react';
import { useWriterStore } from '@/store/useWriterStore';
import { Settings, CheckSquare, Square } from 'lucide-react';

export default function Step11Instructions() {
  const {
    aiInstructions,
    setAiInstructions,
    customInstructions,
    setCustomInstructions,
  } = useWriterStore();

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Settings className="w-5 h-5 text-violet-400" />
          <span>System AI Instructions</span>
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Toggle core structural directives and append custom writing rules.
        </p>
      </div>

      {/* Core Rules List */}
      <div className="space-y-3">
        {/* Concise Writing Style */}
        <button
          onClick={() => setAiInstructions({ concise: !aiInstructions.concise })}
          className="w-full text-left p-5 bg-[#251722]/60 border border-[#54284b]/40 rounded-xl flex items-start gap-4 hover:bg-[#251722]/80 transition"
        >
          {aiInstructions.concise ? (
            <CheckSquare className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
          ) : (
            <Square className="w-5 h-5 text-gray-650 shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className="text-sm font-extrabold text-white">Concise Writing Style</h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Remove unnecessary words. Use active voice. Make every word count.
            </p>
          </div>
        </button>

        {/* Natural Human Language */}
        <button
          onClick={() => setAiInstructions({ natural: !aiInstructions.natural })}
          className="w-full text-left p-5 bg-[#251722]/60 border border-[#54284b]/40 rounded-xl flex items-start gap-4 hover:bg-[#251722]/80 transition"
        >
          {aiInstructions.natural ? (
            <CheckSquare className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
          ) : (
            <Square className="w-5 h-5 text-gray-650 shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className="text-sm font-extrabold text-white">Natural Human Language</h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Write plainly with short sentences. Avoid AI clichés. Be direct and conversational.
            </p>
          </div>
        </button>

        {/* Avoid AI Writing Patterns */}
        <button
          onClick={() => setAiInstructions({ avoidAi: !aiInstructions.avoidAi })}
          className="w-full text-left p-5 bg-[#251722]/60 border border-[#54284b]/40 rounded-xl flex items-start gap-4 hover:bg-[#251722]/80 transition"
        >
          {aiInstructions.avoidAi ? (
            <CheckSquare className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
          ) : (
            <Square className="w-5 h-5 text-gray-650 shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className="text-sm font-extrabold text-white">Avoid AI Writing Patterns</h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Skip robotic transitions, banned words, and overused AI phrases.
            </p>
          </div>
        </button>
      </div>

      {/* Custom Writing Directives */}
      <div className="bg-[#141829] border border-[#232948] rounded-xl p-5 space-y-2">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Custom Writing Directives</label>
        <textarea
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          placeholder="e.g. Do not mention competitors in a negative light. Use bullet points for comparisons where possible."
          rows={4}
          className="w-full px-4 py-3 bg-[#191d35] border border-[#2a315c] rounded-xl outline-none text-sm text-white placeholder-gray-500 focus:border-violet-500 transition"
        />
      </div>
    </div>
  );
}
