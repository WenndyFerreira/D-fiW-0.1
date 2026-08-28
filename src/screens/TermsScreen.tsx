import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check } from 'lucide-react';
import { Logo } from '../components/Logo';
import { ScreenType } from '../types';

interface TermsScreenProps {
  onBack: () => void;
  onAccept: () => void;
}

export const TermsScreen: React.FC<TermsScreenProps> = ({ onBack, onAccept }) => {
  return (
    <div className="min-h-screen pb-20 bg-[#F8F9FB]">
      {/* Header */}
      <header
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px) + 1.25rem, 1.25rem)' }}
        className="relative bg-linear-to-br from-[#4CAF50] to-[#2E7D32] p-5 text-white rounded-b-3xl shadow-md overflow-hidden"
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <Logo size={36} className="rounded-xl shadow-xs" />
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Termos de Uso</h1>
              <p className="text-xs text-white/80">DéfiW — Diretrizes e Privacidade</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-[480px] mx-auto">
        <section className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs space-y-4 text-xs text-gray-700 leading-relaxed">
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-950 font-medium space-y-1">
            <div className="flex items-center justify-between text-[11px] text-emerald-800">
              <span><strong>Versão:</strong> 1.0.0</span>
              <span><strong>Atualização:</strong> 2026</span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Bem-vindo ao <strong>DéfiW</strong>! Ao utilizar este aplicativo, você declara que leu e concorda com as diretrizes e propósitos aqui descritos.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-1">1. Autoria e Finalidade de Estudo</h2>
            <p>
              O <strong>DéfiW</strong> foi idealizado e desenvolvido por <strong>Wenndy Ferreira</strong>, estudante do curso de <strong>Análise e Desenvolvimento de Sistemas (ADS)</strong>. O projeto foi concebido para fins exclusivamente de estudo, pesquisa e aprimoramento prático em engenharia de software e desenvolvimento de aplicações móveis modernas.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-1">2. Sobre o Aplicativo e Caráter Informativo</h2>
            <p>
              O aplicativo atua como uma ferramenta digital de suporte à organização de rotinas saudáveis, permitindo o registro de refeições, ingestão de água, acompanhamento de metas e cálculo estimado de déficit calórico. <strong>O DéfiW possui caráter estritamente educativo e informativo</strong>, não substituindo consultas, prescrições, diagnósticos ou orientações fornecidas por profissionais habilitados de medicina, nutrição ou educação física.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-1">3. Responsabilidade do Usuário</h2>
            <p>
              O usuário é o único responsável pela veracidade dos dados informados e pela forma como gerencia suas refeições e hábitos. Dietas restritivas e planos de emagrecimento devem ser sempre orientados e acompanhados por nutricionistas ou médicos especializados.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-1">4. Privacidade e Armazenamento dos Dados</h2>
            <p>
              Os dados de perfil, histórico de refeições e registros diários são salvos de forma local e segura no próprio dispositivo do usuário, respeitando a privacidade e sendo utilizados unicamente para viabilizar as funcionalidades da aplicação.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-1">5. Aceitação e Compromisso</h2>
            <p>
              Ao interagir com o DéfiW, você valoriza a iniciativa acadêmica e concorda em usufruir da ferramenta como um facilitador de organização diária em prol de uma vida mais ativa e equilibrada.
            </p>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2">
          <button
            onClick={onBack}
            className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-3 px-4 bg-linear-to-r from-[#4CAF50] to-[#388E3C] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Aceitar Termos
          </button>
        </div>
      </main>
    </div>
  );
};
