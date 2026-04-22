/**
 * DONNÉES STATIQUES — SolarDim Niger
 * Stations météo Niger + Catalogue équipements
 */

import type { NigerStation, Panel, Battery, Inverter, MpptController } from '@/types';

// ============================================================
// STATIONS MÉTÉO — NIGER
// Sources: PVGIS, SolarGIS, Météorologie Nationale Niger
// Irradiation mois défavorable = mois de décembre (hivernage terminé)
// ============================================================
export const NIGER_STATIONS: NigerStation[] = [
  {
    ville: 'Niamey',
    region: 'Niamey',
    lat: 13.5137,
    lng: 2.1098,
    irrAnnuelle: 5.5,
    irrDefavorable: 4.2,
    inclinaisonOpt: 14,
  },
  {
    ville: 'Agadez',
    region: 'Agadez',
    lat: 16.9742,
    lng: 7.9869,
    irrAnnuelle: 6.2,
    irrDefavorable: 4.8,
    inclinaisonOpt: 17,
  },
  {
    ville: 'Zinder',
    region: 'Zinder',
    lat: 13.8045,
    lng: 8.9889,
    irrAnnuelle: 5.8,
    irrDefavorable: 4.3,
    inclinaisonOpt: 14,
  },
  {
    ville: 'Maradi',
    region: 'Maradi',
    lat: 13.5004,
    lng: 7.1000,
    irrAnnuelle: 5.6,
    irrDefavorable: 4.2,
    inclinaisonOpt: 14,
  },
  {
    ville: 'Tahoua',
    region: 'Tahoua',
    lat: 14.8878,
    lng: 5.2664,
    irrAnnuelle: 5.9,
    irrDefavorable: 4.5,
    inclinaisonOpt: 15,
  },
  {
    ville: 'Dosso',
    region: 'Dosso',
    lat: 13.0340,
    lng: 3.1961,
    irrAnnuelle: 5.3,
    irrDefavorable: 4.0,
    inclinaisonOpt: 13,
  },
  {
    ville: 'Diffa',
    region: 'Diffa',
    lat: 13.3152,
    lng: 12.6079,
    irrAnnuelle: 5.7,
    irrDefavorable: 4.3,
    inclinaisonOpt: 13,
  },
  {
    ville: 'Tillabéri',
    region: 'Tillabéri',
    lat: 14.2063,
    lng: 1.4535,
    irrAnnuelle: 5.4,
    irrDefavorable: 4.1,
    inclinaisonOpt: 14,
  },
  {
    ville: 'Arlit',
    region: 'Agadez',
    lat: 18.7369,
    lng: 7.3853,
    irrAnnuelle: 6.4,
    irrDefavorable: 5.0,
    inclinaisonOpt: 19,
  },
  {
    ville: 'Birni-N\'Konni',
    region: 'Tahoua',
    lat: 13.7939,
    lng: 5.2504,
    irrAnnuelle: 5.7,
    irrDefavorable: 4.3,
    inclinaisonOpt: 14,
  },
  {
    ville: 'Gaya',
    region: 'Dosso',
    lat: 11.8874,
    lng: 3.4479,
    irrAnnuelle: 5.1,
    irrDefavorable: 3.8,
    inclinaisonOpt: 12,
  },
  {
    ville: 'Téra',
    region: 'Tillabéri',
    lat: 14.0170,
    lng: 0.7528,
    irrAnnuelle: 5.5,
    irrDefavorable: 4.2,
    inclinaisonOpt: 14,
  },
  {
    ville: 'Mayahi',
    region: 'Maradi',
    lat: 13.9594,
    lng: 7.6726,
    irrAnnuelle: 5.7,
    irrDefavorable: 4.3,
    inclinaisonOpt: 14,
  },
  {
    ville: 'In-Gall',
    region: 'Agadez',
    lat: 16.7806,
    lng: 6.9430,
    irrAnnuelle: 6.1,
    irrDefavorable: 4.7,
    inclinaisonOpt: 17,
  },
];

