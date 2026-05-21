<script setup>
import { ref, computed } from 'vue';
import api from '@/services/api.js';
import { edital, niveisDificuldade } from '@/data/editalData.js';
import { useSession } from '@/composables/useSession';

const { sessionId } = useSession();
const etapa = ref('configuracao');

const config = ref({
  materia: Object.keys(edital)[0],
  topico: edital[Object.keys(edital)[0]][0],
  nivel: niveisDificuldade[1],
  quantidade: 5,
});
const topicosDisponiveis = computed(() => edital[config.value.materia] || []);

const isLoading = ref(false);
const error = ref(null);

const questoes = ref([]);
const respostasUsuario = ref([]);
const questaoAtualIndex = ref(0);

const questaoAtual = computed(() => questoes.value[questaoAtualIndex.value]);
const progresso = computed(
  () => `Questão ${questaoAtualIndex.value + 1} de ${questoes.value.length}`
);

const pontuacaoFinal = computed(() => {
  const acertos = questoes.value.reduce((total, questao, index) => {
    return respostasUsuario.value[index] === questao.resposta_correta
      ? total + 1
      : total;
  }, 0);
  const total = questoes.value.length;
  const percentual = total > 0 ? ((acertos / total) * 100).toFixed(0) : 0;
  return { acertos, total, percentual };
});

const iniciarSimulado = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.gerarSimulado(config.value);
    if (response.data.length === 0) {
      throw new Error('A IA não retornou nenhuma questão. Tente novamente.');
    }
    questoes.value = response.data;
    respostasUsuario.value = Array(questoes.value.length).fill(null);
    etapa.value = 'execucao';
  } catch (err) {
    error.value = err.response?.data?.detail || 'Falha ao gerar o simulado.';
  } finally {
    isLoading.value = false;
  }
};

const selecionarResposta = (alternativa) => {
  respostasUsuario.value[questaoAtualIndex.value] = alternativa;
};

const proximaQuestao = () => {
  if (questaoAtualIndex.value < questoes.value.length - 1) {
    questaoAtualIndex.value++;
  }
};

const finalizarSimulado = async () => {
  etapa.value = 'resultados';

  const resultadoParaSalvar = {
    materia: config.value.materia,
    topico: config.value.topico,
    session_id: sessionId.value,
    questoes: questoes.value,
    respostasUsuario: respostasUsuario.value,
  };

  try {
    console.log('Enviando resultados para salvar...');
    await api.salvarSimulado(resultadoParaSalvar);
    console.log('Resultados salvos com sucesso!');
  } catch (err) {
    console.error('Falha ao salvar os resultados do simulado:', err);
  }
};

const reiniciarSimulado = () => {
  etapa.value = 'configuracao';
  questoes.value = [];
  respostasUsuario.value = [];
  questaoAtualIndex.value = 0;
};

const getClasseRevisao = (questao, alternativa, index) => {
  const respostaCorreta = questao.resposta_correta;
  const respostaUsuario = respostasUsuario.value[index];

  if (alternativa === respostaCorreta) {
    return { correta: true };
  }

  if (alternativa === respostaUsuario) {
    return { 'resposta-usuario-incorreta': true };
  }

  return {};
};
</script>

<template>
  <main class="container">
    <div v-if="etapa === 'configuracao'">
      <h2>Configurar Simulado</h2>
      <form @submit.prevent="iniciarSimulado" class="form-container">
        <div class="form-group">
          <label for="materia">Matéria</label>
          <select id="materia" v-model="config.materia">
            <option
              v-for="materia in Object.keys(edital)"
              :key="materia"
              :value="materia"
            >
              {{ materia }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="topico">Tópico</label>
          <select id="topico" v-model="config.topico">
            <option
              v-for="topico in topicosDisponiveis"
              :key="topico"
              :value="topico"
            >
              {{ topico }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="quantidade">Número de Questões</label>
          <input
            type="number"
            id="quantidade"
            v-model.number="config.quantidade"
            min="1"
            max="10"
          />
        </div>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Gerando Simulado...' : 'Iniciar Simulado' }}
        </button>
        <div v-if="error" class="error-message">{{ error }}</div>
      </form>
    </div>

    <div v-else-if="etapa === 'execucao' && questaoAtual">
      <h2>Simulado em Andamento</h2>
      <div class="progresso-bar">{{ progresso }}</div>
      <article class="questao-container">
        <p class="enunciado">{{ questaoAtual.enunciado }}</p>
        <ul class="alternativas">
          <li
            v-for="(alt, index) in questaoAtual.alternativas"
            :key="index"
            @click="selecionarResposta(alt)"
            :class="{
              selecionada: respostasUsuario[questaoAtualIndex] === alt,
            }"
          >
            <span class="letra">{{ String.fromCharCode(65 + index) }})</span>
            {{ alt }}
          </li>
        </ul>
      </article>
      <div class="navegacao-simulado">
        <button
          @click="proximaQuestao"
          v-if="questaoAtualIndex < questoes.length - 1"
        >
          Próxima
        </button>
        <button @click="finalizarSimulado" v-else>Finalizar Simulado</button>
      </div>
    </div>

    <div v-else-if="etapa === 'resultados'">
      <h2>Resultados do Simulado</h2>
      <div class="resultado-placar">
        Você acertou
        <strong
          >{{ pontuacaoFinal.acertos }} de {{ pontuacaoFinal.total }}</strong
        >
        <span>({{ pontuacaoFinal.percentual }}%)</span>
      </div>
      <button @click="reiniciarSimulado" class="botao-reiniciar">
        Fazer Novo Simulado
      </button>

      <div class="revisao-container">
        <h3>Revisão Detalhada</h3>
        <div
          v-for="(questao, index) in questoes"
          :key="index"
          class="revisao-questao"
        >
          <p class="enunciado">
            <strong>Questão {{ index + 1 }}:</strong> {{ questao.enunciado }}
          </p>
          <ul class="alternativas-revisao">
            <li
              v-for="alt in questao.alternativas"
              :key="alt"
              :class="getClasseRevisao(questao, alt, index)"
            >
              {{ alt }}
            </li>
          </ul>
          <div class="revisao-comentarios">
            <p>
              <strong>Sua Resposta:</strong>
              {{ respostasUsuario[index] || 'Não respondida' }}
            </p>
            <p>
              <strong>Resposta Correta:</strong> {{ questao.resposta_correta }}
            </p>
            <details>
              <summary>Ver Comentários da IA</summary>
              <p>{{ questao.comentarios }}</p>
            </details>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: var(--space-4) auto;
  padding: var(--space-4);
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-container,
.questao-container,
.resultado-placar {
  background: var(--c-bg-surface);
  border: 1px solid var(--c-border);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-6);
  box-shadow: var(--shadow-sm);
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--space-4);
}

