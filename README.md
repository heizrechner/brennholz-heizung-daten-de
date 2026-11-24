# brennholz-heizung-daten-de

**Offene Rechenformeln (Node.js 18+ ESM, null Abhängigkeiten) und strukturierte 2026er Referenzdatensätze (JSON & CSV) für Brennholz-Umrechnung (RM / SRM / FM), Öltank-Peilstab-Geometrie (DIN 6608, PE-Batterietank & Kugeltank) sowie den Heizkosten-Vergleich inkl. deutschem BEHG-CO₂-Preis 2026 (55–65 €/t).**

**Rechenbeispiel (Buche, 18 % Restfeuchte nach TFZ/FNR):** `1 RM` gestapelte Buche entspricht bei 33 cm Scheitlänge exakt **`1,40 SRM`** (25 cm: `1,30 SRM`, 50 cm: `1,50 SRM`) und **`0,70 FM`**, wiegt ca. **`470 kg`** und liefert **`2.100 kWh`** Heizwert (**`210 L`** Heizöl-Äquivalent; `1 SRM` Buche 33 cm ≈ `1.500 kWh`). Bei `115 €/SRM` (real `161,00 €/RM`) und `80 %` Ofenwirkungsgrad kostet die Nutzwärme **`9,58 ct/kWh`** gegenüber **`17,22 ct/kWh`** bei Heizöl EL (`1,55 €/L`, `90 %` Kesselwirkungsgrad).

> **English summary:** Zero-dependency ESM JavaScript calculation library and open CC BY 4.0 reference datasets (JSON/CSV) for German/DACH residential heating: firewood volume conversions (`RM`/`SRM`/`FM`, 15 tree species per TFZ/FNR), exact dipstick-to-liters oil tank geometry (DIN 6608 horizontal cylinders, PE battery tanks, spherical tanks), and 2026 four-fuel cost comparisons including Germany's BEHG CO₂ pricing (`55–65 €/t`). Built for reproducible engineering scripts, home-automation integrations, and data analysis.

---

## Schnellübersicht 1: Brennholz-Heizwerte (15 Holzarten, w = 18 %)

Referenzwerte für lufttrockenes, ofenfertiges Scheitholz (`w = 18 %` Restfeuchte nach TFZ Bayern / FNR & DIN EN ISO 17225-5; Umrechnungsfaktor 33 cm: `1 RM = 1,40 SRM = 0,70 FM`; `10 kWh = 1 L` Heizöl EL):

| Holzart | Kategorie | Heizwert (kWh/RM) | Heizwert (kWh/SRM, 33 cm) | Gewicht (kg/RM) | Heizwert (kWh/kg) | Heizöl-Äquivalent (L/RM) | Trocknungszeit |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | :--- |
| **Robinie** | Hartholz | 2.120 | 1.514,3 | 510 | 4,16 | 212 | 2–3 Jahre |
| **Buche** | Hartholz | 2.100 | 1.500,0 | 470 | 4,47 | 210 | 2 Jahre |
| **Eiche** | Hartholz | 2.100 | 1.500,0 | 480 | 4,38 | 210 | 2–3 Jahre |
| **Esche** | Hartholz | 2.050 | 1.464,3 | 460 | 4,46 | 205 | 1,5–2 Jahre |
| **Kastanie (Esskastanie)** | Hartholz | 2.000 | 1.428,6 | 450 | 4,44 | 200 | 2 Jahre |
| **Ahorn** | Hartholz | 1.900 | 1.357,1 | 430 | 4,42 | 190 | 1,5–2 Jahre |
| **Birke** | Hartholz | 1.900 | 1.357,1 | 430 | 4,42 | 190 | 1,5 Jahre |
| **Kirsche** | Hartholz | 1.850 | 1.321,4 | 420 | 4,40 | 185 | 2 Jahre |
| **Lärche** | Nadelholz | 1.750 | 1.250,0 | 390 | 4,49 | 175 | 1,5 Jahre |
| **Douglasie** | Nadelholz | 1.700 | 1.214,3 | 370 | 4,59 | 170 | 1–1,5 Jahre |
| **Kiefer** | Nadelholz | 1.650 | 1.178,6 | 360 | 4,58 | 165 | 1–1,5 Jahre |
| **Fichte** | Nadelholz | 1.500 | 1.071,4 | 330 | 4,55 | 150 | 1 Jahr |
| **Erle** | Weichlaub | 1.450 | 1.035,7 | 330 | 4,39 | 145 | 1 Jahr |
| **Weide** | Weichlaub | 1.350 | 964,3 | 310 | 4,35 | 135 | 1 Jahr |
| **Pappel** | Weichlaub | 1.200 | 857,1 | 280 | 4,29 | 120 | 1 Jahr |

