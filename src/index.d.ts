export type CurrencyCode = 'eur' | 'chf';
export type WoodUnit = 'srm' | 'rm' | 'fm';
export type ScheitLength = 25 | 33 | 50;
export type TankType = 'zylinder' | 'batterie' | 'kugel';
export type FuelId = 'pellets' | 'holz' | 'gas' | 'oel';

export interface WoodSpecies {
  readonly slug: string;
  readonly name: string;
  readonly fullName: string;
  readonly category: string;
  readonly kwhPerRm: number;
  readonly kgPerRm: number;
  readonly kwhPerKg: number;
  readonly kwhPerSrm33cm: number;
  readonly oilEqPerRm: number;
  readonly dryingYears: string;
  readonly sparkRisk: string;
  readonly stoveFit: string;
  readonly defaultPriceSrmEur: number;
  readonly defaultPriceSrmChf: number;
}

export interface OilTankPreset {
  readonly slug: string;
  readonly name: string;
  readonly shortName: string;
  readonly categoryLabel: string;
  readonly tankType: 'zylinder' | 'batterie';
  readonly nominalLiters: number;
  readonly diameterCm?: number;
  readonly lengthCm?: number;
  readonly tankCount?: number;
  readonly unitLengthCm?: number;
  readonly unitWidthCm?: number;
  readonly unitHeightCm?: number;
  readonly formFactor?: number;
  readonly defaultHeightCm: number;
  readonly dailyUsageL: number;
  readonly stepCm: number;
}

export interface FuelBenchmarkItem {
  readonly id: FuelId;
  readonly name: string;
  readonly shortName: string;
  readonly unit: string;
  readonly unitLabel: string;
  readonly hu: number;
  readonly huUnit: string;
  readonly defaultEfficiencyPct: number;
  readonly defaultPriceEur: number;
  readonly defaultPriceChf: number;
  readonly co2EmissionFactorKgPerUnit: number;
  readonly co2TaxPerUnitEur: number;
  readonly co2Note: string;
  readonly referenceSource: string;
}

export interface FuelBenchmarks2026 {
  readonly year: number;
  readonly updatedAt: string;
  readonly co2PricePerTonEur: number;
  readonly behgCorridorEurPerTon: readonly [number, number];
  readonly vatRateDe: number;
  readonly defaultAnnualDemandKwh: number;
  readonly referenceCalculator: string;
  readonly fuels: readonly FuelBenchmarkItem[];
}

export interface WoodVolumeConversion {
  srmFactor: number;
  rm: number;
  srm: number;
  fm: number;
}

export interface BrennholzInput {
  speciesSlug?: string;
  quantity?: number;
  unit?: WoodUnit;
  scheitLength?: ScheitLength;
  pricePerInputUnit?: number;
  stoveEfficiencyPct?: number;
  oilPricePerLiter?: number;
  trailerPayloadKg?: number;
  currency?: CurrencyCode;
}

export interface BrennholzResult {
  species: WoodSpecies;
  srmFactor: number;
  volumeRm: number;
  volumeSrm: number;
  volumeFm: number;
  totalPrice: number;
  realPricePerRm: number;
  realPricePerSrm: number;
  realPricePerFm: number;
  srmMarkupPct: number;
  totalKwh: number;
  usableKwh: number;
  oilEquivalentLiters: number;
  oilEquivalentCost: number;
  savingsVsOil: number;
  effectiveCentPerKwh: number;
  totalWeightKg: number;
  trailerTrips: number;
}

export interface OeltankInput {
  tankType?: TankType;
  diameterCm?: number;
  lengthCm?: number;
  tankCount?: number;
  unitLengthCm?: number;
  unitWidthCm?: number;
  unitHeightCm?: number;
  formFactor?: number;
  levelCm: number;
  dailyUsageL?: number;
  oilPricePerLiter?: number;
  currency?: CurrencyCode;
}

