'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Competitor {
  url: string;
  isManual: boolean;
  rawHtml?: string;
  wordCount?: number;
}

export interface HeadingItem {
  id: string;
  type: 'H2' | 'H3' | 'H4';
  text: string;
  wordCountTarget: number;
}

export interface StyleAnalysis {
  tone: string;
  sentenceStyle: string;
  vocabulary: string;
  structure: string;
}

export interface AlphabeticSuggestion {
  letter: string;
  keyword: string;
  checked: boolean;
}

export interface SavedArticle {
  id: string;
  keyword: string;
  title: string;
  content: string;
  outline: HeadingItem[];
  score: number;
  wordCount: number;
  status: 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface SeoRule {
  id: string;
  label: string;
  desc: string;
  active: boolean;
  promptGuideline: string;
}

export const defaultSeoRules: SeoRule[] = [
  {
    id: 'rule1',
    label: 'Answer First',
    desc: "Don't distance the question from the answer. Answer immediately, then elaborate.",
    active: false,
    promptGuideline: "Answer questions immediately at the start of a section or paragraph before elaborating."
  },
  {
    id: 'rule2',
    label: 'Avoid Coreference Errors',
    desc: 'Use clear pronoun references. Avoid ambiguous "he", "she", "they", "it".',
    active: false,
    promptGuideline: "Avoid coreference errors by using clear, explicit nouns instead of ambiguous pronouns (like he, she, it, they)."
  },
  {
    id: 'rule3',
    label: 'Use Abbreviations Properly',
    desc: 'Include abbreviation in parentheses on first mention.',
    active: false,
    promptGuideline: "Introduce abbreviations properly by including the abbreviation in parentheses on its first mention (e.g., Search Engine Optimization (SEO))."
  },
  {
    id: 'rule4',
    label: 'Give Safe Answers',
    desc: 'Provide comprehensive answers with factors, examples, and sources.',
    active: false,
    promptGuideline: "Provide comprehensive and safe answers including relevant factors, examples, and hypothetical sources."
  },
  {
    id: 'rule5',
    label: 'If Statements Second',
    desc: 'Put "if" conditions in the second part of the sentence.',
    active: false,
    promptGuideline: "Structure conditional sentences with the 'if' clause in the second part of the sentence (e.g., 'Write optimized content if you want to rank' instead of 'If you want to rank, write optimized content')."
  },
  {
    id: 'rule6',
    label: 'Examples After Plurals',
    desc: 'Give specific examples after mentioning a plural noun.',
    active: false,
    promptGuideline: "Whenever a plural noun is mentioned, follow it immediately with specific examples."
  },
  {
    id: 'rule7',
    label: 'Be Specific',
    desc: 'Experts are specific. Say "8 severe symptoms" not just "symptoms".',
    active: false,
    promptGuideline: "Be extremely specific and precise with numbers and facts; for example, specify quantitative figures (like '8 features' instead of 'several features')."
  },
  {
    id: 'rule8',
    label: 'Cut the Fluff',
    desc: 'Delete contextless words like "Also", "According to", "should know".',
    active: false,
    promptGuideline: "Eliminate fluff and filler words; do not use contextless transitioning words like 'also', 'according to', or 'should know'."
  },
  {
    id: 'rule9',
    label: 'Consistent List Structure',
    desc: 'Use same part of speech at start of each list item.',
    active: false,
    promptGuideline: "Maintain a consistent grammatical structure in bulleted lists by starting each item with the same part of speech (e.g., all verbs or all nouns)."
  },
  {
    id: 'rule10',
    label: 'Multiple Measurement Units',
    desc: 'Include diverse measurement units (pounds - kg, oz - liters).',
    active: false,
    promptGuideline: "Include multiple measurement units side-by-side where applicable (e.g., converting pounds to kg, or ounces to liters)."
  },
  {
    id: 'rule11',
    label: 'No Analogies',
    desc: "Don't use analogies that compare one thing to another.",
    active: true,
    promptGuideline: "Do not use analogies or metaphorical comparisons between different subjects."
  },
  {
    id: 'rule12',
    label: 'No Extra Sentences',
    desc: 'Combine sentences when possible to reduce token usage.',
    active: false,
    promptGuideline: "Write concisely and combine sentences where possible to avoid extra, redundant sentences."
  },
  {
    id: 'rule13',
    label: 'No Back References',
    desc: 'Don\'t say "As stated before" or "As explained in section Y".',
    active: false,
    promptGuideline: "Avoid back-references; do not write phrases like 'as stated before' or 'as explained in the previous section'."
  },
  {
    id: 'rule14',
    label: 'Bold the Answer',
    desc: 'Bold the answer part, not the search term.',
    active: false,
    promptGuideline: "Bold only the specific answer text or key explanation, rather than the search terms themselves."
  },
  {
    id: 'rule15',
    label: 'Match Heading Structure',
    desc: 'Supporting text should match the heading structure (How to -> To do).',
    active: false,
    promptGuideline: "Ensure supporting text matches the style of the heading structure (e.g., if heading is 'How to Write', the text should describe action items 'To write...')."
  },
  {
    id: 'rule16',
    label: 'Understand Verb Context',
    desc: 'Use "increase" for metrics, "improve" for skills/health, "develop" for gradual growth.',
    active: false,
    promptGuideline: "Use precise verb contexts: use 'increase' for metrics, 'improve' for skills or health, and 'develop' for gradual growth."
  },
  {
    id: 'rule17',
    label: 'Use Numeric Values',
    desc: 'Say "5 main reasons" not "many reasons". Be specific with numbers.',
    active: false,
    promptGuideline: "Avoid vague quantities; use specific numeric values (e.g. '5 main reasons' instead of 'many reasons')."
  },
  {
    id: 'rule18',
    label: 'Be Certain',
    desc: 'State facts definitively. Use "Sun rises every day" not "Sun will rise tomorrow".',
    active: false,
    promptGuideline: "State facts with absolute certainty and definitiveness (e.g., 'the sun rises daily' instead of 'the sun will probably rise tomorrow')."
  },
  {
    id: 'rule19',
    label: 'Prioritize Context',
    desc: 'Match the interrogative term (where: place, when: time, how: method).',
    active: false,
    promptGuideline: "Prioritize answering context directly matching the interrogative term (answer 'where' with a place, 'when' with a time, 'how' with a method)."
  },
  {
    id: 'rule20',
    label: 'Yes/No First',
    desc: 'Boolean questions should start with Yes or No.',
    active: false,
    promptGuideline: "Directly start answers to boolean questions with a clear 'Yes' or 'No'."
  }
];

export interface WriterState {
  // Wizard Progress
  currentStep: number;
  appMode: 'wizard' | 'autopilot';
  activeView: 'writer' | 'dashboard';
  
