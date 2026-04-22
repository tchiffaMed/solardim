"use client";

import { useEffect } from "react";
import {
  Sun,
  Battery,
  Zap,
  Settings,
  AlertTriangle,
  CheckCircle,
  Calculator,
  RefreshCw,
} from "lucide-react";
import { useSolarStore } from "@/lib/store";
import { formatWh, formatWc, formatXOF } from "@/lib/calculations";
import { cn } from "@/lib/utils";

function FormulaBox({ children }: { children: string }) {
  return <div className="formula-box">{children}</div>;
}

function ResultRow({
  label,
  value,
  highlight,
  formula,
  condition,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  formula?: string;
  condition?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex justify-between items-start py-2.5 border-b border-earth-50 last:border-0 gap-4",
        highlight && "bg-solar-50 -mx-4 px-4 rounded-lg border-0 my-1",
      )}
    >
      <div className="flex-1">
        <span className="text-sm text-earth-600">{label}</span>
        {formula && (
          <div className="text-xs font-mono text-earth-400 mt-0.5">
            {formula}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {condition !== undefined &&
          (condition ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          ))}
        <span
          className={cn(
            "font-semibold text-sm",
            highlight ? "text-solar-700 text-base" : "text-sky-700",
          )}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  color = "solar",
}: {
  icon: any;
  title: string;
  color?: string;
}) {
  return (
    <div className={cn("section-title", `text-${color}-600`)}>
      <Icon className="w-3.5 h-3.5" />
      {title}
    </div>
  );
}

