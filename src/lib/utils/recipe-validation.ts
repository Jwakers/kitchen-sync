import { PREPARATION_OPTIONS, UNITS_FLAT } from "convex/lib/constants";

// Unit mapping for common variations and plural forms
export const UNIT_MAP: Record<string, (typeof UNITS_FLAT)[number]> = {
  // Volume
  cup: "cups",
  teaspoon: "tsp",
  teaspoons: "tsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  "fluid ounce": "fl oz",
  "fluid ounces": "fl oz",
  gallon: "gal",
  gallons: "gal",
  milliliter: "ml",
  milliliters: "ml",
  millilitre: "ml",
  millilitres: "ml",
  liter: "l",
  liters: "l",
  litre: "l",
  litres: "l",
  pint: "pt",
  pints: "pt",
  quart: "qt",
  quarts: "qt",
  // Weight
  pound: "lbs",
  pounds: "lbs",
  lb: "lbs",
  ounce: "oz",
  ounces: "oz",
  gram: "g",
  grams: "g",
  gramme: "g",
  grammes: "g",
  kilogram: "kg",
  kilograms: "kg",
  kilogramme: "kg",
  kilogrammes: "kg",
  milligram: "mg",
  milligrams: "mg",
  // Count
  pinches: "pinch",
  dashes: "dash",
  handfuls: "handful",
  drops: "drop",
  // Abstract/Items
  pieces: "piece",
  pcs: "piece",
  pc: "piece",
  cloves: "clove",
  slices: "slice",
  sheets: "sheet",
  sprigs: "sprig",
  stalks: "stalk",
  stems: "stem",
  heads: "head",
  bunches: "bunch",
  bulbs: "bulb",
  wedges: "wedge",
  cubes: "cube",
  strips: "strip",
  fillets: "fillet",
  leaves: "leaf",
  cans: "can",
  jars: "jar",
  packets: "packet",
  pkts: "packet",
  packages: "package",
  pkgs: "package",
  containers: "container",
  bottles: "bottle",
  bags: "bag",
  boxes: "box",
  loaves: "loaf",
  sticks: "stick",
  squares: "square",
  rounds: "round",
  breasts: "breast",
  thighs: "thigh",
  legs: "leg",
  racks: "rack",
};

// Preparation mapping for common variations
export const PREPARATION_MAP: Record<
  string,
  (typeof PREPARATION_OPTIONS)[number]
> = {
  chop: "chopped",
  "finely chop": "finely chopped",
  "roughly chop": "roughly chopped",
  dice: "diced",
  "finely dice": "finely diced",
  slice: "sliced",
  "thinly slice": "thinly sliced",
  "thickly slice": "thickly sliced",
  julienne: "julienned",
  mince: "minced",
  grate: "grated",
  "finely grate": "finely grated",
  shred: "shredded",
  cube: "cubed",
  quarter: "quartered",
  halve: "halved",
  crush: "crushed",
  mash: "mashed",
  puree: "pureed",
  beat: "beaten",
  whip: "whipped",
  fold: "folded",
  knead: "kneaded",
  roll: "rolled",
  press: "pressed",
  strain: "strained",
  drain: "drained",
  rinse: "rinsed",
  peel: "peeled",
  trim: "trimmed",
  seed: "seeded",
  core: "cored",
  stem: "stemmed",
  zest: "zested",
  debone: "de-boned",
  "de-bone": "de-boned",
  fillet: "filleted",
  butterfly: "butterflied",
  blanch: "blanched",
  toast: "toasted",
  roast: "roasted",
  caramelize: "caramelized",
  caramelise: "caramelized",
  sauté: "sautéed",
  saute: "sautéed",
  fry: "fried",
  poach: "poached",
  grill: "grilled",
  boil: "boiled",
  steam: "steamed",
  smoke: "smoked",
  freeze: "frozen",
  defrost: "defrosted",
  thaw: "defrosted",
};

/**
 * Validates and maps a unit string to its canonical form
 * @param unit - The unit string to validate
 * @returns The canonical unit value, or undefined if invalid
 */
export function validateUnit(
  unit?: string
): (typeof UNITS_FLAT)[number] | undefined {
  if (!unit) return undefined;

  const normalized = unit.toLowerCase().trim();

  // Direct match
  if ((UNITS_FLAT as readonly string[]).includes(normalized)) {
    return normalized as (typeof UNITS_FLAT)[number];
  }

  // Check mapping
  return UNIT_MAP[normalized];
}

/**
 * Validates and maps a preparation string to its canonical form
 * @param prep - The preparation string to validate
 * @returns The canonical preparation value, or undefined if invalid
 */
export function validatePreparation(
  prep?: string
): (typeof PREPARATION_OPTIONS)[number] | undefined {
  if (!prep) return undefined;

  const normalized = prep.toLowerCase().trim();

  // Direct match
  if ((PREPARATION_OPTIONS as readonly string[]).includes(normalized)) {
    return normalized as (typeof PREPARATION_OPTIONS)[number];
  }

  // Check mapping
  return PREPARATION_MAP[normalized];
}
