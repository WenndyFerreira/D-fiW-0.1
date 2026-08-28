import { DayStats, FoodItem, MealKey, MealsState, NutritionGoals, SmartMealSuggestion, AssistantAlert, UserProfile } from '../types';
import { COMMON_FOOD_DATABASE, calculateMacrosFromGrams } from '../data/portionFoodDB';
import { FoodWithPortions } from '../data/foodDbTypes';

export interface ObjectiveInfo {
  title: string;
  emoji: string;
  focusText: string;
  tips: string[];
}

export function getObjectiveInfo(objective: string = ''): ObjectiveInfo {
  const obj = objective.toLowerCase();
  if (obj.includes('ganhar') || obj.includes('massa') || obj.includes('hipertrofia')) {
    return {
      title: 'Ganhar massa muscular',
      emoji: '💪',
      focusText: 'Superávit calórico controlado + alta ingestão de proteínas e energia para treinos intensos.',
      tips: [
        'Distribua a proteína em 4 a 5 refeições ao longo do dia.',
        'Não pule carboidratos ao redor dos treinos para garantir glicogênio.',
        'Mantenha a hidratação alta para melhor síntese proteica.',
      ],
    };
  }
  if (obj.includes('recomposi') || obj.includes('recomp')) {
    return {
      title: 'Recomposição corporal',
      emoji: '🎯',
      focusText: 'Alta proteína (~2.0-2.2g/kg) + leve déficit calórico para perder gordura e construir massa magra.',
      tips: [
        'Priorize fontes magras de proteína em todas as refeições.',
        'Mantenha o treino de força consistente com progressão de carga.',
        'Monitore medidas e espelho, além do peso na balança.',
      ],
    };
  }
  if (obj.includes('manter')) {
    return {
      title: 'Manter o peso',
      emoji: '⚖️',
      focusText: 'Equilíbrio calórico diário + manutenção de massa magra e hábitos saudáveis.',
      tips: [
        'Mantenha a regularidade nos horários das refeições.',
        'Beba água constantemente ao longo do dia.',
        'Varie os alimentos para obter todos os micronutrientes.',
      ],
    };
  }
  // Default: Emagrecer
  return {
    title: 'Emagrecer',
    emoji: '🔥',
    focusText: 'Déficit calórico estratégico + alta ingestão proteica para preservar massa magra e controlar o apetite.',
    tips: [
      'Priorize proteínas magras e fibras para aumentar a saciedade.',
      'Beba bastante água antes das refeições principais.',
      'Evite calorias líquidas (refrigerantes comuns, sucos adoçados).',
    ],
  };
}

export interface AssistantDailyOverview {
  greeting: string;
  firstName: string;
  objectiveInfo: ObjectiveInfo;
  remainingCal: number;
  remainingProt: number;
  remainingCarb: number;
  remainingFat: number;
  remainingWater: number;
  calPercent: number;
  protPercent: number;
  waterPercent: number;
  recommendationTitle: string;
  recommendationMessage: string;
  alerts: AssistantAlert[];
  smartMealSuggestion: SmartMealSuggestion;
}