label {
  margin-bottom: var(--space-2);
  font-weight: 600;
  color: var(--c-text-primary);
}

input,
select {
  padding: var(--space-3);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  background-color: var(--c-bg-surface);
  color: var(--c-text-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-fast);
}

input:focus, select:focus {
  outline: none;
  border-color: var(--c-brand-primary);
}

button {
  padding: var(--space-3) var(--space-6);
  background-color: var(--c-brand-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: 600;
  transition: background-color var(--transition-fast);
}

button:hover:not(:disabled) {
  background-color: var(--c-brand-primary-hover);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: var(--c-danger);
  margin-top: var(--space-4);
  font-weight: 500;
}

.progresso-bar {
  text-align: center;
  font-weight: 600;
  margin-bottom: var(--space-4);
  color: var(--c-text-secondary);
}

.enunciado {
  font-size: var(--font-size-lg);
  font-weight: 500;
  margin-bottom: var(--space-6);
  color: var(--c-text-primary);
}

.alternativas {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.alternativas li {
  padding: var(--space-4);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all var(--transition-fast);
  background: var(--c-bg-surface);
}

.alternativas li:hover {
  border-color: var(--c-brand-primary);
  background: var(--c-bg-surface-hover);
}

.alternativas li.selecionada {
  background-color: rgba(59, 130, 246, 0.1); /* var(--c-brand-primary) with opacity */
  border-color: var(--c-brand-primary);
  color: var(--c-brand-primary);
  font-weight: 500;
}

.alternativas .letra {
  font-weight: bold;
  margin-right: var(--space-3);
  color: var(--c-text-tertiary);
}

.selecionada .letra {
  color: var(--c-brand-primary);
}

.navegacao-simulado {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-4);
}

.resultado-placar {
  text-align: center;
  font-size: var(--font-size-xl);
}

.resultado-placar strong {
  color: var(--c-brand-primary);
  font-size: var(--font-size-3xl);
  display: block;
  margin: var(--space-2) 0;
}

.botao-reiniciar {
  display: block;
  margin: 0 auto var(--space-8) auto;
}

.revisao-container {
  margin-top: var(--space-8);
  border-top: 1px solid var(--c-border);
  padding-top: var(--space-6);
}

.revisao-questao {
  margin-bottom: var(--space-6);
  padding: var(--space-6);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  background: var(--c-bg-surface);
}

.alternativas-revisao {
  list-style: none;
  padding: 0;
  margin-bottom: var(--space-4);
}

.alternativas-revisao li {
  padding: var(--space-3);
  margin-bottom: var(--space-2);
  border-radius: var(--radius-md);
  border: 1px solid var(--c-border);
}

.alternativas-revisao .correta {
  background-color: rgba(16, 185, 129, 0.1);
  border-color: var(--c-success);
  color: var(--c-success);
  font-weight: bold;
}

.alternativas-revisao .resposta-usuario-incorreta {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: var(--c-danger);
  color: var(--c-danger);
  text-decoration: line-through;
}

.revisao-comentarios {
  font-size: var(--font-size-sm);
  background-color: var(--c-bg-surface-hover);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  margin-top: var(--space-4);
}

.revisao-comentarios details {
  cursor: pointer;
  margin-top: var(--space-2);
}

.revisao-comentarios summary {
  font-weight: 600;
  color: var(--c-brand-primary);
}
</style>
