import { FoodItem } from '../types';
import { COMMON_FOOD_DATABASE, calculateMacrosFromGrams, getDefaultPortionsForFood } from '../data/portionFoodDB';

export interface ParsedItem {
  id: string;
  name: string;
  originalText: string;
  amount: number;
  unit: string;
  grams: number;
  cal: number;
  prot: number;
  carb: number;
  fat: number;
  icon: string;
  confidence: 'high' | 'medium' | 'low';
  foodItem: FoodItem;
}

export interface ParseResult {
  items: ParsedItem[];
  totalCal: number;
  totalProt: number;
  totalCarb: number;
  totalFat: number;
  unrecognizedText?: string[];
}

const NUMBER_WORDS: Record<string, number> = {
  'um': 1,
  'uma': 1,
  'dois': 2,
  'duas': 2,
  'tres': 3,
  'três': 3,
  'quatro': 4,
  'cinco': 5,
  'seis': 6,
  'meio': 0.5,
  'meia': 0.5,
  '1/2': 0.5,
};

export function parseNaturalFoodText(text: string): ParseResult {
  if (!text || !text.trim()) {
    return { items: [], totalCal: 0, totalProt: 0, totalCarb: 0, totalFat: 0 };
  }

  // Normalize text
  let cleaned = text
    .toLowerCase()
    .replace(/[,\.;\+]/g, ' e ')
    .replace(/\bcomi\b|\bcomemos\b|\bbebi\b|\btomei\b|\bconsumi\b|\bcoloquei\b|\bmais\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Split by " e "
  const clauses = cleaned.split(/\be\b/).map(c => c.trim()).filter(Boolean);

  const parsedItems: ParsedItem[] = [];
  const unrecognized: string[] = [];

  clauses.forEach((clause) => {
    // Check if clause matches any food
    const matched = extractFoodFromClause(clause);
    if (matched) {
      parsedItems.push(matched);
    } else if (clause.length > 2) {
      unrecognized.push(clause);
    }
  });

  const totalCal = parsedItems.reduce((sum, item) => sum + item.cal, 0);
  const totalProt = Number(parsedItems.reduce((sum, item) => sum + item.prot, 0).toFixed(1));
  const totalCarb = Number(parsedItems.reduce((sum, item) => sum + item.carb, 0).toFixed(1));
  const totalFat = Number(parsedItems.reduce((sum, item) => sum + item.fat, 0).toFixed(1));

  return {
    items: parsedItems,
    totalCal,
    totalProt,
    totalCarb,
    totalFat,
    unrecognizedText: unrecognized.length > 0 ? unrecognized : undefined,
  };
}

function extractFoodFromClause(clause: string): ParsedItem | null {
  const words = clause.split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;

  // Find best food match from COMMON_FOOD_DATABASE
  let bestFood = COMMON_FOOD_DATABASE.find(f => {
    const fName = f.name.toLowerCase();
    if (clause.includes(fName)) return true;
    if (f.aliases?.some(a => clause.includes(a.toLowerCase()))) return true;
    return false;
  });

  // If not found, fuzzy match with partial words
  if (!bestFood) {
    bestFood = COMMON_FOOD_DATABASE.find(f => {
      const parts = f.name.toLowerCase().split(' ');
      return parts.some(p => p.length > 3 && clause.includes(p));
    });
  }

  if (!bestFood) return null;

  // Extract amount (number or word)
  let amount = 1;
  let unit = 'porção';
  let grams = 100;

  // Check for explicit grams like "150g", "200 g", "350ml"
  const gramMatch = clause.match(/(\d+[\.,]?\d*)\s*(g|gr|gramas|ml|mililitros)\b/);
  if (gramMatch) {
    amount = parseFloat(gramMatch[1].replace(',', '.'));
    grams = amount;
    unit = gramMatch[2].startsWith('m') ? 'ml' : 'g';
  } else {
    // Check for number words or digits
    const numMatch = clause.match(/\b(\d+[\.,]?\d*)\b/);
    if (numMatch) {
      amount = parseFloat(numMatch[1].replace(',', '.'));
    } else {
      for (const [word, val] of Object.entries(NUMBER_WORDS)) {
        if (new RegExp(`\\b${word}\\b`).test(clause)) {
          amount = val;
          break;
        }
      }
    }

    // Check for units in portions
    const portions = bestFood.portions || getDefaultPortionsForFood(bestFood.name);
    let matchedPortion = portions.find(p => {
      const uName = p.unitName.toLowerCase();
      return clause.includes(uName) || clause.includes(uName + 's');
    });

    if (!matchedPortion) {
      // Check common unit words
      if (clause.includes('fatia') || clause.includes('fatias')) {
        matchedPortion = portions.find(p => p.unitName.includes('fatia')) || { label: '1 fatia', unitName: 'fatias', grams: 100 };
      } else if (clause.includes('lata') || clause.includes('latas')) {
        matchedPortion = portions.find(p => p.unitName.includes('lata')) || { label: '1 lata', unitName: 'lata', grams: 350 };
      } else if (clause.includes('colher') || clause.includes('colheres')) {
        matchedPortion = portions.find(p => p.unitName.includes('colher')) || { label: '1 colher', unitName: 'colher', grams: 25 };
      } else if (clause.includes('concha') || clause.includes('conchas')) {
        matchedPortion = portions.find(p => p.unitName.includes('concha')) || { label: '1 concha', unitName: 'concha', grams: 130 };
      } else if (clause.includes('copo') || clause.includes('copos')) {
        matchedPortion = portions.find(p => p.unitName.includes('copo')) || { label: '1 copo', unitName: 'copo', grams: 200 };
      } else if (clause.includes('xicara') || clause.includes('xícara') || clause.includes('xícaras')) {
        matchedPortion = portions.find(p => p.unitName.includes('xícara')) || { label: '1 xícara', unitName: 'xícara', grams: 150 };
      } else if (clause.includes('unidade') || clause.includes('unidades')) {
        matchedPortion = portions.find(p => p.unitName.includes('unidade')) || { label: '1 unidade', unitName: 'unidade', grams: 100 };
      } else {
        matchedPortion = portions.find(p => p.isDefault) || portions[0];
      }
    }

    if (matchedPortion) {
      grams = matchedPortion.grams * amount;
      unit = amount > 1 ? `${matchedPortion.unitName}` : matchedPortion.unitName;
    } else {
      grams = 100 * amount;
    }
  }

  const calculated = calculateMacrosFromGrams(bestFood, grams);

  return {
    id: `${bestFood.id}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    name: bestFood.name,
    originalText: clause,
    amount,
    unit,
    grams: Math.round(grams),
    cal: calculated.cal,
    prot: calculated.prot,
    carb: calculated.carb,
    fat: calculated.fat,
    icon: bestFood.icon || '🍽️',
    confidence: 'high',
    foodItem: {
      id: bestFood.id,
      name: bestFood.name,
      cal: calculated.cal,
      prot: calculated.prot,
      carb: calculated.carb,
      fat: calculated.fat,
      fiber: calculated.fiber,
      portion: `${amount} ${unit} (${Math.round(grams)}${bestFood.isLiquid ? 'ml' : 'g'})`,
      selectedWeight: Math.round(grams),
      selectedUnit: unit,
      category: bestFood.category,
      baseCal: bestFood.baseCal,
      baseProt: bestFood.baseProt,
      baseCarb: bestFood.baseCarb,
      baseFat: bestFood.baseFat,
      baseFiber: bestFood.baseFiber,
    }
  };
}
