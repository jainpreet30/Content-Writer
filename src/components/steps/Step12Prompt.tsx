'use client';

import React, { useEffect } from 'react';
import { useWriterStore } from '@/store/useWriterStore';
import { Terminal, RefreshCw, Copy, Check } from 'lucide-react';

export default function Step12Prompt() {
  const {
    mainKeyword,
    outline,
    styleAnalysis,
    competitorEntities,
    aiEntities,
    excludedEntities,
    aiPickedNGrams,
    aiGeneratedNGrams,
    uniqueNGrams,
    competitorNGrams,
    excludedNGrams,
    nlpKeywords,
    excludedNLPKeywords,
    skipGrams,
    excludedSkipGrams,
    alphabetics,
    aiInstructions,
    customInstructions,
    seoRules,
    masterPrompt,
    setMasterPrompt,
  } = useWriterStore();

  const [copied, setCopied] = React.useState(false);

  const compilePrompt = () => {
    // 1. Core Config
    let prompt = `You are an expert SEO Content Writer. Generate a highly optimized article matching this configuration:

PRIMARY KEYWORD: "${mainKeyword || 'SEO Content Writing'}"
TONE & STYLE: ${styleAnalysis.tone || 'Formal'}, ${styleAnalysis.sentenceStyle || 'Technical'}, Vocabulary Level: ${styleAnalysis.vocabulary || 'Advanced'}

ARTICLE OUTLINE & WORD BUDGETS:
`;

    // 2. Heading budgets
    outline.forEach((item) => {
      prompt += `- Heading: ${item.text} (${item.type}) -> Target word count: ${item.wordCountTarget || 200} words.\n`;
    });

    if (outline.length === 0) {
      prompt += `- No specific outline provided. Generate an optimal 2000-word structure.\n`;
    }

    // 3. Filtered Active Entities
    const allEntities = [...new Set([...competitorEntities, ...aiEntities])];
    const activeEntities = allEntities.filter((e) => !excludedEntities.includes(e));
    prompt += `\nREQUIRED ENTITIES TO INCLUDE:
${activeEntities.length > 0 ? activeEntities.map((e) => `- ${e}`).join('\n') : '(None specified)'}
`;

    // 4. Filtered Active N-Grams & LSI Terms
    const allNGrams = [...new Set([...competitorNGrams, ...aiPickedNGrams, ...aiGeneratedNGrams, ...uniqueNGrams])];
    const activeNGrams = allNGrams.filter((n) => !excludedNGrams.includes(n));
    const activeNLP = nlpKeywords.filter((k) => !excludedNLPKeywords.includes(k));
    const activeSkip = skipGrams.filter((s) => !excludedSkipGrams.includes(s));
    
    prompt += `\nREQUIRED N-GRAMS, LSI, & SKIP-GRAMS PHRASES:
${activeNGrams.length > 0 ? activeNGrams.map((n) => `- ${n}`).join('\n') : '(None)'}
${activeNLP.length > 0 ? activeNLP.map((k) => `- ${k}`).join('\n') : ''}
${activeSkip.length > 0 ? activeSkip.map((s) => `- ${s}`).join('\n') : ''}
`;

    // 5. Autocomplete grid active suggestions
    const activeSuggestions = alphabetics.filter((a) => a.checked).map((a) => a.keyword);
    if (activeSuggestions.length > 0) {
      prompt += `\nADDITIONAL SUGGESTION KEYWORDS TO COVER:
${activeSuggestions.map((s) => `- ${s}`).join('\n')}
`;
    }

    // 6. Exclusions
    const allExcluded = [
      ...excludedEntities,
      ...excludedNGrams,
      ...excludedNLPKeywords,
      ...excludedSkipGrams,
    ];
    if (allExcluded.length > 0) {
      prompt += `\nDO NOT USE ANY OF THESE EXCLUDED TERMS:
${allExcluded.map((x) => `- ${x}`).join('\n')}
`;
    }

    // 7. System AI Instructions
    prompt += `\nWRITING DIRECTIVES:
`;
    if (aiInstructions.concise) {
      prompt += `- Concise Writing Style: Remove unnecessary words. Use active voice. Make every word count.\n`;
    }
    if (aiInstructions.natural) {
      prompt += `- Natural Human Language: Write plainly with short sentences. Avoid AI clichés. Be direct and conversational.\n`;
    }
    if (aiInstructions.avoidAi) {
      prompt += `- Avoid AI Writing Patterns: Skip robotic transitions, banned words, and overused AI phrases.\n`;
    }

    // 7b. SEO Optimization Rules (Koray Guidelines)
    const activeRules = seoRules.filter((r) => r.active);
    if (activeRules.length > 0) {
      prompt += `\nSEO OPTIMIZATION RULES (FOLLOW EXPLICITLY):\n`;
      activeRules.forEach((r) => {
        prompt += `- ${r.label}: ${r.promptGuideline}\n`;
      });
    }

    if (customInstructions.trim()) {
      prompt += `- Custom Request: ${customInstructions.trim()}\n`;
    }

    prompt += `\nGenerate the full article following this structure explicitly.`;

    setMasterPrompt(prompt);
  };

  // Compile prompt on mount
  useEffect(() => {
    compilePrompt();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(masterPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Terminal className="w-5 h-5 text-violet-400" />
            <span>Master Prompt Compiler</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            This is the complete structured prompt compiled from all previous steps. You can modify it or copy it directly.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161a2e] hover:bg-[#1f2545] border border-[#2b335a] text-xs font-bold text-gray-300 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-450" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          
          <button
            onClick={compilePrompt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* Prompt Area */}
      <div className="bg-[#141829] border border-[#232948] rounded-xl p-5 relative">
        <textarea
          value={masterPrompt}
          onChange={(e) => setMasterPrompt(e.target.value)}
          rows={15}
          className="w-full bg-transparent border-none outline-none font-mono text-xs text-gray-350 leading-relaxed resize-y placeholder-gray-600 focus:ring-0 focus:outline-none"
          placeholder="Compiling prompt..."
        />
        <div className="absolute bottom-3 right-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
          ~{Math.round(masterPrompt.length / 4)} tokens
        </div>
      </div>
    </div>
  );
}
