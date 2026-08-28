import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Plus, 
  Sun, 
  Utensils, 
  Sunset, 
  Moon, 
  Trash2, 
  Flame, 
  Sparkles,
  Search,
  Zap,
  Edit3,
  Scale,
  Calendar,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { DayStats, FoodItem, MealKey, MealsState, NutritionGoals, ScreenType } from '../types';
import { getFormattedDate } from '../utils/nutrition';
import { Logo } from '../components/Logo';
import { FoodQuantityModal } from '../components/FoodQuantityModal';

interface FoodScreenProps {
  stats: DayStats;
  goals: NutritionGoals;
  meals: MealsState;
  onNavigate: (screen: ScreenType) => void;
  onOpenAddMeal: (meal?: MealKey, initialSearch?: string) => void;
  onRemoveFood: (meal: MealKey, index: number) => void;
  onEditFood?: (meal: MealKey, index: number, updatedFood: FoodItem) => void;
}

export const FoodScreen: React.FC<FoodScreenProps> = ({
  stats,
  goals,
  meals,
  onNavigate,
  onOpenAddMeal,
  onRemoveFood,
  onEditFood,
}) => {
  const currentDate = getFormattedDate();
  const [quickSearchText, setQuickSearchText] = useState('');

  // Editing item state
  const [editingItem, setEditingItem] = useState<{ mealKey: MealKey; index: number; food: FoodItem } | null>(null);

  const mealConfig: { key: MealKey; title: string; icon: any; iconColor: string; bgIcon: string }[] = [
    { key: 'breakfast', title: 'Café da manhã', icon: Sun, iconColor: 'text-amber-500', bgIcon: 'bg-amber-50' },
    { key: 'morningSnack', title: 'Lanche da manhã', icon: Sparkles, iconColor: 'text-emerald-500', bgIcon: 'bg-emerald-50' },
    { key: 'lunch', title: 'Almoço', icon: Utensils, iconColor: 'text-emerald-600', bgIcon: 'bg-emerald-50' },
    { key: 'snack', title: 'Café da tarde', icon: Sunset, iconColor: 'text-blue-500', bgIcon: 'bg-blue-50' },
    { key: 'dinner', title: 'Jantar', icon: Moon, iconColor: 'text-purple-600', bgIcon: 'bg-purple-50' },
    { key: 'supper', title: 'Ceia', icon: Moon, iconColor: 'text-indigo-600', bgIcon: 'bg-indigo-50' },
  ];

  // Calories math
  const consumed = stats.calories;
  const target = goals.calories;
  const remaining = Math.max(0, target - consumed);
  const calPercent = Math.min((consumed / target) * 100, 100);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchText.trim()) {
      onOpenAddMeal('lunch', quickSearchText.trim());
      setQuickSearchText('');
    } else {
      onOpenAddMeal();
    }
  };

  const handleConfirmEdit = (mealKey: MealKey, updatedFood: FoodItem) => {
    if (editingItem && onEditFood) {
      onEditFood(editingItem.mealKey, editingItem.index, updatedFood);
    }
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen pb-28 bg-[#F8F9FB]">
      {/* Header Premium Défi */}
      <header
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px) + 1.25rem, 1.25rem)' }}
        className="relative bg-linear-to-br from-[#4CAF50] to-[#2E7D32] p-5 text-white rounded-b-3xl shadow-md overflow-hidden"
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <Logo size={38} className="rounded-2xl shadow-xs" />
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Controle de Alimentos</h1>
              <p className="text-xs text-white/80 capitalize mt-0.5">{currentDate}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-[500px] mx-auto">
        {/* 1. Quick Search Box: "O que você comeu?" */}
        <section className="bg-white rounded-3xl p-4 border border-gray-200/70 shadow-xs space-y-2.5">
          <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-[#4CAF50]" />
            <span>Adicionar alimento rapidamente</span>
          </label>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="O que você comeu? (ex: Pizza, 2 ovos, Arroz...)"
              value={quickSearchText}
              onChange={(e) => setQuickSearchText(e.target.value)}
              className="w-full pl-4 pr-24 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-[#4CAF50] focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buscar</span>
            </button>
          </form>

          {/* Quick suggestions tags */}
          <div className="flex gap-1.5 overflow-x-auto pt-0.5 no-scrollbar">
            {['🍕 Pizza', '🍚 Arroz', '🫘 Feijão', '🍗 Frango', '🥚 Ovo', '🥖 Pão', '🍌 Banana', '🥤 Coca-Cola'].map((tag, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onOpenAddMeal('lunch', tag.replace(/^[^\s]+\s/, ''))}
                className="px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* 7. Controle da Meta Calórica e Macronutrientes */}
        <section className="bg-white rounded-3xl p-4.5 border border-gray-200/70 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-[#FF7043] to-[#FF8A65] text-white flex items-center justify-center shadow-xs shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-extrabold uppercase text-gray-400 tracking-wider">
                  Meta Calórica Diária
                </div>
                <div className="text-xl font-black text-gray-900 leading-tight mt-0.5">
                  {target.toLocaleString('pt-BR')} <span className="text-xs text-gray-400 font-medium">kcal</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-extrabold uppercase text-emerald-600 tracking-wider">
                Restante
              </div>
              <div className="text-xl font-black text-emerald-700 leading-tight mt-0.5">
                {remaining.toLocaleString('pt-BR')} <span className="text-xs text-emerald-600 font-medium">kcal</span>
              </div>
            </div>
          </div>

          {/* Progress Bar with Consumed vs Remaining */}
          <div>
            <div className="flex justify-between text-xs font-bold text-gray-600 mb-1.5">
              <span>Consumido: <strong className="text-gray-900">{consumed.toLocaleString('pt-BR')} kcal</strong></span>
              <span className="text-emerald-700">{Math.round(calPercent)}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#4CAF50] to-[#81C784] rounded-full transition-all duration-500"
                style={{ width: `${calPercent}%` }}
              />
            </div>
          </div>

          {/* 3 Macronutrient Progress Trackers */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
            {/* Proteína */}
            <div className="p-2.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-amber-800 uppercase">Proteína</span>
                <span className="text-[10px] text-amber-700 font-bold">
                  {Math.round((stats.protein / goals.protein) * 100)}%
                </span>
              </div>
              <div className="text-sm font-black text-gray-900">
                {Math.round(stats.protein)}g <span className="text-[10px] text-gray-400 font-normal">/ {goals.protein}g</span>
              </div>
              <div className="w-full h-1.5 bg-amber-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${Math.min((stats.protein / goals.protein) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Carboidratos */}
            <div className="p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase">Carboidrato</span>
                <span className="text-[10px] text-emerald-700 font-bold">
                  {Math.round((stats.carbs / goals.carbs) * 100)}%
                </span>
              </div>
              <div className="text-sm font-black text-gray-900">
                {Math.round(stats.carbs)}g <span className="text-[10px] text-gray-400 font-normal">/ {goals.carbs}g</span>
              </div>
              <div className="w-full h-1.5 bg-emerald-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min((stats.carbs / goals.carbs) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Gorduras */}
            <div className="p-2.5 rounded-2xl bg-orange-50/60 border border-orange-200/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-orange-800 uppercase">Gorduras</span>
                <span className="text-[10px] text-orange-700 font-bold">
                  {Math.round((stats.fat / goals.fat) * 100)}%
                </span>
              </div>
              <div className="text-sm font-black text-gray-900">
                {Math.round(stats.fat)}g <span className="text-[10px] text-gray-400 font-normal">/ {goals.fat}g</span>
              </div>
              <div className="w-full h-1.5 bg-orange-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${Math.min((stats.fat / goals.fat) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Big Action Button */}
        <button
          onClick={() => onOpenAddMeal()}
          className="w-full py-3.5 px-4 bg-linear-to-r from-[#4CAF50] to-[#2E7D32] hover:from-[#43A047] hover:to-[#1B5E20] text-white rounded-2xl text-sm font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Plus className="w-5 h-5" />
          Registrar Refeição no Diário
        </button>

        {/* 6. Diário Alimentar com Refeições do Dia */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
              Diário Alimentar — Hoje
            </h2>
            <span className="text-xs font-bold text-[#4CAF50]">
              {consumed} kcal totais
            </span>
          </div>

          {mealConfig.map(({ key, title, icon: Icon, iconColor, bgIcon }) => {
            const items = meals[key];
            const sectionCal = items.reduce((sum, i) => sum + (i.cal || 0), 0);
            const sectionProt = items.reduce((sum, i) => sum + (i.prot || 0), 0);
            const sectionCarb = items.reduce((sum, i) => sum + (i.carb || 0), 0);
            const sectionFat = items.reduce((sum, i) => sum + (i.fat || 0), 0);

            return (
              <section
                key={key}
                className="bg-white rounded-3xl border border-gray-200/80 shadow-2xs overflow-hidden transition-all"
              >
                {/* Refeição Header */}
                <div className="p-3.5 px-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-2xl ${bgIcon} ${iconColor} flex items-center justify-center shrink-0 shadow-2xs`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900">{title}</h3>
                      <p className="text-[11px] text-gray-400 font-medium">
                        {sectionCal} kcal • {Math.round(sectionProt)}g P • {Math.round(sectionCarb)}g C • {Math.round(sectionFat)}g G
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl">
                      {sectionCal} kcal
                    </span>
                    <button
                      onClick={() => onOpenAddMeal(key)}
                      title={`Adicionar a ${title}`}
                      className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-[#4CAF50] hover:text-white text-gray-600 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Refeição Itens */}
                <div className="p-3 divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <div className="py-3.5 text-center text-xs text-gray-400 space-y-1">
                      <p>Nenhum alimento registrado ainda.</p>
                      <button
                        onClick={() => onOpenAddMeal(key)}
                        className="text-[#4CAF50] font-bold text-xs hover:underline cursor-pointer"
                      >
                        + Adicionar itens ao {title}
                      </button>
                    </div>
                  ) : (
                    items.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-2.5 px-1.5 flex items-center justify-between group hover:bg-gray-50/70 rounded-2xl transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl shrink-0">{(item as any).icon || '🍽️'}</span>
                          <div>
                            <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5 flex-wrap">
                              <span>{item.name}</span>
                              {item.portion && (
                                <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
                                  {item.portion}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                              <span className="font-bold text-emerald-700">{item.cal} kcal</span>
                              <span>•</span>
                              <span>{item.prot}g P</span>
                              <span>•</span>
                              <span>{item.carb}g C</span>
                              <span>•</span>
                              <span>{item.fat}g G</span>
                            </div>
                          </div>
                        </div>

                        {/* Item Actions (Edit / Delete) */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingItem({ mealKey: key, index: idx, food: item })}
                            title="Editar quantidade"
                            className="w-7 h-7 rounded-lg text-gray-400 hover:text-[#4CAF50] hover:bg-emerald-50 flex items-center justify-center transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRemoveFood(key, idx)}
                            title="Excluir alimento"
                            className="w-7 h-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* Editing Food Quantity Modal */}
      {editingItem && (
        <FoodQuantityModal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          food={editingItem.food}
          targetMeal={editingItem.mealKey}
          onConfirm={handleConfirmEdit}
          initialGrams={editingItem.food.selectedWeight}
          initialPortion={editingItem.food.portion}
          isEditing={true}
        />
      )}
    </div>
  );
};