---

## Schnellübersicht 2: Heizkosten-Vergleich 2026 inkl. BEHG-CO₂-Preis

Referenzszenario für ein Einfamilienhaus mit **`18.000 kWh`** Jahres-Nutzwärmebedarf (Stand 2026, BEHG-Auktionskorridor `55–65 €/t`, Obergrenze `65 €/t` inkl. `19 %` MwSt.):

| Brennstoff | Referenzpreis 2026 (DE) | Heizwert (Hᵤ) | Wirkungsgrad (η) | BEHG CO₂-Anteil (brutto) | Nutzwärme (ct/kWh) | Jahreskosten (18.000 kWh) |
| :--- | :--- | ---: | ---: | :--- | ---: | ---: |
| **Holzpellets ENplus A1** | 395,00 €/t (lose, 6 t) | 4.800 kWh/t | 90 % | 0,00 € (biogen) | **9,14 ct/kWh** | **1.646 €** |
| **Brennholz Buche (33 cm)** | 115,00 €/SRM | 1.500 kWh/SRM | 80 % | 0,00 € (biogen) | **9,58 ct/kWh** | **1.725 €** |
| **Erdgas** | 0,120 €/kWh | 1,0 kWh/kWh | 92 % | ca. 1,55 ct/kWh (~303 €/J.) | **13,04 ct/kWh** | **2.348 €** |
| **Heizöl EL** | 1,55 €/L (3.000 L) | 10,0 kWh/L | 90 % | ca. 20,7 ct/L (~414 €/J.) | **17,22 ct/kWh** | **3.100 €** |

---

## Verwendung & Codebeispiele (Node.js 18+ ESM)

Keine externen Abhängigkeiten – direkt mit Node.js 18+ ausführen oder als lokales ESM-Modul importieren:

```js
import {
  calcBrennholz,
  calcOeltank,
  buildPeiltabelle,
  calcBrennstoff,
  calcBehgCo2Surcharge,
} from './src/index.js';

// 1) Brennholz: 4 SRM Buche (33 cm) à 115 €/SRM
const holz = calcBrennholz({
  speciesSlug: 'buche',
  quantity: 4,
  unit: 'srm',
  scheitLength: 33,
  pricePerInputUnit: 115,
  stoveEfficiencyPct: 80,
  oilPricePerLiter: 1.55,
  trailerPayloadKg: 550,
});
console.log({
  volumeRm: holz.volumeRm.toFixed(2),           // "2.86"
  realPricePerRm: holz.realPricePerRm.toFixed(2), // "161.00"
  effectiveCentPerKwh: holz.effectiveCentPerKwh.toFixed(2), // "9.58"
  trailerTrips: holz.trailerTrips,              // 3
});

// 2) Öltank-Peilstab: DIN 6608 5.000 L (Ø 160 cm, L 250 cm) bei 52 cm Füllhöhe
const tank = calcOeltank({
  tankType: 'zylinder',
  diameterCm: 160,
  lengthCm: 250,
  levelCm: 52,
  dailyUsageL: 12,
  oilPricePerLiter: 1.55,
});
console.log({
  restLiters: Math.round(tank.restLiters),      // 1417
  fillPct: tank.fillPct.toFixed(1),             // "28.2"
  linearDiffLiters: Math.round(tank.linearDiffLiters), // 217
  refill90Liters: Math.round(tank.refill90Liters),     // 3107
});

// 3) Komplette Peiltabelle generieren
const peiltabelle = buildPeiltabelle('din-6608-5000-liter');

// 4) 2026 Vier-Brennstoffe-Vergleich bei 18.000 kWh Nutzwärme
const vergleich = calcBrennstoff({ demandKwh: 18000 });
console.log(vergleich.cheapest.name, vergleich.maxAnnualSavings.toFixed(0)); // "Holzpellets ENplus A1" "1454"

// 5) BEHG CO₂-Aufschlag für Heizöl EL (2,68 kg CO₂/L bei 65 €/t + 19 % MwSt.)
const co2 = calcBehgCo2Surcharge(2.68, 65, 0.19);
console.log((co2.grossEurPerUnit * 100).toFixed(2), 'ct/L'); // "20.73 ct/L"
```

Tests ausführen:

```bash
npm test
```

---

## API-Übersicht (`src/index.js` & `src/index.d.ts`)

