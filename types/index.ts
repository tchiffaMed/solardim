// ============================================================
// TYPES — SolarDim Niger
// Basé sur la méthode  SAHELIO, Module 4
// ============================================================

// ---------- Bilan énergétique ----------
export interface Charge {
  id: string;
  name: string;
  type: ChargeType;
  quantity: number;          // N
  unitPower: number;         // Pu en W
  dailyHours: number;        // Dj en h (08h-16h)
  nightlyHours: number;      // Dn en h (17h-08h)
  // Calculés
  totalPower?: number;       // Pt = N × Pu
  dailyEnergy?: number;      // Ej = Pt × Dj en Wh
  nightlyEnergy?: number;    // En = Pt × Dn en Wh
  totalEnergy?: number;      // Etot = Ej + En
}

export type ChargeType =
  | 'Éclairage'
  | 'Climatisation'
  | 'Moteur'
  | 'Pompe'
  | 'Réfrigération'
  | 'Informatique'
  | 'TV/Audio'
  | 'Sécurité'
  | 'Autre';

// ---------- Localisation ----------
export interface Location {
  lat: number;
  lng: number;
  ville: string;
  region: string;
  irrAnnuelle: number;       // Irradiation annuelle moyenne kWh/m²/j
  irrDefavorable: number;    // Irradiation mois le plus défavorable ( SAHELIO)
  inclinaisonOptimale: number; // En degrés = latitude
}

export interface InstallationSite {
  location: Location | null;
  inclinaison: number;       // ° modifiable par l'utilisateur
  orientation: 'Plein Sud' | 'Sud-Est' | 'Sud-Ouest';
}

// ---------- Catalogue équipements ----------
export interface Panel {
  id: string;
  name: string;
  brand: string;
  model: string;
  wp: number;               // Puissance crête Wc
  voc: number;              // Tension circuit ouvert V
  isc: number;              // Courant court-circuit A
  vmp: number;              // Tension max puissance V
  imp: number;              // Courant max puissance A
  vnom: number;             // Tension nominale V (12/24)
  efficiency: number;       // Rendement %
  warranty: number;         // Garantie ans
  priceXOF: number;         // Prix FCFA
}

export interface Battery {
  id: string;
  name: string;
  brand: string;
  type: 'LiFePO4' | 'AGM' | 'Gel' | 'Li-ion';
  capacityAh: number;       // Capacité en Ah
  voltageV: number;         // Tension nominale V (Ub)
  capacityKwh: number;      // Capacité en kWh
  dod: number;              // Profondeur décharge (0.50 plomb / 0.80-0.90 Li)
  efficiency: number;       // Rendement Rb
  cycles: number;           // Nombre cycles
  priceXOF: number;
}

export interface Inverter {
  id: string;
  name: string;
  brand: string;
  powerW: number;           // Puissance W
  phases: 1 | 3;
  efficiency: number;       // ƞond
  priceXOF: number;
}

export interface MpptController {
  id: string;
  name: string;
  brand: string;
  vmaxV: number;            // Tension max entrée
  imaxA: number;            // Courant max
  priceXOF: number;
}

// ---------- Paramètres système ----------
export interface SystemParams {
  rp: number;               // Ratio de performance (0.65 milieu poussiéreux Niger)
  reservePercent: number;   // Taux de réserve % ( SAHELIO: 25%)
  autonomyDays: number;     // Nombre jours autonomie Nj
  tva: number;              // TVA %
  cableLength: number;      // Longueur câble principal m
  voltageDrop: number;      // Chute tension max %
}

// ---------- Résultats calcul  SAHELIO ----------
export interface CalcResults {
  // Bilan énergétique
  totalEnergyWh: number;         // Etot brut
  dailyEnergyWh: number;         // Ej brut
  nightEnergyWh: number;         // En brut
  totalEnergyWithReserve: number;// Etot × (1 + reserve%)
  dailyEnergyWithReserve: number;
  nightEnergyWithReserve: number;
  peakPowerW: number;            // Puissance de pointe W

