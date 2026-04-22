'use client';

import { useMemo } from 'react';
import type { CalcResults, Panel, Battery, Inverter, MpptController } from '@/types';

interface SchemaInstallationProps {
  results: CalcResults;
  panel: Panel;
  battery: Battery;
  inverter: Inverter;
  mppt: MpptController;
  projectName?: string;
}

// ── Composants SVG réutilisables ──

function PanelIcon({ x, y, w = 38, h = 26, count }: { x: number; y: number; w?: number; h?: number; count?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill="#1a2a5e" stroke="#334477" strokeWidth="1.5" />
      {/* Cellules */}
      {[0, 1].map(row =>
        [0, 1, 2].map(col => (
          <rect
            key={`${row}-${col}`}
            x={x + 3 + col * 11}
            y={y + 3 + row * 11}
            width={9} height={9}
            fill="#263870" stroke="#334d8a" strokeWidth="0.5"
          />
        ))
      )}
      {count && count > 1 && (
        <text x={x + w / 2} y={y + h + 10} textAnchor="middle" fill="#D97706" fontSize="9" fontWeight="600">
          ×{count}
        </text>
      )}
    </g>
  );
}

function BatteryIcon({ x, y, count }: { x: number; y: number; count: number }) {
  return (
    <g>
      {/* Corps batterie */}
      <rect x={x} y={y} width={36} height={52} rx="4" fill="#1e3a5f" stroke="#2563eb" strokeWidth="1.5" />
      {/* Borne + */}
      <rect x={x + 13} y={y - 6} width={10} height={8} rx="2" fill="#ef4444" />
      <text x={x + 18} y={y - 1} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">+</text>
      {/* Borne - */}
      <rect x={x + 13} y={y + 50} width={10} height={8} rx="2" fill="#6b7280" />
      <text x={x + 18} y={y + 56} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">−</text>
      {/* Barres niveaux */}
      {[0, 1, 2, 3].map(i => (
        <rect
          key={i}
          x={x + 6}
          y={y + 8 + i * 10}
          width={24}
          height={7}
          rx="1"
          fill={i < 3 ? '#3b82f6' : '#1d4ed8'}
        />
      ))}
      {/* Label */}
      <text x={x + 18} y={y + 62} textAnchor="middle" fill="#D97706" fontSize="9" fontWeight="600">
        ×{count}
      </text>
    </g>
  );
}

function InverterIcon({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={52} height={44} rx="5" fill="#1f2937" stroke="#374151" strokeWidth="1.5" />
      {/* Symbole DC→AC */}
      <text x={x + 9} y={y + 18} fill="#60a5fa" fontSize="9" fontWeight="bold">DC</text>
      <text x={x + 34} y={y + 18} fill="#34d399" fontSize="9" fontWeight="bold">AC</text>
      {/* Flèche */}
      <line x1={x + 22} y1={y + 14} x2={x + 30} y2={y + 14} stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#arrow)" />
      {/* Sinusoïde */}
      <path
        d={`M ${x + 8} ${y + 30} Q ${x + 14} ${y + 24} ${x + 18} ${y + 30} Q ${x + 22} ${y + 36} ${x + 26} ${y + 30}`}
        fill="none" stroke="#34d399" strokeWidth="1.2"
      />
      {/* LED verte */}
      <circle cx={x + 44} cy={y + 8} r="3" fill="#22c55e" />
    </g>
  );
}

function MpptIcon({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={44} height={36} rx="4" fill="#1c1f2e" stroke="#4b5563" strokeWidth="1.5" />
      <text x={x + 22} y={y + 13} textAnchor="middle" fill="#60a5fa" fontSize="7.5" fontWeight="bold">MPPT</text>
      {/* Courbe MPPT */}
      <path
        d={`M ${x + 6} ${y + 28} L ${x + 14} ${y + 22} L ${x + 22} ${y + 20} L ${x + 30} ${y + 22} L ${x + 38} ${y + 28}`}
        fill="none" stroke="#f59e0b" strokeWidth="1.2"
      />
      <circle cx={x + 22} cy={y + 20} r="2.5" fill="#f59e0b" />
    </g>
  );
}

