import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  TrendingDown, 
  Target, 
  Flame, 
  Droplet, 
  Utensils, 
  Scale, 
  Activity, 
  Calendar, 
  Award,
  Zap
} from 'lucide-react';
import { DayStats, NutritionGoals, ScreenType, UserProfile } from '../types';
import { calculateBMI } from '../utils/nutrition';
import { Storage } from '../utils/storage';
import { Logo } from '../components/Logo';

interface ProgressScreenProps {
  user: UserProfile;
  goals: NutritionGoals;
  stats: DayStats;
  streak: number;
  totalMealsCount: number;
  onNavigate: (screen: ScreenType) => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  user,
  goals,
  stats,
  streak,
  totalMealsCount,
  onNavigate,
}) => {
  const currentWeight = parseFloat(String(user.weight)) || 70;
  const initialWeight = Storage.getInitialWeight(currentWeight);
  const goalWeight = parseFloat(String(user.goalWeight)) || (currentWeight - 5);

  const weightDiff = Number((initialWeight - currentWeight).toFixed(1));
  const heightNum = parseFloat(String(user.height)) || 170;
  const bmiInfo = calculateBMI(currentWeight, heightNum);

  // Goal percentage progress
  let goalPercent = 0;
  if (user.objective?.toLowerCase().includes('emagrecer')) {
    const totalToLose = Math.abs(initialWeight - goalWeight);
    const lostSoFar = Math.max(0, initialWeight - currentWeight);
    goalPercent = totalToLose > 0 ? Math.min(100, Math.round((lostSoFar / totalToLose) * 100)) : 100;
  } else if (user.objective?.toLowerCase().includes('ganhar')) {
    const totalToGain = Math.abs(goalWeight - initialWeight);
    const gainedSoFar = Math.max(0, currentWeight - initialWeight);
    goalPercent = totalToGain > 0 ? Math.min(100, Math.round((gainedSoFar / totalToGain) * 100)) : 100;
  } else {
    goalPercent = 100;
  }

  // Weight history records
  const weightHistory = Storage.getWeightHistory(currentWeight, initialWeight);
  const deficitHistory = Storage.getDeficitHistory(goals.calories, stats.calories);

  // SVG Chart scaling
  const minW = Math.min(...weightHistory.map(w => w.weight)) - 1;
  const maxW = Math.max(...weightHistory.map(w => w.weight)) + 1;
  const rangeW = maxW - minW || 1;

  // Chart coordinates
  const svgWidth = 340;
  const svgHeight = 140;
  const paddingX = 35;
  const paddingY = 20;

  const points = weightHistory.map((pt, idx) => {
    const x = paddingX + (idx / (weightHistory.length - 1)) * (svgWidth - paddingX * 2);
    const normalized = (pt.weight - minW) / rangeW;
    const y = svgHeight - paddingY - normalized * (svgHeight - paddingY * 2);
    return { x, y, weight: pt.weight, label: pt.label };
  });

  const polylineStr = points.map(p => `${p.x},${p.y}`).join(' ');
  const polygonStr = `${points[0].x},${svgHeight - paddingY} ${polylineStr} ${points[points.length - 1].x},${svgHeight - paddingY}`;

  return (
    <div className="min-h-screen pb-28 bg-[#F8F9FB]">
      {/* Header */}
      <header
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px) + 1.25rem, 1.25rem)' }}
        className="relative bg-linear-to-br from-[#4CAF50] to-[#2E7D32] p-5 text-white rounded-b-3xl shadow-md overflow-hidden"
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <Logo size={36} className="rounded-xl shadow-xs" />
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Progresso</h1>
              <p className="text-xs text-white/80 mt-0.5">Sua evolução e métricas</p>
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

      <main className="px-4 py-4 space-y-4 max-w-[480px] mx-auto">
        {/* Weight Evolution Hero Card */}
        <section className="bg-linear-to-br from-[#4CAF50] to-[#2E7D32] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden text-center">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full" />

          <div className="relative z-10 space-y-1">
            <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest">
              Evolução Total do Peso
            </span>
            <div className="text-4xl font-black tracking-tight flex items-center justify-center gap-2">
              <TrendingDown className="w-8 h-8 text-emerald-200" />
              <span>
                {weightDiff > 0 ? `-${weightDiff.toString().replace('.', ',')} kg` : weightDiff < 0 ? `+${Math.abs(weightDiff).toString().replace('.', ',')} kg` : '0 kg'}
              </span>
            </div>
            <p className="text-xs text-white/80 pt-1 font-medium">
              Peso inicial: <strong>{initialWeight.toString().replace('.', ',')} kg</strong> | Atual: <strong>{currentWeight.toString().replace('.', ',')} kg</strong>
            </p>
          </div>
        </section>

        {/* Goal Card */}
        <section className="bg-white rounded-2xl p-4.5 border border-gray-100 shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#4CAF50] flex items-center justify-center shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                Objetivo
              </div>
              <div className="text-sm font-extrabold text-gray-900 leading-tight">
                {user.objective || 'Emagrecer com saúde'}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Meta: <strong>{goalWeight.toString().replace('.', ',')} kg</strong>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xl font-black text-[#4CAF50]">{goalPercent}%</div>
            <div className="w-20 h-2 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-[#4CAF50] rounded-full transition-all duration-700"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>
        </section>

        {/* Weight Evolution SVG Line Chart */}
        <section className="bg-white rounded-2xl p-4.5 border border-gray-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Evolução do Peso (kg)
            </h3>
            <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
              Últimos 7 dias
            </span>
          </div>

          <div className="relative w-full overflow-hidden pt-2">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
              {/* Grid Lines */}
              <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#F1F5F9" strokeWidth="1.5" />
              <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />

              {/* Area fill */}
              <polygon points={polygonStr} fill="rgba(76, 175, 80, 0.12)" />

              {/* Line */}
              <polyline
                points={polylineStr}
                fill="none"
                stroke="#4CAF50"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points */}
              {points.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill="#4CAF50"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                  <text
                    x={pt.x}
                    y={svgHeight - 2}
                    fontSize="9.5"
                    fill="#8A8A9A"
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}

              {/* Y Axis min & max */}
              <text x={paddingX - 6} y={paddingY + 4} fontSize="9" fill="#94A3B8" textAnchor="end">
                {maxW.toFixed(0)}
              </text>
              <text x={paddingX - 6} y={svgHeight - paddingY} fontSize="9" fill="#94A3B8" textAnchor="end">
                {minW.toFixed(0)}
              </text>
            </svg>
          </div>
        </section>

        {/* Weekly Calorie Deficit Bar Chart */}
        <section className="bg-white rounded-2xl p-4.5 border border-gray-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Déficit Calórico Semanal
            </h3>
            <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
              kcal / dia
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 items-end h-32 pt-4 px-1 pb-1">
            {deficitHistory.map((item, idx) => {
              const maxBarDeficit = 800;
              const barHeightPct = Math.min(100, Math.max(15, (item.deficit / maxBarDeficit) * 100));
              const isGood = item.deficit >= 400;

              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-bold text-gray-600">
                    {item.deficit > 0 ? item.deficit : '0'}
                  </span>
                  <div className="w-full bg-gray-100 rounded-lg overflow-hidden flex items-end h-20">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${
                        isGood ? 'bg-[#4CAF50]' : 'bg-amber-400'
                      }`}
                      style={{ height: `${barHeightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{item.day}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4 Stats Cards */}
        <section className="grid grid-cols-2 gap-2.5">
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs text-center">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#4CAF50] flex items-center justify-center mx-auto mb-1.5">
              <Flame className="w-4 h-4" />
            </div>
            <div className="text-[10px] font-medium text-gray-400 uppercase">Dias Seguidos</div>
            <div className="text-base font-extrabold text-gray-900 mt-0.5">{streak} dias</div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs text-center">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-1.5">
              <Scale className="w-4 h-4" />
            </div>
            <div className="text-[10px] font-medium text-gray-400 uppercase">Peso Reduzido</div>
            <div className="text-base font-extrabold text-gray-900 mt-0.5">
              {weightDiff > 0 ? `-${weightDiff} kg` : '0 kg'}
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs text-center">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-1.5">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-[10px] font-medium text-gray-400 uppercase">Média Calorias</div>
            <div className="text-base font-extrabold text-gray-900 mt-0.5">
              {stats.calories > 0 ? stats.calories : goals.calories} kcal
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs text-center">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-1.5">
              <Droplet className="w-4 h-4" />
            </div>
            <div className="text-[10px] font-medium text-gray-400 uppercase">Hidratação</div>
            <div className="text-base font-extrabold text-gray-900 mt-0.5">
              {stats.water.toFixed(1).replace('.', ',')} L
            </div>
          </div>
        </section>

        {/* Detailed Stats List */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-2xs divide-y divide-gray-100 overflow-hidden text-xs">
          <div className="p-3.5 px-4 flex items-center justify-between">
            <span className="font-medium text-gray-600">Média de proteínas diárias</span>
            <span className="font-bold text-gray-900">{Math.round(stats.protein)}g / dia</span>
          </div>

          <div className="p-3.5 px-4 flex items-center justify-between">
            <span className="font-medium text-gray-600">Total de refeições registradas</span>
            <span className="font-bold text-gray-900">{totalMealsCount}</span>
          </div>

          <div className="p-3.5 px-4 flex items-center justify-between">
            <span className="font-medium text-gray-600">Meta de peso estipulada</span>
            <span className="font-bold text-emerald-600">
              {goalWeight.toString().replace('.', ',')} kg
            </span>
          </div>

          <div className="p-3.5 px-4 flex items-center justify-between">
            <span className="font-medium text-gray-600">Classificação IMC</span>
            <span className="font-bold text-gray-900">
              {bmiInfo.bmi} ({bmiInfo.status})
            </span>
          </div>
        </section>
      </main>
    </div>
  );
};
