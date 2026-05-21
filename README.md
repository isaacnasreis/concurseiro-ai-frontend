# Concurseiro AI - Frontend (Vue 3) 🚀

Interface de usuário (SPA) focada em produtividade e sem distrações. Desenvolvida para ser elegante, rápida e "mobile-first", permitindo que os estudantes pratiquem para provas através de dispositivos móveis ou desktop com conforto.

## 🎨 Design System e Estética
Para garantir um alto desempenho e total autonomia de design, o projeto adota **Vanilla CSS** com propriedades modernas (variáveis CSS, Grid/Flexbox) em vez de frameworks de terceiros.
- **Glassmorphism**: Componentes flutuantes e painéis `.glass-panel` para um visual premium e fluído.
- **Modo Dinâmico**: Arquitetura CSS preparada nativamente para transição Light / Dark Mode de forma orgânica e persistente.
- **Componentização Semântica**: Componentes Vue isolados com composables (ex: `useSession`, `useTheme`).

## 🛠️ Tecnologias Utilizadas
- **Vue.js 3**: Composition API (script setup).
- **Vite**: Build tool extremamente veloz.
- **Vue Router**: Para roteamento client-side (Dashboard, Simulados, Gerador Rápido, Mentor, Simplificador).
- **Axios**: Comunicação eficiente com a API do backend FastAPI.

## 📦 Como rodar localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Crie a configuração do ambiente (.env):**
   Crie um arquivo `.env` para apontar o Axios para sua API local (se estiver usando uma porta diferente).
   ```env
   VITE_API_URL=http://localhost:8000
   ```

3. **Inicie o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   O frontend estará disponível geralmente em `http://localhost:5173`.

## 📌 Checklist de Acessibilidade
Toda a paleta de cores (`base.css`) foi estruturada para garantir contraste, enquanto as transições sutis asseguram que os elementos se comportem previsivelmente ao interagir.