function ProtectionIcon({ x, y, label, color = '#374151' }: { x: number; y: number; label: string; color?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={28} height={20} rx="3" fill={color} stroke="#6b7280" strokeWidth="1" />
      <text x={x + 14} y={y + 13} textAnchor="middle" fill="white" fontSize="7" fontWeight="600">{label}</text>
    </g>
  );
}

function Wire({ x1, y1, x2, y2, color = '#d97706', dashed = false }: {
  x1: number; y1: number; x2: number; y2: number; color?: string; dashed?: boolean;
}) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth="2"
      strokeDasharray={dashed ? '4,3' : undefined}
    />
  );
}

function WireH({ x1, y1, x2, y2, color = '#d97706' }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  const midX = (x1 + x2) / 2;
  return (
    <path
      d={`M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`}
      fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"
    />
  );
}

function Label({ x, y, text, sub, color = '#78716c' }: { x: number; y: number; text: string; sub?: string; color?: string }) {
  return (
    <g>
      <text x={x} y={y} textAnchor="middle" fill={color} fontSize="9.5" fontWeight="600">{text}</text>
      {sub && <text x={x} y={y + 11} textAnchor="middle" fill="#a78a6a" fontSize="8">{sub}</text>}
    </g>
  );
}

function SectionBadge({ x, y, w, h, label, color }: { x: number; y: number; w: number; h: number; label: string; color: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8" fill={color + '18'} stroke={color + '44'} strokeWidth="1" strokeDasharray="4,3" />
      <text x={x + w / 2} y={y + 12} textAnchor="middle" fill={color} fontSize="8" fontWeight="700" letterSpacing="1">{label}</text>
    </g>
  );
}

