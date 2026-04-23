"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Sun,
  Zap,
  MapPin,
  BarChart3,
  FileText,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { useSolarStore } from "@/lib/store";

export default function HomePage() {
  const router = useRouter();
  const { setProjectInfo, resetProject } = useSolarStore();
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");

  function startProject() {
    setProjectInfo(projectName || "Nouvelle installation PV", clientName);
    router.push("/wizard");
  }

  function newProject() {
    resetProject();
    router.push("/wizard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sahara-50 via-white to-sky-50">
      {/* Header */}
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
          <div className="flex items-center gap-2">
            <span className="badge bg-solar-100 text-solar-800 text-xs px-3 py-1 rounded-full font-medium">
              Méthode SAHELIO
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-solar-50 border border-solar-200 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 bg-solar-400 rounded-full animate-pulse-slow" />
              <span className="text-xs font-medium text-solar-700">
                Dimensionnement conforme SAHELIO — Module 4
              </span>
            </div>

            <h1 className="font-display text-5xl lg:text-6xl text-earth-900 leading-tight mb-6">
              Dimensionnez votre
              <span className="text-solar-600"> installation solaire</span>
              <br />
              au Niger
            </h1>

            <p className="text-earth-500 text-lg leading-relaxed mb-8 max-w-lg">
              Outil professionnel de dimensionnement technico-financier basé sur
              la méthode SAHELIO . Bilan énergétique, calculs complets, carte
              interactive, simulation 3D et rapport PDF.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-10">
              {[
                {
                  icon: Zap,
                  label: "Calculs SAHELIO précis",
                  desc: "Toutes les formules du module 4",
                },
                {
                  icon: MapPin,
                  label: "Carte Niger interactive",
                  desc: "14 stations météo nationales",
                },
                {
                  icon: BarChart3,
                  label: "Bilan complet",
                  desc: "PV, batteries, câbles, protections",
                },
                {
                  icon: FileText,
                  label: "Rapport PDF",
                  desc: "Offre technico-financière",
                },
              ].map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-3 bg-white rounded-xl border border-earth-100"
                >
                  <div className="w-8 h-8 bg-solar-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-solar-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-earth-800">
                      {label}
                    </p>
                    <p className="text-xs text-earth-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Start Card */}
          <div className="animate-slide-up">
            <div className="bg-white rounded-3xl border border-earth-100 shadow-xl p-8">
              <div className="w-12 h-12 bg-solar-gradient rounded-2xl flex items-center justify-center mb-6 shadow-md">
                <Sun className="w-6 h-6 text-white" />
              </div>

              <h2 className="font-display text-2xl text-earth-900 mb-2">
                Démarrer un projet
              </h2>
              <p className="text-earth-400 text-sm mb-8">
                Toutes les données sont sauvegardées localement dans votre
                navigateur.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="field-label">Nom du projet</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="ex : Installation solaire — Usine Tchadoua"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Client / Bénéficiaire</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Nom du client"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
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
                onClick={newProject}
                className="w-full mt-4 text-sm text-earth-500 hover:text-earth-700
                           py-2 rounded-xl hover:bg-earth-50 transition-all flex items-center justify-center gap-1"
              >
                Reprendre le projet sauvegardé
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Info SAHELIO */}
            <div className="mt-4 p-4 bg-sky-50 border border-sky-100 rounded-2xl">
              <p className="text-xs text-sky-700 leading-relaxed">
                <strong>Méthode SAHELIO :</strong> Ratio de performance Rp =
                0,65 (milieu poussiéreux Niger), taux de réserve 25%,
                irradiation du mois le plus défavorable, dimensionnement
                batteries en Ah avec série/parallèle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Étapes aperçu */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="font-display text-3xl text-center text-earth-800 mb-10">
          5 étapes pour un dimensionnement complet
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {[
            {
              n: "01",
              title: "Bilan énergétique",
              desc: "Liste des charges, puissances, durées jour/nuit",
            },
            {
              n: "02",
              title: "Localisation",
              desc: "Carte Niger, irradiation mois défavorable, inclinaison",
            },
            {
              n: "03",
              title: "Équipements",
              desc: "Panneaux, batteries, onduleurs, MPPT",
            },
            {
              n: "04",
              title: "Calculs SAHELIO",
              desc: "Pcmin, batteries Ah, câbles, protections",
            },
            {
              n: "05",
              title: "Offre financière",
              desc: "Devis HT/TTC, rapport PDF téléchargeable",
            },
          ].map((step, i) => (
            <div key={step.n} className="relative">
              <div className="bg-white rounded-2xl border border-earth-100 p-5 h-full">
                <div className="text-3xl font-display text-solar-200 mb-3">
                  {step.n}
                </div>
                <h3 className="text-sm font-semibold text-earth-800 mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs text-earth-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
              {i < 4 && (
                <div className="hidden sm:block absolute top-1/2 -right-2 z-10">
                  <ChevronRight className="w-4 h-4 text-earth-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-earth-100 bg-white py-6">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-earth-300">
            SolarDim Niger — Outil de dimensionnement PV basé sur la méthode
            SAHELIO . Données sauvegardées localement, aucune base de données
            utilisateur.
          </p>
        </div>
      </footer>
    </div>
  );
}