  // Project Config
  projectId: string;
  mainKeyword: string;
  apiKeys: {
    openai: string;
    deepseek: string;
    gemini: string;
    serper: string;
  };
  
  // Step 1: Competitors
  competitors: Competitor[];
  
  // Step 2-3: Outline & Budgets
  outline: HeadingItem[];
  
  // Step 4: Content Scrape & Style
  competitorContent: string;
  styleAnalysis: StyleAnalysis;
  
  // Step 5: Entities
  competitorEntities: string[];
  aiEntities: string[];
  excludedEntities: string[];
  
  // Step 6: N-Grams
  competitorNGrams: string[];
  aiPickedNGrams: string[];
  aiGeneratedNGrams: string[];
  uniqueNGrams: string[];
  excludedNGrams: string[];
  
  // Step 7: NLP Keywords (LSI)
  nlpKeywords: string[];
  excludedNLPKeywords: string[];
  
  // Step 8: Skip-Grams
  skipGrams: string[];
  excludedSkipGrams: string[];
  
  // Step 9: Autocomplete grid
  alphabetics: AlphabeticSuggestion[];
  
  // Step 10-12: Prompt settings
  aiInstructions: {
    concise: boolean;
    natural: boolean;
    avoidAi: boolean;
  };
  customInstructions: string;
  seoRules: SeoRule[];
  totalWordTarget: number;
  
  // Step 13: Prompt Output
  masterPrompt: string;
  
  // Step 14: Editor
  editorContent: string;
  currentScore: number;
  
