"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Box, GitBranch, ChevronDown, ChevronUp, Info } from "lucide-react";
import { useSolarStore } from "@/lib/store";
import SchemaInstallation from "@/components/wizard/shared/SchemaInstallation";

// Three.js uniquement côté client
const SolarScene3D = dynamic(
  () => import("@/components/wizard/shared/SolarScene3D"),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-earth-100 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-solar-300 border-t-solar-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-earth-400">Chargement scène 3D…</p>
        </div>
      </div>
    ),
  },
);

export default function PageVisualisations() {
  const {
    site,
    results,
    selectedPanel,
    selectedBattery,
    selectedInverter,
    selectedMppt,
    projectName,
  } = useSolarStore();

  const [showSchema, setShowSchema] = useState(true);
  const [show3D, setShow3D] = useState(true);

  const loc = site.location;

  if (!results || !loc) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl text-earth-900">Visualisations</h1>
        <div className="wizard-card text-center py-16">
          <Info className="w-12 h-12 text-earth-300 mx-auto mb-4" />
          <p className="text-earth-500">
            Complétez les étapes <strong>Localisation</strong> et{" "}
            <strong>Calculs SAHELIO</strong> pour afficher les visualisations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl text-earth-900">Visualisations</h1>
        <p className="text-earth-500 mt-1 text-sm">
          Simulation 3D de l'installation et schéma unifilaire dynamique basés
          sur vos calculs SAHELIO.
        </p>
      </div>

      {/* ── Animation 3D ── */}
      <div className="wizard-card">
        <button
          onClick={() => setShow3D((v) => !v)}
          className="w-full flex items-center justify-between"
        >
          <div className="section-title mb-0">
            <Box className="w-3.5 h-3.5 text-solar-500" />
            Simulation 3D — Inclinaison &amp; Orientation des panneaux
            <span className="ml-2 badge bg-solar-100 text-solar-700 text-[10px]">
              Three.js
            </span>
          </div>
          {show3D ? (
            <ChevronUp className="w-4 h-4 text-earth-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-earth-400" />
          )}
        </button>

        {show3D && (
          <div className="mt-4 space-y-4">
            <div className="alert-info text-xs">
              La scène 3D simule l'arc solaire selon la latitude de{" "}
              <strong>{loc.ville}</strong> ({loc.lat.toFixed(2)}°N).
              L'inclinaison des panneaux ({site.inclinaison}°) et l'orientation
              ({site.orientation}) sont appliquées en temps réel.
            </div>

            <SolarScene3D
              inclinaison={site.inclinaison}
              orientation={site.orientation}
              latitude={loc.lat}
              npTotal={results.npTotal}
              nps={results.nps}
              nbrp={results.nbrp}
              irrDefavorable={loc.irrDefavorable}
            />

            {/* Données contextuelles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Latitude site", value: `${loc.lat.toFixed(2)}°N` },
                {
                  label: "Inclinaison optimale",
                  value: `${site.inclinaison}°`,
                  highlight: true,
                },
                { label: "Orientation", value: site.orientation },
                {
                  label: "Irr. mois déf.",
                  value: `${loc.irrDefavorable} kWh/m²/j`,
                  highlight: true,
                },
              ].map(({ label, value, highlight }) => (
                <div
                  key={label}
                  className={`rounded-xl p-3 border ${highlight ? "bg-solar-50 border-solar-200" : "bg-earth-50 border-earth-100"}`}
                >
                  <p className="text-xs text-earth-400">{label}</p>
                  <p
                    className={`text-sm font-semibold mt-0.5 ${highlight ? "text-solar-700" : "text-earth-800"}`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Schéma unifilaire ── */}
      <div className="wizard-card">
        <button
          onClick={() => setShowSchema((v) => !v)}
          className="w-full flex items-center justify-between"
        >
          <div className="section-title mb-0">
            <GitBranch className="w-3.5 h-3.5 text-sky-500" />
            Schéma unifilaire de l'installation
            <span className="ml-2 badge bg-sky-100 text-sky-700 text-[10px]">
              SVG dynamique
            </span>
          </div>
          {showSchema ? (
            <ChevronUp className="w-4 h-4 text-earth-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-earth-400" />
          )}
        </button>

        {showSchema && (
          <div className="mt-4 space-y-3">
            <div className="alert-info text-xs">
              Schéma généré automatiquement selon vos équipements dimensionnés :{" "}
              {results.npTotal} panneaux en {results.nbrp} string(s) de{" "}
              {results.nps}, {results.nbTotal} batteries,{" "}
              {results.nMpptRequired} MPPT, {results.nInvertersRequired}{" "}
              onduleur(s).
            </div>

            <SchemaInstallation
              results={results}
              panel={selectedPanel}
              battery={selectedBattery}
              inverter={selectedInverter}
              mppt={selectedMppt}
              projectName={projectName}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                {
                  label: "Tension système Us",
                  value: `${results.systemVoltage} V`,
                },
                {
                  label: "Câble principal",
                  value: `${results.cableSectionStandard} mm² Cu`,
                },
                {
                  label: "Disj. DC",
                  value: `${results.dcBreaker_min.toFixed(1)}–${results.dcBreaker_max.toFixed(1)} A`,
                },
                {
                  label: "Parafoudre Up <",
                  value: `${results.surgeProtectionUp.toFixed(0)} V`,
                },
                {
                  label: "Sectionneur DC",
                  value: `≥ ${results.sectionneurIn.toFixed(1)} A / ${results.sectionneurUe.toFixed(1)} V`,
                },
                { label: "Prise de terre", value: "RA < 10 Ω" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-earth-50 rounded-lg p-2.5 border border-earth-100"
                >
                  <p className="text-earth-400">{label}</p>
                  <p className="font-semibold text-earth-700 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