  // A — Champ PV ( SAHELIO §4.2.1.2)
  pcMin: number;                 // Puissance crête minimale Wc
  systemVoltage: number;         // Us choisi ( SAHELIO Tableau 3)
  npTotal: number;               // Nombre total panneaux
  nps: number;                   // Panneaux en série
  nbrp: number;                  // Strings en parallèle
  pcInstalled: number;           // Puissance installée Wc

  // B — Batteries ( SAHELIO §4.2.2.1)
  parkCapacityAh: number;        // Cp en Ah
  nbs: number;                   // Batteries en série
  nbp: number;                   // Batteries en parallèle
  nbTotal: number;               // Nb total batteries

  // C — Régulateur MPPT ( SAHELIO §4.2.2.2.2) — 3 conditions
  voct: number;                  // Voc total champ
  icct: number;                  // Icc total champ
  pmrcRequired: number;          // Pmrc ≥ 1.25 × Pcu × Np
  vmrcRequired: number;          // Vmrc ≥ 1.25 × Voc × Nps
  imrcRequired: number;          // Imrc ≥ 1.25 × Isc × Nbrp
  nMpptRequired: number;         // Nombre MPPT nécessaires

  // D — Onduleur ( SAHELIO §4.2.2.3)
  inverterPowerRequired: number; // P_ond = 1.25 × Ppt / ƞond
  nInvertersRequired: number;    // Nombre onduleurs

  // E — Câbles & protections ( SAHELIO §4.2.2.4-5)
  currentIe: number;             // Ie = Pcmin/Us A
  voltageDrop: number;           // ΔU V
  cableSectionMm2: number;       // S mm²
  cableSectionStandard: number;  // Section normalisée
  dcBreaker_min: number;         // 1.4 × Isc
  dcBreaker_max: number;         // 2 × Isc
  acBreakerCalib: number;        // Calibre disj. AC
  surgeProtectionUp: number;     // Up max parafoudre
  fuseInfo: string;              // Info fusibles selon nb chaînes
  sectionneurIn: number;         // Calibre sectionneur
  sectionneurUe: number;         // Tension sectionneur
}

// ---------- Offre financière ----------
export interface FinancialLine {
  label: string;
  description: string;
  quantity: number;
  unitPriceXOF: number;
  totalXOF: number;
}

export interface FinancialOffer {
  projectName: string;
  clientName: string;
  date: string;
  lines: FinancialLine[];
  totalHT: number;
  tvaPercent: number;
  tvaAmount: number;
  totalTTC: number;
  // Prix complémentaires
  localPrepXOF: number;
  accessoriesXOF: number;
  installationXOF: number;
  supportXOF: number; // par panneau
}

// ---------- Store global (Zustand) ----------
export interface ProjectState {
  // Métadonnées
  projectName: string;
  clientName: string;
  createdAt: string;

  // Étapes
  charges: Charge[];
  site: InstallationSite;
  selectedPanel: Panel;
  selectedBattery: Battery;
  selectedInverter: Inverter;
  selectedMppt: MpptController;
  params: SystemParams;

  // Résultats calculés
  results: CalcResults | null;
  offer: FinancialOffer | null;

  // Actions
  addCharge: (charge: Charge) => void;
  updateCharge: (id: string, charge: Partial<Charge>) => void;
  removeCharge: (id: string) => void;
  setLocation: (location: Location) => void;
  setSite: (site: Partial<InstallationSite>) => void;
  setPanel: (panel: Panel) => void;
  setBattery: (battery: Battery) => void;
  setInverter: (inverter: Inverter) => void;
  setMppt: (mppt: MpptController) => void;
  setParams: (params: Partial<SystemParams>) => void;
  calculate: () => void;
  resetProject: () => void;
}

// ---------- Données statiques Niger ----------
export interface NigerStation {
  ville: string;
  region: string;
  lat: number;
  lng: number;
  irrAnnuelle: number;
  irrDefavorable: number;
  inclinaisonOpt: number;
}
