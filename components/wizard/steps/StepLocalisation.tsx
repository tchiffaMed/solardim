"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Sun,
  Thermometer,
  Navigation,
  Info,
  Table,
} from "lucide-react";
import { useSolarStore } from "@/lib/store";
import { NIGER_STATIONS } from "@/lib/data";
import type { Location } from "@/types";
import { cn } from "@/lib/utils";

// Leaflet doit être importé côté client uniquement
const MapComponent = dynamic(
  () => import("@/components/wizard/shared/MapLeaflet"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[340px] rounded-2xl bg-earth-100 animate-pulse flex items-center justify-center">
        <div className="text-earth-400 text-sm">Chargement de la carte…</div>
      </div>
    ),
  },
);

export default function StepLocalisation() {
  const { site, setLocation, updateSite } = useSolarStore();
  const [activeView, setActiveView] = useState<"map" | "table">("map");

  const loc = site.location;

  function handleSelectStation(station: (typeof NIGER_STATIONS)[0]) {
    const location: Location = {
      lat: station.lat,
      lng: station.lng,
      ville: station.ville,
      region: station.region,
      irrAnnuelle: station.irrAnnuelle,
      irrDefavorable: station.irrDefavorable,
      inclinaisonOptimale: station.inclinaisonOpt,
    };
    setLocation(location);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-earth-900">
          Localisation du site
        </h1>
        <p className="text-earth-500 mt-1.5 text-sm">
          Sélectionnez l'emplacement de l'installation sur la carte ou dans le
          tableau. L'irradiation du{" "}
          <strong className="text-solar-600">mois le plus défavorable</strong>{" "}
          sera utilisée pour le dimensionnement (méthode SAHELIO §4.2.1.1).
        </p>
      </div>

      {/* Alert  SAHELIO */}
      <div className="alert-info flex items-start gap-3">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <strong> SAHELIO §4.2.1.1 :</strong> Pour le dimensionnement, on
          utilise l'irradiation du mois le plus défavorable. Au Niger, ce mois
          est généralement
          <strong> décembre/janvier</strong> en raison de l'harmattan et de
          l'angle solaire plus faible. L'inclinaison optimale des panneaux ≈
          latitude du site (plein Sud).
        </div>
      </div>

      {/* Toggle vue */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveView("map")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
            activeView === "map"
              ? "bg-solar-500 text-white shadow-sm"
              : "bg-white border border-earth-200 text-earth-500 hover:border-solar-300",
          )}
        >
          <MapPin className="w-4 h-4" />
          Carte interactive
        </button>
        <button
          onClick={() => setActiveView("table")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
            activeView === "table"
              ? "bg-solar-500 text-white shadow-sm"
              : "bg-white border border-earth-200 text-earth-500 hover:border-solar-300",
          )}
        >
          <Table className="w-4 h-4" />
          Tableau des stations
        </button>
      </div>

      {/* Map */}
      {activeView === "map" && (
        <div className="wizard-card !p-0 overflow-hidden">
          <MapComponent
            onSelectLocation={handleSelectStation}
            selectedLocation={loc}
          />
        </div>
      )}

      {/* Table des stations */}
      {activeView === "table" && (
        <div className="wizard-card">
          <div className="section-title">
            <Sun className="w-3.5 h-3.5" />
            Données d'irradiation — Niger (14 stations)
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ville</th>
                  <th>Région</th>
                  <th>Latitude</th>
                  <th>Irr. annuelle moy.</th>
                  <th className="text-red-600">Irr. mois défavorable ⚠️</th>
                  <th>Inclinaison opt.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {NIGER_STATIONS.map((s) => {
                  const isSelected = loc?.ville === s.ville;
                  return (
                    <tr
                      key={s.ville}
                      className={cn(
                        "cursor-pointer",
                        isSelected && "bg-solar-50",
                      )}
                      onClick={() => handleSelectStation(s)}
                    >
                      <td className="font-semibold text-earth-800">
                        {s.ville}
                      </td>
                      <td className="text-earth-500">{s.region}</td>
                      <td className="text-earth-500">{s.lat.toFixed(2)}°N</td>
                      <td>
                        <span className="badge bg-solar-100 text-solar-700">
                          {s.irrAnnuelle} kWh/m²/j
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-red-100 text-red-600 font-bold">
                          {s.irrDefavorable} kWh/m²/j
                        </span>
                      </td>
                      <td className="text-earth-600">{s.inclinaisonOpt}°</td>
                      <td>
                        {isSelected ? (
                          <span className="badge bg-green-100 text-green-700">
                            ✓ Sélectionné
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSelectStation(s)}
                            className="text-xs text-solar-600 hover:text-solar-800 font-medium"
                          >
                            Sélectionner
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Infos localisation sélectionnée */}
      {loc ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="metric-card">
            <div className="metric-label flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Coordonnées
            </div>
            <div className="metric-value text-earth-700 text-lg">
              {loc.lat.toFixed(3)}°N
            </div>
            <div className="metric-unit">
              {loc.lng.toFixed(3)}°E — {loc.ville}
            </div>
          </div>
          <div className="metric-card bg-solar-50">
            <div className="metric-label flex items-center gap-1">
              <Sun className="w-3 h-3 text-solar-500" />
              Irr. annuelle moyenne
            </div>
            <div className="metric-value text-solar-600">{loc.irrAnnuelle}</div>
            <div className="metric-unit">kWh/m²/jour</div>
          </div>
          <div className="metric-card bg-red-50">
            <div className="metric-label flex items-center gap-1 text-red-600">
              <Sun className="w-3 h-3" />
              Irr. mois défavorable ⚡
            </div>
            <div className="metric-value text-red-600">
              {loc.irrDefavorable}
            </div>
            <div className="metric-unit text-red-400">
              kWh/m²/j — utilisée pour Pcmin
            </div>
          </div>
          <div className="metric-card bg-sky-50">
            <div className="metric-label flex items-center gap-1 text-sky-600">
              <Navigation className="w-3 h-3" />
              Inclinaison optimale
            </div>
            <div className="metric-value text-sky-700">
              {loc.inclinaisonOptimale}°
            </div>
            <div className="metric-unit">≈ latitude du site</div>
          </div>
        </div>
      ) : (
        <div className="alert-warning flex items-center gap-3">
          <MapPin className="w-4 h-4" />
          Cliquez sur la carte ou sélectionnez une ville pour définir le site
          d'installation.
        </div>
      )}

      {/* Paramètres d'installation */}
      <div className="wizard-card">
        <div className="section-title">
          <Navigation className="w-3.5 h-3.5" />
          Paramètres d'installation des panneaux
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="field-label">
              Orientation (Niger → Plein Sud recommandé)
            </label>
            <select
              value={site.orientation}
              onChange={(e) =>
                updateSite({ orientation: e.target.value as any })
              }
              className="field-input"
            >
              <option value="Plein Sud">Plein Sud ☀️ (recommandé)</option>
              <option value="Sud-Est">Sud-Est</option>
              <option value="Sud-Ouest">Sud-Ouest</option>
            </select>
          </div>
          <div>
            <label className="field-label">
              Inclinaison des panneaux (°)
              {loc && (
                <span className="ml-2 text-xs text-solar-500">
                  Optimale pour {loc.ville} : {loc.inclinaisonOptimale}°
                </span>
              )}
            </label>
            <input
              type="number"
              min="0"
              max="45"
              value={site.inclinaison}
              onChange={(e) => updateSite({ inclinaison: +e.target.value })}
              className="field-input"
            />
            <p className="text-xs text-earth-400 mt-1">
              L'inclinaison optimale = latitude du site (au Niger : 13°–19°)
            </p>
          </div>
        </div>
      </div>

      {/* Sources données */}
      <div className="p-4 bg-earth-50 rounded-2xl border border-earth-100">
        <p className="text-xs text-earth-400 leading-relaxed">
          <strong className="text-earth-500">Sources données :</strong> PVGIS
          (JRC European Commission), SolarGIS, NASA POWER, Météorologie
          Nationale du Niger. Données d'irradiation du mois le plus défavorable
          basées sur les moyennes mensuelles historiques 20 ans. Sources
          gratuites :{" "}
          <code className="bg-earth-100 px-1 rounded">
            https://re.jrc.ec.europa.eu/pvg_tools/fr/
          </code>
        </p>
      </div>
    </div>
  );
}
