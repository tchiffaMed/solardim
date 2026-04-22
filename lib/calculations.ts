/**
 * MOTEUR DE CALCUL — Méthode  , Module 4
 * Dimensionnement d'une installation solaire photovoltaïque
 *
 * Référence : Manuel SAHELIO — Électricité Solaire Photovoltaïque
 * Institut de la Francophonie pour le Développement Durable
 */

import type {
  Charge, Panel, Battery, Inverter, MpptController,
  SystemParams, CalcResults, InstallationSite
} from '@/types';

// ============================================================
// CONSTANTES
// ============================================================
const RHO_CUIVRE = 0.017; // Résistivité cuivre Ω·mm²/m

// Sections câble normalisées (SAHELIO Tableau 4)
const STANDARD_SECTIONS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];

// Courants max par section (SAHELIO Tableau 4)
export const SECTION_MAX_CURRENT: Record<number, number> = {
  1.5: 13, 2.5: 21, 4: 28, 6: 36, 10: 46, 16: 61,
  25: 81, 35: 99, 50: 125, 70: 160, 95: 195, 120: 220,
  150: 250, 185: 285, 240: 340, 300: 395,
};

// Tension tenue aux chocs Uw (SAHELIO Tableau 5) — Modules classe A
const UW_CHOC: Array<{ umax: number; uw: number }> = [
  { umax: 100, uw: 1500 },
  { umax: 150, uw: 2500 },
  { umax: 300, uw: 4000 },
  { umax: 600, uw: 6000 },
  { umax: Infinity, uw: 8000 },
];

// ============================================================
// HELPERS
// ============================================================

/** Tension système Us selon puissance crête — SAHELIO Tableau 3 */
export function getSystemVoltage(pcMinWc: number): number {
  if (pcMinWc <= 500)   return 12;
  if (pcMinWc <= 2000)  return 24;
  if (pcMinWc <= 10000) return 48;
  return 96;
}

/** Section de câble normalisée supérieure */
export function getStandardSection(calculated: number): number {
  return STANDARD_SECTIONS.find(s => s >= calculated) ?? 300;
}

/** Uw selon tension max système (SAHELIO Tableau 5) */
function getUw(voctMax: number): number {
  return UW_CHOC.find(e => voctMax <= e.umax)?.uw ?? 8000;
}

/** Info fusibles selon nombre de chaînes (SAHELIO Tableau 6) */
function getFuseInfo(nChaines: number, isc: number): string {
  if (nChaines <= 2) {
    return `Sans objet (${nChaines} chaîne${nChaines > 1 ? 's' : ''}) — Iz ≥ ${(1.25 * isc).toFixed(1)} A`;
  }
  if (nChaines === 3) {
    return `Sans objet (3 chaînes) — Iz ≥ ${(2 * 1.25 * isc).toFixed(1)} A`;
  }
  return `${(1.25 * isc).toFixed(1)} A ≤ In ≤ ${(2 * isc).toFixed(1)} A (${nChaines} chaînes) — Iz ≥ ${(2 * 1.25 * isc).toFixed(1)} A`;
}

// ============================================================
// BILAN ÉNERGÉTIQUE
// ============================================================

export interface EnergyBilan {
  totalEnergyWh: number;
  dailyEnergyWh: number;
  nightEnergyWh: number;
  totalWithReserve: number;
  dailyWithReserve: number;
  nightWithReserve: number;
  peakPowerW: number;
  chargesWithCalc: Charge[];
}

export function calculateEnergyBilan(
  charges: Charge[],
  reservePercent: number
): EnergyBilan {
  const k = 1 + reservePercent / 100;

  let totalPower = 0, totalEj = 0, totalEn = 0;

  const chargesWithCalc = charges.map(c => {
    const pt = c.quantity * c.unitPower;
    const ej = pt * c.dailyHours;
    const en = pt * c.nightlyHours;
    totalPower += pt;
    totalEj += ej;
    totalEn += en;
    return {
      ...c,
      totalPower: pt,
      dailyEnergy: ej,
      nightlyEnergy: en,
      totalEnergy: ej + en,
    };
  });

  return {
    totalEnergyWh: totalEj + totalEn,
    dailyEnergyWh: totalEj,
    nightEnergyWh: totalEn,
    totalWithReserve: Math.round((totalEj + totalEn) * k),
    dailyWithReserve: Math.round(totalEj * k),
    nightWithReserve: Math.round(totalEn * k),
    peakPowerW: totalPower,
    chargesWithCalc,
  };
}

// ============================================================
// DIMENSIONNEMENT COMPLET — MÉTHODE SAHELIO
// ============================================================