  // Saved Articles
  savedArticles: SavedArticle[];
  
  // Actions
  setActiveView: (view: 'writer' | 'dashboard') => void;
  setAppMode: (mode: 'wizard' | 'autopilot') => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setMainKeyword: (keyword: string) => void;
  setApiKeys: (keys: Partial<WriterState['apiKeys']>) => void;
  setTotalWordTarget: (words: number) => void;
  
  addCompetitor: (url: string) => void;
  removeCompetitor: (url: string) => void;
  setCompetitors: (competitors: Competitor[]) => void;
  
  setOutline: (outline: HeadingItem[]) => void;
  updateHeading: (id: string, updates: Partial<HeadingItem>) => void;
  batchSetWordCounts: (count: number) => void;
  
  setCompetitorContent: (content: string) => void;
  setStyleAnalysis: (analysis: Partial<StyleAnalysis>) => void;
  
  // Entities
  setCompetitorEntities: (entities: string[]) => void;
  setAiEntities: (entities: string[]) => void;
  toggleEntityExclusion: (entity: string) => void;
  
  // N-Grams
  setCompetitorNGrams: (nGrams: string[]) => void;
  setAiPickedNGrams: (nGrams: string[]) => void;
  setAiGeneratedNGrams: (nGrams: string[]) => void;
  setUniqueNGrams: (nGrams: string[]) => void;
  toggleNGramExclusion: (nGram: string) => void;
  
  // NLP Keywords
  setNlpKeywords: (keywords: string[]) => void;
  toggleNlpKeywordExclusion: (keyword: string) => void;
  
  // Skip-Grams
  setSkipGrams: (grams: string[]) => void;
  toggleSkipGramExclusion: (gram: string) => void;
  
  // Alphabetics
  setAlphabetics: (suggestions: AlphabeticSuggestion[]) => void;
  toggleAlphabeticChecked: (keyword: string) => void;
  
  // SEO Rules
  setSeoRules: (rules: SeoRule[]) => void;
  toggleSeoRule: (id: string) => void;
  selectAllSeoRules: (selectAll: boolean) => void;
  
  // Prompt Configuration
  setAiInstructions: (instructions: Partial<WriterState['aiInstructions']>) => void;
  setCustomInstructions: (instructions: string) => void;
  setMasterPrompt: (prompt: string) => void;
  
  // Editor
  setEditorContent: (content: string) => void;
  setCurrentScore: (score: number) => void;
  
  // Saved Articles
  saveCurrentArticle: () => void;
  loadArticle: (id: string) => void;
  deleteArticle: (id: string) => void;
  toggleArticleStatus: (id: string) => void;
  
