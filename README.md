# SolarDim Niger 🌞

### Outil de dimensionnement technico-financier PV — Méthode SAHELIO

> Application Next.js 14 + TypeScript + Tailwind + Zustand  
> Toutes les données sont stockées **localement dans le navigateur** (LocalStorage via Zustand persist)

---

## 🚀 Installation rapide

```bash
# 1. Extraire le dossier du projet
cd solardim-niger

# 2. Installer les dépendances
npm install

# 3. Lancer en développement
npm run dev

# 4. Ouvrir dans le navigateur
# http://localhost:3000
```

---

## 📁 Structure du projet

```
solardim-niger/
├── app/
│   ├── globals.css          # Styles globaux + tokens CSS
│   ├── layout.tsx           # Layout racine (fonts, Toaster)
│   ├── page.tsx             # Page d'accueil
│   └── wizard/
│       ├── layout.tsx       # Layout wizard (navigation, steps)
│       └── page.tsx         # Router des étapes
│
├── components/
│   └── wizard/
│       ├── steps/
│       │   ├── StepBilan.tsx        # Étape 1 — Bilan énergétique
│       │   ├── StepLocalisation.tsx # Étape 2 — Carte Niger
│       │   ├── StepEquipements.tsx  # Étape 3 — Catalogue
│       │   ├── StepCalculs.tsx      # Étape 4 — Calculs  SAHELIO
│       │   └── StepOffre.tsx        # Étape 5 — Offre + PDF
│       └── shared/
│           └── MapLeaflet.tsx       # Carte Leaflet (client-only)
│
├── lib/
│   ├── calculations.ts      # Moteur de calcul  SAHELIO complet
│   ├── data.ts              # Données statiques Niger + catalogue
│   ├── store.ts             # Store Zustand (persistance LocalStorage)
│   └── utils.ts             # Utilitaires (cn, format...)
│
└── types/
    └── index.ts             # Types TypeScript complets
```

---

## 🔢 Méthode de calcul — SAHELIO, Module 4

### A — Champ PV (§4.2.1.2)

```
Etot = Σ(charges) × 1,25 (taux de réserve)
Pcmin = Etot / (Rp × Irr_défavorable)
Rp = 0,65 (milieu poussiéreux Niger)
Us = f(Pcmin) → Tableau 3  SAHELIO (12/24/48/96V)
Nps = Us / Vnom_panneau
Np = ⌈Pcmin / Pcu⌉
Nbrp = ⌈Np / Nps⌉
```

### B — Batteries (§4.2.2.1) — résultat en **Ah**

```
Cp [Ah] = (En_nuit × 1,25 × Nj) / (Us × DoD × Rb)
Nbs = Us / Ub
Nbp = ⌈Cp / Cap_bat⌉
Nb = Nbs × Nbp
```

### C — MPPT (§4.2.2.2.2) — 3 conditions cumulatives

```
① Pmrc ≥ 1,25 × Pcu × Np
② Vmrc ≥ 1,25 × Voc × Nps
③ Imrc ≥ 1,25 × Icc × Nbrp
```

### D — Onduleur (§4.2.2.3)

```
P_ond = 1,25 × Ppt / ƞond
```

### E — Câbles (§4.2.2.4)

```
S = (2 × L × Ie × ρ) / ΔU(V)  | ρ_Cu = 0,017 | ΔU ≤ 3%
```

### Protections (§4.2.2.5)

- Disj. DC : `1,4 × Isc < In < 2 × Isc`
- Parafoudre DC type 2 : `Up < 0,8 × Uw` ( SAHELIO Tableau 5)
- Fusibles : SAHELIO Tableau 6 (selon nombre de chaînes)
- Sectionneur : `In > Nbrp × 1,25 × Isc`, `Ue > 1,2 × Nps × Voc`

---

## 🗺️ Données d'irradiation Niger

14 stations intégrées avec irradiation **mois le plus défavorable** :
Niamey, Agadez, Zinder, Maradi, Tahoua, Dosso, Diffa, Tillabéri,
Arlit, Birni-N'Konni, Gaya, Téra, Mayahi, In-Gall

Sources : PVGIS (JRC), SolarGIS, NASA POWER, Météo Nationale Niger

---

## 📄 Export PDF

Génère un rapport complet avec :

- Bilan énergétique avec toutes les charges
- Résultats de dimensionnement et formules SAHELIO
- Tableau des protections électriques
- Offre technico-financière HT + TVA (19%) + TTC

---

## 🔜 Prochaines itérations

- **Itération 2** : Animation Three.js (inclinaison/orientation panneaux)
- **Itération 3** : Schéma unifilaire SVG dynamique
- **Itération 4** : Graphiques de production (Recharts)
- **Itération 5** : Export Word (.docx) du rapport complet

---

## 📚 Référence

Manuel SAHELIO — _Électricité Solaire Photovoltaïque : Maîtriser les bases de la conception
à la maintenance d'un système solaire photovoltaïque_, Module 4 — Dimensionnement.
Institut de la Francophonie pour le Développement Durable, 2023.
