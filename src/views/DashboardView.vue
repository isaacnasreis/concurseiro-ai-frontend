<script setup>
import { useSession } from '@/composables/useSession';
import { ref, onMounted } from 'vue';
import api from '@/services/api.js';

const { username, sessionId } = useSession();
const stats = ref({
  simuladosRealizados: 0,
  questoesRespondidas: 0,
  taxaAcerto: 0
});

onMounted(async () => {
  if (sessionId.value) {
    try {
      const response = await api.getEstatisticas(sessionId.value);
      stats.value = response.data;
    } catch (err) {
      console.error('Falha ao buscar estatísticas', err);
    }
  }
});
</script>

<template>
  <div class="dashboard">
    <header class="dash-header">
      <h2>Bem-vindo de volta, <span class="highlight">{{ username || 'Concurseiro' }}</span>! 🎯</h2>
      <p>Acompanhe seu progresso e continue sua jornada de aprovação.</p>
    </header>

    <div class="stats-grid">
      <div class="stat-card glass-panel">
        <div class="stat-icon">📝</div>
        <div class="stat-info">
          <h3>Simulados</h3>
          <p class="stat-value">{{ stats.simuladosRealizados }}</p>
        </div>
      </div>
      
      <div class="stat-card glass-panel">
        <div class="stat-icon">🧠</div>
        <div class="stat-info">
          <h3>Questões</h3>
          <p class="stat-value">{{ stats.questoesRespondidas }}</p>
        </div>
      </div>

      <div class="stat-card glass-panel">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <h3>Taxa de Acerto</h3>
          <p class="stat-value">{{ stats.taxaAcerto }}%</p>
        </div>
      </div>
    </div>

    <div class="actions-grid">
      <router-link to="/gerador" class="action-card glass-panel">
        <h3>Gerar Questão Rápida</h3>
        <p>Pratique tópicos específicos sob demanda.</p>
      </router-link>
      <router-link to="/simulado" class="action-card glass-panel">
        <h3>Fazer Simulado</h3>
        <p>Teste seus conhecimentos com várias questões.</p>
      </router-link>
      <router-link to="/simplificador" class="action-card glass-panel">
        <h3>Simplificar Texto</h3>
        <p>Cole um texto difícil e a IA explica de forma simples.</p>
      </router-link>
      <router-link to="/mentor" class="action-card glass-panel">
        <h3>Mentor AI</h3>
        <p>Peça um plano de aula sobre qualquer assunto.</p>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dash-header {
  text-align: center;
}

.highlight {
  color: var(--c-brand-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  transition: transform var(--transition-fast);
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: var(--font-size-3xl);
  background: var(--c-bg-surface-hover);
  padding: var(--space-3);
  border-radius: var(--radius-full);
}

.stat-info h3 {
  font-size: var(--font-size-sm);
  color: var(--c-text-secondary);
  font-weight: 500;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--c-text-primary);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-4);
}

.action-card {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  color: inherit;
  transition: all var(--transition-fast);
}

.action-card:hover {
  transform: translateY(-5px);
  border-color: var(--c-brand-primary);
  box-shadow: 0 0 0 1px var(--c-brand-primary);
}

.action-card h3 {
  color: var(--c-brand-primary);
  font-size: var(--font-size-lg);
}

.action-card p {
  color: var(--c-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
