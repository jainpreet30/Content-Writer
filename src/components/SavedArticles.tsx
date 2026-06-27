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
  Sparkles
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

  // Download helper
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

                  <div className="relative group/download">
                    <button
                      className="p-2 rounded-lg bg-[#181a32] hover:bg-[#202347] border border-[#2b315d] text-gray-400 hover:text-white transition"
                      title="Download Options"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {/* Hover dropdown for formats */}
                    <div className="absolute right-0 bottom-full mb-1 bg-[#15182d] border border-[#2c325e] rounded-lg shadow-xl py-1 hidden group-hover/download:block min-w-[100px] z-10">
                      <button
                        onClick={() => handleDownload(article, 'md')}
                        className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#222749] hover:text-white flex items-center gap-1.5"
                      >
                        <FileText className="w-3 h-3 text-pink-400" />
                        <span>Markdown</span>
                      </button>
                      <button
                        onClick={() => handleDownload(article, 'html')}
                        className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#222749] hover:text-white flex items-center gap-1.5"
                      >
                        <FileDown className="w-3 h-3 text-violet-400" />
                        <span>HTML File</span>
                      </button>
                    </div>
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
