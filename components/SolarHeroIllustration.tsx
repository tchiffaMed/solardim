"use client";

import { useEffect, useRef } from "react";

export default function SolarHeroIllustration() {
  const svgRef = useRef<SVGSVGElement>(null);

  // Animation subtile des particules de lumière
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    let t = 0;
    let rafId: number;

    const rays = svg.querySelectorAll<SVGElement>(".sun-ray");
    const particles = svg.querySelectorAll<SVGElement>(".particle");
    const glow = svg.querySelector<SVGElement>(".sun-glow");

    function animate() {
      t += 0.012;
      // Rotation lente des rayons du soleil
      rays.forEach((ray, i) => {
        ray.setAttribute("transform", `rotate(${t * 18 + i * 45}, 310, 88)`);
      });
      // Pulsation du halo solaire
      if (glow) {
        const scale = 1 + Math.sin(t * 1.5) * 0.06;
        glow.setAttribute(
          "transform",
          `translate(310, 88) scale(${scale}) translate(-310, -88)`,
        );
      }
      // Flottement des particules
      particles.forEach((p, i) => {
        const baseY = parseFloat(p.getAttribute("data-y") || "0");
        const baseX = parseFloat(p.getAttribute("data-x") || "0");
        const amp = 4 + i * 1.5;
        const freq = 0.8 + i * 0.3;
        p.setAttribute("cy", String(baseY + Math.sin(t * freq + i) * amp));
        p.setAttribute(
          "cx",
          String(baseX + Math.cos(t * freq * 0.7 + i) * amp * 0.6),
        );
        p.setAttribute("opacity", String(0.4 + Math.sin(t + i) * 0.35));
      });

      rafId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      className="relative w-full select-none"
      style={{ aspectRatio: "16/9", maxHeight: 520 }}
    >
      {/* Halo de fondu extérieur */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 45%, rgba(250,248,244,0.85) 70%, rgba(250,248,244,1) 100%)",
        }}
      />
      {/* Fondu bords gauche/droite plus fort */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(250,248,244,0.95) 0%, transparent 12%, transparent 88%, rgba(250,248,244,0.95) 100%)",
        }}
      />
      {/* Fondu bas */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(180deg, transparent 60%, rgba(250,248,244,0.7) 80%, rgba(250,248,244,1) 100%)",
        }}
      />

      {/* SVG principal */}
      <svg
        ref={svgRef}
        viewBox="0 0 620 348"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 8px 32px rgba(217,119,6,0.10))" }}
      >
        <defs>
          {/* Ciel */}
          <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0c4a6e" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#0369a1" stopOpacity="0.8" />
            <stop offset="75%" stopColor="#F59E0B" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FCD34D" stopOpacity="0.5" />
          </linearGradient>
          {/* Sol */}
          <linearGradient id="ground" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d4b896" />
            <stop offset="100%" stopColor="#b89070" />
          </linearGradient>
          {/* Panneau face */}
          <linearGradient id="panelFace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a2e5e" />
            <stop offset="50%" stopColor="#0f1f3a" />
            <stop offset="100%" stopColor="#162344" />
          </linearGradient>
          {/* Panneau reflet */}
          <linearGradient id="panelShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.15" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          {/* Métal structure */}
          <linearGradient id="metal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          {/* Onduleur */}
          <linearGradient id="box" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          {/* Soleil halo */}
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#D97706" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </radialGradient>
          {/* Ombre */}
          <linearGradient id="shadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1C1917" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1C1917" stopOpacity="0" />
          </linearGradient>
          {/* Câble gradient */}
          <linearGradient id="wire" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#6b7280" />
          </linearGradient>

          {/* Filtre flou léger pour effet profondeur */}
          <filter id="blur-sm">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <filter id="blur-md">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
          <filter id="glow-f">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Ciel ── */}
        <rect width="620" height="200" fill="url(#sky)" />

        {/* Nuages légers */}
        <ellipse
          cx="120"
          cy="55"
          rx="60"
          ry="18"
          fill="white"
          opacity="0.06"
          filter="url(#blur-sm)"
        />
        <ellipse
          cx="490"
          cy="40"
          rx="50"
          ry="14"
          fill="white"
          opacity="0.08"
          filter="url(#blur-sm)"
        />
        <ellipse
          cx="350"
          cy="70"
          rx="35"
          ry="10"
          fill="white"
          opacity="0.05"
          filter="url(#blur-sm)"
        />

        {/* ── Soleil ── */}
        <circle
          className="sun-glow"
          cx="310"
          cy="88"
          r="52"
          fill="url(#sunGlow)"
          filter="url(#blur-md)"
        />
        <circle
          cx="310"
          cy="88"
          r="22"
          fill="#FDE68A"
          filter="url(#glow-f)"
          opacity="0.95"
        />
        <circle cx="310" cy="88" r="18" fill="#FBBF24" />
        <circle cx="310" cy="88" r="14" fill="#FDE68A" />

        {/* Rayons du soleil */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const r1 = 24,
            r2 = 38;
          const rad = (angle * Math.PI) / 180;
          return (
            <line
              key={i}
              className="sun-ray"
              x1={310 + Math.cos(rad) * r1}
              y1={88 + Math.sin(rad) * r1}
              x2={310 + Math.cos(rad) * r2}
              y2={88 + Math.sin(rad) * r2}
              stroke="#FBBF24"
              strokeWidth={i % 2 === 0 ? "2.5" : "1.5"}
              strokeLinecap="round"
              opacity={i % 2 === 0 ? "0.9" : "0.6"}
            />
          );
        })}

        {/* ── Sol / Terrain ── */}
        <rect x="0" y="195" width="620" height="153" fill="url(#ground)" />
        {/* Texture sol - lignes perspective */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={i}
            x1={310 + (i - 2.5) * 80}
            y1="195"
            x2={310 + (i - 2.5) * 280}
            y2="348"
            stroke="#c4a882"
            strokeWidth="0.5"
            opacity="0.4"
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1="0"
            y1={210 + i * 35}
            x2="620"
            y2={210 + i * 35}
            stroke="#c4a882"
            strokeWidth="0.4"
            opacity="0.3"
          />
        ))}

        {/* Horizon flou */}
        <rect
          x="0"
          y="188"
          width="620"
          height="16"
          fill="#e8d4b4"
          opacity="0.7"
          filter="url(#blur-sm)"
        />

        {/* ══ PANNEAUX ARRIÈRE-PLAN (flous, perspective) ══ */}
        {/* Rangée très lointaine - très flou */}
        {[60, 130, 200, 270, 340, 410, 480, 550].map((x, i) => (
          <g key={i} filter="url(#blur-md)" opacity="0.45">
            <rect
              x={x - 18}
              y="176"
              width="36"
              height="20"
              rx="1"
              fill="url(#panelFace)"
            />
            <rect
              x={x - 18}
              y="176"
              width="36"
              height="20"
              rx="1"
              fill="url(#panelShine)"
            />
            <line
              x1={x - 10}
              y1="196"
              x2={x - 14}
              y2="202"
              stroke="#64748b"
              strokeWidth="1.2"
            />
            <line
              x1={x + 10}
              y1="196"
              x2={x + 14}
              y2="202"
              stroke="#64748b"
              strokeWidth="1.2"
            />
          </g>
        ))}

        {/* Rangée intermédiaire - léger flou */}
        {[80, 185, 290, 395, 500].map((x, i) => (
          <g key={i} filter="url(#blur-sm)" opacity="0.65">
            <rect
              x={x - 28}
              y="200"
              width="55"
              height="32"
              rx="1.5"
              fill="url(#panelFace)"
            />
            {/* Cellules */}
            {[0, 1, 2].map((c) =>
              [0, 1].map((r) => (
                <rect
                  key={`${c}-${r}`}
                  x={x - 26 + c * 18}
                  y={202 + r * 14}
                  width="15"
                  height="11"
                  rx="1"
                  fill="#263870"
                  stroke="#334d8a"
                  strokeWidth="0.5"
                />
              )),
            )}
            <rect
              x={x - 28}
              y="200"
              width="55"
              height="32"
              rx="1.5"
              fill="url(#panelShine)"
            />
            {/* Structure */}
            <rect
              x={x - 30}
              y="230"
              width="59"
              height="2.5"
              rx="1"
              fill="url(#metal)"
              opacity="0.8"
            />
            <line
              x1={x - 15}
              y1="232"
              x2={x - 18}
              y2="242"
              stroke="#94a3b8"
              strokeWidth="2"
            />
            <line
              x1={x + 15}
              y1="232"
              x2={x + 18}
              y2="242"
              stroke="#94a3b8"
              strokeWidth="2"
            />
            {/* Ombre au sol */}
            <ellipse
              cx={x}
              cy="245"
              rx="28"
              ry="4"
              fill="url(#shadow)"
              opacity="0.4"
            />
          </g>
        ))}

        {/* ══ PANNEAUX PREMIER PLAN (nets, détaillés) ══ */}

        {/* Panneau principal gauche */}
        <g>
          {/* Ombre portée */}
          <ellipse
            cx="155"
            cy="312"
            rx="62"
            ry="9"
            fill="url(#shadow)"
            opacity="0.5"
          />
          {/* Structure support */}
          <rect
            x="108"
            y="268"
            width="95"
            height="4"
            rx="2"
            fill="url(#metal)"
          />
          <rect
            x="123"
            y="260"
            width="3"
            height="52"
            rx="1.5"
            fill="url(#metal)"
          />
          <rect
            x="188"
            y="260"
            width="3"
            height="52"
            rx="1.5"
            fill="url(#metal)"
          />
          {/* Pieds ancrés */}
          <rect x="119" y="309" width="12" height="5" rx="1" fill="#475569" />
          <rect x="184" y="309" width="12" height="5" rx="1" fill="#475569" />
          <rect
            x="116"
            y="312"
            width="18"
            height="3"
            rx="1"
            fill="#334155"
            opacity="0.6"
          />
          <rect
            x="181"
            y="312"
            width="18"
            height="3"
            rx="1"
            fill="#334155"
            opacity="0.6"
          />
          {/* Panneau */}
          <rect
            x="100"
            y="222"
            width="112"
            height="50"
            rx="3"
            fill="url(#panelFace)"
          />
          {/* Frame aluminium */}
          <rect
            x="100"
            y="222"
            width="112"
            height="50"
            rx="3"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          {/* Cellules 4x2 */}
          {[0, 1, 2, 3].map((c) =>
            [0, 1].map((r) => (
              <rect
                key={`${c}-${r}`}
                x={104 + c * 27}
                y={225 + r * 22}
                width="24"
                height="19"
                rx="1.5"
                fill="#1e3a5f"
                stroke="#263d7a"
                strokeWidth="0.7"
              />
            )),
          )}
          {/* Lignes de bus entre cellules */}
          {[104, 131, 158, 185].map((x, i) => (
            <line
              key={i}
              x1={x + 12}
              y1="225"
              x2={x + 12}
              y2="271"
              stroke="#334d8a"
              strokeWidth="0.4"
              opacity="0.8"
            />
          ))}
          <line
            x1="104"
            y1="247"
            x2="216"
            y2="247"
            stroke="#334d8a"
            strokeWidth="0.4"
            opacity="0.8"
          />
          {/* Reflet lumineux */}
          <polygon
            points="103,225 145,225 103,250"
            fill="white"
            opacity="0.08"
          />
          <rect
            x="100"
            y="222"
            width="112"
            height="50"
            rx="3"
            fill="url(#panelShine)"
          />
          {/* Boîte de connexion */}
          <rect x="148" y="265" width="16" height="8" rx="1.5" fill="#1e293b" />
          <circle cx="153" cy="269" r="1.5" fill="#22c55e" />
          <circle cx="160" cy="269" r="1.5" fill="#ef4444" />
        </g>

        {/* Panneau principal central */}
        <g>
          <ellipse
            cx="310"
            cy="318"
            rx="70"
            ry="10"
            fill="url(#shadow)"
            opacity="0.6"
          />
          {/* Structure */}
          <rect
            x="258"
            y="272"
            width="105"
            height="4.5"
            rx="2"
            fill="url(#metal)"
          />
          <rect
            x="268"
            y="262"
            width="3.5"
            height="56"
            rx="1.5"
            fill="url(#metal)"
          />
          <rect
            x="350"
            y="262"
            width="3.5"
            height="56"
            rx="1.5"
            fill="url(#metal)"
          />
          {/* Croix de renfort */}
          <line
            x1="268"
            y1="290"
            x2="354"
            y2="290"
            stroke="#94a3b8"
            strokeWidth="1.5"
            opacity="0.7"
          />
          {/* Pieds */}
          <rect x="264" y="314" width="14" height="6" rx="1" fill="#475569" />
          <rect x="344" y="314" width="14" height="6" rx="1" fill="#475569" />
          <rect
            x="260"
            y="318"
            width="22"
            height="3"
            rx="1"
            fill="#334155"
            opacity="0.6"
          />
          <rect
            x="340"
            y="318"
            width="22"
            height="3"
            rx="1"
            fill="#334155"
            opacity="0.6"
          />
          {/* Panneau */}
          <rect
            x="248"
            y="218"
            width="124"
            height="57"
            rx="3.5"
            fill="url(#panelFace)"
          />
          <rect
            x="248"
            y="218"
            width="124"
            height="57"
            rx="3.5"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2.5"
          />
          {/* Cellules 4x2 */}
          {[0, 1, 2, 3].map((c) =>
            [0, 1].map((r) => (
              <rect
                key={`${c}-${r}`}
                x={252 + c * 30}
                y={221 + r * 25}
                width="27"
                height="22"
                rx="2"
                fill="#1a2e5e"
                stroke="#263d7a"
                strokeWidth="0.8"
              />
            )),
          )}
          {/* Grille cellule détaillée */}
          {[0, 1, 2, 3].map((c) =>
            [0, 1].map((r) => (
              <g key={`g${c}-${r}`}>
                <line
                  x1={252 + c * 30 + 9}
                  y1={221 + r * 25}
                  x2={252 + c * 30 + 9}
                  y2={221 + r * 25 + 22}
                  stroke="#2d4a7a"
                  strokeWidth="0.4"
                />
                <line
                  x1={252 + c * 30 + 18}
                  y1={221 + r * 25}
                  x2={252 + c * 30 + 18}
                  y2={221 + r * 25 + 22}
                  stroke="#2d4a7a"
                  strokeWidth="0.4"
                />
                <line
                  x1={252 + c * 30}
                  y1={221 + r * 25 + 11}
                  x2={252 + c * 30 + 27}
                  y2={221 + r * 25 + 11}
                  stroke="#2d4a7a"
                  strokeWidth="0.4"
                />
              </g>
            )),
          )}
          {/* Reflets */}
          <polygon
            points="251,221 295,221 251,248"
            fill="white"
            opacity="0.09"
          />
          <rect
            x="248"
            y="218"
            width="124"
            height="57"
            rx="3.5"
            fill="url(#panelShine)"
          />
          {/* Jonction */}
          <rect x="296" y="268" width="18" height="9" rx="2" fill="#1e293b" />
          <circle cx="302" cy="273" r="2" fill="#22c55e" />
          <circle cx="309" cy="273" r="2" fill="#3b82f6" />
          <circle cx="307" cy="273" r="1" fill="#ef4444" opacity="0.6" />
        </g>

        {/* Panneau principal droit */}
        <g>
          <ellipse
            cx="463"
            cy="312"
            rx="62"
            ry="9"
            fill="url(#shadow)"
            opacity="0.5"
          />
          <rect
            x="414"
            y="268"
            width="98"
            height="4"
            rx="2"
            fill="url(#metal)"
          />
          <rect
            x="428"
            y="260"
            width="3"
            height="52"
            rx="1.5"
            fill="url(#metal)"
          />
          <rect
            x="492"
            y="260"
            width="3"
            height="52"
            rx="1.5"
            fill="url(#metal)"
          />
          <rect x="424" y="309" width="12" height="5" rx="1" fill="#475569" />
          <rect x="488" y="309" width="12" height="5" rx="1" fill="#475569" />
          <rect
            x="420"
            y="312"
            width="18"
            height="3"
            rx="1"
            fill="#334155"
            opacity="0.6"
          />
          <rect
            x="486"
            y="312"
            width="18"
            height="3"
            rx="1"
            fill="#334155"
            opacity="0.6"
          />
          <rect
            x="408"
            y="222"
            width="112"
            height="50"
            rx="3"
            fill="url(#panelFace)"
          />
          <rect
            x="408"
            y="222"
            width="112"
            height="50"
            rx="3"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          {[0, 1, 2, 3].map((c) =>
            [0, 1].map((r) => (
              <rect
                key={`${c}-${r}`}
                x={412 + c * 27}
                y={225 + r * 22}
                width="24"
                height="19"
                rx="1.5"
                fill="#1e3a5f"
                stroke="#263d7a"
                strokeWidth="0.7"
              />
            )),
          )}
          <polygon
            points="411,225 453,225 411,250"
            fill="white"
            opacity="0.08"
          />
          <rect
            x="408"
            y="222"
            width="112"
            height="50"
            rx="3"
            fill="url(#panelShine)"
          />
          <rect x="456" y="265" width="16" height="8" rx="1.5" fill="#1e293b" />
          <circle cx="461" cy="269" r="1.5" fill="#22c55e" />
          <circle cx="468" cy="269" r="1.5" fill="#ef4444" />
        </g>

        {/* ══ CÂBLES ══ */}
        {/* Câbles DC entre panneaux et onduleur */}
        <path
          d="M 163 268 Q 163 300 200 305 Q 240 310 270 310"
          fill="none"
          stroke="url(#wire)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 310 272 Q 310 295 310 310"
          fill="none"
          stroke="url(#wire)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 458 268 Q 458 300 420 305 Q 380 310 350 310"
          fill="none"
          stroke="url(#wire)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 270 310 L 310 310 L 350 310"
          fill="none"
          stroke="#374151"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* ══ ONDULEUR / BOÎTIER TECHNIQUE ══ */}
        <g>
          <rect
            x="285"
            y="310"
            width="50"
            height="32"
            rx="5"
            fill="url(#box)"
          />
          <rect
            x="285"
            y="310"
            width="50"
            height="32"
            rx="5"
            fill="none"
            stroke="#475569"
            strokeWidth="1.5"
          />
          {/* Grille ventilation */}
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1="289"
              y1={316 + i * 5}
              x2="303"
              y2={316 + i * 5}
              stroke="#334155"
              strokeWidth="1"
              opacity="0.6"
            />
          ))}
          {/* Écran */}
          <rect x="309" y="315" width="20" height="12" rx="2" fill="#0f172a" />
          <rect
            x="311"
            y="317"
            width="16"
            height="8"
            rx="1"
            fill="#1e3a5f"
            opacity="0.8"
          />
          {/* LED */}
          <circle
            cx="312"
            cy="330"
            r="2"
            fill="#22c55e"
            filter="url(#glow-f)"
          />
          <circle
            cx="320"
            cy="330"
            r="2"
            fill="#3b82f6"
            filter="url(#glow-f)"
          />
          <circle
            cx="328"
            cy="330"
            r="2"
            fill="#F59E0B"
            filter="url(#glow-f)"
          />
          {/* Label */}
          <rect
            x="286"
            y="311"
            width="30"
            height="7"
            rx="1"
            fill="#0f172a"
            opacity="0.6"
          />
          <text
            x="301"
            y="317"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="4"
            fontFamily="monospace"
          >
            MPPT
          </text>
        </g>

        {/* ══ PARTICULES DE LUMIÈRE ══ */}
        {[
          { x: 180, y: 160, r: 3 },
          { x: 310, y: 140, r: 4 },
          { x: 440, y: 155, r: 3 },
          { x: 250, y: 175, r: 2.5 },
          { x: 380, y: 168, r: 2 },
          { x: 130, y: 180, r: 2 },
          { x: 500, y: 172, r: 2.5 },
        ].map((p, i) => (
          <circle
            key={i}
            className="particle"
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill="#FDE68A"
            data-x={p.x}
            data-y={p.y}
            opacity="0.6"
            filter="url(#glow-f)"
          />
        ))}

        {/* ══ ANNOTATIONS TECHNIQUES (style dessin industriel) ══ */}
        {/* Cote inclinaison */}
        <g opacity="0.55">
          <line
            x1="222"
            y1="218"
            x2="222"
            y2="272"
            stroke="#D97706"
            strokeWidth="0.8"
            strokeDasharray="2,2"
          />
          <line
            x1="222"
            y1="245"
            x2="248"
            y2="218"
            stroke="#D97706"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          <path
            d="M 222 235 A 10 10 0 0 1 232 225"
            fill="none"
            stroke="#D97706"
            strokeWidth="0.8"
          />
          <text
            x="230"
            y="237"
            fill="#D97706"
            fontSize="7.5"
            fontFamily="monospace"
            fontWeight="bold"
          >
            ~15°
          </text>
        </g>

        {/* Label "Plein Sud" */}
        <g opacity="0.5">
          <line
            x1="310"
            y1="205"
            x2="310"
            y2="195"
            stroke="#94a3b8"
            strokeWidth="0.8"
            markerEnd="url(#arr)"
          />
          <text
            x="310"
            y="192"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="7"
            fontFamily="monospace"
          >
            PLEIN SUD ↓
          </text>
        </g>

        {/* Étiquettes équipements */}
        <g opacity="0.6">
          <rect x="84" y="209" width="32" height="10" rx="2" fill="#1e293b" />
          <text
            x="100"
            y="216"
            textAnchor="middle"
            fill="#60a5fa"
            fontSize="5.5"
            fontFamily="monospace"
          >
            720Wc
          </text>
        </g>
        <g opacity="0.6">
          <rect x="232" y="205" width="34" height="10" rx="2" fill="#1e293b" />
          <text
            x="249"
            y="212"
            textAnchor="middle"
            fill="#60a5fa"
            fontSize="5.5"
            fontFamily="monospace"
          >
            720Wc
          </text>
        </g>
        <g opacity="0.6">
          <rect x="392" y="209" width="32" height="10" rx="2" fill="#1e293b" />
          <text
            x="408"
            y="216"
            textAnchor="middle"
            fill="#60a5fa"
            fontSize="5.5"
            fontFamily="monospace"
          >
            720Wc
          </text>
        </g>

        {/* Label onduleur */}
        <g opacity="0.65">
          <line
            x1="310"
            y1="342"
            x2="360"
            y2="348"
            stroke="#94a3b8"
            strokeWidth="0.7"
          />
          <text
            x="362"
            y="348"
            fill="#94a3b8"
            fontSize="6.5"
            fontFamily="monospace"
          >
            ONDULEUR HYBRIDE
          </text>
        </g>

        {/* Titre flottant coin bas gauche style blueprint */}
        <g opacity="0.35">
          <rect
            x="8"
            y="320"
            width="95"
            height="22"
            rx="2"
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="0.8"
          />
          <text
            x="12"
            y="330"
            fill="#60a5fa"
            fontSize="5.5"
            fontFamily="monospace"
          >
            INSTALLATION PV
          </text>
          <text
            x="12"
            y="338"
            fill="#94a3b8"
            fontSize="4.5"
            fontFamily="monospace"
          >
            METHODE SAHELIO
          </text>
        </g>
      </svg>
    </div>
  );
}
