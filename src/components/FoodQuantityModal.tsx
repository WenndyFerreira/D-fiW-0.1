import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Scale, 
  PieChart, 
  Check, 
  Plus, 
  Minus, 
  Sparkles,
  Flame,
  Info,
  ChevronRight
} from 'lucide-react';
import { FoodItem, MealKey, PortionOption } from '../types';
import { calculateMacrosFromGrams, getDefaultPortionsForFood } from '../data/portionFoodDB';

interface FoodQuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  food: FoodItem | null;
  targetMeal: MealKey;
  onConfirm: (mealKey: MealKey, finalFood: FoodItem, quantityDescription: string) => void;
  initialGrams?: number;
  initialPortion?: string;
  isEditing?: boolean;
}

export const FoodQuantityModal: React.FC<FoodQuantityModalProps> = ({
  isOpen,
  onClose,
  food,
  targetMeal,
  onConfirm,
  initialGrams,
  initialPortion,
  isEditing = false,
}) => {
  // Input mode: 'portion' (Unidade/Porção/Medidas caseiras) or 'weight' (Peso em gramas/ml)
  const [mode, setMode] = useState<'portion' | 'weight'>('portion');
  
  // Weight state
  const [weightGrams, setWeightGrams] = useState<number>(100);
  
  // Portion state
  const [selectedPortionIdx, setSelectedPortionIdx] = useState<number>(0);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);

  // Available portions for this food
  const portions: PortionOption[] = useMemo(() => {
    if (!food) return [];
    if (food.portions && food.portions.length > 0) return food.portions;
    return getDefaultPortionsForFood(food.name, food.category);
  }, [food]);

  // Set initial values when opened or food changes
  useEffect(() => {
    if (isOpen && food) {
      if (initialGrams && initialGrams > 0) {
        setWeightGrams(initialGrams);
        setMode('weight');
      } else {
        const defaultIdx = portions.findIndex(p => p.isDefault);
        const idx = defaultIdx >= 0 ? defaultIdx : 0;
        setSelectedPortionIdx(idx);
        setPortionMultiplier(1);
        if (portions[idx]) {
          setWeightGrams(portions[idx].grams);
        } else {
          setWeightGrams(100);
        }
        setMode('portion');
      }
    }
  }, [isOpen, food, initialGrams, portions]);

  // Calculate current effective grams
  const currentGrams = useMemo(() => {
    if (mode === 'weight') {
      return Math.max(1, weightGrams || 0);
    }
    const currentPortion = portions[selectedPortionIdx];
    const baseG = currentPortion ? currentPortion.grams : 100;
    return Math.max(1, Math.round(baseG * portionMultiplier));
  }, [mode, weightGrams, selectedPortionIdx, portionMultiplier, portions]);

  // Calculate macros dynamically
  const calculatedMacros = useMemo(() => {
    if (!food) return { cal: 0, prot: 0, carb: 0, fat: 0, fiber: 0 };
    return calculateMacrosFromGrams(food, currentGrams);
  }, [food, currentGrams]);

  if (!isOpen || !food) return null;

  const currentPortionObj = portions[selectedPortionIdx] || { label: '1 porção', unitName: 'porção', grams: 100 };
  const isLiquid = food.category === 'drink' || food.name.toLowerCase().includes('leite') || food.name.toLowerCase().includes('suco') || food.name.toLowerCase().includes('refrigerante');
  const unitLabel = isLiquid ? 'ml' : 'g';

  const handleSelectPortion = (idx: number) => {
    setSelectedPortionIdx(idx);
    const chosen = portions[idx];
    if (chosen) {
      setWeightGrams(Math.round(chosen.grams * portionMultiplier));
    }
  };

  const handleAdjustMultiplier = (delta: number) => {
    const next = Math.max(0.25, Math.round((portionMultiplier + delta) * 100) / 100);
    setPortionMultiplier(next);
  };

  const handleSave = () => {
    let portionText = '';
    if (mode === 'weight') {
      portionText = `${currentGrams}${unitLabel}`;
    } else {
      const portionName = currentPortionObj.unitName;
      if (portionMultiplier === 1) {
        portionText = `${currentPortionObj.label}`;
      } else {
        portionText = `${portionMultiplier}x ${portionName} (${currentGrams}${unitLabel})`;
      }
    }

    const finalFoodItem: FoodItem = {
      ...food,
      cal: calculatedMacros.cal,
      prot: calculatedMacros.prot,
      carb: calculatedMacros.carb,
      fat: calculatedMacros.fat,
      fiber: calculatedMacros.fiber,
      portion: portionText,
      selectedWeight: currentGrams,
      selectedUnit: mode === 'weight' ? unitLabel : currentPortionObj.unitName,
      baseCal: food.baseCal !== undefined ? food.baseCal : food.cal,
      baseProt: food.baseProt !== undefined ? food.baseProt : food.prot,
      baseCarb: food.baseCarb !== undefined ? food.baseCarb : food.carb,
      baseFat: food.baseFat !== undefined ? food.baseFat : food.fat,
      baseFiber: food.baseFiber !== undefined ? food.baseFiber : (food.fiber || 0),
    };

    onConfirm(targetMeal, finalFoodItem, portionText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="w-full max-w-[480px] bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{(food as any).icon || '🍽️'}</span>
              <h3 className="text-base font-extrabold text-gray-900 line-clamp-1">
                {food.name}
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Valores base: <strong className="text-emerald-700">{food.baseCal || food.cal} kcal</strong> a cada 100{unitLabel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Question / Mode Selector */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">
              Como você quer informar a quantidade?
            </label>
            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setMode('portion');
                  const cur = portions[selectedPortionIdx];
                  if (cur) setWeightGrams(Math.round(cur.grams * portionMultiplier));
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'portion'
                    ? 'bg-white text-gray-900 shadow-xs border border-gray-200/60'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <span>🍕</span>
                <span>Unidade / Porção</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('weight')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'weight'
                    ? 'bg-white text-gray-900 shadow-xs border border-gray-200/60'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                <span>Peso ({unitLabel})</span>
              </button>
            </div>
          </div>

          {/* Mode 1: Unidade / Porção / Medidas Caseiras */}
          {mode === 'portion' && (
            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  1. Escolha a medida caseira ou porção:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {portions.map((portion, idx) => {
                    const isSelected = selectedPortionIdx === idx;
                    const portionCal = Math.round(
                      ((food.baseCal || food.cal) * portion.grams) / 100
                    );

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPortion(idx)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/80 border-[#4CAF50] ring-1 ring-[#4CAF50] text-emerald-950 font-bold'
                            : 'bg-white border-gray-200 hover:border-emerald-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#4CAF50] bg-[#4CAF50] text-white' : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </span>
                          <span className="text-xs font-semibold">{portion.label}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-700">
                          {portionCal} kcal
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Multiplier / Stepper */}
              <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-800">
                    Quantas porções / unidades?
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Equivalente a: <strong className="text-gray-700">{currentGrams}{unitLabel}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdjustMultiplier(-1)}
                    disabled={portionMultiplier <= 1}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-40 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    type="number"
                    min="0.25"
                    step="0.5"
                    value={portionMultiplier}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val > 0) setPortionMultiplier(val);
                    }}
                    className="w-14 text-center font-black text-base text-gray-900 bg-white border border-gray-200 rounded-lg py-1 focus:border-[#4CAF50] outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => handleAdjustMultiplier(1)}
                    className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Peso exato */}
          {mode === 'weight' && (
            <div className="space-y-3">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-2">
                <label className="text-xs font-bold text-emerald-950 block">
                  Informe o peso exato consumido:
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      step="5"
                      value={weightGrams || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setWeightGrams(isNaN(val) ? 0 : val);
                      }}
                      className="w-full pl-4 pr-12 py-3 bg-white border-2 border-emerald-400 rounded-2xl text-2xl font-black text-gray-900 focus:ring-4 focus:ring-emerald-100 outline-none transition-all shadow-xs"
                      placeholder="100"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">
                      {unitLabel}
                    </span>
                  </div>
                </div>

                {/* Quick weight presets */}
                <div className="flex gap-1.5 flex-wrap pt-1">
                  {[25, 50, 100, 150, 200, 250, 300].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeightGrams(w)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        weightGrams === w
                          ? 'bg-[#4CAF50] text-white border-[#4CAF50]'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {w}{unitLabel}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-gray-500 leading-relaxed px-1">
                💡 O cálculo é feito automaticamente com base na tabela nutricional de 100{unitLabel}.
              </p>
            </div>
          )}

          {/* Real-time Macro calculation summary card */}
          <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-2xl p-4 text-white shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Total calculado ({currentGrams}{unitLabel})
                </span>
                <div className="text-2xl font-black text-white flex items-baseline gap-1 mt-0.5">
                  {calculatedMacros.cal}
                  <span className="text-xs font-semibold text-gray-300">kcal</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
            </div>

            {/* Macronutrients Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
              <div className="bg-white/5 rounded-xl p-2">
                <span className="text-[10px] text-amber-300 font-bold uppercase block">Proteína</span>
                <span className="text-sm font-extrabold text-white mt-0.5">{calculatedMacros.prot}g</span>
              </div>
              <div className="bg-white/5 rounded-xl p-2">
                <span className="text-[10px] text-emerald-300 font-bold uppercase block">Carbo</span>
                <span className="text-sm font-extrabold text-white mt-0.5">{calculatedMacros.carb}g</span>
              </div>
              <div className="bg-white/5 rounded-xl p-2">
                <span className="text-[10px] text-orange-300 font-bold uppercase block">Gordura</span>
                <span className="text-sm font-extrabold text-white mt-0.5">{calculatedMacros.fat}g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 flex gap-2.5 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-2xl text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-2 py-3 bg-linear-to-r from-[#4CAF50] to-[#2E7D32] hover:from-[#43A047] hover:to-[#1B5E20] text-white rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Check className="w-4 h-4" />
            {isEditing ? 'Atualizar Alimento' : 'Adicionar ao Diário'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
