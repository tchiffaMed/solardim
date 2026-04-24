/**
 * GÉNÉRATEUR DE RAPPORT PDF — SolarDim Niger v2
 * Corrections : formatage nombres (pas de / ni espace insécable), débordements texte
 */

import type {
  CalcResults, Panel, Battery, Inverter,
  MpptController, InstallationSite, SystemParams,
} from '@/types';
import type { FinancialSummary } from '@/lib/calculations';

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
};

// ── Formatage SANS toLocaleString (évite le "/" sur Windows) ──
function fNum(n: number, decimals = 0): string {
  const fixed = n.toFixed(decimals);
  const [int, dec] = fixed.split('.');
  const formatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return dec !== undefined ? `${formatted}.${dec}` : formatted;
}
function fXOF(n: number): string { return `${fNum(Math.round(n))} FCFA`; }
function fWh(wh: number): string { return wh >= 1000 ? `${fNum(wh / 1000, 2)} kWh` : `${fNum(wh)} Wh`; }
function fWc(wc: number): string { return wc >= 1000 ? `${fNum(wc / 1000, 2)} kWc` : `${fNum(wc)} Wc`; }
function trunc(text: string, max: number): string {
  if (!text) return '';
  return text.length > max ? text.slice(0, max - 1) + '...' : text;
}

interface ReportData {
  projectName: string;
  clientName:  string;
  charges: Array<{
    name: string; type: string; quantity: number; unitPower: number;
    dailyHours: number; nightlyHours: number;
    totalPower?: number; dailyEnergy?: number; nightlyEnergy?: number; totalEnergy?: number;
  }>;
  site:     InstallationSite;
  panel:    Panel;
  battery:  Battery;
  inverter: Inverter;
  mppt:     MpptController;
  params:   SystemParams;
  results:  CalcResults;
  financial: FinancialSummary;
}

// ── Helpers ──
const MAR = 14;

function addPageHeader(doc: any, title: string, project: string) {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(...C.earthL);
  doc.rect(0, 0, w, 14, 'F');
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.earthM);
  doc.text(title, MAR, 9);
  doc.setFont('helvetica', 'normal');
  doc.text(trunc(project, 48), w - MAR, 9, { align: 'right' });
}

function addPageFooter(doc: any, page: number, total: number, project: string) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...C.solar); doc.setLineWidth(0.4);
  doc.line(MAR, h - 12, w - MAR, h - 12);
  doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.earthM);
  doc.text('SolarDim Niger - Methode  SAHELIO', MAR, h - 7);
  doc.text(trunc(project, 30), w / 2, h - 7, { align: 'center' });
  doc.text(`Page ${page} / ${total}`, w - MAR, h - 7, { align: 'right' });
}

function secTitle(doc: any, text: string, y: number): number {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(...C.solar);
  doc.roundedRect(MAR, y, w - MAR * 2, 8, 1.5, 1.5, 'F');
  doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.white);
  doc.text(text, MAR + 4, y + 5.5);
  return y + 12;
}

function fmlaBox(doc: any, lines: string[], y: number): number {
  const w = doc.internal.pageSize.getWidth();
  const lh = 4.8;
  const bh = lines.length * lh + 6;
  doc.setFillColor(250, 247, 240); doc.setDrawColor(220, 190, 130); doc.setLineWidth(0.3);
  doc.roundedRect(MAR, y, w - MAR * 2, bh, 1.5, 1.5, 'FD');
  doc.setFontSize(7.5); doc.setFont('courier', 'normal'); doc.setTextColor(100, 60, 10);
  lines.forEach((l, i) => doc.text(trunc(l, 92), MAR + 3, y + 4.5 + i * lh));
  return y + bh + 4;
}

