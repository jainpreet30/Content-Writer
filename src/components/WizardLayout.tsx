'use client';

import React, { useState, useEffect } from 'react';
import { useWriterStore } from '@/store/useWriterStore';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  RefreshCw, 
  Eye,
  EyeOff, 
  BookOpen, 
  Key, 
  Sparkles 
} from 'lucide-react';

interface WizardLayoutProps {
  children: React.ReactNode;
}

export default function WizardLayout({ children }: WizardLayoutProps) {
  const { 
    currentStep, 
    nextStep, 
    prevStep, 
    setStep,
    apiKeys,
    setApiKeys,
    resetAll,
    appMode,
    setAppMode,
    projectId,
    activeView,
    setActiveView
  } = useWriterStore();

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [localKeys, setLocalKeys] = useState(apiKeys);
  const [lastActiveStep, setLastActiveStep] = useState(0);

  useEffect(() => {
    if (currentStep < 13) {
      setLastActiveStep(currentStep);
    }
  }, [currentStep]);

  // Sync localKeys from the store whenever apiKeys change.
  // This covers two cases:
  // 1. After Zustand rehydrates from localStorage on first mount (apiKeys go from '' to saved values).
  // 2. When the modal opens, always reflect the latest saved keys.
  useEffect(() => {
    setLocalKeys(apiKeys);
  }, [apiKeys]);

  const stepsList = [
    'Competitor Research',
    'Outline Creation',
    'Word Count',
    'Competitor Content',
    'Entities',
    '# N-Grams',
    'NLP Keywords',
    'Skip-Gram Words',
    'Auto-Suggest Keywords',
    'Grammar Generator',
    'SEO Rules',
    'AI Instructions',
    'Master Prompt',
    'Content Editor'
  ];

  const handleSaveKeys = () => {
    const trimmed = {
      openai: localKeys.openai.trim(),
      deepseek: localKeys.deepseek.trim(),
      gemini: localKeys.gemini.trim(),
      serper: localKeys.serper.trim(),
    };
    setApiKeys(trimmed);
    setShowApiKeyModal(false);
  };

  const hasKeys = apiKeys.openai || apiKeys.deepseek || apiKeys.gemini;

  return (
    <div className="min-h-screen bg-[#0b0c16] text-[#f3f4f6] flex flex-col font-sans">
      {/* Top Banner / Header */}
      <header className="border-b border-[#1e233d] bg-[#0f111f]/90 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-violet-600 to-pink-500 rounded-xl shadow-lg shadow-violet-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight flex items-center gap-2">
              Content Writer
            </h1>
            <span className="text-xs text-violet-400 font-semibold tracking-wider uppercase">⚡ Quick Mode</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeView === 'dashboard' ? (
            <button 
              onClick={() => setActiveView('writer')} 
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border border-violet-500 text-sm text-white font-bold transition shadow-lg shadow-violet-600/15 cursor-pointer animate-pulse"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Back to Editor</span>
            </button>
          ) : (
            <>
              {currentStep === 13 ? (
                <button 
                  onClick={() => setStep(lastActiveStep)} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 border border-violet-500 text-sm text-white font-semibold transition shadow-lg shadow-violet-600/15 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-white" />
                  <span>View Process</span>
                </button>
              ) : appMode === 'wizard' ? (
                <button 
                  onClick={() => setStep(13)} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161a2e] hover:bg-[#1f2545] border border-[#2b335a] text-sm text-gray-300 transition cursor-pointer"
                >
                  <EyeOff className="w-4 h-4 text-violet-400" />
                  <span>Hide Process</span>
                </button>
              ) : null}

              <button 
                onClick={() => setActiveView('dashboard')} 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161a2e] hover:bg-[#1f2545] border border-[#2b335a] text-sm text-gray-300 transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-violet-400" />
                <span>My Articles</span>
              </button>
            </>
          )}
          
          <button 
            onClick={() => setShowApiKeyModal(true)} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161a2e] hover:bg-[#1f2545] border border-[#2b335a] text-sm text-gray-300 transition"
          >
            <Key className="w-4 h-4 text-pink-400" />
            <span>API Keys</span>
          </button>

          <button 
            onClick={resetAll} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161a2e] hover:bg-rose-950/40 border border-rose-900/30 text-sm text-rose-300 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Start Fresh</span>
          </button>
        </div>
      </header>

      {/* API Key Missing Alert */}
      {!hasKeys && currentStep < 13 && (
        <div className="mx-6 mt-4 p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-amber-300">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>No API Key configured - Using local tokenizers & natural language fallbacks.</span>
          </div>
          <button 
            onClick={() => setShowApiKeyModal(true)} 
            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition"
          >
            Add API Key
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Only visible when not in the final full-screen editor and in writer view) */}
        {currentStep < 13 && activeView === 'writer' && (
          <aside className="w-72 bg-[#0c0e1a]/95 border-r border-[#1e233d] flex flex-col justify-between shrink-0 p-5 hidden md:flex">
            <div className="space-y-6">
              <div>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Workspace Modes</h2>
                <p className="text-[10px] text-gray-400 mt-0.5">Select how you want to build content</p>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => setAppMode('wizard')}
                  className={`w-full text-left p-3.5 rounded-2xl border transition flex items-start gap-3 cursor-pointer ${
                    appMode === 'wizard'
                      ? 'bg-violet-950/20 border-violet-500/40 text-white shadow-inner shadow-violet-500/5'
                      : 'bg-transparent border-[#232948] text-gray-400 hover:border-gray-700 hover:text-gray-300'
                  }`}
                >
                  <BookOpen className={`w-5 h-5 shrink-0 mt-0.5 ${appMode === 'wizard' ? 'text-violet-400' : 'text-gray-500'}`} />
                  <div>
                    <h3 className="text-xs font-bold">Guided Wizard</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">
                      Walk through competitor analysis, outlines, NLP keywords, and SEO guidelines.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setAppMode('autopilot');
                    // Reset step so they see the autopilot input screen
                    if (currentStep === 13) {
                      setStep(0);
                    }
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition flex items-start gap-3 cursor-pointer ${
                    appMode === 'autopilot'
                      ? 'bg-violet-950/20 border-violet-500/40 text-white shadow-inner shadow-violet-500/5'
                      : 'bg-transparent border-[#232948] text-gray-400 hover:border-gray-700 hover:text-gray-300'
                  }`}
                >
                  <Sparkles className={`w-5 h-5 shrink-0 mt-0.5 ${appMode === 'autopilot' ? 'text-violet-400' : 'text-gray-500'}`} />
                  <div>
                    <h3 className="text-xs font-bold">Autopilot Writer</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">
                      Instantly generate optimized drafts by analyzing keywords in the background.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1e233d] text-[10px] text-gray-500 flex flex-col gap-1">
              <span>Project ID: <code className="text-gray-400">{projectId.slice(0, 12)}</code></span>
              <span>Active Mode: <strong className="text-violet-400 uppercase">{appMode}</strong></span>
            </div>
          </aside>
        )}

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Stepper Tabs - Horizontal Scrollable Row (Wizard only) */}
          {currentStep < 13 && appMode === 'wizard' && activeView === 'writer' && (
            <div className="px-6 py-4 overflow-x-auto border-b border-[#131627] bg-[#0c0e1a]/60">
              <div className="flex items-center space-x-2 min-w-max">
                {stepsList.map((stepName, index) => {
                  const isActive = currentStep === index;
                  const isPast = index < currentStep;
                  
                  return (
                    <React.Fragment key={index}>
                      <button
                        onClick={() => setStep(index)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 border cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-500 shadow-md shadow-violet-600/10'
                            : isPast
                            ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40 hover:bg-emerald-950/40'
                            : 'bg-[#121526]/50 text-gray-400 border-[#202540] hover:bg-[#1a1e38]/50'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          isActive ? 'bg-white text-violet-600' : isPast ? 'bg-emerald-400 text-emerald-950' : 'bg-[#252a4e] text-gray-300'
                        }`}>
                          {index + 1}
                        </span>
                        <span>{stepName}</span>
                      </button>
                      {index < stepsList.length - 1 && (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step Body */}
          <main className={`px-6 py-6 ${(currentStep === 13 || activeView === 'dashboard') ? 'flex-1 flex flex-col' : ''}`}>
            <div className={`bg-[#101223]/70 border border-[#1e223d]/60 rounded-2xl p-6 shadow-xl shadow-black/10 ${(currentStep === 13 || activeView === 'dashboard') ? 'flex-1 flex flex-col' : ''}`}>
              {children}
            </div>
          </main>

          {/* Footer Navigation (Wizard only) */}
          {currentStep < 13 && appMode === 'wizard' && activeView === 'writer' && (
            <footer className="border-t border-[#131627] bg-[#0b0c16] px-6 py-4 flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#161a2e] hover:bg-[#1f2545] border border-[#2b335a] text-sm text-gray-300 transition disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => setStep(currentStep === 12 ? 13 : currentStep + 1)}
                className="px-6 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-sm font-semibold transition"
              >
                ⏭️ Skip
              </button>

              <button
                onClick={nextStep}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-bold text-white transition shadow-lg shadow-violet-600/15"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </footer>
          )}
        </div>
      </div>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#131627] border border-[#2e345e] rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-violet-400" />
              <span>Configure AI & SERP Keys</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">OpenAI API Key</label>
                <input 
                  type="password"
                  value={localKeys.openai}
                  onChange={(e) => setLocalKeys({ ...localKeys, openai: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 bg-[#1b1f3b] border border-[#2a305c] rounded-xl outline-none text-sm text-white placeholder-gray-600 focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">DeepSeek API Key</label>
                <input 
                  type="password"
                  value={localKeys.deepseek}
                  onChange={(e) => setLocalKeys({ ...localKeys, deepseek: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 bg-[#1b1f3b] border border-[#2a305c] rounded-xl outline-none text-sm text-white placeholder-gray-600 focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Gemini API Key</label>
                <input 
                  type="password"
                  value={localKeys.gemini}
                  onChange={(e) => setLocalKeys({ ...localKeys, gemini: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 bg-[#1b1f3b] border border-[#2a305c] rounded-xl outline-none text-sm text-white placeholder-gray-600 focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Serper.dev API Key</label>
                <input 
                  type="password"
                  value={localKeys.serper}
                  onChange={(e) => setLocalKeys({ ...localKeys, serper: e.target.value })}
                  placeholder="API Key..."
                  className="w-full px-3 py-2 bg-[#1b1f3b] border border-[#2a305c] rounded-xl outline-none text-sm text-white placeholder-gray-600 focus:border-violet-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button 
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveKeys}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-bold text-white transition"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
