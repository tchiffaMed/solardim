'use client';

import { useEffect, useRef } from 'react';
import { NIGER_STATIONS } from '@/lib/data';
import type { NigerStation } from '@/types';
import type { Location } from '@/types';

interface Props {
  onSelectLocation: (station: NigerStation) => void;
  selectedLocation: Location | null;
}

export default function MapLeaflet({ onSelectLocation, selectedLocation }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Guard strict : on ne crée la map qu'une seule fois
    if (initializedRef.current) return;
    if (!containerRef.current) return;

    // Vérifier si Leaflet a déjà initialisé ce container
    if ((containerRef.current as any)._leaflet_id) {
      // Container déjà utilisé — nettoyer avant de réinitialiser
      const oldMap = (containerRef.current as any)._leaflet_map;
      if (oldMap) { try { oldMap.remove(); } catch (_) {} }
      delete (containerRef.current as any)._leaflet_id;
    }

    initializedRef.current = true;

    import('leaflet').then(L => {
      if (!containerRef.current) return;
      // Double-vérification après l'import async
      if ((containerRef.current as any)._leaflet_id) return;

      const map = L.map(containerRef.current, {
        center: [16.5, 8.0],
        zoom: 6,
        zoomControl: true,
        preferCanvas: true,
      });

      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Icône station standard
      const stationIcon = L.divIcon({
        html: `<div style="
          width:30px;height:30px;border-radius:50%;
          background:linear-gradient(135deg,#F59E0B,#D97706);
          border:2.5px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.25);
          display:flex;align-items:center;justify-content:center;
          font-size:13px;cursor:pointer;
        ">☀</div>`,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      // Contour Niger (simplifié)
      L.rectangle(
        [[11.5, 0.16], [23.5, 15.96]],
        { color: '#D97706', weight: 1.5, fill: false, dashArray: '6,4' }
      ).addTo(map);

      // Marqueurs stations
      NIGER_STATIONS.forEach(station => {
        const marker = L.marker([station.lat, station.lng], { icon: stationIcon }).addTo(map);

        marker.bindPopup(`
          <div style="font-family:system-ui,sans-serif;min-width:200px;padding:2px 0;">
            <div style="font-weight:700;font-size:14px;color:#1C1917;margin-bottom:6px;">📍 ${station.ville}</div>
            <div style="font-size:12px;color:#78716C;line-height:1.9;">
              <div>Région : <strong>${station.region}</strong></div>
              <div>Irr. moy. : <strong style="color:#D97706">${station.irrAnnuelle} kWh/m²/j</strong></div>
              <div>Irr. déf. : <strong style="color:#DC2626">${station.irrDefavorable} kWh/m²/j</strong></div>
              <div>Inclinaison opt. : <strong>${station.inclinaisonOpt}°</strong></div>
            </div>
            <button
              onclick="window.__solarSelectStation('${station.ville}')"
              style="margin-top:10px;width:100%;background:linear-gradient(135deg,#F59E0B,#D97706);
                     color:white;border:none;border-radius:8px;padding:7px 12px;
                     font-size:12px;font-weight:600;cursor:pointer;">
              ✓ Sélectionner ce site
            </button>
          </div>
        `);

        marker.on('click', () => {
          onSelectLocation(station);
          map.setView([station.lat, station.lng], 8, { animate: true });
        });
      });

      // Clic libre sur la carte
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        let nearest = NIGER_STATIONS[0];
        let bestDist = Infinity;
        NIGER_STATIONS.forEach(s => {
          const d = Math.sqrt((s.lat - lat) ** 2 + (s.lng - lng) ** 2);
          if (d < bestDist) { bestDist = d; nearest = s; }
        });
        onSelectLocation(nearest);
      });

      // Marqueur sélection initiale
      if (selectedLocation) {
        markerRef.current = L.circleMarker(
          [selectedLocation.lat, selectedLocation.lng],
          { radius: 14, color: '#16A34A', fillColor: '#16A34A', fillOpacity: 0.25, weight: 2 }
        ).addTo(map);
      }

      // Callback global pour les boutons popup
      (window as any).__solarSelectStation = (ville: string) => {
        const station = NIGER_STATIONS.find(s => s.ville === ville);
        if (station) onSelectLocation(station);
      };
    });

    // Cleanup
    return () => {
      initializedRef.current = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (_) {}
        mapInstanceRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mise à jour du marqueur sélection
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;
    import('leaflet').then(L => {
      if (!mapInstanceRef.current) return;
      if (markerRef.current) {
        try { markerRef.current.remove(); } catch (_) {}
      }
      markerRef.current = L.circleMarker(
        [selectedLocation.lat, selectedLocation.lng],
        { radius: 16, color: '#16A34A', fillColor: '#16A34A', fillOpacity: 0.2, weight: 2.5 }
      ).addTo(mapInstanceRef.current);
    });
  }, [selectedLocation]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-[380px] w-full rounded-2xl overflow-hidden"
        style={{ zIndex: 0 }}
      />
      {/* Légende */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-xl border border-earth-100 shadow-md p-3 text-xs space-y-1.5 z-[1000] pointer-events-none">
        <div className="font-semibold text-earth-700 mb-1">Légende</div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-solar-400 flex-shrink-0" />
          <span className="text-earth-500">Station météo Niger</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-earth-500">Site sélectionné</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-dashed border-solar-500 flex-shrink-0" />
          <span className="text-earth-500">Frontière Niger (approx.)</span>
        </div>
      </div>
      {/* Hint */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 text-xs text-earth-500 shadow z-[1000] pointer-events-none">
        Cliquez sur un marqueur ☀ pour sélectionner
      </div>
    </div>
  );
}