export function getAssistantDailyAnalysis(
  user: UserProfile,
  goals: NutritionGoals,
  stats: DayStats,
  meals: MealsState
): AssistantDailyOverview {
  const firstName = user.name ? user.name.split(' ')[0] : 'Atleta';
  const now = new Date();
  const currentHour = now.getHours();

  let greeting = 'Boa noite';
  if (currentHour >= 5 && currentHour < 12) greeting = 'Bom dia';
  else if (currentHour >= 12 && currentHour < 18) greeting = 'Boa tarde';

  const objectiveInfo = getObjectiveInfo(user.objective);

  const remainingCal = Math.max(0, goals.calories - stats.calories);
  const remainingProt = Math.max(0, goals.protein - stats.protein);
  const remainingCarb = Math.max(0, goals.carbs - stats.carbs);
  const remainingFat = Math.max(0, goals.fat - stats.fat);
  const remainingWater = Math.max(0, Number((goals.water - stats.water).toFixed(1)));

  const calPercent = Math.min(Math.round((stats.calories / goals.calories) * 100), 100);
  const protPercent = Math.min(Math.round((stats.protein / goals.protein) * 100), 100);
  const waterPercent = Math.min(Math.round((stats.water / goals.water) * 100), 100);

  // Meals count
  const breakfastItems = meals.breakfast || [];
  const morningSnackItems = meals.morningSnack || [];
  const lunchItems = meals.lunch || [];
  const snackItems = meals.snack || [];
  const dinnerItems = meals.dinner || [];
  const supperItems = meals.supper || [];

  const alerts: AssistantAlert[] = [];

  // 1. Alert: Meal missing according to hour
  if (currentHour >= 9 && currentHour < 12 && breakfastItems.length === 0) {
    alerts.push({
      id: 'missing-breakfast',
      type: 'meal_missing',
      title: 'Café da manhã não registrado',
      message: 'Você ainda não registrou seu café da manhã. Se já comeu, registre para manter seu acompanhamento em dia!',
      severity: 'info',
      actionLabel: 'Registrar café da manhã',
      suggestedAction: 'open_meal_add',
      targetMealKey: 'breakfast',
    });
  } else if (currentHour >= 13 && currentHour < 16 && lunchItems.length === 0) {
    alerts.push({
      id: 'missing-lunch',
      type: 'meal_missing',
      title: 'Almoço pendente',
      message: 'Você ainda não registrou seu almoço. Registrar suas refeições evita surpresas no balanço do dia.',
      severity: 'info',
      actionLabel: 'Registrar almoço',
      suggestedAction: 'open_meal_add',
      targetMealKey: 'lunch',
    });
  } else if (currentHour >= 20 && dinnerItems.length === 0 && remainingCal > 200) {
    alerts.push({
      id: 'missing-dinner',
      type: 'meal_missing',
      title: 'Jantar não registrado',
      message: `Você possui aproximadamente ${remainingCal} kcal restantes para o jantar.`,
      severity: 'info',
      actionLabel: 'Registrar jantar',
      suggestedAction: 'open_meal_add',
      targetMealKey: 'dinner',
    });
  }

  // 2. Alert: Protein pacing
  if (currentHour >= 14 && stats.protein < goals.protein * 0.4 && remainingProt > 40) {
    alerts.push({
      id: 'protein-low-pacing',
      type: 'protein',
      title: 'Proteína abaixo do ritmo',
      message: `Até agora você consumiu ${Math.round(stats.protein)}g de proteína (meta: ${goals.protein}g). Faltam ${Math.round(remainingProt)}g.`,
      severity: 'warning',
      actionLabel: 'Ver opções proteicas',
      suggestedAction: 'suggest_meal',
    });
  } else if (remainingProt > 0 && remainingProt <= 20) {
    alerts.push({
      id: 'protein-near-goal',
      type: 'goal_near',
      title: 'Meta de proteína quase lá!',
      message: `Faltam apenas ${Math.round(remainingProt)}g de proteína para bater sua meta de ${goals.protein}g hoje! 💪`,
      severity: 'success',
      actionLabel: 'Montar lanche proteico',
      suggestedAction: 'suggest_meal',
    });
  } else if (stats.protein >= goals.protein) {
    alerts.push({
      id: 'protein-achieved',
      type: 'goal_reached',
      title: 'Meta de proteína atingida! 🎯',
      message: `Excelente trabalho! Você alcançou os ${goals.protein}g de proteína planejados para hoje.`,
      severity: 'success',
    });
  }

  // 3. Alert: Water hydration pacing
  const hoursLeftInDay = Math.max(1, 23 - currentHour);
  const expectedWaterFraction = Math.min(1, Math.max(0.2, (currentHour - 7) / 15));
  const expectedWaterLiters = goals.water * expectedWaterFraction;

  if (stats.water < expectedWaterLiters - 0.4 && remainingWater > 0.5) {
    alerts.push({
      id: 'water-low-pacing',
      type: 'water',
      title: 'Ritmo de hidratação baixo',
      message: `Faltam ${remainingWater.toFixed(1).replace('.', ',')} L para sua meta de ${goals.water.toFixed(1).replace('.', ',')} L e restam cerca de ${hoursLeftInDay}h no seu dia. Tente beber um copo agora!`,
      severity: 'warning',
      actionLabel: '+300ml de água',
      suggestedAction: 'add_water',
    });
  } else if (stats.water >= goals.water) {
    alerts.push({
      id: 'water-achieved',
      type: 'goal_reached',
      title: 'Meta de água conquistada! 💧',
      message: `Parabéns! Você já bebeu ${stats.water.toFixed(1).replace('.', ',')} L de água hoje.`,
      severity: 'success',
    });
  }

  // 4. Alert: Calories too low late in the day
  if (currentHour >= 18 && stats.calories < goals.calories * 0.45 && remainingCal > 700) {
    alerts.push({
      id: 'cal-too-low',
      type: 'calories_low',
      title: 'Consumo calórico muito baixo hoje',
      message: `Você consumiu apenas ${stats.calories} kcal de ${goals.calories} kcal. Restrições muito severas prejudicam o metabolismo e o ganho de massa.`,
      severity: 'warning',
      actionLabel: 'Sugerir refeição nutritiva',
      suggestedAction: 'suggest_meal',
    });
  }

  // Generate dynamic recommendation text
  let recommendationTitle = 'Minha recomendação para agora';
  let recommendationMessage = '';

  if (currentHour < 11) {
    if (breakfastItems.length === 0) {
      recommendationMessage = `Comece o dia priorizando proteína e fibras para manter a saciedade. Sua meta hoje é ${goals.calories} kcal e ${goals.protein}g de proteína. Uma combinação de ovos, pão integral e fruta é excelente!`;
    } else {
      recommendationMessage = `Café da manhã registrado! Você tem ${remainingCal} kcal restantes no dia. Mantenha uma garrafinha de água por perto.`;
    }
  } else if (currentHour >= 11 && currentHour < 15) {
    if (lunchItems.length === 0) {
      recommendationMessage = `Para o almoço, monte um prato colorido com uma boa porção de proteína magra (frango, carne magra, ovos ou peixe) e carboidratos de digestão lenta (arroz, feijão, batata). Faltam ${Math.round(remainingProt)}g de proteína no seu dia.`;
    } else {
      recommendationMessage = `Almoço concluído com sucesso. Você ainda tem ${remainingCal} kcal e ${Math.round(remainingProt)}g de proteína disponíveis para a tarde e noite.`;
    }
  } else if (currentHour >= 15 && currentHour < 19) {
    if (remainingProt > 35) {
      recommendationMessage = `Ainda restam ${Math.round(remainingProt)}g de proteína e ${remainingCal} kcal. Um lanche proteico da tarde (iogurte com whey, sanduíche de atum ou ovos) vai facilitar atingir a meta no jantar sem estourar as calorias.`;
    } else {
      recommendationMessage = `Seu ritmo de proteína está ótimo hoje! Você tem ${remainingCal} kcal restantes. Mantenha o foco na hidratação.`;
    }
  } else {
    // Night
    if (remainingCal <= 100 && remainingProt <= 15) {
      recommendationMessage = `Excelente dia! Você praticamente fechou suas calorias (${stats.calories}/${goals.calories} kcal) e bateu a proteína. Agora descanse e beba mais um pouco de água se necessário.`;
    } else if (remainingCal > 150 && remainingProt > 20) {
      recommendationMessage = `Vamos fechar seu dia: você possui aproximadamente ${remainingCal} kcal restantes e ainda precisa de ${Math.round(remainingProt)}g de proteína. Uma refeição leve com frango ou ovos + legumes é a escolha ideal.`;
    } else {
      recommendationMessage = `Você tem ${remainingCal} kcal disponíveis para a ceia/jantar. Priorize alimentos leves para garantir um bom sono.`;
    }
  }

  // Generate Smart Meal Suggestion tailored to remaining macros
  const smartMealSuggestion = generateSmartMealSuggestion(goals, stats, meals, user);

  return {
    greeting,
    firstName,
    objectiveInfo,
    remainingCal,
    remainingProt,
    remainingCarb,
    remainingFat,
    remainingWater,
    calPercent,
    protPercent,
    waterPercent,
    recommendationTitle,
    recommendationMessage,
    alerts,
    smartMealSuggestion,
  };
}

