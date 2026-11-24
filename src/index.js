import { readFileSync } from 'node:fs';

function loadJson(relativePath) {
  const url = new URL(relativePath, import.meta.url);
  return JSON.parse(readFileSync(url, 'utf8'));
}

const woodDataset = loadJson('../data/wood-species-de.json');
const oilTankDataset = loadJson('../data/oil-tanks-standard-de.json');
const fuelDataset = loadJson('../data/fuel-benchmarks-2026-de.json');

export const SRM_FACTORS = Object.freeze({
  25: 1.3,
  33: 1.4,
  50: 1.5,
});

export const FM_PER_RM = 0.7;
export const HEIZOEL_KWH_PER_LITER = 10;
export const BEHG_2026_CORRIDOR_EUR_PER_TON = Object.freeze({ min: 55, max: 65 });
export const BEHG_2026_CO2_PRICE_EUR_PER_TON = fuelDataset.co2_price_per_ton_eur;
export const DE_VAT_RATE = fuelDataset.vat_rate_de;

export const WOOD_SPECIES = Object.freeze(
  woodDataset.species.map((s) =>
    Object.freeze({
      slug: s.slug,
      name: s.name,
      fullName: s.full_name,
      category: s.category,
      kwhPerRm: s.kwh_per_rm,
      kgPerRm: s.kg_per_rm,
      kwhPerKg: s.kwh_per_kg,
      kwhPerSrm33cm: s.kwh_per_srm_33cm,
      oilEqPerRm: s.oil_eq_l_per_rm,
      dryingYears: s.drying_years,
      sparkRisk: s.spark_risk,
      stoveFit: s.stove_fit,
      defaultPriceSrmEur: s.default_price_srm_eur,
      defaultPriceSrmChf: s.default_price_srm_chf,
    })
  )
);

export const OIL_TANKS = Object.freeze(
  oilTankDataset.tanks.map((t) =>
    Object.freeze({
      slug: t.slug,
      name: t.name,
      shortName: t.short_name,
      categoryLabel: t.category,
      tankType: t.tank_type,
      nominalLiters: t.nominal_liters,
      diameterCm: t.diameter_cm ?? undefined,
      lengthCm: t.length_cm ?? undefined,
      tankCount: t.tank_count ?? undefined,
      unitLengthCm: t.unit_length_cm ?? undefined,
      unitWidthCm: t.unit_width_cm ?? undefined,
      unitHeightCm: t.unit_height_cm ?? undefined,
      formFactor: t.form_factor ?? undefined,
      defaultHeightCm: t.default_height_cm,
      dailyUsageL: t.daily_usage_l,
      stepCm: t.step_cm,
    })
  )
);

export const FUEL_BENCHMARKS_2026 = Object.freeze({
  year: fuelDataset.year,
  updatedAt: fuelDataset.updated_at,
  co2PricePerTonEur: fuelDataset.co2_price_per_ton_eur,
  behgCorridorEurPerTon: Object.freeze([...fuelDataset.behg_co2_corridor_eur_per_t]),
  vatRateDe: fuelDataset.vat_rate_de,
  defaultAnnualDemandKwh: fuelDataset.default_annual_demand_kwh,
  referenceCalculator: fuelDataset.reference_calculator,
  fuels: Object.freeze(
    fuelDataset.fuels.map((f) =>
      Object.freeze({
        id: f.id,
        name: f.name,
        shortName: f.short_name,
        unit: f.unit,
        unitLabel: f.unit_label,
        hu: f.hu,
        huUnit: f.hu_unit,
        defaultEfficiencyPct: f.default_efficiency_pct,
        defaultPriceEur: f.default_price_eur,
        defaultPriceChf: f.default_price_chf,
        co2EmissionFactorKgPerUnit: f.co2_emission_factor_kg_per_unit,
        co2TaxPerUnitEur: f.co2_tax_per_unit_eur,
        co2Note: f.co2_note,
        referenceSource: f.reference_source,
      })
    )
  ),
});