export function calculate(
  charges: Charge[],
  site: InstallationSite,
  panel: Panel,
  battery: Battery,
  inverter: Inverter,
  mppt: MpptController,
  params: SystemParams
): CalcResults {

  const irr = site.location?.irrDefavorable ?? 4.2;
  const k = 1 + params.reservePercent / 100;

  // ── Bilan énergétique ──
  const bilan = calculateEnergyBilan(charges, params.reservePercent);
  const { totalWithReserve: Et, nightWithReserve: En, peakPowerW: Ppt } = bilan;

  // ── A — CHAMP PV (SAHELIO §4.2.1.2) ──

  // Puissance crête minimale
  const pcMin = Et / (params.rp * irr);

  // Tension système (SAHELIO Tableau 3)
  const Us = getSystemVoltage(pcMin);

  // Nombre de panneaux en série Nps = Us / Vnom_panneau
  const Nps = Math.max(1, Math.round(Us / panel.vnom));

  // Nombre total de panneaux Np = ⌈Pcmin / Pcu⌉
  const npRaw = pcMin / panel.wp;
  const npMin = Math.ceil(npRaw);

  // Strings en parallèle Nbrp = ⌈Np / Nps⌉
  const Nbrp = Math.ceil(npMin / Nps);

  // Total installé = Nps × Nbrp
  const npTotal = Nps * Nbrp;
  const pcInstalled = npTotal * panel.wp;

  // ── B — BATTERIES (SAHELIO §4.2.2.1) ──
  // Cp [Ah] = (En × Nj) / (Us × DoD × Rb)
  const Cp = (En * params.autonomyDays) / (battery.voltageV !== Us
    ? (Us * battery.dod * battery.efficiency)
    : (Us * battery.dod * battery.efficiency));

  // En réalité la formule utilise Us du système
  const CpAh = (En * params.autonomyDays) / (Us * battery.dod * battery.efficiency);

  // Batteries en série Nbs = Us / Ub
  const Nbs = Math.ceil(Us / battery.voltageV);

  // Batteries en parallèle Nbp = ⌈Cp / Cap_bat⌉
  const Nbp = Math.ceil(CpAh / battery.capacityAh);

  // Total batteries
  const NbTotal = Nbs * Nbp;

  // ── C — RÉGULATEUR MPPT (SAHELIO §4.2.2.2.2) — 3 CONDITIONS ──
  const Voct = panel.voc * Nps;
  const Icct = panel.isc * Nbrp;

  // Condition ① : Pmrc ≥ 1.25 × Pcu × Np
  const Pmrc = 1.25 * panel.wp * npTotal;

  // Condition ② : Vmrc ≥ 1.25 × Voc × Nps
  const Vmrc = 1.25 * panel.voc * Nps;

  // Condition ③ : Imrc ≥ 1.25 × Icc × Nbrp
  const Imrc = 1.25 * panel.isc * Nbrp;

  // Nombre de MPPT nécessaires
  const nMppt = Math.ceil(Imrc / mppt.imaxA);

  // ── D — ONDULEUR (SAHELIO §4.2.2.3) ──
  // P_ond = k × Ppt / ƞond avec k=1.25
  const Pond = (1.25 * Ppt) / inverter.efficiency;
  const nOnd = Math.ceil(Pond / inverter.powerW);

  // Disjoncteur AC monophasé (SAHELIO §4.2.2.5.2)
  // In > 1.1 × (1.5 × P_conv) / (A × U × (1-ΔU))
  const InAC = 1.1 * (1.5 * inverter.powerW) / (1 * 220 * 0.95);

  // ── E — CÂBLES (SAHELIO §4.2.2.4) ──
  // S = (2 × L × Ie × ρ) / ΔU(V)
  const Ie = pcMin / Us;
  const DUv = (params.voltageDrop / 100) * Us;
  const Section = (2 * params.cableLength * Ie * RHO_CUIVRE) / DUv;
  const SectionStd = getStandardSection(Section);

  // ── PROTECTIONS (SAHELIO §4.2.2.5) ──

  // Disjoncteur DC : 1.4×Isc < In < 2×Isc
  const DcBreakerMin = 1.4 * panel.isc;
  const DcBreakerMax = 2.0 * panel.isc;

  // Parafoudre DC type 2 : Up < 0.8 × Uw
  const Uw = getUw(Voct);
  const UpMax = 0.8 * Uw;

  // Fusibles (SAHELIO Tableau 6)
  const fuseInfo = getFuseInfo(Nbrp, panel.isc);

  // Sectionneur DC
  const sectIn = Nbrp * 1.25 * panel.isc;
  const sectUe = 1.2 * Nps * panel.voc;

  return {
    // Bilan
    totalEnergyWh:         bilan.totalEnergyWh,
    dailyEnergyWh:         bilan.dailyEnergyWh,
    nightEnergyWh:         bilan.nightEnergyWh,
    totalEnergyWithReserve: bilan.totalWithReserve,
    dailyEnergyWithReserve: bilan.dailyWithReserve,
    nightEnergyWithReserve: bilan.nightWithReserve,
    peakPowerW:            Ppt,

    // A — PV
    pcMin,
    systemVoltage: Us,
    npTotal,
    nps: Nps,
    nbrp: Nbrp,
    pcInstalled,

    // B — Batteries
    parkCapacityAh: CpAh,
    nbs: Nbs,
    nbp: Nbp,
    nbTotal: NbTotal,

    // C — MPPT
    voct: Voct,
    icct: Icct,
    pmrcRequired: Pmrc,
    vmrcRequired: Vmrc,
    imrcRequired: Imrc,
    nMpptRequired: nMppt,

    // D — Onduleur
    inverterPowerRequired: Pond,
    nInvertersRequired:    nOnd,

    // E — Câbles & protections
    currentIe:            Ie,
    voltageDrop:          DUv,
    cableSectionMm2:      Section,
    cableSectionStandard: SectionStd,
    dcBreaker_min:        DcBreakerMin,
    dcBreaker_max:        DcBreakerMax,
    acBreakerCalib:       InAC,
    surgeProtectionUp:    UpMax,
    fuseInfo,
    sectionneurIn:        sectIn,
    sectionneurUe:        sectUe,
  };
}

