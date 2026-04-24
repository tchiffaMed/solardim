"use client";

import { useState } from "react";
import { X, Plus, AlertCircle, CheckCircle, Info } from "lucide-react";
import type { Panel, Battery, Inverter, MpptController } from "@/types";
import { cn } from "@/lib/utils";

// ── Types ──
type EquipType = "panel" | "battery" | "inverter" | "mppt";

interface Props {
  type: EquipType;
  onAdd: (equip: Panel | Battery | Inverter | MpptController) => void;
  onClose: () => void;
}

// ── Champs obligatoires par type avec description ──
const REQUIRED_FIELDS: Record<
  EquipType,
  Array<{
    key: string;
    label: string;
    unit: string;
    type: "number" | "text" | "select";
    min?: number;
    max?: number;
    step?: number;
    required: boolean;
    help: string;
    options?: Array<{ value: string; label: string }>;
  }>
> = {
  panel: [
    {
      key: "name",
      label: "Nom / Référence",
      unit: "",
      type: "text",
      required: true,
      help: "Ex : Jinko Solar Tiger 550W",
    },
    {
      key: "brand",
      label: "Marque",
      unit: "",
      type: "text",
      required: false,
      help: "Fabricant du panneau",
    },
    {
      key: "wp",
      label: "Puissance crête Pcu",
      unit: "Wc",
      type: "number",
      min: 10,
      max: 1500,
      step: 1,
      required: true,
      help: "Puissance en conditions STC (1000W/m², 25°C)",
    },
    {
      key: "voc",
      label: "Tension circuit ouvert Voc",
      unit: "V",
      type: "number",
      min: 10,
      max: 100,
      step: 0.1,
      required: true,
      help: "Tension à vide (circuit ouvert) en V — utilisée pour Vmrc MPPT",
    },
    {
      key: "isc",
      label: "Courant court-circuit Isc",
      unit: "A",
      type: "number",
      min: 1,
      max: 30,
      step: 0.01,
      required: true,
      help: "Courant de court-circuit en A — utilisé pour Imrc MPPT et fusibles",
    },
    {
      key: "vmp",
      label: "Tension max puissance Vmp",
      unit: "V",
      type: "number",
      min: 10,
      max: 100,
      step: 0.1,
      required: false,
      help: "Tension au point de puissance maximale",
    },
    {
      key: "imp",
      label: "Courant max puissance Imp",
      unit: "A",
      type: "number",
      min: 1,
      max: 30,
      step: 0.01,
      required: false,
      help: "Courant au point de puissance maximale",
    },
    {
      key: "vnom",
      label: "Tension nominale Vnom",
      unit: "V",
      type: "select",
      required: true,
      help: "Tension nominale — utilisée pour Nps = Us/Vnom",
      options: [
        { value: "12", label: "12 V" },
        { value: "24", label: "24 V" },
        { value: "48", label: "48 V" },
      ],
    },
    {
      key: "efficiency",
      label: "Rendement",
      unit: "%",
      type: "number",
      min: 10,
      max: 25,
      step: 0.1,
      required: false,
      help: "Rendement du panneau en %",
    },
    {
      key: "warranty",
      label: "Garantie",
      unit: "ans",
      type: "number",
      min: 1,
      max: 30,
      required: false,
      help: "Garantie de production",
    },
    {
      key: "priceXOF",
      label: "Prix unitaire",
      unit: "FCFA",
      type: "number",
      min: 0,
      required: false,
      help: "Prix d'achat en FCFA",
    },
  ],
  battery: [
    {
      key: "name",
      label: "Nom / Référence",
      unit: "",
      type: "text",
      required: true,
      help: "Ex : LiFePO4 200Ah",
    },
    {
      key: "brand",
      label: "Marque",
      unit: "",
      type: "text",
      required: false,
      help: "Fabricant",
    },
    {
      key: "type",
      label: "Technologie",
      unit: "",
      type: "select",
      required: true,
      help: "Type de batterie — détermine le DoD recommandé",
      options: [
        { value: "LiFePO4", label: "LiFePO4 (Lithium fer-phosphate)" },
        { value: "AGM", label: "AGM (Plomb-acide absorbé)" },
        { value: "Gel", label: "Gel (Plomb-gel)" },
        { value: "Li-ion", label: "Li-ion (Lithium-ion)" },
      ],
    },
    {
      key: "capacityAh",
      label: "Capacité",
      unit: "Ah",
      type: "number",
      min: 1,
      max: 10000,
      required: true,
      help: "Capacité nominale en Ah — utilisée pour Nbp = ceil(Cp/Cap_bat)",
    },
    {
      key: "voltageV",
      label: "Tension nominale Ub",
      unit: "V",
      type: "select",
      required: true,
      help: "Tension nominale — utilisée pour Nbs = Us/Ub",
      options: [
        { value: "2", label: "2 V (cellule)" },
        { value: "6", label: "6 V" },
        { value: "12", label: "12 V" },
        { value: "24", label: "24 V" },
        { value: "48", label: "48 V" },
      ],
    },
    {
      key: "dod",
      label: "Prof. de décharge DoD",
      unit: "",
      type: "number",
      min: 0.3,
      max: 0.95,
      step: 0.01,
      required: true,
      help: "LiFePO4: 0,80–0,95 | AGM: 0,50 | Gel: 0,60 — utilisé pour Cp = En/(Us×DoD×Rb)",
    },
    {
      key: "efficiency",
      label: "Rendement Rb",
      unit: "",
      type: "number",
      min: 0.7,
      max: 1,
      step: 0.01,
      required: true,
      help: "Rendement de la batterie — utilisé dans Cp = En/(Us×DoD×Rb)",
    },
    {
      key: "cycles",
      label: "Nombre de cycles",
      unit: "cycles",
      type: "number",
      min: 100,
      required: false,
      help: "Durée de vie en cycles de charge/décharge",
    },
    {
      key: "priceXOF",
      label: "Prix unitaire",
      unit: "FCFA",
      type: "number",
      min: 0,
      required: false,
      help: "Prix d'achat en FCFA",
    },
  ],
  inverter: [
    {
      key: "name",
      label: "Nom / Référence",
      unit: "",
      type: "text",
      required: true,
      help: "Ex : Victron MultiPlus 3kVA",
    },
    {
      key: "brand",
      label: "Marque",
      unit: "",
      type: "text",
      required: false,
      help: "Fabricant",
    },
    {
      key: "powerW",
      label: "Puissance nominale",
      unit: "W",
      type: "number",
      min: 100,
      max: 500000,
      required: true,
      help: "Puissance continue en W — utilisée pour Nond = ceil(P_ond/P_inv)",
    },
    {
      key: "phases",
      label: "Nombre de phases",
      unit: "",
      type: "select",
      required: true,
      help: "Monophasé ou triphasé — influe sur le calibre du disjoncteur AC",
      options: [
        { value: "1", label: "Monophasé (1 phase)" },
        { value: "3", label: "Triphasé (3 phases)" },
      ],
    },
    {
      key: "efficiency",
      label: "Rendement ƞond",
      unit: "",
      type: "number",
      min: 0.8,
      max: 1,
      step: 0.001,
      required: true,
      help: "Rendement — utilisé pour P_ond = 1,25×Ppt/ƞond",
    },
    {
      key: "priceXOF",
      label: "Prix unitaire",
      unit: "FCFA",
      type: "number",
      min: 0,
      required: false,
      help: "Prix d'achat en FCFA",
    },
  ],
  mppt: [
    {
      key: "name",
      label: "Nom / Référence",
      unit: "",
      type: "text",
      required: true,
      help: "Ex : Victron SmartSolar 150/100",
    },
    {
      key: "brand",
      label: "Marque",
      unit: "",
      type: "text",
      required: false,
      help: "Fabricant",
    },
    {
      key: "vmaxV",
      label: "Tension max entrée Vmrc",
      unit: "V",
      type: "number",
      min: 12,
      max: 1500,
      required: true,
      help: "Tension max d'entrée — doit vérifier Vmrc ≥ 1,25×Voc×Nps (condition 2  SAHELIO)",
    },
    {
      key: "imaxA",
      label: "Courant max sortie Imrc",
      unit: "A",
      type: "number",
      min: 1,
      max: 500,
      required: true,
      help: "Courant max de sortie — doit vérifier Imrc ≥ 1,25×Isc×Nbrp (condition 3  SAHELIO)",
    },
    {
      key: "priceXOF",
      label: "Prix unitaire",
      unit: "FCFA",
      type: "number",
      min: 0,
      required: false,
      help: "Prix d'achat en FCFA",
    },
  ],
};

