"use client";

import { useRouter } from "next/navigation";
import { Sun, Save } from "lucide-react";
import { useSolarStore } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 0, label: "Bilan énergétique", short: "Bilan" },
  { id: 1, label: "Localisation", short: "Localisation" },
  { id: 2, label: "Équipements", short: "Équip." },
  { id: 3, label: "Calculs  SAHELIO", short: "Calculs" },
  { id: 4, label: "Visualisations", short: "3D + Schéma" },
  { id: 5, label: "Offre financière", short: "Offre" },
];

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentStep, setStep, nextStep, prevStep, projectName } =
    useSolarStore();

  function handleSave() {
    toast.success("Projet sauvegardé", {
      description:
        "Toutes les données sont enregistrées dans votre navigateur.",
    });
  }

  return (
    <div className="min-h-screen bg-earth-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-earth-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 lg:px-6">
          <div className="flex items-center h-14 gap-4">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2.5 flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-solar-gradient rounded-lg flex items-center justify-center">
                <Sun className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-display text-base text-earth-900">
                  SolarDim
                </span>
                <span className="text-solar-600 font-display text-base">
                  {" "}
                  Niger
                </span>
              </div>
            </button>
            <div className="h-5 w-px bg-earth-200 hidden sm:block" />
            <div className="hidden sm:block flex-shrink-0">
              <p className="text-xs text-earth-400">Projet</p>
              <p className="text-sm font-medium text-earth-800 truncate max-w-[180px]">
                {projectName}
              </p>
            </div>

            {/* Steps nav desktop */}
            <nav className="hidden xl:flex items-center gap-0.5 flex-1 justify-center">
              {STEPS.map((step, i) => {
                const done = currentStep > step.id;
                const active = currentStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setStep(step.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                      active &&
                        "bg-solar-50 text-solar-700 border border-solar-200",
                      done && "text-green-600 hover:bg-green-50",
                      !active &&
                        !done &&
                        "text-earth-400 hover:text-earth-600 hover:bg-earth-50",
                    )}
                  >
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold",
                        active && "bg-solar-500 text-white",
                        done && "bg-green-100 text-green-600",
                        !active && !done && "bg-earth-100 text-earth-400",
                      )}
                    >
                      {done ? "✓" : step.id + 1}
                    </span>
                    {step.label}
                    {i < STEPS.length - 1 && (
                      <span className="ml-1 text-earth-200">›</span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 text-xs text-earth-500 hover:text-earth-700 bg-earth-50 hover:bg-earth-100 border border-earth-200 rounded-lg px-3 py-1.5 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sauvegarder</span>
              </button>
            </div>
          </div>

          {/* Steps mobile */}
          <div className="flex xl:hidden items-center gap-1 pb-2 overflow-x-auto">
            {STEPS.map((step) => {
              const done = currentStep > step.id;
              const active = currentStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setStep(step.id)}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all",
                    active && "bg-solar-500 text-white",
                    done && "text-green-600 bg-green-50",
                    !active && !done && "text-earth-400 bg-earth-50",
                  )}
                >
                  {done ? "✓ " : `${step.id + 1}. `}
                  {step.short}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-0.5 bg-earth-100">
        <div
          className="h-full bg-solar-gradient transition-all duration-500"
          style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 lg:px-6 py-8 animate-fade-in">
        {children}
      </main>

      {/* Footer nav */}
      <footer className="sticky bottom-0 bg-white border-t border-earth-100 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="text-xs text-earth-400">
            Étape {currentStep + 1}/{STEPS.length} — {STEPS[currentStep].label}
          </div>
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="px-4 py-2 text-sm text-earth-600 bg-earth-50 hover:bg-earth-100 border border-earth-200 rounded-xl transition-all font-medium"
              >
                ← Précédent
              </button>
            )}
            {currentStep < STEPS.length - 1 && (
              <button
                onClick={nextStep}
                className="px-5 py-2 text-sm text-white bg-solar-gradient rounded-xl hover:opacity-90 transition-all font-medium shadow-sm"
              >
                Suivant →
              </button>
            )}
            {currentStep === STEPS.length - 1 && (
              <button className="px-5 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all font-medium shadow-sm">
                ✓ Générer le rapport PDF
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
