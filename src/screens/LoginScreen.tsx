import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';
import { AlertModal } from '../components/AlertModal';
import { formatCPF, cleanCPF } from '../utils/nutrition';
import { Storage } from '../utils/storage';
import { UserProfile } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigateToRegister: () => void;
  onNavigateToTerms: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateToTerms,
  showToast
}) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Digite seu nome completo', 'error');
      return;
    }

    const clean = cleanCPF(cpf);
    if (clean.length < 11) {
      showToast('Digite um CPF válido com 11 dígitos', 'error');
      return;
    }

    if (!termsAccepted) {
      setDialog({
        isOpen: true,
        type: 'terms',
        title: 'Termos de Uso Obrigatórios',
        message: 'Para acessar o DéfiW e sincronizar seus dados com segurança, você precisa aceitar os Termos de Uso do aplicativo.',
        actionText: 'Aceitar Termos e Continuar',
        onAction: () => {
          setTermsAccepted(true);
          showToast('Termos aceitos. Clique em Entrar para prosseguir.', 'info');
        },
        secondaryText: 'Ler Termos de Uso',
        onSecondary: () => {
          onNavigateToTerms();
        }
      });
      return;
    }

    const storedUser = Storage.getUser(clean);
    if (!storedUser) {
      setDialog({
        isOpen: true,
        type: 'no_account',
        title: 'Conta não encontrada',
        message: `Não encontramos nenhum cadastro com o CPF ${cpf || 'informado'}.\n\nCrie sua conta agora gratuitamente para definir suas metas de déficit e nutrientes!`,
        actionText: 'Criar Minha Conta Grátis',
        onAction: () => {
          onNavigateToRegister();
        },
        secondaryText: 'Verificar CPF digitado'
      });
      return;
    }

    // Name checking (case insensitive partial / full)
    if (!storedUser.name.toLowerCase().includes(name.trim().toLowerCase()) &&
        !name.trim().toLowerCase().includes(storedUser.name.toLowerCase())) {
      showToast('Nome não corresponde ao CPF informado.', 'error');
      return;
    }

    // Restore user photo if saved separately
    const photo = Storage.getPhoto();
    if (photo && !storedUser.photo) {
      storedUser.photo = photo;
    }

    Storage.saveUser(storedUser);
    showToast(`Bem-vindo de volta, ${storedUser.name.split(' ')[0]}!`, 'success');
    onLoginSuccess(storedUser);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-white"
    >
      <div className="w-full max-w-[380px] mx-auto flex flex-col items-center">
        {/* Animated App Logo */}
        <motion.div
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mb-3"
        >
          <Logo size={96} />
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-[#1A1A2E] tracking-tight">
          Défi<span className="text-[#4CAF50]">W</span>
        </h1>
        <p className="text-xs text-[#8A8A9A] font-medium mt-1 mb-6 text-center">
          Seu déficit, sua melhor versão.
        </p>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full space-y-3.5">
          <div className="text-left">
            <label className="block text-xs font-semibold text-[#4A4A5A] mb-1.5">
              Nome completo
            </label>
            <input
              type="text"
              required
              placeholder="Digite seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8F9FB] border border-[#E4E7EC] rounded-xl text-sm text-[#1A1A2E] focus:bg-white focus:border-[#4CAF50] focus:ring-3 focus:ring-[#4CAF50]/15 outline-none transition-all"
            />
          </div>

          <div className="text-left">
            <label className="block text-xs font-semibold text-[#4A4A5A] mb-1.5">
              CPF
            </label>
            <input
              type="text"
              required
              maxLength={14}
              placeholder="000.000.000-00"
              value={cpf}
              onChange={handleCpfChange}
              className="w-full px-4 py-3 bg-[#F8F9FB] border border-[#E4E7EC] rounded-xl text-sm text-[#1A1A2E] focus:bg-white focus:border-[#4CAF50] focus:ring-3 focus:ring-[#4CAF50]/15 outline-none transition-all"
            />
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-2.5 pt-1 text-left">
            <input
              type="checkbox"
              id="terms-check-login"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-[#4CAF50] rounded-sm cursor-pointer shrink-0"
            />
            <label htmlFor="terms-check-login" className="text-xs text-[#4A4A5A] leading-tight select-none cursor-pointer">
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

          {/* Buttons */}
          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-linear-to-r from-[#4CAF50] to-[#388E3C] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              Entrar
            </button>

            <button
              type="button"
              onClick={onNavigateToRegister}
              className="w-full py-3 px-4 bg-transparent text-[#4A4A5A] border border-[#E4E7EC] hover:border-[#4CAF50] hover:text-[#4CAF50] hover:bg-emerald-50/50 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Criar conta gratuita
            </button>
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
