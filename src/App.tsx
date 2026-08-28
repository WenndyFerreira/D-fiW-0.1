import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  DayStats, 
  FoodItem, 
  MealKey, 
  MealsState, 
  NutritionGoals, 
  ScreenType, 
  UserProfile 
} from './types';
import { Storage } from './utils/storage';
import { calculateCalculatedGoals } from './utils/nutrition';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { FoodScreen } from './screens/FoodScreen';
import { AssistantScreen } from './screens/AssistantScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { TermsScreen } from './screens/TermsScreen';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { MealAddModal } from './components/MealAddModal';
import { EditProfileModal } from './components/EditProfileModal';
import { LogoutModal, DeleteAccountModal } from './components/AccountModals';
import { SmartMealSuggestion } from './types';

const DEFAULT_USER: UserProfile = {
  name: '',
  cpf: '',
  dob: '',
  gender: '',
  height: '170',
  weight: '70',
  goalWeight: '65',
  activity: 'Moderado',
  objective: 'Emagrecer',
  photo: '',
};

const DEFAULT_GOALS: NutritionGoals = {
  calories: 2000,
  protein: 140,
  carbs: 250,
  fat: 65,
  water: 3.0,
};

export default function App() {
  // State
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [previousScreen, setPreviousScreen] = useState<ScreenType>('login');
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [goals, setGoals] = useState<NutritionGoals>(DEFAULT_GOALS);
  const [meals, setMeals] = useState<MealsState>({
    breakfast: [],
    morningSnack: [],
    lunch: [],
    snack: [],
    dinner: [],
    supper: [],
  });
  const [water, setWater] = useState<number>(0);
  const [streak, setStreak] = useState<number>(1);

  // Modals & Toast State
  const [toastInfo, setToastInfo] = useState<{ message: string | null; type: 'success' | 'error' | 'info' }>({
    message: null,
    type: 'success',
  });
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [activeMealTarget, setActiveMealTarget] = useState<MealKey | null>(null);
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastInfo({ message, type });
    setTimeout(() => {
      setToastInfo(prev => prev.message === message ? { message: null, type: 'success' } : prev);
    }, 3000);
  };

  // Initial Boot & Data Recovery
  useEffect(() => {
    const savedStreak = Storage.getStreak();
    setStreak(savedStreak);

    const lastCpf = Storage.getLastCpf();
    if (lastCpf) {
      const storedUser = Storage.getUser(lastCpf);
      if (storedUser) {
        const photo = Storage.getPhoto();
        if (photo) storedUser.photo = photo;
        
        setUser(storedUser);
        const calculated = Storage.getGoals(calculateCalculatedGoals(storedUser));
        setGoals(calculated);

        // Load today's logs
        const todayMeals = Storage.getTodayMeals();
        setMeals(todayMeals);
        const todayWater = Storage.getTodayWater();
        setWater(todayWater);

        setCurrentScreen('dashboard');
        return;
      }
    }

    // Check if mock or initial user
    const todayMeals = Storage.getTodayMeals();
    setMeals(todayMeals);
    const todayWater = Storage.getTodayWater();
    setWater(todayWater);
  }, []);

  // Compute stats dynamically
  const stats: DayStats = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    const allMealArrays: FoodItem[][] = [
      meals.breakfast,
      meals.morningSnack,
      meals.lunch,
      meals.snack,
      meals.dinner,
      meals.supper,
    ];

    allMealArrays.forEach(mealArray => {
      mealArray.forEach(item => {
        calories += item.cal || 0;
        protein += item.prot || 0;
        carbs += item.carb || 0;
        fat += item.fat || 0;
      });
    });

    return {
      calories,
      protein: Number(protein.toFixed(1)),
      carbs: Number(carbs.toFixed(1)),
      fat: Number(fat.toFixed(1)),
      water,
    };
  }, [meals, water]);

  // Total meals count
  const totalMealsCount = useMemo(() => {
    return (
      meals.breakfast.length +
      meals.morningSnack.length +
      meals.lunch.length +
      meals.snack.length +
      meals.dinner.length +
      meals.supper.length
    );
  }, [meals]);

  // Navigation Handler
  const navigateTo = (screen: ScreenType) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Login Success
  const handleLoginSuccess = (loggedUser: UserProfile) => {
    setUser(loggedUser);
    const userGoals = Storage.getGoals(calculateCalculatedGoals(loggedUser));
    setGoals(userGoals);
    const todayMeals = Storage.getTodayMeals();
    setMeals(todayMeals);
    const todayWater = Storage.getTodayWater();
    setWater(todayWater);
    navigateTo('dashboard');
  };

  // Register Success
  const handleRegisterSuccess = (newUser: UserProfile) => {
    setUser(newUser);
    const userGoals = calculateCalculatedGoals(newUser);
    setGoals(userGoals);
    navigateTo('dashboard');
  };

  // Water Increment
  const handleAddWater = () => {
    if (water >= goals.water) {
      showToast('Parabéns! Sua meta de hidratação já foi atingida!', 'info');
      return;
    }

    const newWater = Number((water + 0.3).toFixed(1));
    setWater(newWater);
    Storage.saveTodayWater(newWater);

    if (newWater >= goals.water) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#42A5F5', '#90CAF9', '#4CAF50']
        });
      } catch {}
      showToast(`Meta de água atingida! ${newWater.toFixed(1).replace('.', ',')}L concluídos!`, 'success');
    } else {
      showToast(`+300ml de água registrado! Total: ${newWater.toFixed(1).replace('.', ',')}L`, 'success');
    }
  };

  // Add Food Item
  const handleAddFood = (mealKey: MealKey, food: FoodItem, quantity: number = 1) => {
    const updatedMeals = {
      ...meals,
      [mealKey]: [
        ...meals[mealKey],
        {
          ...food,
          timestamp: Date.now(),
          quantity,
        },
      ],
    };

    const mealNameMap: Record<MealKey, string> = {
      breakfast: 'Café da manhã',
      morningSnack: 'Lanche da manhã',
      lunch: 'Almoço',
      snack: 'Café da tarde',
      dinner: 'Jantar',
      supper: 'Ceia',
    };

    setMeals(updatedMeals);
    Storage.saveTodayMeals(updatedMeals);
    showToast(`${food.name} adicionado ao ${mealNameMap[mealKey] || 'refeição'}!`, 'success');
  };

  // Remove Food Item
  const handleRemoveFood = (mealKey: MealKey, index: number) => {
    const item = meals[mealKey][index];
    const updated = {
      ...meals,
      [mealKey]: meals[mealKey].filter((_, i) => i !== index),
    };

    setMeals(updated);
    Storage.saveTodayMeals(updated);
    if (item) {
      showToast(`${item.name} removido.`, 'info');
    }
  };

  // Edit Food Item
  const handleEditFood = (mealKey: MealKey, index: number, updatedFood: FoodItem) => {
    const updatedList = [...meals[mealKey]];
    updatedList[index] = {
      ...updatedFood,
      timestamp: updatedList[index]?.timestamp || Date.now(),
    };
    const updatedMeals = {
      ...meals,
      [mealKey]: updatedList,
    };
    setMeals(updatedMeals);
    Storage.saveTodayMeals(updatedMeals);
    showToast(`${updatedFood.name} atualizado no diário!`, 'success');
  };

  // Save Profile Changes
  const handleSaveProfile = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    Storage.saveUser(updatedUser);
    const newGoals = calculateCalculatedGoals(updatedUser);
    setGoals(newGoals);
    Storage.saveGoals(newGoals);
    showToast('Perfil e metas atualizados com sucesso!', 'success');
  };

  // Quick Objective Update from Assistant
  const handleUpdateObjective = (newObjective: string) => {
    const updatedUser = { ...user, objective: newObjective };
    setUser(updatedUser);
    Storage.saveUser(updatedUser);
    const newGoals = calculateCalculatedGoals(updatedUser);
    setGoals(newGoals);
    Storage.saveGoals(newGoals);
    showToast(`Objetivo atualizado para "${newObjective}"!`, 'success');
  };

  // Add Smart Meal from Assistant to Diary
  const handleAddSmartMealToDiary = (suggestion: SmartMealSuggestion) => {
    const targetMeal = suggestion.targetMealKey || 'lunch';
    const newItems = suggestion.items.map((item) => ({
      ...item.foodItem,
      timestamp: Date.now(),
      quantity: 1,
    }));

    const updatedMeals = {
      ...meals,
      [targetMeal]: [...meals[targetMeal], ...newItems],
    };

    setMeals(updatedMeals);
    Storage.saveTodayMeals(updatedMeals);
    showToast(`Refeição "${suggestion.title}" adicionada ao diário!`, 'success');
  };

  // Photo Uploaded
  const handlePhotoUploaded = (base64: string) => {
    const updatedUser = { ...user, photo: base64 };
    setUser(updatedUser);
    Storage.savePhoto(base64);
    Storage.saveUser(updatedUser);
  };

  // Logout
  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    Storage.clearSession();
    setUser(DEFAULT_USER);
    setMeals({
      breakfast: [],
      morningSnack: [],
      lunch: [],
      snack: [],
      dinner: [],
      supper: [],
    });
    setWater(0);
    navigateTo('login');
    showToast('Você saiu da sua conta.', 'info');
  };

  // Delete Account
  const handleDeleteAccount = () => {
    setIsDeleteAccountModalOpen(true);
  };

  const confirmDeleteAccount = () => {
    if (user.cpf) {
      Storage.deleteAccount(user.cpf);
    }
    setUser(DEFAULT_USER);
    setMeals({
      breakfast: [],
      morningSnack: [],
      lunch: [],
      snack: [],
      dinner: [],
      supper: [],
    });
    setWater(0);
    setStreak(1);
    navigateTo('login');
    showToast('Sua conta e todos os dados foram apagados com sucesso.', 'info');
  };

  const showBottomNav = !['login', 'register', 'terms'].includes(currentScreen);

  return (
    <div className="min-h-screen bg-[#E8EAED] flex justify-center selection:bg-[#4CAF50] selection:text-white">
      <div className="w-full max-w-[480px] lg:max-w-[500px] min-h-screen bg-white shadow-2xl relative flex flex-col">
        {/* Screens */}
        {currentScreen === 'login' && (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => navigateTo('register')}
            onNavigateToTerms={() => navigateTo('terms')}
            showToast={showToast}
          />
        )}

        {currentScreen === 'register' && (
          <RegisterScreen
            onRegisterSuccess={handleRegisterSuccess}
            onNavigateToLogin={() => navigateTo('login')}
            onNavigateToTerms={() => navigateTo('terms')}
            showToast={showToast}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardScreen
            user={user}
            goals={goals}
            stats={stats}
            meals={meals}
            streak={streak}
            onAddWater={handleAddWater}
            onNavigate={navigateTo}
            onOpenAddMeal={(meal) => {
              setActiveMealTarget(meal || null);
              setActiveSearchQuery('');
              setIsAddMealModalOpen(true);
            }}
          />
        )}

        {currentScreen === 'food' && (
          <FoodScreen
            stats={stats}
            goals={goals}
            meals={meals}
            onNavigate={navigateTo}
            onOpenAddMeal={(meal, initialSearch) => {
              setActiveMealTarget(meal || null);
              setActiveSearchQuery(initialSearch || '');
              setIsAddMealModalOpen(true);
            }}
            onRemoveFood={handleRemoveFood}
            onEditFood={handleEditFood}
          />
        )}

        {currentScreen === 'assistant' && (
          <AssistantScreen
            user={user}
            goals={goals}
            stats={stats}
            meals={meals}
            onNavigate={navigateTo}
            onAddWater={handleAddWater}
            onOpenAddMealForSlot={(slot) => {
              setActiveMealTarget(slot);
              setActiveSearchQuery('');
              setIsAddMealModalOpen(true);
            }}
            onAddSmartMealToDiary={handleAddSmartMealToDiary}
            onUpdateObjective={handleUpdateObjective}
          />
        )}

        {currentScreen === 'progress' && (
          <ProgressScreen
            user={user}
            goals={goals}
            stats={stats}
            streak={streak}
            totalMealsCount={totalMealsCount}
            onNavigate={navigateTo}
          />
        )}

        {currentScreen === 'profile' && (
          <ProfileScreen
            user={user}
            onNavigate={navigateTo}
            onOpenEditModal={() => setIsEditProfileOpen(true)}
            onPhotoUploaded={handlePhotoUploaded}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
            showToast={showToast}
          />
        )}

        {currentScreen === 'terms' && (
          <TermsScreen
            onBack={() => navigateTo(previousScreen || 'login')}
            onAccept={() => {
              showToast('Termos de Uso aceitos com sucesso!', 'success');
              navigateTo(previousScreen || 'login');
            }}
          />
        )}

        {/* Bottom Navigation */}
        {showBottomNav && (
          <BottomNav currentScreen={currentScreen} onSelect={navigateTo} />
        )}

        {/* Global Toast */}
        <Toast message={toastInfo.message} type={toastInfo.type} />

        {/* Modals */}
        <MealAddModal
          isOpen={isAddMealModalOpen}
          onClose={() => {
            setIsAddMealModalOpen(false);
            setActiveSearchQuery('');
          }}
          onAddFood={handleAddFood}
          defaultMeal={activeMealTarget}
          initialSearchQuery={activeSearchQuery}
        />

        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          user={user}
          onSave={handleSaveProfile}
        />

        <LogoutModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={confirmLogout}
          userName={user.name}
        />

        <DeleteAccountModal
          isOpen={isDeleteAccountModalOpen}
          onClose={() => setIsDeleteAccountModalOpen(false)}
          onConfirm={confirmDeleteAccount}
          userCpf={user.cpf}
        />
      </div>
    </div>
  );
}
