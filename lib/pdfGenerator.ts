/**
 * GÉNÉRATEUR DE RAPPORT PDF — SolarDim Niger
 * Rapport technico-financier complet basé sur la méthode  
 * Utilise jsPDF + jspdf-autotable
 */

import type {
  CalcResults, Panel, Battery, Inverter,
  MpptController, InstallationSite, SystemParams,
} from '@/types';
import type { FinancialSummary } from '@/lib/calculations';
import { formatXOF } from '@/lib/calculations';

// ── Palette couleurs ──
const C = {
  solar:    [217, 119, 6]   as [number, number, number],
  solarL:   [254, 243, 199] as [number, number, number],
  earth:    [28,  25,  23]  as [number, number, number],
  earthM:   [120, 113, 108] as [number, number, number],
  earthL:   [245, 245, 244] as [number, number, number],
  sky:      [2,   132, 199] as [number, number, number],
  skyL:     [224, 242, 254] as [number, number, number],
  green:    [22,  163, 74]  as [number, number, number],
  greenL:   [220, 252, 231] as [number, number, number],
  white:    [255, 255, 255] as [number, number, number],
  red:      [220, 38,  38]  as [number, number, number],
  redL:     [254, 226, 226] as [number, number, number],
};

interface ReportData {
  projectName:    string;
  clientName:     string;
  charges:        Array<{
    name: string; type: string; quantity: number; unitPower: number;
    dailyHours: number; nightlyHours: number;
    totalPower?: number; dailyEnergy?: number; nightlyEnergy?: number; totalEnergy?: number;
  }>;
  site:           InstallationSite;
  panel:          Panel;
  battery:        Battery;
  inverter:       Inverter;
  mppt:           MpptController;
  params:         SystemParams;
  results:        CalcResults;
  financial:      FinancialSummary;
}

// ── Helpers ──
function row2color(i: number): [number, number, number] {
  return i % 2 === 0 ? C.white : C.earthL;
}

function addPageFooter(doc: any, pageNum: number, total: number, projectName: string) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...C.solar);
  doc.setLineWidth(0.4);
  doc.line(14, h - 12, w - 14, h - 12);
  doc.setFontSize(7.5);
  doc.setTextColor(...C.earthM);
  doc.text('SolarDim Niger — Dimensionnement PV · Méthode  ', 14, h - 7);
  doc.text(`${projectName}`, w / 2, h - 7, { align: 'center' });
  doc.text(`Page ${pageNum} / ${total}`, w - 14, h - 7, { align: 'right' });
}

function sectionTitle(doc: any, text: string, y: number, icon = '●') {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(...C.solar);
  doc.roundedRect(14, y, w - 28, 8, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.white);
  doc.text(`${icon}  ${text}`, 18, y + 5.5);
  return y + 13;
}

function infoBox(doc: any, label: string, value: string, x: number, y: number, w = 55, highlight = false) {
  doc.setFillColor(...(highlight ? C.solarL : C.earthL));
  doc.setDrawColor(...(highlight ? C.solar : [220, 220, 220] as [number,number,number]));
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, 16, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.earthM);
  doc.text(label, x + 3, y + 5.5);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(highlight ? C.solar[0] : C.earth[0], highlight ? C.solar[1] : C.earth[1], highlight ? C.solar[2] : C.earth[2]);
  doc.text(value, x + 3, y + 13);
}

function formulaBox(doc: any, formula: string, y: number) {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(250, 247, 240);
  doc.setDrawColor(230, 200, 150);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, y, w - 28, 9, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('courier', 'normal');
  doc.setTextColor(100, 60, 10);
  doc.text(formula, 17, y + 6);
  return y + 13;
}