// ============================================================
// CATALOGUE PANNEAUX SOLAIRES
// ============================================================
export const PANELS_CATALOG: Panel[] = [
  {
    id: 'jinko-720',
    name: 'Jinko Solar Tiger Neo 720Wc',
    brand: 'Jinko Solar',
    model: 'Tiger Neo N-type 720W',
    wp: 720, voc: 45.6, isc: 18.8, vmp: 38.0, imp: 18.9,
    vnom: 24, efficiency: 22.3, warranty: 25,
    priceXOF: 110000,
  },
  {
    id: 'canadian-665',
    name: 'Canadian Solar HiKu7 665Wc',
    brand: 'Canadian Solar',
    model: 'HiKu7 CS7N-665MS',
    wp: 665, voc: 43.2, isc: 18.0, vmp: 36.1, imp: 18.4,
    vnom: 24, efficiency: 21.4, warranty: 25,
    priceXOF: 100000,
  },
  {
    id: 'longi-580',
    name: 'Longi Hi-MO6 580Wc',
    brand: 'Longi',
    model: 'Hi-MO6 LR5-72HTH',
    wp: 580, voc: 40.5, isc: 16.5, vmp: 34.2, imp: 16.96,
    vnom: 24, efficiency: 22.0, warranty: 25,
    priceXOF: 90000,
  },
  {
    id: 'jinko-400',
    name: 'Jinko Solar Cheetah 400Wc',
    brand: 'Jinko Solar',
    model: 'Cheetah HC JKM400M',
    wp: 400, voc: 41.0, isc: 11.5, vmp: 33.8, imp: 11.83,
    vnom: 24, efficiency: 20.5, warranty: 25,
    priceXOF: 75000,
  },
  {
    id: 'panel-250-SAHELIO',
    name: 'Panneau 250Wc / 24V',
    brand: 'Standard',
    model: 'Polycrystallin 250W',
    wp: 250, voc: 30.0, isc: 8.5, vmp: 24.5, imp: 8.2,
    vnom: 24, efficiency: 15.4, warranty: 10,
    priceXOF: 50000,
  },
  {
    id: 'panel-460-SAHELIO',
    name: 'Panneau 460Wc / 24V',
    brand: 'Standard',
    model: 'Monocrystallin 460W',
    wp: 460, voc: 50.01, isc: 11.45, vmp: 41.8, imp: 11.0,
    vnom: 24, efficiency: 21.0, warranty: 12,
    priceXOF: 80000,
  },
  {
    id: 'risen-450',
    name: 'Risen RSM120 450Wc',
    brand: 'Risen Energy',
    model: 'RSM120-8-450M',
    wp: 450, voc: 41.8, isc: 12.5, vmp: 34.5, imp: 13.04,
    vnom: 24, efficiency: 20.9, warranty: 25,
    priceXOF: 80000,
  },
];

// ============================================================
// CATALOGUE BATTERIES
// ============================================================
export const BATTERIES_CATALOG: Battery[] = [
  {
    id: 'felicity-lifepo4-48v',
    name: 'FelicitySolar LiFePO4 12,5 kWh / 48V',
    brand: 'FelicitySolar',
    type: 'LiFePO4',
    capacityAh: 260, voltageV: 48, capacityKwh: 12.5,
    dod: 0.95, efficiency: 0.98, cycles: 6000,
    priceXOF: 2000000,
  },
  {
    id: 'pylontech-us5000',
    name: 'Pylontech US5000 4,8 kWh / 48V',
    brand: 'Pylontech',
    type: 'LiFePO4',
    capacityAh: 100, voltageV: 48, capacityKwh: 4.8,
    dod: 0.90, efficiency: 0.97, cycles: 6000,
    priceXOF: 900000,
  },
  {
    id: 'byd-box',
    name: 'BYD Battery Box 11,5 kWh / 48V',
    brand: 'BYD',
    type: 'LiFePO4',
    capacityAh: 240, voltageV: 48, capacityKwh: 11.5,
    dod: 0.90, efficiency: 0.97, cycles: 5000,
    priceXOF: 1800000,
  },
  {
    id: 'agm-100-12v',
    name: 'Batterie AGM 100Ah / 12V',
    brand: 'Standard',
    type: 'AGM',
    capacityAh: 100, voltageV: 12, capacityKwh: 1.2,
    dod: 0.50, efficiency: 0.90, cycles: 500,
    priceXOF: 120000,
  },
  {
    id: 'agm-200-12v',
    name: 'Batterie AGM 200Ah / 12V',
    brand: 'Standard',
    type: 'AGM',
    capacityAh: 200, voltageV: 12, capacityKwh: 2.4,
    dod: 0.50, efficiency: 0.90, cycles: 500,
    priceXOF: 200000,
  },
  {
    id: 'gel-narada-200',
    name: 'Gel Narada REXC 200Ah / 12V',
    brand: 'Narada',
    type: 'Gel',
    capacityAh: 200, voltageV: 12, capacityKwh: 2.4,
    dod: 0.60, efficiency: 0.87, cycles: 1200,
    priceXOF: 180000,
  },
  {
    id: 'li-100-24v',
    name: 'Batterie Li-ion 100Ah / 24V',
    brand: 'Standard',
    type: 'Li-ion',
    capacityAh: 100, voltageV: 24, capacityKwh: 2.4,
    dod: 0.80, efficiency: 0.95, cycles: 2000,
    priceXOF: 350000,
  },
];