// ── Composant principal ──
export default function SchemaInstallation({
  results, panel, battery, inverter, mppt, projectName,
}: SchemaInstallationProps) {
  const schema = useMemo(() => ({
    displayPanels: Math.min(results.nbrp, 4), // Max 4 strings affichées
    moreStrings: results.nbrp > 4 ? results.nbrp - 4 : 0,
    nbat: results.nbTotal,
    nmppt: results.nMpptRequired,
    nond: results.nInvertersRequired,
  }), [results]);

  const W = 780, H = 480;
  const PANEL_START_X = 40;
  const MPPT_X = 260;
  const BAT_X = 360;
  const INV_X = 500;
  const LOAD_X = 680;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: '600px', background: '#fafaf9', borderRadius: '12px' }}
      >
        {/* Définitions */}
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 Z" fill="#f59e0b" />
          </marker>
          <marker id="arrowAC" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 Z" fill="#34d399" />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Fond */}
        <rect width={W} height={H} fill="#fafaf9" rx="12" />

        {/* Titre */}
        <text x={W / 2} y={24} textAnchor="middle" fill="#1c1917" fontSize="13" fontWeight="700" fontFamily="serif">
          Schéma unifilaire — {projectName ?? 'Installation PV'}
        </text>
        <text x={W / 2} y={38} textAnchor="middle" fill="#78716c" fontSize="8.5">
          {results.npTotal} panneaux {panel.wp}Wc · {results.nbTotal} batteries {battery.capacityAh}Ah/{battery.voltageV}V · Us={results.systemVoltage}V
        </text>
        <line x1={20} y1={44} x2={W - 20} y2={44} stroke="#e7e5e4" strokeWidth="1" />

        {/* ── Zones colorées ── */}
        <SectionBadge x={PANEL_START_X - 8} y={52} w={195} h={340} label="CHAMP PV" color="#d97706" />
        <SectionBadge x={MPPT_X - 15} y={52} w={80} h={160} label="MPPT" color="#6366f1" />
        <SectionBadge x={BAT_X - 10} y={52} w={80} h={340} label="STOCKAGE" color="#2563eb" />
        <SectionBadge x={INV_X - 10} y={52} w={80} h={200} label="ONDULEUR" color="#059669" />
        <SectionBadge x={LOAD_X - 8} y={52} w={88} h={340} label="CHARGES AC" color="#dc2626" />

        {/* ── Bus DC (ligne principale) ── */}
        <line x1={PANEL_START_X + 80} y1={200} x2={INV_X + 26} y2={200} stroke="#d97706" strokeWidth="3" opacity="0.35" />
        <text x={PANEL_START_X + 120} y={215} fill="#d97706" fontSize="8" fontWeight="600">Bus DC {results.systemVoltage}V</text>

        {/* ── Bus AC ── */}
        <line x1={INV_X + 52} y1={200} x2={LOAD_X + 44} y2={200} stroke="#34d399" strokeWidth="3" opacity="0.35" />
        <text x={INV_X + 80} y={215} fill="#059669" fontSize="8" fontWeight="600">Bus AC 230V</text>

        {/* ── Panneaux PV ── */}
        {Array.from({ length: schema.displayPanels }).map((_, i) => {
          const py = 70 + i * 80;
          const hasMore = i === schema.displayPanels - 1 && schema.moreStrings > 0;

          return (
            <g key={i}>
              {/* String de panneaux (Nps en série) */}
              {Array.from({ length: Math.min(results.nps, 3) }).map((_, j) => (
                <PanelIcon
                  key={j}
                  x={PANEL_START_X + j * 44}
                  y={py}
                  count={j === 0 && results.nps > 3 ? results.nps : undefined}
                />
              ))}

              {/* Label string */}
              <text x={PANEL_START_X + 5} y={py + 38} fill="#1a2a5e" fontSize="7.5">
                String {i + 1} ({results.nps} pan. série)
              </text>

              {/* Fusible sur chaque string */}
              {results.nbrp > 3 && (
                <ProtectionIcon x={PANEL_START_X + 165} y={py + 6} label="FUS" color="#78350f" />
              )}

              {/* Fil vers bus DC */}
              <WireH
                x1={PANEL_START_X + (Math.min(results.nps, 3)) * 44 + (results.nbrp > 3 ? 32 : 0)}
                y1={py + 13}
                x2={MPPT_X + 22}
                y2={200}
                color="#d97706"
              />

              {hasMore && (
                <text x={PANEL_START_X + 60} y={py + 95} fill="#78716c" fontSize="8" fontStyle="italic">
                  + {schema.moreStrings} autre(s) string(s)…
                </text>
              )}
            </g>
          );
        })}

        {/* ── MPPT ── */}
        {Array.from({ length: Math.min(schema.nmppt, 2) }).map((_, i) => {
          const my = 80 + i * 90;
          return (
            <g key={i}>
              <MpptIcon x={MPPT_X} y={my} />
              <Label
                x={MPPT_X + 22} y={my + 48}
                text={`MPPT ${i + 1}`}
                sub={`${mppt.vmaxV}V/${mppt.imaxA}A`}
                color="#4f46e5"
              />
              {/* Disjoncteur DC avant MPPT */}
              <ProtectionIcon x={MPPT_X + 50} y={my + 8} label="DJ-DC" color="#78350f" />
              {/* Fil MPPT → Bus DC */}
              <Wire x1={MPPT_X + 78} y1={my + 18} x2={INV_X} y2={200} color="#d97706" />
            </g>
          );
        })}
        {schema.nmppt > 2 && (
          <text x={MPPT_X + 22} y={260} textAnchor="middle" fill="#78716c" fontSize="8" fontStyle="italic">
            +{schema.nmppt - 2} MPPT…
          </text>
        )}

        {/* ── Parafoudre DC ── */}
        <ProtectionIcon x={MPPT_X - 5} y={290} label="⚡PF-DC" color="#7c3aed" />
        <Label x={MPPT_X + 9} y={325} text="Paraf. DC" sub="Type 2" color="#7c3aed" />
        <Wire x1={MPPT_X + 9} y1={310} x2={MPPT_X + 9} y2={200} color="#7c3aed" dashed />

        {/* ── Batteries ── */}
        <BatteryIcon x={BAT_X} y={80} count={results.nbTotal} />
        <Label
          x={BAT_X + 18} y={160}
          text={`${battery.type}`}
          sub={`${results.nbTotal}×${battery.capacityAh}Ah/${battery.voltageV}V`}
          color="#2563eb"
        />
        {/* Disjoncteur batterie */}
        <ProtectionIcon x={BAT_X + 40} y={90} label="DJ-DC" color="#78350f" />
        {/* Fil batterie → Bus DC */}
        <Wire x1={BAT_X + 36} y1={130} x2={BAT_X + 36} y2={200} color="#2563eb" />
        <Wire x1={BAT_X + 36} y1={200} x2={INV_X} y2={200} color="#2563eb" />

        {/* BMS / Sectionneur */}
        <ProtectionIcon x={BAT_X} y={280} label="BMS" color="#1d4ed8" />
        <Label x={BAT_X + 14} y={314} text="Sectionneur" sub={`≥${results.sectionneurIn.toFixed(0)}A`} color="#1d4ed8" />

        {/* ── Onduleur ── */}
        <InverterIcon x={INV_X} y={160} />
        <Label
          x={INV_X + 26} y={218}
          text={`Onduleur`}
          sub={`${(inverter.powerW / 1000).toFixed(1)}kW η=${(inverter.efficiency * 100).toFixed(0)}%`}
          color="#059669"
        />
        {/* Disjoncteur AC */}
        <ProtectionIcon x={INV_X + 12} y={240} label="DJ-AC" color="#065f46" />
        <Label x={INV_X + 26} y={275} text="Disj. AC" sub={`>${results.acBreakerCalib.toFixed(0)}A`} color="#065f46" />

        {/* Parafoudre AC */}
        <ProtectionIcon x={INV_X + 12} y={290} label="⚡PF-AC" color="#7c3aed" />

        {/* Prise de terre */}
        <ProtectionIcon x={INV_X + 12} y={320} label="⏚ TERRE" color="#374151" />
        <Label x={INV_X + 26} y={355} text="RA < 10Ω" color="#374151" />

        {/* ── Fil onduleur → charges ── */}
        <Wire x1={INV_X + 52} y1={182} x2={LOAD_X} y2={182} color="#34d399" />

        {/* ── Charges AC ── */}
        {[
          { label: '💡 Éclairage', y: 90, color: '#fbbf24' },
          { label: '🔌 Prises AC', y: 155, color: '#60a5fa' },
          { label: '❄️ Réfrig./Clim.', y: 220, color: '#34d399' },
          { label: '⚙️ Moteurs', y: 285, color: '#f87171' },
        ].map(({ label, y, color }) => (
          <g key={label}>
            <rect x={LOAD_X + 2} y={y} width={68} height={26} rx="5"
              fill={color + '22'} stroke={color + '88'} strokeWidth="1.2" />
            <text x={LOAD_X + 36} y={y + 17} textAnchor="middle" fill={color === '#fbbf24' ? '#92400e' : '#1c1917'}
              fontSize="8.5" fontWeight="600">{label}</text>
            <WireH x1={LOAD_X} y1={182} x2={LOAD_X + 2} y2={y + 13} color={color} />
          </g>
        ))}

        {/* ── Section câble ── */}
        <g>
          <rect x={310} y={194} width={70} height={14} rx="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
          <text x={345} y={204} textAnchor="middle" fill="#92400e" fontSize="7.5" fontWeight="600">
            Câble {results.cableSectionStandard}mm² Cu
          </text>
        </g>

        {/* ── Légende ── */}
        <g transform={`translate(20, ${H - 60})`}>
          <rect x={0} y={0} width={W - 40} height={52} rx="6" fill="#f5f5f4" stroke="#e7e5e4" strokeWidth="1" />
          <text x={8} y={13} fill="#78716c" fontSize="8.5" fontWeight="700">LÉGENDE :</text>
          {[
            { color: '#d97706', label: 'Courant DC (solaire/batteries)', x: 70 },
            { color: '#34d399', label: 'Courant AC (charges)', x: 260 },
            { color: '#2563eb', label: 'Batteries', x: 410 },
            { color: '#7c3aed', label: 'Protections', x: 510 },
            { color: '#374151', label: 'Mise à la terre', x: 620 },
          ].map(({ color, label, x }) => (
            <g key={label}>
              <line x1={x} y1={29} x2={x + 16} y2={29} stroke={color} strokeWidth="2.5" />
              <text x={x + 20} y={32} fill="#57534e" fontSize="7.5">{label}</text>
            </g>
          ))}
          {/* Avertissement */}
          <text x={8} y={47} fill="#a16207" fontSize="7.5" fontStyle="italic">
            ⚠ Schéma de principe — distances et câblages réels à adapter selon les normes locales en vigueur (NF C 15-100)
          </text>
        </g>
      </svg>
    </div>
  );
}
