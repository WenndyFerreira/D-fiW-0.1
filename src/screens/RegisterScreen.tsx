import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Logo } from '../components/Logo';
import { AlertModal } from '../components/AlertModal';
import { formatCPF, cleanCPF, calculateCalculatedGoals } from '../utils/nutrition';
import { Storage } from '../utils/storage';
import { UserProfile } from '../types';

interface RegisterScreenProps {
  onRegisterSuccess: (user: UserProfile) => void;
  onNavigateToLogin: () => void;
  onNavigateToTerms: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
  onNavigateToTerms,
  showToast
}) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('');
  const [objective, setObjective] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: 'terms' | 'no_account' | 'warning' | 'info';
    title: string;
    message: string;
    actionText?: string;
    onAction?: () => void;
    secondaryText?: string;
    onSecondary?: () => void;
  }>({
    isOpen: false,
    type: 'terms',
    title: '',
    message: ''
  });

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) { showToast('Digite seu nome completo', 'error'); return; }
    const clean = cleanCPF(cpf);
    if (clean.length < 11) { showToast('Digite um CPF válido com 11 dígitos', 'error'); return; }
    if (!dob) { showToast('Informe sua data de nascimento', 'error'); return; }
    if (!gender) { showToast('Selecione seu gênero', 'error'); return; }
    if (!height) { showToast('Informe sua altura em cm', 'error'); return; }
    if (!weight) { showToast('Informe seu peso atual em kg', 'error'); return; }
    if (!activity) { showToast('Selecione seu nível de atividade', 'error'); return; }
    if (!objective) { showToast('Selecione seu objetivo', 'error'); return; }

    if (!termsAccepted) {
      setDialog({
        isOpen: true,
        type: 'terms',
        title: 'Termos de Uso Obrigatórios',
        message: 'Para criar sua conta no DéfiW e definir suas metas personalizadas, é necessário aceitar os Termos de Uso.',
        actionText: 'Aceitar Termos e Cadastrar',
        onAction: () => {
          setTermsAccepted(true);
          showToast('Termos aceitos. Clique em Criar minha conta.', 'info');
        },
        secondaryText: 'Ler Termos de Uso',
        onSecondary: () => {
          onNavigateToTerms();
        }
      });
      return;
    }

    const existing = Storage.getUser(clean);
    if (existing) {
      showToast('Este CPF já possui uma conta cadastrada. Use Entrar.', 'info');
      onNavigateToLogin();
      return;
    }

    const parsedWeight = parseFloat(weight) || 70;
    const defaultGoalWeight = objective === 'Emagrecer'
      ? (parsedWeight - 5 > 40 ? parsedWeight - 5 : parsedWeight)
      : objective === 'Ganhar massa'
      ? parsedWeight + 3
      : parsedWeight;

    const newUser: UserProfile = {
      name: name.trim(),
      cpf: cpf,
      dob,
      gender,
      height,
      weight,
      goalWeight: String(defaultGoalWeight),
      activity,
      objective,
      photo: '',
      createdAt: new Date().toISOString()
    };

    // Calculate goals and save
    const goals = calculateCalculatedGoals(newUser);
    Storage.saveGoals(goals);
    Storage.setInitialWeight(parsedWeight);
    Storage.saveUser(newUser);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    showToast(`Conta criada com sucesso! Bem-vindo(a), ${name.split(' ')[0]}!`, 'success');
    onRegisterSuccess(newUser);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="min-h-screen py-8 px-5 bg-white flex flex-col items-center justify-center"
    >
      <div className="w-full max-w-[380px] mx-auto flex flex-col items-center">
        <Logo size={76} />

        <h1 className="text-2xl font-extrabold text-[#1A1A2E] tracking-tight mt-2">
          Défi<span className="text-[#4CAF50]">W</span>
        </h1>
        <p className="text-xs text-[#8A8A9A] font-medium mb-5">
          Crie sua conta para começar sua evolução
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-3 text-left">
          <div>
            <label className="block text-xs font-semibold text-[#4A4A5A] mb-1">Nome completo</label>
            <input
              type="text"
              required
              placeholder="Digite seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F8F9FB] border border-[#E4E7EC] rounded-xl text-sm focus:bg-white focus:border-[#4CAF50] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A4A5A] mb-1">CPF</label>
            <input
              type="text"
              required
              maxLength={14}
              placeholder="000.000.000-00"
              value={cpf}
              onChange={handleCpfChange}
              className="w-full px-3.5 py-2.5 bg-[#F8F9FB] border border-[#E4E7EC] rounded-xl text-sm focus:bg-white focus:border-[#4CAF50] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-[#4A4A5A] mb-1">Nascimento</label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F8F9FB] border border-[#E4E7EC] rounded-xl text-xs focus:bg-white focus:border-[#4CAF50] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4A4A5A] mb-1">Gênero</label>
              <select
                required
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F8F9FB] border border-[#E4E7EC] rounded-xl text-xs focus:bg-white focus:border-[#4CAF50] outline-none"
              >
                <option value="">Selecione</option>
                <option value="Homem cis">Homem cis</option>
                <option value="Mulher cis">Mulher cis</option>
                <option value="Homem trans">Homem trans</option>
                <option value="Mulher trans">Mulher trans</option>
                <option value="Nao binario">Não binário</option>
                <option value="Agenero">Agênero</option>
                <option value="Outro">Outro</option>
                <option value="Prefiro nao informar">Prefiro não informar</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-[#4A4A5A] mb-1">Altura (cm)</label>
              <input
                type="number"
                required
                placeholder="Ex: 172"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F9FB] border border-[#E4E7EC] rounded-xl text-sm focus:bg-white focus:border-[#4CAF50] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4A4A5A] mb-1">Peso atual (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="Ex: 68.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F9FB] border border-[#E4E7EC] rounded-xl text-sm focus:bg-white focus:border-[#4CAF50] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A4A5A] mb-1">Atividade física</label>
            <select
              required
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F8F9FB] border border-[#E4E7EC] rounded-xl text-xs focus:bg-white focus:border-[#4CAF50] outline-none"
            >
              <option value="">Selecione seu nível</option>
              <option value="Sedentario">Sedentário (pouco exercício)</option>
              <option value="Leve">Leve (1-3x por semana)</option>
              <option value="Moderado">Moderado (3-5x por semana)</option>
              <option value="Intenso">Intenso (6-7x por semana)</option>
              <option value="Muito intenso">Muito intenso (atleta)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A4A5A] mb-1">🎯 Qual é o seu objetivo?</label>
            <select
              required
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F8F9FB] border border-[#E4E7EC] rounded-xl text-xs focus:bg-white focus:border-[#4CAF50] outline-none font-medium"
            >
              <option value="">Selecione seu objetivo</option>
              <option value="Emagrecer">🔥 Emagrecer</option>
              <option value="Ganhar massa muscular">💪 Ganhar massa muscular</option>
              <option value="Manter o peso">⚖️ Manter o peso</option>
              <option value="Recomposição corporal">🎯 Recomposição corporal</option>
            </select>
          </div>

          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="terms-check-reg"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-[#4CAF50] rounded-sm cursor-pointer shrink-0"
            />
            <label htmlFor="terms-check-reg" className="text-xs text-[#4A4A5A] leading-tight select-none cursor-pointer">
              Li e aceito os{' '}
              <button
                type="button"
                onClick={onNavigateToTerms}
                className="text-[#4CAF50] font-semibold underline hover:opacity-80 inline"
              >
                Termos de Uso
              </button>
            </label>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-linear-to-r from-[#4CAF50] to-[#388E3C] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Criar minha conta
            </button>

            <div className="text-center text-xs text-[#8A8A9A] pt-1">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-[#4CAF50] font-bold hover:underline"
              >
                Entrar
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Custom Alert/Prompt Modal */}
      <AlertModal
        dialog={dialog}
        onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </motion.div>
  );
};
