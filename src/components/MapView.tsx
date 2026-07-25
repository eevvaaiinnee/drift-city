import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { DriftObjectThread, MapTileTheme } from '../types';
import { Compass, Maximize2, Layers, MapPin } from 'lucide-react';

interface MapViewProps {
  thread: DriftObjectThread;
  selectedStepId: string | null;
  onSelectStep: (stepId: string) => void;
  mapTileTheme: MapTileTheme;
  onChangeTheme: (theme: MapTileTheme) => void;
  isPickerMode?: boolean;
  pickerCoords?: { lat: number; lng: number } | null;
  onPickerSelect?: (lat: number, lng: number) => void;
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

export const MapView: React.FC<MapViewProps> = ({
  thread,
  selectedStepId,
  onSelectStep,
  mapTileTheme,
  onChangeTheme,
  isPickerMode = false,
  pickerCoords = null,
  onPickerSelect
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const lineLayerRef = useRef<L.Polyline | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // 1. Initialize Map instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default NYC center
    const defaultLat = thread.steps[0]?.lat || 40.7536;
    const defaultLng = thread.steps[0]?.lng || -73.9832;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 13,
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

  // 2. Update Map Tile Theme
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

  // 3. Render Trajectory Line and Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();
    if (lineLayerRef.current) {
      map.removeLayer(lineLayerRef.current);
      lineLayerRef.current = null;
    }

    if (thread.steps.length === 0) return;

    const latLngs: [number, number][] = thread.steps.map((step) => [step.lat, step.lng]);

    // Draw Polyline for Trajectory
    const polyline = L.polyline(latLngs, {
      color: '#000000', // Solid black outline
      weight: 8,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    const polylineInner = L.polyline(latLngs, {
      color: '#FFDD00', // Electric yellow core
      weight: 4,
      opacity: 1,
      dashArray: '8, 8',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    lineLayerRef.current = polylineInner;

    // Add Markers for each step
    thread.steps.forEach((step, index) => {
      const isLatest = index === thread.steps.length - 1;
      const isSelected = selectedStepId === step.id;
      const isOrigin = index === 0;

      // Neo-brutalist Graphic Marker Icon
      let markerHtml = '';
      if (isLatest) {
        markerHtml = `
          <div class="relative group cursor-pointer">
            <div class="w-10 h-10 rounded-2xl bg-yellow-300 text-black font-extrabold flex items-center justify-center border-3 border-black shadow-[3px_3px_0px_0px_#000000] transform transition duration-200 hover:scale-110 ${isSelected ? 'ring-4 ring-black bg-yellow-400' : ''}">
              <span class="text-[10px] font-black tracking-tighter uppercase">LATEST</span>
            </div>
          </div>
        `;
      } else if (isOrigin) {
        markerHtml = `
          <div class="relative group cursor-pointer">
            <div class="w-8 h-8 rounded-xl bg-emerald-300 text-black font-extrabold flex items-center justify-center border-3 border-black shadow-[2px_2px_0px_0px_#000000] transform transition duration-200 hover:scale-110 ${isSelected ? 'ring-4 ring-black bg-emerald-400' : ''}">
              <span class="text-xs font-black">1</span>
            </div>
          </div>
        `;
      } else {
        markerHtml = `
          <div class="relative group cursor-pointer">
            <div class="w-8 h-8 rounded-xl bg-pink-200 text-black font-bold border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000] transform transition duration-200 hover:scale-110 ${isSelected ? 'ring-2 ring-black bg-pink-400' : ''}">
              <span class="text-xs font-extrabold">${step.stepNumber}</span>
            </div>
          </div>
        `;
      }

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-drift-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([step.lat, step.lng], { icon: customIcon }).addTo(markersGroup);

      // Popup content
      const popupHtml = `
        <div class="p-1 max-w-xs font-sans text-slate-900">
          <div class="relative h-28 rounded-xl overflow-hidden mb-2 bg-yellow-100 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <img src="${step.photoUrl}" alt="${step.locationName}" class="w-full h-full object-cover" />
            <div class="absolute top-1 right-1 bg-yellow-300 border-2 border-black px-2 py-0.5 rounded-lg text-[10px] font-black text-black">
              STEP #${step.stepNumber}
            </div>
          </div>
          <h4 class="font-extrabold text-sm text-black leading-tight mb-0.5">${step.locationName}</h4>
          <p class="text-xs text-slate-600 mb-1.5 font-semibold">${step.neighborhood}</p>
          <p class="text-xs text-slate-800 line-clamp-2 italic mb-2 bg-amber-50 p-1.5 rounded-lg border border-black/20">"${step.note}"</p>
          <div class="flex items-center justify-between text-[11px] border-t-2 border-black pt-1.5 font-bold">
            <span>By <strong class="text-black">${step.finderHandle}</strong></span>
            <span class="text-black bg-yellow-300 px-1.5 py-0.5 rounded border border-black">Tap to inspect</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'custom-leaflet-popup',
        closeButton: false
      });

      marker.on('click', () => {
        onSelectStep(step.id);
      });
    });

    // Auto Fit Bounds to include trajectory
    if (latLngs.length > 0 && !isPickerMode) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [thread, mapTileTheme]);

  // 4. Center map when selectedStepId changes
  useEffect(() => {
    if (!selectedStepId || !mapInstanceRef.current) return;
    const step = thread.steps.find((s) => s.id === selectedStepId);
    if (step) {
      mapInstanceRef.current.flyTo([step.lat, step.lng], 15, {
        duration: 1.2
      });
    }
  }, [selectedStepId, thread]);

  // 5. Handle Location Picker Mode for "Found & Moved"
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (isPickerMode) {
      const handleMapClick = (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (onPickerSelect) {
          onPickerSelect(lat, lng);
        }
      };

      map.on('click', handleMapClick);

      return () => {
        map.off('click', handleMapClick);
      };
    }
  }, [isPickerMode, onPickerSelect]);

  // Update Picker Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (isPickerMode && pickerCoords) {
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLatLng([pickerCoords.lat, pickerCoords.lng]);
      } else {
        const pinHtml = `
          <div class="relative">
            <div class="w-10 h-10 -ml-5 -mt-10 text-amber-400 drop-shadow-lg animate-bounce">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>
        `;
        const pinIcon = L.divIcon({
          html: pinHtml,
          className: 'picker-pin',
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        });

        pickerMarkerRef.current = L.marker([pickerCoords.lat, pickerCoords.lng], {
          icon: pinIcon
        }).addTo(map);
      }
    } else if (pickerMarkerRef.current) {
      map.removeLayer(pickerMarkerRef.current);
      pickerMarkerRef.current = null;
    }
  }, [isPickerMode, pickerCoords]);

  const handleFitBounds = () => {
    if (!mapInstanceRef.current || thread.steps.length === 0) return;
    const bounds = L.latLngBounds(thread.steps.map((s) => [s.lat, s.lng]));
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  return (
    <div class="relative w-full h-full min-h-[300px] xs:min-h-[360px] sm:min-h-[440px] rounded-3xl overflow-hidden border-4 border-black bg-yellow-100 shadow-[6px_6px_0px_0px_#000000] group">
      <div ref={mapContainerRef} class="w-full h-full z-10" />

      {/* Top Floating Controls Container (Top-left stack) */}
      <div class="absolute top-2 sm:top-3 left-2 sm:left-3 z-20 flex flex-col items-start gap-1.5 sm:gap-2 pointer-events-none max-w-[calc(100%-16px)]">
        
        {/* Picker Helper Banner */}
        {isPickerMode && (
          <div class="bg-yellow-300 text-black px-2.5 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_#000000] font-black text-[10px] sm:text-xs flex items-center gap-1.5 border-2 border-black animate-bounce pointer-events-auto">
            <MapPin class="w-3.5 h-3.5" />
            <span>TAP MAP TO PLACE DROP PIN</span>
          </div>
        )}

        {/* Floating Map Controls Toolbar (Left-aligned top-left) */}
        <div class="flex flex-wrap items-center gap-1.5 pointer-events-auto">
          {/* Layer Theme Selector */}
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
            onClick={handleFitBounds}
            title="Fit full trajectory"
            class="bg-white hover:bg-yellow-300 text-black border-2 sm:border-3 border-black px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center gap-1 text-[10px] sm:text-xs font-black"
          >
            <Maximize2 class="w-3.5 h-3.5 stroke-[2.5]" />
            <span class="font-display uppercase">Fit Trajectory</span>
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div class="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-20 bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl px-2.5 sm:px-3 py-1 sm:py-2 text-[10px] sm:text-xs text-black font-extrabold flex items-center gap-2.5 sm:gap-4 shadow-[3px_3px_0px_0px_#000000] pointer-events-auto">
        <div class="flex items-center gap-1">
          <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-md bg-emerald-400 border border-black inline-block"></span>
          <span class="text-[9px] sm:text-[11px] font-bold text-black">1. Origin</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-md bg-pink-300 border border-black inline-block"></span>
          <span class="text-[9px] sm:text-[11px] font-bold text-black">Handoff Node</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-md bg-yellow-300 border border-black inline-block"></span>
          <span class="text-[9px] sm:text-[11px] font-black text-black">Latest</span>
        </div>
      </div>
    </div>
  );
};
