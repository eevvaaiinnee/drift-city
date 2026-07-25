import React, { useState } from 'react';
import { DriftObjectThread, ObjectCategory } from '../types';
import { POPULAR_NYC_LANDMARKS } from '../data/mockThreads';
import { X, Plus, Sparkles, MapPin, Tag, Camera, FileText } from 'lucide-react';

interface NewThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateThread: (newThread: DriftObjectThread) => void;
}

export const NewThreadModal: React.FC<NewThreadModalProps> = ({
  isOpen,
  onClose,
  onCreateThread
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('NYC Pocket Sketchbook');
  const [category, setCategory] = useState<ObjectCategory>('art');
  const [description, setDescription] = useState(
    'A miniature sketchpad for strangers to draw a 1-minute sketch of whatever they see in NYC.'
  );
  const [originLandmark, setOriginLandmark] = useState(POPULAR_NYC_LANDMARKS[0].name);
  const [creatorName, setCreatorName] = useState('Sam Rivera');
  const [creatorHandle, setCreatorHandle] = useState('@sam_sketch_nyc');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80'
  );
  const [initialNote, setInitialNote] = useState(
    'Left on the wooden bench at Bryant Park Reading Room! Draw something nice and pass it along!'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedLandmark = POPULAR_NYC_LANDMARKS.find((m) => m.name === originLandmark) || POPULAR_NYC_LANDMARKS[0];
    const newCode = `DRIFT-NYC-${Math.floor(100 + Math.random() * 900)}`;

    const newThread: DriftObjectThread = {
      id: `thread-${Date.now()}`,
      code: newCode,
      title,
      category,
      description,
      createdAt: new Date().toISOString().split('T')[0],
      originLocation: selectedLandmark.name,
      originLat: selectedLandmark.lat,
      originLng: selectedLandmark.lng,
      currentStatus: 'hidden_waiting',
      coverImage,
      totalDistanceMiles: 0,
      totalKeepers: 1,
      activeDays: 1,
      tags: [title.replace(/\s+/g, ''), category, 'NewDrift'],
      creatorName,
      creatorHandle,
      steps: [
        {
          id: `step-init-${Date.now()}`,
          stepNumber: 1,
          locationName: selectedLandmark.name,
          neighborhood: selectedLandmark.neighborhood,
          lat: selectedLandmark.lat,
          lng: selectedLandmark.lng,
          timestamp: new Date().toISOString(),
          finderName: creatorName,
          finderHandle: creatorHandle,
          finderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          photoUrl: coverImage,
          note: initialNote,
          handoffMethod: 'bench_leave',
          distanceFromPrevMiles: 0,
          weather: '78°F Sunny'
        }
      ]
    };

    onCreateThread(newThread);
    onClose();
  };

  return (
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div class="relative w-full max-w-xl bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_#000000] overflow-hidden my-auto">
        {/* Header */}
        <div class="px-6 py-4 border-b-3 border-black flex items-center justify-between bg-yellow-300">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-white border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
              <Plus class="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h3 class="text-base font-black text-black font-display uppercase tracking-tight">
                LAUNCH A NEW DRIFTING OBJECT
              </h3>
              <p class="text-xs text-black font-extrabold">Start a physical object's trajectory across NYC</p>
            </div>
          </div>

          <button
            onClick={onClose}
            class="p-2 text-black bg-white hover:bg-red-300 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
          >
            <X class="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label class="text-xs font-black text-black mb-1 block uppercase font-display">Object Name / Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Downtown Film Camera, Yellow Rubber Duck"
              class="w-full px-3 py-2 bg-yellow-50 border-2 border-black rounded-xl text-xs text-black font-semibold focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-black text-black mb-1 block uppercase font-display">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ObjectCategory)}
                class="w-full px-3 py-2 bg-yellow-50 border-2 border-black rounded-xl text-xs text-black font-semibold focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="toy">Toy / Mascot</option>
                <option value="camera">Camera / Film</option>
                <option value="journal">Journal / Notebook</option>
                <option value="art">Art Piece / Sketch</option>
                <option value="keepsake">Keepsake / Coin</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-black text-black mb-1 block uppercase font-display">Origin NYC Spot</label>
              <select
                value={originLandmark}
                onChange={(e) => setOriginLandmark(e.target.value)}
                class="w-full px-3 py-2 bg-yellow-50 border-2 border-black rounded-xl text-xs text-black font-semibold focus:outline-none focus:ring-2 focus:ring-black"
              >
                {POPULAR_NYC_LANDMARKS.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.neighborhood})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label class="text-xs font-black text-black mb-1 block uppercase font-display">Object Description & Goal</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this object? What should finders do with it?"
              class="w-full px-3 py-2 bg-yellow-50 border-2 border-black rounded-xl text-xs text-black font-semibold focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-black text-black mb-1 block uppercase font-display">Creator Name</label>
              <input
                type="text"
                required
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                class="w-full px-3 py-2 bg-yellow-50 border-2 border-black rounded-xl text-xs text-black font-semibold focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label class="text-xs font-black text-black mb-1 block uppercase font-display">Creator Handle</label>
              <input
                type="text"
                required
                value={creatorHandle}
                onChange={(e) => setCreatorHandle(e.target.value)}
                class="w-full px-3 py-2 bg-yellow-50 border-2 border-black rounded-xl text-xs text-black font-semibold focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label class="text-xs font-black text-black mb-1 block uppercase font-display">Initial Drop Note</label>
            <input
              type="text"
              required
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              placeholder="Where are you putting it first?"
              class="w-full px-3 py-2 bg-yellow-50 border-2 border-black rounded-xl text-xs text-black font-semibold focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Submit */}
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
              class="px-6 py-2 bg-yellow-300 hover:bg-yellow-400 text-black border-3 border-black rounded-xl text-xs font-black flex items-center gap-1.5 shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
            >
              <Sparkles class="w-4 h-4 fill-black stroke-[2]" />
              LAUNCH THREAD
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
