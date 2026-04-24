"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  Sun,
  Zap,
  MapPin,
  BarChart3,
  FileText,
  Shield,
  Wifi,
} from "lucide-react";
import { useSolarStore } from "@/lib/store";
import dynamic from "next/dynamic";

const SolarHeroIllustration = dynamic(
  () => import("@/components/SolarHeroIllustration"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-video bg-gradient-to-br from-earth-900 via-sky-900 to-solar-800 rounded-3xl animate-pulse-slow" />
    ),
  },
);

const PWAInstallBanner = dynamic(
  () => import("@/components/PWAInstallBanner"),
  { ssr: false },
);

export default function HomePage() {
  const router = useRouter();
  const { setProjectInfo, resetProject } = useSolarStore();
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");

  function startProject() {
    setProjectInfo(projectName || "Nouvelle installation PV", clientName);
    router.push("/wizard");
  }

  function resumeProject() {
    router.push("/wizard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sahara-50 via-white to-sky-50 overflow-x-hidden">
      {/* ── PWA Banner ── */}
      <PWAInstallBanner />

      {/* ── Header ── */}
      <header className="border-b border-earth-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-solar-gradient rounded-xl flex items-center justify-center shadow-sm">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display text-lg text-earth-900">
                SolarDim
              </span>
              <span className="text-solar-600 font-display text-lg">
                {" "}
                Niger
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline badge bg-solar-100 text-solar-800 text-xs px-3 py-1 rounded-full font-medium">
              Méthode SAHELIO
            </span>
            <button
              onClick={resumeProject}
              className="text-sm text-earth-500 hover:text-earth-700 font-medium transition-colors flex items-center gap-1"
            >
              Reprendre <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════
          HERO SECTION — Illustration 3D + Formulaire
      ══════════════════════════════════════════════════ */}
      <section className="relative max-w-6xl mx-auto px-6 pt-10 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* LEFT — Texte + Formulaire */}
          <div className="animate-fade-in order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-solar-50 border border-solar-200 rounded-full px-4 py-1.5 mb-5">
              <div className="w-2 h-2 bg-solar-400 rounded-full animate-pulse-slow" />
              <span className="text-xs font-medium text-solar-700">
                Dimensionnement PV conforme SAHELIO
              </span>
            </div>

            <h1 className="font-display text-4xl lg:text-5xl text-earth-900 leading-tight mb-4">
              Dimensionnez votre
              <span className="text-solar-600"> installation solaire</span> au
              Niger
            </h1>

            <p className="text-earth-500 text-base leading-relaxed mb-6 max-w-md">
              Outil professionnel complet — bilan énergétique, calculs SAHELIO,
              carte interactive, simulation 3D et rapport PDF téléchargeable.
              Toutes vos données restent sur votre appareil.
            </p>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-7">
              {[
                {
                  icon: Zap,
                  label: "Calculs  SAHELIO précis",
                  desc: "Formules Module 4",
                },
                {
                  icon: MapPin,
                  label: "Carte Niger",
                  desc: "14 stations météo",
                },
                {
                  icon: BarChart3,
                  label: "Dimensionnement complet",
                  desc: "PV, batteries, câbles",
                },
                {
                  icon: FileText,
                  label: "Rapport PDF",
                  desc: "Offre technico-financière",
                },
                {
                  icon: Shield,
                  label: "100% local",
                  desc: "Aucune donnée envoyée",
                },
                { icon: Wifi, label: "Hors-ligne", desc: "Installable en app" },
              ].map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="flex items-start gap-2.5 p-3 bg-white rounded-xl border border-earth-100 hover:border-solar-200 hover:shadow-sm transition-all"
                >
                  <div className="w-7 h-7 bg-solar-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-solar-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-earth-800">
                      {label}
                    </p>
                    <p className="text-[10px] text-earth-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Formulaire démarrage */}
            <div className="bg-white rounded-2xl border border-earth-200 shadow-lg p-6">
              <h2 className="font-display text-xl text-earth-900 mb-4">
                Démarrer un projet
              </h2>
              <div className="space-y-3 mb-5">
                <div>
                  <label className="field-label">Nom du projet</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="ex : Installation solaire — Usine Composants Elecronique UCE"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && startProject()}
                  />
                </div>
                <div>
                  <label className="field-label">Client / Bénéficiaire</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Nom du client ou de l'organisation"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && startProject()}
                  />
                </div>
              </div>
              <button
                onClick={startProject}
                className="w-full bg-solar-gradient text-white rounded-xl py-3.5 font-semibold
                           flex items-center justify-center gap-2 hover:opacity-90 transition-opacity
                           shadow-md hover:shadow-lg"
              >
                Commencer le dimensionnement
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mt-4">
                <div className="flex-1 h-px bg-earth-100" />
                <span className="text-xs text-earth-300">ou</span>
                <div className="flex-1 h-px bg-earth-100" />
              </div>
              <button
                onClick={resumeProject}
                className="w-full mt-3 text-sm text-earth-500 hover:text-earth-700 py-2.5 rounded-xl
                           hover:bg-earth-50 transition-all flex items-center justify-center gap-1.5 font-medium"
              >
                Reprendre le projet sauvegardé
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* RIGHT — Illustration 3D */}
          <div className="order-1 lg:order-2 animate-slide-up">
            {/* Badge flottant au-dessus */}
            <div className="flex items-center justify-center mb-3">
              <div
                className="inline-flex items-center gap-2 bg-earth-900/80 backdrop-blur-sm
                              text-white rounded-full px-4 py-1.5 text-xs font-medium shadow-lg"
              >
                <div className="w-1.5 h-1.5 bg-solar-400 rounded-full animate-pulse" />
                Simulation 3D · Installation PV au Niger
              </div>
            </div>

            {/* Conteneur illustration avec effet flottant */}
            <div
              className="relative"
              style={{
                animation: "floatY 5s ease-in-out infinite",
              }}
            >
              <style>{`
                @keyframes floatY {
                  0%, 100% { transform: translateY(0px); }
                  50%       { transform: translateY(-10px); }
                }
              `}</style>

              {/* Halo de lumière derrière */}
              <div
                className="absolute inset-0 -z-10 rounded-3xl blur-3xl opacity-30"
                style={{
                  background:
                    "radial-gradient(ellipse at center, #F59E0B 0%, #D97706 40%, transparent 70%)",
                }}
              />

              {/* Illustration SVG animée */}
              <SolarHeroIllustration />

              {/* Stats flottantes — badge en bas gauche */}
              <div className="absolute bottom-8 left-6 z-20 flex flex-col gap-2">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-earth-100">
                  <p className="text-[10px] text-earth-400 font-medium">
                    Irradiation Niger
                  </p>
                  <p className="text-sm font-bold text-solar-600">
                    4,2 – 6,4 kWh/m²/j
                  </p>
                </div>
                <div className="bg-earth-900/85 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md">
                  <p className="text-[10px] text-earth-400 font-medium">
                    SAHELIO — Méthode Pcmin
                  </p>
                  <p className="text-xs font-mono text-solar-400">
                    Rp = 0,65 · Irr_défav.
                  </p>
                </div>
              </div>

              {/* Indicateur coins haut-droit */}
              <div className="absolute top-4 right-6 z-20">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-md border border-earth-100">
                  <p className="text-[10px] text-earth-500 font-mono">
                    14 stations météo Niger
                  </p>
                </div>
              </div>
            </div>

            {/* Note sous l'illustration */}
            <p className="text-center text-[10px] text-earth-300 mt-3">
              Illustration indicative · Simulation basée sur la méthode SAHELIO
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          ÉTAPES
      ══════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl text-earth-800">
            6 étapes vers un dimensionnement complet
          </h2>
          <p className="text-earth-400 text-sm mt-2">
            Du bilan énergétique au rapport PDF professionnel
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              n: "01",
              title: "Bilan énergétique",
              desc: "Charges, puissances, durées jour/nuit",
              color: "bg-solar-50 border-solar-200",
            },
            {
              n: "02",
              title: "Localisation",
              desc: "Carte Niger, irradiation mois défavorable",
              color: "bg-sky-50 border-sky-200",
            },
            {
              n: "03",
              title: "Équipements",
              desc: "Catalogue + ajout personnalisé",
              color: "bg-green-50 border-green-200",
            },
            {
              n: "04",
              title: "Calculs  SAHELIO",
              desc: "Pcmin, batteries Ah, câbles",
              color: "bg-purple-50 border-purple-200",
            },
            {
              n: "05",
              title: "Simulation 3D",
              desc: "Animation panneaux + schéma SVG",
              color: "bg-orange-50 border-orange-200",
            },
            {
              n: "06",
              title: "Rapport PDF",
              desc: "Offre financière + export",
              color: "bg-red-50 border-red-200",
            },
          ].map((step, i) => (
            <div
              key={step.n}
              className={`relative rounded-2xl border p-4 ${step.color} hover:shadow-sm transition-all cursor-pointer`}
              onClick={startProject}
            >
              <div className="text-2xl font-display text-earth-200 mb-2">
                {step.n}
              </div>
              <h3 className="text-xs font-semibold text-earth-800 mb-1 leading-tight">
                {step.title}
              </h3>
              <p className="text-[10px] text-earth-400 leading-relaxed">
                {step.desc}
              </p>
              {i < 5 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                  <ChevronRight className="w-3.5 h-3.5 text-earth-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          MÉTHODE  SAHELIO — Rappel technique
      ══════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="bg-earth-900 rounded-3xl p-8 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-solar-500/20 border border-solar-400/30 rounded-full px-3 py-1 mb-4">
                <span className="text-xs font-semibold text-solar-400">
                  Méthode SAHELIO
                </span>
              </div>
              <h2 className="font-display text-2xl mb-3">
                Formules conformes au{" "}
                <span className="text-solar-400">Module 4 SAHELIO</span>
              </h2>
              <p className="text-earth-400 text-sm leading-relaxed">
                Institut de la Francophonie pour le Développement Durable.
                Toutes les formules de dimensionnement sont implémentées
                fidèlement, adaptées au contexte Niger (Rp = 0,65 milieu
                poussiéreux).
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Puissance crête",
                  formula: "Pcmin = Et / (Rp × Irr)",
                  color: "text-solar-400",
                },
                {
                  label: "Parc batterie",
                  formula: "Cp = En×Nj / (Us×DoD×Rb)",
                  color: "text-sky-400",
                },
                {
                  label: "MPPT — 3 conditions",
                  formula: "Pmrc, Vmrc, Imrc ≥ 1,25×…",
                  color: "text-green-400",
                },
                {
                  label: "Section câble",
                  formula: "S = 2LIe·ρ / ΔU",
                  color: "text-purple-400",
                },
              ].map(({ label, formula, color }) => (
                <div
                  key={label}
                  className="bg-earth-800/60 rounded-xl p-3 border border-earth-700"
                >
                  <p className="text-[10px] text-earth-400 mb-1">{label}</p>
                  <p className={`text-xs font-mono font-semibold ${color}`}>
                    {formula}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-earth-100 bg-white py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-solar-gradient rounded-md flex items-center justify-center">
              <Sun className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-earth-700">
              SolarDim Niger
            </span>
          </div>
          <p className="text-xs text-earth-300 text-center">
            Outil de dimensionnement PV · Méthode SAHELIO · Données 100% locales
            · Aucune base de données utilisateur
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-earth-300">v4.0</span>
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            <span className="text-xs text-green-600 font-medium">En ligne</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
