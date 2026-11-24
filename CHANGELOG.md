# Changelog

Alle wesentlichen Änderungen an diesem Repository werden in dieser Datei dokumentiert.

## [v2026.1.0] – 2026-11-24

### Hinzugefügt / Added
- **ESM-Rechenengine (`src/index.js` + `src/index.d.ts`)**: Null-Abhängigkeiten-Engine für Node.js 18+.
  - `convertWoodVolume` & `calcBrennholz`: RM/SRM/FM-Umrechnung (Scheitlängen 25 / 33 / 50 cm), Heizwert (kWh), Heizöl-Äquivalent, Nutzwärmekosten (ct/kWh), Trockengewicht und 750-kg-Anhänger-Fahrten.
  - `cylinderAreaCm2`, `cylinderVolumeLiters`, `sphereCapLiters`, `rectTankLiters`, `calcOeltank` & `buildPeiltabelle`: Exakte Peilstab-Restliter-Geometrie für liegende DIN-6608-Zylindertanks, PE-Batterietanks und Kugeltanks inkl. TRwS-791-90-%-Nachfüllgrenze und 5-cm-Totraum.
  - `calcBehgCo2Surcharge` & `calcBrennstoff`: 2026er Vier-Brennstoffe-Vergleich (Holzpellets ENplus A1, Brennholz Buche 33 cm, Erdgas, Heizöl EL) inkl. BEHG-CO₂-Preis (55–65 €/t, Referenz 65 €/t).
- **Offene Referenzdatensätze (`data/`, JSON & CSV, CC BY 4.0)**:
  - `wood-species-de`: 15 heimische Brennholzarten (w = 18 % Restfeuchte nach TFZ Bayern / FNR / DIN EN ISO 17225-5).
  - `oil-tanks-standard-de`: 22 verbreitete DIN-6608-Zylinder- und PE-/Marken-Batterietanks (Schütz, Roth, Werit).
  - `fuel-benchmarks-2026-de`: 2026er Richtpreise, Heizwerte, Wirkungsgrade und BEHG-CO₂-Aufschläge.
- **Testsuite (`test/calc.test.js`) & CI (`.github/workflows/ci.yml`)**: Vollständige `node:test`-Verifikation für Node 20 und Node 22.
