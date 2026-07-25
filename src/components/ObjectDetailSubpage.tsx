import React, { useState } from 'react';
import { DriftObjectThread, MapTileTheme } from '../types';
import { MapView } from './MapView';
import { ThreadTimeline } from './ThreadTimeline';
import { ArrowLeft, Sparkles, QrCode, Compass, MapPin, Share2, Tag, Calendar, User, Eye, Navigation } from 'lucide-react';

interface ObjectDetailSubpageProps {
  thread: DriftObjectThread;
  allThreads: DriftObjectThread[];
  onBack: () => void;
  onSelectThread: (threadId: string) => void;
  onOpenActionModal: () => void;
  onOpenShareModal: () => void;
  mapTileTheme: MapTileTheme;
  onChangeMapTileTheme: (theme: MapTileTheme) => void;
  selectedStepId: string | null;
  onSelectStep: (stepId: string | null) => void;
}

export const ObjectDetailSubpage: React.FC<ObjectDetailSubpageProps> = ({
  thread,
  allThreads,
  onBack,
  onSelectThread,
  onOpenActionModal,
  onOpenShareModal,
  mapTileTheme,
  onChangeMapTileTheme,
  selectedStepId,
  onSelectStep
}) => {
  const latestStep = thread.steps[thread.steps.length - 1];

  return (
    <div class="space-y-4 sm:space-y-6">
      {/* Subpage Back & Object Switcher Bar */}
      <div class="bg-white border-3 sm:border-4 border-black rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-[4px_4px_0px_0px_#000000] sm:shadow-[6px_6px_0px_0px_#000000] flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          class="px-3 sm:px-4 py-2 sm:py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 sm:gap-2 shadow-[2px_2px_0px_0px_#000000] sm:shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition min-h-[42px]"
        >
          <ArrowLeft class="w-4 h-4 stroke-[3]" />
          <span>BACK TO OVERVIEW</span>
        </button>

        <div class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <span class="text-[11px] sm:text-xs font-black uppercase text-black font-display shrink-0">Switch Object:</span>
          <select
            value={thread.id}
            onChange={(e) => onSelectThread(e.target.value)}
            class="bg-yellow-100 text-black border-2 sm:border-3 border-black text-xs font-black rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer shadow-[2px_2px_0px_0px_#000000] max-w-[200px] sm:max-w-none truncate"
          >
            {allThreads.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Object Header & Metadata Banner */}
      <div class="relative bg-white border-3 sm:border-4 border-black rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-[6px_6px_0px_0px_#000000] sm:shadow-[8px_8px_0px_0px_#000000] overflow-hidden">
        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          {/* Cover & Title */}
          <div class="flex items-start gap-3 sm:gap-5">
            <div class="relative w-16 h-16 xs:w-20 xs:h-20 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-black shrink-0 bg-yellow-100 shadow-[3px_3px_0px_0px_#000000] sm:shadow-[4px_4px_0px_0px_#000000]">
              <img
                src={thread.coverImage}
                alt={thread.title}
                class="w-full h-full object-cover"
              />
              <span class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-yellow-300 text-[9px] sm:text-[10px] font-black text-black border border-black shadow-[1px_1px_0px_0px_#000]">
                {thread.code}
              </span>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <span class="px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-yellow-300 border-2 border-black text-black text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_#000] sm:shadow-[2px_2px_0px_0px_#000]">
                  {thread.category}
                </span>
                <span class="px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-emerald-300 border-2 border-black text-black text-[10px] sm:text-xs font-black flex items-center gap-1 shadow-[1px_1px_0px_0px_#000] sm:shadow-[2px_2px_0px_0px_#000]">
                  <span class={`w-2 h-2 rounded-full border border-black ${thread.currentStatus === 'hidden_waiting' ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-600'}`}></span>
                  {thread.currentStatus === 'hidden_waiting' ? 'Waiting' : 'In Transit'}
                </span>
                <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl bg-white border-2 border-black text-slate-800 text-[10px] sm:text-xs font-bold shadow-[1px_1px_0px_0px_#000]">
                  By: <strong>{thread.creatorHandle}</strong>
                </span>
              </div>

              <h1 class="text-xl sm:text-2xl lg:text-3xl font-black text-black font-display uppercase tracking-tight leading-tight">
                {thread.title}
              </h1>
              <p class="text-xs sm:text-sm font-semibold text-slate-800 italic mt-1 bg-yellow-50 p-1.5 sm:p-2 rounded-xl border border-black/20 max-w-2xl">
                "{thread.description}"
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 bg-yellow-100 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-black shadow-[3px_3px_0px_0px_#000000] sm:shadow-[4px_4px_0px_0px_#000000]">
            <div class="px-1.5 py-1">
              <span class="text-[9px] sm:text-[10px] text-black font-black uppercase font-display block leading-none mb-0.5">
                Trajectory
              </span>
              <span class="text-base sm:text-lg font-black text-black">
                {thread.totalDistanceMiles} mi
              </span>
            </div>
            <div class="px-1.5 py-1 border-l-2 border-black">
              <span class="text-[9px] sm:text-[10px] text-black font-black uppercase font-display block leading-none mb-0.5">
                Keepers
              </span>
              <span class="text-base sm:text-lg font-black text-black truncate block">
                {thread.steps.length} strangers
              </span>
            </div>
            <div class="px-1.5 py-1 border-l-2 border-black">
              <span class="text-[9px] sm:text-[10px] text-black font-black uppercase font-display block leading-none mb-0.5">
                Active Days
              </span>
              <span class="text-base sm:text-lg font-black text-black">
                {thread.activeDays} days
              </span>
            </div>
            <div class="px-1.5 py-1 border-l-2 border-black">
              <span class="text-[9px] sm:text-[10px] text-black font-black uppercase font-display block leading-none mb-0.5">
                Current Spot
              </span>
              <span class="text-[11px] sm:text-xs font-extrabold text-black truncate block max-w-[120px]">
                📍 {latestStep?.locationName || thread.originLocation}
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div class="flex items-center gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={onOpenShareModal}
              class="p-2.5 sm:p-3 bg-white hover:bg-yellow-200 text-black border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
              title="Print Physical Tag & QR"
            >
              <QrCode class="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              onClick={onOpenActionModal}
              class="flex-1 sm:flex-initial px-4 py-2.5 sm:px-5 sm:py-3.5 bg-yellow-300 hover:bg-yellow-400 text-black border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000000] sm:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition min-h-[44px]"
            >
              <Sparkles class="w-4 h-4 fill-black stroke-[2] shrink-0" />
              <span>LOG "FOUND & MOVED"</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Individual Map & Full Timeline */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Individual Trajectory Map */}
        <div class="lg:col-span-6 xl:col-span-7 lg:sticky lg:top-28 h-[320px] xs:h-[380px] sm:h-[480px] lg:h-[580px]">
          <div class="mb-2 flex items-center justify-between">
            <h3 class="text-xs sm:text-sm font-black text-black font-display uppercase tracking-tight flex items-center gap-1.5">
              <Navigation class="w-4 h-4 stroke-[3]" />
              Individual Trajectory Map
            </h3>
            <span class="text-[11px] sm:text-xs font-bold text-slate-600">
              {thread.steps.length} Handoff Markers
            </span>
          </div>

          <MapView
            thread={thread}
            selectedStepId={selectedStepId}
            onSelectStep={(stepId) => onSelectStep(stepId)}
            mapTileTheme={mapTileTheme}
            onChangeTheme={onChangeMapTileTheme}
          />
        </div>

        {/* Full Activity Log Timeline */}
        <div class="lg:col-span-6 xl:col-span-5">
          <div class="mb-2 flex items-center justify-between">
            <h3 class="text-xs sm:text-sm font-black text-black font-display uppercase tracking-tight flex items-center gap-1.5">
              <Calendar class="w-4 h-4 stroke-[3]" />
              Full Activity Log Timeline
            </h3>
          </div>

          <ThreadTimeline
            steps={thread.steps}
            selectedStepId={selectedStepId}
            onSelectStep={(stepId) => onSelectStep(stepId)}
            onOpenActionModal={onOpenActionModal}
          />
        </div>
      </div>
    </div>
  );
};