// ── EXPORT PRINCIPAL ──
export async function generatePDF(data: ReportData): Promise<void> {
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  let pages = 1;

  // ══════════════════════════════════════════════
  // PAGE 1 — COUVERTURE
  // ══════════════════════════════════════════════

  // Fond dégradé solaire
  doc.setFillColor(28, 25, 23);
  doc.rect(0, 0, W, H, 'F');

  // Bande solaire en haut
  doc.setFillColor(...C.solar);
  doc.rect(0, 0, W, 4, 'F');

  // Bloc blanc central
  doc.setFillColor(...C.white);
  doc.roundedRect(14, 28, W - 28, H - 50, 6, 6, 'F');

  // Logo / Titre principal
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.solar);
  doc.text('SolarDim', 26, 52);
  doc.setFontSize(14);
  doc.setTextColor(...C.earthM);
  doc.text('Niger', 26, 61);

  // Trait décoratif
  doc.setDrawColor(...C.solar);
  doc.setLineWidth(0.8);
  doc.line(26, 64, W - 26, 64);

  // Titre du rapport
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.earth);
  doc.text('DIMENSIONNEMENT TECHNICO-FINANCIER', W / 2, 76, { align: 'center' });
  doc.setFontSize(11);
  doc.setTextColor(...C.earthM);
  doc.text("d'une installation solaire photovoltaïque", W / 2, 83, { align: 'center' });

  // Nom du projet
  doc.setFillColor(...C.earthL);
  doc.roundedRect(26, 92, W - 52, 20, 4, 4, 'F');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.earth);
  doc.text(data.projectName, W / 2, 103, { align: 'center', maxWidth: W - 60 });
  if (data.clientName) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.earthM);
    doc.text(`Client : ${data.clientName}`, W / 2, 110, { align: 'center' });
  }

  // Métriques principales
  const metrics = [
    { label: 'Puissance crête', value: `${data.results.pcMin.toFixed(0)} Wc` },
    { label: 'Panneaux PV', value: `${data.results.npTotal} unités` },
    { label: 'Batteries', value: `${data.results.nbTotal} unités` },
    { label: 'Tension système', value: `${data.results.systemVoltage} V` },
  ];
  const mW = (W - 52) / 4 - 3;
  metrics.forEach((m, i) => {
    const mx = 26 + i * (mW + 4);
    doc.setFillColor(...C.solarL);
    doc.setDrawColor(...C.solar);
    doc.setLineWidth(0.3);
    doc.roundedRect(mx, 118, mW, 22, 3, 3, 'FD');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.earthM);
    doc.text(m.label, mx + mW / 2, 124, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.solar);
    doc.text(m.value, mx + mW / 2, 133, { align: 'center' });
  });

  // Infos site
  const loc = data.site.location;
  if (loc) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.earth);
    doc.text(`Site : ${loc.ville}${loc.region ? ` — ${loc.region}` : ''}, Niger`, W / 2, 152, { align: 'center' });
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.earthM);
    doc.text(`Coordonnées : ${loc.lat.toFixed(4)}°N, ${loc.lng.toFixed(4)}°E  ·  Irradiation mois défavorable : ${loc.irrDefavorable} kWh/m²/j`, W / 2, 159, { align: 'center' });
    doc.text(`Inclinaison : ${data.site.inclinaison}°  ·  Orientation : ${data.site.orientation}`, W / 2, 165, { align: 'center' });
  }

  // Badge méthode SAHELIO
  doc.setFillColor(...C.skyL);
  doc.setDrawColor(...C.sky);
  doc.setLineWidth(0.4);
  doc.roundedRect(W / 2 - 50, 172, 100, 12, 4, 4, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.sky);
  doc.text('Méthode   — Module 4 — Électricité Solaire PV', W / 2, 179.5, { align: 'center' });

  // Montant TTC mis en avant
  doc.setFillColor(...C.earth);
  doc.roundedRect(26, 192, W - 52, 22, 4, 4, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.earthM);
  doc.text('Montant total TTC', W / 2, 199, { align: 'center' });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.solar);
  doc.text(formatXOF(data.financial.totalTTC), W / 2, 210, { align: 'center' });

  // Date & infos
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.earthM);
  doc.text(`Établi le : ${today}`, W / 2, 228, { align: 'center' });
  doc.text('Document généré par SolarDim Niger · Données sauvegardées localement', W / 2, 234, { align: 'center' });

  // Bande solaire bas
  doc.setFillColor(...C.solar);
  doc.rect(0, H - 8, W, 8, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.white);
  doc.text('Rapport de dimensionnement PV ·  ', 14, H - 3);
  doc.text(`${today}`, W - 14, H - 3, { align: 'right' });

  // ══════════════════════════════════════════════
  // PAGE 2 — SOMMAIRE + BILAN ÉNERGÉTIQUE
  // ══════════════════════════════════════════════
  doc.addPage();
  pages++;
  let y = 20;

  // Header page
  doc.setFillColor(...C.earthL);
  doc.rect(0, 0, W, 14, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.earthM);
  doc.text('BILAN ÉNERGÉTIQUE', 14, 9);
  doc.text(data.projectName, W - 14, 9, { align: 'right' });

  y = sectionTitle(doc, 'I. BILAN ÉNERGÉTIQUE DES CHARGES', y + 4, '⚡');

  // Tableau des charges
  const chargeRows = data.charges.map(c => [
    c.name,
    c.type,
    c.quantity,
    `${c.unitPower} W`,
    `${(c.totalPower ?? c.quantity * c.unitPower).toLocaleString('fr-FR')} W`,
    `${c.dailyHours}h`,
    `${c.nightlyHours}h`,
    `${(c.dailyEnergy ?? 0).toLocaleString('fr-FR')}`,
    `${(c.nightlyEnergy ?? 0).toLocaleString('fr-FR')}`,
    `${(c.totalEnergy ?? 0).toLocaleString('fr-FR')}`,
  ]);

  const totalEj = data.charges.reduce((s, c) => s + (c.dailyEnergy ?? 0), 0);
  const totalEn = data.charges.reduce((s, c) => s + (c.nightlyEnergy ?? 0), 0);
  const totalEt = totalEj + totalEn;
  const k = 1 + data.params.reservePercent / 100;

  chargeRows.push([
    { content: 'TOTAL', styles: { fontStyle: 'bold' as const } },
    '', '', '',
    { content: `${data.results.peakPowerW.toLocaleString('fr-FR')} W`, styles: { fontStyle: 'bold' as const, textColor: C.solar } },
    '', '',
    { content: `${totalEj.toLocaleString('fr-FR')}`, styles: { fontStyle: 'bold' as const } },
    { content: `${totalEn.toLocaleString('fr-FR')}`, styles: { fontStyle: 'bold' as const } },
    { content: `${totalEt.toLocaleString('fr-FR')}`, styles: { fontStyle: 'bold' as const } },
  ]);

  chargeRows.push([
    { content: `Avec réserve ×${k.toFixed(2)} (${data.params.reservePercent}%)`, colSpan: 7, styles: { fillColor: C.solarL, fontStyle: 'bold' as const, textColor: C.solar } },
    { content: `${data.results.dailyEnergyWithReserve.toLocaleString('fr-FR')}`, styles: { fillColor: C.solarL, fontStyle: 'bold' as const, textColor: C.solar } },
    { content: `${data.results.nightEnergyWithReserve.toLocaleString('fr-FR')}`, styles: { fillColor: C.solarL, fontStyle: 'bold' as const, textColor: C.solar } },
    { content: `${data.results.totalEnergyWithReserve.toLocaleString('fr-FR')} Wh`, styles: { fillColor: C.solarL, fontStyle: 'bold' as const, textColor: C.solar } },
  ]);

  (doc as any).autoTable({
    startY: y,
    head: [['Appareil', 'Type', 'N', 'Pu', 'Pt (W)', 'Dj (h)', 'Dn (h)', 'Ej (Wh)', 'En (Wh)', 'Etot (Wh)']],
    body: chargeRows,
    theme: 'grid',
    headStyles: { fillColor: C.earth, textColor: C.white, fontSize: 7.5, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7.5, halign: 'center' },
    columnStyles: { 0: { halign: 'left', cellWidth: 35 }, 1: { cellWidth: 20 } },
    alternateRowStyles: { fillColor: C.earthL },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Métriques bilan
  const bilanMetrics = [
    { label: 'Énergie totale (×1,25)', value: `${(data.results.totalEnergyWithReserve / 1000).toFixed(3)} kWh/j`, hi: true },
    { label: 'Énergie journée (×1,25)', value: `${(data.results.dailyEnergyWithReserve / 1000).toFixed(3)} kWh` },
    { label: 'Énergie nocturne (×1,25)', value: `${(data.results.nightEnergyWithReserve / 1000).toFixed(3)} kWh` },
    { label: 'Puissance de pointe Ppt', value: `${(data.results.peakPowerW / 1000).toFixed(2)} kW` },
  ];
  const bW = (W - 28 - 9) / 4;
  bilanMetrics.forEach((m, i) => {
    infoBox(doc, m.label, m.value, 14 + i * (bW + 3), y, bW, m.hi);
  });

  // ══════════════════════════════════════════════
  // PAGE 3 — CALCULS SAHELIO COMPLETS
  // ══════════════════════════════════════════════
  doc.addPage();
  pages++;
  y = 20;

  doc.setFillColor(...C.earthL);
  doc.rect(0, 0, W, 14, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.earthM);
  doc.text('CALCULS SAHELIO — DIMENSIONNEMENT', 14, 9);
  doc.text(data.projectName, W - 14, 9, { align: 'right' });

  y = sectionTitle(doc, 'II.A — CHAMP SOLAIRE PV  (SAHELIO §4.2.1.2)', y + 4, '☀');

  // Info site
  const irrDef = data.site.location?.irrDefavorable ?? 0;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.earthM);
  doc.text(`Site : ${data.site.location?.ville ?? '—'}  ·  Irradiation mois défavorable : ${irrDef} kWh/m²/j  ·  Rp = ${data.params.rp} (milieu poussiéreux Niger)`, 14, y);
  y += 6;

  y = formulaBox(doc, `Pcmin = Etot×1,25 / (Rp × Irr) = ${data.results.totalEnergyWithReserve} / (${data.params.rp} × ${irrDef}) = ${data.results.pcMin.toFixed(1)} Wc`, y);

  (doc as any).autoTable({
    startY: y,
    body: [
      ['Énergie totale journalière (×1,25)', `${data.results.totalEnergyWithReserve.toLocaleString('fr-FR')} Wh`],
      ['Irradiation mois défavorable', `${irrDef} kWh/m²/j`],
      ['Ratio de performance Rp', data.params.rp],
      ['⟹ Puissance crête minimale Pcmin', { content: `${data.results.pcMin.toFixed(1)} Wc`, styles: { fontStyle: 'bold', textColor: C.solar, fillColor: C.solarL } }],
      ['Tension système Us (SAHELIO Tableau 3)', { content: `${data.results.systemVoltage} V`, styles: { fontStyle: 'bold', textColor: C.sky } }],
    ],
    theme: 'grid',
    bodyStyles: { fontSize: 8 },
    columnStyles: { 0: { cellWidth: 100 }, 1: { fontStyle: 'bold', halign: 'right' } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 5;

  y = formulaBox(doc, `Np = ⌈Pcmin/Pcu⌉ = ⌈${data.results.pcMin.toFixed(1)}/${data.panel.wp}⌉ = ${data.results.npTotal}  |  Nps = Us/Vnom = ${data.results.systemVoltage}/${data.panel.vnom} = ${data.results.nps}  |  Nbrp = ${data.results.nbrp}`, y);

  (doc as any).autoTable({
    startY: y,
    body: [
      ['Puissance unitaire panneau Pcu', `${data.panel.wp} Wc  (${data.panel.name})`],
      ['Panneaux en série Nps = Us/Vnom', `${data.results.nps}`],
      ['Strings en parallèle Nbrp', `${data.results.nbrp}`],
      ['⟹ Nombre total panneaux Np', { content: `${data.results.npTotal} panneaux`, styles: { fontStyle: 'bold', textColor: C.solar, fillColor: C.solarL } }],
      ['Puissance installée = Nps×Nbrp×Pcu', { content: `${data.results.pcInstalled.toLocaleString('fr-FR')} Wc ≥ ${data.results.pcMin.toFixed(0)} Wc ✓`, styles: { fontStyle: 'bold', textColor: C.green } }],
    ],
    theme: 'grid',
    bodyStyles: { fontSize: 8 },
    columnStyles: { 0: { cellWidth: 100 }, 1: { fontStyle: 'bold', halign: 'right' } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Batteries ──
  y = sectionTitle(doc, 'II.B — PARC BATTERIE  (SAHELIO §4.2.2.1)', y, '🔋');
  y = formulaBox(doc, `Cp [Ah] = (En×1,25 × Nj) / (Us × DoD × Rb) = (${data.results.nightEnergyWithReserve} × ${data.params.autonomyDays}) / (${data.results.systemVoltage} × ${data.battery.dod} × ${data.battery.efficiency}) = ${data.results.parkCapacityAh.toFixed(1)} Ah`, y);

  (doc as any).autoTable({
    startY: y,
    body: [
      ['Énergie nocturne (×1,25)', `${data.results.nightEnergyWithReserve.toLocaleString('fr-FR')} Wh`],
      ['Autonomie Nj', `${data.params.autonomyDays} jour(s)`],
      ['DoD (profondeur décharge)', `${data.battery.dod}  (${data.battery.type} → ${data.battery.dod >= 0.8 ? 'Lithium' : 'Plomb/AGM'})`],
      ['Rendement batterie Rb', data.battery.efficiency],
      ['⟹ Capacité parc Cp', { content: `${data.results.parkCapacityAh.toFixed(1)} Ah`, styles: { fontStyle: 'bold', textColor: C.sky, fillColor: C.skyL } }],
      ['Batteries en série Nbs = Us/Ub', `${data.results.nbs}  (${data.results.systemVoltage}V ÷ ${data.battery.voltageV}V)`],
      ['Batteries en parallèle Nbp', `${data.results.nbp}  (⌈${data.results.parkCapacityAh.toFixed(1)}/${data.battery.capacityAh}⌉)`],
      ['⟹ Nombre total batteries Nb = Nbs×Nbp', { content: `${data.results.nbTotal} batteries (${data.battery.name})`, styles: { fontStyle: 'bold', textColor: C.sky, fillColor: C.skyL } }],
    ],
    theme: 'grid',
    bodyStyles: { fontSize: 8 },
    columnStyles: { 0: { cellWidth: 100 }, 1: { fontStyle: 'bold', halign: 'right' } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Check page break
  if (y > H - 60) { doc.addPage(); pages++; y = 20; }

  // ── MPPT ──
  y = sectionTitle(doc, 'II.C — RÉGULATEUR MPPT  (SAHELIO §4.2.2.2.2)', y, '⚙');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...C.earthM);
  doc.text('3 conditions CUMULATIVES doivent être vérifiées :', 14, y);
  y += 5;

  (doc as any).autoTable({
    startY: y,
    body: [
      ['Voct = Voc × Nps', `${data.results.voct.toFixed(1)} V`],
      ['Icct = Icc × Nbrp', `${data.results.icct.toFixed(1)} A`],
      ['① Pmrc ≥ 1,25 × Pcu × Np', { content: `≥ ${data.results.pmrcRequired.toFixed(0)} W`, styles: { textColor: C.solar, fontStyle: 'bold' } }],
      ['② Vmrc ≥ 1,25 × Voc × Nps', { content: `≥ ${data.results.vmrcRequired.toFixed(1)} V`, styles: { textColor: C.solar, fontStyle: 'bold' } }],
      ['③ Imrc ≥ 1,25 × Isc × Nbrp', { content: `≥ ${data.results.imrcRequired.toFixed(1)} A`, styles: { textColor: C.solar, fontStyle: 'bold' } }],
      ['⟹ Nombre de MPPT nécessaires', { content: `${data.results.nMpptRequired} × ${data.mppt.name}`, styles: { fontStyle: 'bold', textColor: C.earth, fillColor: C.earthL } }],
    ],
    theme: 'grid',
    bodyStyles: { fontSize: 8 },
    columnStyles: { 0: { cellWidth: 100 }, 1: { fontStyle: 'bold', halign: 'right' } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Onduleur ──
  y = sectionTitle(doc, 'II.D — ONDULEUR  (SAHELIO §4.2.2.3)', y, '⚡');
  y = formulaBox(doc, `P_ond = 1,25 × Ppt / ƞond = 1,25 × ${data.results.peakPowerW} / ${data.inverter.efficiency} = ${data.results.inverterPowerRequired.toFixed(0)} W`, y);

  (doc as any).autoTable({
    startY: y,
    body: [
      ['Puissance de pointe Ppt', `${data.results.peakPowerW.toLocaleString('fr-FR')} W`],
      ['⟹ Puissance onduleur requise', { content: `${data.results.inverterPowerRequired.toFixed(0)} W`, styles: { fontStyle: 'bold', textColor: C.green, fillColor: C.greenL } }],
      ['Nombre d\'onduleurs', `${data.results.nInvertersRequired} × ${data.inverter.name}`],
      ['Calibre disjoncteur AC', `> ${data.results.acBreakerCalib.toFixed(1)} A`],
    ],
    theme: 'grid',
    bodyStyles: { fontSize: 8 },
    columnStyles: { 0: { cellWidth: 100 }, 1: { fontStyle: 'bold', halign: 'right' } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  if (y > H - 80) { doc.addPage(); pages++; y = 20; }

  // ── Câbles & Protections ──
  y = sectionTitle(doc, 'II.E — CÂBLES & PROTECTIONS  (SAHELIO §4.2.2.4-5)', y, '🔌');
  y = formulaBox(doc, `S = (2×L×Ie×ρ)/ΔU | Ie=${data.results.currentIe.toFixed(1)}A | ΔU=${data.results.voltageDrop.toFixed(2)}V | S=${data.results.cableSectionMm2.toFixed(1)}mm² → ${data.results.cableSectionStandard}mm² Cu`, y);

  (doc as any).autoTable({
    startY: y,
    head: [['Élément', 'Valeur calculée', 'Remarque']],
    body: [
      ['Courant d\'emploi Ie = Pcmin/Us', `${data.results.currentIe.toFixed(1)} A`, ''],
      ['Chute de tension ΔU', `${data.results.voltageDrop.toFixed(2)} V (${data.params.voltageDrop}%)`, '≤ 3% (SAHELIO)'],
      ['Section câble requise', `${data.results.cableSectionMm2.toFixed(1)} mm²`, ''],
      ['⟹ Section normalisée (Cu)', `${data.results.cableSectionStandard} mm²`, 'SAHELIO Tableau 4'],
      ['Disjoncteur DC', `${data.results.dcBreaker_min.toFixed(1)}A < In < ${data.results.dcBreaker_max.toFixed(1)}A`, '1,4×Isc < In < 2×Isc'],
      ['Ue disjoncteur DC', `> ${data.results.voct.toFixed(1)} V`, '> Voct'],
      ['Parafoudre DC type 2', `Up < ${data.results.surgeProtectionUp.toFixed(0)} V`, 'Up < 0,8×Uw'],
      ['Fusibles chaînes PV', data.results.fuseInfo, 'SAHELIO Tableau 6'],
      ['Sectionneur DC In', `> ${data.results.sectionneurIn.toFixed(1)} A`, 'Np×1,25×Isc'],
      ['Sectionneur DC Ue', `> ${data.results.sectionneurUe.toFixed(1)} V`, '1,2×Nps×Voc'],
      ['Prise de terre', 'RA < 10 Ω', 'NF C 15-100 §542.2'],
    ],
    theme: 'grid',
    headStyles: { fillColor: C.earth, textColor: C.white, fontSize: 7.5 },
    bodyStyles: { fontSize: 7.5 },
    alternateRowStyles: { fillColor: C.earthL },
    margin: { left: 14, right: 14 },
  });

  // ══════════════════════════════════════════════
  // PAGE 4 — OFFRE FINANCIÈRE
  // ══════════════════════════════════════════════
  doc.addPage();
  pages++;
  y = 20;

  doc.setFillColor(...C.earthL);
  doc.rect(0, 0, W, 14, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.earthM);
  doc.text('OFFRE TECHNICO-FINANCIÈRE', 14, 9);
  doc.text(data.projectName, W - 14, 9, { align: 'right' });

  y = sectionTitle(doc, 'III. ÉQUIPEMENTS SÉLECTIONNÉS', y + 4, '📦');

  (doc as any).autoTable({
    startY: y,
    head: [['Composant', 'Modèle / Référence', 'Caractéristiques clés']],
    body: [
      ['Panneau solaire', data.panel.name, `${data.panel.wp}Wc · Voc:${data.panel.voc}V · Isc:${data.panel.isc}A · η:${data.panel.efficiency}%`],
      ['Batterie', data.battery.name, `${data.battery.capacityAh}Ah/${data.battery.voltageV}V · DoD:${data.battery.dod} · Rb:${data.battery.efficiency} · ${data.battery.type}`],
      ['Onduleur hybride', data.inverter.name, `${(data.inverter.powerW / 1000).toFixed(1)}kW · η:${(data.inverter.efficiency * 100).toFixed(1)}%`],
      ['Régulateur MPPT', data.mppt.name, `Vmax:${data.mppt.vmaxV}V · Imax:${data.mppt.imaxA}A`],
    ],
    theme: 'grid',
    headStyles: { fillColor: C.earth, textColor: C.white, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: C.earthL },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  y = sectionTitle(doc, 'IV. OFFRE FINANCIÈRE DÉTAILLÉE', y, '💰');

  const finRows = data.financial.lines.map(l => [
    l.label,
    l.description,
    l.quantity,
    { content: l.unitPriceXOF.toLocaleString('fr-FR'), styles: { halign: 'right' as const } },
    { content: l.totalXOF.toLocaleString('fr-FR'), styles: { halign: 'right' as const, fontStyle: 'bold' as const } },
  ]);

  finRows.push([
    { content: 'TOTAL HT', colSpan: 4, styles: { fillColor: C.earthL, fontStyle: 'bold' as const, halign: 'right' as const } },
    { content: data.financial.totalHT.toLocaleString('fr-FR'), styles: { fillColor: C.earthL, fontStyle: 'bold' as const, halign: 'right' as const } },
  ] as any);

  finRows.push([
    { content: `TVA (${data.params.tva}%)`, colSpan: 4, styles: { halign: 'right' as const, textColor: C.earthM } },
    { content: data.financial.tvaAmount.toLocaleString('fr-FR'), styles: { textColor: C.earthM, halign: 'right' as const } },
  ] as any);

  finRows.push([
    { content: 'TOTAL TTC', colSpan: 4, styles: { fillColor: C.solarL, fontStyle: 'bold' as const, halign: 'right' as const, textColor: C.solar } },
    { content: `${data.financial.totalTTC.toLocaleString('fr-FR')} FCFA`, styles: { fillColor: C.solarL, fontStyle: 'bold' as const, halign: 'right' as const, textColor: C.solar, fontSize: 10 } },
  ] as any);

  (doc as any).autoTable({
    startY: y,
    head: [['Équipement', 'Caractéristiques', 'Qté', 'Prix unitaire (FCFA)', 'Total (FCFA)']],
    body: finRows,
    theme: 'grid',
    headStyles: { fillColor: C.earth, textColor: C.white, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: C.earthL },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 60 },
      2: { halign: 'center', cellWidth: 15 },
      3: { halign: 'right', cellWidth: 35 },
      4: { halign: 'right', cellWidth: 35 },
    },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Note technique
  doc.setFillColor(...C.earthL);
  doc.roundedRect(14, y, W - 28, 22, 3, 3, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.earth);
  doc.text('NOTE TECHNIQUE :', 17, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.earthM);
  doc.text(
    'Pour installer un champ de modules PV, prévoir un espace suffisant pour les panneaux, les allées de maintenance,\net les distances de sécurité. Une planification rigoureuse de l\'emplacement est indispensable pour la durabilité et\nl\'efficacité de cette installation. Les distances réelles et câblages sont à adapter selon les normes locales en vigueur.',
    17, y + 13,
    { maxWidth: W - 36 }
  );

  // ── Ajouter footers sur toutes les pages ──
  const totalPages = pages;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addPageFooter(doc, p, totalPages, data.projectName);
  }

  // ── Sauvegarder ──
  const filename = `SolarDim_${data.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
