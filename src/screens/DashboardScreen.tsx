import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Flame, 
  Droplet, 
  TrendingDown, 
  Activity, 
  Scale, 
  Sparkles, 
  Sun, 
  Utensils, 
  Sunset, 
  Moon, 
  User as UserIcon,
  RefreshCw,
  Plus,
  Bell,
  BellRing,
  BellOff
} from 'lucide-react';
import { DayStats, MealsState, NutritionGoals, ScreenType, UserProfile } from '../types';
import { calculateBMI, getGreeting, getFormattedDate } from '../utils/nutrition';
import { Logo } from '../components/Logo';

const MASCOTE_MESSAGES = [
  'Beba água regularmente para manter seu metabolismo ativo e facilitar a saciedade!',
  'Priorize proteínas magras em todas as refeições para preservar sua massa magra durante o déficit.',
  'Pequenas escolhas diárias consistentes geram transformações gigantescas a longo prazo.',
  'Não se preocupe com a perfeição em um único dia. O segredo da evolução é a constância!',
  'Durma bem: uma boa noite de sono regula os hormônios da fome (grelina e leptina) e melhora a queima de gordura.',
  'Adicione fibras e vegetais no prato para melhorar a digestão e prolongar a saciedade.',
];

interface DashboardScreenProps {
  user: UserProfile;
  goals: NutritionGoals;
  stats: DayStats;
  meals: MealsState;
  streak: number;
  onAddWater: () => void;
  onNavigate: (screen: ScreenType) => void;
  onOpenAddMeal: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  goals,
  stats,
  meals,
  streak,
  onAddWater,
  onNavigate,
  onOpenAddMeal,
}) => {
  const [mascoteIdx, setMascoteIdx] = useState(0);
  const [waterReminderEnabled, setWaterReminderEnabled] = useState(() => {
    return localStorage.getItem('defiw_water_reminder') === 'true';
  });
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const greeting = getGreeting();
  const currentDate = getFormattedDate();
  const firstName = user.name ? user.name.split(' ')[0] : 'Atleta';

  const weightNum = parseFloat(String(user.weight)) || 70;
  const heightNum = parseFloat(String(user.height)) || 170;
  const bmiInfo = calculateBMI(weightNum, heightNum);

  // Calculations
  const calPct = Math.min((stats.calories / goals.calories) * 100, 100);
  const isOverCal = stats.calories > goals.calories;
  const deficit = goals.calories - stats.calories;

  const protPct = Math.min((stats.protein / goals.protein) * 100, 100);
  const carbPct = Math.min((stats.carbs / goals.carbs) * 100, 100);
  const fatPct = Math.min((stats.fat / goals.fat) * 100, 100);

  // Meal totals
  const mealCal = {
    breakfast: (meals.breakfast || []).reduce((sum, item) => sum + item.cal, 0),
    morningSnack: (meals.morningSnack || []).reduce((sum, item) => sum + item.cal, 0),
    lunch: (meals.lunch || []).reduce((sum, item) => sum + item.cal, 0),
    snack: (meals.snack || []).reduce((sum, item) => sum + item.cal, 0),
    dinner: (meals.dinner || []).reduce((sum, item) => sum + item.cal, 0),
    supper: (meals.supper || []).reduce((sum, item) => sum + item.cal, 0),
  };

  // Water drop calculation (10 drops max)
  const totalDrops = 10;
  const filledDrops = Math.min(
    totalDrops,
    Math.round((stats.water / goals.water) * totalDrops)
  );

  // Circular progress math
  const radius = 75;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(calPct, 100) / 100) * circumference;

  const nextMascoteTip = () => {
    setMascoteIdx((prev) => (prev + 1) % MASCOTE_MESSAGES.length);
  };

  const toggleWaterReminder = () => {
    const nextState = !waterReminderEnabled;
    setWaterReminderEnabled(nextState);
    localStorage.setItem('defiw_water_reminder', String(nextState));

    if (nextState) {
      if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
      setNotificationMsg('Lembretes de hidratação ativados! Vamos te avisar para beber água periodicamente.');
    } else {
      setNotificationMsg('Lembretes de hidratação desativados.');
    }

    setTimeout(() => {
      setNotificationMsg(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen pb-24 bg-[#F8F9FB]">
      {/* Header Premium */}
      <header
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px) + 1.25rem, 1.25rem)' }}
        className="relative bg-linear-to-br from-[#4CAF50] to-[#2E7D32] p-5 pb-6 text-white rounded-b-3xl shadow-md overflow-hidden"
      >
        {/* Background decorative circles */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-xs" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full blur-xs" />

        {/* Top Brand Bar */}
        <div className="relative z-10 flex items-center justify-between mb-3.5 pb-2.5 border-b border-white/15">
          <div className="flex items-center gap-2">
            <Logo size={28} className="rounded-lg shadow-xs" />
            <span className="font-extrabold text-sm tracking-tight text-white">
              Défi<span className="text-emerald-200">W</span>
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/15 backdrop-blur-xs rounded-full text-[11px] font-bold border border-white/20">
            <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
            <span>{streak} {streak === 1 ? 'dia' : 'dias'}</span>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="text-white/80 text-xs font-medium">{greeting},</span>
            <h2 className="text-2xl font-black text-white tracking-tight">{firstName}</h2>
            <p className="text-[11px] text-white/70 capitalize mt-0.5">{currentDate}</p>
          </div>

          <button
            onClick={() => onNavigate('profile')}
            className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/40 overflow-hidden flex items-center justify-center text-white hover:scale-105 transition-all shadow-md shrink-0 cursor-pointer"
          >
            {user.photo ? (
              <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-4 py-4 space-y-4 max-w-[480px] mx-auto">
        {/* Calories of the Day Card */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden text-center"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-[#4CAF50] to-[#81C784]" />

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Calorias do Dia
            </span>
            <button
              onClick={onOpenAddMeal}
              className="text-xs font-bold text-[#4CAF50] hover:text-[#388E3C] flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </button>
          </div>

          {/* Circular Chart with Center Value */}
          <div className="relative w-48 h-48 mx-auto my-2 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
              <circle
                cx="90"
                cy="90"
                r={radius}
                className="fill-none stroke-gray-100"
                strokeWidth="12"
              />
              <circle
                cx="90"
                cy="90"
                r={radius}
                className={`fill-none transition-all duration-700 ease-out ${
                  isOverCal ? 'stroke-[#EF5350]' : 'stroke-[#4CAF50]'
                }`}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-gray-900 tracking-tight leading-none">
                {stats.calories.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs text-gray-400 font-medium mt-1">
                / {goals.calories.toLocaleString('pt-BR')} kcal
              </span>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full mt-2 ${
                  isOverCal
                    ? 'text-red-600 bg-red-50'
                    : 'text-emerald-700 bg-emerald-50'
                }`}
              >
                {Math.round((stats.calories / goals.calories) * 100)}%
              </span>
            </div>
          </div>

          {/* Deficit / Excesso Pill */}
          <div
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold mt-1 ${
              deficit >= 0
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                : 'bg-red-50 text-red-600 border border-red-200/60'
            }`}
          >
            {deficit >= 0 ? (
              <>
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Déficit Atual: -{deficit.toLocaleString('pt-BR')} kcal</span>
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5" />
                <span>Excesso: +{Math.abs(deficit).toLocaleString('pt-BR')} kcal</span>
              </>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isOverCal ? 'bg-[#EF5350]' : 'bg-[#4CAF50]'}`} />
              Consumido: <strong>{stats.calories} kcal</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
              Restante: <strong>{Math.max(0, deficit)} kcal</strong>
            </span>
          </div>
        </motion.section>

        {/* Macronutrientes Row */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <span className="w-1 h-3.5 bg-[#4CAF50] rounded-full" />
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Macronutrientes
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Proteínas */}
            <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs text-center">
              <div className="text-[10px] font-extrabold uppercase text-amber-600 tracking-wider">
                Proteínas
              </div>
              <div className="text-lg font-black text-gray-900 mt-1 leading-none">
                {Math.round(stats.protein)}g
              </div>
              <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                / {goals.protein}g
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${protPct}%` }}
                />
              </div>
            </div>

            {/* Carboidratos */}
            <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs text-center">
              <div className="text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider">
                Carboidratos
              </div>
              <div className="text-lg font-black text-gray-900 mt-1 leading-none">
                {Math.round(stats.carbs)}g
              </div>
              <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                / {goals.carbs}g
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="h-full bg-[#4CAF50] rounded-full transition-all duration-500"
                  style={{ width: `${carbPct}%` }}
                />
              </div>
            </div>

            {/* Gorduras */}
            <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs text-center">
              <div className="text-[10px] font-extrabold uppercase text-orange-500 tracking-wider">
                Gorduras
              </div>
              <div className="text-lg font-black text-gray-900 mt-1 leading-none">
                {Math.round(stats.fat)}g
              </div>
              <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                / {goals.fat}g
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="h-full bg-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${fatPct}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats (Déficit & Peso Atual) */}
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                deficit >= 0
                  ? 'bg-emerald-50 text-[#4CAF50]'
                  : 'bg-red-50 text-red-500'
              }`}
            >
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-gray-500">Déficit diário</div>
              <div
                className={`text-base font-bold ${
                  deficit >= 0 ? 'text-[#4CAF50]' : 'text-red-500'
                }`}
              >
                {deficit >= 0 ? `-${deficit} kcal` : `+${Math.abs(deficit)} kcal`}
              </div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-gray-500">Peso Atual</div>
              <div className="text-base font-bold text-gray-900">
                {String(user.weight || '--').replace('.', ',')} kg
              </div>
            </div>
          </div>
        </section>

        {/* Hidratação Card com Notificação/Lembrete */}
        <section className="bg-linear-to-br from-[#E3F2FD] to-[#BBDEFB] rounded-2xl p-4.5 border border-blue-200/60 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/80 text-blue-600 flex items-center justify-center shadow-2xs">
                <Droplet className="w-4 h-4 fill-blue-500 text-blue-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-blue-900 leading-tight">Hidratação</h4>
                <span className="text-[11px] text-blue-700 font-medium">
                  Meta: {goals.water.toFixed(1).replace('.', ',')} L
                </span>
              </div>
            </div>

            <div className="text-2xl font-black text-blue-900">
              {stats.water.toFixed(1).replace('.', ',')}{' '}
              <span className="text-xs font-bold text-blue-700">L</span>
            </div>
          </div>

          {/* 10 Water Drops Grid */}
          <div className="grid grid-cols-10 gap-1.5 my-3.5">
            {Array.from({ length: totalDrops }).map((_, i) => {
              const isFilled = i < filledDrops;
              return (
                <div
                  key={i}
                  className={`h-8 rounded-lg flex items-center justify-center transition-all ${
                    isFilled
                      ? 'bg-blue-500 text-white shadow-2xs scale-102'
                      : 'bg-white/50 text-blue-300 border border-blue-200/50'
                  }`}
                >
                  <Droplet className={`w-3 h-3 ${isFilled ? 'fill-current' : ''}`} />
                </div>
              );
            })}
          </div>

          {/* Notification Feedback Toast inside Card */}
          {notificationMsg && (
            <div className="mb-3 p-2 bg-blue-600 text-white text-[11px] font-semibold rounded-xl text-center shadow-xs animate-fade-in">
              {notificationMsg}
            </div>
          )}

          {/* Buttons: Add Water & Notification Reminder Toggle */}
          <div className="space-y-2">
            <button
              onClick={onAddWater}
              className="w-full py-2.5 bg-white/90 hover:bg-white text-blue-800 rounded-xl text-xs font-bold shadow-xs hover:shadow-sm active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              + Adicionar 300ml de água
            </button>

            <button
              onClick={toggleWaterReminder}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                waterReminderEnabled
                  ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                  : 'bg-blue-100/70 hover:bg-blue-100 text-blue-900 border-blue-300/60'
              }`}
            >
              {waterReminderEnabled ? (
                <>
                  <BellRing className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>Lembretes ativados (Notificar para beber água)</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 text-blue-700" />
                  <span>Receber notificação para lembrar de beber água</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* IMC Card */}
        {bmiInfo.bmi > 0 && (
          <section className="bg-white rounded-2xl p-4.5 border border-gray-100 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <Activity className="w-4 h-4 text-[#4CAF50]" />
                <span>Índice de Massa Corporal (IMC)</span>
              </div>
              <span className="text-xs font-bold text-[#4CAF50]">
                {bmiInfo.bmi} ({bmiInfo.status})
              </span>
            </div>

            {/* Gradient scale */}
            <div className="relative h-2.5 bg-linear-to-r from-blue-400 via-emerald-400 via-yellow-400 via-orange-400 to-red-500 rounded-full my-3">
              <div
                className="absolute -top-1 w-4 h-4 bg-gray-900 border-2 border-white rounded-full shadow-md -translate-x-1/2 transition-all duration-500"
                style={{ left: `${bmiInfo.pct}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-gray-400 font-medium">
              <span>Magreza</span>
              <span>Normal</span>
              <span>Sobrepeso</span>
              <span>Obesidade</span>
            </div>
          </section>
        )}

        {/* Resumo do Dia (Meal breakdown com 6 refeições) */}
        <section className="bg-white rounded-2xl p-4.5 border border-gray-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-1 h-3.5 bg-[#4CAF50] rounded-full" />
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                Resumo do Dia
              </h3>
            </div>
            <button
              onClick={() => onNavigate('food')}
              className="text-xs text-[#4CAF50] font-bold hover:underline cursor-pointer"
            >
              Ver detalhes
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Sun className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-gray-700">Café da Manhã</span>
              </div>
              <span className="font-bold text-gray-900">{mealCal.breakfast} kcal</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-gray-700">Lanche da Manhã</span>
              </div>
              <span className="font-bold text-gray-900">{mealCal.morningSnack} kcal</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Utensils className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-gray-700">Almoço</span>
              </div>
              <span className="font-bold text-gray-900">{mealCal.lunch} kcal</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Sunset className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-gray-700">Café da Tarde</span>
              </div>
              <span className="font-bold text-gray-900">{mealCal.snack} kcal</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Moon className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-gray-700">Jantar</span>
              </div>
              <span className="font-bold text-gray-900">{mealCal.dinner} kcal</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Moon className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-gray-700">Ceia</span>
              </div>
              <span className="font-bold text-gray-900">{mealCal.supper} kcal</span>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-sm font-black text-gray-900">
              <span>Total Ingerido</span>
              <span className="text-[#4CAF50]">{stats.calories} kcal</span>
            </div>
          </div>
        </section>

        {/* Mascote Card (Défi — Seu assistente) */}
        <section className="bg-linear-to-br from-emerald-900 via-gray-900 to-slate-900 text-white rounded-2xl p-4.5 border border-emerald-500/30 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-start gap-3.5">
            <div className="relative shrink-0">
              <Logo size={44} className="rounded-xl shadow-md border border-white/20" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#4CAF50] rounded-full border-2 border-[#0F172A] flex items-center justify-center text-white">
                <Sparkles className="w-2.5 h-2.5" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wide">
                  Défi Assistente
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-500/30 text-emerald-200 rounded-full border border-emerald-400/40">
                  AI Coach
                </span>
              </div>

              <p className="text-xs text-gray-200 leading-relaxed font-medium line-clamp-2">
                "{MASCOTE_MESSAGES[mascoteIdx]}"
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => onNavigate('assistant')}
                  className="px-3 py-1.5 bg-[#4CAF50] hover:bg-[#388E3C] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Abrir Défi Assistente
                </button>

                <button
                  onClick={nextMascoteTip}
                  title="Outra dica"
                  className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
