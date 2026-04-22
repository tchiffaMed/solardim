"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";

// ── Données mensuelles irradiation Niger (kWh/m²/j par ville approx.) ──
const MONTHLY_IRR_NIAMEY = [
  { mois: "Jan", irr: 5.2, production: 0 },
  { mois: "Fév", irr: 5.8, production: 0 },
  { mois: "Mar", irr: 6.2, production: 0 },
  { mois: "Avr", irr: 6.5, production: 0 },
  { mois: "Mai", irr: 6.1, production: 0 },
  { mois: "Jun", irr: 5.6, production: 0 },
  { mois: "Jul", irr: 5.1, production: 0 },
  { mois: "Aoû", irr: 4.9, production: 0 },
  { mois: "Sep", irr: 5.0, production: 0 },
  { mois: "Oct", irr: 5.5, production: 0 },
  { mois: "Nov", irr: 5.3, production: 0 },
  { mois: "Déc", irr: 4.2, production: 0 }, // Mois défavorable
];

interface ProductionChartProps {
  pcInstalled: number; // Wc installé
  rp: number; // Ratio perf
  latitude: number; // Pour ajuster les données
  irrDefavorable: number;
}

function adjustIrr(baseIrr: typeof MONTHLY_IRR_NIAMEY, latitude: number) {
  // Facteur d'ajustement selon latitude (plus au nord = plus d'irradiation été, moins hiver)
  const factor = 1 + (latitude - 13.5) * 0.02;
  return baseIrr.map((m) => ({
    ...m,
    irr: parseFloat((m.irr * factor).toFixed(2)),
  }));
}

export function ProductionMensuelleChart({
  pcInstalled,
  rp,
  latitude,
  irrDefavorable,
}: ProductionChartProps) {
  const monthlyData = adjustIrr(MONTHLY_IRR_NIAMEY, latitude).map((m) => ({
    ...m,
    production: Math.round((pcInstalled * m.irr * rp) / 1000), // kWh/j
    productionMensuelle: Math.round((pcInstalled * m.irr * rp * 30) / 1000), // kWh/mois
  }));

  const maxProd = Math.max(...monthlyData.map((m) => m.productionMensuelle));

  return (
    <div>
      <p className="text-xs text-earth-400 mb-3">
        Production mensuelle estimée = Pcinstallé × Irradiation × Rp × 30 jours
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={monthlyData}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#78716c" }} />
          <YAxis tick={{ fontSize: 11, fill: "#78716c" }} unit=" kWh" />
          <Tooltip
            formatter={(v: number) => [
              `${v.toLocaleString("fr-FR")} kWh`,
              "Production",
            ]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e7e5e4",
              fontSize: "12px",
            }}
          />
          <ReferenceLine
            y={Math.round((pcInstalled * irrDefavorable * rp * 30) / 1000)}
            stroke="#ef4444"
            strokeDasharray="4 3"
            label={{
              value: "Mois déf.",
              position: "insideTopRight",
              fontSize: 10,
              fill: "#ef4444",
            }}
          />
          <Bar
            dataKey="productionMensuelle"
            name="Production"
            radius={[4, 4, 0, 0]}
          >
            {monthlyData.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  entry.productionMensuelle === maxProd
                    ? "#D97706"
                    : entry.irr === irrDefavorable
                      ? "#ef4444"
                      : "#FCD34D"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 justify-center mt-2 text-xs text-earth-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-solar-400 inline-block" /> Mois
          productif
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-400 inline-block" /> Mois
          dimensionnant
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-300 inline-block" /> Mois
          standard
        </span>
      </div>
    </div>
  );
}

// ── Graphique répartition énergétique ──
interface EnergyPieProps {
  dailyEnergy: number;
  nightEnergy: number;
}

