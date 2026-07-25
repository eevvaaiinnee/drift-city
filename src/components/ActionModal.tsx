import React, { useState } from 'react';
import { DriftObjectThread, HandoffMethod, HandoffStep, MapTileTheme } from '../types';
import { POPULAR_NYC_LANDMARKS } from '../data/mockThreads';
import { calculateHaversineDistance } from '../utils/geoUtils';
import {
  X,
  MapPin,
  Camera,
  User,
  MessageSquare,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Upload,
  Compass,
  Coffee,
  Package
} from 'lucide-react';
import { MapView } from './MapView';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  thread: DriftObjectThread;
  onSaveHandoff: (newStep: Omit<HandoffStep, 'id' | 'stepNumber'>) => void;
  mapTileTheme: MapTileTheme;
  onChangeMapTileTheme: (theme: MapTileTheme) => void;
}

const SAMPLE_PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1496868834840-5f4c98840aaa?w=800&auto=format&fit=crop&q=80'
];

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  thread,
  onSaveHandoff,
  mapTileTheme,
  onChangeMapTileTheme
}) => {
  if (!isOpen) return null;

  const lastStep = thread.steps[thread.steps.length - 1];

  // Form State
  const [locationName, setLocationName] = useState('High Line at 30th St');
  const [neighborhood, setNeighborhood] = useState('Chelsea, NYC');
  const [lat, setLat] = useState(lastStep ? lastStep.lat + 0.008 : 40.7500);
  const [lng, setLng] = useState(lastStep ? lastStep.lng - 0.005 : -74.0000);
  const [finderName, setFinderName] = useState('Alex Rivers');
  const [finderHandle, setFinderHandle] = useState('@alex_drifts');
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_PHOTO_PRESETS[0]);
  const [note, setNote] = useState(
    'Found this drifting object sitting on a wooden bench! Moved it 0.5 miles west towards the waterfront.'
  );
  const [handoffMethod, setHandoffMethod] = useState<HandoffMethod>('hidden_drop');
  const [dropSecret, setDropSecret] = useState('Tucked behind the bronze park sculpture near 30th St entrance.');
  const [isPickerActive, setIsPickerActive] = useState(false);

  const handleLandmarkSelect = (landmarkName: string) => {
    const mark = POPULAR_NYC_LANDMARKS.find((m) => m.name === landmarkName);
    if (mark) {
      setLocationName(mark.name);
      setNeighborhood(mark.neighborhood);
      setLat(mark.lat);
      setLng(mark.lng);
    }
  };

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const distanceFromPrev = lastStep
      ? calculateHaversineDistance(lastStep.lat, lastStep.lng, lat, lng)
      : 0;

    onSaveHandoff({
      locationName,
      neighborhood,
      lat,
      lng,
      timestamp: new Date().toISOString(),
      finderName,
      finderHandle,
      finderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      photoUrl,
      note,
      handoffMethod,
      dropSecret: dropSecret.trim() || undefined,
      distanceFromPrevMiles: distanceFromPrev,
      weather: '76°F Clear Sky'
    });

    onClose();
  };

  return (
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div class="relative w-full max-w-3xl bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_#000000] overflow-hidden my-auto">
        {/* Header */}
        <div class="px-6 py-4 border-b-3 border-black flex items-center justify-between bg-yellow-300">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center text-black">
              <Sparkles class="w-5 h-5 fill-black stroke-[2]" />
            </div>
            <div>
              <h3 class="text-base font-black text-black leading-snug font-display uppercase tracking-tight">
                LOG "FOUND & MOVED" ACTION
              </h3>
              <p class="text-xs text-black font-extrabold">
                Thread: <span class="underline decoration-2">{thread.title}</span> ({thread.code})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            class="p-2 text-black bg-white hover:bg-red-300 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
          >
            <X class="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} class="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Location & Coordinates */}
          <div class="space-y-3">
            <label class="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5 font-display">
              <MapPin class="w-4 h-4 text-black stroke-[2.5]" />
              1. Where did you move this object?
            </label>

            {/* Quick Landmark Presets */}
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[11px] text-black font-extrabold mr-1">Quick NYC Landmarks:</span>
              {POPULAR_NYC_LANDMARKS.slice(0, 5).map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => handleLandmarkSelect(m.name)}
                  class={`px-2.5 py-1 rounded-xl text-xs font-black border-2 transition shadow-[2px_2px_0px_0px_#000] ${
                    locationName === m.name
                      ? 'bg-yellow-300 text-black border-black scale-105'
                      : 'bg-white text-black border-black hover:bg-yellow-100'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="text-[11px] text-black font-extrabold mb-1 block">Location / Spot Name</label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Washington Square Fountain"
                  class="w-full px-3 py-2 bg-yellow-50 border-2 border-black rounded-xl text-xs text-black font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label class="text-[11px] text-black font-extrabold mb-1 block">Neighborhood / District</label>
                <input
                  type="text"
                  required
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="e.g. Greenwich Village"
                  class="w-full px-3 py-2 bg-yellow-50 border-2 border-black rounded-xl text-xs text-black font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* Interactive Map Pin Selector Toggle */}
            <div class="border-3 border-black rounded-2xl overflow-hidden bg-amber-50 p-3 shadow-[3px_3px_0px_0px_#000]">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-black text-black flex items-center gap-1.5">
                  <Compass class="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  Map Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}
                </span>
                <button
                  type="button"
                  onClick={() => setIsPickerActive(!isPickerActive)}
                  class={`px-2.5 py-1 rounded-xl text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] transition ${
                    isPickerActive
                      ? 'bg-yellow-300 text-black'
                      : 'bg-white text-black hover:bg-yellow-100'
                  }`}
                >
                  {isPickerActive ? 'Done Pinning' : 'Tap Map to Adjust Pin'}
                </button>
              </div>

              <div class="h-44 w-full rounded-xl overflow-hidden border-2 border-black">
                <MapView
                  thread={thread}
                  selectedStepId={null}
                  onSelectStep={() => {}}
                  mapTileTheme={mapTileTheme}
                  onChangeTheme={onChangeMapTileTheme}
                  isPickerMode={isPickerActive}
                  pickerCoords={{ lat, lng }}
                  onPickerSelect={(newLat, newLng) => {
                    setLat(newLat);
                    setLng(newLng);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Step 2: Handoff Photo */}
          <div class="space-y-3">
            <label class="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5 font-display">
              <Camera class="w-4 h-4 text-black stroke-[2.5]" />
              2. Add Handoff Photo
            </label>

            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div class="sm:col-span-5 h-36 rounded-2xl overflow-hidden bg-yellow-100 border-3 border-black shadow-[3px_3px_0px_0px_#000] relative group">
                <img
                  src={photoUrl}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-yellow-300/80 font-black text-black opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2 text-center text-xs">
                  CURRENT PREVIEW
                </div>
              </div>

              <div class="sm:col-span-7 space-y-2">
                <p class="text-xs text-black font-extrabold">
                  Select a photo preset or upload your own:
                </p>

                {/* Sample Presets */}
                <div class="flex items-center gap-2 overflow-x-auto pb-1">
                  {SAMPLE_PHOTO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(preset)}
                      class={`w-12 h-12 rounded-xl overflow-hidden border-2 border-black shrink-0 transition ${
                        photoUrl === preset ? 'ring-4 ring-black shadow-[2px_2px_0px_0px_#000] scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt="" class="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>

                <label class="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-yellow-200 text-black text-xs font-black cursor-pointer transition border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <Upload class="w-3.5 h-3.5 stroke-[2.5]" />
                  Upload Custom File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomPhotoUpload}
                    class="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Step 3: Finder Details & Handoff Note */}
          <div class="space-y-3">
            <label class="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5 font-display">
              <MessageSquare class="w-4 h-4 text-black stroke-[2.5]" />
              3. Keeper Info & Story Note
            </label>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="text-[11px] text-black font-extrabold mb-1 block">Your Name / Alias</label>
                <input
                  type="text"
                  required
                  value={finderName}
                  onChange={(e) => setFinderName(e.target.value)}
                  class="w-full px-3 py-2 bg-yellow-50 border-2 border-black rounded-xl text-xs text-black font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label class="text-[11px] text-black font-extrabold mb-1 block">Your Social Handle</label>
                <input
                  type="text"
                  required
                  value={finderHandle}
                  onChange={(e) => setFinderHandle(e.target.value)}
                  class="w-full px-3 py-2 bg-yellow-50 border-2 border-black rounded-xl text-xs text-black font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div>
              <label class="text-[11px] text-black font-extrabold mb-1 block">Handoff Method</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'hidden_drop', label: 'Hidden Drop', icon: KeyRound },
                  { id: 'bench_leave', label: 'Bench Leave', icon: Package },
                  { id: 'coffee_shop', label: 'Coffee Shop', icon: Coffee },
                  { id: 'direct_pass', label: 'Direct Pass', icon: User }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setHandoffMethod(item.id as HandoffMethod)}
                      class={`p-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] transition ${
                        handoffMethod === item.id
                          ? 'bg-yellow-300 text-black scale-[1.02]'
                          : 'bg-white text-black hover:bg-yellow-100'
                      }`}
                    >
                      <Icon class="w-3.5 h-3.5 stroke-[2.5]" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label class="text-[11px] text-black font-extrabold mb-1 block">Finder Story / Note</label>
              <textarea
                rows={3}
                required
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Where did you find it? What did you do with it? Any memory attached?"
                class="w-full px-3 py-2 bg-yellow-50 border-2 border-black rounded-xl text-xs text-black font-semibold focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label class="text-[11px] text-black font-extrabold mb-1 flex items-center gap-1">
                <KeyRound class="w-3.5 h-3.5 text-black stroke-[2.5]" />
                Drop Secret Clue (Optional clue for the next stranger)
              </label>
              <input
                type="text"
                value={dropSecret}
                onChange={(e) => setDropSecret(e.target.value)}
                placeholder="e.g. Under the green park bench near 5th Ave..."
                class="w-full px-3 py-2 bg-yellow-50 border-2 border-black rounded-xl text-xs text-black font-semibold focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div class="pt-3 border-t-3 border-black flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              class="px-4 py-2 bg-white hover:bg-red-200 border-2 border-black text-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#000] transition"
            >
              CANCEL
            </button>

            <button
              type="submit"
              class="px-6 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black border-3 border-black rounded-xl text-xs font-black flex items-center gap-2 shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
            >
              <CheckCircle2 class="w-4 h-4 stroke-[2.5]" />
              PUBLISH HANDOFF & UPDATE TRAJECTORY
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
