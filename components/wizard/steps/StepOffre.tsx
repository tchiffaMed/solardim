"use client";

import { useState } from "react";
import { FileText, Download, Edit3, BarChart3, Loader2 } from "lucide-react";
import { useSolarStore } from "@/lib/store";
import { calculateFinancial, calculateEnergyBilan } from "@/lib/calculations";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ProductionMensuelleChart,
  EnergyPieChart,
  IrradiationChart,
  FinancialPieChart,
  AutonomyGauge,
} from "@/components/charts/EnergyCharts";

export default function StepOffre() {
  const store = useSolarStore();
  const {
    projectName,
    clientName,
    setProjectInfo,
    charges,
    selectedPanel,
    selectedBattery,
    selectedInverter,
    selectedMppt,
    params,
    site,
    localPrepXOF,
    accessoriesXOF,
    installationXOF,
    supportPerPanelXOF,
    updatePrices,
    updateParams,
  } = store;

  // Récupérer results séparément pour un narrowing TypeScript correct
  const storeResults = store.results;

  const [editingProject, setEditingProject] = useState(false);
  const [customPrices, setCustomPrices] = useState<Record<number, number>>({});
  const [editingCell, setEditingCell] = useState<number | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [activeTab, setActiveTab] = useState<"offre" | "graphiques">("offre");
  const loc = site.location;

  // Garde null — après ce point, results est CalcResults (non-null)
  if (!storeResults) {
    return (
      <div className="wizard-card text-center py-16">
        <FileText className="w-12 h-12 text-earth-300 mx-auto mb-4" />
        <h2 className="font-display text-xl text-earth-700 mb-2">
          Lancez d'abord les calculs
        </h2>
        <p className="text-earth-400 text-sm">
          Retournez à l'étape 4 pour effectuer le dimensionnement SAHELIO.
        </p>
      </div>
    );
  }

  // À ce stade TypeScript sait que storeResults est CalcResults (non-null)
  const results = storeResults;

  const financial = calculateFinancial({
    panel: selectedPanel,
    battery: selectedBattery,
    inverter: selectedInverter,
    mppt: selectedMppt,
    results,
    tvaPercent: params.tva,
    localPrepXOF,
    accessoriesXOF,
    installationXOF,
    supportPerPanelXOF,
  });

  const lines = financial.lines.map((line, i) => ({
    ...line,
    unitPriceXOF: customPrices[i] ?? line.unitPriceXOF,
    totalXOF: (customPrices[i] ?? line.unitPriceXOF) * line.quantity,
  }));

  const totalHT = lines.reduce((s, l) => s + l.totalXOF, 0);
  const tvaAmt = (totalHT * params.tva) / 100;
  const totalTTC = totalHT + tvaAmt;
  const batteryWh =
    results.nbTotal * selectedBattery.capacityAh * selectedBattery.voltageV;
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  async function handleExportPDF() {
    if (!results) return;
    setGeneratingPDF(true);
    try {
      const { generatePDF } = await import("@/lib/pdfGenerator");
      const bilanWithCalc = calculateEnergyBilan(
        charges,
        params.reservePercent,
      );
      await generatePDF({
        projectName,
        clientName,
        charges: bilanWithCalc.chargesWithCalc,
        site,
        panel: selectedPanel,
        battery: selectedBattery,
        inverter: selectedInverter,
        mppt: selectedMppt,
        params,
        results: results, // non-null garanti par la garde ci-dessus
        financial: {
          ...financial,
          lines,
          totalHT,
          tvaAmount: tvaAmt,
          totalTTC,
        },
      });
      toast.success("Rapport PDF généré !", {
        description: "Le fichier a été téléchargé.",
      });
    } catch (err) {
      console.error(err);
      toast.error("Erreur PDF", { description: "Vérifiez la console." });
    } finally {
      setGeneratingPDF(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-earth-900">
            Offre technico-financière
          </h1>
          <p className="text-earth-500 mt-1 text-sm">
            Double-cliquez sur un prix pour le modifier. Exportez le rapport PDF
            complet.
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={generatingPDF}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold shadow-md transition-all flex-shrink-0",
            generatingPDF
              ? "bg-earth-200 text-earth-400 cursor-not-allowed"
              : "bg-solar-gradient text-white hover:opacity-90",
          )}
        >
          {generatingPDF ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Génération…
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Exporter PDF
            </>
          )}
        </button>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-earth-100 p-1 rounded-xl w-fit">
        {[
          { key: "offre", label: "💰 Offre financière" },
          { key: "graphiques", label: "📊 Graphiques & analyses" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === t.key
                ? "bg-white text-earth-800 shadow-sm"
                : "text-earth-500 hover:text-earth-700",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "offre" && (
        <>
          {/* Header projet */}
          <div className="wizard-card bg-gradient-to-br from-earth-900 to-earth-800 text-white">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-solar-gradient rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-lg">☀️</span>
                  </div>
                  <div>
                    <div className="font-display text-xl">SolarDim Niger</div>
                    <div className="text-earth-400 text-xs">
                      Dimensionnement PV · Méthode SAHELIO
                    </div>
                  </div>
                </div>
                {editingProject ? (
                  <div className="space-y-2">
                    <input
                      defaultValue={projectName}
                      autoFocus
                      onBlur={(e) => {
                        setProjectInfo(e.target.value, clientName);
                        setEditingProject(false);
                      }}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white w-full focus:outline-none"
                    />
                    <input
                      defaultValue={clientName}
                      placeholder="Client"
                      onBlur={(e) =>
                        setProjectInfo(projectName, e.target.value)
                      }
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white w-full focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="group flex items-start gap-2">
                    <div>
                      <h2 className="font-display text-2xl text-white">
                        {projectName}
                      </h2>
                      {clientName && (
                        <p className="text-earth-300 text-sm mt-0.5">
                          Client : {clientName}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setEditingProject(true)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-earth-400" />
                    </button>
                  </div>
                )}
              </div>
              <div className="text-right text-sm flex-shrink-0 space-y-2">
                <div>
                  <p className="text-earth-400 text-xs">Date</p>
                  <p className="text-white font-medium">{today}</p>
                </div>
                {loc && (
                  <div>
                    <p className="text-earth-400 text-xs">Site</p>
                    <p className="text-white">
                      {loc.ville}
                      {loc.region ? ` — ${loc.region}` : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: "Puissance installée",
                  value: `${results.pcInstalled.toLocaleString()} Wc`,
                },
                {
                  label: `Panneaux (${results.nps}S×${results.nbrp}P)`,
                  value: `${results.npTotal} × ${selectedPanel.wp}Wc`,
                },
                {
                  label: "Batteries",
                  value: `${results.nbTotal} × ${selectedBattery.capacityAh}Ah/${selectedBattery.voltageV}V`,
                },
                {
                  label: "Tension système",
                  value: `${results.systemVoltage} V`,
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-earth-400 text-xs mb-0.5">{label}</p>
                  <p className="text-white font-semibold text-sm">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tableau financier */}
          <div className="wizard-card">
            <div className="section-title">Détail de l'offre</div>
            <div className="overflow-x-auto -mx-2">
              <table className="data-table min-w-[520px]">
                <thead>
                  <tr>
                    <th className="min-w-[150px]">Équipement</th>
                    <th>Caractéristiques</th>
                    <th className="text-center">Qté</th>
                    <th className="text-right">Prix unit. (FCFA)</th>
                    <th className="text-right">Total (FCFA)</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={i}>
                      <td className="font-semibold text-earth-800">
                        {line.label}
                      </td>
                      <td className="text-earth-500 text-xs">
                        {line.description}
                      </td>
                      <td className="text-center font-medium">
                        {line.quantity}
                      </td>
                      <td className="text-right">
                        {editingCell === i ? (
                          <input
                            type="number"
                            defaultValue={line.unitPriceXOF}
                            autoFocus
                            onBlur={(e) => {
                              setCustomPrices((p) => ({
                                ...p,
                                [i]: +e.target.value || 0,
                              }));
                              setEditingCell(null);
                            }}
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              (e.target as HTMLInputElement).blur()
                            }
                            className="w-28 text-right border border-solar-300 rounded-lg px-2 py-1 text-sm focus:outline-none"
                          />
                        ) : (
                          <button
                            onDoubleClick={() => setEditingCell(i)}
                            className="font-medium hover:text-solar-600 transition-colors cursor-text"
                          >
                            {line.unitPriceXOF.toLocaleString("fr-FR")}
                          </button>
                        )}
                      </td>
                      <td className="text-right font-semibold text-earth-800">
                        {line.totalXOF.toLocaleString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-earth-50 font-semibold">
                    <td
                      colSpan={4}
                      className="text-right text-xs uppercase tracking-wide text-earth-500 py-3"
                    >
                      Total HT
                    </td>
                    <td className="text-right py-3 text-earth-800">
                      {totalHT.toLocaleString("fr-FR")}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={4}
                      className="text-right text-xs text-earth-500 py-2"
                    >
                      TVA ({params.tva}%)
                    </td>
                    <td className="text-right py-2 text-earth-600">
                      {tvaAmt.toLocaleString("fr-FR")}
                    </td>
                  </tr>
                  <tr className="bg-solar-50 border-t-2 border-solar-300">
                    <td
                      colSpan={4}
                      className="text-right font-bold text-solar-800 py-3"
                    >
                      TOTAL TTC
                    </td>
                    <td className="text-right font-bold text-solar-700 text-base py-3">
                      {totalTTC.toLocaleString("fr-FR")} FCFA
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Ajustements */}
          <div className="wizard-card">
            <div className="section-title">Ajustements des prix</div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Préparation local (FCFA)",
                  key: "localPrepXOF" as const,
                  value: localPrepXOF,
                },
                {
                  label: "Accessoires lot (FCFA)",
                  key: "accessoriesXOF" as const,
                  value: accessoriesXOF,
                },
                {
                  label: "Installation / MO (FCFA)",
                  key: "installationXOF" as const,
                  value: installationXOF,
                },
                {
                  label: "Support / panneau (FCFA)",
                  key: "supportPerPanelXOF" as const,
                  value: supportPerPanelXOF,
                },
              ].map(({ label, key, value }) => (
                <div key={key}>
                  <label className="field-label">{label}</label>
                  <input
                    type="number"
                    min="0"
                    value={value}
                    onChange={(e) => updatePrices({ [key]: +e.target.value })}
                    className="field-input"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 w-24">
              <label className="field-label">TVA (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={params.tva}
                onChange={(e) => updateParams({ tva: +e.target.value })}
                className="field-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="metric-card">
              <div className="metric-label">Total HT</div>
              <div className="metric-value text-earth-700 text-xl">
                {(totalHT / 1000000).toFixed(2)}M
              </div>
              <div className="metric-unit">FCFA</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">TVA ({params.tva}%)</div>
              <div className="metric-value text-earth-500 text-xl">
                {(tvaAmt / 1000000).toFixed(2)}M
              </div>
              <div className="metric-unit">FCFA</div>
            </div>
            <div className="metric-card bg-solar-50 border border-solar-200">
              <div className="metric-label text-solar-600">Total TTC</div>
              <div className="metric-value text-solar-700 text-xl">
                {(totalTTC / 1000000).toFixed(2)}M
              </div>
              <div className="metric-unit text-solar-500">FCFA</div>
            </div>
          </div>
        </>
      )}

      {activeTab === "graphiques" && (
        <div className="space-y-5">
          <div className="wizard-card">
            <div className="section-title">
              <BarChart3 className="w-3.5 h-3.5 text-solar-500" />
              Production mensuelle estimée
            </div>
            <ProductionMensuelleChart
              pcInstalled={results.pcInstalled}
              rp={params.rp}
              latitude={loc?.lat ?? 13.5}
              irrDefavorable={loc?.irrDefavorable ?? 4.2}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="wizard-card">
              <div className="section-title">Irradiation annuelle du site</div>
              <IrradiationChart
                irrDefavorable={loc?.irrDefavorable ?? 4.2}
                latitude={loc?.lat ?? 13.5}
              />
            </div>
            <div className="wizard-card">
              <div className="section-title">
                Répartition énergétique jour/nuit
              </div>
              <EnergyPieChart
                dailyEnergy={results.dailyEnergyWithReserve}
                nightEnergy={results.nightEnergyWithReserve}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="wizard-card">
              <div className="section-title">Couverture autonomie nocturne</div>
              <AutonomyGauge
                nightEnergyWh={results.nightEnergyWithReserve}
                batteryCapacityWh={batteryWh}
                autonomyDays={params.autonomyDays}
              />
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="bg-earth-50 rounded-lg p-2.5">
                  <p className="text-earth-400">Énergie nocturne requise</p>
                  <p className="font-semibold text-earth-700 mt-0.5">
                    {results.nightEnergyWithReserve.toLocaleString("fr-FR")} Wh
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-2.5">
                  <p className="text-earth-400">Capacité stockage total</p>
                  <p className="font-semibold text-green-700 mt-0.5">
                    {batteryWh.toLocaleString("fr-FR")} Wh
                  </p>
                </div>
              </div>
            </div>
            <div className="wizard-card">
              <div className="section-title">Répartition coûts</div>
              <FinancialPieChart lines={lines} />
            </div>
          </div>
          <div className="wizard-card bg-earth-50">
            <div className="section-title">📝 Synthèse</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                {
                  label: "Pcmin calculée",
                  value: `${results.pcMin.toFixed(0)} Wc`,
                },
                {
                  label: "Pcmin installée",
                  value: `${results.pcInstalled.toLocaleString()} Wc`,
                },
                {
                  label: "Surplus champ",
                  value: `+${((results.pcInstalled / results.pcMin - 1) * 100).toFixed(1)}%`,
                },
                {
                  label: "Parc batteries",
                  value: `${results.parkCapacityAh.toFixed(0)} Ah/${results.systemVoltage}V`,
                },
                { label: "Autonomie", value: `${params.autonomyDays} nuit(s)` },
                {
                  label: "Section câble",
                  value: `${results.cableSectionStandard} mm² Cu`,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-white rounded-lg p-2.5 border border-earth-100"
                >
                  <p className="text-earth-400">{label}</p>
                  <p className="font-semibold text-earth-700 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
