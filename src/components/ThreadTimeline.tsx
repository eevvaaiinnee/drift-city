import React, { useState } from 'react';
import { HandoffStep, DriftObjectThread } from '../types';
import { formatFullDate, formatTimeAgo } from '../utils/geoUtils';
import {
  MapPin,
  Clock,
  User,
  Compass,
  KeyRound,
  Eye,
  EyeOff,
  ArrowUpRight,
  Camera,
  Coffee,
  Package,
  Sparkles,
  Search,
  ArrowDownUp,
  Share2
} from 'lucide-react';

interface ThreadTimelineProps {
  thread: DriftObjectThread;
  steps: HandoffStep[];
  selectedStepId: string | null;
  onSelectStep: (stepId: string) => void;
  onOpenActionModal: () => void;
  onShareThread: () => void;
}

export const ThreadTimeline: React.FC<ThreadTimelineProps> = ({
  thread,
  steps,
  selectedStepId,
  onSelectStep,
  onOpenActionModal,
  onShareThread
}) => {
  const [isReverse, setIsReverse] = useState(true); // Newest first by default
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedClues, setRevealedClues] = useState<Record<string, boolean>>({});
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const displaySteps = isReverse ? [...steps].reverse() : [...steps];

  const filteredSteps = displaySteps.filter((step) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      step.locationName.toLowerCase().includes(query) ||
      step.neighborhood.toLowerCase().includes(query) ||
      step.finderName.toLowerCase().includes(query) ||
      step.finderHandle.toLowerCase().includes(query) ||
      step.note.toLowerCase().includes(query)
    );
  });

  const toggleClue = (stepId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedClues((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const getHandoffIcon = (method: string) => {
    switch (method) {
      case 'hidden_drop':
        return <KeyRound class="w-3.5 h-3.5 text-amber-400" />;
      case 'coffee_shop':
        return <Coffee class="w-3.5 h-3.5 text-amber-400" />;
      case 'bench_leave':
        return <Package class="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <User class="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getHandoffLabel = (method: string) => {
    switch (method) {
      case 'hidden_drop':
        return 'Hidden Drop';
      case 'coffee_shop':
        return 'Coffee Shop Leave';
      case 'bench_leave':
        return 'Park Bench Leave';
      case 'community_box':
        return 'Community Box';
      default:
        return 'Direct Pass';
    }
  };

  return (
    <div class="space-y-6">
      {/* Timeline Controls & Filter Bar */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000000]">
        <div class="relative flex-1">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black stroke-[2.5]" />
          <input
            type="text"
            placeholder="Search timeline notes, finders, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            class="w-full pl-9 pr-4 py-2 bg-yellow-50 border-2 border-black rounded-xl text-xs text-black font-semibold placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div class="flex items-center gap-2">
          <button
            onClick={() => setIsReverse(!isReverse)}
            class="px-3 py-2 bg-white hover:bg-yellow-200 text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition"
          >
            <ArrowDownUp class="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isReverse ? 'NEWEST FIRST' : 'OLDEST FIRST'}</span>
          </button>

          <button
            onClick={onShareThread}
            class="p-2 bg-white hover:bg-yellow-200 text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition"
            title="Share thread or generate printable tag"
          >
            <Share2 class="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            onClick={onOpenActionModal}
            class="px-3.5 py-2 bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition"
          >
            <Sparkles class="w-3.5 h-3.5 fill-black stroke-[2]" />
            <span>LOG HANDOFF</span>
          </button>
        </div>
      </div>

      {/* Timeline Steps Stream */}
      <div class="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-1 before:bg-black">
        {filteredSteps.map((step, index) => {
          const isSelected = selectedStepId === step.id;
          const isLatest = step.id === steps[steps.length - 1]?.id;

          return (
            <div
              key={step.id}
              onClick={() => onSelectStep(step.id)}
              class={`relative group rounded-3xl border-3 border-black p-4 sm:p-5 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-yellow-100 shadow-[6px_6px_0px_0px_#000000] scale-[1.01]'
                  : 'bg-white shadow-[4px_4px_0px_0px_#000000] hover:shadow-[6px_6px_0px_0px_#000000] hover:bg-amber-50'
              }`}
            >
              {/* Timeline Marker Bullet on line */}
              <div
                class={`absolute -left-[27px] sm:-left-[35px] top-5 w-7 h-7 rounded-xl border-3 border-black flex items-center justify-center font-black transition-transform group-hover:scale-110 shadow-[2px_2px_0px_0px_#000000] ${
                  isLatest
                    ? 'bg-yellow-300 text-black animate-bounce'
                    : isSelected
                    ? 'bg-emerald-300 text-black'
                    : 'bg-pink-300 text-black'
                }`}
              >
                <span class="text-xs font-black">{step.stepNumber}</span>
              </div>

              {/* Step Card Header */}
              <div class="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div>
                  <div class="flex flex-wrap items-center gap-2 mb-1">
                    <span class="px-2.5 py-0.5 rounded-lg bg-yellow-300 border-2 border-black text-black text-[11px] font-black uppercase shadow-[1px_1px_0px_0px_#000]">
                      Step #{step.stepNumber}
                    </span>
                    <span class="text-xs font-extrabold text-black flex items-center gap-1 font-display">
                      <MapPin class="w-3.5 h-3.5 text-black stroke-[2.5]" />
                      {step.locationName}
                    </span>
                    <span class="text-[11px] text-slate-700 font-bold">
                      • {step.neighborhood}
                    </span>
                  </div>

                  <div class="flex items-center gap-3 text-xs text-slate-700 font-semibold">
                    <span class="flex items-center gap-1" title={formatFullDate(step.timestamp)}>
                      <Clock class="w-3.5 h-3.5 text-slate-700 stroke-[2.5]" />
                      {formatTimeAgo(step.timestamp)}
                    </span>
                    {step.distanceFromPrevMiles > 0 && (
                      <span class="bg-emerald-200 border border-black px-1.5 py-0.2 rounded text-[11px] text-black font-black">
                        +{step.distanceFromPrevMiles} mi drifted
                      </span>
                    )}
                    {step.weather && (
                      <span class="text-slate-600 hidden sm:inline italic">🌤️ {step.weather}</span>
                    )}
                  </div>
                </div>

                {/* Handoff Method Tag */}
                <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-pink-200 border-2 border-black text-xs text-black font-extrabold shadow-[1px_1px_0px_0px_#000]">
                  {getHandoffIcon(step.handoffMethod)}
                  <span>{getHandoffLabel(step.handoffMethod)}</span>
                </div>
              </div>

              {/* Content Grid: Photo + Story Note */}
              <div class="grid grid-cols-1 md:grid-cols-12 gap-4 my-3">
                {/* Photo Thumbnail */}
                <div class="md:col-span-5 relative group/img rounded-2xl overflow-hidden bg-yellow-100 border-3 border-black shadow-[3px_3px_0px_0px_#000] h-44 sm:h-48">
                  <img
                    src={step.photoUrl}
                    alt={step.locationName}
                    referrerPolicy="no-referrer"
                    class="w-full h-full object-cover transition duration-300 group-hover/img:scale-105"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedImage(step.photoUrl);
                    }}
                    class="absolute bottom-2 right-2 p-1.5 bg-yellow-300 hover:bg-yellow-400 text-black rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition"
                    title="View full resolution"
                  >
                    <ArrowUpRight class="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Story Note & Keeper details */}
                <div class="md:col-span-7 flex flex-col justify-between space-y-3">
                  <blockquote class="text-sm text-black leading-relaxed font-sans italic bg-amber-50 p-3.5 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    "{step.note}"
                  </blockquote>

                  {/* Finder info */}
                  <div class="flex items-center justify-between pt-1 border-t-2 border-black/20 text-xs">
                    <div class="flex items-center gap-2">
                      <img
                        src={step.finderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={step.finderName}
                        referrerPolicy="no-referrer"
                        class="w-7 h-7 rounded-full object-cover border-2 border-black"
                      />
                      <div>
                        <span class="font-extrabold text-black">{step.finderName}</span>
                        <span class="text-slate-600 font-bold text-[11px] ml-1.5">{step.finderHandle}</span>
                      </div>
                    </div>
                  </div>

                  {/* Drop Secret Clue Accordion */}
                  {step.dropSecret && (
                    <div class="mt-2">
                      <button
                        onClick={(e) => toggleClue(step.id, e)}
                        class="w-full px-3 py-1.5 rounded-xl bg-yellow-200 hover:bg-yellow-300 border-2 border-black text-left text-xs font-black text-black flex items-center justify-between shadow-[2px_2px_0px_0px_#000] transition"
                      >
                        <span class="flex items-center gap-1.5">
                          <KeyRound class="w-3.5 h-3.5 stroke-[2.5]" />
                          FINDER DROP CLUE
                        </span>
                        {revealedClues[step.id] ? (
                          <EyeOff class="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : (
                          <Eye class="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                      </button>

                      {revealedClues[step.id] && (
                        <div class="mt-1.5 p-2.5 rounded-xl bg-white border-2 border-black text-xs text-black font-mono font-bold shadow-[2px_2px_0px_0px_#000] animate-fadeIn">
                          💡 Clue: {step.dropSecret}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredSteps.length === 0 && (
          <div class="text-center py-10 bg-white rounded-3xl border-3 border-black shadow-[4px_4px_0px_0px_#000000] text-black font-extrabold text-xs">
            No trajectory handoffs matched your search filter.
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {expandedImage && (
        <div
          onClick={() => setExpandedImage(null)}
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div class="relative max-w-4xl max-h-[90vh]">
            <img
              src={expandedImage}
              alt="Expanded step"
              referrerPolicy="no-referrer"
              class="max-w-full max-h-[85vh] rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_#000000] object-contain bg-white"
            />
            <button
              onClick={() => setExpandedImage(null)}
              class="absolute top-4 right-4 px-4 py-2 bg-yellow-300 border-3 border-black text-black rounded-2xl text-xs font-black shadow-[4px_4px_0px_0px_#000000]"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