function resTable(doc: any, rows: Array<[string, string, boolean?]>, y: number): number {
  const w = doc.internal.pageSize.getWidth();
  const rh = 7.5;
  rows.forEach(([label, value, hi], i) => {
    const ry = y + i * rh;
    if (hi) { doc.setFillColor(...C.solarL); doc.rect(MAR, ry, w - MAR * 2, rh, 'F'); }
    else if (i % 2 === 1) { doc.setFillColor(...C.earthL); doc.rect(MAR, ry, w - MAR * 2, rh, 'F'); }
    doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2);
    doc.rect(MAR, ry, w - MAR * 2, rh, 'D');
    doc.setFontSize(8); doc.setFont('helvetica', hi ? 'bold' : 'normal');
    doc.setTextColor(hi ? C.solar[0] : C.earth[0], hi ? C.solar[1] : C.earth[1], hi ? C.solar[2] : C.earth[2]);
    doc.text(trunc(label, 62), MAR + 3, ry + 5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(hi ? C.solar[0] : C.sky[0], hi ? C.solar[1] : C.sky[1], hi ? C.solar[2] : C.sky[2]);
    doc.text(trunc(value, 38), w - MAR - 2, ry + 5, { align: 'right' });
  });
  return y + rows.length * rh + 3;
}

function chkBreak(doc: any, y: number, needed = 40): number {
  const h = doc.internal.pageSize.getHeight();
  if (y + needed > h - 20) { doc.addPage(); return 22; }
  return y;
}

