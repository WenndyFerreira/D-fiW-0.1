import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Trash2, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { cleanCPF } from '../utils/nutrition';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 overflow-hidden relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 shadow-inner">
              <LogOut className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1.5">
              Sair da conta?
            </h3>
            
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {userName ? `Até logo, ${userName.split(' ')[0]}! ` : ''}
              Você precisará do seu CPF e senha para acessar o aplicativo novamente.
            </p>

            <div className="w-full grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 shadow-md shadow-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sim, Sair
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userCpf: string;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userCpf
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const trimmed = confirmationInput.trim();
    const cleanInput = cleanCPF(trimmed);
    const cleanTarget = cleanCPF(userCpf);

    const isMatch = (cleanInput && cleanInput === cleanTarget) || trimmed.toUpperCase() === 'EXCLUIR' || trimmed.toUpperCase() === 'APAGAR';

    if (!isMatch) {
      setErrorMsg('Digite seu CPF ou a palavra EXCLUIR para confirmar.');
      return;
    }

    setErrorMsg('');
    setConfirmationInput('');
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-red-100 overflow-hidden relative"
        >
          <button
            onClick={() => {
              setErrorMsg('');
              setConfirmationInput('');
              onClose();
            }}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3 shadow-inner">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Apagar Conta Definitivamente
            </h3>
            
            <div className="p-3 bg-red-50 rounded-xl text-left border border-red-200/70 mb-4 mt-2">
              <div className="flex items-start gap-2 text-red-800 text-xs leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>
                  <strong>Atenção: Ação irreversível.</strong> Todas as suas refeições, histórico de peso, fotos, registros e preferências serão excluídos permanentemente.
                </span>
              </div>
            </div>

            <div className="w-full text-left mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Para confirmar, digite seu CPF (<span className="text-gray-900 font-mono font-bold">{userCpf || 'cadastrado'}</span>) ou digite <span className="text-red-600 font-bold">EXCLUIR</span>:
              </label>
              <input
                type="text"
                value={confirmationInput}
                onChange={(e) => {
                  setConfirmationInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Digite o CPF ou EXCLUIR"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-mono"
              />
              {errorMsg && (
                <p className="text-xs text-red-600 mt-1 font-medium">{errorMsg}</p>
              )}
            </div>

            <div className="w-full grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setConfirmationInput('');
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full py-3 px-4 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 shadow-md shadow-red-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Apagar Conta
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