export interface OeltankResult {
  tankType: TankType;
  maxHeightCm: number;
  clampedLevelCm: number;
  maxLiters: number;
  restLiters: number;
  fillPct: number;
  linearIllusionPct: number;
  linearDiffLiters: number;
  daysLeft: number;
  weeksLeft: number;
  target90Liters: number;
  refill90Liters: number;
  refill90Cost: number;
  totraumLiters: number;
  statusKey: 'critical' | 'watch' | 'stable';
  statusLabel: string;
}

export interface PeiltabelleRow {
  heightCm: number;
  restLiters: number;
  fillPct: number;
  refill90Liters: number;
  isDefault: boolean;
}

export interface PeiltabelleOptions {
  oilPricePerLiter?: number;
  currency?: CurrencyCode;
}

export interface BehgSurchargeResult {
  co2PriceEurPerTon: number;
  vatRate: number;
  netEurPerUnit: number;
  grossEurPerUnit: number;
}

export interface BrennstoffInput {
  demandKwh?: number;
  currency?: CurrencyCode;
  prices?: Partial<Record<FuelId, number>>;
  efficiencies?: Partial<Record<FuelId, number>>;
}

export interface BrennstoffRowResult {
  id: FuelId;
  name: string;
  shortName: string;
  unit: string;
  unitLabel: string;
  hu: number;
  huUnit: string;
  pricePerUnit: number;
  efficiencyPct: number;
  centPerKwh: number;
  annualCost: number;
  annualFuelAmount: number;
  co2TaxPerUnitEur: number;
  annualCo2TaxEur: number;
  co2Note: string;
}

export interface BrennstoffResult {
  demandKwh: number;
  currency: CurrencyCode;
  rows: BrennstoffRowResult[];
  cheapest: BrennstoffRowResult;
  mostExpensive: BrennstoffRowResult;
  maxAnnualSavings: number;
  woodVsOilSavings: number;
}

export declare const SRM_FACTORS: Readonly<Record<ScheitLength, number>>;
export declare const FM_PER_RM: number;
export declare const HEIZOEL_KWH_PER_LITER: number;
export declare const BEHG_2026_CORRIDOR_EUR_PER_TON: Readonly<{ min: number; max: number }>;
export declare const BEHG_2026_CO2_PRICE_EUR_PER_TON: number;
export declare const DE_VAT_RATE: number;
export declare const WOOD_SPECIES: readonly WoodSpecies[];
export declare const OIL_TANKS: readonly OilTankPreset[];
export declare const FUEL_BENCHMARKS_2026: FuelBenchmarks2026;

export declare function clamp(val: number, min: number, max: number): number;
export declare function parseDeNumber(
  raw: string | number | null | undefined,
  fallback: number
): number;
export declare function getWoodBySlug(slug: string): WoodSpecies;
export declare function getOilTankBySlug(slug: string): OilTankPreset | undefined;
export declare function convertWoodVolume(
  quantity: number,
  fromUnit?: WoodUnit,
  scheitLength?: ScheitLength
): WoodVolumeConversion;
export declare function calcBrennholz(input?: BrennholzInput): BrennholzResult;
export declare function cylinderAreaCm2(diameterCm: number, heightCm: number): number;
export declare function cylinderVolumeLiters(
  diameterCm: number,
  lengthCm: number,
  heightCm: number
): number;
export declare function sphereCapLiters(diameterCm: number, heightCm: number): number;
export declare function rectTankLiters(
  unitLengthCm: number,
  unitWidthCm: number,
  heightCm: number,
  tankCount?: number,
  formFactor?: number
): number;
export declare function calcOeltank(input: OeltankInput): OeltankResult;
export declare function buildPeiltabelle(
  presetOrSlug: OilTankPreset | string,
  options?: PeiltabelleOptions
): PeiltabelleRow[];
export declare function calcBehgCo2Surcharge(
  emissionFactorKgPerUnit: number,
  co2PriceEurPerTon?: number,
  vatRate?: number
): BehgSurchargeResult;
export declare function calcBrennstoff(input?: BrennstoffInput): BrennstoffResult;
