import { NutritionGoals, UserProfile } from '../types';

export function formatCPF(value: string): string {
  let v = value.replace(/\D/g, '');
  if (v.length > 11) v = v.substring(0, 11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return v;
}

export function cleanCPF(value: string): string {
  return value.replace(/\D/g, '');
}

export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; status: string; pct: number } {
  if (!weightKg || !heightCm || heightCm <= 0) {
    return { bmi: 0, status: '--', pct: 0 };
  }
  const hM = heightCm / 100;
  const bmi = Number((weightKg / (hM * hM)).toFixed(1));

  let status = 'Normal';
  let pct = 35;

  if (bmi < 18.5) {
    status = 'Magreza';
    pct = Math.max(5, Math.min(20, (bmi / 18.5) * 20));
  } else if (bmi < 25) {
    status = 'Peso Normal';
    pct = 20 + ((bmi - 18.5) / 6.5) * 30; // 20% to 50%
  } else if (bmi < 30) {
    status = 'Sobrepeso';
    pct = 50 + ((bmi - 25) / 5) * 25; // 50% to 75%
  } else {
    status = 'Obesidade';
    pct = Math.min(95, 75 + ((bmi - 30) / 10) * 20); // 75% to 95%
  }

  return { bmi, status, pct };
}

export function calculateCalculatedGoals(user: Partial<UserProfile>): NutritionGoals {
  const weight = parseFloat(String(user.weight || 70)) || 70;
  const height = parseFloat(String(user.height || 170)) || 170;
  let age = 28;

  if (user.dob) {
    const birthYear = new Date(user.dob).getFullYear();
    const currentYear = new Date().getFullYear();
    if (!isNaN(birthYear) && birthYear > 1900 && birthYear < currentYear) {
      age = currentYear - birthYear;
    }
  }

  const isMale = user.gender?.toLowerCase().includes('homem') ?? true;

  // Harris-Benedict revised / Mifflin-St Jeor equation:
  let bmr = (10 * weight) + (6.25 * height) - (5 * age) + (isMale ? 5 : -161);
  if (bmr < 1200) bmr = 1400;

  // Activity multipliers
  const act = (user.activity || '').toLowerCase();
  let actMultiplier = 1.375; // Leve
  if (act.includes('sedent')) actMultiplier = 1.2;
  else if (act.includes('mode')) actMultiplier = 1.55;
  else if (act.includes('muito')) actMultiplier = 1.9;
  else if (act.includes('inten')) actMultiplier = 1.725;

  const tdee = bmr * actMultiplier;

  // Objective adjustment
  const obj = (user.objective || '').toLowerCase();
  let targetCalories = Math.round(tdee - 450); // Emagrecer: 400-500 kcal deficit
  let proteinRatio = 1.9;

  if (obj.includes('manter')) {
    targetCalories = Math.round(tdee);
    proteinRatio = 1.8;
  } else if (obj.includes('ganhar') || obj.includes('massa') || obj.includes('hipertrofia')) {
    targetCalories = Math.round(tdee + 350);
    proteinRatio = 2.0;
  } else if (obj.includes('recomposi') || obj.includes('recomp')) {
    // Recomposição corporal: leve déficit / eucalórico com alta proteína
    targetCalories = Math.round(tdee - 200);
    proteinRatio = 2.2;
  }

  // Safety floor
  if (targetCalories < 1200) targetCalories = 1350;

  // Macronutrient breakdown
  // Protein: based on weight and goal
  const proteinGrams = Math.round(Math.min(weight * proteinRatio, targetCalories * 0.40 / 4));
  // Fat: ~25% of calories
  const fatGrams = Math.round((targetCalories * 0.25) / 9);
  // Carbs: rest of calories
  const remainingCalForCarbs = targetCalories - (proteinGrams * 4) - (fatGrams * 9);
  const carbGrams = Math.max(50, Math.round(remainingCalForCarbs / 4));

  // Water: 35ml per kg
  const waterLiters = Number(Math.max(2.0, (weight * 35) / 1000).toFixed(1));

  return {
    calories: targetCalories,
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams,
    water: waterLiters
  };
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function getFormattedDate(): string {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}
