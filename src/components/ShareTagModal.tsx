import React, { useState } from 'react';
import { DriftObjectThread } from '../types';
import { X, QrCode, Printer, Copy, Check, Sparkles, Tag, ShieldCheck } from 'lucide-react';

interface ShareTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  thread: DriftObjectThread;
}

export const ShareTagModal: React.FC<ShareTagModalProps> = ({
  isOpen,
  onClose,
  thread
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}?thread=${thread.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div class="relative w-full max-w-lg bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_#000000] overflow-hidden my-auto">
        {/* Header */}
        <div class="px-6 py-4 border-b-3 border-black flex items-center justify-between bg-yellow-300">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-white border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
              <Tag class="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 class="text-base font-black text-black font-display uppercase tracking-tight">
                PRINTABLE OBJECT TAG & QR
              </h3>
              <p class="text-xs text-black font-extrabold">Attach this tag to your physical object</p>
            </div>
          </div>

          <button
            onClick={onClose}
            class="p-2 text-black bg-white hover:bg-red-300 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
          >
            <X class="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <div class="p-6 space-y-6">
          {/* Printable Physical Tag Card Preview */}
          <div class="printable-tag p-6 bg-yellow-100 border-4 border-dashed border-black rounded-3xl shadow-[6px_6px_0px_0px_#000000] text-black relative space-y-4">
            <div class="flex items-start justify-between">
              <div>
                <span class="px-3 py-1 rounded-xl bg-yellow-300 text-black text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  DRIFT CITY TAG
                </span>
                <h4 class="text-lg font-black text-black mt-3 leading-tight font-display uppercase">
                  {thread.title}
                </h4>
                <p class="text-xs text-black font-mono font-black mt-1 bg-white px-2 py-0.5 rounded-md border border-black inline-block">
                  PASS CODE: {thread.code}
                </p>
              </div>

              {/* Stylized QR Code SVG */}
              <div class="w-20 h-20 bg-yellow-300 rounded-2xl p-2 flex items-center justify-center shrink-0 border-3 border-black shadow-[3px_3px_0px_0px_#000]">
                <QrCode class="w-full h-full text-black stroke-[2.5]" />
              </div>
            </div>

            <p class="text-xs text-black leading-relaxed italic border-t-2 border-black pt-3 font-semibold">
              "{thread.description}"
            </p>

            <div class="bg-white p-3 rounded-2xl border-2 border-black text-[11px] text-black space-y-1 shadow-[2px_2px_0px_0px_#000]">
              <div class="flex items-center gap-1.5 font-black text-black">
                <ShieldCheck class="w-4 h-4 text-black stroke-[2.5]" />
                FINDER INSTRUCTIONS:
              </div>
              <ol class="list-decimal list-inside text-black font-bold space-y-0.5">
                <li>Visit <strong>driftcity.app</strong> on your phone</li>
                <li>Enter code <strong>{thread.code}</strong></li>
                <li>Log where you found & moved this object!</li>
              </ol>
            </div>
          </div>

          {/* Action Buttons */}
          <div class="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={handleCopyLink}
              class="flex-1 px-4 py-2.5 bg-white hover:bg-yellow-100 border-2 border-black rounded-xl text-xs font-black text-black flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
            >
              {copied ? <Check class="w-4 h-4 text-emerald-600 stroke-[3]" /> : <Copy class="w-4 h-4 stroke-[2.5]" />}
              {copied ? 'LINK COPIED!' : 'COPY THREAD LINK'}
            </button>

            <button
              onClick={handlePrint}
              class="flex-1 px-4 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black border-3 border-black rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
            >
              <Printer class="w-4 h-4 stroke-[2.5]" />
              PRINT PHYSICAL TAG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
