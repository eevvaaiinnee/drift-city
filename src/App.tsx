import React, { useState, useEffect } from 'react';
import { DriftObjectThread, HandoffStep, MapTileTheme } from './types';
import { INITIAL_THREADS } from './data/mockThreads';
import { calculateHaversineDistance } from './utils/geoUtils';

import { CitywideMapView } from './components/CitywideMapView';
import { CitywideLogView } from './components/CitywideLogView';
import { ObjectDetailSubpage } from './components/ObjectDetailSubpage';

import { ActionModal } from './components/ActionModal';
import { NewThreadModal } from './components/NewThreadModal';
import { ShareTagModal } from './components/ShareTagModal';
import { UserProfileModal } from './components/UserProfileModal';

import {
  Compass,
  MapPin,
  Sparkles,
  Plus,
  Grid,
  Map as MapIcon,
  Clock,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Activity,
  QrCode,
  Layers,
  ChevronRight,
  User
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'drift_city_threads_v2';

export default function App() {
  // 1. Load threads state
  const [threads, setThreads] = useState<DriftObjectThread[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load local storage threads', e);
    }
    return INITIAL_THREADS;
  });

  // 2. Top-level Tab State: 'home' | 'map' | 'log'
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'log'>('home');

  // 3. Selected Thread Subpage State: string | null (when null, shows tab view; when set, shows subpage)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // 4. Selected Step ID within thread (for map step highlighting)
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  // 5. Map Tile Theme
  const [mapTileTheme, setMapTileTheme] = useState<MapTileTheme>('light');

  // 6. Homepage Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // 7. Modals & User state
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isNewThreadModalOpen, setIsNewThreadModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [currentUserHandle, setCurrentUserHandle] = useState('@stranger_nyc');

  // Save to LocalStorage whenever threads change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(threads));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }, [threads]);

  // Derive active thread for modals / subpage
  const activeThread =
    threads.find((t) => t.id === selectedThreadId) ||
    threads[0];

  // Save Handoff Step Handler
  const handleSaveHandoff = (newStepData: Omit<HandoffStep, 'id' | 'stepNumber'>) => {
    if (!activeThread) return;

    setThreads((prevThreads) =>
      prevThreads.map((thread) => {
        if (thread.id !== activeThread.id) return thread;

        const newStepNumber = thread.steps.length + 1;
        const newStep: HandoffStep = {
          ...newStepData,
          id: `step-${Date.now()}`,
          stepNumber: newStepNumber
        };

        const updatedSteps = [...thread.steps, newStep];

        // Recalculate distance
        let totalDist = 0;
        for (let i = 1; i < updatedSteps.length; i++) {
          totalDist += calculateHaversineDistance(
            updatedSteps[i - 1].lat,
            updatedSteps[i - 1].lng,
            updatedSteps[i].lat,
            updatedSteps[i].lng
          );
        }

        return {
          ...thread,
          steps: updatedSteps,
          totalDistanceMiles: Math.round(totalDist * 10) / 10,
          totalKeepers: updatedSteps.length,
          currentStatus: newStepData.handoffMethod === 'hidden_drop' ? 'hidden_waiting' : 'in_transit'
        };
      })
    );
  };

  // Create New Thread Handler
  const handleCreateThread = (newThread: DriftObjectThread) => {
    setThreads((prev) => [newThread, ...prev]);
    setSelectedThreadId(newThread.id);
  };

  // Filtered threads for Homepage
  const filteredThreads = threads.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || t.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' || t.currentStatus === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate platform summary statistics
  const totalObjectsCount = threads.length;
  const totalMilesDrifted = Math.round(
    threads.reduce((sum, t) => sum + t.totalDistanceMiles, 0) * 10
  ) / 10;
  const totalHandoffsCount = threads.reduce((sum, t) => sum + t.steps.length, 0);

  return (
    <div class="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col font-sans selection:bg-yellow-300 selection:text-black">
      {/* HEADER / NAVIGATION BAR: EXACTLY 3 TOP-LEVEL OPTIONS (MOBILE OPTIMIZED) */}
      <header class="sticky top-0 z-40 bg-[#FDFBF7] border-b-3 sm:border-b-4 border-black shadow-sm">
        <div class="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-3">
          
          {/* Top Row on Mobile: Brand Logo + User Auth Icon + Launch New Object Button */}
          <div class="w-full md:w-auto flex items-center justify-between gap-2">
            {/* Brand Logo (Animated dot removed) */}
            <div
              onClick={() => {
                setSelectedThreadId(null);
                setActiveTab('home');
              }}
              class="flex items-center gap-2 cursor-pointer group shrink-0"
            >
              <div class="relative flex items-center justify-center w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-yellow-300 border-2 sm:border-3 border-black text-black shadow-[2px_2px_0px_0px_#000000] group-hover:scale-105 transition shrink-0">
                <Compass class="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </div>

              <div>
                <div class="flex items-center gap-1 sm:gap-2">
                  <h1 class="font-black text-base sm:text-2xl text-black tracking-tight font-display uppercase leading-none">
                    Drift City
                  </h1>
                  {/* Compact User Profile / Auth Button in Header */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUserModalOpen(true);
                    }}
                    title="Open User Profile & Account"
                    class="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg bg-yellow-300 hover:bg-yellow-400 border border-black text-[9px] sm:text-[10px] font-black text-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_#000] cursor-pointer transition active:translate-x-0.5 active:translate-y-0.5 shrink-0"
                  >
                    <User class="w-3 h-3 stroke-[3]" />
                    <span class="truncate max-w-[55px] xs:max-w-[75px] sm:max-w-none">{currentUserHandle}</span>
                  </button>
                </div>
                <p class="text-[11px] text-black font-extrabold hidden lg:block leading-tight mt-0.5">
                  Stranger-to-stranger physical object trajectories across NYC
                </p>
              </div>
            </div>

            {/* Launch New Object Button (Mobile view shortcut) */}
            <button
              onClick={() => setIsNewThreadModalOpen(true)}
              class="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-yellow-300 hover:bg-yellow-400 text-black border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition shrink-0 min-h-[36px] sm:min-h-[40px]"
            >
              <Plus class="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
              <span class="font-display uppercase">Launch Object</span>
            </button>
          </div>

          {/* EXACTLY 3 TOP-LEVEL NAVIGATION OPTIONS (TOUCH FRIENDLY MOBILE & DESKTOP BAR) */}
          <div class="w-full md:w-auto bg-white border-2 sm:border-3 border-black p-1 rounded-xl sm:rounded-2xl shadow-[2px_2px_0px_0px_#000000] sm:shadow-[3px_3px_0px_0px_#000000] grid grid-cols-3 gap-1 sm:gap-2">
            <button
              onClick={() => {
                setSelectedThreadId(null);
                setActiveTab('home');
              }}
              class={`min-h-[36px] sm:min-h-[40px] px-2 sm:px-4 py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs lg:text-sm font-black uppercase font-display flex items-center justify-center gap-1 sm:gap-2 transition ${
                activeTab === 'home' && selectedThreadId === null
                  ? 'bg-yellow-300 text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000000]'
                  : 'text-slate-800 hover:bg-yellow-100'
              }`}
            >
              <Grid class="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
              <span class="truncate">Homepage</span>
            </button>

            <button
              onClick={() => {
                setSelectedThreadId(null);
                setActiveTab('map');
              }}
              class={`min-h-[36px] sm:min-h-[40px] px-2 sm:px-4 py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs lg:text-sm font-black uppercase font-display flex items-center justify-center gap-1 sm:gap-2 transition ${
                activeTab === 'map' && selectedThreadId === null
                  ? 'bg-yellow-300 text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000000]'
                  : 'text-slate-800 hover:bg-yellow-100'
              }`}
            >
              <MapIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
              <span class="truncate">Map View</span>
            </button>

            <button
              onClick={() => {
                setSelectedThreadId(null);
                setActiveTab('log');
              }}
              class={`min-h-[36px] sm:min-h-[40px] px-2 sm:px-4 py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs lg:text-sm font-black uppercase font-display flex items-center justify-center gap-1 sm:gap-2 transition ${
                activeTab === 'log' && selectedThreadId === null
                  ? 'bg-yellow-300 text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000000]'
                  : 'text-slate-800 hover:bg-yellow-100'
              }`}
            >
              <Clock class="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
              <span class="truncate">Log View</span>
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT REGION */}
      <main class="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-3.5 sm:space-y-4">
        {/* IF A THREAD IS SELECTED -> SHOW UNIFIED OBJECT DETAIL SUBPAGE */}
        {selectedThreadId !== null && activeThread ? (
          <ObjectDetailSubpage
            thread={activeThread}
            allThreads={threads}
            onBack={() => setSelectedThreadId(null)}
            onSelectThread={(id) => setSelectedThreadId(id)}
            onOpenActionModal={() => setIsActionModalOpen(true)}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            mapTileTheme={mapTileTheme}
            onChangeMapTileTheme={(t) => setMapTileTheme(t)}
            selectedStepId={selectedStepId}
            onSelectStep={(stepId) => setSelectedStepId(stepId)}
          />
        ) : (
          <>
            {/* VIEW 1: 🏠 HOMEPAGE */}
            {activeTab === 'home' && (
              <div class="space-y-3.5 sm:space-y-4">
                {/* Compact Intro Header Hero Banner - High density for above-the-fold cards visibility */}
                <div class="relative bg-white border-3 sm:border-4 border-black rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-[4px_4px_0px_0px_#000000] sm:shadow-[6px_6px_0px_0px_#000000] overflow-hidden">
                  <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-5">
                    <div class="max-w-xl space-y-2">
                      <h2 class="text-xl sm:text-2xl lg:text-3xl font-black text-black font-display uppercase tracking-tight leading-tight">
                        Drifting Objects Across NYC
                      </h2>

                      <p class="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                        Physical objects pass stranger-to-stranger through coffee shops, parks, and subway stations. Every drop creates a physical trajectory across New York City.
                      </p>

                      <div class="pt-1">
                        <button
                          onClick={() => setIsNewThreadModalOpen(true)}
                          class="px-3.5 py-2 sm:px-4.5 sm:py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000000] sm:shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition uppercase font-display"
                        >
                          <Plus class="w-4 h-4 stroke-[3]" />
                          <span>LAUNCH A NEW OBJECT TRAJECTORY</span>
                        </button>
                      </div>
                    </div>

                    {/* Platform Stats Banner Cards */}
                    <div class="grid grid-cols-3 gap-2 bg-yellow-100 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-black shadow-[3px_3px_0px_0px_#000000] text-center shrink-0">
                      <div class="px-1.5 py-0.5">
                        <span class="block text-[9px] sm:text-[10px] font-black uppercase text-slate-600 font-display leading-none mb-0.5">Active</span>
                        <span class="text-base sm:text-xl font-black text-black">{totalObjectsCount}</span>
                      </div>
                      <div class="px-1.5 py-0.5 border-x-2 border-black">
                        <span class="block text-[9px] sm:text-[10px] font-black uppercase text-slate-600 font-display leading-none mb-0.5">Drifted</span>
                        <span class="text-base sm:text-xl font-black text-black">{totalMilesDrifted} mi</span>
                      </div>
                      <div class="px-1.5 py-0.5">
                        <span class="block text-[9px] sm:text-[10px] font-black uppercase text-slate-600 font-display leading-none mb-0.5">Handoffs</span>
                        <span class="text-base sm:text-xl font-black text-black">{totalHandoffsCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter & Search Bar - Compact padding */}
                <div class="bg-white border-3 sm:border-4 border-black rounded-2xl p-2.5 sm:p-3.5 shadow-[3px_3px_0px_0px_#000000] sm:shadow-[4px_4px_0px_0px_#000000] flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
                  {/* Search Field */}
                  <div class="relative w-full md:w-72">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 stroke-[2.5]" />
                    <input
                      type="text"
                      placeholder="Search title, tag, code or spot..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      class="w-full pl-8 pr-3 py-1.5 bg-yellow-50 border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black placeholder:text-slate-400"
                    />
                  </div>

                  {/* Category Pills */}
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

                  {/* Status Select */}
                  <div class="flex items-center gap-1.5 w-full md:w-auto justify-end">
                    <span class="text-[11px] font-black uppercase font-display text-black hidden sm:inline">Status:</span>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      class="bg-yellow-100 border-2 border-black text-xs font-black text-black rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-black shadow-[1.5px_1.5px_0px_0px_#000]"
                    >
                      <option value="all">All Statuses</option>
                      <option value="in_transit">In Transit</option>
                      <option value="hidden_waiting">Hidden & Waiting</option>
                    </select>
                  </div>
                </div>

                {/* Feed of Object Cards - Compact, dense scale so users see multiple cards simultaneously */}
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredThreads.map((thread) => {
                    const latestStep = thread.steps[thread.steps.length - 1];

                    return (
                      <div
                        key={thread.id}
                        onClick={() => setSelectedThreadId(thread.id)}
                        class="group bg-white hover:bg-amber-50 border-3 border-black rounded-2xl p-3.5 shadow-[4px_4px_0px_0px_#000000] hover:shadow-[6px_6px_0px_0px_#000000] transition-all duration-200 cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          {/* Image Thumbnail Header - Compact h-28 sm:h-32 */}
                          <div class="relative h-28 sm:h-32 rounded-xl overflow-hidden bg-yellow-100 mb-2.5 border-2 sm:border-3 border-black shadow-[2px_2px_0px_0px_#000]">
                            <img
                              src={thread.coverImage}
                              alt={thread.title}
                              referrerPolicy="no-referrer"
                              class="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                            />
                            <div class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-white border border-black text-[9px] font-black text-black shadow-[1px_1px_0px_0px_#000]">
                              {thread.code}
                            </div>
                            <div class="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-lg bg-yellow-300 text-black border border-black text-[9px] font-black uppercase shadow-[1px_1px_0px_0px_#000]">
                              {thread.category}
                            </div>
                          </div>

                          <div class="flex items-center justify-between gap-2 mb-1">
                            <span class="px-2 py-0.5 rounded-md bg-emerald-200 border border-black text-[9px] font-black text-black flex items-center gap-1 shadow-[1px_1px_0px_0px_#000]">
                              <span class={`w-1.5 h-1.5 rounded-full border border-black ${thread.currentStatus === 'hidden_waiting' ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-500'}`}></span>
                              {thread.currentStatus === 'hidden_waiting' ? 'Waiting' : 'In Transit'}
                            </span>
                            <span class="text-[10px] font-bold text-slate-600 truncate">
                              By {thread.creatorHandle}
                            </span>
                          </div>

                          <h3 class="text-sm font-black text-black font-display uppercase group-hover:underline leading-snug line-clamp-1">
                            {thread.title}
                          </h3>

                          <p class="text-[11px] text-slate-800 font-semibold line-clamp-2 my-1.5 italic bg-yellow-50 p-2 rounded-lg border border-black/20 leading-tight">
                            "{thread.description}"
                          </p>
                        </div>

                        {/* Card Stats & CTA Button */}
                        <div class="space-y-2 pt-2 border-t-2 border-black mt-1">
                          <div class="grid grid-cols-2 gap-1.5 text-[10px] font-extrabold text-black">
                            <div class="bg-yellow-100 p-1.5 rounded-lg border border-black">
                              <span class="block text-[8px] text-slate-600 font-black uppercase font-display leading-none mb-0.5">Trajectory</span>
                              <span class="text-black font-black truncate block">{thread.totalDistanceMiles} mi ({thread.steps.length} keepers)</span>
                            </div>

                            <div class="bg-yellow-100 p-1.5 rounded-lg border border-black">
                              <span class="block text-[8px] text-slate-600 font-black uppercase font-display leading-none mb-0.5">Latest Spot</span>
                              <span class="text-black font-black truncate block">📍 {latestStep?.locationName}</span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedThreadId(thread.id);
                            }}
                            class="w-full py-1.5 bg-yellow-300 group-hover:bg-yellow-400 text-black border-2 border-black rounded-lg text-[11px] font-black flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_#000] transition active:translate-x-0.5 active:translate-y-0.5"
                          >
                            <span>INSPECT SUBPAGE</span>
                            <ArrowRight class="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 2: 🗺️ MAP VIEW */}
            {activeTab === 'map' && (
              <CitywideMapView
                threads={threads}
                onSelectThread={(id) => setSelectedThreadId(id)}
                mapTileTheme={mapTileTheme}
                onChangeTheme={(t) => setMapTileTheme(t)}
              />
            )}

            {/* VIEW 3: 📜 LOG VIEW */}
            {activeTab === 'log' && (
              <CitywideLogView
                threads={threads}
                onSelectThread={(id) => setSelectedThreadId(id)}
              />
            )}
          </>
        )}
      </main>

      {/* MODALS */}
      {/* Log Found & Moved Modal */}
      <ActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        thread={activeThread}
        onSaveHandoff={handleSaveHandoff}
        mapTileTheme={mapTileTheme}
        onChangeMapTileTheme={(t) => setMapTileTheme(t)}
      />

      {/* Launch New Object Modal */}
      <NewThreadModal
        isOpen={isNewThreadModalOpen}
        onClose={() => setIsNewThreadModalOpen(false)}
        onCreateThread={handleCreateThread}
      />

      {/* Printable Tag & QR Share Modal */}
      <ShareTagModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        thread={activeThread}
      />

      {/* User Login / Profile Modal */}
      <UserProfileModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentUserHandle={currentUserHandle}
        onUpdateHandle={(h) => setCurrentUserHandle(h)}
      />
    </div>
  );
}
