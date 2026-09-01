import { FoodItem, PortionOption } from '../types';
import { FoodWithPortions } from './foodDbTypes';
import { FRUITS_DATABASE } from './foods/fruits';
import { PROTEINS_DATABASE } from './foods/proteins';
import { VEGETARIAN_VEGAN_DATABASE } from './foods/vegetarianVegan';
import { CARBS_GRAINS_DATABASE } from './foods/carbsGrains';
import { VEGGIES_DATABASE } from './foods/veggies';
import { DAIRY_DRINKS_OTHER_DATABASE } from './foods/dairyDrinksOther';
import { ESFIHAS_SALGADOS_DATABASE } from './foods/esfihasSalgados';
import { FAST_FOOD_PIZZAS_DATABASE } from './foods/fastFoodPizzas';
import { PREPARED_MEALS_PASTAS_DATABASE } from './foods/preparedMealsPastas';
import { VEGAN_MEAT_SUBSTITUTES_DATABASE } from './foods/veganMeatSubstitutes';
import { VEGAN_DAIRY_EGGS_DATABASE } from './foods/veganDairyEggs';
import { VEGAN_MEALS_SALGADOS_DATABASE } from './foods/veganMealsSalgados';
import { VEGAN_NATURAL_PROTEINS_PRODUCE_DATABASE } from './foods/veganNaturalProteinsProduce';
import { ALCOHOLIC_BEERS_WINES_SPIRITS_DATABASE } from './foods/alcoholicBeersWinesSpirits';
import { ALCOHOLIC_DRINKS_LIQUEURS_OTHERS_DATABASE } from './foods/alcoholicDrinksLiqueursOthers';
import { MEATS_POULTRY_SEAFOOD_DATABASE } from './foods/meatsPoultrySeafood';
import { TRADITIONAL_DISHES_DATABASE } from './foods/traditionalDishes';

export * from './foodDbTypes';

// Unified 100% verified TACO/TBCA food database
export const COMMON_FOOD_DATABASE: FoodWithPortions[] = [
  ...VEGETARIAN_VEGAN_DATABASE,
  ...VEGAN_MEAT_SUBSTITUTES_DATABASE,
  ...VEGAN_DAIRY_EGGS_DATABASE,
  ...VEGAN_MEALS_SALGADOS_DATABASE,
  ...VEGAN_NATURAL_PROTEINS_PRODUCE_DATABASE,
  ...FRUITS_DATABASE,
  ...PROTEINS_DATABASE,
  ...MEATS_POULTRY_SEAFOOD_DATABASE,
  ...TRADITIONAL_DISHES_DATABASE,
  ...CARBS_GRAINS_DATABASE,
  ...VEGGIES_DATABASE,
  ...DAIRY_DRINKS_OTHER_DATABASE,
  ...ALCOHOLIC_BEERS_WINES_SPIRITS_DATABASE,
  ...ALCOHOLIC_DRINKS_LIQUEURS_OTHERS_DATABASE,
  ...ESFIHAS_SALGADOS_DATABASE,
  ...FAST_FOOD_PIZZAS_DATABASE,
  ...PREPARED_MEALS_PASTAS_DATABASE,
];

/**
 * Calculates exact macronutrients based on food object or base values per 100g/100ml
 */
export function calculateMacrosFromGrams(
  foodOrCal: FoodItem | number,
  targetGramsOrProt: number,
  baseCarb?: number,
  baseFat?: number,
  baseFiber?: number,
  targetGramsParam?: number
) {
  let baseCal = 0;
  let baseProt = 0;
  let carb = 0;
  let fat = 0;
  let fiber = 0;
  let grams = 100;

  if (typeof foodOrCal === 'object' && foodOrCal !== null) {
    const food = foodOrCal;
    baseCal = food.baseCal ?? food.cal ?? 0;
    baseProt = food.baseProt ?? food.prot ?? 0;
    carb = food.baseCarb ?? food.carb ?? 0;
    fat = food.baseFat ?? food.fat ?? 0;
    fiber = food.baseFiber ?? food.fiber ?? 0;
    grams = targetGramsOrProt;
  } else {
    baseCal = Number(foodOrCal) || 0;
    baseProt = Number(targetGramsOrProt) || 0;
    carb = Number(baseCarb) || 0;
    fat = Number(baseFat) || 0;
    fiber = Number(baseFiber) || 0;
    grams = Number(targetGramsParam) || 100;
  }

  const factor = grams / 100;
  return {
    cal: Math.round(baseCal * factor),
    prot: Number((baseProt * factor).toFixed(1)),
    carb: Number((carb * factor).toFixed(1)),
    fat: Number((fat * factor).toFixed(1)),
    fiber: Number((fiber * factor).toFixed(1)),
  };
}

/**
 * Intelligent portion estimator for custom or matched foods
 */