export function clamp(val, min, max) {
  if (!Number.isFinite(val)) return min;
  return Math.min(max, Math.max(min, val));
}

export function parseDeNumber(raw, fallback) {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : fallback;
  if (!raw) return fallback;
  const cleaned = String(raw).trim().replace(/\s+/g, '').replace(/[€%]/g, '').replace(/CHF/gi, '');
  if (!cleaned) return fallback;

  let normalized = cleaned;
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');
  if (hasComma && hasDot) {
    if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
      normalized = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = cleaned.replace(/,/g, '');
    }
  } else if (hasComma) {
    normalized = cleaned.replace(',', '.');
  } else if (hasDot) {
    if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
      normalized = cleaned.replace(/\./g, '');
    }
  }

  const num = Number(normalized);
  return Number.isFinite(num) ? num : fallback;
}

export function getWoodBySlug(slug) {
  return WOOD_SPECIES.find((w) => w.slug === slug) ?? WOOD_SPECIES[0];
}

export function getOilTankBySlug(slug) {
  return OIL_TANKS.find((t) => t.slug === slug);
}

/**
 * Convert firewood volume between RM (Raummeter), SRM (Schüttraummeter) and FM (Festmeter).
 */
export function convertWoodVolume(quantity, fromUnit = 'srm', scheitLength = 33) {
  const srmFactor = SRM_FACTORS[scheitLength] ?? 1.4;
  const qty = Math.max(0, Number.isFinite(quantity) ? quantity : 0);

  let rm;
  if (fromUnit === 'srm') {
    rm = qty / srmFactor;
  } else if (fromUnit === 'fm') {
    rm = qty / FM_PER_RM;
  } else {
    rm = qty;
  }

  return {
    srmFactor,
    rm,
    srm: rm * srmFactor,
    fm: rm * FM_PER_RM,
  };
}

/**
 * Calculate firewood unit conversions, real unit prices, energy content (kWh),
 * heating oil equivalent, effective ct/kWh, weight and trailer trips.
 */
export function calcBrennholz(input = {}) {
  const currency = input.currency === 'chf' ? 'chf' : 'eur';
  const species = getWoodBySlug(input.speciesSlug ?? 'buche');
  const scheitLength = input.scheitLength ?? 33;
  const unit = input.unit ?? 'srm';
  const srmFactor = SRM_FACTORS[scheitLength] ?? 1.4;

  const qty = clamp(input.quantity ?? 4, 0.1, 500);
  const defaultUnitPrice =
    currency === 'chf' ? species.defaultPriceSrmChf : species.defaultPriceSrmEur;
  const price = clamp(input.pricePerInputUnit ?? defaultUnitPrice, 0, 2000);
  const eff = clamp(input.stoveEfficiencyPct ?? 80, 30, 98) / 100;
  const oilPrice = clamp(input.oilPricePerLiter ?? (currency === 'chf' ? 1.38 : 1.55), 0.3, 5);
  const payload = clamp(input.trailerPayloadKg ?? 550, 200, 3500);

  let volumeRm;
  if (unit === 'srm') {
    volumeRm = qty / srmFactor;
  } else if (unit === 'fm') {
    volumeRm = qty / FM_PER_RM;
  } else {
    volumeRm = qty;
  }

  const volumeSrm = volumeRm * srmFactor;
  const volumeFm = volumeRm * FM_PER_RM;

  const totalPrice = qty * price;
  const realPricePerRm = volumeRm > 0 ? totalPrice / volumeRm : 0;
  const realPricePerSrm = volumeSrm > 0 ? totalPrice / volumeSrm : 0;
  const realPricePerFm = volumeFm > 0 ? totalPrice / volumeFm : 0;
  const srmMarkupPct = Math.round((srmFactor - 1) * 100);

  const totalKwh = volumeRm * species.kwhPerRm;
  const usableKwh = totalKwh * eff;
  const oilEquivalentLiters = totalKwh / HEIZOEL_KWH_PER_LITER;
  const oilEquivalentCost = oilEquivalentLiters * oilPrice;
  const savingsVsOil = oilEquivalentCost - totalPrice;
  const effectiveCentPerKwh = usableKwh > 0 ? (totalPrice / usableKwh) * 100 : 0;

  const totalWeightKg = volumeRm * species.kgPerRm;
  const trailerTrips = Math.max(1, Math.ceil(totalWeightKg / payload));

  return {
    species,
    srmFactor,
    volumeRm,
    volumeSrm,
    volumeFm,
    totalPrice,
    realPricePerRm,
    realPricePerSrm,
    realPricePerFm,
    srmMarkupPct,
    totalKwh,
    usableKwh,
    oilEquivalentLiters,
    oilEquivalentCost,
    savingsVsOil,
    effectiveCentPerKwh,
    totalWeightKg,
    trailerTrips,
  };
}

