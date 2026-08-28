# DéfiW - Aplicativo de Desafios e Metas Pessoais

Aplicativo moderno desenvolvido em **React 18 + Vite + TypeScript + Tailwind CSS** com animações suaves via **Framer Motion** e suporte a **PWA / App Store (via Capacitor)**.

> 🎓 **Desenvolvido por:** Wenndy Ferreira  
> 📚 **Curso:** Análise e Desenvolvimento de Sistemas (ADS)  
> 💡 **Finalidade:** Projeto acadêmico e de estudo prático em desenvolvimento de software moderno.

---

## 🚀 Como Rodar o Projeto no VS Code

### 1. Pré-requisitos
- Ter o **Node.js (versão 18 ou superior)** instalado ([Download Node.js](https://nodejs.org/)).
- **Visual Studio Code** instalado ([Download VS Code](https://code.visualstudio.com/)).

### 2. Passo a Passo
1. Extraia a pasta ZIP no seu computador.
2. Abra o **Visual Studio Code**.
3. Vá em **File (Arquivo) > Open Folder (Abrir Pasta)** e selecione a pasta do projeto.
4. Abra o Terminal integrado no VS Code (`Ctrl + \`` ou `Terminal > Novo Terminal`).
5. Execute os comandos:
   ```bash
   npm install
   npm run dev
   ```
6. Acesse no navegador: `http://localhost:3000`

---

## 📱 Como Publicar na Apple App Store (iOS)

Para transformar esta aplicação React/Vite em um app nativo iOS para a **App Store**, utiliza-se o **Capacitor** (a ferramenta oficial padrão para web apps):

### Passo 1: Instalar o Capacitor no Projeto
No terminal do projeto, execute:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init
```
*(Quando perguntado, defina o nome do app como `DéfiW` e o App ID como `com.defiw.app` ou seu domínio).*

### Passo 2: Configurar o `capacitor.config.json`
Certifique-se de que a pasta web (`webDir`) aponte para `dist`:
```json
{
  "appId": "com.defiw.app",
  "appName": "DéfiW",
  "webDir": "dist",
  "bundledWebRuntime": false
}
```

### Passo 3: Gerar a Build de Produção
```bash
npm run build
```

### Passo 4: Adicionar o iOS e Abrir no Xcode (Necessário Mac para compilar para App Store)
```bash
npx cap add ios
npx cap copy
npx cap open ios
```

### Passo 5: Publicação na App Store Connect
1. No **Xcode**, selecione sua conta Apple Developer (Signing & Capabilities).
2. Configure os ícones, splash screen e descrições.
3. Clique em **Product > Archive** e envie para o **App Store Connect** / TestFlight.

---

## 📂 Estrutura do Projeto

- `/src/App.tsx` - Componente raiz e orquestrador principal do app.
- `/src/screens/` - Telas do aplicativo (Desafios, Comunidade, Perfil, Ranking, etc.).
- `/src/components/` - Componentes reutilizáveis (botões, cards, modais).
- `/src/data/` - Base de dados local e desafios pré-cadastrados.
- `/src/types.ts` - Tipagens e interfaces TypeScript.
- `/public/` - Ícones, logotipos e manifesto PWA.
- `/package.json` - Dependências e scripts do projeto.

---

## 🛠️ Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento local.
- `npm run build`: Compila e otimiza o código para produção na pasta `/dist`.
- `npm run lint`: Valida tipos e código TypeScript.
