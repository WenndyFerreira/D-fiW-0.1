import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Camera, 
  Calendar, 
  User, 
  Ruler, 
  Scale, 
  Activity, 
  Target, 
  FileText, 
  LogOut, 
  Trash2, 
  Edit3, 
  ChevronRight 
} from 'lucide-react';
import { ScreenType, UserProfile } from '../types';
import { Storage } from '../utils/storage';
import { Logo } from '../components/Logo';

interface ProfileScreenProps {
  user: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  onOpenEditModal: () => void;
  onPhotoUploaded: (base64: string) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onNavigate,
  onOpenEditModal,
  onPhotoUploaded,
  onLogout,
  onDeleteAccount,
  showToast
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Selecione uma imagem válida (JPEG, PNG)', 'error');
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      showToast('Imagem muito grande. Máximo 2.5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        onPhotoUploaded(base64);
        showToast('Foto de perfil atualizada com sucesso!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--';
    try {
      const [y, m, d] = dateStr.split('-');
      if (y && m && d) return `${d}/${m}/${y}`;
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen pb-28 bg-[#F8F9FB]">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <header
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px) + 1.25rem, 1.25rem)' }}
        className="relative bg-linear-to-br from-[#4CAF50] to-[#2E7D32] p-5 text-white rounded-b-3xl shadow-md overflow-hidden"
      >
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Perfil</h1>
            <p className="text-xs text-white/80 mt-0.5">Seus dados e preferências</p>
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
        {/* Profile Card with Photo */}
        <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex flex-col items-center text-center">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full bg-emerald-100 text-[#4CAF50] flex items-center justify-center cursor-pointer group shadow-md border-4 border-emerald-50 overflow-hidden"
          >
            {user.photo ? (
              <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10" />
            )}

            {/* Hover overlay with camera icon */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
              <Camera className="w-6 h-6" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 px-3.5 py-1.5 bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-[#4CAF50] rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            Alterar foto
          </button>

          <h2 className="text-xl font-bold text-gray-900 mt-3">{user.name || 'Usuário DéfiW'}</h2>
          <span className="text-xs text-gray-400 font-medium mt-0.5">
            CPF: {user.cpf || '--'}
          </span>
        </section>

        {/* Personal Details List */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-2xs divide-y divide-gray-100 overflow-hidden text-xs">
          <div className="p-3.5 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="font-medium">Data de nascimento</span>
            </div>
            <span className="font-bold text-gray-900">{formatDate(user.dob)}</span>
          </div>

          <div className="p-3.5 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <User className="w-4 h-4" />
              </div>
              <span className="font-medium">Gênero</span>
            </div>
            <span className="font-bold text-gray-900">{user.gender || '--'}</span>
          </div>

          <div className="p-3.5 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <Ruler className="w-4 h-4" />
              </div>
              <span className="font-medium">Altura</span>
            </div>
            <span className="font-bold text-gray-900">{user.height ? `${user.height} cm` : '--'}</span>
          </div>

          <div className="p-3.5 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <Scale className="w-4 h-4" />
              </div>
              <span className="font-medium">Peso atual</span>
            </div>
            <span className="font-bold text-gray-900">
              {user.weight ? `${String(user.weight).replace('.', ',')} kg` : '--'}
            </span>
          </div>

          <div className="p-3.5 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-medium">Nível de atividade</span>
            </div>
            <span className="font-bold text-gray-900">{user.activity || '--'}</span>
          </div>

          <div className="p-3.5 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <Target className="w-4 h-4" />
              </div>
              <span className="font-medium">Objetivo</span>
            </div>
            <span className="font-bold text-gray-900">{user.objective || '--'}</span>
          </div>

          <div className="p-3.5 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <Scale className="w-4 h-4" />
              </div>
              <span className="font-medium">Peso objetivo</span>
            </div>
            <span className="font-bold text-emerald-600">
              {user.goalWeight ? `${String(user.goalWeight).replace('.', ',')} kg` : '--'}
            </span>
          </div>
        </section>

        {/* Action Button: Edit Profile */}
        <button
          onClick={onOpenEditModal}
          className="w-full py-3.5 px-4 bg-linear-to-r from-[#4CAF50] to-[#388E3C] text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Edit3 className="w-4 h-4" />
          Atualizar Informações & Metas
        </button>

        {/* Links & Account Management */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-2xs divide-y divide-gray-100 overflow-hidden text-xs">
          <button
            onClick={() => onNavigate('terms')}
            className="w-full p-3.5 px-4 flex items-center justify-between text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-semibold">Termos de Uso</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={onLogout}
            className="w-full p-3.5 px-4 flex items-center justify-between text-red-600 hover:bg-red-50/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="font-semibold">Sair da conta</span>
            </div>
            <ChevronRight className="w-4 h-4 text-red-300" />
          </button>

          <button
            onClick={onDeleteAccount}
            className="w-full p-3.5 px-4 flex items-center justify-between text-red-700 hover:bg-red-50/80 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-red-700">
                <Trash2 className="w-4 h-4" />
              </div>
              <span className="font-semibold">Apagar conta permanentemente</span>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400" />
          </button>
        </section>

        {/* DéfiW Brand Badge & Creator info */}
        <section className="flex flex-col items-center justify-center py-6 text-center">
          <Logo size={44} className="rounded-xl shadow-xs mb-2" />
          <h4 className="text-sm font-extrabold text-gray-800 tracking-tight">
            Défi<span className="text-[#4CAF50]">W</span>
          </h4>
          <p className="text-[11px] text-gray-500 font-medium mt-0.5">
            Desenvolvido por <strong className="text-gray-700">Wenndy Ferreira</strong>
          </p>
          <p className="text-[10px] text-gray-400 font-medium">
            Estudante de Análise e Desenvolvimento de Sistemas (ADS) • v1.0.0
          </p>
        </section>
      </main>
    </div>
  );
};