// ══════════════════════════════════════════════
// EXPORT PRINCIPAL
// ══════════════════════════════════════════════
export async function generatePDF(data: ReportData): Promise<void> {
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const loc   = data.site.location;
  const r     = data.results;
  const irrDef = loc?.irrDefavorable ?? 0;
  const k      = 1 + data.params.reservePercent / 100;

  // ════════════════════════
  // PAGE 1 — COUVERTURE
  // ════════════════════════
  doc.setFillColor(28, 25, 23);
  doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(...C.solar);
  doc.rect(0, 0, W, 5, 'F');

  // Bloc blanc
  doc.setFillColor(...C.white);
  doc.roundedRect(MAR, 24, W - MAR * 2, H - 40, 5, 5, 'F');

  // Titre
  doc.setFontSize(26); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.solar);
  doc.text('SolarDim Niger', W / 2, 46, { align: 'center' });
  doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.earthM);
  doc.text('Dimensionnement Technico-Financier', W / 2, 54, { align: 'center' });
  doc.text("Installation Solaire Photovoltaique", W / 2, 60, { align: 'center' });
  doc.setDrawColor(...C.solar); doc.setLineWidth(0.6);
  doc.line(MAR + 10, 64, W - MAR - 10, 64);

  // Projet
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.earth);
  doc.text(trunc(data.projectName, 52), W / 2, 73, { align: 'center', maxWidth: W - MAR * 2 - 10 });
  if (data.clientName) {
    doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.earthM);
    doc.text(`Client : ${trunc(data.clientName, 48)}`, W / 2, 81, { align: 'center' });
  }

  // 4 métriques
  const mW = (W - MAR * 2 - 9) / 4;
  [
    { l: 'Puissance installee', v: fWc(r.pcInstalled) },
    { l: 'Panneaux PV', v: `${r.npTotal} unites` },
    { l: 'Batteries', v: `${r.nbTotal} unites` },
    { l: 'Tension Us', v: `${r.systemVoltage} V` },
  ].forEach(({ l, v }, i) => {
    const mx = MAR + i * (mW + 3);
    doc.setFillColor(...C.solarL); doc.setDrawColor(...C.solar); doc.setLineWidth(0.3);
    doc.roundedRect(mx, 90, mW, 20, 2, 2, 'FD');
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.earthM);
    doc.text(l, mx + mW / 2, 96.5, { align: 'center' });
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.solar);
    doc.text(v, mx + mW / 2, 105, { align: 'center' });
  });

  // Site
  if (loc) {
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.earth);
    doc.text(trunc(`Site : ${loc.ville}${loc.region ? ` - ${loc.region}` : ''}, Niger`, 58), W / 2, 122, { align: 'center' });
    doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.earthM);
    doc.text(`Coord : ${loc.lat.toFixed(3)}N / ${loc.lng.toFixed(3)}E   |   Irr. mois def. : ${irrDef} kWh/m2/j`, W / 2, 129, { align: 'center' });
    doc.text(`Inclinaison : ${data.site.inclinaison}   |   Orientation : ${data.site.orientation}`, W / 2, 135, { align: 'center' });
  }

  // Badge  SAHELIO
  doc.setFillColor(...C.skyL); doc.setDrawColor(...C.sky); doc.setLineWidth(0.4);
  doc.roundedRect(W / 2 - 52, 141, 104, 11, 3, 3, 'FD');
  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.sky);
  doc.text('Methode  SAHELIO - Module 4 - Electricite Solaire PV', W / 2, 148, { align: 'center' });

  // Montant
  doc.setFillColor(40, 36, 33); doc.roundedRect(MAR, 158, W - MAR * 2, 22, 3, 3, 'F');
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.earthM);
  doc.text('Montant total TTC', W / 2, 165.5, { align: 'center' });
  doc.setFontSize(15); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.solar);
  doc.text(fXOF(data.financial.totalTTC), W / 2, 175, { align: 'center' });

  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.earthM);
  doc.text(`Etabli le : ${today}`, W / 2, 192, { align: 'center' });

  doc.setFillColor(...C.solar); doc.rect(0, H - 10, W, 10, 'F');
  doc.setFontSize(7.5); doc.setTextColor(...C.white);
  doc.text('SolarDim Niger - Rapport de dimensionnement PV', MAR, H - 4);
  doc.text(today, W - MAR, H - 4, { align: 'right' });

  // ════════════════════════
  // PAGE 2 — BILAN CHARGES
  // ════════════════════════
  doc.addPage();
  addPageHeader(doc, 'BILAN ENERGETIQUE', data.projectName);
  let y = 20;
  y = secTitle(doc, 'I. BILAN ENERGETIQUE DES CHARGES', y);

  const chargeRows = data.charges.map(c => {
    const pt = c.totalPower ?? c.quantity * c.unitPower;
    return [
      trunc(c.name, 20),
      trunc(c.type, 11),
      String(c.quantity),
      `${fNum(c.unitPower)}W`,
      `${fNum(pt)}W`,
      `${c.dailyHours}h`,
      `${c.nightlyHours}h`,
      fNum(c.dailyEnergy ?? 0),
      fNum(c.nightlyEnergy ?? 0),
      fNum(c.totalEnergy ?? 0),
    ];
  });

  const totEj = data.charges.reduce((s, c) => s + (c.dailyEnergy ?? 0), 0);
  const totEn = data.charges.reduce((s, c) => s + (c.nightlyEnergy ?? 0), 0);

  chargeRows.push([
    { content: 'TOTAL', styles: { fontStyle: 'bold' as const } },
    '', '', '',
    { content: `${fNum(r.peakPowerW)}W`, styles: { fontStyle: 'bold' as const, textColor: C.solar } },
    '', '',
    { content: fNum(totEj), styles: { fontStyle: 'bold' as const } },
    { content: fNum(totEn), styles: { fontStyle: 'bold' as const } },
    { content: `${fNum(totEj + totEn)} Wh`, styles: { fontStyle: 'bold' as const } },
  ] as any);

  chargeRows.push([
    { content: `Reserve x${k.toFixed(2)} (+${data.params.reservePercent}%)`, colSpan: 7,
      styles: { fillColor: C.solarL, fontStyle: 'bold' as const, textColor: C.solar } },
    { content: fNum(r.dailyEnergyWithReserve), styles: { fillColor: C.solarL, fontStyle: 'bold' as const, textColor: C.solar } },
    { content: fNum(r.nightEnergyWithReserve), styles: { fillColor: C.solarL, fontStyle: 'bold' as const, textColor: C.solar } },
    { content: `${fNum(r.totalEnergyWithReserve)} Wh`, styles: { fillColor: C.solarL, fontStyle: 'bold' as const, textColor: C.solar } },
  ] as any);

  (doc as any).autoTable({
    startY: y,
    head: [['Appareil', 'Type', 'N', 'Pu', 'Pt(W)', 'Dj', 'Dn', 'Ej(Wh)', 'En(Wh)', 'Etot(Wh)']],
    body: chargeRows,
    theme: 'grid',
    headStyles: { fillColor: C.earth, textColor: C.white, fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7, halign: 'center' },
    columnStyles: {
      0: { halign: 'left', cellWidth: 36 },
      1: { halign: 'left', cellWidth: 19 },
      2: { cellWidth: 8 },
      3: { cellWidth: 13 },
      4: { cellWidth: 15 },
      5: { cellWidth: 8 },
      6: { cellWidth: 8 },
      7: { cellWidth: 21 },
      8: { cellWidth: 21 },
      9: { cellWidth: 23 },
    },
    alternateRowStyles: { fillColor: C.earthL },
    margin: { left: MAR, right: MAR },
    styles: { overflow: 'ellipsize', cellPadding: 1.5 },
  });

  y = (doc as any).lastAutoTable.finalY + 6;
  y = resTable(doc, [
    ['Energie totale brute',           fWh(r.totalEnergyWh)],
    ['Energie journee brute',          fWh(r.dailyEnergyWh)],
    ['Energie nocturne brute',         fWh(r.nightEnergyWh)],
    [`Energie totale x${k.toFixed(2)}`, fWh(r.totalEnergyWithReserve), true],
    ['Energie journee avec reserve',   fWh(r.dailyEnergyWithReserve)],
    ['Energie nocturne avec reserve',  fWh(r.nightEnergyWithReserve)],
    ['Puissance de pointe Ppt',        `${fNum(r.peakPowerW / 1000, 2)} kW`],
  ], y);

  // ════════════════════════
  // PAGE 3 — CALCULS  SAHELIO
  // ════════════════════════
  doc.addPage();
  addPageHeader(doc, 'CALCULS  SAHELIO - DIMENSIONNEMENT', data.projectName);
  y = 20;

  // A — PV
  y = secTitle(doc, 'II.A - CHAMP SOLAIRE PV  ( SAHELIO §4.2.1.2)', y);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.earthM);
  doc.text(`Site : ${trunc(loc?.ville ?? '-', 22)}  |  Irr. mois def. : ${irrDef} kWh/m2/j  |  Rp = ${data.params.rp}`, MAR, y);
  y += 6;
  y = fmlaBox(doc, [
    `Pcmin = Etot x ${k.toFixed(2)} / (Rp x Irr) = ${fNum(r.totalEnergyWithReserve)} / (${data.params.rp} x ${irrDef}) = ${fNum(r.pcMin, 1)} Wc`,
    `Nps = Us/Vnom = ${r.systemVoltage}/${data.panel.vnom} = ${r.nps}   |   Nbrp = ceil(Np/Nps) = ${r.nbrp}`,
  ], y);
  y = resTable(doc, [
    ['Energie totale journaliere (x1,25)',    `${fNum(r.totalEnergyWithReserve)} Wh`],
    ['Irradiation mois defavorable',          `${irrDef} kWh/m2/j`],
    ['Ratio de performance Rp',               String(data.params.rp)],
    ['Tension systeme Us ( SAHELIO Tableau 3)',    `${r.systemVoltage} V`],
    ['=> Pcmin',                              `${fNum(r.pcMin, 1)} Wc`, true],
    ['Panneaux en serie Nps = Us/Vnom',       `${r.nps}`],
    ['Strings en parallele Nbrp',             `${r.nbrp}`],
    ['=> Np total installe',                  `${r.npTotal} panneaux`, true],
    ['Puissance installee Nps x Nbrp x Pcu', `${fNum(r.pcInstalled)} Wc  OK`, true],
  ], y);

  // B — Batteries
  y = chkBreak(doc, y, 75);
  y = secTitle(doc, 'II.B - PARC BATTERIE  ( SAHELIO §4.2.2.1)', y);
  y = fmlaBox(doc, [
    `Cp[Ah] = (En_nuit x Nj) / (Us x DoD x Rb)`,
    `       = (${fNum(r.nightEnergyWithReserve)} x ${data.params.autonomyDays}) / (${r.systemVoltage} x ${data.battery.dod} x ${data.battery.efficiency}) = ${fNum(r.parkCapacityAh, 1)} Ah`,
    `Nbs = Us/Ub = ${r.systemVoltage}/${data.battery.voltageV} = ${r.nbs}   |   Nbp = ceil(Cp/Cap) = ${r.nbp}   |   Nb = ${r.nbs}x${r.nbp} = ${r.nbTotal}`,
  ], y);
  y = resTable(doc, [
    ['Energie nocturne avec reserve',   `${fNum(r.nightEnergyWithReserve)} Wh`],
    ['Autonomie Nj',                    `${data.params.autonomyDays} jour(s)`],
    ['Prof. decharge DoD',              `${data.battery.dod}  (${data.battery.type})`],
    ['Rendement batterie Rb',           String(data.battery.efficiency)],
    ['=> Capacite parc Cp',             `${fNum(r.parkCapacityAh, 1)} Ah`, true],
    ['Batteries serie Nbs = Us/Ub',     `${r.nbs}  (${r.systemVoltage}V / ${data.battery.voltageV}V)`],
    ['Batteries parallele Nbp',         `${r.nbp}`],
    ['=> Nb total batteries',           `${r.nbTotal} batteries`, true],
  ], y);

  // C — MPPT
  y = chkBreak(doc, y, 60);
  y = secTitle(doc, 'II.C - REGULATEUR MPPT  ( SAHELIO §4.2.2.2.2) — 3 conditions', y);
  y = fmlaBox(doc, [
    `Voct = ${data.panel.voc} x ${r.nps} = ${fNum(r.voct, 1)} V   |   Icct = ${data.panel.isc} x ${r.nbrp} = ${fNum(r.icct, 1)} A`,
    `(1) Pmrc >= 1,25 x Pcu x Np = ${fNum(r.pmrcRequired, 0)} W`,
    `(2) Vmrc >= 1,25 x Voc x Nps = ${fNum(r.vmrcRequired, 1)} V`,
    `(3) Imrc >= 1,25 x Isc x Nbrp = ${fNum(r.imrcRequired, 1)} A`,
  ], y);
  y = resTable(doc, [
    ['(1) Pmrc requis',   `>= ${fNum(r.pmrcRequired, 0)} W`],
    ['(2) Vmrc requis',   `>= ${fNum(r.vmrcRequired, 1)} V`],
    ['(3) Imrc requis',   `>= ${fNum(r.imrcRequired, 1)} A`],
    ['=> MPPT',           trunc(`${r.nMpptRequired} x ${data.mppt.name}`, 48), true],
  ], y);

  // D — Onduleur
  y = chkBreak(doc, y, 55);
  y = secTitle(doc, 'II.D - ONDULEUR  ( SAHELIO §4.2.2.3)', y);
  y = fmlaBox(doc, [`P_ond = 1,25 x ${fNum(r.peakPowerW)} / ${data.inverter.efficiency} = ${fNum(r.inverterPowerRequired, 0)} W`], y);
  y = resTable(doc, [
    ['Puissance de pointe Ppt',  `${fNum(r.peakPowerW)} W`],
    ['=> P onduleur requise',     `${fNum(r.inverterPowerRequired, 0)} W`, true],
    ['Nombre onduleurs',          `${r.nInvertersRequired} x ${trunc(data.inverter.name, 35)}`],
    ['Disjoncteur AC',            `> ${fNum(r.acBreakerCalib, 1)} A`],
  ], y);

  // E — Câbles
  y = chkBreak(doc, y, 90);
  y = secTitle(doc, 'II.E - CABLES & PROTECTIONS  ( SAHELIO §4.2.2.4-5)', y);
  y = fmlaBox(doc, [
    `S = (2 x L x Ie x rho_Cu) / DeltaU   |   rho_Cu = 0,017 Ohm.mm2/m   |   DU <= 3%`,
    `Ie = Pcmin/Us = ${fNum(r.pcMin, 0)} / ${r.systemVoltage} = ${fNum(r.currentIe, 1)} A`,
    `DeltaU = ${data.params.voltageDrop}% x ${r.systemVoltage}V = ${fNum(r.voltageDrop, 2)} V`,
    `S = (2 x ${data.params.cableLength} x ${fNum(r.currentIe, 1)} x 0,017) / ${fNum(r.voltageDrop, 2)} = ${fNum(r.cableSectionMm2, 1)} mm2`,
  ], y);
  y = resTable(doc, [
    ['Courant emploi Ie',         `${fNum(r.currentIe, 1)} A`],
    ['Chute tension DU',          `${fNum(r.voltageDrop, 2)} V (${data.params.voltageDrop}%)`],
    ['Section calculee S',        `${fNum(r.cableSectionMm2, 1)} mm2`],
    ['=> Section normalisee Cu',  `${r.cableSectionStandard} mm2`, true],
    ['Disjoncteur DC',            `${fNum(r.dcBreaker_min, 1)} A < In < ${fNum(r.dcBreaker_max, 1)} A`],
    ['Ue disjoncteur DC',         `> ${fNum(r.voct, 1)} V`],
    ['Parafoudre DC type 2',      `Up < ${fNum(r.surgeProtectionUp, 0)} V`],
    ['Fusibles chaines PV',       trunc(r.fuseInfo, 52)],
    ['Sectionneur DC In',         `> ${fNum(r.sectionneurIn, 1)} A`],
    ['Sectionneur DC Ue',         `> ${fNum(r.sectionneurUe, 1)} V`],
    ['Prise de terre RA',         '< 10 Ohm  (NF C 15-100)'],
  ], y);

  // ════════════════════════
  // PAGE 4 — OFFRE FINANCIÈRE
  // ════════════════════════
  doc.addPage();
  addPageHeader(doc, 'OFFRE TECHNICO-FINANCIERE', data.projectName);
  y = 20;

  y = secTitle(doc, 'III. EQUIPEMENTS SELECTIONNES', y);
  (doc as any).autoTable({
    startY: y,
    head: [['Composant', 'Modele', 'Caracteristiques']],
    body: [
      ['Panneau solaire',   trunc(data.panel.name, 28),   trunc(`${data.panel.wp}Wc | Voc:${data.panel.voc}V | Isc:${data.panel.isc}A | eta:${data.panel.efficiency}%`, 42)],
      ['Batterie',          trunc(data.battery.name, 28), trunc(`${data.battery.capacityAh}Ah/${data.battery.voltageV}V | DoD:${data.battery.dod} | Rb:${data.battery.efficiency} | ${data.battery.type}`, 42)],
      ['Onduleur hybride',  trunc(data.inverter.name, 28), `${(data.inverter.powerW / 1000).toFixed(1)}kW | eta:${(data.inverter.efficiency * 100).toFixed(0)}%`],
      ['Regulateur MPPT',   trunc(data.mppt.name, 28),   `Vmax:${data.mppt.vmaxV}V | Imax:${data.mppt.imaxA}A`],
    ],
    theme: 'grid',
    headStyles: { fillColor: C.earth, textColor: C.white, fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5 },
    alternateRowStyles: { fillColor: C.earthL },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 58 },
      2: { cellWidth: W - MAR * 2 - 88 },
    },
    margin: { left: MAR, right: MAR },
    styles: { overflow: 'ellipsize', cellPadding: 2 },
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  y = secTitle(doc, 'IV. OFFRE FINANCIERE DETAILLEE', y);
  const finBody = data.financial.lines.map(l => [
    trunc(l.label, 20),
    trunc(l.description, 36),
    String(l.quantity),
    { content: fNum(l.unitPriceXOF), styles: { halign: 'right' as const } },
    { content: fNum(l.totalXOF), styles: { halign: 'right' as const, fontStyle: 'bold' as const } },
  ]);

  finBody.push([
    { content: 'TOTAL HT', colSpan: 4, styles: { fillColor: C.earthL, fontStyle: 'bold' as const, halign: 'right' as const } },
    { content: fNum(data.financial.totalHT), styles: { fillColor: C.earthL, fontStyle: 'bold' as const, halign: 'right' as const } },
  ] as any);
  finBody.push([
    { content: `TVA (${data.params.tva}%)`, colSpan: 4, styles: { halign: 'right' as const, textColor: C.earthM } },
    { content: fNum(data.financial.tvaAmount), styles: { textColor: C.earthM, halign: 'right' as const } },
  ] as any);
  finBody.push([
    { content: 'TOTAL TTC', colSpan: 4, styles: { fillColor: C.solarL, fontStyle: 'bold' as const, halign: 'right' as const, textColor: C.solar } },
    { content: `${fNum(data.financial.totalTTC)} FCFA`, styles: { fillColor: C.solarL, fontStyle: 'bold' as const, halign: 'right' as const, textColor: C.solar } },
  ] as any);

  (doc as any).autoTable({
    startY: y,
    head: [['Equipement', 'Description', 'Qte', 'Prix unit. (FCFA)', 'Total (FCFA)']],
    body: finBody,
    theme: 'grid',
    headStyles: { fillColor: C.earth, textColor: C.white, fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: C.earthL },
    columnStyles: {
      0: { cellWidth: 34, halign: 'left' },
      1: { cellWidth: 65, halign: 'left' },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 33, halign: 'right' },
      4: { cellWidth: 33, halign: 'right' },
    },
    margin: { left: MAR, right: MAR },
    styles: { overflow: 'ellipsize', cellPadding: 2 },
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // Blocs TTC
  y = chkBreak(doc, y, 40);
  const bW = (W - MAR * 2 - 6) / 3;
  [
    { l: 'Total HT',        v: `${fNum(data.financial.totalHT)} FCFA`,    bg: C.earthL, tc: C.earth  },
    { l: `TVA ${data.params.tva}%`, v: `${fNum(data.financial.tvaAmount)} FCFA`, bg: C.earthL, tc: C.earthM },
    { l: 'TOTAL TTC',       v: `${fNum(data.financial.totalTTC)} FCFA`,   bg: C.solarL, tc: C.solar  },
  ].forEach(({ l, v, bg, tc }, i) => {
    const bx = MAR + i * (bW + 3);
    doc.setFillColor(...bg); doc.setDrawColor(...C.solar); doc.setLineWidth(0.3);
    doc.roundedRect(bx, y, bW, 18, 2, 2, i === 2 ? 'FD' : 'F');
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.earthM);
    doc.text(l, bx + bW / 2, y + 6, { align: 'center' });
    doc.setFontSize(i === 2 ? 9 : 8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...tc);
    doc.text(trunc(v, 22), bx + bW / 2, y + 13, { align: 'center' });
  });
  y += 24;

  // Note technique
  doc.setFillColor(...C.earthL);
  doc.roundedRect(MAR, y, W - MAR * 2, 26, 2, 2, 'F');
  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.earth);
  doc.text('NOTE TECHNIQUE :', MAR + 4, y + 6);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.earthM);
  const note = 'Prevoir un espace suffisant pour les panneaux, les allees de maintenance et les distances de securite. ' +
    'Les sections de cables et distances reelles doivent etre adaptees selon les normes locales (NF C 15-100).';
  doc.text(note, MAR + 4, y + 13, { maxWidth: W - MAR * 2 - 8 });

  // ─ Footers ─
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addPageFooter(doc, p, totalPages, data.projectName);
  }

  const safeName = data.projectName.replace(/[^a-zA-Z0-9\-_]/g, '_').slice(0, 40);
  doc.save(`SolarDim_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
