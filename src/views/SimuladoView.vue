<script setup>
import { ref, computed } from 'vue';
import api from '@/services/api.js';
import { edital, niveisDificuldade } from '@/data/editalData.js';

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

const finalizarSimulado = () => {
  etapa.value = 'resultados';
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
  margin: 2rem auto;
  padding: 1rem;
  font-family: sans-serif;
}
.form-container,
.questao-container,
.resultado-placar {
  margin-bottom: 2rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
label {
  margin-bottom: 0.5rem;
  font-weight: bold;
}
input,
select {
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  padding: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}
button:disabled {
  background-color: #aaa;
}
.error-message {
  color: red;
  margin-top: 1rem;
}
.progresso-bar {
  text-align: center;
  font-weight: bold;
  margin-bottom: 1rem;
}
.enunciado {
  font-weight: bold;
}
.alternativas {
  list-style: none;
  padding: 0;
}
.alternativas li {
  padding: 0.8rem;
  border: 1px solid #ddd;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.alternativas li:hover {
  background-color: #f0f0f0;
  color: #343a40;
}
.alternativas li.selecionada {
  background-color: #dbeafe;
  border-color: #93c5fd;
  color: #343a40;
}
.alternativas .letra {
  font-weight: bold;
  margin-right: 0.8rem;
}
.navegacao-simulado {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}
.resultado-placar {
  text-align: center;
  font-size: 1.5rem;
  background-color: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  color: #343a40;
}
.botao-reiniciar {
  display: block;
  margin: 0 auto 2rem auto;
}

.revisao-container {
  margin-top: 2rem;
  border-top: 1px solid #ccc;
  padding-top: 1rem;
}

.revisao-questao {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
}

.revisao-questao .enunciado {
  margin-bottom: 1rem;
}

.alternativas-revisao {
  list-style: none;
  padding: 0;
  margin-bottom: 1rem;
}

.alternativas-revisao li {
  padding: 0.8rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.alternativas-revisao .correta {
  background-color: #dcfce7;
  border-color: #86efac;
  color: #15803d;
  font-weight: bold;
}

.alternativas-revisao .resposta-usuario-incorreta {
  background-color: #fee2e2;
  border-color: #fca5a5;
  color: #b91c1c;
  text-decoration: line-through;
}

.revisao-comentarios {
  font-size: 0.9rem;
  background-color: #f8f9fa;
  color: #343a40;
  padding: 1rem;
  border-radius: 4px;
}

.revisao-comentarios details {
  cursor: pointer;
}

.revisao-comentarios summary {
  font-weight: bold;
  margin-bottom: 0.5rem;
}
</style>