export function EnergyPieChart({ dailyEnergy, nightEnergy }: EnergyPieProps) {
  const total = dailyEnergy + nightEnergy;
  const data = [
    {
      name: "Énergie journée (08h–16h)",
      value: dailyEnergy,
      pct: ((dailyEnergy / total) * 100).toFixed(1),
    },
    {
      name: "Énergie nocturne (17h–08h)",
      value: nightEnergy,
      pct: ((nightEnergy / total) * 100).toFixed(1),
    },
  ];
  const COLORS = ["#F59E0B", "#0EA5E9"];

  return (
    <div>
      <p className="text-xs text-earth-400 mb-3">
        Répartition jour/nuit — important pour le dimensionnement du parc
        batterie
      </p>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={72}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number, n: string) => [
                `${v.toLocaleString("fr-FR")} Wh`,
                n,
              ]}
              contentStyle={{ borderRadius: "8px", fontSize: "11px" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-3">
          {data.map((d, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-earth-600 flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ background: COLORS[i] }}
                  />
                  {d.name}
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: COLORS[i] }}
                >
                  {d.pct}%
                </span>
              </div>
              <div className="h-2 bg-earth-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${d.pct}%`, background: COLORS[i] }}
                />
              </div>
              <p className="text-xs text-earth-400 mt-0.5">
                {d.value.toLocaleString("fr-FR")} Wh/jour
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Graphique irradiation annuelle ──
interface IrradiationChartProps {
  irrDefavorable: number;
  latitude: number;
}

export function IrradiationChart({
  irrDefavorable,
  latitude,
}: IrradiationChartProps) {
  const data = adjustIrr(MONTHLY_IRR_NIAMEY, latitude);

  return (
    <div>
      <p className="text-xs text-earth-400 mb-3">
        Courbe d'irradiation annuelle du site — le mois défavorable détermine le
        dimensionnement SAHELIO
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
        >
          <defs>
            <linearGradient id="irrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#78716c" }} />
          <YAxis
            domain={[3, 7.5]}
            tick={{ fontSize: 11, fill: "#78716c" }}
            unit=" kWh/m²"
          />
          <Tooltip
            formatter={(v: number) => [`${v} kWh/m²/j`, "Irradiation"]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e7e5e4",
              fontSize: "12px",
            }}
          />
          <ReferenceLine
            y={irrDefavorable}
            stroke="#ef4444"
            strokeDasharray="5 3"
            label={{
              value: `Dimensionnement : ${irrDefavorable}`,
              position: "insideTopLeft",
              fontSize: 10,
              fill: "#ef4444",
            }}
          />
          <Area
            type="monotone"
            dataKey="irr"
            stroke="#D97706"
            strokeWidth={2.5}
            fill="url(#irrGrad)"
            dot={{ fill: "#D97706", r: 3.5 }}
            name="Irradiation"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Graphique répartition financière ──
interface FinancialChartProps {
  lines: Array<{ label: string; totalXOF: number }>;
}

export function FinancialPieChart({ lines }: FinancialChartProps) {
  const total = lines.reduce((s, l) => s + l.totalXOF, 0);
  const COLORS = [
    "#D97706",
    "#0EA5E9",
    "#22C55E",
    "#6366F1",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#14B8A6",
  ];

  const data = lines
    .filter((l) => l.totalXOF > 0)
    .sort((a, b) => b.totalXOF - a.totalXOF);

  return (
    <div>
      <p className="text-xs text-earth-400 mb-3">
        Répartition du coût par poste
      </p>
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={82}
              dataKey="totalXOF"
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number, n: string) => [
                `${v.toLocaleString("fr-FR")} FCFA`,
                n,
              ]}
              contentStyle={{ borderRadius: "8px", fontSize: "11px" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-1.5">
          {data.map((d, i) => (
            <div key={d.label} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="text-xs text-earth-600 flex-1 truncate">
                {d.label}
              </span>
              <span className="text-xs font-semibold text-earth-700 flex-shrink-0">
                {((d.totalXOF / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Jauge de couverture autonomie ──
interface AutonomyGaugeProps {
  nightEnergyWh: number;
  batteryCapacityWh: number;
  autonomyDays: number;
}

export function AutonomyGauge({
  nightEnergyWh,
  batteryCapacityWh,
  autonomyDays,
}: AutonomyGaugeProps) {
  const coveragePct = Math.min(100, (batteryCapacityWh / nightEnergyWh) * 100);
  const isOk = coveragePct >= 100;

  return (
    <div className="space-y-3">
      <p className="text-xs text-earth-400">
        Capacité batterie vs besoins nocturnes × {autonomyDays} jour(s)
      </p>
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-earth-500">Couverture nocturne</span>
            <span
              className={`font-bold ${isOk ? "text-green-600" : "text-red-500"}`}
            >
              {coveragePct.toFixed(1)}% {isOk ? "✓" : "⚠"}
            </span>
          </div>
          <div className="h-4 bg-earth-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isOk ? "bg-green-500" : "bg-red-400"}`}
              style={{ width: `${Math.min(coveragePct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1 text-earth-400">
            <span>Besoin : {nightEnergyWh.toLocaleString("fr-FR")} Wh</span>
            <span>
              Stockage : {batteryCapacityWh.toLocaleString("fr-FR")} Wh
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