// ============================================================
// CATALOGUE ONDULEURS
// ============================================================
export const INVERTERS_CATALOG: Inverter[] = [
  {
    id: 'sma-tripower-core2',
    name: 'SMA Tripower CORE2 110kW',
    brand: 'SMA',
    powerW: 110000, phases: 3, efficiency: 0.98,
    priceXOF: 9000000,
  },
  {
    id: 'sma-sunny-island-8',
    name: 'SMA Sunny Island 8kW',
    brand: 'SMA',
    powerW: 8000, phases: 1, efficiency: 0.96,
    priceXOF: 1800000,
  },
  {
    id: 'victron-quattro-15',
    name: 'Victron Quattro 15kVA',
    brand: 'Victron Energy',
    powerW: 15000, phases: 1, efficiency: 0.96,
    priceXOF: 2500000,
  },
  {
    id: 'huawei-sun2000-100',
    name: 'Huawei SUN2000-100KTL-H1',
    brand: 'Huawei',
    powerW: 100000, phases: 3, efficiency: 0.986,
    priceXOF: 8000000,
  },
  {
    id: 'schneider-xw-pro',
    name: 'Schneider XW Pro 6.8kW',
    brand: 'Schneider Electric',
    powerW: 6800, phases: 1, efficiency: 0.96,
    priceXOF: 1500000,
  },
  {
    id: 'victron-multi-5',
    name: 'Victron MultiPlus-II 5kVA',
    brand: 'Victron Energy',
    powerW: 5000, phases: 1, efficiency: 0.96,
    priceXOF: 1200000,
  },
  {
    id: 'onduleur-800-24v',
    name: 'Onduleur hybride 800W / 24V',
    brand: 'Standard',
    powerW: 800, phases: 1, efficiency: 0.98,
    priceXOF: 300000,
  },
];

// ============================================================
// CATALOGUE RÉGULATEURS MPPT
// ============================================================
export const MPPT_CATALOG: MpptController[] = [
  {
    id: 'victron-150-100',
    name: 'Victron SmartSolar MPPT 150/100',
    brand: 'Victron Energy',
    vmaxV: 150, imaxA: 100,
    priceXOF: 450000,
  },
  {
    id: 'victron-100-50',
    name: 'Victron BlueSolar MPPT 100/50',
    brand: 'Victron Energy',
    vmaxV: 100, imaxA: 50,
    priceXOF: 250000,
  },
  {
    id: 'schneider-mppt60-150',
    name: 'Schneider Conext MPPT 80-600',
    brand: 'Schneider Electric',
    vmaxV: 150, imaxA: 60,
    priceXOF: 380000,
  },
  {
    id: 'morningstar-ts-60',
    name: 'Morningstar TriStar MPPT TS-60',
    brand: 'Morningstar',
    vmaxV: 150, imaxA: 60,
    priceXOF: 320000,
  },
  {
    id: 'epever-60a',
    name: 'EPsolar Tracer AN MPPT 60A',
    brand: 'EPsolar',
    vmaxV: 150, imaxA: 60,
    priceXOF: 180000,
  },
];

// ============================================================
// TYPES DE CHARGES
// ============================================================
export const CHARGE_TYPES = [
  'Éclairage',
  'Climatisation',
  'Moteur',
  'Pompe',
  'Réfrigération',
  'Informatique',
  'TV/Audio',
  'Sécurité',
  'Autre',
] as const;

// Exemples de charges communes au Niger
export const CHARGE_EXAMPLES = [
  { name: 'Lampe LED 9W', type: 'Éclairage', unitPower: 9 },
  { name: 'Lampe LED 15W', type: 'Éclairage', unitPower: 15 },
  { name: 'Tube LED 20W', type: 'Éclairage', unitPower: 20 },
  { name: 'Ventilateur de plafond', type: 'Autre', unitPower: 75 },
  { name: 'Ventilateur sur pied', type: 'Autre', unitPower: 50 },
  { name: 'Télévision 32"', type: 'TV/Audio', unitPower: 50 },
  { name: 'Télévision 55"', type: 'TV/Audio', unitPower: 100 },
  { name: 'Réfrigérateur 200L', type: 'Réfrigération', unitPower: 70 },
  { name: 'Congélateur 300L', type: 'Réfrigération', unitPower: 150 },
  { name: 'Climatiseur 1CV', type: 'Climatisation', unitPower: 900 },
  { name: 'Climatiseur 1,5CV', type: 'Climatisation', unitPower: 1200 },
  { name: 'Climatiseur 2CV', type: 'Climatisation', unitPower: 1500 },
  { name: 'Ordinateur portable', type: 'Informatique', unitPower: 65 },
  { name: 'Ordinateur bureau', type: 'Informatique', unitPower: 200 },
  { name: 'Imprimante', type: 'Informatique', unitPower: 300 },
  { name: 'Pompe submersible 0,5CV', type: 'Pompe', unitPower: 370 },
  { name: 'Pompe submersible 1CV', type: 'Pompe', unitPower: 750 },
  { name: 'Moulin 2,2kW', type: 'Moteur', unitPower: 2200 },
  { name: 'Moteur 3-phase 4kW', type: 'Moteur', unitPower: 4000 },
  { name: 'Décortiqueuse 4kW', type: 'Moteur', unitPower: 4000 },
  { name: 'Chargeur téléphone', type: 'Autre', unitPower: 10 },
  { name: 'Caméra de sécurité', type: 'Sécurité', unitPower: 15 },
];
