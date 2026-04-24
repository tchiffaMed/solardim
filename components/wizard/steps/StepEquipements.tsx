"use client";

import { useState } from "react";
import {
  Sun,
  Battery,
  Zap,
  Settings,
  ChevronDown,
  ChevronUp,
  Check,
  Plus,
} from "lucide-react";
import { useSolarStore } from "@/lib/store";
import {
  PANELS_CATALOG,
  BATTERIES_CATALOG,
  INVERTERS_CATALOG,
  MPPT_CATALOG,
} from "@/lib/data";
import type {
  Panel,
  Battery as BatteryType,
  Inverter,
  MpptController,
} from "@/types";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const AddEquipmentModal = dynamic(
  () => import("@/components/wizard/shared/AddEquipmentModal"),
  { ssr: false },
);

function EquipCard({
  item,
  selected,
  onSelect,
  children,
}: {
  item: { id: string; name: string; brand?: string };
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  const isCustom = item.id.startsWith("custom-");
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left p-4 rounded-xl border-2 transition-all duration-150 relative",
        selected
          ? "border-solar-400 bg-solar-50 shadow-sm"
          : "border-earth-100 bg-white hover:border-earth-300 hover:bg-earth-50",
      )}
    >
      {isCustom && (
        <span className="absolute top-2 right-2 text-[9px] bg-sky-100 text-sky-600 font-bold px-1.5 py-0.5 rounded-full">
          PERSONNALISÉ
        </span>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0 pr-10">
          <p
            className={cn(
              "font-semibold text-sm truncate",
              selected ? "text-solar-800" : "text-earth-800",
            )}
          >
            {item.name}
          </p>
          {item.brand && (
            <p className="text-xs text-earth-400 mt-0.5">{item.brand}</p>
          )}
          <div className="mt-2 space-y-1">{children}</div>
        </div>
        <div
          className={cn(
            "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 absolute bottom-4 right-4",
            selected ? "border-solar-500 bg-solar-500" : "border-earth-200",
          )}
        >
          {selected && <Check className="w-3 h-3 text-white" />}
        </div>
      </div>
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-earth-400">{label}</span>
      <span className="font-medium text-earth-600">{value}</span>
    </div>
  );
}

function AddCustomBtn({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-xl border-2 border-dashed border-earth-200 bg-white
                 hover:border-solar-300 hover:bg-solar-50 transition-all duration-150
                 flex flex-col items-center justify-center gap-2 text-earth-400 hover:text-solar-600"
    >
      <div className="w-8 h-8 rounded-full bg-earth-50 border border-dashed border-earth-300 hover:border-solar-300 flex items-center justify-center">
        <Plus className="w-4 h-4" />
      </div>
      <span className="text-xs font-medium">
        Ajouter un {label} personnalisé
      </span>
      <span className="text-[10px] text-earth-300">
        Saisissez les caractéristiques techniques
      </span>
    </button>
  );
}

