'use client';

import React, { useState } from 'react';
import { useWriterStore } from '@/store/useWriterStore';
import { PenTool, Check } from 'lucide-react';

export default function Step9Grammar() {
  const [activePreset, setActivePreset] = useState('journalistic');

  const presets = [
    {
      id: 'journalistic',
      name: 'Journalistic & Objective',
      desc: 'Enforces active voice, direct formatting, and neutral stance. Avoids promotional adjectives.',
    },
    {
      id: 'conversational',
      name: 'Conversational & Engaging',
      desc: 'Writes in second person ("you"), uses contractions, keeps tone warm and friendly.',
    },
    {
      id: 'technical',
      name: 'Detailed & Technical',
      desc: 'Favors precision, uses advanced terminology, structured bullet points, and analytical syntax.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <PenTool className="w-5 h-5 text-violet-400" />
          <span>Grammar & Writing Style Presets</span>
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Select a default grammar profile to direct the AI's structural sentence patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {presets.map((preset) => {
          const isSelected = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setActivePreset(preset.id)}
              className={`p-5 rounded-xl border text-left flex flex-col justify-between transition ${
                isSelected
                  ? 'bg-violet-950/20 border-violet-500 text-white shadow-lg shadow-violet-500/5'
                  : 'bg-[#141829] border-[#232948] hover:border-gray-700 text-gray-300'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-bold">{preset.name}</h4>
                  {isSelected && (
                    <span className="p-1 bg-violet-600 rounded-full">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{preset.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
