export type ScreenType = 'login' | 'register' | 'dashboard' | 'food' | 'assistant' | 'progress' | 'profile' | 'terms';

export type ActivityLevel = 'Sedentario' | 'Leve' | 'Moderado' | 'Intenso' | 'Muito intenso';
export type ObjectiveType = 
  | 'Emagrecer' 
  | 'Ganhar massa muscular' 
  | 'Manter o peso' 
  | 'Recomposição corporal'
  | 'Ganhar massa'
  | 'Manter peso';

export type GenderType = 
  | 'Homem cis' 
  | 'Mulher cis' 
  | 'Homem trans' 
  | 'Mulher trans' 
  | 'Nao binario' 
  | 'Agenero' 
  | 'Outro' 
  | 'Prefiro nao informar';

export interface UserProfile {
  name: string;
  cpf: string;
  dob: string;
  gender: string;
  height: string | number;
  weight: string | number;
  goalWeight: string | number;
  activity: string;
  objective: string;
  photo?: string;
  createdAt?: string;
}

export interface SmartMealSuggestion {
  id: string;
  title: string;
  description: string;
  tag: string;
  targetMealKey: MealKey;
  totalCal: number;
  totalProt: number;
  totalCarb: number;
  totalFat: number;
  items: {
    foodItem: FoodItem;
    portionDescription: string;
    grams: number;
    cal: number;
    prot: number;
  }[];
}

export interface AssistantAlert {
  id: string;
  type: 'protein' | 'water' | 'calories_low' | 'calories_high' | 'meal_missing' | 'goal_near' | 'goal_reached' | 'tip';
  title: string;
  message: string;
  severity: 'warning' | 'info' | 'success' | 'alert';
  actionLabel?: string;
  suggestedAction?: 'open_meal_add' | 'add_water' | 'suggest_meal' | 'custom';
  targetMealKey?: MealKey;
}

export interface AssistantChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: number;
  suggestion?: SmartMealSuggestion;
  quickQuestions?: string[];
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

export interface PortionOption {
  label: string;
  unitName: string;
  grams: number;
  isDefault?: boolean;
}

export interface FoodItem {
  id?: string;
  name: string;
  cal: number;
  prot: number;
  carb: number;
  fat: number;
  fiber?: number;
  sodium?: number;
  icon?: string;
  portion?: string;
  preparation?: string;
  category?: 'food' | 'fruit' | 'protein' | 'carb' | 'veggie' | 'drink' | 'custom' | string;
  baseCal?: number;
  baseProt?: number;
  baseCarb?: number;
  baseFat?: number;
  baseFiber?: number;
  baseGrams?: number;
  selectedWeight?: number;
  selectedUnit?: string;
  portions?: PortionOption[];
}

export type MealKey = 'breakfast' | 'morningSnack' | 'lunch' | 'snack' | 'dinner' | 'supper';

export interface MealEntry extends FoodItem {
  timestamp?: number;
  quantity?: number;
}

export interface MealsState {
  breakfast: MealEntry[];
  morningSnack: MealEntry[];
  lunch: MealEntry[];
  snack: MealEntry[];
  dinner: MealEntry[];
  supper: MealEntry[];
}

export interface DayStats {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

export interface WeightRecord {
  date: string;
  weight: number;
  label: string;
}

export interface DeficitRecord {
  day: string;
  label: string;
  deficit: number;
  calories: number;
  goal: number;
}