export default function StepEquipements() {
  const {
    selectedPanel,
    setPanel,
    selectedBattery,
    setBattery,
    selectedInverter,
    setInverter,
    selectedMppt,
    setMppt,
    params,
    updateParams,
  } = useSolarStore();

  const [openSection, setOpenSection] = useState<string | null>("panels");
  const [modal, setModal] = useState<
    "panel" | "battery" | "inverter" | "mppt" | null
  >(null);

  // Catalogues avec items custom potentiellement ajoutés
  const [customPanels, setCustomPanels] = useState<Panel[]>([]);
  const [customBatteries, setCustomBatteries] = useState<BatteryType[]>([]);
  const [customInverters, setCustomInverters] = useState<Inverter[]>([]);
  const [customMppTs, setCustomMppTs] = useState<MpptController[]>([]);

  const allPanels = [...PANELS_CATALOG, ...customPanels];
  const allBatteries = [...BATTERIES_CATALOG, ...customBatteries];
  const allInverters = [...INVERTERS_CATALOG, ...customInverters];
  const allMppTs = [...MPPT_CATALOG, ...customMppTs];

  const toggle = (s: string) => setOpenSection(openSection === s ? null : s);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl text-earth-900">
          Sélection des équipements
        </h1>
        <p className="text-earth-500 mt-1.5 text-sm">
          Choisissez dans le catalogue ou ajoutez vos propres équipements. Les
          calculs SAHELIO s'adaptent automatiquement.
        </p>
      </div>

      {/* ── PANNEAUX ── */}
      <div className="wizard-card">
        <button
          onClick={() => toggle("panels")}
          className="w-full flex items-center justify-between"
        >
          <div className="section-title mb-0">
            <Sun className="w-3.5 h-3.5 text-solar-500" />
            Panneaux solaires
            <span className="ml-2 badge bg-solar-100 text-solar-700 font-normal">
              Sélectionné : {selectedPanel.wp} Wc
            </span>
          </div>
          {openSection === "panels" ? (
            <ChevronUp className="w-4 h-4 text-earth-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-earth-400" />
          )}
        </button>

        {openSection === "panels" && (
          <>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allPanels.map((panel) => (
                <EquipCard
                  key={panel.id}
                  item={panel}
                  selected={selectedPanel.id === panel.id}
                  onSelect={() => setPanel(panel)}
                >
                  <DetailRow
                    label="Puissance crête Pcu"
                    value={`${panel.wp} Wc`}
                  />
                  <DetailRow label="Voc" value={`${panel.voc} V`} />
                  <DetailRow label="Isc" value={`${panel.isc} A`} />
                  <DetailRow label="Vnom" value={`${panel.vnom} V`} />
                  {panel.efficiency > 0 && (
                    <DetailRow
                      label="Rendement"
                      value={`${panel.efficiency} %`}
                    />
                  )}
                  {panel.priceXOF > 0 && (
                    <DetailRow
                      label="Prix"
                      value={`${panel.priceXOF.toLocaleString()} FCFA`}
                    />
                  )}
                </EquipCard>
              ))}
              <AddCustomBtn onClick={() => setModal("panel")} label="panneau" />
            </div>

            <div className="mt-4 p-4 bg-earth-50 rounded-xl border border-earth-100">
              <label className="field-label">
                Tension nominale panneau Vn — Nps = Us / Vn
              </label>
              <div className="flex gap-3 mt-2">
                {[12, 24, 48].map((v) => (
                  <button
                    key={v}
                    onClick={() => setPanel({ ...selectedPanel, vnom: v })}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                      selectedPanel.vnom === v
                        ? "bg-solar-500 text-white border-solar-500"
                        : "bg-white text-earth-600 border-earth-200 hover:border-earth-300",
                    )}
                  >
                    {v} V
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── BATTERIES ── */}
      <div className="wizard-card">
        <button
          onClick={() => toggle("batteries")}
          className="w-full flex items-center justify-between"
        >
          <div className="section-title mb-0">
            <Battery className="w-3.5 h-3.5 text-sky-500" />
            Batteries
            <span className="ml-2 badge bg-sky-100 text-sky-700 font-normal">
              {selectedBattery.type} — {selectedBattery.capacityAh}Ah/
              {selectedBattery.voltageV}V
            </span>
          </div>
          {openSection === "batteries" ? (
            <ChevronUp className="w-4 h-4 text-earth-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-earth-400" />
          )}
        </button>

        {openSection === "batteries" && (
          <>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allBatteries.map((bat) => (
                <EquipCard
                  key={bat.id}
                  item={bat}
                  selected={selectedBattery.id === bat.id}
                  onSelect={() => setBattery(bat)}
                >
                  <DetailRow label="Type" value={bat.type} />
                  <DetailRow
                    label="Capacité"
                    value={`${bat.capacityAh} Ah / ${bat.voltageV} V`}
                  />
                  <DetailRow
                    label="DoD"
                    value={`${(bat.dod * 100).toFixed(0)} %`}
                  />
                  <DetailRow
                    label="Rendement Rb"
                    value={`${(bat.efficiency * 100).toFixed(0)} %`}
                  />
                  {bat.cycles > 0 && (
                    <DetailRow
                      label="Cycles"
                      value={bat.cycles.toLocaleString()}
                    />
                  )}
                  {bat.priceXOF > 0 && (
                    <DetailRow
                      label="Prix"
                      value={`${bat.priceXOF.toLocaleString()} FCFA`}
                    />
                  )}
                </EquipCard>
              ))}
              <AddCustomBtn
                onClick={() => setModal("battery")}
                label="batterie"
              />
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-earth-50 rounded-xl border border-earth-100">
              <div>
                <label className="field-label">
                  DoD (Plomb: 0,50 / Li: 0,80–0,90)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.4"
                  max="0.95"
                  value={selectedBattery.dod}
                  onChange={(e) =>
                    setBattery({ ...selectedBattery, dod: +e.target.value })
                  }
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Rendement Rb</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.7"
                  max="1"
                  value={selectedBattery.efficiency}
                  onChange={(e) =>
                    setBattery({
                      ...selectedBattery,
                      efficiency: +e.target.value,
                    })
                  }
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Jours d'autonomie Nj</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={params.autonomyDays}
                  onChange={(e) =>
                    updateParams({ autonomyDays: +e.target.value })
                  }
                  className="field-input"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── ONDULEURS ── */}
      <div className="wizard-card">
        <button
          onClick={() => toggle("inverters")}
          className="w-full flex items-center justify-between"
        >
          <div className="section-title mb-0">
            <Zap className="w-3.5 h-3.5 text-green-500" />
            Onduleurs hybrides
            <span className="ml-2 badge bg-green-100 text-green-700 font-normal">
              {(selectedInverter.powerW / 1000).toFixed(1)} kW
            </span>
          </div>
          {openSection === "inverters" ? (
            <ChevronUp className="w-4 h-4 text-earth-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-earth-400" />
          )}
        </button>

        {openSection === "inverters" && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allInverters.map((inv) => (
              <EquipCard
                key={inv.id}
                item={inv}
                selected={selectedInverter.id === inv.id}
                onSelect={() => setInverter(inv)}
              >
                <DetailRow
                  label="Puissance"
                  value={`${(inv.powerW / 1000).toFixed(1)} kW`}
                />
                <DetailRow
                  label="Phases"
                  value={`${inv.phases} phase${inv.phases > 1 ? "s" : ""}`}
                />
                <DetailRow
                  label="Rendement ƞ"
                  value={`${(inv.efficiency * 100).toFixed(1)} %`}
                />
                {inv.priceXOF > 0 && (
                  <DetailRow
                    label="Prix"
                    value={`${inv.priceXOF.toLocaleString()} FCFA`}
                  />
                )}
              </EquipCard>
            ))}
            <AddCustomBtn
              onClick={() => setModal("inverter")}
              label="onduleur"
            />
          </div>
        )}
      </div>

      {/* ── MPPT ── */}
      <div className="wizard-card">
        <button
          onClick={() => toggle("mppt")}
          className="w-full flex items-center justify-between"
        >
          <div className="section-title mb-0">
            <Settings className="w-3.5 h-3.5 text-earth-500" />
            Régulateurs MPPT
            <span className="ml-2 badge bg-earth-100 text-earth-600 font-normal">
              {selectedMppt.vmaxV}V / {selectedMppt.imaxA}A
            </span>
          </div>
          {openSection === "mppt" ? (
            <ChevronUp className="w-4 h-4 text-earth-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-earth-400" />
          )}
        </button>

        {openSection === "mppt" && (
          <>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allMppTs.map((mppt) => (
                <EquipCard
                  key={mppt.id}
                  item={mppt}
                  selected={selectedMppt.id === mppt.id}
                  onSelect={() => setMppt(mppt)}
                >
                  <DetailRow label="Vmax entrée" value={`${mppt.vmaxV} V`} />
                  <DetailRow label="Imax" value={`${mppt.imaxA} A`} />
                  {mppt.priceXOF > 0 && (
                    <DetailRow
                      label="Prix"
                      value={`${mppt.priceXOF.toLocaleString()} FCFA`}
                    />
                  )}
                </EquipCard>
              ))}
              <AddCustomBtn
                onClick={() => setModal("mppt")}
                label="régulateur MPPT"
              />
            </div>
            <div className="mt-4 p-4 bg-sky-50 border border-sky-100 rounded-xl">
              <p className="text-xs text-sky-700">
                <strong> SAHELIO §4.2.2.2.2 :</strong> 3 conditions cumulatives
                : Pmrc ≥ 1,25×Pcu×Np | Vmrc ≥ 1,25×Voc×Nps | Imrc ≥
                1,25×Isc×Nbrp. Vérification automatique à l'étape Calculs.
              </p>
            </div>
          </>
        )}
      </div>

      {/* ── Récap sélection ── */}
      <div className="wizard-card bg-earth-50">
        <div className="section-title">Récapitulatif de la sélection</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Panneau",
              value: `${selectedPanel.wp}Wc — ${selectedPanel.voc}V/${selectedPanel.isc}A`,
            },
            {
              label: "Batterie",
              value: `${selectedBattery.type} ${selectedBattery.capacityAh}Ah/${selectedBattery.voltageV}V`,
            },
            {
              label: "Onduleur",
              value: `${(selectedInverter.powerW / 1000).toFixed(1)}kW η=${(selectedInverter.efficiency * 100).toFixed(0)}%`,
            },
            {
              label: "MPPT",
              value: `${selectedMppt.vmaxV}V / ${selectedMppt.imaxA}A`,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white rounded-xl p-3 border border-earth-100"
            >
              <p className="text-xs text-earth-400 mb-1">{label}</p>
              <p className="text-sm font-semibold text-earth-800">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modales ajout personnalisé ── */}
      {modal === "panel" && (
        <AddEquipmentModal
          type="panel"
          onAdd={(equip) => {
            setCustomPanels((p) => [...p, equip as Panel]);
            setPanel(equip as Panel);
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "battery" && (
        <AddEquipmentModal
          type="battery"
          onAdd={(equip) => {
            setCustomBatteries((p) => [...p, equip as BatteryType]);
            setBattery(equip as BatteryType);
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "inverter" && (
        <AddEquipmentModal
          type="inverter"
          onAdd={(equip) => {
            setCustomInverters((p) => [...p, equip as Inverter]);
            setInverter(equip as Inverter);
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "mppt" && (
        <AddEquipmentModal
          type="mppt"
          onAdd={(equip) => {
            setCustomMppTs((p) => [...p, equip as MpptController]);
            setMppt(equip as MpptController);
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