/**
 * Exact circular segment area A(h) in cm² for a horizontal cylindrical tank of diameter D.
 * Formula: A(h) = R²·arccos((R - h)/R) - (R - h)·√(2Rh - h²)
 */
export function cylinderAreaCm2(diameterCm, heightCm) {
  const r = diameterCm / 2;
  const h = clamp(heightCm, 0, diameterCm);
  if (r <= 0 || h <= 0) return 0;
  if (h >= diameterCm) return Math.PI * r * r;
  const cosArg = clamp((r - h) / r, -1, 1);
  const radical = Math.max(0, 2 * r * h - h * h);
  return r * r * Math.acos(cosArg) - (r - h) * Math.sqrt(radical);
}

/**
 * Remaining volume in liters for a horizontal cylindrical tank (DIN 6608 / EN 12285-1).
 */
export function cylinderVolumeLiters(diameterCm, lengthCm, heightCm) {
  if (diameterCm <= 0 || lengthCm <= 0) return 0;
  return (cylinderAreaCm2(diameterCm, heightCm) * lengthCm) / 1000;
}

/**
 * Exact spherical cap volume V(h) in liters for a spherical tank (Kugeltank).
 * Formula: V(h) = π·h²·(3R - h) / 3000  (dimensions in cm, result in liters)
 */
export function sphereCapLiters(diameterCm, heightCm) {
  const r = diameterCm / 2;
  const h = clamp(heightCm, 0, diameterCm);
  if (r <= 0 || h <= 0) return 0;
  if (h >= diameterCm) return (4 * Math.PI * r * r * r) / 3000;
  return (Math.PI * h * h * (3 * r - h)) / 3000;
}

/**
 * Remaining volume in liters for rectangular / PE battery oil tanks.
 */
export function rectTankLiters(unitLengthCm, unitWidthCm, heightCm, tankCount = 1, formFactor = 1) {
  if (unitLengthCm <= 0 || unitWidthCm <= 0 || heightCm <= 0 || tankCount <= 0 || formFactor <= 0) {
    return 0;
  }
  return (tankCount * unitLengthCm * unitWidthCm * heightCm * formFactor) / 1000;
}

/**
 * Calculate oil tank remaining liters, fill percentage, linear-estimation error,
 * winter range, TRwS 791 90% safe refill volume/cost, and 5 cm bottom dead space.
 * Supports tankType: 'zylinder' (horizontal cylinder), 'batterie' (rectangular/PE battery),
 * and 'kugel' (spherical tank).
 */
