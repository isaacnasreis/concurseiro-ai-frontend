<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { useTheme } from './composables/useTheme';
import { useSession } from './composables/useSession';
import { ref } from 'vue';

const { theme, toggleTheme } = useTheme();
const { username, showNamePrompt, saveName } = useSession();

const inputName = ref('');

const handleSaveName = () => {
  saveName(inputName.value);
};
</script>

<template>
  <div class="app-layout">
    <header class="main-header glass-panel">
      <div class="wrapper">
        <div class="brand">
          <span class="logo">📚 ConcurseiroAI</span>
          <span class="greeting" v-if="username">Olá, {{ username }}</span>
        </div>
        <nav>
          <RouterLink to="/">Dashboard</RouterLink>
          <RouterLink to="/gerador">Gerador</RouterLink>
          <RouterLink to="/simulado">Simulados</RouterLink>
          <RouterLink to="/simplificador">Simplificador</RouterLink>
          <RouterLink to="/mentor">Mentor AI</RouterLink>
        </nav>
        <button class="theme-toggle" @click="toggleTheme" title="Trocar Tema">
          {{ theme === 'light' ? '🌙' : '☀️' }}
        </button>
      </div>
    </header>

    <main class="main-content">
      <RouterView />
    </main>

    <!-- Modal de Identificação (Simples) -->
    <div v-if="showNamePrompt" class="modal-overlay">
      <div class="modal-content glass-panel">
        <h2>Bem-vindo ao ConcurseiroAI! 👋</h2>
        <p>Como gostaria de ser chamado?</p>
        <input 
          v-model="inputName" 
          type="text" 
          placeholder="Seu nome ou apelido"
          @keyup.enter="handleSaveName"
          class="input-name"
        />
        <button @click="handleSaveName" class="btn-primary" :disabled="!inputName.trim()">
          Começar a Estudar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--c-border);
  border-radius: 0; /* Override glass-panel radius for header */
}

.wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  gap: var(--space-4);
}

.brand {
  display: flex;
  flex-direction: column;
}

.logo {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--c-brand-primary);
}

.greeting {
  font-size: var(--font-size-xs);
  color: var(--c-text-secondary);
}

nav {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

nav a {
  color: var(--c-text-secondary);
  font-weight: 500;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

nav a:hover {
  background-color: var(--c-bg-surface-hover);
  color: var(--c-brand-primary);
}

nav a.router-link-exact-active {
  color: var(--c-brand-primary);
  background-color: var(--c-brand-primary);
  color: white;
}

.theme-toggle {
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-full);
  transition: background var(--transition-fast);
}

.theme-toggle:hover {
  background-color: var(--c-bg-surface-hover);
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  padding: var(--space-8);
  max-width: 400px;
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  text-align: center;
}

.input-name {
  padding: var(--space-3);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  background-color: var(--c-bg-surface);
  color: var(--c-text-primary);
  font-size: var(--font-size-base);
  font-family: var(--font-family);
  outline: none;
  transition: border-color var(--transition-fast);
}

.input-name:focus {
  border-color: var(--c-brand-primary);
}

.btn-primary {
  background-color: var(--c-brand-primary);
  color: white;
  border: none;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--c-brand-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .wrapper {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .theme-toggle {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
  }
}
</style>