// ============================================================
// CALCUL FINANCIER
// ============================================================

export interface FinancialInput {
  panel: Panel;
  battery: Battery;
  inverter: Inverter;
  mppt: MpptController;
  results: CalcResults;
  tvaPercent: number;
  localPrepXOF: number;
  accessoriesXOF: number;
  installationXOF: number;
  supportPerPanelXOF: number;
}

export interface FinancialLine {
  label: string;
  description: string;
  quantity: number;
  unitPriceXOF: number;
  totalXOF: number;
}

export interface FinancialSummary {
  lines: FinancialLine[];
  totalHT: number;
  tvaAmount: number;
  totalTTC: number;
}

export function calculateFinancial(input: FinancialInput): FinancialSummary {
  const { panel, battery, inverter, mppt, results, tvaPercent,
          localPrepXOF, accessoriesXOF, installationXOF, supportPerPanelXOF } = input;

  const lines: FinancialLine[] = [
    {
      label: 'Panneau solaire',
      description: panel.name,
      quantity: results.npTotal,
      unitPriceXOF: panel.priceXOF,
      totalXOF: results.npTotal * panel.priceXOF,
    },
    {
      label: 'Batterie',
      description: battery.name,
      quantity: results.nbTotal,
      unitPriceXOF: battery.priceXOF,
      totalXOF: results.nbTotal * battery.priceXOF,
    },
    {
      label: 'Onduleur hybride',
      description: inverter.name,
      quantity: results.nInvertersRequired,
      unitPriceXOF: inverter.priceXOF,
      totalXOF: results.nInvertersRequired * inverter.priceXOF,
    },
    {
      label: 'Régulateur MPPT',
      description: mppt.name,
      quantity: results.nMpptRequired,
      unitPriceXOF: mppt.priceXOF,
      totalXOF: results.nMpptRequired * mppt.priceXOF,
    },
    {
      label: 'Supports de panneaux',
      description: 'Structure aluminium / galvanisé',
      quantity: results.npTotal,
      unitPriceXOF: supportPerPanelXOF,
      totalXOF: results.npTotal * supportPerPanelXOF,
    },
    {
      label: 'Préparation du local',
      description: 'Aménagement local technique',
      quantity: 1,
      unitPriceXOF: localPrepXOF,
      totalXOF: localPrepXOF,
    },
    {
      label: 'Accessoires',
      description: 'Câbles, fusibles, disjoncteurs, parafoudres, connecteurs',
      quantity: 1,
      unitPriceXOF: accessoriesXOF,
      totalXOF: accessoriesXOF,
    },
    {
      label: 'Installation / Main d\'œuvre',
      description: 'Pose, câblage, mise en service, tests',
      quantity: 1,
      unitPriceXOF: installationXOF,
      totalXOF: installationXOF,
    },
  ];

  const totalHT = lines.reduce((sum, l) => sum + l.totalXOF, 0);
  const tvaAmount = totalHT * tvaPercent / 100;
  const totalTTC = totalHT + tvaAmount;

  return { lines, totalHT, tvaAmount, totalTTC };
}

// ============================================================
// UTILITAIRES D'AFFICHAGE
// ============================================================

export function formatXOF(value: number): string {
  return Math.round(value).toLocaleString('fr-FR') + ' FCFA';
}

export function formatWh(wh: number): string {
  if (wh >= 1000) return (wh / 1000).toFixed(2) + ' kWh';
  return Math.round(wh) + ' Wh';
}

export function formatWc(wc: number): string {
  if (wc >= 1000) return (wc / 1000).toFixed(2) + ' kWc';
  return Math.round(wc) + ' Wc';
}
