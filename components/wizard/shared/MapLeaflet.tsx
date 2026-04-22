'use client';

import { useEffect, useRef, useState } from 'react';
import { NIGER_STATIONS } from '@/lib/data';
import type { NigerStation } from '@/types';
import type { Location } from '@/types';

interface Props {
  onSelectLocation: (station: NigerStation) => void;
  selectedLocation: Location | null;
}

export default function MapLeaflet({ onSelectLocation, selectedLocation }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Import Leaflet dynamiquement
    import('leaflet').then(L => {
      const map = L.map(mapRef.current!, {
        center: [16.5, 8.0],
        zoom: 6,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Icône personnalisée pour les stations
      const stationIcon = L.divIcon({
        html: `<div style="
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #F59E0B, #D97706);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const selectedIcon = L.divIcon({
        html: `<div style="
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #16A34A, #15803D);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(22,163,74,0.5);
        "></div>`,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      // Contour Niger (simplifié)
      const nigerBounds = L.rectangle(
        [[11.5, 0.16], [23.5, 15.96]],
        { color: '#D97706', weight: 1.5, fill: false, dashArray: '6,4' }
      ).addTo(map);

      // Marqueurs stations
      NIGER_STATIONS.forEach(station => {
        const isSelected = selectedLocation?.ville === station.ville;
        const marker = L.marker([station.lat, station.lng], {
          icon: isSelected ? selectedIcon : stationIcon,
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 200px;">
            <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #1C1917;">
              📍 ${station.ville}
            </h3>
            <div style="font-size: 12px; color: #78716C; line-height: 1.8;">
              <div>Région : <strong>${station.region}</strong></div>
              <div>Latitude : <strong>${station.lat.toFixed(2)}°N</strong></div>
              <div>Irr. annuelle : <strong style="color:#D97706">${station.irrAnnuelle} kWh/m²/j</strong></div>
              <div>Irr. mois déf. : <strong style="color:#DC2626">${station.irrDefavorable} kWh/m²/j</strong></div>
              <div>Inclinaison opt. : <strong>${station.inclinaisonOpt}°</strong></div>
            </div>
            <button
              onclick="window.__selectStation('${station.ville}')"
              style="
                margin-top: 10px; width: 100%;
                background: linear-gradient(135deg, #F59E0B, #D97706);
                color: white; border: none; border-radius: 8px;
                padding: 7px 12px; font-size: 12px; font-weight: 600;
                cursor: pointer;
              "
            >
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
        // Trouver la station la plus proche
        let nearest = NIGER_STATIONS[0];
        let bestDist = Infinity;
        NIGER_STATIONS.forEach(s => {
          const d = Math.sqrt((s.lat - lat) ** 2 + (s.lng - lng) ** 2);
          if (d < bestDist) { bestDist = d; nearest = s; }
        });
        onSelectLocation(nearest);
      });

      // Marqueur sélection courante
      if (selectedLocation) {
        if (markerRef.current) markerRef.current.remove();
        markerRef.current = L.circleMarker(
          [selectedLocation.lat, selectedLocation.lng],
          { radius: 14, color: '#16A34A', fillColor: '#16A34A', fillOpacity: 0.25, weight: 2 }
        ).addTo(map);
      }

      mapInstanceRef.current = map;

      // Callback global pour les boutons popup
      (window as any).__selectStation = (ville: string) => {
        const station = NIGER_STATIONS.find(s => s.ville === ville);
        if (station) onSelectLocation(station);
      };
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update sélection
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;
    import('leaflet').then(L => {
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = L.circleMarker(
        [selectedLocation.lat, selectedLocation.lng],
        { radius: 16, color: '#16A34A', fillColor: '#16A34A', fillOpacity: 0.2, weight: 2.5 }
      ).addTo(mapInstanceRef.current);
    });
  }, [selectedLocation]);

  return (
    <div className="relative">
      <div ref={mapRef} className="h-[380px] w-full rounded-2xl" />
      {/* Légende */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-xl border border-earth-100 shadow-md p-3 text-xs space-y-1.5 z-[1000]">
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
          <span className="text-earth-500">Frontière Niger</span>
        </div>
      </div>
      {/* Hint */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 text-xs text-earth-500 shadow z-[1000]">
        Cliquez sur un marqueur pour sélectionner
      </div>
    </div>
  );
}