  resetAll: () => void;
}

const initialStates = {
  appMode: 'wizard' as const,
  activeView: 'writer' as const,
  currentStep: 0,
  projectId: 'proj_' + Math.random().toString(36).substr(2, 9),
  mainKeyword: '',
  apiKeys: {
    openai: '',
    deepseek: '',
    gemini: '',
    serper: '',
  },
  competitors: [],
  outline: [],
  competitorContent: '',
  styleAnalysis: {
    tone: 'Neutral',
    sentenceStyle: 'Standard',
    vocabulary: 'Intermediate',
    structure: 'Structured',
  },
  competitorEntities: [],
  aiEntities: [],
  excludedEntities: [],
  competitorNGrams: [],
  aiPickedNGrams: [],
  aiGeneratedNGrams: [],
  uniqueNGrams: [],
  excludedNGrams: [],
  nlpKeywords: [],
  excludedNLPKeywords: [],
  skipGrams: [],
  excludedSkipGrams: [],
  alphabetics: [],
  aiInstructions: {
    concise: true,
    natural: true,
    avoidAi: true,
  },
  customInstructions: '',
  seoRules: defaultSeoRules,
  totalWordTarget: 2000,
  masterPrompt: '',
  editorContent: '',
  currentScore: 0,
  savedArticles: [],
};

export const useWriterStore = create<WriterState>()(
  persist(
    (set) => ({
      ...initialStates,

      setActiveView: (view) => set({ activeView: view }),
      setAppMode: (mode) => set({ appMode: mode }),
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 13) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
      
      setMainKeyword: (keyword) => set({ mainKeyword: keyword }),
      setApiKeys: (keys) => set((state) => ({ apiKeys: { ...state.apiKeys, ...keys } })),
      setTotalWordTarget: (words) => set({ totalWordTarget: words }),
      
      addCompetitor: (url) => set((state) => {
        if (state.competitors.some((c) => c.url === url)) return state;
        return { competitors: [...state.competitors, { url, isManual: true }] };
      }),
      removeCompetitor: (url) => set((state) => ({
        competitors: state.competitors.filter((c) => c.url !== url),
      })),
      setCompetitors: (competitors) => set({ competitors }),
      
      setOutline: (outline) => set({ outline }),
      updateHeading: (id, updates) => set((state) => ({
        outline: state.outline.map((item) => item.id === id ? { ...item, ...updates } : item),
      })),
      batchSetWordCounts: (count) => set((state) => ({
        outline: state.outline.map((item) => ({ ...item, wordCountTarget: count })),
      })),
      
      setCompetitorContent: (content) => set({ competitorContent: content }),
      setStyleAnalysis: (analysis) => set((state) => ({
        styleAnalysis: { ...state.styleAnalysis, ...analysis },
      })),
      
      setCompetitorEntities: (entities) => set({ competitorEntities: entities }),
      setAiEntities: (entities) => set({ aiEntities: entities }),
      toggleEntityExclusion: (entity) => set((state) => {
        const isExcluded = state.excludedEntities.includes(entity);
        return {
          excludedEntities: isExcluded
            ? state.excludedEntities.filter((e) => e !== entity)
            : [...state.excludedEntities, entity],
        };
      }),
      
      setCompetitorNGrams: (nGrams) => set({ competitorNGrams: nGrams }),
      setAiPickedNGrams: (nGrams) => set({ aiPickedNGrams: nGrams }),
      setAiGeneratedNGrams: (nGrams) => set({ aiGeneratedNGrams: nGrams }),
      setUniqueNGrams: (nGrams) => set({ uniqueNGrams: nGrams }),
      toggleNGramExclusion: (nGram) => set((state) => {
        const isExcluded = state.excludedNGrams.includes(nGram);
        return {
          excludedNGrams: isExcluded
            ? state.excludedNGrams.filter((n) => n !== nGram)
            : [...state.excludedNGrams, nGram],
        };
      }),
      
      setNlpKeywords: (keywords) => set({ nlpKeywords: keywords }),
      toggleNlpKeywordExclusion: (keyword) => set((state) => {
        const isExcluded = state.excludedNLPKeywords.includes(keyword);
        return {
          excludedNLPKeywords: isExcluded
            ? state.excludedNLPKeywords.filter((k) => k !== keyword)
            : [...state.excludedNLPKeywords, keyword],
        };
      }),
      
      setSkipGrams: (grams) => set({ skipGrams: grams }),
      toggleSkipGramExclusion: (gram) => set((state) => {
        const isExcluded = state.excludedSkipGrams.includes(gram);
        return {
          excludedSkipGrams: isExcluded
            ? state.excludedSkipGrams.filter((g) => g !== gram)
            : [...state.excludedSkipGrams, gram],
        };
      }),
      
      setAlphabetics: (suggestions) => set({ alphabetics: suggestions }),
      toggleAlphabeticChecked: (keyword) => set((state) => ({
        alphabetics: state.alphabetics.map((item) =>
          item.keyword === keyword ? { ...item, checked: !item.checked } : item
        ),
      })),
      
      setAiInstructions: (instructions) => set((state) => ({
        aiInstructions: { ...state.aiInstructions, ...instructions },
      })),
      setCustomInstructions: (instructions) => set({ customInstructions: instructions }),
      
      setSeoRules: (rules) => set({ seoRules: rules }),
      toggleSeoRule: (id) => set((state) => ({
        seoRules: state.seoRules.map((r) => r.id === id ? { ...r, active: !r.active } : r),
      })),
      selectAllSeoRules: (selectAll) => set((state) => ({
        seoRules: state.seoRules.map((r) => ({ ...r, active: selectAll })),
      })),
      
      setMasterPrompt: (prompt) => set({ masterPrompt: prompt }),
      
      setEditorContent: (content) => set({ editorContent: content }),
      setCurrentScore: (score) => set({ currentScore: score }),
      
      // Saved Articles Actions
      saveCurrentArticle: () => set((state) => {
        const content = state.editorContent;
        if (!content || content.trim().length < 20) return state;
        
        // Extract title from first H1 or H2
        const titleMatch = content.match(/<h[12][^>]*>(.*?)<\/h[12]>/i);
        const title = titleMatch
          ? titleMatch[1].replace(/<[^>]+>/g, '').trim()
          : state.mainKeyword || 'Untitled Article';
        
        // Calculate word count
        const textOnly = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const wordCount = textOnly.split(/\s+/).filter(Boolean).length;
        
        const now = new Date().toISOString();
        const existingIndex = state.savedArticles.findIndex(a => a.id === state.projectId);
        
        if (existingIndex >= 0) {
          // Update existing
          const updated = [...state.savedArticles];
          updated[existingIndex] = {
            ...updated[existingIndex],
            keyword: state.mainKeyword,
            title,
            content,
            outline: state.outline,
            score: state.currentScore,
            wordCount,
            updatedAt: now,
          };
          return { savedArticles: updated };
        } else {
          // Create new
          const newArticle: SavedArticle = {
            id: state.projectId,
            keyword: state.mainKeyword,
            title,
            content,
            outline: state.outline,
            score: state.currentScore,
            wordCount,
            status: 'in-progress',
            createdAt: now,
            updatedAt: now,
          };
          return { savedArticles: [newArticle, ...state.savedArticles] };
        }
      }),
      
      loadArticle: (id) => set((state) => {
        const article = state.savedArticles.find(a => a.id === id);
        if (!article) return state;
        return {
          projectId: article.id,
          mainKeyword: article.keyword,
          outline: article.outline,
          editorContent: article.content,
          currentScore: article.score,
          currentStep: 13,
          activeView: 'writer',
        };
      }),
      
      deleteArticle: (id) => set((state) => ({
        savedArticles: state.savedArticles.filter(a => a.id !== id),
      })),
      
      toggleArticleStatus: (id) => set((state) => ({
        savedArticles: state.savedArticles.map(a =>
          a.id === id
            ? { ...a, status: a.status === 'completed' ? 'in-progress' : 'completed', updatedAt: new Date().toISOString() }
            : a
        ),
      })),
      
      resetAll: () => set((state) => ({ ...initialStates, savedArticles: state.savedArticles, projectId: 'proj_' + Math.random().toString(36).substr(2, 9) })),
    }),
    {
      name: 'seo-writer-store',
      partialize: (state) => ({
        appMode: state.appMode,
        activeView: state.activeView,
        currentStep: state.currentStep,
        savedArticles: state.savedArticles,
        projectId: state.projectId,
        mainKeyword: state.mainKeyword,
        apiKeys: state.apiKeys,
        competitors: state.competitors,
        outline: state.outline,
        competitorContent: state.competitorContent,
        styleAnalysis: state.styleAnalysis,
        competitorEntities: state.competitorEntities,
        aiEntities: state.aiEntities,
        excludedEntities: state.excludedEntities,
        competitorNGrams: state.competitorNGrams,
        aiPickedNGrams: state.aiPickedNGrams,
        aiGeneratedNGrams: state.aiGeneratedNGrams,
        uniqueNGrams: state.uniqueNGrams,
        excludedNGrams: state.excludedNGrams,
        nlpKeywords: state.nlpKeywords,
        excludedNLPKeywords: state.excludedNLPKeywords,
        skipGrams: state.skipGrams,
        excludedSkipGrams: state.excludedSkipGrams,
        alphabetics: state.alphabetics,
        aiInstructions: state.aiInstructions,
        customInstructions: state.customInstructions,
        seoRules: state.seoRules,
        totalWordTarget: state.totalWordTarget,
        masterPrompt: state.masterPrompt,
        editorContent: state.editorContent,
        currentScore: state.currentScore,
      }),
    }
  )
);
