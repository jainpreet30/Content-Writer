'use client';

import React from 'react';
import { useWriterStore } from '@/store/useWriterStore';
import { ShieldCheck, CheckSquare, Square } from 'lucide-react';

export default function Step10Rules() {
  const {
    seoRules,
    toggleSeoRule,
    selectAllSeoRules,
  } = useWriterStore();

  const selectedCount = seoRules.filter(r => r.active).length;
  const allSelected = selectedCount === seoRules.length;

  const handleSelectAllToggle = () => {
    selectAllSeoRules(!allSelected);
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-violet-400" />
            <span>SEO Optimization Rules (Koray Guidelines)</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Select the SEO formatting guidelines you wish the AI Content writer to follow explicitly.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <span className="text-xs font-bold text-gray-400 bg-[#161a2e] px-3 py-1.5 rounded-lg border border-[#2b335a]">
            {selectedCount}/{seoRules.length} selected
          </span>
          <button
            onClick={handleSelectAllToggle}
            className="px-4 py-1.5 rounded-lg text-xs font-extrabold transition bg-violet-600 hover:bg-violet-500 text-white"
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {seoRules.map((rule) => {
          return (
            <button
              key={rule.id}
              onClick={() => toggleRuleLocal(rule.id)}
              className={`text-left p-4 rounded-xl border transition flex gap-3.5 items-start ${
                rule.active
                  ? 'bg-violet-950/20 border-violet-500/70 hover:border-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.1)]'
                  : 'bg-[#141829] border-[#232948] hover:border-[#2f3864] text-gray-400'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {rule.active ? (
                  <div className="w-4 h-4 rounded bg-violet-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded border border-gray-600 bg-[#181d36]" />
                )}
              </div>
              
              <div className="space-y-1">
                <span className={`text-sm font-bold block ${rule.active ? 'text-white' : 'text-gray-300'}`}>
                  {rule.label}
                </span>
                <span className="text-xs text-gray-400 font-medium leading-relaxed block">
                  {rule.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  function toggleRuleLocal(id: string) {
    toggleSeoRule(id);
  }
}
