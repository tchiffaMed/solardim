"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone, Monitor, ChevronRight } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [platform, setPlatform] = useState<
    "android" | "desktop" | "ios" | null
  >(null);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Déjà installé ?
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    const dismissed = sessionStorage.getItem("pwa-banner-dismissed");
    if (dismissed) return;

    // Détecter la plateforme
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(ua);
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isDesktop = !isAndroid && !isIOS;

    if (isAndroid) setPlatform("android");
    else if (isIOS) setPlatform("ios");
    else setPlatform("desktop");

    // Service Worker registration
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Écouter l'event d'installation (Android / Desktop Chrome/Edge)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Délai pour ne pas afficher immédiatement au chargement
      setTimeout(() => setShowBanner(true), 2500);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Sur iOS, proposer quand même (instructions manuelles)
    if (isIOS) {
      setTimeout(() => setShowBanner(true), 3000);
    }

    // Détecter si déjà installé
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowBanner(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        setShowBanner(false);
      }
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  }

  function dismiss() {
    sessionStorage.setItem("pwa-banner-dismissed", "1");
    setShowBanner(false);
  }

  if (!showBanner) return null;

  const isIOS = platform === "ios";
  const canInstall = !!deferredPrompt;

  return (
    <>
      {/* Overlay semi-transparent */}
      <div
        className="fixed inset-0 bg-earth-900/40 backdrop-blur-sm z-[9998]"
        onClick={dismiss}
      />

      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 sm:max-w-md sm:left-1/2 sm:-translate-x-1/2 sm:bottom-6">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-earth-100">
          {/* Bande déco haut */}
          <div className="h-1.5 bg-solar-gradient" />

          {/* Contenu */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                {/* Icône app */}
                <div className="w-14 h-14 bg-solar-gradient rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                  <svg viewBox="0 0 64 64" className="w-8 h-8">
                    <defs>
                      <linearGradient
                        id="pi"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#1e3a5f" />
                        <stop offset="100%" stopColor="#0f1f3a" />
                      </linearGradient>
                    </defs>
                    {/* Panneau */}
                    <rect
                      x="8"
                      y="28"
                      width="48"
                      height="26"
                      rx="3"
                      fill="url(#pi)"
                    />
                    {[0, 1, 2].map((col) =>
                      [0, 1].map((row) => (
                        <rect
                          key={`${col}-${row}`}
                          x={10 + col * 16}
                          y={30 + row * 11}
                          width="13"
                          height="9"
                          rx="1.5"
                          fill="#263870"
                          stroke="#334d8a"
                          strokeWidth="0.5"
                        />
                      )),
                    )}
                    {/* Soleil */}
                    <circle cx="32" cy="16" r="6" fill="white" opacity="0.95" />
                    {[0, 60, 120, 180, 240, 300].map((a, i) => {
                      const r = (a * Math.PI) / 180;
                      return (
                        <line
                          key={i}
                          x1={32 + Math.cos(r) * 8}
                          y1={16 + Math.sin(r) * 8}
                          x2={32 + Math.cos(r) * 11}
                          y2={16 + Math.sin(r) * 11}
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          opacity="0.8"
                        />
                      );
                    })}
                    {/* Support */}
                    <line
                      x1="24"
                      y1="57"
                      x2="28"
                      y2="51"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                    <line
                      x1="40"
                      y1="57"
                      x2="36"
                      y2="51"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-lg text-earth-900 leading-tight">
                    SolarDim Niger
                  </h3>
                  <p className="text-xs text-earth-400 mt-0.5">
                    Dimensionnement PV · SAHELIO
                  </p>
                </div>
              </div>
              <button
                onClick={dismiss}
                className="text-earth-300 hover:text-earth-500 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message principal */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                {platform === "android" ? (
                  <Smartphone className="w-4 h-4 text-solar-500" />
                ) : (
                  <Monitor className="w-4 h-4 text-solar-500" />
                )}
                <span className="text-xs font-semibold text-solar-600 uppercase tracking-wide">
                  {platform === "android"
                    ? "Application Android"
                    : platform === "ios"
                      ? "Application iOS"
                      : "Application PC"}
                </span>
              </div>
              <p className="text-earth-700 font-semibold text-base leading-snug">
                Installez SolarDim sur votre{" "}
                {platform === "android"
                  ? "téléphone"
                  : platform === "ios"
                    ? "iPhone"
                    : "ordinateur"}
              </p>
              <p className="text-earth-400 text-sm mt-1.5 leading-relaxed">
                Accédez instantanément depuis votre écran d'accueil,{" "}
                <span className="text-earth-600 font-medium">
                  même sans connexion internet
                </span>
                . Toutes vos études PV sauvegardées localement.
              </p>
            </div>

            {/* Avantages */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { icon: "⚡", label: "Rapide" },
                { icon: "📴", label: "Hors-ligne" },
                { icon: "🔒", label: "Privé" },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 bg-earth-50 rounded-xl py-2.5 px-2"
                >
                  <span className="text-lg">{icon}</span>
                  <span className="text-xs font-medium text-earth-600">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Action */}
            {!isIOS ? (
              /* Android / Desktop — installation directe */
              <button
                onClick={handleInstall}
                disabled={!canInstall || installing}
                className="w-full bg-solar-gradient text-white rounded-2xl py-3.5 font-semibold
                           flex items-center justify-center gap-2 shadow-md hover:opacity-90
                           transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {installing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Installation…
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Installer l'application
                  </>
                )}
              </button>
            ) : (
              /* iOS — instructions manuelles */
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
                <p className="text-xs font-semibold text-sky-700 mb-2">
                  Pour installer sur iOS :
                </p>
                <div className="space-y-1.5">
                  {[
                    { step: "1", text: "Appuyez sur le bouton Partager ⬆" },
                    { step: "2", text: "Choisissez « Sur l'écran d'accueil »" },
                    { step: "3", text: "Appuyez sur « Ajouter »" },
                  ].map(({ step, text }) => (
                    <div key={step} className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-sky-200 text-sky-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {step}
                      </span>
                      <span className="text-xs text-sky-700">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={dismiss}
              className="w-full mt-3 text-xs text-earth-400 hover:text-earth-600 py-2 transition-colors"
            >
              Pas maintenant
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
