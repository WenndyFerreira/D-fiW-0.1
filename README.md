# DéfiW - Aplicativo focado em Déficit Calórico

Aplicativo moderno desenvolvido em **React 18 + Vite + TypeScript + Tailwind CSS** com animações suaves via **Framer Motion** e suporte a **PWA / App Store (via Capacitor)**. O projeto foi concebido para fins exclusivamente de estudo, pesquisa e aprimoramento prático em engenharia de software e desenvolvimento de aplicações móveis modernas.

> 🎓 **Desenvolvido por:** Wenndy Ferreira;
> 📆 **Data do desenvolvimento:** 25/08/2026;
> ✅ **Utilidade:** Pública;
> 📚 **Curso:** Análise e Desenvolvimento de Sistemas (ADS); 
> 💡 **Finalidade:** Projeto acadêmico e de estudo prático em desenvolvimento de software moderno;

---

## 📂 Estrutura e Descrição dos Arquivos

### ⚙️ Arquivos de Configuração na Raiz (Root)
- `index.html`: Ponto de entrada da aplicação web. Contém viewport mobile, favicon e carrega o script principal (`/src/main.tsx`).
- `package.json`: Dependências do projeto (React, Lucide Icons, Tailwind, Motion, etc.) e scripts de execução (`dev`, `build`, `lint`).
- `vite.config.ts`: Configuração do empacotador Vite e Tailwind CSS.
- `tsconfig.json`: Configurações do compilador TypeScript.
- `netlify.toml`: Configuração de hospedagem na Netlify para redirecionamento SPA sem erro 404.
- `.gitignore`: Pastas e arquivos ignorados pelo Git (`node_modules`, `dist`, etc.).
- `README.md`: Documento descritivo e instruções do projeto.

### 🌐 Pasta `public/` (Arquivos Públicos e Estáticos)
- `public/_redirects`: Regra de redirecionamento SPA para a Netlify.
- `public/manifest.json`: Manifesto PWA para instalação como app no celular.
- `public/favicon.ico` e `public/logo.png`: Ícones de identificação na aba do navegador.
- `public/apple-touch-icon.png`: Ícone para dispositivos iOS/Apple.

### 💻 Pasta `src/` (Código-Fonte Principal)
- `src/main.tsx`: Inicializa o React e monta a aplicação no `#root`.
- `src/App.tsx`: Controlador principal de estado, autenticação e navegação entre telas.
- `src/types.ts`: Tipagens e interfaces TypeScript (Usuário, Refeições, Alimentos, etc.).
- `src/index.css`: Importação do Tailwind CSS e estilos globais.
- `src/vite-env.d.ts`: Declarações de tipos do Vite.

### 📱 Pasta `src/screens/` (Telas do Aplicativo)
- `DashboardScreen.tsx`: Resumo diário de calorias consumidas, barras de macros, água e refeições do dia.
- `LoginScreen.tsx`: Tela de autenticação com validações visuais.
- `RegisterScreen.tsx`: Onboarding com cálculo de Taxa Metabólica Basal (TMB) e metas calóricas.
- `FoodScreen.tsx`: Catálogo completo de alimentos com busca instantânea e filtros por categorias.
- `AssistantScreen.tsx`: Chat interativo com a IA **Défi Robô** com suporte a texto e áudio.
- `ProgressScreen.tsx`: Histórico de peso, gráficos calóricos e evolução corporal.
- `ProfileScreen.tsx`: Gerenciamento de perfil, metas e preferências.
- `TermsScreen.tsx`: Termos de Uso e Política de Privacidade.

### 🧩 Pasta `src/components/` (Componentes Reutilizáveis)
- `Logo.tsx`: Componente com o monograma oficial "D" em alta definição.
- `BottomNav.tsx`: Barra de navegação inferior estilo aplicativo mobile.
- `MealAddModal.tsx`: Modal para registrar alimentos em cada refeição.
- `FoodQuantityModal.tsx`: Modal de ajuste de porções (gramas, ml ou P/M/G).
- `EditProfileModal.tsx`: Modal de edição de peso, altura e dados do usuário.
- `AccountModals.tsx`: Modais de gerenciamento e encerramento de conta.
- `AlertModal.tsx`: Modal de avisos e confirmações de ações.
- `Toast.tsx`: Notificações flutuantes de feedback na tela.

### 🧠 Pasta `src/utils/` (Funções Utilitárias e Lógica)
- `storage.ts`: Persistência local no navegador (`localStorage`).
- `nutrition.ts`: Fórmulas nutricionais (Harris-Benedict, balanço calórico e distribuição de macros).
- `textFoodParser.ts`: Processamento de texto natural para reconhecimento automático de refeições.
- `defiAssistantEngine.ts`: Motor de respostas inteligentes do Défi Robô.

### 🥗 Pasta `src/data/` (Banco de Dados de Alimentos)
- `foodDbTypes.ts`: Estrutura de dados dos alimentos.
- `portionFoodDB.ts`: Tabela com médias de porções usuais do dia a dia.
- `src/data/foods/`: Base extensa categorizada (proteínas, carboidratos, vegetais, frutas, pratos típicos, veganos, bebidas, etc.).

### 🖼️ Pasta `src/assets/images/` (Assets Visuais)
- `defiw_pro_d_logo_*.jpg`: Logo oficial em alta definição.
- `defi_bot_headshot_*.jpg`: Foto oficial do assistente Défi Robô.

---

## 🛠️ Scripts Disponíveis

```bash
# Iniciar servidor local de desenvolvimento
npm run dev

# Gerar build de produção para deploy
npm run build

# Validação estática de tipos TypeScript
npm run lint

Obrigado