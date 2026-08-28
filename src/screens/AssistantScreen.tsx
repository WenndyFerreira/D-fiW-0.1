import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Bot,
  Send,
  Flame,
  Droplet,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  TrendingDown,
  Scale,
  RefreshCw,
  Utensils,
  ShieldAlert,
  ArrowRight,
  Check,
  Target,
  User
} from 'lucide-react';
import defiBotAvatar from '../assets/images/defi_bot_headshot_1786816222255.jpg';
import {
  DayStats,
  FoodItem,
  MealKey,
  MealsState,
  NutritionGoals,
  ScreenType,
  SmartMealSuggestion,
  UserProfile,
  AssistantChatMessage,
} from '../types';
import { Logo } from '../components/Logo';
import {
  getAssistantDailyAnalysis,
  answerDefiAssistantQuestion,
  getObjectiveInfo,
  generateSmartMealSuggestion,
} from '../utils/defiAssistantEngine';

interface AssistantScreenProps {
  user: UserProfile;
  goals: NutritionGoals;
  stats: DayStats;
  meals: MealsState;
  onNavigate: (screen: ScreenType) => void;
  onAddWater: () => void;
  onOpenAddMealForSlot?: (mealKey: MealKey) => void;
  onAddSmartMealToDiary: (suggestion: SmartMealSuggestion) => void;
  onUpdateObjective?: (newObjective: string) => void;
}

