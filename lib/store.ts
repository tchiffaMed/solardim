/**
 * STORE GLOBAL — Zustand avec persistance LocalStorage
 * SolarDim Niger
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type {
  Charge, InstallationSite, Panel, Battery,
  Inverter, MpptController, SystemParams, CalcResults,
} from '@/types';
import { calculate } from '@/lib/calculations';
import {
  PANELS_CATALOG,
  BATTERIES_CATALOG,
  INVERTERS_CATALOG,
  MPPT_CATALOG,
} from '@/lib/data';

// ── Valeurs par défaut ──
const DEFAULT_PARAMS: SystemParams = {
  rp: 0.65,             // Niger = milieu poussiéreux ( SAHELIO)
  reservePercent: 25,   // Taux de réserve  SAHELIO
  autonomyDays: 1,
  tva: 19,              // TVA Niger
  cableLength: 50,
  voltageDrop: 3,
};

const DEFAULT_SITE: InstallationSite = {
  location: null,
  inclinaison: 15,
  orientation: 'Plein Sud',
};

const DEFAULT_CHARGES: Charge[] = [
  { id: '1', name: 'Éclairage LED Salon', type: 'Éclairage', quantity: 2, unitPower: 9, dailyHours: 0, nightlyHours: 5 },
  { id: '2', name: 'Télévision 32"', type: 'TV/Audio', quantity: 1, unitPower: 50, dailyHours: 0, nightlyHours: 5 },
  { id: '3', name: 'Ventilateur sur pied', type: 'Autre', quantity: 1, unitPower: 50, dailyHours: 4, nightlyHours: 6 },
  { id: '4', name: 'Réfrigérateur 200L', type: 'Réfrigération', quantity: 1, unitPower: 70, dailyHours: 4, nightlyHours: 6 },
];

// ── Interface du store ──
interface SolarStore {
  // Infos projet
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

  // Prix complémentaires
  localPrepXOF: number;
  accessoriesXOF: number;
  installationXOF: number;
  supportPerPanelXOF: number;

  // Résultats
  results: CalcResults | null;

  // Step courant (navigation)
  currentStep: number;

  // ── Actions ──
  setProjectInfo: (name: string, client: string) => void;

  // Charges
  addCharge: (charge?: Partial<Charge>) => void;
  updateCharge: (id: string, updates: Partial<Charge>) => void;
  removeCharge: (id: string) => void;
  resetCharges: () => void;

  // Site
  setLocation: (location: NonNullable<InstallationSite['location']>) => void;
  updateSite: (updates: Partial<InstallationSite>) => void;

  // Équipements
  setPanel: (panel: Panel) => void;
  setBattery: (battery: Battery) => void;
  setInverter: (inverter: Inverter) => void;
  setMppt: (mppt: MpptController) => void;

  // Paramètres
  updateParams: (updates: Partial<SystemParams>) => void;

  // Prix complémentaires
  updatePrices: (updates: {
    localPrepXOF?: number;
    accessoriesXOF?: number;
    installationXOF?: number;
    supportPerPanelXOF?: number;
  }) => void;

  // Calcul
  runCalculation: () => CalcResults | null;

  // Navigation
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Reset
  resetProject: () => void;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}

export const useSolarStore = create<SolarStore>()(
  persist(
    (set, get) => ({
      // ── État initial ──
      projectName: 'Nouvelle installation PV',
      clientName: '',
      createdAt: new Date().toISOString(),

      charges: DEFAULT_CHARGES,
      site: DEFAULT_SITE,
      selectedPanel: PANELS_CATALOG[0],
      selectedBattery: BATTERIES_CATALOG[0],
      selectedInverter: INVERTERS_CATALOG[0],
      selectedMppt: MPPT_CATALOG[0],
      params: DEFAULT_PARAMS,

      localPrepXOF: 1500000,
      accessoriesXOF: 2000000,
      installationXOF: 3500000,
      supportPerPanelXOF: 14000,

      results: null,
      currentStep: 0,

      // ── Actions ──
      setProjectInfo: (name, client) =>
        set({ projectName: name, clientName: client }),

      // Charges
      addCharge: (partial = {}) =>
        set(state => ({
          charges: [
            ...state.charges,
            {
              id: generateId(),
              name: 'Nouvel appareil',
              type: 'Autre',
              quantity: 1,
              unitPower: 100,
              dailyHours: 4,
              nightlyHours: 0,
              ...partial,
            } as Charge,
          ],
          results: null,
        })),

      updateCharge: (id, updates) =>
        set(state => ({
          charges: state.charges.map(c => c.id === id ? { ...c, ...updates } : c),
          results: null,
        })),

      removeCharge: (id) =>
        set(state => ({
          charges: state.charges.filter(c => c.id !== id),
          results: null,
        })),

      resetCharges: () =>
        set({ charges: DEFAULT_CHARGES, results: null }),

      // Site
      setLocation: (location) =>
        set(state => ({
          site: {
            ...state.site,
            location,
            inclinaison: location.inclinaisonOptimale,
          },
          results: null,
        })),

      updateSite: (updates) =>
        set(state => ({
          site: { ...state.site, ...updates },
          results: null,
        })),

      // Équipements
      setPanel: (panel) => set({ selectedPanel: panel, results: null }),
      setBattery: (battery) => set({
        selectedBattery: battery,
        params: { ...get().params, rp: get().params.rp },
        results: null,
      }),
      setInverter: (inverter) => set({ selectedInverter: inverter, results: null }),
      setMppt: (mppt) => set({ selectedMppt: mppt, results: null }),

      // Paramètres
      updateParams: (updates) =>
        set(state => ({
          params: { ...state.params, ...updates },
          results: null,
        })),

      // Prix
      updatePrices: (updates) =>
        set(state => ({ ...state, ...updates })),

      // Calcul
      runCalculation: () => {
        const state = get();
        if (!state.site.location) return null;

        try {
          const results = calculate(
            state.charges,
            state.site,
            state.selectedPanel,
            state.selectedBattery,
            state.selectedInverter,
            state.selectedMppt,
            state.params,
          );
          set({ results });
          return results;
        } catch (e) {
          console.error('Erreur calcul:', e);
          return null;
        }
      },

      // Navigation
      setStep: (step) => set({ currentStep: Math.max(0, Math.min(5, step)) }),
      nextStep: () => set(state => ({ currentStep: Math.min(5, state.currentStep + 1) })),
      prevStep: () => set(state => ({ currentStep: Math.max(0, state.currentStep - 1) })),

      // Reset complet
      resetProject: () =>
        set({
          projectName: 'Nouvelle installation PV',
          clientName: '',
          createdAt: new Date().toISOString(),
          charges: DEFAULT_CHARGES,
          site: DEFAULT_SITE,
          selectedPanel: PANELS_CATALOG[0],
          selectedBattery: BATTERIES_CATALOG[0],
          selectedInverter: INVERTERS_CATALOG[0],
          selectedMppt: MPPT_CATALOG[0],
          params: DEFAULT_PARAMS,
          localPrepXOF: 1500000,
          accessoriesXOF: 2000000,
          installationXOF: 3500000,
          supportPerPanelXOF: 14000,
          results: null,
          currentStep: 0,
        }),
    }),
    {
      name: 'solardim-niger-v1',
      storage: createJSONStorage(() => localStorage),
      // Ne pas persister les résultats (recalculés à la volée)
      partialize: (state) => ({
        projectName: state.projectName,
        clientName: state.clientName,
        charges: state.charges,
        site: state.site,
        selectedPanel: state.selectedPanel,
        selectedBattery: state.selectedBattery,
        selectedInverter: state.selectedInverter,
        selectedMppt: state.selectedMppt,
        params: state.params,
        localPrepXOF: state.localPrepXOF,
        accessoriesXOF: state.accessoriesXOF,
        installationXOF: state.installationXOF,
        supportPerPanelXOF: state.supportPerPanelXOF,
      }),
    }
  )
);