| Export | Zweck |
| :--- | :--- |
| `convertWoodVolume(qty, unit, scheitLength)` | Wandelt `RM`, `SRM` und `FM` für `25 / 33 / 50 cm` Scheitlänge um. |
| `calcBrennholz(input)` | Berechnet Volumen (`RM/SRM/FM`), reale Stückpreise, `kWh`, Heizöl-Äquivalent, `ct/kWh`, Gewicht und Anhänger-Fahrten. |
| `cylinderAreaCm2(diameterCm, heightCm)` | Exakte Kreissegment-Querschnittsfläche $A(h)$ eines liegenden Zylinders in cm². |
| `cylinderVolumeLiters(diameterCm, lengthCm, heightCm)` | Restvolumen in Litern für liegende Zylindertanks (DIN 6608 / EN 12285-1). |
| `sphereCapLiters(diameterCm, heightCm)` | Exaktes Kugelkappen-Volumen $V(h) = \frac{\pi h^2 (3R - h)}{3000}$ für Kugeltanks in Litern. |
| `rectTankLiters(l, w, h, count, formFactor)` | Restvolumen in Litern für Quader- und PE-Batterietanks inkl. Formfaktor. |
| `calcOeltank(input)` | Vollständige Peilstab-Auswertung für `zylinder`, `batterie` und `kugel` (inkl. 90-%-TRwS-791-Nachfüllmenge, 5-cm-Totraum, Winterreichweite & Linearitätsfehler). |
| `buildPeiltabelle(presetOrSlug, options)` | Erzeugt eine abgestufte Peiltabelle für alle 22 enthaltenen Tank-Presets oder eigene Geometrien. |
| `calcBehgCo2Surcharge(efKg, co2EurPerTon, vat)` | Berechnet den BEHG-CO₂-Preisaufschlag (netto & brutto inkl. MwSt.). |
| `calcBrennstoff(input)` | Sortierter 2026er Jahreskosten- und `ct/kWh`-Vergleich über Pellets, Buche, Erdgas und Heizöl EL. |
| `WOOD_SPECIES` / `OIL_TANKS` / `FUEL_BENCHMARKS_2026` | Eingefrorene Referenzarrays direkt aus `data/*.json`. |

---

## Offene Datensätze (`data/`, JSON & CSV)

Alle Datensätze stehen in `data/` parallel als **JSON** (mit Metadaten, `updated_at`, `sources` und `reference_calculator`) und **RFC-4180-CSV** unter **CC BY 4.0** (siehe [`data/LICENSE-DATA.md`](./data/LICENSE-DATA.md)):

- `data/wood-species-de.json` & `data/wood-species-de.csv` — 15 Brennholzarten (Hartholz, Nadelholz, Weichlaub) mit `kwh_per_rm`, `kg_per_rm`, `kwh_per_kg`, `kwh_per_srm_33cm`, `oil_eq_l_per_rm`, Trocknungsdauer und 2026er DACH-Referenzpreisen.
- `data/oil-tanks-standard-de.json` & `data/oil-tanks-standard-de.csv` — 22 gängige Haus-Heizöltanks (12× DIN 6608 Zylindertanks von 1.000 L bis 20.000 L sowie 10× PE-/Marken-Batterietanks u. a. Schütz, Roth, Werit).
- `data/fuel-benchmarks-2026-de.json` & `data/fuel-benchmarks-2026-de.csv` — 2026er Richtpreise, Heizwerte, Jahresnutzungsgrade, Emissionsfaktoren und BEHG-CO₂-Aufschläge.

---

## Häufige Fachfragen (FAQ)

### Wie viel Raummeter (RM) ist 1 Schüttraummeter (SRM)?

Bei der in Deutschland üblichen Scheitlänge von **33 cm** entspricht `1 SRM` genau **`0,714 RM`** (`1 RM = 1,40 SRM`), also rund `28,6 %` weniger Holzmasse als ein dicht gestapelter Raummeter. Bei `25 cm` Scheitlänge gilt `1 RM = 1,30 SRM` (`1 SRM ≈ 0,769 RM`), bei `50 cm` gilt `1 RM = 1,50 SRM` (`1 SRM ≈ 0,667 RM`).

### Wie berechne ich den Restinhalt im zylindrischen Öltank mit dem Peilstab?

Bei einem liegenden Zylindertank (DIN 6608) wächst das Volumen nicht linear mit der Peilhöhe, sondern über das exakte Kreissegment:

$$A(h) = R^2 \arccos\!\left(\frac{R - h}{R}\right) - (R - h)\sqrt{2Rh - h^2}, \qquad V(h) = \frac{A(h) \cdot L}{1000}$$

Bei einem `5.000-L-DIN-6608-Tank` (`Ø 160 cm`, `L 250 cm`) ergeben `52 cm` Peilhöhe real **`1.417 Liter (28,2 %)`** – ein linearer Dreisatz (`32,5 % = 1.634 L`) überschätzt den Vorrat um `217 Liter`.

