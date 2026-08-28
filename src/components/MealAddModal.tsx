import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sun, 
  Utensils, 
  Sunset, 
  Moon, 
  Plus, 
  Search,
  Check,
  Sparkles,
  Zap,
  Flame,
  Scale,
  RotateCcw,
  ArrowRight,
  Info,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { FoodItem, MealKey } from '../types';
import { COMMON_FOOD_DATABASE, FoodWithPortions, getDefaultPortionsForFood } from '../data/portionFoodDB';
import { parseNaturalFoodText, ParseResult, ParsedItem } from '../utils/textFoodParser';
import { FoodQuantityModal } from './FoodQuantityModal';

interface MealAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (meal: MealKey, food: FoodItem, quantity?: number) => void;
  defaultMeal?: MealKey | null;
  initialSearchQuery?: string;
}

export const MealAddModal: React.FC<MealAddModalProps> = ({
  isOpen,
  onClose,
  onAddFood,
  defaultMeal = null,
  initialSearchQuery = '',
}) => {
  const [selectedMeal, setSelectedMeal] = useState<MealKey>(defaultMeal || 'lunch');
  const [activeTab, setActiveTab] = useState<'search' | 'quickText' | 'custom'>('search');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Quantity modal state
  const [selectedFoodForQuantity, setSelectedFoodForQuantity] = useState<FoodItem | null>(null);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);

  // Quick Text Natural Input state
  const [quickTextInput, setQuickTextInput] = useState('');
  const [parsedResult, setParsedResult] = useState<ParseResult | null>(null);
  const [quickTextPendingItems, setQuickTextPendingItems] = useState<ParsedItem[]>([]);

  // Custom Food Form
  const [customName, setCustomName] = useState('');
  const [customCal, setCustomCal] = useState('');
  const [customProt, setCustomProt] = useState('');
  const [customCarb, setCustomCarb] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customFiber, setCustomFiber] = useState('');
  const [customPortion, setCustomPortion] = useState('1 porção (100g)');
  const [customGrams, setCustomGrams] = useState('100');

  useEffect(() => {
    if (isOpen) {
      if (defaultMeal) setSelectedMeal(defaultMeal);
      if (initialSearchQuery) setSearchQuery(initialSearchQuery);
      setParsedResult(null);
      setQuickTextPendingItems([]);
    }
  }, [isOpen, defaultMeal, initialSearchQuery]);

  if (!isOpen) return null;

  const mealOptions = [
    { key: 'breakfast' as MealKey, name: 'Café da manhã', icon: Sun, color: 'text-amber-500 bg-amber-50' },
    { key: 'morningSnack' as MealKey, name: 'Lanche da manhã', icon: Sparkles, color: 'text-emerald-500 bg-emerald-50' },
    { key: 'lunch' as MealKey, name: 'Almoço', icon: Utensils, color: 'text-emerald-600 bg-emerald-50' },
    { key: 'snack' as MealKey, name: 'Café da tarde', icon: Sunset, color: 'text-blue-500 bg-blue-50' },
    { key: 'dinner' as MealKey, name: 'Jantar', icon: Moon, color: 'text-purple-600 bg-purple-50' },
    { key: 'supper' as MealKey, name: 'Ceia', icon: Moon, color: 'text-indigo-600 bg-indigo-50' },
  ];

  // Combined food pool with quick search indexing
  const allFoodsList: FoodItem[] = COMMON_FOOD_DATABASE;

  // Filter foods by query & category
  const filteredFoods = allFoodsList.filter((f) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      f.name.toLowerCase().includes(q) || 
      (f as any).aliases?.some((a: string) => a.toLowerCase().includes(q));

    const matchesCat = selectedCategory === 'all' || 
      f.category === selectedCategory || 
      (f as any).subCat === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const handleOpenQuantity = (food: FoodItem) => {
    setSelectedFoodForQuantity(food);
    setIsQuantityModalOpen(true);
  };

  const handleConfirmQuantity = (mealKey: MealKey, finalFood: FoodItem) => {
    onAddFood(mealKey, finalFood, 1);
    setIsQuantityModalOpen(false);
    setSelectedFoodForQuantity(null);
    onClose();
  };

  // Process natural text parse
  const handleParseText = (textToParse: string) => {
    const res = parseNaturalFoodText(textToParse);
    setParsedResult(res);
    setQuickTextPendingItems(res.items);
  };

  const handleRemoveQuickItem = (id: string) => {
    setQuickTextPendingItems(prev => prev.filter(i => i.id !== id));
  };

  const handleConfirmQuickAdd = () => {
    if (quickTextPendingItems.length === 0) return;
    quickTextPendingItems.forEach(item => {
      onAddFood(selectedMeal, item.foodItem, 1);
    });
    onClose();
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const grams = parseFloat(customGrams) || 100;
    const cal = Math.round(parseFloat(customCal) || 0);
    const prot = parseFloat(customProt) || 0;
    const carb = parseFloat(customCarb) || 0;
    const fat = parseFloat(customFat) || 0;
    const fiber = parseFloat(customFiber) || 0;

    const newFood: FoodItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      cal,
      prot,
      carb,
      fat,
      fiber,
      portion: customPortion.trim() || `${grams}g`,
      selectedWeight: grams,
      baseCal: cal,
      baseProt: prot,
      baseCarb: carb,
      baseFat: fat,
      baseFiber: fiber,
      baseGrams: grams,
      category: 'custom',
      portions: [
        { label: customPortion.trim() || '1 porção', unitName: 'porção', grams: grams, isDefault: true },
        { label: '100g', unitName: '100g', grams: 100 },
      ]
    };

    onAddFood(selectedMeal, newFood, 1);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-[500px] bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/60">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Registrar Alimento
                </h3>
                <p className="text-xs text-gray-500">
                  Refeição selecionada: <strong className="text-emerald-700">{mealOptions.find(m => m.key === selectedMeal)?.name}</strong>
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Meal Selector Chips */}
            <div className="flex gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar">
              {mealOptions.map((m) => {
                const isSelected = selectedMeal === m.key;
                const Icon = m.icon;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setSelectedMeal(m.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-[#4CAF50] text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Tabs (Search, Quick Text, Custom) */}
            <div className="grid grid-cols-3 gap-1.5 bg-gray-200/70 p-1 rounded-2xl mt-3">
              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'search'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pesquisa</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('quickText')}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'quickText'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Texto Rápido</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'custom'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Personalizado</span>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* TAB 1: Search */}
            {activeTab === 'search' && (
              <div className="space-y-3.5">
                {/* 1. Main Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                  <input
                    type="text"
                    placeholder="O que você comeu?"
                    value={searchQuery}
                    autoFocus
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-emerald-50/40 border-2 border-emerald-400/80 rounded-2xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-[#4CAF50] focus:ring-4 focus:ring-emerald-100 outline-none transition-all placeholder:text-gray-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs px-1.5 py-0.5 rounded-full bg-gray-200"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'vegan', label: '🌱 Vegano & Vegetariano' },
                    { id: 'proteins', label: '🥩 Carnes & Ovos' },
                    { id: 'carbs', label: '🍚 Arroz & Grãos' },
                    { id: 'veggie', label: '🥦 Legumes & Verduras' },
                    { id: 'fruit', label: '🍎 Frutas' },
                    { id: 'dairy', label: '🥛 Laticínios' },
                    { id: 'fast_food', label: '🍕 Lanches & Pizzas' },
                    { id: 'drink', label: '🥤 Bebidas' },
                    { id: 'fats_oils', label: '🫒 Azeites & Óleos' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-[#4CAF50] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Food Results List */}
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {filteredFoods.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 space-y-2">
                      <p className="text-sm font-medium">Nenhum alimento encontrado para "{searchQuery}"</p>
                      <button
                        onClick={() => {
                          setCustomName(searchQuery);
                          setActiveTab('custom');
                        }}
                        className="text-xs font-bold text-[#4CAF50] hover:underline"
                      >
                        + Cadastrar "{searchQuery}" como alimento personalizado
                      </button>
                    </div>
                  ) : (
                    filteredFoods.map((item, idx) => {
                      const hasPortions = (item as any).portions && (item as any).portions.length > 0;
                      const defaultPortion = (item as any).portions?.find((p: any) => p.isDefault) || (item as any).portions?.[0];

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleOpenQuantity(item)}
                          className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 hover:border-emerald-400 bg-white hover:bg-emerald-50/30 transition-all text-left group shadow-2xs cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl shrink-0">{(item as any).icon || '🍽️'}</span>
                            <div>
                              <div className="font-bold text-gray-900 text-sm group-hover:text-emerald-800 flex items-center gap-1.5 flex-wrap">
                                <span>{item.name}</span>
                                {item.portion && (
                                  <span className="text-[11px] font-normal text-gray-400">
                                    ({item.portion})
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center flex-wrap gap-x-2">
                                <span className="font-extrabold text-[#4CAF50]">
                                  {item.cal} kcal
                                </span>
                                <span>•</span>
                                <span>{item.prot}g P</span>
                                <span>•</span>
                                <span>{item.carb}g C</span>
                                <span>•</span>
                                <span>{item.fat}g G</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                              Informar Qtd
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Quick Text Entry (NLP) */}
            {activeTab === 'quickText' && (
              <div className="space-y-4">
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Registro Rápido por Texto
                  </div>
                  <p className="text-amber-800 text-[11px]">
                    Escreva o que você comeu em linguagem natural. O sistema reconhece os alimentos, quantidades e medidas caseiras automaticamente!
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 block">
                    Digite o que consumiu:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Comi 2 fatias de pizza e uma lata de Coca-Cola"
                    value={quickTextInput}
                    onChange={(e) => setQuickTextInput(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:border-[#4CAF50] focus:ring-2 focus:ring-emerald-100 outline-none resize-none font-medium"
                  />

                  {/* Suggestion Chips */}
                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      '2 fatias de pizza e 1 lata de coca',
                      '2 ovos cozidos e 1 pão francês',
                      '150g de frango e 2 colheres de arroz',
                      '1 banana e 1 copo de leite',
                    ].map((example, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setQuickTextInput(example);
                          handleParseText(example);
                        }}
                        className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
                      >
                        "{example}"
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleParseText(quickTextInput)}
                    disabled={!quickTextInput.trim()}
                    className="w-full py-3 bg-[#4CAF50] hover:bg-[#388E3C] disabled:opacity-50 text-white rounded-2xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Identificar Alimentos
                  </button>
                </div>

                {/* Parsed Results Confirmation Card */}
                {parsedResult && (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3 mt-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <span className="text-xs font-bold text-gray-800">
                        Você quis dizer:
                      </span>
                      <span className="text-xs font-black text-[#4CAF50]">
                        Total: {quickTextPendingItems.reduce((s, i) => s + i.cal, 0)} kcal
                      </span>
                    </div>

                    {quickTextPendingItems.length === 0 ? (
                      <div className="py-3 text-center text-xs text-gray-500">
                        Nenhum item reconhecido com segurança. Tente digitar alimentos como "pizza", "arroz", "frango", "ovo", etc.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {quickTextPendingItems.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">{item.icon}</span>
                              <div>
                                <div className="text-xs font-bold text-gray-900">
                                  {item.name} — <span className="text-gray-600 font-normal">{item.amount} {item.unit} ({item.grams}g)</span>
                                </div>
                                <div className="text-[10px] text-gray-500">
                                  {item.prot}g P • {item.carb}g C • {item.fat}g G
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-emerald-700">
                                {item.cal} kcal
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveQuickItem(item.id)}
                                className="text-gray-400 hover:text-red-500 text-xs p-1"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {parsedResult.unrecognizedText && (
                      <div className="p-2 rounded-lg bg-amber-50 text-[11px] text-amber-800 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Não identificado: "{parsedResult.unrecognizedText.join(', ')}"</span>
                      </div>
                    )}

                    {quickTextPendingItems.length > 0 && (
                      <div className="pt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setParsedResult(null);
                            setQuickTextPendingItems([]);
                          }}
                          className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmQuickAdd}
                          className="flex-2 py-2.5 bg-[#4CAF50] hover:bg-[#388E3C] text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Adicionar ao Diário
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Custom Food */}
            {activeTab === 'custom' && (
              <form onSubmit={handleCreateCustom} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Nome do Alimento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Torta de frango caseira"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#4CAF50] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Calorias (kcal) *</label>
                    <input
                      type="number"
                      required
                      placeholder="Ex: 280"
                      value={customCal}
                      onChange={(e) => setCustomCal(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#4CAF50] outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Peso da Porção (g)</label>
                    <input
                      type="number"
                      placeholder="100"
                      value={customGrams}
                      onChange={(e) => setCustomGrams(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#4CAF50] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Descrição da Porção</label>
                  <input
                    type="text"
                    placeholder="Ex: 1 fatia média (~120g)"
                    value={customPortion}
                    onChange={(e) => setCustomPortion(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#4CAF50] outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-700 uppercase">Proteína (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={customProt}
                      onChange={(e) => setCustomProt(e.target.value)}
                      className="w-full p-2 bg-amber-50/50 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-emerald-700 uppercase">Carboidrato (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={customCarb}
                      onChange={(e) => setCustomCarb(e.target.value)}
                      className="w-full p-2 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs font-bold focus:bg-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-orange-700 uppercase">Gordura (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={customFat}
                      onChange={(e) => setCustomFat(e.target.value)}
                      className="w-full p-2 bg-orange-50/50 border border-orange-200 rounded-xl text-xs font-bold focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('search')}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Voltar à Pesquisa
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#4CAF50] hover:bg-[#388E3C] text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Salvar e Adicionar
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quantity & Household portion modal */}
      {isQuantityModalOpen && selectedFoodForQuantity && (
        <FoodQuantityModal
          isOpen={isQuantityModalOpen}
          onClose={() => setIsQuantityModalOpen(false)}
          food={selectedFoodForQuantity}
          targetMeal={selectedMeal}
          onConfirm={handleConfirmQuantity}
        />
      )}
    </>
  );
};