const TYPE_LABELS: Record<EquipType, string> = {
  panel: "Panneau solaire",
  battery: "Batterie",
  inverter: "Onduleur hybride",
  mppt: "Régulateur MPPT",
};

const TYPE_ICONS: Record<EquipType, string> = {
  panel: "🔆",
  battery: "🔋",
  inverter: "⚡",
  mppt: "⚙️",
};

export default function AddEquipmentModal({ type, onAdd, onClose }: Props) {
  const fields = REQUIRED_FIELDS[type];
  const [values, setValues] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.options) defaults[f.key] = f.options[0].value;
      else defaults[f.key] = "";
    });
    // Valeurs par défaut intelligentes
    if (type === "battery") {
      defaults.dod = "0.80";
      defaults.efficiency = "0.95";
    }
    if (type === "inverter") {
      defaults.efficiency = "0.96";
      defaults.phases = "1";
    }
    if (type === "panel") {
      defaults.vnom = "24";
      defaults.efficiency = "20";
      defaults.warranty = "25";
    }
    return defaults;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    fields.forEach((f) => {
      const val = values[f.key]?.trim();
      if (f.required && (!val || val === "")) {
        newErrors[f.key] = "Champ obligatoire pour les calculs  SAHELIO";
        return;
      }
      if (val && f.type === "number") {
        const n = parseFloat(val);
        if (isNaN(n)) {
          newErrors[f.key] = "Valeur numérique requise";
          return;
        }
        if (f.min !== undefined && n < f.min)
          newErrors[f.key] = `Minimum : ${f.min}`;
        if (f.max !== undefined && n > f.max)
          newErrors[f.key] = `Maximum : ${f.max}`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
    setTouched((prev) => ({ ...prev, [key]: true }));
    if (errors[key])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
  }

  function handleBlur(key: string) {
    setTouched((prev) => ({ ...prev, [key]: true }));
    // Validation individuelle
    const f = fields.find((f) => f.key === key);
    if (!f) return;
    const val = values[key]?.trim();
    if (f.required && (!val || val === "")) {
      setErrors((prev) => ({
        ...prev,
        [key]: "Champ obligatoire pour les calculs  SAHELIO",
      }));
    } else if (val && f.type === "number") {
      const n = parseFloat(val);
      if (isNaN(n))
        setErrors((prev) => ({ ...prev, [key]: "Valeur numérique requise" }));
      else if (f.min !== undefined && n < f.min)
        setErrors((prev) => ({ ...prev, [key]: `Min : ${f.min}` }));
      else if (f.max !== undefined && n > f.max)
        setErrors((prev) => ({ ...prev, [key]: `Max : ${f.max}` }));
    }
  }

  function handleSubmit() {
    // Marquer tous les champs comme touchés
    const allTouched: Record<string, boolean> = {};
    fields.forEach((f) => (allTouched[f.key] = true));
    setTouched(allTouched);

    if (!validate()) return;

    const id = `custom-${type}-${Date.now()}`;
    const num = (k: string, def = 0) => parseFloat(values[k]) || def;
    const str = (k: string, def = "") => values[k]?.trim() || def;

    let equip: Panel | Battery | Inverter | MpptController;

    if (type === "panel") {
      equip = {
        id,
        name: str("name"),
        brand: str("brand", "Personnalisé"),
        model: str("name"),
        wp: num("wp"),
        voc: num("voc"),
        isc: num("isc"),
        vmp: num("vmp", num("voc") * 0.85),
        imp: num("imp", num("isc") * 0.95),
        vnom: num("vnom", 24),
        efficiency: num("efficiency", 18),
        warranty: num("warranty", 10),
        priceXOF: num("priceXOF", 0),
      } as Panel;
    } else if (type === "battery") {
      equip = {
        id,
        name: str("name"),
        brand: str("brand", "Personnalisé"),
        type: str("type", "LiFePO4") as Battery["type"],
        capacityAh: num("capacityAh"),
        voltageV: num("voltageV", 12),
        capacityKwh: (num("capacityAh") * num("voltageV", 12)) / 1000,
        dod: num("dod", 0.8),
        efficiency: num("efficiency", 0.95),
        cycles: num("cycles", 1000),
        priceXOF: num("priceXOF", 0),
      } as Battery;
    } else if (type === "inverter") {
      equip = {
        id,
        name: str("name"),
        brand: str("brand", "Personnalisé"),
        powerW: num("powerW"),
        phases: num("phases", 1) as 1 | 3,
        efficiency: num("efficiency", 0.96),
        priceXOF: num("priceXOF", 0),
      } as Inverter;
    } else {
      equip = {
        id,
        name: str("name"),
        brand: str("brand", "Personnalisé"),
        vmaxV: num("vmaxV"),
        imaxA: num("imaxA"),
        priceXOF: num("priceXOF", 0),
      } as MpptController;
    }

    onAdd(equip);
    onClose();
  }

  const requiredFields = fields.filter((f) => f.required);
  const optionalFields = fields.filter((f) => !f.required);
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-earth-900/50 backdrop-blur-sm z-[9990]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9991] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-earth-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-solar-50 rounded-xl flex items-center justify-center text-xl">
                {TYPE_ICONS[type]}
              </div>
              <div>
                <h2 className="font-display text-xl text-earth-900">
                  Ajouter un {TYPE_LABELS[type]}
                </h2>
                <p className="text-xs text-earth-400 mt-0.5">
                  Les champs marqués{" "}
                  <span className="text-red-500 font-bold">*</span> sont
                  obligatoires pour les calculs SAHELIO
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-earth-300 hover:text-earth-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Section champs obligatoires */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">
                  Champs obligatoires — calculs SAHELIO
                </span>
              </div>
              <div className="space-y-3">
                {requiredFields.map((f) => (
                  <FieldInput
                    key={f.key}
                    field={f}
                    value={values[f.key] || ""}
                    error={touched[f.key] ? errors[f.key] : undefined}
                    onChange={(v) => handleChange(f.key, v)}
                    onBlur={() => handleBlur(f.key)}
                  />
                ))}
              </div>
            </div>

            {/* Section champs optionnels */}
            {optionalFields.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-3.5 h-3.5 text-earth-400" />
                  <span className="text-xs font-semibold text-earth-400 uppercase tracking-wide">
                    Informations complémentaires (optionnel)
                  </span>
                </div>
                <div className="space-y-3">
                  {optionalFields.map((f) => (
                    <FieldInput
                      key={f.key}
                      field={f}
                      value={values[f.key] || ""}
                      error={touched[f.key] ? errors[f.key] : undefined}
                      onChange={(v) => handleChange(f.key, v)}
                      onBlur={() => handleBlur(f.key)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Résumé validation */}
            {hasErrors && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs text-red-600 font-semibold mb-1">
                  ⚠ Corrigez les erreurs suivantes :
                </p>
                {Object.entries(errors).map(([key, err]) => {
                  const f = fields.find((f) => f.key === key);
                  return (
                    <p key={key} className="text-xs text-red-500">
                      • {f?.label || key} : {err}
                    </p>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="p-6 border-t border-earth-100 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-earth-200 text-earth-600 text-sm font-medium hover:bg-earth-50 transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 rounded-xl bg-solar-gradient text-white text-sm font-semibold
                         flex items-center justify-center gap-2 hover:opacity-90 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              Ajouter l'équipement
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Composant champ individuel ──
function FieldInput({
  field,
  value,
  error,
  onChange,
  onBlur,
}: {
  field: (typeof REQUIRED_FIELDS)["panel"][0];
  value: string;
  error?: string;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  const [showHelp, setShowHelp] = useState(false);
  const isValid = !error && value.trim() !== "";

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="text-xs font-medium text-earth-600">
          {field.label}
          {field.required && <span className="text-red-500 ml-0.5">*</span>}
          {field.unit && (
            <span className="text-earth-400 ml-1">({field.unit})</span>
          )}
        </label>
        {isValid && (
          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
        )}
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="ml-auto text-earth-300 hover:text-earth-500 transition-colors"
        >
          <Info className="w-3 h-3" />
        </button>
      </div>

      {showHelp && (
        <div className="mb-1.5 p-2 bg-sky-50 border border-sky-100 rounded-lg">
          <p className="text-xs text-sky-700">{field.help}</p>
        </div>
      )}

      {field.type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={cn(
            "w-full border rounded-xl px-3 py-2.5 text-sm bg-white transition-all focus:outline-none",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-200"
              : value
                ? "border-green-300 focus:border-solar-400"
                : "border-earth-200 focus:border-solar-400 focus:ring-1 focus:ring-solar-100",
          )}
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type}
          value={value}
          min={field.min}
          max={field.max}
          step={field.step}
          placeholder={
            field.required
              ? `Obligatoire${field.unit ? ` (${field.unit})` : ""}`
              : `Optionnel${field.unit ? ` (${field.unit})` : ""}`
          }
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={cn(
            "w-full border rounded-xl px-3 py-2.5 text-sm transition-all focus:outline-none",
            error
              ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-1 focus:ring-red-200"
              : value
                ? "border-green-300 bg-white focus:border-solar-400"
                : "border-earth-200 bg-white focus:border-solar-400 focus:ring-1 focus:ring-solar-100",
          )}
        />
      )}

      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