export function calcOeltank(input) {
  const tankType = input.tankType ?? 'zylinder';
  const daily = clamp(input.dailyUsageL ?? 12, 1, 200);
  const oilPrice = clamp(input.oilPricePerLiter ?? 1.55, 0.3, 5);

  let maxHeightCm;
  let clampedLevelCm;
  let maxLiters;
  let restLiters;
  let totraumLiters;

  if (tankType === 'zylinder') {
    const d = clamp(input.diameterCm ?? 160, 40, 320);
    const l = clamp(input.lengthCm ?? 250, 50, 1500);
    maxHeightCm = d;
    clampedLevelCm = clamp(input.levelCm ?? 0, 0, d);
    const r = d / 2;
    maxLiters = (Math.PI * r * r * l) / 1000;
    restLiters = cylinderVolumeLiters(d, l, clampedLevelCm);
    totraumLiters = cylinderVolumeLiters(d, l, Math.min(5, d));
  } else if (tankType === 'kugel') {
    const d = clamp(input.diameterCm ?? 220, 40, 400);
    maxHeightCm = d;
    clampedLevelCm = clamp(input.levelCm ?? 0, 0, d);
    maxLiters = sphereCapLiters(d, d);
    restLiters = sphereCapLiters(d, clampedLevelCm);
    totraumLiters = sphereCapLiters(d, Math.min(5, d));
  } else {
    const n = Math.round(clamp(input.tankCount ?? 3, 1, 8));
    const lu = clamp(input.unitLengthCm ?? 110, 40, 400);
    const bu = clamp(input.unitWidthCm ?? 76, 30, 250);
    const hu = clamp(input.unitHeightCm ?? 125, 50, 260);
    const kf = clamp(input.formFactor ?? 0.9569, 0.75, 1.05);
    maxHeightCm = hu;
    clampedLevelCm = clamp(input.levelCm ?? 0, 0, hu);
    maxLiters = rectTankLiters(lu, bu, hu, n, kf);
    restLiters = rectTankLiters(lu, bu, clampedLevelCm, n, kf);
    totraumLiters = rectTankLiters(lu, bu, Math.min(5, hu), n, kf);
  }

  const fillPct = maxLiters > 0 ? (restLiters / maxLiters) * 100 : 0;
  const linearIllusionPct = maxHeightCm > 0 ? (clampedLevelCm / maxHeightCm) * 100 : 0;
  const linearLiters = (linearIllusionPct / 100) * maxLiters;
  const linearDiffLiters = linearLiters - restLiters;

  const daysLeft = restLiters / daily;
  const weeksLeft = daysLeft / 7;

  const target90Liters = 0.9 * maxLiters;
  const refill90Liters = Math.max(0, target90Liters - restLiters);
  const refill90Cost = refill90Liters * oilPrice;

  let statusKey = 'stable';
  let statusLabel = 'Wintervorrat stabil';
  if (fillPct < 20) {
    statusKey = 'critical';
    statusLabel = 'Reserve kritisch – zeitnah nachbestellen';
  } else if (fillPct <= 45) {
    statusKey = 'watch';
    statusLabel = 'Beobachten – Preise im Blick behalten';
  }

  return {
    tankType,
    maxHeightCm,
    clampedLevelCm,
    maxLiters,
    restLiters,
    fillPct,
    linearIllusionPct,
    linearDiffLiters,
    daysLeft,
    weeksLeft,
    target90Liters,
    refill90Liters,
    refill90Cost,
    totraumLiters,
    statusKey,
    statusLabel,
  };
}

/**
 * Generate a Peiltabelle (dipstick lookup table) for any oil tank preset or slug.
 */
export function buildPeiltabelle(presetOrSlug, options = {}) {
  const preset =
    typeof presetOrSlug === 'string' ? getOilTankBySlug(presetOrSlug) : presetOrSlug;
  if (!preset) {
    throw new Error(`Unknown oil tank preset: ${String(presetOrSlug)}`);
  }

  const maxH =
    preset.tankType === 'zylinder' || preset.tankType === 'kugel'
      ? (preset.diameterCm ?? 160)
      : (preset.unitHeightCm ?? 125);
  const step = preset.stepCm || 10;
  const heights = [];
  for (let h = step; h < maxH; h += step) {
    heights.push(h);
  }
  heights.push(maxH);

  return heights.map((h) => {
    const res = calcOeltank({
      tankType: preset.tankType,
      diameterCm: preset.diameterCm ?? 160,
      lengthCm: preset.lengthCm ?? 250,
      tankCount: preset.tankCount ?? 3,
      unitLengthCm: preset.unitLengthCm ?? 110,
      unitWidthCm: preset.unitWidthCm ?? 76,
      unitHeightCm: preset.unitHeightCm ?? 125,
      formFactor: preset.formFactor ?? 0.9569,
      levelCm: h,
      dailyUsageL: preset.dailyUsageL,
      oilPricePerLiter: options.oilPricePerLiter ?? 1.55,
      currency: options.currency ?? 'eur',
    });
    return {
      heightCm: h,
      restLiters: res.restLiters,
      fillPct: res.fillPct,
      refill90Liters: res.refill90Liters,
      isDefault: Math.abs(h - preset.defaultHeightCm) < step / 2,
    };
  });
}

