'use client';

import React, { useState, useEffect } from 'react';
import { useWriterStore } from '@/store/useWriterStore';
import { 
  Globe, 
  Plus, 
  Trash2, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  ExternalLink 
} from 'lucide-react';
import debounce from 'lodash/debounce';

export default function Step0Research() {
  const {
    mainKeyword,
    setMainKeyword,
    competitors,
    addCompetitor,
    removeCompetitor,
    apiKeys,
  } = useWriterStore();

  const [urlInput, setUrlInput] = useState('');
  const [serpOpen, setSerpOpen] = useState(false);
  
  // SERP accordion fields
  const [searchKeyword, setSearchKeyword] = useState(mainKeyword || '');
  const [countryLang, setCountryLang] = useState('us_en');
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [serpResults, setSerpResults] = useState<{ title: string; url: string; snippet: string }[]>([]);
  const [loadingSerp, setLoadingSerp] = useState(false);
  const [serpError, setSerpError] = useState<string | null>(null);

  // Autocomplete debounced lookup
  const fetchSuggestions = React.useMemo(
    () =>
      debounce(async (val: string) => {
        if (!val.trim()) {
          setSuggestions([]);
          return;
        }
        try {
          const res = await fetch(`/api/serp?q=${encodeURIComponent(val)}`);
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        } catch (e) {
          console.error(e);
        }
      }, 300),
    []
  );



  const handleAddCompetitor = () => {
    if (urlInput.trim()) {
      addCompetitor(urlInput.trim());
      setUrlInput('');
    }
  };

  const handleSearchSerp = async () => {
    if (!searchKeyword.trim()) return;
    setLoadingSerp(true);
    setSuggestions([]);
    setSerpError(null);
    try {
      if (apiKeys.serper) {
        const res = await fetch('/api/serp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: searchKeyword,
            apiKey: apiKeys.serper,
            country: countryLang,
            location: location,
          }),
        });
        const data = await res.json();
        if (res.ok && data.results) {
          setSerpResults(data.results);
        } else {
          setSerpError(data.error || 'Failed to search via Serper API. Please verify your API Key.');
          setSerpResults([]);
        }
      } else {
        setSerpError('Serper.dev API Key not found. Please add your Serper.dev API key under the "API Keys" settings in the top-right header.');
        setSerpResults([]);
      }
    } catch (e: any) {
      console.error(e);
      setSerpError(e.message || 'An error occurred during search.');
    } finally {
      setLoadingSerp(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Globe className="w-5 h-5 text-violet-400" />
          <span>Competitor Research Dashboard</span>
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Specify your primary target keyword and add competitor links to analyze.
        </p>
      </div>

      {/* Main Keyword Input */}
      <div className="bg-[#141829] border border-[#232948] rounded-xl p-5 space-y-2">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Main Keyword</label>
        <div className="relative">
          <input
            type="text"
            value={mainKeyword}
            onChange={(e) => {
              setMainKeyword(e.target.value);
              if (!searchKeyword) setSearchKeyword(e.target.value);
            }}
            placeholder="Enter your primary keyword (e.g. Best SEO Tools)"
            className="w-full pl-4 pr-4 py-3 bg-[#191d35] border border-[#2a315c] rounded-xl outline-none text-sm text-white placeholder-gray-500 focus:border-violet-500 transition"
          />
        </div>
      </div>

      {/* Competitor URLs */}
      <div className="bg-[#141829] border border-[#232948] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
            Competitor URLs ({competitors.length} added)
          </label>
        </div>

        {/* Competitor List */}
        <div className="space-y-2">
          {competitors.map((comp) => (
            <div key={comp.url} className="flex items-center gap-2 bg-[#191d35] border border-[#2a315c] p-3 rounded-xl">
              <span className="text-xs text-gray-400 truncate flex-1">{comp.url}</span>
              <button
                onClick={() => removeCompetitor(comp.url)}
                className="p-1.5 hover:bg-rose-950/40 rounded-lg text-rose-400 border border-transparent hover:border-rose-900/40 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {competitors.length === 0 && (
            <p className="text-xs text-gray-500 italic py-2">No competitor URLs added yet. Use the input below or search SERPs.</p>
          )}
        </div>

        {/* Input to add manual URL */}
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://competitor-url.com/page"
            className="flex-1 px-4 py-2.5 bg-[#191d35] border border-[#2a315c] rounded-xl outline-none text-sm text-white placeholder-gray-500 focus:border-violet-500 transition"
          />
          <button
            onClick={handleAddCompetitor}
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 font-bold text-sm text-white rounded-xl flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Competitor</span>
          </button>
        </div>
      </div>

      {/* Accordion: Find Competitors via SERP */}
      <div className="border border-[#232948] bg-[#141829] rounded-xl overflow-hidden">
        <button
          onClick={() => setSerpOpen(!serpOpen)}
          className="w-full px-5 py-4 flex items-center justify-between bg-[#191d35]/60 hover:bg-[#191d35] transition"
        >
          <span className="text-sm font-bold flex items-center gap-2">
            <Search className="w-4 h-4 text-violet-400" />
            <span>Find Competitors via SERP</span>
          </span>
          {serpOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {serpOpen && (
          <div className="p-5 border-t border-[#232948] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search input with autocomplete list */}
              <div className="space-y-1 relative">
                <label className="block text-xs font-semibold text-gray-400">Search Keyword</label>
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchKeyword(val);
                    fetchSuggestions(val);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSuggestions([]);
                    }
                  }}
                  placeholder="e.g. best seo tools"
                  className="w-full px-3 py-2 bg-[#191d35] border border-[#2a315c] rounded-xl outline-none text-sm text-white focus:border-violet-500"
                />

                {/* Autocomplete dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-[#161a30] border border-[#2a315c] rounded-xl overflow-hidden z-20 shadow-2xl">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setSearchKeyword(suggestion);
                          setSuggestions([]);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-[#20264b] hover:text-white transition flex items-center gap-2"
                      >
                        <Search className="w-3 h-3 text-violet-400" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

               <div>
                <label className="block text-xs font-semibold text-gray-400">Country & Language</label>
                <select
                  value={countryLang}
                  onChange={(e) => setCountryLang(e.target.value)}
                  className="w-full px-3 py-2 bg-[#191d35] border border-[#2a315c] rounded-xl outline-none text-sm text-white focus:border-violet-500"
                >
                  <option value="us_en">United States - English</option>
                  <option value="in_en">India - English</option>
                  <option value="uk_en">United Kingdom - English</option>
                  <option value="ca_en">Canada - English</option>
                  <option value="au_en">Australia - English</option>
                  <option value="de_de">Germany - German</option>
                  <option value="fr_fr">France - French</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-400">Location (optional - for hyper-local results)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. 1600 Amphitheatre Pkwy, Mountain View, CA"
                  className="flex-1 px-3 py-2 bg-[#191d35] border border-[#2a315c] rounded-xl outline-none text-sm text-white focus:border-violet-500"
                />
                <button className="px-3 bg-[#191d35] hover:bg-[#21274a] text-xs text-violet-400 border border-[#2a315c] rounded-xl flex items-center gap-1 transition">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Geocode</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleSearchSerp}
                disabled={loadingSerp}
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{loadingSerp ? 'Searching...' : 'Search via API'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (searchKeyword.trim()) {
                    const gl = countryLang.split('_')[0];
                    const hl = countryLang.split('_')[1] || 'en';
                    let queryStr = searchKeyword.trim();
                    if (location.trim()) {
                      // Append location if not already in the query to match local search intent
                      if (!queryStr.toLowerCase().includes(location.trim().toLowerCase())) {
                        queryStr += ` ${location.trim()}`;
                      }
                    }
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(queryStr)}&gl=${gl}&hl=${hl}`, '_blank');
                  }
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Google Search</span>
              </button>
            </div>
            {serpError && (
              <div className="p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-xl text-rose-300 text-xs mt-3 leading-relaxed">
                <strong>⚠️ Search Error:</strong> {serpError}
              </div>
            )}

            {/* Simulated Search Results */}
            {serpResults.length > 0 && (
              <div className="mt-4 border-t border-[#232948] pt-4 space-y-3">
                <p className="text-xs font-semibold text-gray-400">SERP Results:</p>
                <div className="space-y-2">
                  {serpResults.map((result) => {
                    const isAdded = competitors.some((c) => c.url === result.url);
                    return (
                      <div key={result.url} className="bg-[#181b2f] border border-[#2a2e4e] p-3 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                            {result.title}
                            <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-300">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </h4>
                          <span className="text-[10px] text-emerald-500 block truncate max-w-md">{result.url}</span>
                          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{result.snippet}</p>
                        </div>
                        <button
                          onClick={() => {
                            if (isAdded) {
                              removeCompetitor(result.url);
                            } else {
                              addCompetitor(result.url);
                            }
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                            isAdded
                              ? 'bg-rose-950/20 text-rose-400 border-rose-900/40 hover:bg-rose-950/40'
                              : 'bg-violet-600 hover:bg-violet-500 text-white border-transparent'
                          }`}
                        >
                          {isAdded ? 'Remove' : 'Add URL'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