export function getDefaultPortionsForFood(name: string, category?: string): PortionOption[] {
  const lower = name.toLowerCase();

  if (lower.includes('arroz') || lower.includes('quinoa') || lower.includes('cuscuz')) {
    return [
      { label: '1 colher de servir (~60g)', unitName: 'colher de servir', grams: 60, isDefault: true },
      { label: '1 colher de sopa (~25g)', unitName: 'colher de sopa', grams: 25 },
      { label: '1 concha média (~140g)', unitName: 'concha', grams: 140 },
      { label: '1 xícara (~150g)', unitName: 'xícara', grams: 150 },
      { label: '1 prato raso (~200g)', unitName: 'prato raso', grams: 200 },
    ];
  }
  if (lower.includes('feijão') || lower.includes('feijao') || lower.includes('lentilha') || lower.includes('grão de bico') || lower.includes('grao de bico') || lower.includes('soja') || lower.includes('pts')) {
    return [
      { label: '1 concha média (~130g)', unitName: 'concha', grams: 130, isDefault: true },
      { label: '1 concha cheia (~170g)', unitName: 'concha cheia', grams: 170 },
      { label: '1 colher de sopa (~30g)', unitName: 'colher de sopa', grams: 30 },
      { label: '1 xícara (~160g)', unitName: 'xícara', grams: 160 },
      { label: '4 colheres de sopa (~100g)', unitName: '4 colheres', grams: 100 },
    ];
  }
  if (lower.includes('tofu') || lower.includes('tempeh') || lower.includes('seitan')) {
    return [
      { label: '1 fatia / porção (~80g)', unitName: 'fatia', grams: 80, isDefault: true },
      { label: '1 porção média (~100g)', unitName: 'porção', grams: 100 },
      { label: '1 filé / bife vegetal (~120g)', unitName: 'filé vegetal', grams: 120 },
      { label: '1 xícara em cubos (~130g)', unitName: 'xícara', grams: 130 },
    ];
  }
  if (lower.includes('frango') || lower.includes('carne') || lower.includes('peixe') || lower.includes('bife') || lower.includes('filé') || lower.includes('file') || lower.includes('salmao') || lower.includes('tilapia')) {
    return [
      { label: '1 filé / bife médio (~120g)', unitName: 'filé médio', grams: 120, isDefault: true },
      { label: '1 porção média (~100g)', unitName: 'porção', grams: 100 },
      { label: '1 filé grande (~180g)', unitName: 'filé grande', grams: 180 },
      { label: '1 pedaço pequeno (~60g)', unitName: 'pedaço pequeno', grams: 60 },
      { label: '1 colher de sopa picado/desfiado (~25g)', unitName: 'colher de sopa', grams: 25 },
    ];
  }
  if (lower.includes('pizza')) {
    return [
      { label: '1 fatia (~100g)', unitName: 'fatia', grams: 100, isDefault: true },
      { label: '2 fatias (~200g)', unitName: 'fatias', grams: 200 },
      { label: '3 fatias (~300g)', unitName: 'fatias', grams: 300 },
      { label: '1 pizza inteira (~800g)', unitName: 'pizza inteira', grams: 800 },
    ];
  }
  if (lower.includes('ovo')) {
    return [
      { label: '1 unidade (~50g)', unitName: 'unidade', grams: 50, isDefault: true },
      { label: '2 unidades (~100g)', unitName: 'unidades', grams: 100 },
      { label: '3 unidades (~150g)', unitName: 'unidades', grams: 150 },
    ];
  }
  if (lower.includes('pão') || lower.includes('pao') || lower.includes('torrada')) {
    return [
      { label: '1 unidade / 2 fatias (~50g)', unitName: 'unidade', grams: 50, isDefault: true },
      { label: '1/2 unidade / 1 fatia (~25g)', unitName: 'metade', grams: 25 },
      { label: '2 unidades (~100g)', unitName: 'unidades', grams: 100 },
    ];
  }
  if (lower.includes('leite') || lower.includes('suco') || lower.includes('refrigerante') || lower.includes('agua') || lower.includes('água') || category === 'drink') {
    return [
      { label: '1 copo (~200ml)', unitName: 'copo', grams: 200, isDefault: true },
      { label: '1 xícara (~150ml)', unitName: 'xícara', grams: 150 },
      { label: '1 caneca (~300ml)', unitName: 'caneca', grams: 300 },
      { label: '1 lata (~350ml)', unitName: 'lata', grams: 350 },
    ];
  }
  if (lower.includes('azeite') || lower.includes('óleo') || lower.includes('oleo') || lower.includes('manteiga')) {
    return [
      { label: '1 colher de sopa (~12g)', unitName: 'colher de sopa', grams: 12, isDefault: true },
      { label: '1 colher de sobremesa (~8g)', unitName: 'colher de sobremesa', grams: 8 },
      { label: '1 colher de chá (~5g)', unitName: 'colher de chá', grams: 5 },
      { label: '1 fio (~3g)', unitName: 'fio', grams: 3 },
    ];
  }
  if (lower.includes('chia') || lower.includes('linhaça') || lower.includes('linhaca') || lower.includes('semente') || lower.includes('levedura') || lower.includes('whey')) {
    return [
      { label: '1 colher de sopa / scoop (~15g a 30g)', unitName: 'porção padrão', grams: 20, isDefault: true },
      { label: '1 colher de sobremesa (~10g)', unitName: 'colher de sobremesa', grams: 10 },
      { label: '2 colheres (~30g)', unitName: '2 colheres', grams: 30 },
    ];
  }

  // Generic fallback portions
  return [
    { label: '1 porção média (~100g)', unitName: 'porção', grams: 100, isDefault: true },
    { label: '1 colher de sopa (~25g)', unitName: 'colher de sopa', grams: 25 },
    { label: '1 xícara (~150g)', unitName: 'xícara', grams: 150 },
    { label: '1 unidade média (~100g)', unitName: 'unidade', grams: 100 },
  ];
}
