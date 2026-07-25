import React, { useState } from 'react';
import { User, X, LogIn, UserPlus, Check, Award, Compass, MapPin, ShieldCheck } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserHandle: string;
  onUpdateHandle: (newHandle: string) => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  currentUserHandle,
  onUpdateHandle
}: UserProfileModalProps) {
  const [mode, setMode] = useState<'profile' | 'login' | 'signup'>('profile');
  const [handleInput, setHandleInput] = useState(currentUserHandle);
  const [emailInput, setEmailInput] = useState('stranger.nyc@driftcity.org');
  const [passwordInput, setPasswordInput] = useState('••••••••');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (handleInput.trim()) {
      const formatted = handleInput.trim().startsWith('@') ? handleInput.trim() : `@${handleInput.trim()}`;
      onUpdateHandle(formatted);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      setMode('profile');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_#000000] font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 bg-yellow-100 hover:bg-yellow-300 border-2 border-black rounded-xl flex items-center justify-center text-black font-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
        >
          <X className="w-5 h-5 stroke-[3]" />
        </button>

        {/* Header Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b-2 border-black pb-4">
          <div className="w-10 h-10 rounded-2xl bg-yellow-300 border-3 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000] shrink-0">
            <User className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-black text-xl text-black font-display uppercase tracking-tight">
              Drifter Profile & Account
            </h3>
            <p className="text-xs font-bold text-slate-600">
              {mode === 'profile' ? 'Active NYC Physical Explorer' : mode === 'login' ? 'Sign in to your account' : 'Register new stranger ID'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-yellow-100 border-2 border-black rounded-2xl mb-5 text-xs font-black">
          <button
            onClick={() => setMode('profile')}
            className={`py-2 rounded-xl transition font-display uppercase ${
              mode === 'profile' ? 'bg-yellow-300 text-black border-2 border-black shadow-[1px_1px_0px_0px_#000]' : 'text-slate-700 hover:text-black'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setMode('login')}
            className={`py-2 rounded-xl transition font-display uppercase ${
              mode === 'login' ? 'bg-yellow-300 text-black border-2 border-black shadow-[1px_1px_0px_0px_#000]' : 'text-slate-700 hover:text-black'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`py-2 rounded-xl transition font-display uppercase ${
              mode === 'signup' ? 'bg-yellow-300 text-black border-2 border-black shadow-[1px_1px_0px_0px_#000]' : 'text-slate-700 hover:text-black'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Tab Content: PROFILE */}
        {mode === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="bg-yellow-50 border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_0px_#000]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-yellow-300 border-3 border-black flex items-center justify-center text-2xl font-black shadow-[2px_2px_0px_0px_#000]">
                  🗽
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-lg text-black font-display uppercase">{currentUserHandle}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-lg bg-emerald-300 border border-black text-[10px] font-black text-black uppercase">
                    Verified NYC Drifter
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-black/20">
                <label className="block text-xs font-black uppercase font-display text-black">
                  Explorer Handle / Alias
                </label>
                <input
                  type="text"
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  placeholder="@your_alias"
                  required
                  className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-black text-black focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0px_0px_#000]"
                />
              </div>
            </div>

            {/* Quick Stats Badges */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white border-2 border-black p-2.5 rounded-2xl shadow-[2px_2px_0px_0px_#000]">
                <span className="block text-[10px] font-black uppercase text-slate-500 font-display">Drops Found</span>
                <span className="text-base font-black text-black">7 drops</span>
              </div>
              <div className="bg-white border-2 border-black p-2.5 rounded-2xl shadow-[2px_2px_0px_0px_#000]">
                <span className="block text-[10px] font-black uppercase text-slate-500 font-display">Launched</span>
                <span className="text-base font-black text-black">3 items</span>
              </div>
              <div className="bg-white border-2 border-black p-2.5 rounded-2xl shadow-[2px_2px_0px_0px_#000]">
                <span className="block text-[10px] font-black uppercase text-slate-500 font-display">Distance</span>
                <span className="text-base font-black text-black">14.2 mi</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-yellow-300 hover:bg-yellow-400 text-black border-3 border-black rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition uppercase font-display"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 stroke-[3] text-emerald-700" />
                  <span>Profile Saved!</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </form>
        )}

        {/* Tab Content: LOG IN */}
        {mode === 'login' && (
          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            <div>
              <label className="block text-xs font-black uppercase font-display text-black mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="w-full px-3 py-2 bg-yellow-50 border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0px_0px_#000]"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase font-display text-black mb-1">
                Passcode / Secret
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="w-full px-3 py-2 bg-yellow-50 border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0px_0px_#000]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-yellow-300 hover:bg-yellow-400 text-black border-3 border-black rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition uppercase font-display"
            >
              <LogIn className="w-4 h-4 stroke-[3]" />
              <span>Log In To Drift City</span>
            </button>
          </form>
        )}

        {/* Tab Content: SIGN UP */}
        {mode === 'signup' && (
          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            <div>
              <label className="block text-xs font-black uppercase font-display text-black mb-1">
                Choose Explorer Handle
              </label>
              <input
                type="text"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                placeholder="@stranger_nyc"
                required
                className="w-full px-3 py-2 bg-yellow-50 border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0px_0px_#000]"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase font-display text-black mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="w-full px-3 py-2 bg-yellow-50 border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0px_0px_#000]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-yellow-300 hover:bg-yellow-400 text-black border-3 border-black rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition uppercase font-display"
            >
              <UserPlus className="w-4 h-4 stroke-[3]" />
              <span>Create Stranger Account</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