### Wie hoch ist der BEHG CO₂-Preis 2026 für Heizöl und Erdgas?

Im nationalen Brennstoffemissionshandel (BEHG) gilt 2026 ein Auktions-Preiskorridor von **55 bis 65 €/t CO₂**. Am oberen Korridorrand (`65 €/t`, inkl. `19 %` MwSt.) entspricht dies rund **`20,73 ct/L`** bei Heizöl EL (`2,68 kg CO₂/L`) und **`1,55 ct/kWh`** bei Erdgas (`0,201 kg CO₂/kWh`); biogene Holzbrennstoffe (Pellets & Scheitholz) sind mit `0 €/t` befreit.

### Welches Brennholz hat den höchsten Heizwert pro Raummeter?

Unter den heimischen Brennhölzern erreichen **Robinie (`2.120 kWh/RM`)**, **Buche (`2.100 kWh/RM`)** und **Eiche (`2.100 kWh/RM`)** bei `18 %` Restfeuchte die höchsten volumenbezogenen Heizwerte, dicht gefolgt von Esche (`2.050 kWh/RM`). Nadelhölzer wie Fichte (`1.500 kWh/RM`) liefern pro Raummeter rund `28,6 %` weniger Energie, sind pro Kilogramm (`4,55 kWh/kg`) aber leicht energiereicher.

### Wie viel Liter Heizöl spart 1 Raummeter Buchenholz?

Rein energetisch entspricht `1 RM` trockene Buche (`2.100 kWh`) exakt **`210 Litern Heizöl EL`** (`10 kWh/L`). Berücksichtigt man den Wirkungsgradunterschied zwischen Kaminofen (`80 %` → `1.680 kWh` Nutzwärme) und Ölkessel (`90 %`), ersetzt `1 RM` Buche im Öltank real rund **`187 Liter Heizöl`**.

---

## Online-Rechner & Fachquellen

> **Transparenzhinweis / Disclosure:** Dieses Open-Source-Repository wird von [HeizRechner (`heizrechner.com`)](https://heizrechner.com/) gepflegt und stellt die zugrunde liegenden Berechnungsformeln (MIT) sowie Referenzdatensätze (CC BY 4.0) transparent und reproduzierbar bereit. Die kostenlosen, lokal im Browser laufenden Online-Rechner auf `heizrechner.com` basieren auf derselben Rechenlogik.
> *(EN: This open-source repository is maintained by [HeizRechner](https://heizrechner.com/) and publishes the underlying calculation formulas and 2026 reference datasets that power the free client-side calculators on `heizrechner.com`.)*

### Interaktive Browser-Rechner (kostenlos, ohne Login)

- **Übersicht & Startseite:** https://heizrechner.com/
- **Brennholz-Rechner (RM / SRM / FM & 15 Holzarten):** https://heizrechner.com/brennholz/
- **Öltank-Rechner (Peilstab, DIN 6608 & 22 Peiltabellen):** https://heizrechner.com/oeltank/
- **Brennstoff-Vergleich 2026 (Öl, Gas, Pellets & Brennholz):** https://heizrechner.com/brennstoff-vergleich/

### Amtliche & technische Referenzquellen

- **TFZ Bayern** — Technologie- und Förderzentrum Straubing (Holzheizwerte, Holzfeuchte & Raummaß-Umrechnung): https://www.tfz.bayern.de/
- **FNR** — Fachagentur Nachwachsende Rohstoffe e.V. (Energieholz-Kenndaten & Scheitholz-Ratgeber): https://www.fnr.de/
- **Umweltbundesamt / DEHSt** — Brennstoffemissionshandelsgesetz (BEHG) & CO₂-Emissionsfaktoren: https://www.umweltbundesamt.de/
- **DIN 6608 / EN 12285-1** — Liegende zylindrische Stahlbehälter für brennbare Flüssigkeiten & **DWA-A 791 (TRwS 791)** (Füllgrenzen für Heizölverbraucheranlagen).
- **DIN EN ISO 17225** — Biogene Festbrennstoffe (Spezifikationen für Stückholz & ENplus-A1-Holzpellets).
- **DEPI** — Deutsches Pelletinstitut (Referenzpreise für lose Holzpellets ENplus A1): https://depi.de/

## Lizenz

- **Quellcode (`src/`, `test/`):** [MIT License](./LICENSE)
- **Referenzdatensätze (`data/*.json`, `data/*.csv`):** [CC BY 4.0](./data/LICENSE-DATA.md)
