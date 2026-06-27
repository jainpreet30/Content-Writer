'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWriterStore } from '@/store/useWriterStore';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  AlignLeft, 
  Heading1, 
  Heading2, 
  Heading3, 
  Link, 
  Undo, 
  Redo, 
  Sparkles, 
  Eye, 
  List, 
  ListOrdered,
  FileText,
  RotateCcw,
  BookOpen,
  Image as ImageIcon,
  Save,
  Download,
  FileDown
} from 'lucide-react';
import debounce from 'lodash/debounce';
import canvasConfetti from 'canvas-confetti';

export default function Step13Editor() {
  const {
    mainKeyword,
    outline,
    masterPrompt,
    apiKeys,
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
    editorContent,
    setEditorContent,
    currentScore,
    setCurrentScore,
    setStep,
    seoRules,
    totalWordTarget,
    competitorContent,
    saveCurrentArticle,
  } = useWriterStore();

  const [generating, setGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showOutlineModal, setShowOutlineModal] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingWord, setDownloadingWord] = useState(false);
  
  // Image search states
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageSearchQuery, setImageSearchQuery] = useState(mainKeyword || '');
  const [searchingImages, setSearchingImages] = useState(false);
  const [foundImages, setFoundImages] = useState<{ imageUrl: string; title: string; source: string }[]>([]);

  // Parse active SEO keywords
  const activeEntities = [...new Set([...competitorEntities, ...aiEntities])].filter(e => !excludedEntities.includes(e));
  const activeNGrams = [...new Set([...competitorNGrams, ...aiPickedNGrams, ...aiGeneratedNGrams, ...uniqueNGrams])].filter(n => !excludedNGrams.includes(n));
  const activeNLP = nlpKeywords.filter(k => !excludedNLPKeywords.includes(k));
  const activeSkip = skipGrams.filter(s => !excludedSkipGrams.includes(s));
  const allKeywords = [...new Set([mainKeyword, ...activeEntities, ...activeNGrams, ...activeNLP, ...activeSkip])].filter(Boolean);

  // Keyword counts & densities tracking
  const [keywordCounts, setKeywordCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({
    words: 0,
    headings: 0,
    paragraphs: 0,
    images: 0,
  });

  const getInitialContent = () => {
    if (outline && outline.length > 0) {
      return outline.map((h, i) => {
        const tag = h.type.toLowerCase();
        return `<${tag}>${h.text}</${tag}>\n<p>Exploring details about ${h.text} to establish a comprehensive overview of ${mainKeyword || 'the topic'}.</p>`;
      }).join('\n');
    }
    return `<h2>Overview of ${mainKeyword || 'SEO Content'}</h2>\n<p>Start writing your highly optimized content for the target keyword "${mainKeyword || 'SEO'}" here...</p>`;
  };

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: editorContent || getInitialContent(),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setEditorContent(html);
      debouncedScoring(html);
    },
  });

  // Dynamic SEO scorer
  const calculateScore = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const text = doc.body.textContent || '';
    
    // 1. Calculate structural metrics
    const words = text.split(/\s+/).filter(Boolean).length;
    const headings = doc.querySelectorAll('h1, h2, h3, h4').length;
    const paragraphs = doc.querySelectorAll('p').length;
    const images = doc.querySelectorAll('img').length;
    
    setStats({ words, headings, paragraphs, images });

    // 2. Keyword density checks
    const counts: Record<string, number> = {};
    allKeywords.forEach(kw => {
      // Escape regex chars
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      const match = text.match(regex);
      counts[kw] = match ? match.length : 0;
    });
    setKeywordCounts(counts);

    // 3. SEO Formula weighting
    // Word Count score (30%)
    const targetWords = outline.reduce((sum, h) => sum + (h.wordCountTarget || 200), 0) || 1500;
    const wordScore = Math.min((words / targetWords) * 30, 30);

    // Headings score (20%)
    const targetHeadings = outline.length || 8;
    const headingScore = Math.min((headings / targetHeadings) * 20, 20);

    // Media score (10%)
    const mediaScore = images > 0 ? 10 : 0;

    // Keyword density score (40%)
    let matchedKeywords = 0;
    allKeywords.forEach(kw => {
      const freq = counts[kw] || 0;
      if (freq > 0) {
        const density = (freq / words) * 100;
        // Optimal density is 0.2% to 3.0%
        if (density >= 0.2 && density <= 3.0) {
          matchedKeywords += 1;
        } else if (density > 3.0) {
          matchedKeywords += 0.5; // stuffed keyword penalty
        } else if (density > 0) {
          matchedKeywords += 0.3; // partially optimized
        }
      }
    });
    const keywordScore = allKeywords.length > 0 
      ? Math.min((matchedKeywords / allKeywords.length) * 40, 40)
      : 20; // default baseline

    const total = Math.round(wordScore + headingScore + mediaScore + keywordScore);
    setCurrentScore(total);

    if (total >= 100) {
      canvasConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const debouncedScoring = useRef(
    debounce((html: string) => {
      calculateScore(html);
    }, 1000)
  ).current;

  // Run initial scoring once TipTap mounts
  useEffect(() => {
    if (editor) {
      calculateScore(editor.getHTML());
    }
  }, [editor]);

  // Recommendations calculation
  const recommendations = React.useMemo(() => {
    const list: { type: 'error' | 'warning' | 'success'; text: string; id: string }[] = [];
    const targetWords = totalWordTarget || 2000;
    const words = stats.words;

    // 1. Word count recommendation
    if (words < targetWords * 0.9) {
      list.push({
        id: 'rec-word-count',
        type: 'error',
        text: `Word count too low (${words}/${targetWords} words). Add approximately ${targetWords - words} words to meet target.`
      });
    } else if (words > targetWords * 1.25) {
      list.push({
        id: 'rec-word-count',
        type: 'warning',
        text: `Word count too high (${words}/${targetWords} words). Trim approximately ${words - targetWords} words to stay focused.`
      });
    } else {
      list.push({
        id: 'rec-word-count',
        type: 'success',
        text: `Word count is optimal (${words} words).`
      });
    }

    // 2. Headings recommendation
    const targetHeadings = outline.length || 8;
    const headings = stats.headings;
    if (headings < targetHeadings) {
      list.push({
        id: 'rec-headings',
        type: 'error',
        text: `Missing subheadings (${headings}/${targetHeadings}). Add at least ${targetHeadings - headings} headings to align with outline.`
      });
    } else {
      list.push({
        id: 'rec-headings',
        type: 'success',
        text: `Headings structure matches your outline.`
      });
    }

    // 3. Media recommendation
    if (stats.images === 0) {
      list.push({
        id: 'rec-images',
        type: 'warning',
        text: 'No images detected. Add at least 1 image to break up text and improve visual SEO.'
      });
    }

    // 4. Keyword recommendations
    let addedCount = 0;
    let trimmedCount = 0;
    allKeywords.forEach(kw => {
      const count = keywordCounts[kw] || 0;
      const minMentions = Math.max(1, Math.ceil(targetWords * 0.002));
      const maxMentions = Math.max(2, Math.floor(targetWords * 0.03));

      if (count < minMentions) {
        addedCount++;
        if (addedCount <= 8) {
          list.push({
            id: `rec-add-${kw}`,
            type: 'error',
            text: `Under-optimized: Add "${kw}" (currently ${count} mentions, need at least ${minMentions}).`
          });
        }
      } else if (count > maxMentions) {
        trimmedCount++;
        if (trimmedCount <= 8) {
          list.push({
            id: `rec-trim-${kw}`,
            type: 'warning',
            text: `Stuffing detected: Reduce "${kw}" (currently ${count} mentions, limit is ${maxMentions}).`
          });
        }
      }
    });

    return list;
  }, [stats, keywordCounts, allKeywords, totalWordTarget, outline]);

  const handleOptimizeContent = async () => {
    if (!editor) return;
    setOptimizing(true);
    
    let activeProvider = 'offline';
    if (apiKeys?.openai) activeProvider = 'openai';
    else if (apiKeys?.gemini) activeProvider = 'gemini';
    else if (apiKeys?.deepseek) activeProvider = 'deepseek';

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'optimize',
          existingContent: editor.getHTML(),
          recommendations: recommendations.filter(r => r.type !== 'success').map(r => r.text),
          targetWords: totalWordTarget || 2000,
          outline,
          keyword: mainKeyword,
          entities: activeEntities,
          ngrams: activeNGrams,
          apiKeys,
          provider: activeProvider,
          competitorContent
        })
      });
      const data = await res.json();
      if (data.content) {
        editor.commands.setContent(data.content);
        setEditorContent(data.content);
        calculateScore(data.content);
        saveCurrentArticle();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOptimizing(false);
    }
  };

  const handleSearchImages = async () => {
    if (!imageSearchQuery.trim()) return;
    setSearchingImages(true);
    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: imageSearchQuery,
          apiKeys
        })
      });
      const data = await res.json();
      if (data.images) {
        setFoundImages(data.images);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearchingImages(false);
    }
  };

  const handleInsertImage = (url: string, alt: string) => {
    if (editor && url) {
      editor.chain().focus().setImage({ src: url, alt }).run();
      setShowImageModal(false);
      calculateScore(editor.getHTML());
    }
  };

  // ── Download as PDF ──────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    if (!editor) return;
    setDownloadingPdf(true);
    setShowDownloadMenu(false);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      // Build a clean printable HTML page
      const articleTitle = mainKeyword || 'Article';
      const htmlContent = editor.getHTML();

      const printDiv = document.createElement('div');
      printDiv.style.cssText = [
        'position:fixed', 'left:-9999px', 'top:0',
        'width:794px',   // A4 width in px at 96dpi
        'padding:48px 56px',
        'background:#ffffff',
        'color:#111111',
        'font-family:Georgia,serif',
        'font-size:14px',
        'line-height:1.8',
      ].join(';');
      printDiv.innerHTML = `
        <h1 style="font-size:22px;font-weight:700;margin-bottom:24px;color:#1a1a2e;border-bottom:2px solid #7c3aed;padding-bottom:12px">${articleTitle}</h1>
        <style>
          h2{font-size:18px;font-weight:700;margin:28px 0 10px;color:#2d1b69}
          h3{font-size:15px;font-weight:700;margin:20px 0 8px;color:#3730a3}
          h4{font-size:13px;font-weight:700;margin:16px 0 6px;color:#4338ca}
          p{margin:0 0 12px}
          ul,ol{margin:0 0 12px;padding-left:22px}
          li{margin-bottom:4px}
          strong{font-weight:700}
          em{font-style:italic}
          img{max-width:100%;height:auto;margin:16px 0;border-radius:6px}
          table{width:100%;border-collapse:collapse;margin:16px 0}
          th,td{border:1px solid #cbd5e1;padding:8px 10px;text-align:left;font-size:13px}
          th{background:#f1f5f9;font-weight:700}
        </style>
        ${htmlContent}
      `;
      document.body.appendChild(printDiv);

      const canvas = await html2canvas(printDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
      });
      document.body.removeChild(printDiv);

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let y = 0;
      while (y < imgHeight) {
        if (y > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, -y, imgWidth, imgHeight);
        y += pageHeight;
      }

      const safeTitle = articleTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`${safeTitle}.pdf`);
    } catch (e) {
      console.error('PDF export failed:', e);
      alert('PDF export failed. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // ── Download as Word (.docx) ─────────────────────────────────────
  const handleDownloadWord = async () => {
    if (!editor) return;
    setDownloadingWord(true);
    setShowDownloadMenu(false);
    try {
      const htmlDocx = await import('html-docx-js/dist/html-docx');
      const convert = htmlDocx.default?.asBlob ?? (htmlDocx as any).asBlob;

      const articleTitle = mainKeyword || 'Article';
      const htmlContent = editor.getHTML();

      // Wrap in a full HTML document that Word understands
      const fullHtml = `
        <!DOCTYPE html>
        <html xmlns:o="urn:schemas-microsoft-com:office:office"
              xmlns:w="urn:schemas-microsoft-com:office:word"
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8" />
          <title>${articleTitle}</title>
          <style>
            body  { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #111; margin: 1in; line-height: 1.6; }
            h1    { font-size: 20pt; color: #1a1a2e; border-bottom: 2pt solid #7c3aed; padding-bottom: 6pt; margin-bottom: 12pt; }
            h2    { font-size: 16pt; color: #2d1b69; margin-top: 20pt; margin-bottom: 8pt; }
            h3    { font-size: 13pt; color: #3730a3; margin-top: 14pt; margin-bottom: 6pt; }
            h4    { font-size: 11pt; color: #4338ca; margin-top: 10pt; margin-bottom: 4pt; }
            p     { margin: 0 0 8pt; }
            ul, ol{ margin: 0 0 8pt; padding-left: 18pt; }
            li    { margin-bottom: 3pt; }
            strong{ font-weight: bold; }
            em    { font-style: italic; }
            table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
            th, td{ border: 1pt solid #94a3b8; padding: 6pt 8pt; font-size: 10pt; }
            th    { background: #f1f5f9; font-weight: bold; }
            img   { max-width: 100%; }
          </style>
        </head>
        <body>
          <h1>${articleTitle}</h1>
          ${htmlContent}
        </body>
        </html>
      `;

      const blob = convert(fullHtml, { orientation: 'portrait', margins: { top: 720, bottom: 720, left: 900, right: 900 } });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeTitle = articleTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `${safeTitle}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Word export failed:', e);
      alert('Word export failed. Please try again.');
    } finally {
      setDownloadingWord(false);
    }
  };

  const handleGenerateWithAI = async () => {
    setGenerating(true);
    
    let activeProvider = 'offline';
    if (apiKeys?.openai) activeProvider = 'openai';
    else if (apiKeys?.gemini) activeProvider = 'gemini';
    else if (apiKeys?.deepseek) activeProvider = 'deepseek';

    if (activeProvider === 'openai') {
      setGenerationStatus('Drafting via OpenAI...');
    } else if (activeProvider === 'gemini') {
      setGenerationStatus('Drafting via Gemini...');
    } else if (activeProvider === 'deepseek') {
      setGenerationStatus('Drafting via DeepSeek...');
    } else {
      setGenerationStatus('Drafting 1500+ words offline fallback...');
    }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: masterPrompt,
          apiKeys,
          outline,
          keyword: mainKeyword,
          entities: activeEntities,
          ngrams: activeNGrams,
          provider: activeProvider,
          competitorContent,
          targetWords: totalWordTarget || 2000,
        }),
      });
      const data = await res.json();
      if (data.content && editor) {
        editor.commands.setContent(data.content);
        setEditorContent(data.content);
        calculateScore(data.content);
        saveCurrentArticle();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
      setGenerationStatus('');
    }
  };

  if (!editor) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
      {/* Left Column: Rich Text Canvas (70%) */}
      <div className="flex-1 flex flex-col bg-[#141829] border border-[#232948] rounded-2xl overflow-hidden shadow-xl">
        {/* Editor Toolbar */}
        <div className="border-b border-[#232948] bg-[#1a1e35] p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded-lg transition hover:bg-[#282d4d] ${editor.isActive('bold') ? 'text-violet-400 bg-[#282d4d]' : 'text-gray-400'}`}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded-lg transition hover:bg-[#282d4d] ${editor.isActive('italic') ? 'text-violet-400 bg-[#282d4d]' : 'text-gray-400'}`}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded-lg transition hover:bg-[#282d4d] ${editor.isActive('strike') ? 'text-violet-400 bg-[#282d4d]' : 'text-gray-400'}`}
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-[#2a3052] mx-1" />
            
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded-lg transition hover:bg-[#282d4d] ${editor.isActive('heading', { level: 2 }) ? 'text-violet-400 bg-[#282d4d]' : 'text-gray-400'}`}
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded-lg transition hover:bg-[#282d4d] ${editor.isActive('heading', { level: 3 }) ? 'text-violet-400 bg-[#282d4d]' : 'text-gray-400'}`}
            >
              <Heading3 className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-[#2a3052] mx-1" />

            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded-lg transition hover:bg-[#282d4d] ${editor.isActive('bulletList') ? 'text-violet-400 bg-[#282d4d]' : 'text-gray-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded-lg transition hover:bg-[#282d4d] ${editor.isActive('orderedList') ? 'text-violet-400 bg-[#282d4d]' : 'text-gray-400'}`}
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-[#2a3052] mx-1" />

            <button
              onClick={() => {
                setShowImageModal(true);
                handleSearchImages();
              }}
              className="p-2 rounded-lg transition hover:bg-[#282d4d] text-gray-400"
              title="Search & Insert SEO Images"
            >
              <ImageIcon className="w-4 h-4 text-violet-400" />
            </button>
            <div className="w-px h-5 bg-[#2a3052] mx-1" />

            <button
              onClick={() => editor.chain().focus().undo().run()}
              className="p-2 rounded-lg transition hover:bg-[#282d4d] text-gray-400"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              className="p-2 rounded-lg transition hover:bg-[#282d4d] text-gray-400"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                saveCurrentArticle();
                alert('Draft saved successfully to My Articles!');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/30 border border-emerald-900/50 text-xs font-bold text-emerald-400 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            {/* ── Download Dropdown ── */}
            <div className="relative">
              <button
                onClick={() => setShowDownloadMenu(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/40 hover:bg-sky-900/40 border border-sky-800/50 text-xs font-bold text-sky-300 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
                <svg className={`w-3 h-3 transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {showDownloadMenu && (
                <>
                  {/* Backdrop to close */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowDownloadMenu(false)} />
                  <div className="absolute right-0 top-full mt-1.5 z-50 w-44 bg-[#131627] border border-[#2e345e] rounded-xl shadow-2xl overflow-hidden">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={downloadingPdf}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-rose-300 hover:bg-rose-950/30 transition disabled:opacity-50"
                    >
                      <FileDown className="w-4 h-4 shrink-0" />
                      <div className="text-left">
                        <div className="font-extrabold">PDF File</div>
                        <div className="text-[10px] text-gray-500 font-normal">Printable PDF document</div>
                      </div>
                      {downloadingPdf && <div className="ml-auto h-3 w-3 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />}
                    </button>
                    <div className="h-px bg-[#232948]" />
                    <button
                      onClick={handleDownloadWord}
                      disabled={downloadingWord}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-blue-300 hover:bg-blue-950/30 transition disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      <div className="text-left">
                        <div className="font-extrabold">Word File</div>
                        <div className="text-[10px] text-gray-500 font-normal">Editable .docx document</div>
                      </div>
                      {downloadingWord && <div className="ml-auto h-3 w-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowPromptModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b1f3c] hover:bg-[#252c58] text-xs font-bold text-gray-300 transition"
            >
              <Eye className="w-3.5 h-3.5 text-violet-400" />
              <span>View Prompt</span>
            </button>

            <button
              onClick={() => setShowOutlineModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b1f3c] hover:bg-[#252c58] text-xs font-bold text-gray-300 transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-pink-400" />
              <span>Writer Outline</span>
            </button>

            <button
              onClick={handleGenerateWithAI}
              disabled={generating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-xs font-extrabold text-white rounded-lg transition shadow-lg shadow-violet-600/10 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{generating ? (generationStatus || 'Drafting...') : 'Generate with AI'}</span>
            </button>
          </div>
        </div>

        {/* Text Area Canvas */}
        <div className="w-full p-6 min-h-[300px]">
          <EditorContent editor={editor} className="outline-none" />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#232948] bg-[#1a1e35] px-6 py-3 flex items-center justify-between text-xs text-gray-400 font-bold">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Connected & Editing</span>
          </span>
          <button 
            onClick={() => setStep(0)} 
            className="text-violet-400 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restart Process Wizard</span>
          </button>
        </div>
      </div>

      {/* Right Column: SEO Optimization Sidebar (30%) */}
      <div className="w-full lg:w-[350px] space-y-6 shrink-0 flex flex-col justify-start">
        {/* Score Card */}
        <div className="bg-[#141829] border border-[#232948] rounded-2xl p-6 shadow-xl text-center space-y-4">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest block">Content Score</span>
          
          <div className="relative inline-flex items-center justify-center">
            {/* Circular Progress SVG */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="54"
                className="stroke-[#1d223c]"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="54"
                className="stroke-violet-500"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 54}
                strokeDashoffset={2 * Math.PI * 54 * (1 - currentScore / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-black text-white">{currentScore}</span>
              <span className="text-xs text-gray-500 block">/ 100</span>
            </div>
          </div>
          
          <div className="flex justify-center items-center gap-4 text-xs font-bold text-gray-400">
            <span>Avg: 70</span>
            <span>•</span>
            <span className="text-emerald-400">Top: 79</span>
          </div>
        </div>

        {/* Content Structure */}
        <div className="bg-[#141829] border border-[#232948] rounded-2xl p-5 shadow-xl space-y-4">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest block border-b border-[#232948] pb-2">
            Content Structure
          </span>

          <div className="grid grid-cols-2 gap-3.5 text-center">
            <div className="bg-[#1a1e35] p-3 rounded-xl border border-[#232a52]">
              <span className="text-lg font-black text-white block">{stats.words}</span>
              <span className="text-[10px] text-gray-400 font-bold block mt-0.5">WORDS</span>
            </div>

            <div className="bg-[#1a1e35] p-3 rounded-xl border border-[#232a52]">
              <span className="text-lg font-black text-white block">{stats.headings}</span>
              <span className="text-[10px] text-gray-400 font-bold block mt-0.5">HEADINGS</span>
            </div>

            <div className="bg-[#1a1e35] p-3 rounded-xl border border-[#232a52]">
              <span className="text-lg font-black text-white block">{stats.paragraphs}</span>
              <span className="text-[10px] text-gray-400 font-bold block mt-0.5">PARAGRAPHS</span>
            </div>

            <div className="bg-[#1a1e35] p-3 rounded-xl border border-[#232a52]">
              <span className="text-lg font-black text-white block">{stats.images}</span>
              <span className="text-[10px] text-gray-400 font-bold block mt-0.5">IMAGES</span>
            </div>
          </div>
        </div>

        {/* AI SEO Advisor Panel */}
        <div className="bg-[#141829] border border-[#232948] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#232948] pb-2">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest block">
              AI SEO Advisor
            </span>
            <span className="px-2 py-0.5 text-[10px] font-black rounded bg-violet-950 text-violet-300 border border-violet-855/40">
              {recommendations.filter(r => r.type !== 'success').length} actions
            </span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {recommendations.map((rec) => {
              let dotColor = 'bg-emerald-500';
              let bgColor = 'bg-emerald-950/10 border-emerald-900/30 text-emerald-300';
              if (rec.type === 'error') {
                dotColor = 'bg-rose-500';
                bgColor = 'bg-rose-950/10 border-rose-900/30 text-rose-300';
              } else if (rec.type === 'warning') {
                dotColor = 'bg-amber-500';
                bgColor = 'bg-amber-950/10 border-amber-900/30 text-amber-300';
              }

              return (
                <div key={rec.id} className={`p-2.5 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2.5 ${bgColor}`}>
                  <span className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${dotColor}`} />
                  <span className="flex-1">{rec.text}</span>
                </div>
              );
            })}

            {recommendations.filter(r => r.type !== 'success').length === 0 && (
              <p className="text-[11px] text-gray-500 italic py-2 text-center">Your draft is fully optimized! Great job.</p>
            )}
          </div>

          <button
            onClick={handleOptimizeContent}
            disabled={optimizing || recommendations.filter(r => r.type !== 'success').length === 0}
            className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-xs font-extrabold text-white rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-violet-600/10 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{optimizing ? 'AI Rewriting Draft...' : 'Optimize & Rewrite Content'}</span>
          </button>
        </div>

        {/* Live Keywords pills */}
        <div className="bg-[#141829] border border-[#232948] rounded-2xl p-5 shadow-xl space-y-3 flex-1 overflow-hidden flex flex-col">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest block border-b border-[#232948] pb-2">
            Target Keywords Density
          </span>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {allKeywords.map((kw) => {
              const count = keywordCounts[kw] || 0;
              // Target is roughly 1-2 times per keyword
              const density = stats.words > 0 ? (count / stats.words) * 100 : 0;
              
              let styleClass = 'bg-[#181b31] text-gray-400 border-[#23294c]';
              if (count > 0) {
                if (density >= 0.5 && density <= 2.5) {
                  styleClass = 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40';
                } else if (density > 2.5) {
                  styleClass = 'bg-amber-950/30 text-amber-400 border-amber-900/40'; // stuffed
                } else {
                  styleClass = 'bg-blue-950/20 text-blue-300 border-blue-900/30';
                }
              }

              return (
                <div key={kw} className={`px-3 py-2 rounded-xl border flex items-center justify-between gap-3 text-xs transition ${styleClass}`}>
                  <span className="font-semibold truncate">{kw}</span>
                  <span className="font-black text-[11px] shrink-0">
                    {count} ({density.toFixed(1)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Koray Guidelines Checklist */}
        {seoRules && seoRules.filter(r => r.active).length > 0 && (
          <div className="bg-[#141829] border border-[#232948] rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest block border-b border-[#232948] pb-2">
              Koray Guidelines Compliance
            </span>
            <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
              {seoRules.filter(r => r.active).map((rule) => (
                <div key={rule.id} className="flex gap-2.5 items-start text-xs text-gray-350">
                  <div className="mt-0.5 w-3.5 h-3.5 rounded bg-violet-650/40 border border-violet-500/50 flex items-center justify-center text-[9px] text-violet-400 font-black shrink-0">
                    ✓
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold block text-gray-200">{rule.label}</span>
                    <span className="text-[10px] text-gray-500 block leading-relaxed">{rule.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* View Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#131627] border border-[#2e345e] rounded-2xl p-6 shadow-2xl flex flex-col max-h-[80vh]">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-400" />
              <span>Compiled SEO Content Prompt</span>
            </h3>
            
            <div className="flex-1 bg-[#0b0c16] border border-[#21274c] rounded-xl p-4 overflow-y-auto mb-4">
              <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                {masterPrompt || 'No prompt compiled. Go back and check the Master Prompt compile step.'}
              </pre>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={() => setShowPromptModal(false)}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-bold text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Writer Outline Modal */}
      {showOutlineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#131627] border border-[#2e345e] rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-pink-400" />
              <span>Target Heading Outline & Budgets</span>
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {outline.map((heading) => (
                <div key={heading.id} className="bg-[#1b1f3c] border border-[#2c335f] p-3 rounded-xl flex items-center justify-between text-sm">
                  <span className={`px-2 py-0.5 text-[9px] font-black rounded border shrink-0 ${
                    heading.type === 'H2'
                      ? 'bg-violet-950/40 text-violet-300 border-violet-850/50'
                      : heading.type === 'H3'
                      ? 'bg-pink-950/40 text-pink-300 border-pink-850/50'
                      : 'bg-emerald-950/40 text-emerald-300 border-emerald-850/50'
                  }`}>
                    {heading.type}
                  </span>
                  <span className="flex-1 text-gray-250 truncate px-3">{heading.text}</span>
                  <span className="text-xs text-gray-400 font-bold shrink-0">{heading.wordCountTarget || 200} words</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button 
                onClick={() => setShowOutlineModal(false)}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-bold text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Search Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-[#131627] border border-[#2e345e] rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-violet-400" />
              <span>Search and Insert Royalty-Free Images</span>
            </h3>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={imageSearchQuery}
                onChange={(e) => setImageSearchQuery(e.target.value)}
                placeholder="Search images (e.g. business charts, workspace)..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearchImages()}
                className="flex-1 px-4 py-2.5 bg-[#191d35] border border-[#2a315c] rounded-xl outline-none text-sm text-white placeholder-gray-500 focus:border-violet-500 transition"
              />
              <button
                onClick={handleSearchImages}
                disabled={searchingImages}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 font-bold text-sm text-white rounded-xl flex items-center gap-1.5 transition"
              >
                <span>{searchingImages ? 'Searching...' : 'Search'}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px] mb-4">
              {searchingImages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : foundImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {foundImages.map((img, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleInsertImage(img.imageUrl, img.title)}
                      className="group relative aspect-video bg-[#1a1e35] rounded-xl overflow-hidden cursor-pointer border border-[#232a52] hover:border-violet-500 transition"
                    >
                      <img 
                        src={img.imageUrl} 
                        alt={img.title} 
                        className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          // Fallback to placeholder if url fails to load
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-3 text-center">
                        <span className="text-[10px] text-white font-bold leading-normal">{img.title}</span>
                      </div>
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[8px] bg-black/60 rounded text-gray-400 font-black">
                        {img.source}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center h-full text-center p-6 bg-[#181b31]/40 border border-dashed border-[#23294c] rounded-xl">
                  <p className="text-sm text-gray-400 italic">No search images loaded yet. Type a term and click search!</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-[#232948] pt-4">
              <button 
                onClick={() => setShowImageModal(false)}
                className="px-5 py-2 rounded-xl bg-[#1b1f3c] hover:bg-[#252c58] text-sm font-bold text-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
