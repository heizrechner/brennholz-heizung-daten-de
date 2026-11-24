import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  SRM_FACTORS,
  FM_PER_RM,
  HEIZOEL_KWH_PER_LITER,
  BEHG_2026_CO2_PRICE_EUR_PER_TON,
  WOOD_SPECIES,
  OIL_TANKS,
  FUEL_BENCHMARKS_2026,
  clamp,
  parseDeNumber,
  getWoodBySlug,
  getOilTankBySlug,
  convertWoodVolume,
  calcBrennholz,
  cylinderAreaCm2,
  cylinderVolumeLiters,
  sphereCapLiters,
  rectTankLiters,
  calcOeltank,
  buildPeiltabelle,
  calcBehgCo2Surcharge,
  calcBrennstoff,
} from '../src/index.js';

function approx(actual, expected, tolerance = 1e-6, message = '') {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${message ? message + ': ' : ''}expected ${actual} to be within ${tolerance} of ${expected}`
  );
}

function parseCsvLines(csvText) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    if (inQuotes) {
      if (ch === '"' && csvText[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (ch !== '\r') {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

describe('Utility functions (clamp & parseDeNumber)', () => {
  it('clamps finite values and falls back to min on NaN/Infinity', () => {
    assert.equal(clamp(50, 0, 100), 50);
    assert.equal(clamp(-5, 0, 100), 0);
    assert.equal(clamp(150, 0, 100), 100);
    assert.equal(clamp(Number.NaN, 10, 20), 10);
    assert.equal(clamp(Number.POSITIVE_INFINITY, 10, 20), 10);
  });

  it('parses German and dot-decimal numeric formats reliably', () => {
    assert.equal(parseDeNumber('1.250,50 €', 0), 1250.5);
    assert.equal(parseDeNumber('18.000', 0), 18000);
    assert.equal(parseDeNumber('1,55', 0), 1.55);
    assert.equal(parseDeNumber('1.55', 0), 1.55);
    assert.equal(parseDeNumber('CHF 135', 0), 135);
    assert.equal(parseDeNumber('invalid', 42), 42);
    assert.equal(parseDeNumber(null, 42), 42);
  });
});

describe('Brennholz RM / SRM / FM conversions & energy calculations', () => {
  it('uses TFZ/FNR standard conversion factors for 25 / 33 / 50 cm', () => {
    assert.equal(SRM_FACTORS[25], 1.3);
    assert.equal(SRM_FACTORS[33], 1.4);
    assert.equal(SRM_FACTORS[50], 1.5);
    assert.equal(FM_PER_RM, 0.7);
    assert.equal(HEIZOEL_KWH_PER_LITER, 10);

    const rm1 = convertWoodVolume(1, 'rm', 33);
    approx(rm1.rm, 1);
    approx(rm1.srm, 1.4);
    approx(rm1.fm, 0.7);

    const roundTrip = convertWoodVolume(rm1.srm, 'srm', 33);
    approx(roundTrip.rm, 1);
    approx(roundTrip.fm, 0.7);

    const fromFm = convertWoodVolume(0.7, 'fm', 25);
    approx(fromFm.rm, 1);
    approx(fromFm.srm, 1.3);
  });

  it('reproduces canonical Buche 1 RM reference example', () => {
    const res = calcBrennholz({
      speciesSlug: 'buche',
      quantity: 1,
      unit: 'rm',
      scheitLength: 33,
      pricePerInputUnit: 161,
      stoveEfficiencyPct: 80,
      oilPricePerLiter: 1.55,
      trailerPayloadKg: 550,
      currency: 'eur',
    });

    assert.equal(res.species.slug, 'buche');
    approx(res.volumeRm, 1);
    approx(res.volumeSrm, 1.4);
    approx(res.volumeFm, 0.7);
    approx(res.totalKwh, 2100);
    approx(res.usableKwh, 1680);
    approx(res.oilEquivalentLiters, 210);
    approx(res.totalWeightKg, 470);
    approx(res.realPricePerSrm, 115);
    approx(res.effectiveCentPerKwh, 9.583333, 1e-4);
    assert.equal(res.trailerTrips, 1);
  });

  it('reproduces 4 SRM Buche (33 cm) trailer load & cost comparison', () => {
    const res = calcBrennholz({
      speciesSlug: 'buche',
      quantity: 4,
      unit: 'srm',
      scheitLength: 33,
      pricePerInputUnit: 115,
      stoveEfficiencyPct: 80,
      oilPricePerLiter: 1.55,
      trailerPayloadKg: 550,
      currency: 'eur',
    });

    approx(res.volumeRm, 4 / 1.4);
    approx(res.totalPrice, 460);
    approx(res.realPricePerRm, 161);
    assert.equal(res.srmMarkupPct, 40);
    approx(res.totalKwh, 6000);
    approx(res.usableKwh, 4800);
    approx(res.oilEquivalentLiters, 600);
    approx(res.totalWeightKg, (4 / 1.4) * 470);
    assert.equal(res.trailerTrips, 3);
    assert.ok(res.savingsVsOil > 0);
  });

  it('supports all 15 wood species and falls back gracefully on unknown slug', () => {
    assert.equal(WOOD_SPECIES.length, 15);
    assert.equal(getWoodBySlug('fichte').kwhPerRm, 1500);
    assert.equal(getWoodBySlug('robinie').kwhPerRm, 2120);
    assert.equal(getWoodBySlug('non-existent').slug, 'buche');
  });
});

describe('Öltank Peilstab geometry (cylinder, sphere & rectangular battery)', () => {
  it('computes exact circular segment boundary & symmetry values for DIN 6608 5.000 L', () => {
    const d = 160;
    const l = 250;
    const maxVol = (Math.PI * 80 * 80 * 250) / 1000; // ~5026.548 L

    assert.equal(cylinderAreaCm2(d, 0), 0);
    approx(cylinderVolumeLiters(d, l, 0), 0);
    approx(cylinderVolumeLiters(d, l, d / 2), maxVol / 2, 1e-6);
    approx(cylinderVolumeLiters(d, l, d), maxVol, 1e-6);

    // Symmetry check: V(h) + V(D - h) = V_max
    for (const h of [10, 32, 52, 79]) {
      approx(
        cylinderVolumeLiters(d, l, h) + cylinderVolumeLiters(d, l, d - h),
        maxVol,
        1e-6,
        `symmetry at h=${h}`
      );
    }

    // Strict monotonicity across height range
    let prev = -1;
    for (let h = 0; h <= d; h += 5) {
      const vol = cylinderVolumeLiters(d, l, h);
      assert.ok(vol > prev, `volume must strictly increase at h=${h}`);
      prev = vol;
    }

    // Reference example: DIN 6608 5.000 L at h = 52 cm
    const res = calcOeltank({
      tankType: 'zylinder',
      diameterCm: 160,
      lengthCm: 250,
      levelCm: 52,
      dailyUsageL: 12,
      oilPricePerLiter: 1.55,
      currency: 'eur',
    });

    approx(res.maxLiters, 5026.55, 0.02);
    approx(res.restLiters, 1417, 1);
    approx(res.fillPct, 28.2, 0.1);
    approx(res.linearIllusionPct, 32.5, 0.05);
    approx(res.linearDiffLiters, 217, 1);
    approx(res.refill90Liters, 3107, 1);
    approx(res.weeksLeft, 16.9, 0.1);
    assert.equal(res.statusKey, 'watch');
  });

  it('clamps out-of-bounds dipstick readings safely', () => {
    const empty = calcOeltank({ tankType: 'zylinder', diameterCm: 160, lengthCm: 250, levelCm: -15 });
    assert.equal(empty.clampedLevelCm, 0);
    assert.equal(empty.restLiters, 0);
    assert.equal(empty.statusKey, 'critical');

    const overflow = calcOeltank({
      tankType: 'zylinder',
      diameterCm: 160,
      lengthCm: 250,
      levelCm: 240,
    });
    assert.equal(overflow.clampedLevelCm, 160);
    approx(overflow.fillPct, 100, 1e-6);
    assert.equal(overflow.refill90Liters, 0);
    assert.equal(overflow.statusKey, 'stable');
  });

  it('computes exact spherical cap geometry for spherical oil tanks (Kugeltank)', () => {
    const d = 220;
    const r = d / 2;
    const expectedFull = (4 * Math.PI * r * r * r) / 3000;

    assert.equal(sphereCapLiters(d, 0), 0);
    approx(sphereCapLiters(d, r), expectedFull / 2, 1e-6);
    approx(sphereCapLiters(d, d), expectedFull, 1e-6);

    // Symmetry check: V(h) + V(D - h) = V_max
    for (const h of [15, 55, 90]) {
      approx(sphereCapLiters(d, h) + sphereCapLiters(d, d - h), expectedFull, 1e-6);
    }

    const res = calcOeltank({
      tankType: 'kugel',
      diameterCm: d,
      levelCm: r,
      dailyUsageL: 12,
      oilPricePerLiter: 1.55,
    });
    approx(res.fillPct, 50, 1e-6);
    approx(res.linearDiffLiters, 0, 1e-6);
    assert.equal(res.statusKey, 'stable');
  });

  it('computes rectangular PE battery tanks with formFactor accurately', () => {
    const res = calcOeltank({
      tankType: 'batterie',
      tankCount: 3,
      unitLengthCm: 110,
      unitWidthCm: 76,
      unitHeightCm: 125,
      formFactor: 0.9569,
      levelCm: 45,
      dailyUsageL: 12,
      oilPricePerLiter: 1.55,
    });

    approx(res.maxLiters, 3000, 1);
    approx(res.restLiters, 1080, 1);
    approx(res.fillPct, 36.0, 0.05);
    approx(res.linearDiffLiters, 0, 1e-6);
    approx(res.totraumLiters, 120, 0.5);
    approx(res.refill90Liters, 1620, 1);
    assert.equal(rectTankLiters(100, 100, 100, 1, 1), 1000);
  });

  it('builds complete Peiltabelle lookup tables from preset slugs', () => {
    const preset = getOilTankBySlug('din-6608-5000-liter');
    assert.ok(preset);
    const rows = buildPeiltabelle('din-6608-5000-liter');
    assert.equal(rows[0].heightCm, 10);
    assert.equal(rows[rows.length - 1].heightCm, 160);
    approx(rows[rows.length - 1].fillPct, 100, 1e-6);
    assert.ok(rows.some((r) => r.isDefault));
    assert.throws(() => buildPeiltabelle('does-not-exist'));
  });
});

describe('2026 four-fuel heating cost comparison & BEHG CO₂ pricing', () => {
  it('computes 2026 BEHG CO₂ surcharges accurately at 65 €/t incl. 19% VAT', () => {
    assert.equal(BEHG_2026_CO2_PRICE_EUR_PER_TON, 65);
    const oilTax = calcBehgCo2Surcharge(2.68, 65, 0.19);
    approx(oilTax.netEurPerUnit, 0.1742, 1e-4);
    approx(oilTax.grossEurPerUnit, 0.2073, 1e-4);

    const gasTax = calcBehgCo2Surcharge(0.201, 65, 0.19);
    approx(gasTax.netEurPerUnit, 0.013065, 1e-5);
    approx(gasTax.grossEurPerUnit, 0.015547, 1e-4);
  });

  it('reproduces 2026 benchmark ranking and annual costs at 18.000 kWh', () => {
    const res = calcBrennstoff({ demandKwh: 18000, currency: 'eur' });
    assert.equal(res.demandKwh, 18000);
    assert.deepEqual(
      res.rows.map((r) => r.id),
      ['pellets', 'holz', 'gas', 'oel']
    );

    const byId = Object.fromEntries(res.rows.map((r) => [r.id, r]));
    approx(byId.pellets.centPerKwh, 9.1435, 1e-3);
    approx(byId.pellets.annualCost, 1645.83, 0.5);
    assert.equal(byId.pellets.annualCo2TaxEur, 0);

    approx(byId.holz.centPerKwh, 9.5833, 1e-3);
    approx(byId.holz.annualCost, 1725.0, 0.5);
    approx(byId.holz.annualFuelAmount, 15.0, 1e-6);

    approx(byId.gas.centPerKwh, 13.0435, 1e-3);
    approx(byId.gas.annualCost, 2347.83, 0.5);
    approx(byId.gas.annualCo2TaxEur, 303.26, 1.0);

    approx(byId.oel.centPerKwh, 17.2222, 1e-3);
    approx(byId.oel.annualCost, 3100.0, 0.5);
    approx(byId.oel.annualFuelAmount, 2000, 1e-6);
    approx(byId.oel.annualCo2TaxEur, 414.0, 1.0);

    approx(res.maxAnnualSavings, 1454.17, 0.5);
    approx(res.woodVsOilSavings, 1375.0, 0.5);
  });

  it('allows overriding individual fuel prices and efficiencies', () => {
    const res = calcBrennstoff({
      demandKwh: 12000,
      prices: { oel: 1.0 },
      efficiencies: { oel: 95 },
    });
    const oil = res.rows.find((r) => r.id === 'oel');
    approx(oil.centPerKwh, (1.0 / (10 * 0.95)) * 100, 1e-6);
  });
});

describe('Open dataset integrity (JSON & CSV parity)', () => {
  it('validates metadata and JSON/CSV parity for wood-species-de', () => {
    const json = JSON.parse(
      readFileSync(new URL('../data/wood-species-de.json', import.meta.url), 'utf8')
    );
    const csvRows = parseCsvLines(
      readFileSync(new URL('../data/wood-species-de.csv', import.meta.url), 'utf8')
    );

    assert.ok(json.updated_at);
    assert.ok(Array.isArray(json.sources) && json.sources.length >= 2);
    assert.equal(json.species.length, 15);
    assert.equal(csvRows.length - 1, json.species.length);

    const header = csvRows[0];
    const kwhIdx = header.indexOf('kwh_per_rm');
    const kgIdx = header.indexOf('kg_per_rm');
    for (let i = 0; i < json.species.length; i++) {
      assert.equal(csvRows[i + 1][0], json.species[i].slug);
      assert.equal(Number(csvRows[i + 1][kwhIdx]), json.species[i].kwh_per_rm);
      assert.equal(Number(csvRows[i + 1][kgIdx]), json.species[i].kg_per_rm);
    }
  });

  it('validates metadata and JSON/CSV parity for oil-tanks-standard-de', () => {
    const json = JSON.parse(
      readFileSync(new URL('../data/oil-tanks-standard-de.json', import.meta.url), 'utf8')
    );
    const csvRows = parseCsvLines(
      readFileSync(new URL('../data/oil-tanks-standard-de.csv', import.meta.url), 'utf8')
    );

    assert.ok(json.updated_at);
    assert.equal(OIL_TANKS.length, 22);
    assert.equal(json.tanks.length, 22);
    assert.equal(csvRows.length - 1, json.tanks.length);
  });

  it('validates metadata and JSON/CSV parity for fuel-benchmarks-2026-de', () => {
    const json = JSON.parse(
      readFileSync(new URL('../data/fuel-benchmarks-2026-de.json', import.meta.url), 'utf8')
    );
    const csvRows = parseCsvLines(
      readFileSync(new URL('../data/fuel-benchmarks-2026-de.csv', import.meta.url), 'utf8')
    );

    assert.equal(json.year, 2026);
    assert.ok(json.updated_at);
    assert.ok(Array.isArray(json.sources) && json.sources.length >= 3);
    assert.equal(json.reference_calculator, 'https://heizrechner.com');
    assert.equal(FUEL_BENCHMARKS_2026.fuels.length, 4);
    assert.equal(json.fuels.length, 4);
    assert.equal(csvRows.length - 1, json.fuels.length);
  });
});
