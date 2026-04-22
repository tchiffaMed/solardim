'use client';

import { useEffect, useRef } from 'react';
import type { NigerStation } from '@/types';

interface Props {
  stations: NigerStation[];
  selectedLocation: { lat: number; lng: number } | null;
  onMapClick: (lat: number, lng: number) => void;
  onStationClick: (station: NigerStation) => void;
}

export default function NigerMap({ stations, selectedLocation, onMapClick, onStationClick }: Props) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (mapRef.current) return;

    // Import dynamique de Leaflet
    import('leaflet').then(L => {
      if (!containerRef.current) return;

      // Init map centré sur le Niger
      const map = L.map(containerRef.current, {
        center: [16.5, 8.5],
        zoom: 5,
        zoomControl: true,
      });
      mapRef.current = map;

      // Tuile OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Icône station
      const stationIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:32px;height:32px;border-radius:50%;
          background:linear-gradient(135deg,#F59E0B,#D97706);
          border:2.5px solid white;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 8px rgba(0,0,0,0.25);
          cursor:pointer;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="2" x2="12" y2="5" stroke="white" stroke-width="2"/>
            <line x1="12" y1="19" x2="12" y2="22" stroke="white" stroke-width="2"/>
            <line x1="2" y1="12" x2="5" y2="12" stroke="white" stroke-width="2"/>
            <line x1="19" y1="12" x2="22" y2="12" stroke="white" stroke-width="2"/>
          </svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      // Ajouter les stations
      stations.forEach(station => {
        const marker = L.marker([station.lat, station.lng], { icon: stationIcon })
          .addTo(map);

        marker.bindTooltip(`
          <div style="font-family:system-ui;min-width:160px;padding:2px 0;">
            <div style="font-weight:600;color:#1C1917;margin-bottom:4px;">${station.ville}</div>
            <div style="color:#78716C;font-size:11px;">${station.region}</div>
            <div style="margin-top:6px;padding-top:6px;border-top:1px solid #E7E5E4;">
              <div style="font-size:11px;color:#78716C;">Irr. annuelle</div>
              <div style="font-weight:600;color:#D97706;">${station.irrAnnuelle} kWh/m²/j</div>
              <div style="font-size:11px;color:#78716C;margin-top:4px;">Irr. mois défavorable</div>
              <div style="font-weight:700;color:#DC2626;">${station.irrDefavorable} kWh/m²/j</div>
              <div style="font-size:11px;color:#78716C;margin-top:4px;">Inclinaison opt.</div>
              <div style="font-weight:600;color:#1C1917;">${station.inclinaisonOpt}°</div>
            </div>
          </div>
        `, { sticky: true, opacity: 1 });

        marker.on('click', () => onStationClick(station));
      });

      // Clic sur la carte
      map.on('click', (e: any) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });

      // Marker sélection (point rouge)
      const selectedIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:20px;height:20px;border-radius:50%;
          background:#DC2626;border:3px solid white;
          box-shadow:0 2px 8px rgba(220,38,38,0.4);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      if (selectedLocation) {
        markerRef.current = L.marker(
          [selectedLocation.lat, selectedLocation.lng],
          { icon: selectedIcon }
        ).addTo(map);
      }

      // Écouter les changements de sélection
      map.on('click', (e: any) => {
        if (markerRef.current) {
          markerRef.current.setLatLng([e.latlng.lat, e.latlng.lng]);
        } else {
          markerRef.current = L.marker(
            [e.latlng.lat, e.latlng.lng],
            { icon: selectedIcon }
          ).addTo(map);
        }
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Mettre à jour le marker quand selectedLocation change
  useEffect(() => {
    if (!mapRef.current || !selectedLocation) return;
    import('leaflet').then(L => {
      const selectedIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:20px;height:20px;border-radius:50%;
          background:#DC2626;border:3px solid white;
          box-shadow:0 2px 8px rgba(220,38,38,0.4);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      if (markerRef.current) {
        markerRef.current.setLatLng([selectedLocation.lat, selectedLocation.lng]);
      } else if (mapRef.current) {
        markerRef.current = L.marker(
          [selectedLocation.lat, selectedLocation.lng],
          { icon: selectedIcon }
        ).addTo(mapRef.current);
      }
    });
  }, [selectedLocation]);

  return (
    <div
      ref={containerRef}
      className="w-full h-72 rounded-2xl overflow-hidden border border-earth-200"
      style={{ zIndex: 0 }}
    />
  );
}