export default function StepCalculs() {
  const {
    charges,
    site,
    selectedPanel,
    selectedBattery,
    selectedInverter,
    selectedMppt,
    params,
    results,
    runCalculation,
  } = useSolarStore();

  const canCalculate = charges.length > 0 && !!site.location;

  useEffect(() => {
    if (canCalculate) runCalculation();
  }, []);

  if (!canCalculate) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl text-earth-900">
          Calculs SAHELIO
        </h1>
        <div className="wizard-card text-center py-16">
          <AlertTriangle className="w-12 h-12 text-solar-400 mx-auto mb-4" />
          <h2 className="font-display text-xl text-earth-700 mb-2">
            Données incomplètes
          </h2>
          <p className="text-earth-500 text-sm max-w-sm mx-auto">
            Complétez le <strong>bilan énergétique</strong> (étape 1) et la{" "}
            <strong>localisation</strong> (étape 2) pour lancer les calculs.
          </p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="wizard-card text-center py-16">
        <div className="w-8 h-8 border-2 border-solar-300 border-t-solar-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-earth-500">Calcul en cours…</p>
      </div>
    );
  }

  const r = results;
  const irr = site.location!.irrDefavorable;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-earth-900">
            Calculs SAHELIO — Module 4
          </h1>
          <p className="text-earth-500 mt-1 text-sm">
            Méthode · Irradiation mois défavorable :{" "}
            <strong className="text-solar-600">{irr} kWh/m²/j</strong>
          </p>
        </div>
        <button
          onClick={() => runCalculation()}
          className="flex items-center gap-2 text-sm text-earth-500 bg-earth-50 hover:bg-earth-100 border border-earth-200 rounded-xl px-4 py-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Recalculer
        </button>
      </div>

      {/* Métriques rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          {
            label: "Pcmin",
            value: `${r.pcMin.toFixed(0)} Wc`,
            color: "text-solar-600",
          },
          {
            label: "Panneaux Np",
            value: `${r.npTotal}`,
            color: "text-sky-600",
          },
          {
            label: "Parc Cp",
            value: `${r.parkCapacityAh.toFixed(0)} Ah`,
            color: "text-green-600",
          },
          {
            label: "Batteries Nb",
            value: `${r.nbTotal}`,
            color: "text-green-600",
          },
          {
            label: "Onduleur",
            value: `${r.inverterPowerRequired.toFixed(0)} W`,
            color: "text-earth-600",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="metric-card">
            <div className="metric-label">{label}</div>
            <div className={cn("metric-value", color)}>{value}</div>
          </div>
        ))}
      </div>

      {/* A — Champ PV */}
      <div className="wizard-card">
        <SectionHeader
          icon={Sun}
          title="A — Champ solaire PV (SAHELIO §4.2.1.2)"
        />
        <div className="alert-info text-xs mb-4">
          Rp = {params.rp} (milieu poussiéreux Niger) · Irradiation mois
          défavorable : {irr} kWh/m²/j
        </div>

        <p className="text-xs font-semibold text-earth-400 uppercase tracking-wide mb-2">
          ① Puissance crête minimale
        </p>
        <FormulaBox>{`Pcmin = Etot×1,25 / (Rp × Irr) = ${r.totalEnergyWithReserve} / (${params.rp} × ${irr}) = ${r.pcMin.toFixed(1)} Wc`}</FormulaBox>
        <ResultRow
          label="Énergie totale journalière (×1,25)"
          value={`${r.totalEnergyWithReserve.toLocaleString()} Wh`}
        />
        <ResultRow
          label="Irradiation mois défavorable"
          value={`${irr} kWh/m²/j`}
        />
        <ResultRow label="Ratio de performance Rp" value={`${params.rp}`} />
        <ResultRow
          label="Tension système Us (SAHELIO Tableau 3)"
          value={`${r.systemVoltage} V`}
          formula={`Pcmin = ${r.pcMin.toFixed(0)}Wc → ${r.systemVoltage}V`}
        />
        <ResultRow
          label="⟹ Puissance crête minimale Pcmin"
          value={`${r.pcMin.toFixed(1)} Wc`}
          highlight
        />

        <div className="divider" />
        <p className="text-xs font-semibold text-earth-400 uppercase tracking-wide mb-2">
          ② Nombre de panneaux Np = ⌈Pcmin / Pcu⌉
        </p>
        <FormulaBox>{`Np = ⌈${r.pcMin.toFixed(1)} / ${selectedPanel.wp}⌉ = ⌈${(r.pcMin / selectedPanel.wp).toFixed(2)}⌉ = ${r.npTotal}`}</FormulaBox>
        <ResultRow
          label="Puissance panneau Pcu"
          value={`${selectedPanel.wp} Wc`}
        />
        <ResultRow
          label="⟹ Nombre de panneaux Np"
          value={`${r.npTotal} panneaux`}
          highlight
        />

        <div className="divider" />
        <p className="text-xs font-semibold text-earth-400 uppercase tracking-wide mb-2">
          ③ Configuration série / parallèle
        </p>
        <FormulaBox>{`Nps = Us/Vnom = ${r.systemVoltage}/${selectedPanel.vnom} = ${r.nps} | Nbrp = ⌈${r.npTotal}/${r.nps}⌉ = ${r.nbrp}`}</FormulaBox>
        <ResultRow
          label="Panneaux en série Nps = Us/Vnom"
          value={`${r.nps} (${r.systemVoltage}V ÷ ${selectedPanel.vnom}V)`}
        />
        <ResultRow
          label="Strings en parallèle Nbrp = ⌈Np/Nps⌉"
          value={`${r.nbrp} strings`}
        />
        <ResultRow
          label="Np total installé = Nps × Nbrp"
          value={`${r.npTotal} panneaux`}
        />
        <ResultRow
          label="⟹ Puissance installée = Nps×Nbrp×Pcu"
          value={`${r.pcInstalled.toLocaleString()} Wc ≥ ${r.pcMin.toFixed(0)} Wc ✓`}
          highlight
        />
      </div>

      {/* B — Batteries */}
      <div className="wizard-card">
        <SectionHeader
          icon={Battery}
          title="B — Parc batterie (SAHELIO §4.2.2.1) — résultat en Ah"
          color="sky"
        />
        <FormulaBox>{`Cp [Ah] = (En×1,25 × Nj) / (Us × DoD × Rb)\n= (${r.nightEnergyWithReserve} × ${params.autonomyDays}) / (${r.systemVoltage} × ${selectedBattery.dod} × ${selectedBattery.efficiency})\n= ${r.parkCapacityAh.toFixed(1)} Ah`}</FormulaBox>
        <ResultRow
          label="Énergie nocturne (×1,25)"
          value={`${r.nightEnergyWithReserve.toLocaleString()} Wh`}
        />
        <ResultRow
          label="Autonomie Nj"
          value={`${params.autonomyDays} jour(s)`}
        />
        <ResultRow
          label="Us × DoD × Rb"
          value={`${r.systemVoltage} × ${selectedBattery.dod} × ${selectedBattery.efficiency} = ${(r.systemVoltage * selectedBattery.dod * selectedBattery.efficiency).toFixed(3)}`}
        />
        <ResultRow
          label="⟹ Capacité parc Cp"
          value={`${r.parkCapacityAh.toFixed(1)} Ah`}
          highlight
        />

        <div className="divider" />
        <p className="text-xs font-semibold text-earth-400 uppercase tracking-wide mb-2">
          Série / Parallèle
        </p>
        <FormulaBox>{`Nbs = Us/Ub = ${r.systemVoltage}/${selectedBattery.voltageV} = ${r.nbs} | Nbp = ⌈${r.parkCapacityAh.toFixed(1)}/${selectedBattery.capacityAh}⌉ = ${r.nbp}\nNb = Nbs × Nbp = ${r.nbs} × ${r.nbp} = ${r.nbTotal}`}</FormulaBox>
        <ResultRow
          label="Batteries en série Nbs = Us/Ub"
          value={`${r.nbs} (${r.systemVoltage}V ÷ ${selectedBattery.voltageV}V)`}
        />
        <ResultRow
          label="Batteries en parallèle Nbp = ⌈Cp/Cap_bat⌉"
          value={`${r.nbp} (⌈${r.parkCapacityAh.toFixed(1)}/${selectedBattery.capacityAh}⌉)`}
        />
        <ResultRow
          label="⟹ Total batteries Nb = Nbs × Nbp"
          value={`${r.nbTotal} batteries`}
          highlight
        />
      </div>

      {/* C — MPPT */}
      <div className="wizard-card">
        <SectionHeader
          icon={Settings}
          title="C — Régulateur MPPT (SAHELIO §4.2.2.2.2) — 3 conditions"
          color="earth"
        />
        <div className="alert-info text-xs mb-4">
          Les 3 conditions sont CUMULATIVES : le régulateur doit les vérifier
          toutes.
        </div>
        <FormulaBox>{`Voct = Voc × Nps = ${selectedPanel.voc} × ${r.nps} = ${r.voct.toFixed(1)}V\nIcct = Isc × Nbrp = ${selectedPanel.isc} × ${r.nbrp} = ${r.icct.toFixed(1)}A`}</FormulaBox>
        <ResultRow
          label="① Pmrc ≥ 1,25 × Pcu × Np"
          value={`≥ ${r.pmrcRequired.toFixed(0)} W`}
          condition={selectedMppt.vmaxV * selectedMppt.imaxA >= r.pmrcRequired}
          formula={`1,25 × ${selectedPanel.wp} × ${r.npTotal}`}
        />
        <ResultRow
          label="② Vmrc ≥ 1,25 × Voc × Nps"
          value={`≥ ${r.vmrcRequired.toFixed(1)} V`}
          condition={selectedMppt.vmaxV >= r.vmrcRequired}
          formula={`1,25 × ${selectedPanel.voc} × ${r.nps} → MPPT Vmax = ${selectedMppt.vmaxV}V`}
        />
        <ResultRow
          label="③ Imrc ≥ 1,25 × Isc × Nbrp"
          value={`≥ ${r.imrcRequired.toFixed(1)} A`}
          condition={selectedMppt.imaxA >= r.imrcRequired / r.nMpptRequired}
          formula={`1,25 × ${selectedPanel.isc} × ${r.nbrp} → MPPT Imax = ${selectedMppt.imaxA}A`}
        />
        <ResultRow
          label="⟹ Nombre de MPPT nécessaires"
          value={`${r.nMpptRequired} × ${selectedMppt.name}`}
          highlight
        />
      </div>

      {/* D — Onduleur */}
      <div className="wizard-card">
        <SectionHeader
          icon={Zap}
          title="D — Onduleur (SAHELIO §4.2.2.3)"
          color="green"
        />
        <FormulaBox>{`P_ond = k × Ppt / ƞond = 1,25 × ${r.peakPowerW} / ${selectedInverter.efficiency} = ${r.inverterPowerRequired.toFixed(0)} W`}</FormulaBox>
        <ResultRow
          label="Puissance de pointe Ppt"
          value={`${r.peakPowerW.toLocaleString()} W`}
        />
        <ResultRow
          label="⟹ Puissance onduleur requise"
          value={`${r.inverterPowerRequired.toFixed(0)} W`}
          highlight
        />
        <ResultRow
          label="Nombre onduleurs nécessaires"
          value={`${r.nInvertersRequired} × ${selectedInverter.name}`}
        />

        <div className="divider" />
        <p className="text-xs font-semibold text-earth-400 uppercase tracking-wide mb-2">
          Disjoncteur AC (§4.2.2.5.2)
        </p>
        <FormulaBox>{`In > 1,1 × (1,5 × P_conv) / (A × U × 0,95) | A=1 monophasé`}</FormulaBox>
        <ResultRow
          label="Calibre disj. AC monophasé"
          value={`> ${r.acBreakerCalib.toFixed(1)} A`}
        />
      </div>

      {/* E — Câbles & Protections */}
      <div className="wizard-card">
        <SectionHeader
          icon={AlertTriangle}
          title="E — Câbles & Protections (SAHELIO §4.2.2.4-5)"
          color="earth"
        />
        <FormulaBox>{`S = (2 × L × Ie × ρ) / ΔU(V) | ρ_Cu = 0,017 Ω·mm²/m\nIe = Pcmin/Us = ${r.pcMin.toFixed(0)}/${r.systemVoltage} = ${r.currentIe.toFixed(1)}A\nΔU = ${params.voltageDrop}% × ${r.systemVoltage}V = ${r.voltageDrop.toFixed(2)}V\nS = (2 × ${params.cableLength} × ${r.currentIe.toFixed(1)} × 0,017) / ${r.voltageDrop.toFixed(2)} = ${r.cableSectionMm2.toFixed(1)} mm²`}</FormulaBox>
        <ResultRow
          label="Courant d'emploi Ie = Pcmin/Us"
          value={`${r.currentIe.toFixed(1)} A`}
        />
        <ResultRow
          label="Chute de tension ΔU(V)"
          value={`${r.voltageDrop.toFixed(2)} V (${params.voltageDrop}%)`}
        />
        <ResultRow
          label="Section calculée S"
          value={`${r.cableSectionMm2.toFixed(1)} mm²`}
        />
        <ResultRow
          label="⟹ Section normalisée (cuivre)"
          value={`${r.cableSectionStandard} mm² Cu`}
          highlight
        />

        <div className="divider" />
        <p className="text-xs font-semibold text-earth-400 uppercase tracking-wide mb-3">
          Protections électriques (SAHELIO §4.2.2.5)
        </p>
        <ResultRow
          label="Disj. DC : 1,4×Isc < In < 2×Isc"
          value={`${r.dcBreaker_min.toFixed(1)}A < In < ${r.dcBreaker_max.toFixed(1)}A`}
          formula={`Isc panneau = ${selectedPanel.isc}A`}
        />
        <ResultRow
          label="Ue disj. DC > Voct"
          value={`> ${r.voct.toFixed(1)} V`}
        />
        <ResultRow
          label="Parafoudre DC type 2 : Up < 0,8×Uw"
          value={`Up < ${r.surgeProtectionUp.toFixed(0)} V`}
        />
        <ResultRow
          label="Fusibles chaînes PV (SAHELIO Tab.6)"
          value={r.fuseInfo}
        />
        <ResultRow
          label="Sectionneur DC — Calibre In >"
          value={`${r.sectionneurIn.toFixed(1)} A`}
        />
        <ResultRow
          label="Sectionneur DC — Tension Ue >"
          value={`${r.sectionneurUe.toFixed(1)} V`}
        />
        <ResultRow label="Prise de terre RA" value="< 10 Ω (NF C 15-100)" />
      </div>
    </div>
  );
}
