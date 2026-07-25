import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { DriftObjectThread, MapTileTheme } from '../types';
import { Layers, Maximize2, Compass, ArrowRight, Eye } from 'lucide-react';

interface CitywideMapViewProps {
  threads: DriftObjectThread[];
  onSelectThread: (threadId: string) => void;
  mapTileTheme: MapTileTheme;
  onChangeTheme: (theme: MapTileTheme) => void;
}

const TILE_URLS: Record<MapTileTheme, { url: string; attribution: string }> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
  },
  outdoors: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }
};

export const CitywideMapView: React.FC<CitywideMapViewProps> = ({
  threads,
  onSelectThread,
  mapTileTheme,
  onChangeTheme
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // NYC Center default
    const map = L.map(mapContainerRef.current, {
      center: [40.7308, -73.985],
      zoom: 12,
      zoomControl: false
    });

    const tileInfo = TILE_URLS[mapTileTheme];
    const tileLayer = L.tileLayer(tileInfo.url, {
      attribution: tileInfo.attribution,
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    markersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Theme
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const tileInfo = TILE_URLS[mapTileTheme];
    const newTileLayer = L.tileLayer(tileInfo.url, {
      attribution: tileInfo.attribution,
      maxZoom: 19
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
  }, [mapTileTheme]);

  // Render All Threads Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const allCoords: [number, number][] = [];

    threads.forEach((thread) => {
      if (thread.steps.length === 0) return;

      const latestStep = thread.steps[thread.steps.length - 1];
      allCoords.push([latestStep.lat, latestStep.lng]);

      // Draw faint trajectory line across past points if available
      if (thread.steps.length > 1) {
        const points: [number, number][] = thread.steps.map((s) => [s.lat, s.lng]);
        L.polyline(points, {
          color: '#000000',
          weight: 4,
          opacity: 0.6,
          dashArray: '6, 6'
        }).addTo(markersGroup);
      }

      // Category color mappings for pin badge
      const categoryColors: Record<string, string> = {
        toy: 'bg-yellow-300 text-black',
        camera: 'bg-cyan-300 text-black',
        journal: 'bg-emerald-300 text-black',
        art: 'bg-pink-300 text-black',
        keepsake: 'bg-amber-300 text-black',
        gadget: 'bg-purple-300 text-black'
      };

      const bgStyle = categoryColors[thread.category] || 'bg-yellow-300 text-black';

      const pinHtml = `
        <div class="relative group cursor-pointer filter drop-shadow-md">
          <div class="w-12 h-12 rounded-2xl ${bgStyle} font-black flex flex-col items-center justify-center border-3 border-black shadow-[3px_3px_0px_0px_#000000] transform transition duration-200 group-hover:scale-110">
            <span class="text-[9px] uppercase font-black tracking-tighter leading-none">${thread.code.replace('DRIFT-NYC-', '#')}</span>
            <span class="text-[10px] font-extrabold truncate max-w-[42px]">${thread.category.toUpperCase()}</span>
          </div>
          <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: pinHtml,
        className: 'citywide-object-marker',
        iconSize: [48, 48],
        iconAnchor: [24, 48]
      });

      const marker = L.marker([latestStep.lat, latestStep.lng], { icon: customIcon }).addTo(markersGroup);

      // Popup html - Scaled down & compact for mobile and desktop map clarity
      const popupHtml = `
        <div class="p-0.5 max-w-[210px] font-sans text-slate-900">
          <div class="relative h-20 rounded-xl overflow-hidden mb-1.5 bg-yellow-100 border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
            <img src="${thread.coverImage}" alt="${thread.title}" class="w-full h-full object-cover" />
            <div class="absolute top-1 left-1 bg-white/95 border border-black px-1.5 py-0.2 rounded text-[9px] font-black text-black">
              ${thread.code}
            </div>
            <div class="absolute bottom-1 right-1 bg-yellow-300 border border-black px-1.5 py-0.2 rounded text-[9px] font-black text-black uppercase">
              ${thread.category}
            </div>
          </div>

          <h4 class="font-black text-xs sm:text-sm text-black leading-tight mb-1 font-display uppercase truncate">${thread.title}</h4>
          
          <div class="flex items-center justify-between bg-yellow-50 p-1.5 rounded-lg border border-black text-[10px] font-extrabold mb-2 gap-1">
            <span class="text-black font-black">${thread.totalDistanceMiles} mi</span>
            <span class="text-black font-black truncate max-w-[110px]">📍 ${latestStep.locationName}</span>
          </div>

          <button
            id="btn-inspect-${thread.id}"
            class="w-full py-1.5 bg-yellow-300 hover:bg-yellow-400 text-black border border-black rounded-lg text-[11px] font-black flex items-center justify-center gap-1 shadow-[1.5px_1.5px_0px_0px_#000] transition active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            <span>INSPECT OBJECT</span>
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'custom-leaflet-popup',
        closeButton: true,
        minWidth: 190,
        maxWidth: 220
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${thread.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectThread(thread.id);
          };
        }
      });
    });

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  }, [threads, mapTileTheme]);

  const handleFitAll = () => {
    if (!mapInstanceRef.current || threads.length === 0) return;
    const allCoords: [number, number][] = [];
    threads.forEach((t) => {
      t.steps.forEach((s) => allCoords.push([s.lat, s.lng]));
    });
    if (allCoords.length > 0) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(allCoords), { padding: [50, 50] });
    }
  };

  return (
    <div class="relative w-full h-[calc(100vh-180px)] min-h-[380px] xs:min-h-[440px] sm:min-h-[500px] rounded-3xl overflow-hidden border-4 border-black bg-yellow-100 shadow-[6px_6px_0px_0px_#000000] sm:shadow-[8px_8px_0px_0px_#000000]">
      <div ref={mapContainerRef} class="w-full h-full z-10" />

      {/* Floating Top Overlay Area (Left-aligned top-left stack) */}
      <div class="absolute top-2 sm:top-3 left-2 sm:left-3 z-20 flex flex-col items-start gap-1.5 sm:gap-2 pointer-events-none max-w-[calc(100%-16px)]">
        
        {/* Floating Header Badge */}
        <div class="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-3.5 sm:py-2 shadow-[3px_3px_0px_0px_#000000] flex items-center gap-2 sm:gap-2.5 pointer-events-auto">
          <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-yellow-300 border-2 border-black flex items-center justify-center text-black font-black shrink-0">
            <Compass class="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] animate-spin-slow" />
          </div>
          <div>
            <h2 class="text-xs sm:text-sm font-black text-black font-display uppercase tracking-tight leading-tight">
              NYC DRIFTING OBJECTS MAP
            </h2>
            <p class="text-[9px] sm:text-[10px] font-bold text-slate-700 leading-none mt-0.5">
              {threads.length} Objects active across NYC
            </p>
          </div>
        </div>

        {/* Map Style Controls Toolbar (Stacked directly beneath Header Badge in Top-Left) */}
        <div class="flex flex-wrap items-center gap-1.5 pointer-events-auto">
          {/* Theme Selector */}
          <div class="bg-white border-2 sm:border-3 border-black rounded-xl p-0.5 sm:p-1 shadow-[2px_2px_0px_0px_#000000] flex items-center gap-0.5 sm:gap-1">
            <Layers class="w-3.5 h-3.5 text-black ml-1 hidden xs:inline" />
            <button
              onClick={() => onChangeTheme('dark')}
              class={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-black rounded-lg transition ${
                mapTileTheme === 'dark'
                  ? 'bg-yellow-300 text-black border-2 border-black shadow-[1px_1px_0px_0px_#000000]'
                  : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => onChangeTheme('light')}
              class={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-black rounded-lg transition ${
                mapTileTheme === 'light'
                  ? 'bg-yellow-300 text-black border-2 border-black shadow-[1px_1px_0px_0px_#000000]'
                  : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => onChangeTheme('outdoors')}
              class={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-black rounded-lg transition ${
                mapTileTheme === 'outdoors'
                  ? 'bg-yellow-300 text-black border-2 border-black shadow-[1px_1px_0px_0px_#000000]'
                  : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              Street
            </button>
          </div>

          {/* Fit Bounds Button */}
          <button
            onClick={handleFitAll}
            class="bg-white hover:bg-yellow-300 text-black border-2 sm:border-3 border-black px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center gap-1 text-[10px] sm:text-xs font-black"
          >
            <Maximize2 class="w-3.5 h-3.5 stroke-[2.5]" />
            <span class="font-display uppercase">Fit All</span>
          </button>
        </div>
      </div>

      {/* Floating Bottom Instructions Bar */}
      <div class="absolute bottom-2 sm:bottom-4 left-2 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-20 bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-[3px_3px_0px_0px_#000000] text-[10px] sm:text-xs font-black text-black flex items-center justify-center gap-1.5 text-center pointer-events-auto max-w-md mx-auto">
        <Eye class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black stroke-[2.5] shrink-0" />
        <span class="truncate">Tap any pin to view stats & open object subpage</span>
      </div>
    </div>
  );
};