export function generateSmartMealSuggestion(
  goals: NutritionGoals,
  stats: DayStats,
  meals: MealsState,
  user: UserProfile
): SmartMealSuggestion {
  const remainingCal = Math.max(50, goals.calories - stats.calories);
  const remainingProt = Math.max(5, goals.protein - stats.protein);
  const now = new Date();
  const currentHour = now.getHours();

  let targetMealKey: MealKey = 'lunch';
  if (currentHour < 11) targetMealKey = 'breakfast';
  else if (currentHour < 15) targetMealKey = 'lunch';
  else if (currentHour < 18) targetMealKey = 'snack';
  else if (currentHour < 21) targetMealKey = 'dinner';
  else targetMealKey = 'supper';

  // Case 1: Low remaining calories (< 300 kcal) but high protein needed (> 25g)
  if (remainingCal <= 320 && remainingProt >= 25) {
    const chickenGrams = 120; // ~198 kcal, 38g prot
    const chicken = COMMON_FOOD_DATABASE.find(f => f.name.toLowerCase().includes('peito de frango')) || COMMON_FOOD_DATABASE[1];
    
    return {
      id: `suggestion-${Date.now()}`,
      title: '🎯 Fechamento Proteico Leve',
      description: `Ideal para bater os ${Math.round(remainingProt)}g de proteína sem ultrapassar as ${remainingCal} kcal restantes.`,
      tag: 'Baixa Caloria & Alta Proteína',
      targetMealKey,
      totalCal: 220,
      totalProt: 39,
      totalCarb: 2,
      totalFat: 4,
      items: [
        {
          foodItem: {
            ...chicken,
            cal: 198,
            prot: 38,
            carb: 0,
            fat: 4,
            portion: '120g (filé médio)',
            selectedWeight: 120,
          },
          portionDescription: '120g de Peito de Frango Grelhado',
          grams: 120,
          cal: 198,
          prot: 38,
        },
        {
          foodItem: {
            id: 'salada-mista',
            name: 'Salada de folhas verdes e tomate',
            cal: 22,
            prot: 1,
            carb: 4,
            fat: 0,
            portion: '1 prato fundo (~100g)',
            selectedWeight: 100,
            category: 'veggie',
            icon: '🥗',
          },
          portionDescription: 'Salada de folhas à vontade',
          grams: 100,
          cal: 22,
          prot: 1,
        }
      ]
    };
  }

  // Case 2: Moderate remaining calories (320 - 550 kcal)
  if (remainingCal <= 550) {
    const chicken = COMMON_FOOD_DATABASE.find(f => f.name.toLowerCase().includes('peito de frango')) || COMMON_FOOD_DATABASE[1];
    const rice = COMMON_FOOD_DATABASE.find(f => f.name.toLowerCase().includes('arroz branco')) || COMMON_FOOD_DATABASE[3];
    
    return {
      id: `suggestion-${Date.now()}`,
      title: '🥗 Refeição Balanceada Sob Medida',
      description: `Proteína magra com carboidrato na medida para fornecer saciedade e fechar o dia com chave de ouro.`,
      tag: 'Equilibrado',
      targetMealKey,
      totalCal: 375,
      totalProt: 42,
      totalCarb: 38,
      totalFat: 5,
      items: [
        {
          foodItem: {
            ...chicken,
            cal: 215,
            prot: 41,
            carb: 0,
            fat: 4.5,
            portion: '130g (filé grande)',
            selectedWeight: 130,
          },
          portionDescription: '130g de Peito de Frango Grelhado',
          grams: 130,
          cal: 215,
          prot: 41,
        },
        {
          foodItem: {
            ...rice,
            cal: 130,
            prot: 2.5,
            carb: 28,
            fat: 0.3,
            portion: '3 colheres de sopa (100g)',
            selectedWeight: 100,
          },
          portionDescription: '3 colheres de sopa de Arroz Branco (100g)',
          grams: 100,
          cal: 130,
          prot: 2.5,
        },
        {
          foodItem: {
            id: 'salada-legumes',
            name: 'Legumes cozidos no vapor (cenoura e brócolis)',
            cal: 30,
            prot: 1.5,
            carb: 6,
            fat: 0.2,
            portion: '1 porção (80g)',
            selectedWeight: 80,
            category: 'veggie',
            icon: '🥦',
          },
          portionDescription: 'Legumes cozidos (brócolis/cenoura)',
          grams: 80,
          cal: 30,
          prot: 1.5,
        }
      ]
    };
  }

  // Case 3: High remaining calories (> 550 kcal) - Full Brazilian Meal
  const beef = COMMON_FOOD_DATABASE.find(f => f.name.toLowerCase().includes('patinho') || f.name.toLowerCase().includes('carne moída')) || COMMON_FOOD_DATABASE[1];
  const rice = COMMON_FOOD_DATABASE.find(f => f.name.toLowerCase().includes('arroz branco')) || COMMON_FOOD_DATABASE[3];
  const beans = COMMON_FOOD_DATABASE.find(f => f.name.toLowerCase().includes('feijão')) || COMMON_FOOD_DATABASE[4];

  return {
    id: `suggestion-${Date.now()}`,
    title: '🍛 Almoço / Jantar Completo',
    description: `Combinação clássica brasileira de arroz, feijão, carne magra e salada, rica em ferro, fibras e proteína.`,
    tag: 'Refeição Completa',
    targetMealKey,
    totalCal: 580,
    totalProt: 48,
    totalCarb: 62,
    totalFat: 12,
    items: [
      {
        foodItem: {
          ...beef,
          cal: 240,
          prot: 39,
          carb: 0,
          fat: 8,
          portion: '140g (bife médio)',
          selectedWeight: 140,
        },
        portionDescription: '140g de Carne Magra (Patinho/Frango)',
        grams: 140,
        cal: 240,
        prot: 39,
      },
      {
        foodItem: {
          ...rice,
          cal: 195,
          prot: 3.8,
          carb: 42,
          fat: 0.5,
          portion: '4 colheres de sopa (150g)',
          selectedWeight: 150,
        },
        portionDescription: '4 colheres de sopa de Arroz (150g)',
        grams: 150,
        cal: 195,
        prot: 3.8,
      },
      {
        foodItem: {
          ...beans,
          cal: 115,
          prot: 6.5,
          carb: 18,
          fat: 0.8,
          portion: '1 concha média (130g)',
          selectedWeight: 130,
        },
        portionDescription: '1 concha de Feijão carioca (130g)',
        grams: 130,
        cal: 115,
        prot: 6.5,
      },
      {
        foodItem: {
          id: 'salada-azeite',
          name: 'Salada verde com 1 fio de azeite',
          cal: 30,
          prot: 0.5,
          carb: 2,
          fat: 2.5,
          portion: '1 prato',
          selectedWeight: 60,
          category: 'veggie',
          icon: '🥗',
        },
        portionDescription: 'Salada fresca temperada',
        grams: 60,
        cal: 30,
        prot: 0.5,
      }
    ]
  };
}

// ==========================================
// 🧠 NLU: INTELIGÊNCIA DE RECONHECIMENTO DE ALIMENTOS & PORÇÕES
// ==========================================

export type PortionSizeCategory = 'small' | 'medium' | 'large';

export interface ParsedFoodResult {
  foodItem: FoodItem;
  portionDescription: string;
  portionSize: PortionSizeCategory;
  grams: number;
  cal: number;
  prot: number;
  carb: number;
  fat: number;
  fiber: number;
}

export interface MealIntakeParseResult {
  detected: boolean;
  mealTitle: string;
  targetMealKey: MealKey;
  items: ParsedFoodResult[];
  totalCal: number;
  totalProt: number;
  totalCarb: number;
  totalFat: number;
  totalFiber: number;
  portionSummary: string;
}

