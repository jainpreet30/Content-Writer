'use client';

import React, { useState, useEffect } from 'react';
import { useWriterStore, HeadingItem } from '@/store/useWriterStore';
import { 
  Menu, 
  Trash2, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  ChevronRight, 
  ChevronDown, 
  Layers,
  Sparkles,
  Link2
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export default function Step1Outline() {
  const {
    competitors,
    outline,
    setOutline,
    updateHeading,
  } = useWriterStore();

  const [mounted, setMounted] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [customHeadingText, setCustomHeadingText] = useState('');
  const [customHeadingType, setCustomHeadingType] = useState<'H2' | 'H3' | 'H4'>('H2');

  useEffect(() => {
    setMounted(true);
    if (competitors.length > 0 && !selectedUrl) {
      setSelectedUrl(competitors[0].url);
    }
  }, [competitors, selectedUrl]);

  const handleScrapeOutline = async (overwrite: boolean) => {
    if (!selectedUrl) return;
    setLoading(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: selectedUrl }),
      });
      const data = await res.json();
      if (data.headings && data.headings.length > 0) {
        // Map scraped headings to store HeadingItem structure
        const mappedHeadings: HeadingItem[] = data.headings.map((h: any) => ({
          id: h.id || `h_${Math.random().toString(36).substr(2, 5)}`,
          type: h.type,
          text: h.text,
          wordCountTarget: 200, // default target
        }));
        
        if (overwrite) {
          setOutline(mappedHeadings);
        } else {
          // Merge and append: filter out new headings that have the exact text of existing ones
          const existingTexts = new Set(outline.map((o) => o.text.toLowerCase().trim()));
          const filteredNewHeadings = mappedHeadings.filter(
            (h) => !existingTexts.has(h.text.toLowerCase().trim())
          );
          setOutline([...outline, ...filteredNewHeadings]);
        }
      } else {
        if (overwrite) handleUseDefaultOutline();
      }
    } catch (e) {
      console.error(e);
      if (overwrite) handleUseDefaultOutline();
    } finally {
      setLoading(false);
    }
  };

  const handleUseDefaultOutline = () => {
    const defaultHeadings: HeadingItem[] = [
      { id: 'h1', type: 'H2', text: 'Featured SEO Tools 2026', wordCountTarget: 200 },
      { id: 'h2', type: 'H2', text: 'Our Top Picks', wordCountTarget: 200 },
      { id: 'h3', type: 'H3', text: 'Ubersuggest', wordCountTarget: 200 },
      { id: 'h4', type: 'H3', text: 'MOZ', wordCountTarget: 200 },
      { id: 'h5', type: 'H2', text: 'What Is SEO?', wordCountTarget: 200 },
      { id: 'h6', type: 'H3', text: 'Technical SEO:', wordCountTarget: 200 },
      { id: 'h7', type: 'H3', text: 'On-page SEO:', wordCountTarget: 200 },
      { id: 'h8', type: 'H3', text: 'Off-page SEO:', wordCountTarget: 200 },
      { id: 'h9', type: 'H2', text: 'What Are SEO Tools?', wordCountTarget: 200 },
      { id: 'h10', type: 'H3', text: 'Purpose:', wordCountTarget: 200 },
      { id: 'h11', type: 'H3', text: 'Technical Analysis:', wordCountTarget: 200 },
      { id: 'h12', type: 'H3', text: 'Backlink Analysis:', wordCountTarget: 200 }
    ];
    setOutline(defaultHeadings);
  };

  const handleAddCustomHeading = () => {
    if (!customHeadingText.trim()) return;
    const newHeading: HeadingItem = {
      id: `custom_${Math.random().toString(36).substr(2, 5)}`,
      type: customHeadingType,
      text: customHeadingText.trim(),
      wordCountTarget: 200,
    };
    setOutline([...outline, newHeading]);
    setCustomHeadingText('');
  };

  const handleDeleteHeading = (id: string) => {
    setOutline(outline.filter((h) => h.id !== id));
  };

  const handleShiftType = (id: string, currentType: 'H2' | 'H3' | 'H4') => {
    const types: ('H2' | 'H3' | 'H4')[] = ['H2', 'H3', 'H4'];
    const nextIndex = (types.indexOf(currentType) + 1) % 3;
    updateHeading(id, { type: types[nextIndex] });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOutline = [...outline];
    const temp = newOutline[index];
    newOutline[index] = newOutline[index - 1];
    newOutline[index - 1] = temp;
    setOutline(newOutline);
  };

  const handleMoveDown = (index: number) => {
    if (index === outline.length - 1) return;
    const newOutline = [...outline];
    const temp = newOutline[index];
    newOutline[index] = newOutline[index + 1];
    newOutline[index + 1] = temp;
    setOutline(newOutline);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(outline);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setOutline(reordered);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Layers className="w-5 h-5 text-violet-400" />
          <span>Interactive Outline Editor</span>
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Scrape and construct a heading outline. Drag to reorder, shift types (H2/H3/H4), and customize heading titles.
        </p>
      </div>

      {/* Scrape Controls */}
      <div className="bg-[#141829] border border-[#232948] rounded-xl p-5 space-y-4">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
          Extract Outlines from Competitors
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

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleScrapeOutline(false)}
              disabled={loading || !selectedUrl}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <span>{loading ? 'Appending...' : 'Extract & Append'}</span>
            </button>

            <button
              onClick={() => handleScrapeOutline(true)}
              disabled={loading || !selectedUrl}
              className="px-5 py-2.5 bg-[#2a1e1e] hover:bg-[#3d2727] border border-[#522b2b] font-bold text-sm text-rose-450 rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <span>Overwrite Current</span>
            </button>

            <button
              onClick={handleUseDefaultOutline}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 font-bold text-sm text-white rounded-xl flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Use Mock Outline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Outline List */}
      <div className="bg-[#141829] border border-[#232948] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
            Article Outline ({outline.length} headings)
          </label>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="outline-list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2 max-h-[400px] overflow-y-auto pr-1"
              >
                {outline.map((heading, index) => (
                  <Draggable key={heading.id} draggableId={heading.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center gap-3 bg-[#191d35] border border-[#2a315c] p-3 rounded-xl hover:border-violet-500/60 transition group"
                      >
                        {/* Drag Handle */}
                        <div {...provided.dragHandleProps} className="text-gray-500 cursor-grab active:cursor-grabbing hover:text-gray-300">
                          <Menu className="w-4 h-4" />
                        </div>

                        {/* Shift buttons */}
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className="p-1 hover:bg-[#252b4e] rounded text-gray-500 hover:text-gray-300 disabled:opacity-20"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(index)}
                            disabled={index === outline.length - 1}
                            className="p-1 hover:bg-[#252b4e] rounded text-gray-500 hover:text-gray-300 disabled:opacity-20"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Hierarchy Tag Toggle Button */}
                        <button
                          onClick={() => handleShiftType(heading.id, heading.type)}
                          className={`px-2.5 py-1 text-xs font-black rounded-lg border transition ${
                            heading.type === 'H2'
                              ? 'bg-violet-950/40 text-violet-300 border-violet-850/50'
                              : heading.type === 'H3'
                              ? 'bg-pink-950/40 text-pink-300 border-pink-850/50'
                              : 'bg-emerald-950/40 text-emerald-300 border-emerald-850/50'
                          }`}
                        >
                          {heading.type}
                        </button>

                        {/* Title text input */}
                        <input
                          type="text"
                          value={heading.text}
                          onChange={(e) => updateHeading(heading.id, { text: e.target.value })}
                          className="flex-1 bg-transparent outline-none border-b border-transparent focus:border-violet-500 text-sm text-gray-200"
                        />

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteHeading(heading.id)}
                          className="p-1 hover:bg-rose-950/40 text-rose-400 border border-transparent hover:border-rose-900/40 rounded-lg opacity-0 group-hover:opacity-100 transition duration-150"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}

                {outline.length === 0 && (
                  <p className="text-xs text-gray-500 italic py-4 text-center">
                    No headings in the outline. Extract competitor outlines or add custom headings below.
                  </p>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Add custom heading */}
        <div className="flex flex-col md:flex-row gap-2 border-t border-[#232948] pt-4">
          <input
            type="text"
            value={customHeadingText}
            onChange={(e) => setCustomHeadingText(e.target.value)}
            placeholder="Add custom heading text..."
            className="flex-1 px-4 py-2 bg-[#191d35] border border-[#2a315c] rounded-xl outline-none text-sm text-white placeholder-gray-500 focus:border-violet-500 transition"
          />

          <div className="flex gap-2">
            <select
              value={customHeadingType}
              onChange={(e) => setCustomHeadingType(e.target.value as 'H2' | 'H3' | 'H4')}
              className="px-3 bg-[#191d35] border border-[#2a315c] rounded-xl outline-none text-xs text-white"
            >
              <option value="H2">H2</option>
              <option value="H3">H3</option>
              <option value="H4">H4</option>
            </select>

            <button
              onClick={handleAddCustomHeading}
              className="px-4 py-2 bg-[#1d223f] hover:bg-[#272d54] text-xs font-bold text-gray-200 border border-[#2c335f] rounded-xl flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Heading</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