export const AssistantScreen: React.FC<AssistantScreenProps> = ({
  user,
  goals,
  stats,
  meals,
  onNavigate,
  onAddWater,
  onOpenAddMealForSlot,
  onAddSmartMealToDiary,
  onUpdateObjective,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [addedSuggestionId, setAddedSuggestionId] = useState<string | null>(null);
  const [showObjectiveSelector, setShowObjectiveSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const analysis = getAssistantDailyAnalysis(user, goals, stats, meals);
  const [activeSuggestion, setActiveSuggestion] = useState<SmartMealSuggestion>(analysis.smartMealSuggestion);

  // Chat message history initialized with contextual greeting
  const [messages, setMessages] = useState<AssistantChatMessage[]>(() => {
    const defaultGreeting = `👋 **${analysis.greeting}, ${analysis.firstName}!**\n\nEu sou o **Défi Robô**, seu copiloto de nutrição diária. Acompanho seu objetivo de **${analysis.objectiveInfo.title}** em tempo real.\n\n📊 **Hoje você já consumiu:**\n• Calorias: **${stats.calories} / ${goals.calories} kcal** (Restam ${analysis.remainingCal} kcal)\n• Proteínas: **${Math.round(stats.protein)} / ${goals.protein}g** (Faltam ${Math.round(analysis.remainingProt)}g)\n• Água: **${stats.water.toFixed(1).replace('.', ',')} / ${goals.water.toFixed(1).replace('.', ',')} L**\n\n💡 Me diga o que você comeu (ex: *"comi arroz e frango porção média"* ou *"porção grande de feijão, arroz e bife"*) que eu calculo e adiciono na hora ao seu diário!\n\n${analysis.recommendationMessage}`;

    return [
      {
        id: 'msg-init',
        sender: 'assistant',
        text: defaultGreeting,
        timestamp: Date.now(),
        suggestion: analysis.smartMealSuggestion,
        quickQuestions: [
          'Comi arroz e frango porção média',
          'O que é porção grande, média e pequena?',
          'Quanto de proteína ainda preciso?',
          'O que posso comer agora?'
        ]
      }
    ];
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    // Handle Quick Action if query is "+300ml de água"
    if (query === '+300ml de água') {
      onAddWater();
    }

    const userMessage: AssistantChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const response = answerDefiAssistantQuestion(query, user, goals, stats, meals);
      const assistantMessage: AssistantChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: Date.now(),
        suggestion: response.suggestion,
        quickQuestions: response.quickQuestions,
      };

      if (response.suggestion) {
        setActiveSuggestion(response.suggestion);
      }

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 450);
  };

  const handleAddSuggestionToDiary = (suggestion: SmartMealSuggestion) => {
    onAddSmartMealToDiary(suggestion);
    setAddedSuggestionId(suggestion.id);
    setTimeout(() => {
      setAddedSuggestionId(null);
    }, 3000);

    // Notify in chat
    const confirmMessage: AssistantChatMessage = {
      id: `ast-confirm-${Date.now()}`,
      sender: 'assistant',
      text: `✅ **Refeição adicionada ao diário alimentar com sucesso!**\n\nAdicionei os itens à sua refeição de **${
        suggestion.targetMealKey === 'breakfast'
          ? 'Café da Manhã'
          : suggestion.targetMealKey === 'lunch'
          ? 'Almoço'
          : suggestion.targetMealKey === 'snack'
          ? 'Lanche'
          : suggestion.targetMealKey === 'dinner'
          ? 'Jantar'
          : 'Ceia'
      }** somando +${suggestion.totalCal} kcal e +${suggestion.totalProt}g de proteína.`,
      timestamp: Date.now(),
      quickQuestions: [
        'Estou dentro da minha meta?',
        'Como está minha hidratação?'
      ]
    };
    setMessages((prev) => [...prev, confirmMessage]);
  };

  const handleRefreshSuggestion = () => {
    const newSug = generateSmartMealSuggestion(goals, stats, meals, user);
    setActiveSuggestion(newSug);
  };

  const objectivesList = [
    { id: 'Emagrecer', title: 'Emagrecer', icon: '🔥', desc: 'Déficit calórico com alta proteína' },
    { id: 'Ganhar massa muscular', title: 'Ganhar massa muscular', icon: '💪', desc: 'Superávit calórico e hipertrofia' },
    { id: 'Manter o peso', title: 'Manter o peso', icon: '⚖️', desc: 'Equilíbrio calórico e sustentabilidade' },
    { id: 'Recomposição corporal', title: 'Recomposição corporal', icon: '🎯', desc: 'Perda de gordura e ganho de massa magra' },
  ];

  return (
    <div className="min-h-screen pb-28 bg-[#F8F9FB] flex flex-col">
      {/* Header Premium do Assistente */}
      <header
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px) + 1.25rem, 1.25rem)' }}
        className="relative bg-linear-to-br from-[#1E293B] via-[#0F172A] to-[#1E3A8A] p-5 pb-6 text-white rounded-b-3xl shadow-lg overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between mb-3.5 pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={defiBotAvatar}
                alt="Défi Robô Assistente"
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-2xl object-cover border-2 border-emerald-400/80 shadow-md bg-white"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0F172A] flex items-center justify-center shadow-xs">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  Défi Robô
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  AI Nutri Coach
                </span>
              </div>
              <p className="text-[10px] text-white/70">Acompanhamento e montagem inteligente de refeições</p>
            </div>
          </div>

          {/* Objective Switcher Button */}
          <button
            onClick={() => setShowObjectiveSelector(!showObjectiveSelector)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs font-semibold border border-white/15 transition-colors cursor-pointer"
          >
            <span>{analysis.objectiveInfo.emoji}</span>
            <span className="max-w-[90px] truncate text-[11px] font-bold">
              {analysis.objectiveInfo.title}
            </span>
          </button>
        </div>

        {/* Objective Selector Modal/Dropdown */}
        {showObjectiveSelector && onUpdateObjective && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-20 mb-3 bg-white text-gray-900 rounded-2xl p-3 shadow-xl border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-700">Qual é o seu objetivo?</span>
              <button
                onClick={() => setShowObjectiveSelector(false)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {objectivesList.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => {
                    onUpdateObjective(obj.id);
                    setShowObjectiveSelector(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition-all text-xs cursor-pointer ${
                    user.objective?.toLowerCase().includes(obj.id.toLowerCase().substring(0, 5))
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold'
                      : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                  }`}
                >
                  <span className="text-base">{obj.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="leading-tight font-semibold">{obj.title}</div>
                    <div className="text-[10px] text-gray-400 font-normal truncate">{obj.desc}</div>
                  </div>
                  {user.objective?.toLowerCase().includes(obj.id.toLowerCase().substring(0, 5)) && (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Live Daily Macro Balance Cards */}
        <div className="relative z-10 grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/10">
            <div className="text-[10px] text-white/70 uppercase font-semibold">Calorias</div>
            <div className="text-sm font-black text-white mt-0.5">
              {stats.calories} <span className="text-[10px] font-normal text-white/60">/ {goals.calories}</span>
            </div>
            <div className="text-[10px] font-extrabold text-emerald-300 mt-0.5">
              {analysis.remainingCal > 0 ? `-${analysis.remainingCal} kcal` : 'Meta batida'}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/10">
            <div className="text-[10px] text-white/70 uppercase font-semibold">Proteína</div>
            <div className="text-sm font-black text-white mt-0.5">
              {Math.round(stats.protein)}g <span className="text-[10px] font-normal text-white/60">/ {goals.protein}g</span>
            </div>
            <div className="text-[10px] font-extrabold text-amber-300 mt-0.5">
              {analysis.remainingProt > 0 ? `Faltam ${Math.round(analysis.remainingProt)}g` : 'Meta batida'}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/10">
            <div className="text-[10px] text-white/70 uppercase font-semibold">Água</div>
            <div className="text-sm font-black text-white mt-0.5">
              {stats.water.toFixed(1).replace('.', ',')} <span className="text-[10px] font-normal text-white/60">/ {goals.water.toFixed(1).replace('.', ',')}L</span>
            </div>
            <div className="text-[10px] font-extrabold text-blue-300 mt-0.5">
              {analysis.remainingWater > 0 ? `Faltam ${analysis.remainingWater.toFixed(1).replace('.', ',')}L` : 'Hidratado'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-4 py-4 space-y-4 max-w-[480px] w-full mx-auto flex-1">
        {/* 1. Alertas Ativos Inteligentes */}
        {analysis.alerts.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-1.5 px-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                Avisos Inteligentes do Dia
              </h3>
            </div>

            <div className="space-y-2">
              {analysis.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-2xl border shadow-2xs flex items-start gap-3 transition-all ${
                    alert.severity === 'warning'
                      ? 'bg-amber-50/80 border-amber-200/80 text-amber-900'
                      : alert.severity === 'success'
                      ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-900'
                      : 'bg-blue-50/80 border-blue-200/80 text-blue-900'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                      alert.severity === 'warning'
                        ? 'bg-amber-500 text-white'
                        : alert.severity === 'success'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {alert.severity === 'warning' && <AlertTriangle className="w-4 h-4" />}
                    {alert.severity === 'success' && <CheckCircle2 className="w-4 h-4" />}
                    {alert.severity === 'info' && <Info className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold leading-snug">{alert.title}</h4>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed font-medium">
                      {alert.message}
                    </p>

                    {alert.actionLabel && (
                      <div className="mt-2">
                        {alert.suggestedAction === 'add_water' && (
                          <button
                            onClick={onAddWater}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            {alert.actionLabel}
                          </button>
                        )}
                        {alert.suggestedAction === 'open_meal_add' && onOpenAddMealForSlot && (
                          <button
                            onClick={() => onOpenAddMealForSlot(alert.targetMealKey || 'breakfast')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#4CAF50] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#388E3C] active:scale-95 transition-all cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            {alert.actionLabel}
                          </button>
                        )}
                        {alert.suggestedAction === 'suggest_meal' && (
                          <button
                            onClick={() => handleSendMessage('O que posso comer agora?')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-gray-800 active:scale-95 transition-all cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            {alert.actionLabel}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. Card Montador de Refeição Sob Medida */}
        <section className="bg-white rounded-2xl p-4.5 border border-emerald-200/70 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <img
                  src={defiBotAvatar}
                  alt="Défi Robô Chef"
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-xl object-cover border border-emerald-300 shadow-xs bg-white"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wide">
                    Montar Refeição Sob Medida
                  </h3>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                    Défi Robô
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">
                  Calculada para caber no seu saldo restante
                </span>
              </div>
            </div>

            <button
              onClick={handleRefreshSuggestion}
              title="Gerar outra opção com Défi Robô"
              className="p-1 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100 mt-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-gray-900">{activeSuggestion.title}</span>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {activeSuggestion.totalCal} kcal
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1 font-medium leading-relaxed">
              {activeSuggestion.description}
            </p>

            {/* Food items breakdown */}
            <div className="mt-2.5 space-y-1.5 pt-2 border-t border-emerald-200/50">
              {activeSuggestion.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700 font-medium">{item.portionDescription}</span>
                  <span className="text-gray-500 font-semibold text-[11px]">
                    ~{item.cal} kcal • {item.prot}g prot
                  </span>
                </div>
              ))}
            </div>

            {/* Action button: Add to diary */}
            <button
              onClick={() => handleAddSuggestionToDiary(activeSuggestion)}
              disabled={addedSuggestionId === activeSuggestion.id}
              className={`w-full mt-3 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                addedSuggestionId === activeSuggestion.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#4CAF50] hover:bg-[#388E3C] text-white active:scale-98'
              }`}
            >
              {addedSuggestionId === activeSuggestion.id ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Adicionado ao diário alimentar!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Adicionar esta refeição ao diário</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* 3. Conversa com o Défi Assistente (Chat Interativo) */}
        <section className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <img
                  src={defiBotAvatar}
                  alt="Défi Robô"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-emerald-300 shadow-2xs bg-white"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 leading-tight flex items-center gap-1.5">
                  Pergunte ao Défi Robô
                </h3>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online • Montador de Refeições
                </span>
              </div>
            </div>

            <button
              onClick={() => handleSendMessage('Estou dentro da minha meta?')}
              className="text-[11px] font-bold text-[#4CAF50] hover:underline cursor-pointer"
            >
              Resumo do dia
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse items-start' : 'items-start'}`}
              >
                {/* Avatar */}
                {msg.sender === 'assistant' ? (
                  <div className="relative shrink-0 mt-0.5">
                    <img
                      src={defiBotAvatar}
                      alt="Défi Robô"
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-emerald-300 shadow-2xs bg-white"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                ) : (
                  <div className="relative shrink-0 mt-0.5">
                    {user.photo ? (
                      <img
                        src={user.photo}
                        alt={user.name || 'Você'}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shadow-2xs"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-600 to-[#2E7D32] text-white font-bold text-xs flex items-center justify-center border-2 border-emerald-300 shadow-2xs">
                        {user.name ? user.name.trim().charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className={`flex flex-col max-w-[82%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Sender Name label */}
                  <span className="text-[10px] font-semibold text-gray-400 mb-1 px-1">
                    {msg.sender === 'assistant' ? 'Défi Robô' : (user.name ? user.name.split(' ')[0] : 'Você')}
                  </span>

                  <div
                    className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-linear-to-r from-[#4CAF50] to-[#2E7D32] text-white rounded-tr-xs font-medium shadow-2xs'
                        : 'bg-gray-50 border border-gray-200/80 text-gray-800 rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    {msg.text}

                    {/* Suggestion Card inside chat */}
                    {msg.suggestion && (
                      <div className="mt-2.5 p-3 bg-white rounded-xl border border-emerald-200 text-gray-900 shadow-xs">
                        <div className="flex items-center justify-between font-bold text-xs text-emerald-800">
                          <span className="flex items-center gap-1.5 truncate">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{msg.suggestion.title}</span>
                          </span>
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ml-1">
                            {msg.suggestion.totalCal} kcal
                          </span>
                        </div>

                        <div className="text-[11px] text-gray-600 mt-2 space-y-1 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/60">
                          {msg.suggestion.items.map((it, i) => (
                            <div key={i} className="flex justify-between items-center text-[11px]">
                              <span className="truncate text-gray-800 font-medium">• {it.portionDescription}</span>
                              <span className="text-gray-500 font-semibold shrink-0 ml-2">{it.cal} kcal</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 mt-2 px-0.5">
                          <span>🍗 {msg.suggestion.totalProt}g Prot</span>
                          <span>🍞 {msg.suggestion.totalCarb}g Carb</span>
                          <span>🥑 {msg.suggestion.totalFat}g Gord</span>
                        </div>

                        <button
                          onClick={() => handleAddSuggestionToDiary(msg.suggestion!)}
                          disabled={addedSuggestionId === msg.suggestion.id}
                          className={`mt-2.5 w-full py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                            addedSuggestionId === msg.suggestion.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white active:scale-[0.98]'
                          }`}
                        >
                          {addedSuggestionId === msg.suggestion.id ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Adicionado ao Diário!
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" /> Adicionar ao Diário (+{msg.suggestion.totalCal} kcal)
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quick questions chips */}
                  {msg.quickQuestions && msg.quickQuestions.length > 0 && msg.id === messages[messages.length - 1].id && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.quickQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(q)}
                          className="text-[11px] font-semibold bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200/80 transition-colors cursor-pointer text-left shadow-2xs"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start gap-2.5 text-gray-500 text-xs">
                <img
                  src={defiBotAvatar}
                  alt="Défi Robô"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-emerald-300 shrink-0 mt-0.5 shadow-2xs bg-white"
                />
                <div className="bg-gray-50 border border-gray-200/80 rounded-2xl rounded-tl-xs px-3.5 py-2.5 flex items-center gap-2 shadow-2xs">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-600">Défi Robô calculando refeição...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="pt-2 border-t border-gray-100 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Pergunte ao Défi Robô (ex: O que almoçar hoje?)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-[#4CAF50] outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-9 h-9 rounded-xl bg-linear-to-r from-[#4CAF50] to-[#388E3C] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>

        {/* 4. Disclaimer de Saúde e Responsabilidade */}
        <section className="bg-gray-100/70 rounded-xl p-3 text-center border border-gray-200/60 text-[11px] text-gray-500 font-medium leading-relaxed">
          <div className="flex items-center justify-center gap-1 text-gray-600 font-bold mb-0.5">
            <ShieldAlert className="w-3.5 h-3.5 text-gray-400" />
            <span>Orientação Consciente</span>
          </div>
          O Défi Assistente utiliza os dados registrados por você para sugerir opções equilibradas e não incentiva dietas ou restrições extremas. Para planos clínicos individualizados, consulte sempre um nutricionista ou médico.
        </section>
      </main>
    </div>
  );
};
