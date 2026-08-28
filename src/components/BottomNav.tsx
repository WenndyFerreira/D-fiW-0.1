import React from 'react';
import { Home, UtensilsCrossed, Bot, TrendingUp, User, Sparkles } from 'lucide-react';
import { ScreenType } from '../types';

interface BottomNavProps {
  currentScreen: ScreenType;
  onSelect: (screen: ScreenType) => void;
  hasAlerts?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onSelect, hasAlerts }) => {
  const tabs = [
    { id: 'dashboard' as ScreenType, label: 'Início', icon: Home },
    { id: 'food' as ScreenType, label: 'Alimentos', icon: UtensilsCrossed },
    { id: 'assistant' as ScreenType, label: 'Assistente', icon: Bot, isSpecial: true },
    { id: 'progress' as ScreenType, label: 'Progresso', icon: TrendingUp },
    { id: 'profile' as ScreenType, label: 'Perfil', icon: User },
  ];

  return (
    <nav
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)' }}
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] lg:max-w-[500px] h-[calc(68px+env(safe-area-inset-bottom,0px))] bg-white/95 backdrop-blur-md border-t border-gray-100 flex items-center justify-around px-1 z-40 shadow-lg"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentScreen === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 transition-all relative cursor-pointer ${
              isActive ? 'text-[#4CAF50]' : 'text-[#8A8A9A] hover:text-[#4A4A5A]'
            }`}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-[#4CAF50] rounded-b-md" />
            )}
            
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              {tab.isSpecial && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse ring-1 ring-white" />
              )}
            </div>

            <span className={`text-[10.5px] font-medium leading-none ${isActive ? 'font-extrabold text-[#4CAF50]' : ''}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
