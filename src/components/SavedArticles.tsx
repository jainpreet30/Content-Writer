'use client';

import React, { useState, useMemo } from 'react';
import { useWriterStore, SavedArticle } from '@/store/useWriterStore';
import { 
  Search, 
  Trash2, 
  BookOpen, 
  Calendar, 
  FileText, 
  CheckCircle, 
  Clock, 
  Download, 
  Copy, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  FileDown,
  ExternalLink,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function SavedArticles() {
  const { 
    savedArticles, 
    loadArticle, 
    deleteArticle, 
    toggleArticleStatus,
    resetAll,
    setStep,
    setActiveView
  } = useWriterStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openDownloadId, setOpenDownloadId] = useState<string | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);
  const [wordLoadingId, setWordLoadingId] = useState<string | null>(null);

  // Stats computation
  const stats = useMemo(() => {
    if (!savedArticles.length) {
      return { total: 0, completed: 0, inProgress: 0, avgScore: 0 };
    }
    const completed = savedArticles.filter(a => a.status === 'completed').length;
    const inProgress = savedArticles.length - completed;
    const totalScore = savedArticles.reduce((sum, a) => sum + (a.score || 0), 0);
    return {
      total: savedArticles.length,
      completed,
      inProgress,
      avgScore: Math.round(totalScore / savedArticles.length)
    };
  }, [savedArticles]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return savedArticles.filter(article => {
      const matchesSearch = 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.keyword.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' || 
        article.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [savedArticles, searchQuery, statusFilter]);

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }) + ' ' + date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
    if (score >= 50) return 'text-amber-400 bg-amber-950/40 border-amber-500/30';
    return 'text-rose-400 bg-rose-950/40 border-rose-500/30';
  };

  const getScoreDot = (score: number) => {
    if (score >= 80) return 'bg-emerald-400';
    if (score >= 50) return 'bg-amber-400';
    return 'bg-rose-400';
  };

  // Copy to clipboard helper
  const handleCopy = async (article: SavedArticle) => {
    try {
      // Strip html tags for plain text copying
      const plainText = article.content.replace(/<[^>]+>/g, '\n').replace(/\n+/g, '\n\n').trim();
      await navigator.clipboard.writeText(plainText);
      setCopiedId(article.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  // Convert HTML to simple Markdown
  const htmlToMarkdown = (html: string) => {
    let md = html;
    // Replace headings
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
    md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
    // Replace list items
    md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    md = md.replace(/<ul[^>]*>/gi, '\n');
    md = md.replace(/<\/ul>/gi, '\n');
    md = md.replace(/<ol[^>]*>/gi, '\n');
    md = md.replace(/<\/ol>/gi, '\n');
    // Replace paragraphs & linebreaks
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/<br\s*\/?>/gi, '\n');
    // Strip other tags
    md = md.replace(/<[^>]+>/g, '');
    // Decode basic entities
    md = md.replace(/&nbsp;/g, ' ')
           .replace(/&lt;/g, '<')
           .replace(/&gt;/g, '>')
           .replace(/&amp;/g, '&')
           .replace(/&quot;/g, '"')
           .replace(/&#39;/g, "'");
    return md.trim();
  };

  // Download helper (HTML / Markdown)
  const handleDownload = (article: SavedArticle, format: 'html' | 'md') => {
    let content = article.content;
    let filename = `${article.keyword || 'article'}_${article.id.slice(-4)}`;
    let mimeType = 'text/html';

    if (format === 'md') {
      content = htmlToMarkdown(content);
      filename += '.md';
      mimeType = 'text/markdown';
    } else {
      filename += '.html';
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download as PDF
  const handleDownloadPdf = async (article: SavedArticle) => {
    setPdfLoadingId(article.id);
    setOpenDownloadId(null);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const articleTitle = article.keyword || article.title || 'Article';

      const printDiv = document.createElement('div');
      printDiv.style.cssText = [
        'position:fixed', 'left:-9999px', 'top:0',
        'width:794px',
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
        ${article.content}
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
      setPdfLoadingId(null);
    }
  };

  // Download as Word (.docx)
  const handleDownloadWord = async (article: SavedArticle) => {
    setWordLoadingId(article.id);
    setOpenDownloadId(null);
    try {
      const htmlDocx = await import('html-docx-js/dist/html-docx');
      const convert = htmlDocx.default?.asBlob ?? (htmlDocx as any).asBlob;

      const articleTitle = article.keyword || article.title || 'Article';

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
          ${article.content}
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
      setWordLoadingId(null);
    }
  };

  const handleCreateNew = () => {
    resetAll();
    setStep(0);
    setActiveView('writer');
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e233d] pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-violet-400" />
            <span>My Articles Library</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage, resume, and export your saved research and SEO optimized pieces.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition cursor-pointer self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>

      {/* Stats Cards */}
      {savedArticles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#12152a] border border-[#1f2444] rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs text-gray-400 font-semibold uppercase">Total Saved</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-white">{stats.total}</span>
              <span className="text-xs text-gray-500">pieces</span>
            </div>
          </div>
          
          <div className="bg-[#12152a] border border-[#1f2444] rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs text-gray-400 font-semibold uppercase">Avg SEO Score</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-emerald-400">{stats.avgScore}/100</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          <div className="bg-[#12152a] border border-[#1f2444] rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs text-gray-400 font-semibold uppercase">Completed</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-indigo-400">{stats.completed}</span>
              <span className="text-xs text-indigo-500">done</span>
            </div>
          </div>

          <div className="bg-[#12152a] border border-[#1f2444] rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs text-gray-400 font-semibold uppercase">In Progress</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-amber-400">{stats.inProgress}</span>
              <span className="text-xs text-amber-500">drafts</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#0f1121] border border-[#1e2343] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by keyword or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#171a36] border border-[#262c58] rounded-xl outline-none text-sm text-white placeholder-gray-500 focus:border-violet-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {(['all', 'in-progress', 'completed'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition shrink-0 uppercase tracking-wider ${
                statusFilter === filter
                  ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                  : 'bg-transparent border-[#232948] text-gray-400 hover:border-gray-700 hover:text-gray-300'
              }`}
            >
              {filter === 'all' ? 'All Pieces' : filter === 'in-progress' ? 'Drafts' : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Articles Grid/List */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredArticles.map(article => (
            <div 
              key={article.id}
              className="bg-[#111326] border border-[#202548] rounded-2xl p-5 hover:border-[#384180] hover:shadow-2xl hover:shadow-violet-950/10 transition-all flex flex-col justify-between gap-4 group"
            >
              {/* Title & Keyword */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-extrabold text-base text-gray-100 group-hover:text-white transition leading-snug">
                    {article.title || 'Untitled Article'}
                  </h3>
                  <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold shrink-0 flex items-center gap-1.5 ${getScoreColor(article.score)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getScoreDot(article.score)}`} />
                    <span>SEO {article.score}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <span className="px-2 py-0.5 rounded-md bg-violet-950/40 border border-violet-900/30 text-[10px] text-violet-300 font-semibold">
                    🔑 {article.keyword || 'No keyword'}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {article.wordCount} words
                  </span>
                  <span className="text-[10px] text-gray-500">•</span>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-600" />
                    {formatDate(article.updatedAt)}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between border-t border-[#1e233e] pt-4">
                <button
                  onClick={() => toggleArticleStatus(article.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    article.status === 'completed'
                      ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400 hover:bg-emerald-950/30'
                      : 'bg-amber-950/20 border-amber-900/50 text-amber-400 hover:bg-amber-950/30'
                  }`}
                  title="Click to toggle status"
                >
                  {article.status === 'completed' ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      <span>In Progress</span>
                    </>
                  )}
                </button>

                {/* Quick Actions Panel */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(article)}
                    className="p-2 rounded-lg bg-[#181a32] hover:bg-[#202347] border border-[#2b315d] text-gray-400 hover:text-white transition"
                    title="Copy Content to Clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setOpenDownloadId(openDownloadId === article.id ? null : article.id)}
                      className="p-2 rounded-lg bg-[#181a32] hover:bg-[#202347] border border-[#2b315d] text-gray-400 hover:text-white transition flex items-center gap-0.5"
                      title="Download Options"
                    >
                      {(pdfLoadingId === article.id || wordLoadingId === article.id)
                        ? <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                        : <Download className="w-3.5 h-3.5" />
                      }
                      <ChevronDown className={`w-2.5 h-2.5 transition-transform ${openDownloadId === article.id ? 'rotate-180' : ''}`} />
                    </button>

                    {openDownloadId === article.id && (
                      <>
                        {/* backdrop */}
                        <div className="fixed inset-0 z-40" onClick={() => setOpenDownloadId(null)} />
                        <div className="absolute right-0 bottom-full mb-1.5 z-50 w-44 bg-[#13162b] border border-[#2c325e] rounded-xl shadow-2xl overflow-hidden">
                          {/* PDF */}
                          <button
                            onClick={() => handleDownloadPdf(article)}
                            disabled={pdfLoadingId === article.id}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-950/30 transition disabled:opacity-50"
                          >
                            <FileDown className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                            <div className="text-left">
                              <div className="font-extrabold">PDF File</div>
                              <div className="text-[10px] text-gray-500 font-normal">Printable document</div>
                            </div>
                          </button>
                          <div className="h-px bg-[#1e233d]" />
                          {/* Word */}
                          <button
                            onClick={() => handleDownloadWord(article)}
                            disabled={wordLoadingId === article.id}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-blue-300 hover:bg-blue-950/30 transition disabled:opacity-50"
                          >
                            <FileText className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                            <div className="text-left">
                              <div className="font-extrabold">Word File</div>
                              <div className="text-[10px] text-gray-500 font-normal">Editable .docx</div>
                            </div>
                          </button>
                          <div className="h-px bg-[#1e233d]" />
                          {/* Markdown */}
                          <button
                            onClick={() => { handleDownload(article, 'md'); setOpenDownloadId(null); }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-pink-300 hover:bg-pink-950/20 transition"
                          >
                            <FileText className="w-3.5 h-3.5 shrink-0 text-pink-400" />
                            <div className="text-left">
                              <div className="font-extrabold">Markdown</div>
                              <div className="text-[10px] text-gray-500 font-normal">.md format</div>
                            </div>
                          </button>
                          <div className="h-px bg-[#1e233d]" />
                          {/* HTML */}
                          <button
                            onClick={() => { handleDownload(article, 'html'); setOpenDownloadId(null); }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-violet-300 hover:bg-violet-950/20 transition"
                          >
                            <FileDown className="w-3.5 h-3.5 shrink-0 text-violet-400" />
                            <div className="text-left">
                              <div className="font-extrabold">HTML File</div>
                              <div className="text-[10px] text-gray-500 font-normal">.html format</div>
                            </div>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
                        deleteArticle(article.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-transparent hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 text-rose-400/70 hover:text-rose-400 transition"
                    title="Delete Article"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => loadArticle(article.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white shadow-md shadow-violet-600/10 transition cursor-pointer ml-1"
                  >
                    <span>Resume</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#111326]/40 border border-[#1e233f]/50 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 flex items-center justify-center mb-2">
            <FileText className="w-8 h-8 text-violet-400" />
          </div>
          
          <h3 className="text-lg font-bold text-white">No Articles Found</h3>
          
          <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
            {savedArticles.length === 0 
              ? "You haven't generated or saved any articles yet. Complete an article draft or click New Article to get started." 
              : "No saved articles match your current search and filter settings."}
          </p>

          {savedArticles.length === 0 ? (
            <button
              onClick={handleCreateNew}
              className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-bold text-white transition shadow-lg shadow-violet-600/15 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Create First Draft</span>
            </button>
          ) : (
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
              className="mt-2 text-xs font-bold text-violet-400 hover:underline"
            >
              Reset filters & search
            </button>
          )}
        </div>
      )}
    </div>
  );
}