function normalizeStr(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Explains how Défi Robô calculates small, medium, and large portions
 */
export function explainPortionSizes(): string {
  return `📏 **Como o Défi Robô entende e calcula as porções:**\n\n` +
    `🟢 **Porção Pequena (Leve / Pouco / -35%)**\n` +
    `• 🍗 **Proteínas (Frango / Carne / Peixe)**: ~80g a 90g (1 filé pequeno)\n` +
    `• 🍚 **Carboidratos (Arroz / Batata / Mandioca)**: ~80g (~2 colheres de sopa)\n` +
    `• 🫘 **Feijão**: ~70g (1/2 concha rasa)\n` +
    `• 🥚 **Ovos**: 1 unidade (~50g)\n` +
    `• 🥗 **Saladas & Legumes**: ~60g\n` +
    `*(Ideal para dias de déficit calórico estrito, ceias ou lanches leves)*\n\n` +
    `🟡 **Porção Média (Padrão do Dia a Dia)**\n` +
    `• 🍗 **Proteínas (Frango / Carne / Peixe)**: ~130g (1 filé médio padrão)\n` +
    `• 🍚 **Carboidratos (Arroz / Batata / Mandioca)**: ~140g (~4 colheres de sopa)\n` +
    `• 🫘 **Feijão**: ~130g (1 concha média)\n` +
    `• 🥚 **Ovos**: 2 unidades (~100g)\n` +
    `• 🥗 **Saladas & Legumes**: ~100g (1 pires ou prato de sobremesa)\n` +
    `*(A porção equilibrada mais comum na rotina saudável)*\n\n` +
    `🔴 **Porção Grande (Caprichada / Reforçada / +45%)**\n` +
    `• 🍗 **Proteínas (Frango / Carne / Peixe)**: ~190g a 200g (1 filé grande ou 2 médios)\n` +
    `• 🍚 **Carboidratos (Arroz / Batata / Mandioca)**: ~220g (~6 colheres de sopa)\n` +
    `• 🫘 **Feijão**: ~200g (1 concha e meia a 2 conchas)\n` +
    `• 🥚 **Ovos**: 3 a 4 unidades (~150g a 200g)\n` +
    `• 🥗 **Saladas & Legumes**: ~160g (1 prato fundo)\n` +
    `*(Ideal para refeições pós-treino intenso ou dietas de ganho de massa)*\n\n` +
    `💡 **Dica do Défi:** Você também pode me dizer medidas exatas como *"150g de frango"*, *"3 colheres de arroz"* ou *"1 concha de feijão"* que eu calculo com exatidão!`;
}

/**
 * Searches the best canonical food item from the database, preventing false positives
 */
function findCanonicalFood(searchTerm: string): FoodItem | null {
  const normSearch = normalizeStr(searchTerm);
  if (!normSearch) return null;

  // 1. Exact priority overrides to prevent compound mismatches (like burger de feijao vs feijao)
  if (normSearch.includes('feijao')) {
    if (normSearch.includes('preto')) {
      const match = COMMON_FOOD_DATABASE.find(f => f.id === 'feijao-preto' || f.name.toLowerCase().includes('feijão preto'));
      if (match) return match;
    }
    const match = COMMON_FOOD_DATABASE.find(f => f.id === 'feijao-carioca' || f.name.toLowerCase().includes('feijão carioca') || f.name.toLowerCase() === 'feijão');
    if (match) return match;
  }

  if (normSearch.includes('arroz')) {
    if (normSearch.includes('integral')) {
      const match = COMMON_FOOD_DATABASE.find(f => f.id === 'arroz-integral' || f.name.toLowerCase().includes('arroz integral'));
      if (match) return match;
    }
    const match = COMMON_FOOD_DATABASE.find(f => f.id === 'arroz-branco' || f.name.toLowerCase().includes('arroz branco') || f.name.toLowerCase().includes('arroz cozido'));
    if (match) return match;
  }

  if (normSearch.includes('frango')) {
    if (normSearch.includes('desfiado')) {
      const match = COMMON_FOOD_DATABASE.find(f => f.name.toLowerCase().includes('frango desfiado'));
      if (match) return match;
    }
    if (normSearch.includes('coxa') || normSearch.includes('sobrecoxa')) {
      const match = COMMON_FOOD_DATABASE.find(f => f.name.toLowerCase().includes('sobrecoxa') || f.name.toLowerCase().includes('coxa de frango'));
      if (match) return match;
    }
    if (normSearch.includes('empanado') || normSearch.includes('milanesa')) {
      const match = COMMON_FOOD_DATABASE.find(f => f.name.toLowerCase().includes('empanado') || f.name.toLowerCase().includes('milanesa'));
      if (match) return match;
    }
    const match = COMMON_FOOD_DATABASE.find(f => f.name.toLowerCase().includes('peito de frango') || f.name.toLowerCase().includes('filé de frango') || f.name.toLowerCase().includes('frango grelhado'));
    if (match) return match;
  }

  if (normSearch.includes('carne') || normSearch.includes('bife') || normSearch.includes('patinho') || normSearch.includes('alcatra')) {
    if (normSearch.includes('moida')) {
      const match = COMMON_FOOD_DATABASE.find(f => f.name.toLowerCase().includes('carne moída') || f.id === 'carne-moida');
      if (match) return match;
    }
    if (normSearch.includes('picanha')) {
      const match = COMMON_FOOD_DATABASE.find(f => f.name.toLowerCase().includes('picanha'));
      if (match) return match;
    }
    const match = COMMON_FOOD_DATABASE.find(f => f.name.toLowerCase().includes('patinho') || f.name.toLowerCase().includes('bife') || f.name.toLowerCase().includes('alcatra'));
    if (match) return match;
  }

  if (normSearch.includes('ovo')) {
    if (normSearch.includes('mexido')) {
      const match = COMMON_FOOD_DATABASE.find(f => f.name.toLowerCase().includes('ovo mexido'));
      if (match) return match;
    }
    if (normSearch.includes('frito')) {
      const match = COMMON_FOOD_DATABASE.find(f => f.name.toLowerCase().includes('ovo frito'));
      if (match) return match;
    }
    const match = COMMON_FOOD_DATABASE.find(f => f.name.toLowerCase().includes('ovo cozido') || f.name.toLowerCase().includes('ovo de galinha'));
    if (match) return match;
  }

  if (normSearch.includes('salada') || normSearch.includes('alface') || normSearch.includes('folhas')) {
    const match = COMMON_FOOD_DATABASE.find(f => f.name.toLowerCase().includes('salada') || f.name.toLowerCase().includes('alface'));
    if (match) return match;
  }

  if (normSearch.includes('batata doce')) {
    const match = COMMON_FOOD_DATABASE.find(f => f.name.toLowerCase().includes('batata-doce') || f.name.toLowerCase().includes('batata doce'));
    if (match) return match;
  }

  if (normSearch.includes('batata')) {
    const match = COMMON_FOOD_DATABASE.find(f => f.name.toLowerCase().includes('batata inglesa') || f.name.toLowerCase().includes('batata cozida') || f.name.toLowerCase().includes('purê de batata'));
    if (match) return match;
  }

  // 2. Direct Search across COMMON_FOOD_DATABASE
  let bestMatch: FoodWithPortions | null = null;
  let highestScore = 0;

  for (const food of COMMON_FOOD_DATABASE) {
    const normName = normalizeStr(food.name);
    if (normName === normSearch) {
      return food;
    }
    if (food.aliases && food.aliases.some(a => normalizeStr(a) === normSearch)) {
      return food;
    }

    let score = 0;
    const searchWords = normSearch.split(' ');
    for (const w of searchWords) {
      if (w.length < 3) continue;
      if (normName.includes(w)) score += 3;
      if (food.aliases && food.aliases.some(a => normalizeStr(a).includes(w))) score += 2;
    }

    // Penalize if name contains "hamburguer" or "escondidinho" unless user asked for it
    if ((normName.includes('hamburguer') || normName.includes('escondidinho') || normName.includes('lasanha')) && !normSearch.includes('hamburguer') && !normSearch.includes('escondidinho') && !normSearch.includes('lasanha')) {
      score -= 5;
    }

    if (score > highestScore && score >= 3) {
      highestScore = score;
      bestMatch = food;
    }
  }

  return bestMatch;
}

/**
 * Intelligent parser for food logging from Portuguese natural language
 */
export function parseFoodIntakeFromText(rawText: string, currentHour: number): MealIntakeParseResult {
  const norm = normalizeStr(rawText);

  // 1. Detect target meal
  let targetMealKey: MealKey = 'lunch';
  let mealTitle = 'Almoço';

  if (norm.includes('cafe da manha') || norm.includes('cafe') || norm.includes('desjejum')) {
    targetMealKey = 'breakfast';
    mealTitle = 'Café da Manhã';
  } else if (norm.includes('almoco') || norm.includes('almocei') || norm.includes('almocar')) {
    targetMealKey = 'lunch';
    mealTitle = 'Almoço';
  } else if (norm.includes('lanche da tarde') || norm.includes('lanche') || norm.includes('lanchei')) {
    targetMealKey = 'snack';
    mealTitle = 'Lanche da Tarde';
  } else if (norm.includes('jantar') || norm.includes('jantei') || norm.includes('janta')) {
    targetMealKey = 'dinner';
    mealTitle = 'Jantar';
  } else if (norm.includes('ceia')) {
    targetMealKey = 'supper';
    mealTitle = 'Ceia';
  } else {
    // Infer by current time
    if (currentHour < 10.5) {
      targetMealKey = 'breakfast';
      mealTitle = 'Café da Manhã';
    } else if (currentHour < 15) {
      targetMealKey = 'lunch';
      mealTitle = 'Almoço';
    } else if (currentHour < 18.5) {
      targetMealKey = 'snack';
      mealTitle = 'Lanche';
    } else if (currentHour < 22) {
      targetMealKey = 'dinner';
      mealTitle = 'Jantar';
    } else {
      targetMealKey = 'supper';
      mealTitle = 'Ceia';
    }
  }

  // 2. Global portion size modifier detection
  let globalPortion: PortionSizeCategory = 'medium';
  if (
    norm.includes('grande') ||
    norm.includes('bastante') ||
    norm.includes('caprichada') ||
    norm.includes('reforcada') ||
    norm.includes('dupla') ||
    norm.includes('gigante') ||
    norm.includes('muito') ||
    norm.includes('porcao grande')
  ) {
    globalPortion = 'large';
  } else if (
    norm.includes('pequena') ||
    norm.includes('pequeno') ||
    norm.includes('pouco') ||
    norm.includes('leve') ||
    norm.includes('metade') ||
    norm.includes('rasa') ||
    norm.includes('porcao pequena')
  ) {
    globalPortion = 'small';
  }

  // 3. Extract individual food terms
  // Clean command words
  let cleaned = norm
    .replace(/\b(eu|hoje|agora|acabei de|comi|almocei|jantei|lanchei|tomei|bebi|coma|comendo|adicione|registre|coloque|no almoco|no jantar|no cafe|no lanche|na ceia|por favor|defi|robo|pra mim)\b/g, '')
    .trim();

  // Common food splitters
  const clauses = cleaned.split(/\b(?: e | com | mais | mais um | mais uma | acompanhado de |,|\+)\b/);
  
  const parsedItems: ParsedFoodResult[] = [];
  const processedFoodIds = new Set<string>();

  for (const rawClause of clauses) {
    const clause = rawClause.trim();
    if (!clause || clause.length < 2) continue;

    // Detect per-clause portion modifier
    let clausePortion = globalPortion;
    if (clause.includes('grande') || clause.includes('bastante') || clause.includes('caprichad')) {
      clausePortion = 'large';
    } else if (clause.includes('pequen') || clause.includes('pouco') || clause.includes('leve') || clause.includes('rasa')) {
      clausePortion = 'small';
    } else if (clause.includes('media') || clause.includes('medio') || clause.includes('normal') || clause.includes('padrao')) {
      clausePortion = 'medium';
    }

    // Detect exact grams pattern (e.g. 150g, 200g, 120 gramas)
    const gramsMatch = clause.match(/(\d+)\s*(?:g|gramas|gr)\b/);
    let explicitGrams: number | null = gramsMatch ? parseInt(gramsMatch[1], 10) : null;

    // Detect spoon pattern (e.g. 3 colheres, 4 colheres de sopa)
    const spoonsMatch = clause.match(/(\d+)\s*(?:colheres?|colher|cs)\b/);
    const spoonsCount = spoonsMatch ? parseInt(spoonsMatch[1], 10) : null;

    // Detect ladle/concha pattern (e.g. 1 concha, 2 conchas)
    const ladlesMatch = clause.match(/(\d+)\s*(?:conchas?|concha)\b/);
    const ladlesCount = ladlesMatch ? parseInt(ladlesMatch[1], 10) : null;

    // Detect unit count (e.g. 2 ovos, 3 fatias, 1 file)
    const unitsMatch = clause.match(/(\d+)\s*(?:unidades?|unidade|ovos?|ovo|files?|file|bifes?|bife|fatias?|fatia|pedacos?|pedaco)\b/);
    const unitsCount = unitsMatch ? parseInt(unitsMatch[1], 10) : null;

    // Remove portion words from clause to get food name
    const foodNameTerm = clause
      .replace(/\b(\d+)\s*(?:g|gramas|gr|colheres? de sopa|colheres?|conchas?|unidades?|fatias?|files?|bifes?|pedacos?|ovos?)\b/g, '')
      .replace(/\b(porcao|grande|media|medio|pequena|pequeno|bastante|pouco|leve|caprichada|dupla|reforcada|uma|um|de|do|da|prato|pires)\b/g, '')
      .trim();

    if (!foodNameTerm || foodNameTerm.length < 2) continue;

    const matchedFood = findCanonicalFood(foodNameTerm);
    if (!matchedFood || processedFoodIds.has(matchedFood.id || matchedFood.name)) {
      continue;
    }

    processedFoodIds.add(matchedFood.id || matchedFood.name);

    // Calculate Grams
    const normMatchedName = normalizeStr(matchedFood.name);
    let calculatedGrams = 100;
    let portionLabel = '';

    if (explicitGrams && explicitGrams > 0) {
      calculatedGrams = explicitGrams;
      portionLabel = `${calculatedGrams}g`;
    } else if (spoonsCount && spoonsCount > 0) {
      const spoonWeight = normMatchedName.includes('arroz') ? 35 : normMatchedName.includes('aveia') ? 20 : 30;
      calculatedGrams = spoonsCount * spoonWeight;
      portionLabel = `${spoonsCount} colheres de sopa (~${calculatedGrams}g)`;
    } else if (ladlesCount && ladlesCount > 0) {
      const ladleWeight = 130;
      calculatedGrams = ladlesCount * ladleWeight;
      portionLabel = `${ladlesCount} concha(s) (~${calculatedGrams}g)`;
    } else if (unitsCount && unitsCount > 0 && normMatchedName.includes('ovo')) {
      calculatedGrams = unitsCount * 50;
      portionLabel = `${unitsCount} ovo(s) (~${calculatedGrams}g)`;
    } else if (unitsCount && unitsCount > 0 && (normMatchedName.includes('pao') || normMatchedName.includes('fatia'))) {
      calculatedGrams = unitsCount * 25;
      portionLabel = `${unitsCount} fatia(s) (~${calculatedGrams}g)`;
    } else {
      // Use Portion Size Category (Small, Medium, Large)
      if (normMatchedName.includes('frango') || normMatchedName.includes('carne') || normMatchedName.includes('bife') || normMatchedName.includes('peixe') || normMatchedName.includes('tilapia') || normMatchedName.includes('patinho') || normMatchedName.includes('picanha')) {
        if (clausePortion === 'small') {
          calculatedGrams = 85;
          portionLabel = 'Porção Pequena (~85g)';
        } else if (clausePortion === 'large') {
          calculatedGrams = 190;
          portionLabel = 'Porção Grande (~190g)';
        } else {
          calculatedGrams = 130;
          portionLabel = 'Porção Média (~130g)';
        }
      } else if (normMatchedName.includes('arroz')) {
        if (clausePortion === 'small') {
          calculatedGrams = 80;
          portionLabel = 'Porção Pequena (~80g / 2 colheres)';
        } else if (clausePortion === 'large') {
          calculatedGrams = 220;
          portionLabel = 'Porção Grande (~220g / 6 colheres)';
        } else {
          calculatedGrams = 140;
          portionLabel = 'Porção Média (~140g / 4 colheres)';
        }
      } else if (normMatchedName.includes('feijao')) {
        if (clausePortion === 'small') {
          calculatedGrams = 70;
          portionLabel = 'Porção Pequena (~70g / 1/2 concha)';
        } else if (clausePortion === 'large') {
          calculatedGrams = 200;
          portionLabel = 'Porção Grande (~200g / 1.5 conchas)';
        } else {
          calculatedGrams = 130;
          portionLabel = 'Porção Média (~130g / 1 concha)';
        }
      } else if (normMatchedName.includes('ovo')) {
        if (clausePortion === 'small') {
          calculatedGrams = 50;
          portionLabel = '1 ovo (~50g)';
        } else if (clausePortion === 'large') {
          calculatedGrams = 150;
          portionLabel = '3 ovos (~150g)';
        } else {
          calculatedGrams = 100;
          portionLabel = '2 ovos (~100g)';
        }
      } else if (normMatchedName.includes('batata') || normMatchedName.includes('mandioca') || normMatchedName.includes('macarrao') || normMatchedName.includes('aipim')) {
        if (clausePortion === 'small') {
          calculatedGrams = 90;
          portionLabel = 'Porção Pequena (~90g)';
        } else if (clausePortion === 'large') {
          calculatedGrams = 220;
          portionLabel = 'Porção Grande (~220g)';
        } else {
          calculatedGrams = 150;
          portionLabel = 'Porção Média (~150g)';
        }
      } else if (normMatchedName.includes('salada') || normMatchedName.includes('legumes') || normMatchedName.includes('folhas') || normMatchedName.includes('alface')) {
        if (clausePortion === 'small') {
          calculatedGrams = 60;
          portionLabel = 'Porção Pequena (~60g)';
        } else if (clausePortion === 'large') {
          calculatedGrams = 160;
          portionLabel = 'Porção Grande (~160g)';
        } else {
          calculatedGrams = 100;
          portionLabel = 'Porção Média (~100g)';
        }
      } else {
        // Generic food
        const defaultPortion = matchedFood.portions?.find(p => p.isDefault)?.grams || 100;
        if (clausePortion === 'small') {
          calculatedGrams = Math.round(defaultPortion * 0.7);
          portionLabel = `Porção Pequena (~${calculatedGrams}g)`;
        } else if (clausePortion === 'large') {
          calculatedGrams = Math.round(defaultPortion * 1.45);
          portionLabel = `Porção Grande (~${calculatedGrams}g)`;
        } else {
          calculatedGrams = defaultPortion;
          portionLabel = `Porção Média (~${calculatedGrams}g)`;
        }
      }
    }

    const macros = calculateMacrosFromGrams(matchedFood, calculatedGrams);

    parsedItems.push({
      foodItem: {
        ...matchedFood,
        cal: macros.cal,
        prot: macros.prot,
        carb: macros.carb,
        fat: macros.fat,
        fiber: macros.fiber,
        portion: portionLabel,
        selectedWeight: calculatedGrams,
      },
      portionDescription: `${matchedFood.name} (${portionLabel})`,
      portionSize: clausePortion,
      grams: calculatedGrams,
      cal: macros.cal,
      prot: macros.prot,
      carb: macros.carb,
      fat: macros.fat,
      fiber: macros.fiber,
    });
  }

  const detected = parsedItems.length > 0;
  const totalCal = parsedItems.reduce((acc, it) => acc + it.cal, 0);
  const totalProt = Number(parsedItems.reduce((acc, it) => acc + it.prot, 0).toFixed(1));
  const totalCarb = Number(parsedItems.reduce((acc, it) => acc + it.carb, 0).toFixed(1));
  const totalFat = Number(parsedItems.reduce((acc, it) => acc + it.fat, 0).toFixed(1));
  const totalFiber = Number(parsedItems.reduce((acc, it) => acc + it.fiber, 0).toFixed(1));

  const portionSummary = globalPortion === 'large' ? 'Porção Grande' : globalPortion === 'small' ? 'Porção Pequena' : 'Porção Média';

  return {
    detected,
    mealTitle,
    targetMealKey,
    items: parsedItems,
    totalCal,
    totalProt,
    totalCarb,
    totalFat,
    totalFiber,
    portionSummary,
  };
}

export function answerDefiAssistantQuestion(
  rawQuery: string,
  user: UserProfile,
  goals: NutritionGoals,
  stats: DayStats,
  meals: MealsState
): { text: string; suggestion?: SmartMealSuggestion; quickQuestions?: string[] } {
  const query = rawQuery.toLowerCase().trim();
  const normQuery = normalizeStr(query);
  const firstName = user.name ? user.name.split(' ')[0] : 'Atleta';
  const remainingCal = Math.max(0, goals.calories - stats.calories);
  const remainingProt = Math.max(0, goals.protein - stats.protein);
  const remainingWater = Math.max(0, Number((goals.water - stats.water).toFixed(1)));
  const now = new Date();
  const currentHour = now.getHours();

  // Question 0: Explanation of portion sizes ("o que é porção grande, média e pequena?")
  if (
    normQuery.includes('o que e porcao') ||
    normQuery.includes('oque e porcao') ||
    normQuery.includes('oque e pocao') ||
    normQuery.includes('o que e pocao') ||
    normQuery.includes('como funciona porcao') ||
    normQuery.includes('tamanho das porcoes') ||
    normQuery.includes('diferenca de porcao') ||
    normQuery.includes('quanto pesa uma porcao') ||
    normQuery.includes('explicar porcoes') ||
    (normQuery.includes('porcao') && normQuery.includes('grande') && normQuery.includes('pequena'))
  ) {
    return {
      text: explainPortionSizes(),
      quickQuestions: [
        'Comi arroz e frango porção média',
        'Comi arroz, feijão e carne porção grande',
        'O que posso comer agora?',
        'Quanto de proteína ainda preciso?'
      ]
    };
  }

  // Question 1: Check if the user is stating what they ate / want to log (NLP Food Intake)
  const isFoodLoggingIntent =
    normQuery.includes('comi') ||
    normQuery.includes('almocei') ||
    normQuery.includes('jantei') ||
    normQuery.includes('lanchei') ||
    normQuery.includes('tomei') ||
    normQuery.includes('bebi') ||
    normQuery.includes('coma') ||
    normQuery.includes('comendo') ||
    normQuery.includes('adicione') ||
    normQuery.includes('registre') ||
    normQuery.includes('coloque') ||
    normQuery.includes('arroz') ||
    normQuery.includes('frango') ||
    normQuery.includes('feijao') ||
    normQuery.includes('batata') ||
    normQuery.includes('salada') ||
    normQuery.includes('carne') ||
    normQuery.includes('ovo');

  if (isFoodLoggingIntent && !normQuery.includes('posso comer') && !normQuery.includes('o que posso comer') && !normQuery.includes('sugira')) {
    const parseResult = parseFoodIntakeFromText(rawQuery, currentHour);

    if (parseResult.detected && parseResult.items.length > 0) {
      const customSuggestion: SmartMealSuggestion = {
        id: `custom-log-${Date.now()}`,
        title: `🍽️ ${parseResult.mealTitle} (${parseResult.portionSummary})`,
        description: `Refeição identificada a partir do seu relato com cálculo nutricional exato.`,
        tag: parseResult.portionSummary,
        targetMealKey: parseResult.targetMealKey,
        totalCal: parseResult.totalCal,
        totalProt: parseResult.totalProt,
        totalCarb: parseResult.totalCarb,
        totalFat: parseResult.totalFat,
        items: parseResult.items.map(it => ({
          foodItem: it.foodItem,
          portionDescription: it.portionDescription,
          grams: it.grams,
          cal: it.cal,
          prot: it.prot,
        })),
      };

      const newRemainingCal = Math.max(0, remainingCal - parseResult.totalCal);
      const newRemainingProt = Math.max(0, remainingProt - parseResult.totalProt);

      const itemsList = parseResult.items
        .map(
          it =>
            `• **${it.foodItem.name}** (${it.foodItem.portion}): **${it.cal} kcal** | 🍗 ${it.prot}g Prot | 🍞 ${it.carb}g Carb | 🥑 ${it.fat}g Gord`
        )
        .join('\n');

      return {
        text:
          `🤖 **Entendido, ${firstName}! Calculei exatamente sua refeição:**\n\n` +
          `🍽️ **${parseResult.mealTitle}** — *${parseResult.portionSummary}*\n` +
          `${itemsList}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `🔥 **Total da refeição:** **${parseResult.totalCal} kcal**\n` +
          `💪 **Macros:** **${parseResult.totalProt}g Proteína** • **${parseResult.totalCarb}g Carbo** • **${parseResult.totalFat}g Gordura**\n\n` +
          `📊 **Impacto na sua meta:**\n` +
          `• Saldo calórico após a refeição: **~${newRemainingCal} kcal restantes**\n` +
          `• Proteína restante hoje: **~${newRemainingProt}g**\n\n` +
          `Toque no botão abaixo para adicionar diretamente ao seu diário alimentar! 👇`,
        suggestion: customSuggestion,
        quickQuestions: [
          'Estou dentro da minha meta?',
          'Quanto de proteína ainda preciso?',
          'Como o Défi calcula as porções?',
          'Como está minha hidratação?'
        ]
      };
    }
  }

  // Question 2: "Posso comer pizza hoje?"
  if (query.includes('pizza') || query.includes('lanche') || query.includes('hamburguer') || query.includes('doce')) {
    const pizzaSliceCal = 285; // 1 fatia (~100g)
    const twoSlicesCal = 570;
    
    if (remainingCal >= twoSlicesCal) {
      const surplusAfter = remainingCal - twoSlicesCal;
      return {
        text: `🍕 **Pode sim, ${firstName}!**\n\nVocê já consumiu **${stats.calories} kcal** hoje e possui aproximadamente **${remainingCal} kcal restantes** na sua meta de ${goals.calories} kcal.\n\n• **2 fatias de pizza média** representam aproximadamente **${twoSlicesCal} kcal** (e cerca de 22g de proteína).\n• Após comê-las, você ainda terá **~${surplusAfter} kcal disponíveis** para o resto do dia.\n\n💡 **Dica do Défi**: Como a pizza tem mais gordura e sódio, tente incluir uma salada de entrada e caprichar na água hoje para evitar retenção de líquidos!`,
        quickQuestions: [
          'Quanto de proteína ainda preciso?',
          'O que posso comer agora?',
          'Estou dentro da minha meta?'
        ]
      };
    } else if (remainingCal >= pizzaSliceCal) {
      const surplusAfter = remainingCal - pizzaSliceCal;
      return {
        text: `🍕 **Sim, com moderação!**\n\nVocê possui **${remainingCal} kcal restantes** hoje.\n\n• **1 fatia de pizza** (~${pizzaSliceCal} kcal) cabe perfeitamente na sua meta, sobrando ainda **~${surplusAfter} kcal**.\n• Se optar por comer 2 fatias (${twoSlicesCal} kcal), você ultrapassará levemente a meta diária em **+${twoSlicesCal - remainingCal} kcal**.\n\n💡 Lembre-se: flexibilidade com consciência faz parte da constância!`,
        quickQuestions: [
          'Quanto de proteína ainda preciso?',
          'Sugira uma refeição leve'
        ]
      };
    } else {
      return {
        text: `⚠️ **Atenção ao saldo de hoje, ${firstName}**\n\nVocê já atingiu **${stats.calories} kcal** (sua meta é ${goals.calories} kcal).\n\nComer 2 fatias de pizza (~570 kcal) hoje deixará você com um excedente calórico de cerca de **+${570 + (stats.calories - goals.calories)} kcal**.\n\n💡 Se for uma ocasião especial, aproveite com moderação! Nos próximos dias, basta retornar ao seu plano habitual sem dietas punitivas.`,
        quickQuestions: [
          'Sugira uma refeição leve',
          'Como compensar de forma saudável?'
        ]
      };
    }
  }

  // Question 3: "Quanto de proteína ainda preciso?"
  if (query.includes('proteina') || query.includes('proteína') || query.includes('quanto de proteina')) {
    if (remainingProt <= 0) {
      return {
        text: `🎉 **Meta de proteína batida!**\n\nVocê já consumiu **${Math.round(stats.protein)}g** de proteína hoje (sua meta era **${goals.protein}g**). Excelente disciplina com os macronutrientes!`,
        quickQuestions: [
          'Estou dentro da minha meta calórica?',
          'Como está minha hidratação?'
        ]
      };
    }

    return {
      text: `🍗 **Você ainda precisa de aproximadamente ${Math.round(remainingProt)}g de proteína hoje.**\n\nMeta: **${goals.protein}g** | Consumido: **${Math.round(stats.protein)}g** | Restante: **${Math.round(remainingProt)}g**\n\n💡 **Algumas opções práticas para completar:**\n• 🥚 **3 ovos inteiros** → ~18g de proteína (~210 kcal)\n• 🍗 **150g de peito de frango** → ~45g de proteína (~225 kcal)\n• 🥛 **1 dose de Whey Protein (30g)** → ~24g de proteína (~120 kcal)\n• 🥣 **1 pote de iogurte proteico** → ~15g de proteína (~100 kcal)\n• 🐟 **1 lata de atum natural** → ~30g de proteína (~120 kcal)\n\nQuer que eu monte uma refeição exata com o que você ainda pode comer?`,
      suggestion: generateSmartMealSuggestion(goals, stats, meals, user),
      quickQuestions: [
        'Montar refeição',
        'O que posso comer agora?',
        'Posso comer pizza hoje?'
      ]
    };
  }

  // Question 4: "O que posso comer agora?" / "Sugira uma refeição" / "Sugira um jantar/almoço"
  if (query.includes('o que posso comer') || query.includes('sugira') || query.includes('montar') || query.includes('jantar') || query.includes('almoço') || query.includes('cafe')) {
    const suggestion = generateSmartMealSuggestion(goals, stats, meals, user);
    return {
      text: `🍽️ **Sugestão personalizada para seu momento:**\n\nVocê tem **${remainingCal} kcal** restantes e faltam **${Math.round(remainingProt)}g** de proteína.\n\nMontei a seguinte opção sob medida:\n\n**${suggestion.title}** (${suggestion.totalCal} kcal / ${suggestion.totalProt}g Proteína):\n${suggestion.items.map(i => `• ${i.portionDescription} (~${i.cal} kcal, ${i.prot}g prot)`).join('\n')}\n\nApós essa refeição, você ainda terá aproximadamente **${Math.max(0, remainingCal - suggestion.totalCal)} kcal** disponíveis!`,
      suggestion,
      quickQuestions: [
        'Quanto de proteína ainda preciso?',
        'Posso comer pizza hoje?',
        'Como está minha hidratação?'
      ]
    };
  }

  // Question 5: "Estou dentro da minha meta?"
  if (query.includes('dentro da meta') || query.includes('como estou') || query.includes('status') || query.includes('resumo')) {
    const statusCal = stats.calories <= goals.calories ? '✅ Dentro do limite calórico' : '⚠️ Levemente acima da meta calórica';
    const statusProt = stats.protein >= goals.protein ? '✅ Meta de proteína batida' : `⏳ Faltam ${Math.round(remainingProt)}g de proteína`;
    const statusWater = stats.water >= goals.water ? '✅ Hidratação excelente' : `💧 Faltam ${remainingWater.toFixed(1).replace('.', ',')} L de água`;

    return {
      text: `📊 **Como está seu dia hoje, ${firstName}:**\n\n• 🔥 **Calorias**: ${stats.calories} / ${goals.calories} kcal (${statusCal})\n• 🍗 **Proteína**: ${Math.round(stats.protein)} / ${goals.protein}g (${statusProt})\n• 🍞 **Carboidratos**: ${Math.round(stats.carbs)} / ${goals.carbs}g\n• 🥑 **Gorduras**: ${Math.round(stats.fat)} / ${goals.fat}g\n• 💧 **Água**: ${stats.water.toFixed(1).replace('.', ',')} / ${goals.water.toFixed(1).replace('.', ',')} L (${statusWater})\n\n💡 **Objetivo atual**: ${getObjectiveInfo(user.objective).title}. Você está no caminho certo!`,
      quickQuestions: [
        'O que posso comer agora?',
        'Quanto de proteína ainda preciso?',
        'Posso comer pizza hoje?'
      ]
    };
  }

  // Question 6: "Como beber mais água hoje?" / Hidratação
  if (query.includes('agua') || query.includes('água') || query.includes('hidratacao') || query.includes('hidratação')) {
    return {
      text: `💧 **Acompanhamento de Hidratação:**\n\nVocê já bebeu **${stats.water.toFixed(1).replace('.', ',')} L** da sua meta diária de **${goals.water.toFixed(1).replace('.', ',')} L**.\n\nAinda restam **${remainingWater.toFixed(1).replace('.', ',')} L** hoje.\n\n💡 **Estratégia do Défi:**\n• Tenha sempre uma garrafinha de 500ml à mão na mesa de trabalho.\n• Beba 1 copo cheio (~300ml) ao acordar e 1 copo 30 minutos antes das refeições principais.\n• Chás claros e água aromatizada com limão/hortelã também contam para a hidratação.`,
      quickQuestions: [
        '+300ml de água',
        'Estou dentro da minha meta?',
        'O que posso comer agora?'
      ]
    };
  }

  // Default contextual response
  const suggestion = generateSmartMealSuggestion(goals, stats, meals, user);
  return {
    text: `Olá, ${firstName}! Estou acompanhando seu dia em tempo real.\n\nAté agora você registrou **${stats.calories} kcal** (restam ${remainingCal} kcal) e **${Math.round(stats.protein)}g de proteína** (faltam ${Math.round(remainingProt)}g) com foco em **${getObjectiveInfo(user.objective).title}**.\n\nComo posso ajudar você agora? Você pode me dizer o que comeu (ex: *"comi arroz e frango porção grande"*), pedir uma sugestão ou tirar dúvidas!`,
    suggestion,
    quickQuestions: [
      'Comi arroz e frango porção média',
      'O que é porção grande, média e pequena?',
      'O que posso comer agora?',
      'Quanto de proteína ainda preciso?'
    ]
  };
}
