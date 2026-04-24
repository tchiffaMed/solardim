"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Info,
  Zap,
  Moon,
  Sun,
  AlertTriangle,
} from "lucide-react";
import { useSolarStore } from "@/lib/store";
import { calculateEnergyBilan } from "@/lib/calculations";
import { CHARGE_TYPES, CHARGE_EXAMPLES } from "@/lib/data";
import type { ChargeType } from "@/types";
import { cn } from "@/lib/utils";

export default function StepBilan() {
  const {
    charges,
    addCharge,
    updateCharge,
    removeCharge,
    params,
    updateParams,
  } = useSolarStore();

  const [showExamples, setShowExamples] = useState(false);

  const bilan = calculateEnergyBilan(charges, params.reservePercent);

  const getSystemVoltageLabel = (pcMin: number) => {
    if (pcMin <= 0) return "—";
    if (pcMin <= 500) return "12 V";
    if (pcMin <= 2000) return "24 V";
    if (pcMin <= 10000) return "48 V";
    return "96 V";
  };

  // Estimation rapide Pcmin pour afficher Us
  const roughIrr = 4.2; // Niamey par défaut
  const roughPcmin = bilan.totalWithReserve / (params.rp * roughIrr);
  const roughUs = getSystemVoltageLabel(roughPcmin);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-earth-900">
          Bilan énergétique
        </h1>
        <p className="text-earth-500 mt-1.5 text-sm">
          Recensez tous les équipements électriques. Séparez les durées jour
          (08h–16h) et nuit (17h–08h) pour optimiser le dimensionnement du parc
          batterie.{" "}
          <span className="font-medium text-solar-600">( SAHELIO §4.1.2)</span>
        </p>
      </div>

      {/* Info  SAHELIO */}
      <div className="alert-info flex items-start gap-3">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <strong>Méthode SAHELIO :</strong> Le besoin énergétique journalier =
          somme des énergies × 1,25 (taux de réserve 25%). Dans un milieu
          poussiéreux (Niger), le ratio de performance Rp ={" "}
          <strong>0,65</strong>.
        </div>
      </div>

      {/* Tableau des charges */}
      <div className="wizard-card">
        <div className="section-title">
          <Zap className="w-3.5 h-3.5" />
          Liste des charges
        </div>

        <div className="overflow-x-auto -mx-2">
          <table className="data-table min-w-[700px]">
            <thead>
              <tr>
                <th className="min-w-[150px]">Appareil</th>
                <th>Type</th>
                <th>N</th>
                <th>Pu (W)</th>
                <th>Pt (W)</th>
                <th>
                  <div className="flex items-center gap-1">
                    <Sun className="w-3 h-3 text-solar-500" />
                    Dj (h)
                  </div>
                </th>
                <th>
                  <div className="flex items-center gap-1">
                    <Moon className="w-3 h-3 text-sky-500" />
                    Dn (h)
                  </div>
                </th>
                <th className="text-solar-600">Ej (Wh)</th>
                <th className="text-sky-600">En (Wh)</th>
                <th className="text-earth-600">Etot (Wh)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bilan.chargesWithCalc.map((charge) => (
                <tr key={charge.id} className="group">
                  <td>
                    <input
                      type="text"
                      value={charge.name}
                      onChange={(e) =>
                        updateCharge(charge.id, { name: e.target.value })
                      }
                      className="w-full min-w-[130px]"
                    />
                  </td>
                  <td>
                    <select
                      value={charge.type}
                      onChange={(e) =>
                        updateCharge(charge.id, {
                          type: e.target.value as ChargeType,
                        })
                      }
                      className="min-w-[110px]"
                    >
                      {CHARGE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={charge.quantity}
                      onChange={(e) =>
                        updateCharge(charge.id, {
                          quantity: +e.target.value || 1,
                        })
                      }
                      className="w-14 text-center"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={charge.unitPower}
                      onChange={(e) =>
                        updateCharge(charge.id, {
                          unitPower: +e.target.value || 0,
                        })
                      }
                      className="w-20"
                    />
                  </td>
                  <td className="font-semibold text-earth-700 text-center">
                    {charge.totalPower?.toLocaleString()}
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="16"
                      step="0.5"
                      value={charge.dailyHours}
                      onChange={(e) =>
                        updateCharge(charge.id, {
                          dailyHours: +e.target.value || 0,
                        })
                      }
                      className="w-16 text-center"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="16"
                      step="0.5"
                      value={charge.nightlyHours}
                      onChange={(e) =>
                        updateCharge(charge.id, {
                          nightlyHours: +e.target.value || 0,
                        })
                      }
                      className="w-16 text-center"
                    />
                  </td>
                  <td className="text-right font-medium text-solar-600">
                    {charge.dailyEnergy?.toLocaleString()}
                  </td>
                  <td className="text-right font-medium text-sky-600">
                    {charge.nightlyEnergy?.toLocaleString()}
                  </td>
                  <td className="text-right font-semibold text-earth-700">
                    {charge.totalEnergy?.toLocaleString()}
                  </td>
                  <td>
                    <button
                      onClick={() => removeCharge(charge.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-earth-300
                                 hover:text-red-400 p-1 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Totaux */}
            <tfoot>
              <tr className="bg-earth-50 font-semibold text-sm">
                <td
                  colSpan={4}
                  className="text-earth-500 text-xs uppercase tracking-wide py-3 px-3"
                >
                  Total brut
                </td>
                <td className="text-center py-3 px-3 text-earth-700">
                  {bilan.peakPowerW.toLocaleString()} W
                </td>
                <td></td>
                <td></td>
                <td className="text-right py-3 px-3 text-solar-600">
                  {bilan.dailyEnergyWh.toLocaleString()}
                </td>
                <td className="text-right py-3 px-3 text-sky-600">
                  {bilan.nightEnergyWh.toLocaleString()}
                </td>
                <td className="text-right py-3 px-3 text-earth-700">
                  {bilan.totalEnergyWh.toLocaleString()}
                </td>
                <td></td>
              </tr>
              <tr className="bg-solar-50 font-semibold text-sm border-t-2 border-solar-200">
                <td
                  colSpan={4}
                  className="text-solar-600 text-xs uppercase tracking-wide py-3 px-3"
                >
                  Avec réserve ×{(1 + params.reservePercent / 100).toFixed(2)} (
                  {params.reservePercent}%)
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td className="text-right py-3 px-3 text-solar-700 font-bold">
                  {bilan.dailyWithReserve.toLocaleString()} Wh
                </td>
                <td className="text-right py-3 px-3 text-solar-700 font-bold">
                  {bilan.nightWithReserve.toLocaleString()} Wh
                </td>
                <td className="text-right py-3 px-3 text-solar-700 font-bold">
                  {bilan.totalWithReserve.toLocaleString()} Wh
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => addCharge()}
            className="flex items-center gap-2 text-sm text-solar-600 font-medium
                       bg-solar-50 hover:bg-solar-100 border border-solar-200 rounded-xl px-4 py-2
                       transition-all"
          >
            <Plus className="w-4 h-4" />
            Ajouter un appareil
          </button>
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center gap-2 text-sm text-earth-500 font-medium
                       hover:text-earth-700 bg-earth-50 hover:bg-earth-100 border border-earth-200
                       rounded-xl px-4 py-2 transition-all"
          >
            <Info className="w-4 h-4" />
            {showExamples ? "Masquer" : "Voir"} les exemples Niger
          </button>
        </div>

        {/* Examples dropdown */}
        {showExamples && (
          <div className="mt-4 p-4 bg-earth-50 rounded-xl border border-earth-200">
            <p className="text-xs font-semibold text-earth-500 uppercase tracking-wide mb-3">
              Charges courantes — Niger
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CHARGE_EXAMPLES.map((ex) => (
                <button
                  key={ex.name}
                  onClick={() =>
                    addCharge({
                      name: ex.name,
                      type: ex.type as ChargeType,
                      unitPower: ex.unitPower,
                    })
                  }
                  className="text-left text-xs p-2.5 bg-white rounded-lg border border-earth-100
                             hover:border-solar-300 hover:bg-solar-50 transition-all"
                >
                  <div className="font-medium text-earth-700 truncate">
                    {ex.name}
                  </div>
                  <div className="text-earth-400 mt-0.5">
                    {ex.unitPower} W · {ex.type}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Métriques résumé */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="metric-card">
          <div className="metric-label">Énergie totale (×1,25)</div>
          <div className="metric-value text-solar-600">
            {(bilan.totalWithReserve / 1000).toFixed(2)}
          </div>
          <div className="metric-unit">kWh/jour</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Énergie journée (Ej×1,25)</div>
          <div className="metric-value text-solar-500">
            {(bilan.dailyWithReserve / 1000).toFixed(2)}
          </div>
          <div className="metric-unit">kWh</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Énergie nocturne (En×1,25)</div>
          <div className="metric-value text-sky-600">
            {(bilan.nightWithReserve / 1000).toFixed(2)}
          </div>
          <div className="metric-unit">kWh</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Puissance de pointe</div>
          <div className="metric-value text-earth-700">
            {(bilan.peakPowerW / 1000).toFixed(2)}
          </div>
          <div className="metric-unit">kW</div>
        </div>
        <div className="metric-card bg-green-50">
          <div className="metric-label">Tension système Us</div>
          <div className="metric-value text-green-700">{roughUs}</div>
          <div className="metric-unit"> SAHELIO Tab. 3 (estimation)</div>
        </div>
      </div>

      {/* Paramètres */}
      <div className="wizard-card">
        <div className="section-title">
          <Info className="w-3.5 h-3.5" />
          Paramètres système
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="field-label">
              Ratio de performance Rp
              <span className="ml-1 text-solar-500 font-normal">
                (Niger poussiéreux = 0,65)
              </span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.5"
              max="0.95"
              value={params.rp}
              onChange={(e) => updateParams({ rp: +e.target.value })}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">
              Taux de réserve (%) — SAHELIO: 25%
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={params.reservePercent}
              onChange={(e) =>
                updateParams({ reservePercent: +e.target.value })
              }
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">
              DoD batteries (Li: 0,80–0,90 / Plomb: 0,50)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.4"
              max="0.95"
              value={params.autonomyDays}
              onChange={(e) => updateParams({ autonomyDays: +e.target.value })}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">Rendement onduleur ƞond</label>
            <input
              type="number"
              step="0.01"
              min="0.8"
              max="1"
              defaultValue={0.98}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">Longueur câble principal (m)</label>
            <input
              type="number"
              min="1"
              value={params.cableLength}
              onChange={(e) => updateParams({ cableLength: +e.target.value })}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">
              Chute de tension max (%) — SAHELIO: ≤ 3%
            </label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="5"
              value={params.voltageDrop}
              onChange={(e) => updateParams({ voltageDrop: +e.target.value })}
              className="field-input"
            />
          </div>
        </div>
      </div>

      {/* Validation warning */}
      {charges.length === 0 && (
        <div className="alert-warning flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Ajoutez au moins un appareil pour continuer.
        </div>
      )}
    </div>
  );
}
