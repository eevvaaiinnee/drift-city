import React, { useState } from 'react';
import { DriftObjectThread, HandoffStep } from '../types';
import { Search, Filter, Calendar, MapPin, User, ArrowRight, Sparkles, Navigation, Clock } from 'lucide-react';

interface CitywideLogViewProps {
  threads: DriftObjectThread[];
  onSelectThread: (threadId: string, stepId?: string) => void;
}

interface CombinedLogEntry {
  step: HandoffStep;
  thread: DriftObjectThread;
}

export const CitywideLogView: React.FC<CitywideLogViewProps> = ({
  threads,
  onSelectThread
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Flatten all steps across all threads
  const allEntries: CombinedLogEntry[] = [];
  threads.forEach((thread) => {
    thread.steps.forEach((step) => {
      allEntries.push({ step, thread });
    });
  });

  // Sort entries by timestamp
  allEntries.sort((a, b) => {
    const timeA = new Date(a.step.timestamp).getTime();
    const timeB = new Date(b.step.timestamp).getTime();
    return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
  });

  // Filter entries
  const filteredEntries = allEntries.filter(({ step, thread }) => {
    const matchesSearch =
      step.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      step.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      step.finderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      step.finderHandle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      step.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || thread.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div class="space-y-3.5 sm:space-y-4">
      {/* Header Banner */}
      <div class="bg-white border-3 sm:border-4 border-black rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-[4px_4px_0px_0px_#000000] sm:shadow-[6px_6px_0px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg sm:rounded-xl bg-yellow-300 border-2 border-black text-[10px] sm:text-xs font-black text-black uppercase tracking-wider mb-1 shadow-[1px_1px_0px_0px_#000]">
            <Clock class="w-3.5 h-3.5 stroke-[3]" />
            CITYWIDE ACTIVITY STREAM
          </div>
          <h2 class="text-xl sm:text-2xl lg:text-3xl font-black text-black font-display uppercase tracking-tight leading-tight">
            Chronological NYC Hand-off Log
          </h2>
          <p class="text-xs sm:text-sm font-bold text-slate-700 leading-snug mt-0.5">
            Real-time feed of physical objects found, carried, and re-hidden across New York
          </p>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <div class="bg-yellow-100 border-2 sm:border-3 border-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-center shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000]">
            <span class="block text-[9px] sm:text-[10px] font-black uppercase text-slate-600 font-display leading-none mb-0.5">Total NYC Drops</span>
            <span class="text-base sm:text-xl font-black text-black">{allEntries.length} logged</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Control Bar */}
      <div class="bg-white border-3 sm:border-4 border-black rounded-2xl p-2.5 sm:p-3.5 shadow-[3px_3px_0px_0px_#000000] sm:shadow-[4px_4px_0px_0px_#000000] flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
        {/* Search Input */}
        <div class="relative w-full md:w-72">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 stroke-[2.5]" />
          <input
            type="text"
            placeholder="Search drops, finders, locations, or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            class="w-full pl-8 pr-3 py-1.5 bg-yellow-50 border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black placeholder:text-slate-400"
          />
        </div>

        {/* Category Filters */}
        <div class="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span class="text-[11px] font-black uppercase font-display text-black mr-0.5 hidden sm:inline">Category:</span>
          {['all', 'toy', 'camera', 'journal', 'art', 'keepsake'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              class={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase border-2 border-black transition ${
                selectedCategory === cat
                  ? 'bg-yellow-300 text-black shadow-[1.5px_1.5px_0px_0px_#000]'
                  : 'bg-white text-slate-800 hover:bg-yellow-100 shadow-[1px_1px_0px_0px_#000]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort order toggle */}
        <button
          onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
          class="px-2.5 py-1.5 bg-yellow-100 hover:bg-yellow-200 border-2 border-black rounded-lg text-[10px] sm:text-xs font-black text-black flex items-center gap-1 shadow-[1.5px_1.5px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
        >
          <Filter class="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Sort: {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
        </button>
      </div>

      {/* Log Feed List */}
      <div class="space-y-3">
        {filteredEntries.length === 0 ? (
          <div class="bg-white border-3 sm:border-4 border-black rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-[4px_4px_0px_0px_#000]">
            <p class="text-base font-black text-black font-display uppercase">No handoff drops matched your search</p>
            <p class="text-xs font-bold text-slate-600 mt-1">Try clearing your filters or searching another landmark</p>
          </div>
        ) : (
          filteredEntries.map(({ step, thread }) => (
            <div
              key={step.id}
              onClick={() => onSelectThread(thread.id, step.id)}
              class="group bg-white hover:bg-yellow-50 border-3 sm:border-4 border-black rounded-2xl p-3.5 sm:p-4 shadow-[4px_4px_0px_0px_#000000] hover:shadow-[6px_6px_0px_0px_#000000] transition-all duration-200 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4"
            >
              {/* Left Photo & Badges */}
              <div class="flex items-center gap-4 shrink-0">
                <div class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-3 border-black shrink-0 bg-yellow-100 shadow-[3px_3px_0px_0px_#000]">
                  <img
                    src={step.photoUrl}
                    alt={step.locationName}
                    class="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div class="absolute top-1 left-1 bg-yellow-300 border border-black px-1.5 py-0.5 rounded text-[9px] font-black text-black">
                    STEP #{step.stepNumber}
                  </div>
                </div>

                <div>
                  <div class="flex flex-wrap items-center gap-2 mb-1">
                    <span class="px-2.5 py-0.5 rounded-lg bg-yellow-300 border-2 border-black text-black text-[11px] font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_#000]">
                      {thread.code}
                    </span>
                    <span class="px-2 py-0.5 rounded-lg bg-white border border-black text-slate-800 text-[10px] font-black uppercase">
                      {thread.category}
                    </span>
                  </div>

                  <h3 class="text-base sm:text-lg font-black text-black font-display uppercase group-hover:underline leading-snug">
                    {thread.title}
                  </h3>

                  <div class="flex items-center gap-2 text-xs font-extrabold text-slate-700 mt-1">
                    <span class="flex items-center gap-1 text-black font-black">
                      <MapPin class="w-3.5 h-3.5 stroke-[2.5]" />
                      {step.locationName}
                    </span>
                    <span class="text-slate-400">•</span>
                    <span>{step.neighborhood}</span>
                  </div>
                </div>
              </div>

              {/* Middle: Note & Finder */}
              <div class="flex-1 max-w-xl space-y-2">
                <p class="text-xs sm:text-sm text-black font-semibold italic bg-yellow-100/70 p-3 rounded-2xl border-2 border-black">
                  "{step.note}"
                </p>

                <div class="flex items-center justify-between text-xs font-bold text-slate-700">
                  <div class="flex items-center gap-2">
                    {step.finderAvatar ? (
                      <img src={step.finderAvatar} alt={step.finderName} class="w-5 h-5 rounded-full border border-black" />
                    ) : (
                      <User class="w-4 h-4 text-black" />
                    )}
                    <span>Logged by <strong class="text-black font-black">{step.finderHandle}</strong></span>
                  </div>

                  <span class="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <Calendar class="w-3.5 h-3.5 text-black" />
                    {formatDate(step.timestamp)}
                  </span>
                </div>
              </div>

              {/* Right CTA Button */}
              <div class="shrink-0 w-full md:w-auto flex md:flex-col items-center justify-between md:justify-center gap-2 border-t-2 md:border-t-0 md:border-l-2 border-black pt-3 md:pt-0 md:pl-5">
                <div class="text-left md:text-center">
                  <span class="text-[10px] font-black text-slate-500 uppercase block font-display">Leg Distance</span>
                  <span class="text-sm font-black text-black">{step.distanceFromPrevMiles} miles</span>
                </div>

                <button
                  class="px-4 py-2 bg-yellow-300 group-hover:bg-yellow-400 text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000] transition active:translate-x-0.5 active:translate-y-0.5"
                >
                  <span>INSPECT SUBPAGE</span>
                  <ArrowRight class="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
