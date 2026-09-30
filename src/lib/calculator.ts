export type CalculationMode = "pizzas" | "harina";
export type PrefermentType = "poolish" | "biga";
export type PrefermentMode = "porcentaje" | "nominal";

export interface RecipeInput {
  modo: CalculationMode;
  pizzas: string;
  pesoBola: string;
  harinaBase: string;
  hidratacion: string;
  sal: string;
  aceite: string;
  azucar: string;
  levadura: string;
  usarPrefermento: boolean;
  tipoPrefermento: PrefermentType;
  prefermentoModo: PrefermentMode;
  prefermentoPorcentaje: string;
  prefermentoHarina: string;
}

export const defaultRecipe: RecipeInput = {
  modo: "pizzas",
  pizzas: "3",
  pesoBola: "250",
  harinaBase: "500",
  hidratacion: "65",
  sal: "2",
  aceite: "2",
  azucar: "1",
  levadura: "0.6",
  usarPrefermento: false,
  tipoPrefermento: "poolish",
  prefermentoModo: "porcentaje",
  prefermentoPorcentaje: "50",
  prefermentoHarina: "100",
};

export type RecipeErrors = Partial<Record<keyof RecipeInput, string>>;

export interface RecipeAmounts {
  masaTotal: number;
  harina: number;
  agua: number;
  salGr: number;
  aceiteGr: number;
  azucarGr: number;
  levaduraFresca: number;
  levaduraSeca: number;
  harinaPrefermento: number;
  aguaPrefermento: number;
  levaduraPrefermento: number;
  harinaFinal: number;
  aguaFinal: number;
}

type CalculationResult =
  | { amounts: RecipeAmounts; errors: RecipeErrors }
  | { amounts: null; errors: RecipeErrors };

// Keep the existing recipe convention: yeast is calculated separately from dough weight.
export function calculateRecipe(input: RecipeInput): CalculationResult {
  const errors: RecipeErrors = {};
  const positive = (field: "pizzas" | "pesoBola" | "harinaBase" | "prefermentoHarina", label: string) => {
    const value = Number(input[field]);
    if (input[field].trim() === "" || !Number.isFinite(value) || value <= 0) {
      errors[field] = `${label} debe ser mayor que cero.`;
    }
    return value;
  };
  const percentage = (
    field: "hidratacion" | "sal" | "aceite" | "azucar" | "levadura" | "prefermentoPorcentaje",
    label: string,
    min: number,
    max: number,
  ) => {
    const value = Number(input[field]);
    if (input[field].trim() === "" || !Number.isFinite(value) || value < min || value > max) {
      errors[field] = `${label} debe estar entre ${min} y ${max}%.`;
    }
    return value;
  };

  let requestedMass = 0;
  let baseFlour = 0;
  if (input.modo === "pizzas") {
    const pizzas = positive("pizzas", "La cantidad de pizzas");
    const ballWeight = positive("pesoBola", "El peso por bola");
    if (!errors.pizzas && !Number.isSafeInteger(pizzas)) {
      errors.pizzas = "Introduce un número entero de pizzas.";
    }
    requestedMass = pizzas * ballWeight;
    if (!errors.pizzas && !errors.pesoBola && !Number.isFinite(requestedMass)) {
      errors.pesoBola = "La cantidad es demasiado grande para calcularla.";
    }
  } else {
    baseFlour = positive("harinaBase", "La cantidad de harina");
  }

  const hydration = percentage("hidratacion", "La hidratación", 50, 80);
  const salt = percentage("sal", "La sal", 0, 5);
  const oil = percentage("aceite", "El aceite", 0, 5);
  const sugar = percentage("azucar", "El azúcar", 0, 5);
  const yeast = percentage("levadura", "La levadura", 0, 2);
  let prefermentAmount = 0;
  if (input.usarPrefermento) {
    prefermentAmount = input.prefermentoModo === "porcentaje"
      ? percentage("prefermentoPorcentaje", "El porcentaje de harina en prefermento", 10, 100)
      : positive("prefermentoHarina", "La harina del prefermento");
  }
  if (Object.keys(errors).length) return { amounts: null, errors };

  const factor = 1 + hydration / 100 + salt / 100 + oil / 100 + sugar / 100;
  const harina = input.modo === "harina" ? baseFlour : requestedMass / factor;
  const masaTotal = input.modo === "harina" ? harina * factor : requestedMass;
  if (!Number.isFinite(masaTotal)) {
    return { amounts: null, errors: { harinaBase: "La cantidad es demasiado grande para calcularla." } };
  }
  const agua = harina * (hydration / 100);
  const harinaPrefermento = !input.usarPrefermento ? 0 : input.prefermentoModo === "porcentaje"
    ? harina * (prefermentAmount / 100)
    : prefermentAmount;
  const aguaPrefermento = harinaPrefermento * (input.tipoPrefermento === "biga" ? 0.5 : 1);
  const prefermentField = input.prefermentoModo === "porcentaje" ? "prefermentoPorcentaje" : "prefermentoHarina";
  // Tolerate floating-point noise at the exact boundary, but never show negative remainders.
  const tolerance = Math.max(harina, agua) * Number.EPSILON * 4;
  if (harinaPrefermento - harina > tolerance) {
    errors[prefermentField] = "La harina del prefermento no puede superar la harina total.";
  } else if (aguaPrefermento - agua > tolerance) {
    const maxFlour = agua / (input.tipoPrefermento === "biga" ? 0.5 : 1);
    const usableLimit = (value: number) => {
      const rounded = Number(value.toFixed(2));
      const down = rounded > value ? Number((rounded - 0.01).toFixed(2)) : rounded;
      return down > 0 ? down : value;
    };
    const limit = input.prefermentoModo === "porcentaje"
      ? `${usableLimit(maxFlour / harina * 100)}%`
      : `${usableLimit(maxFlour)} g`;
    errors[prefermentField] = `El ${input.tipoPrefermento} supera el agua disponible. Reduce la harina del prefermento a ${limit} o menos.`;
  }
  if (Object.keys(errors).length) return { amounts: null, errors };

  const levaduraFresca = harina * (yeast / 100);
  return {
    errors,
    amounts: {
      masaTotal, harina, agua,
      salGr: Math.round(harina * (salt / 100)),
      aceiteGr: Math.round(harina * (oil / 100)),
      azucarGr: Math.round(harina * (sugar / 100)),
      levaduraFresca,
      levaduraSeca: levaduraFresca / 3,
      harinaPrefermento,
      aguaPrefermento,
      levaduraPrefermento: harinaPrefermento * 0.002,
      harinaFinal: Math.max(0, harina - harinaPrefermento),
      aguaFinal: Math.max(0, agua - aguaPrefermento),
    },
  };
}