/**
 * Calculate German BEHG CO₂ surcharge per fuel unit (net & gross incl. VAT).
 */
export function calcBehgCo2Surcharge(
  emissionFactorKgPerUnit,
  co2PriceEurPerTon = BEHG_2026_CO2_PRICE_EUR_PER_TON,
  vatRate = DE_VAT_RATE
) {
  const ef = Math.max(0, Number.isFinite(emissionFactorKgPerUnit) ? emissionFactorKgPerUnit : 0);
  const pricePerTon = Math.max(0, Number.isFinite(co2PriceEurPerTon) ? co2PriceEurPerTon : 0);
  const vat = Math.max(0, Number.isFinite(vatRate) ? vatRate : 0);

  const netEurPerUnit = (ef * pricePerTon) / 1000;
  const grossEurPerUnit = netEurPerUnit * (1 + vat);

  return {
    co2PriceEurPerTon: pricePerTon,
    vatRate: vat,
    netEurPerUnit,
    grossEurPerUnit,
  };
}

/**
 * Compare annual heating costs across Holzpellets ENplus A1, Brennholz Buche (33 cm),
 * Erdgas, and Heizöl EL for a given annual useful heat demand (kWh).
 */
export function calcBrennstoff(input = {}) {
  const currency = input.currency === 'chf' ? 'chf' : 'eur';
  const demand = clamp(input.demandKwh ?? FUEL_BENCHMARKS_2026.defaultAnnualDemandKwh, 1000, 120000);

  const rows = FUEL_BENCHMARKS_2026.fuels.map((f) => {
    const defaultPrice = currency === 'chf' ? f.defaultPriceChf : f.defaultPriceEur;
    const rawPrice = input.prices?.[f.id] ?? defaultPrice;
    const rawEff = input.efficiencies?.[f.id] ?? f.defaultEfficiencyPct;

    const price = clamp(rawPrice, 0.01, 5000);
    const effPct = clamp(rawEff, 40, 105);
    const eff = effPct / 100;
    const centPerKwh = (price / (f.hu * eff)) * 100;
    const annualCost = demand * (centPerKwh / 100);
    const annualFuelAmount = demand / (f.hu * eff);
    const annualCo2TaxEur = annualFuelAmount * f.co2TaxPerUnitEur;

    return {
      id: f.id,
      name: f.name,
      shortName: f.shortName,
      unit: f.unit,
      unitLabel: f.unitLabel,
      hu: f.hu,
      huUnit: f.huUnit,
      pricePerUnit: price,
      efficiencyPct: effPct,
      centPerKwh,
      annualCost,
      annualFuelAmount,
      co2TaxPerUnitEur: f.co2TaxPerUnitEur,
      annualCo2TaxEur,
      co2Note: f.co2Note,
    };
  });

  const sorted = [...rows].sort((a, b) => a.centPerKwh - b.centPerKwh);
  const cheapest = sorted[0];
  const mostExpensive = sorted[sorted.length - 1];
  const maxAnnualSavings = mostExpensive.annualCost - cheapest.annualCost;

  const woodRow = rows.find((r) => r.id === 'holz');
  const oilRow = rows.find((r) => r.id === 'oel');
  const woodVsOilSavings = woodRow && oilRow ? oilRow.annualCost - woodRow.annualCost : 0;

  return {
    demandKwh: demand,
    currency,
    rows: sorted,
    cheapest,
    mostExpensive,
    maxAnnualSavings,
    woodVsOilSavings,
  };
}
