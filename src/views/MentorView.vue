<script setup>
import { ref, computed } from 'vue';
import api from '@/services/api.js';
import { editalCompleto } from '@/data/editalData.js';

const materias = Object.keys(editalCompleto);
const materiaSelecionada = ref(materias[0]);
const topicoSelecionado = ref('');
const subTopicoSelecionado = ref(null);

const topicosDisponiveis = computed(() => {
  const topicos = editalCompleto[materiaSelecionada.value];
  return Array.isArray(topicos) ? topicos : Object.keys(topicos);
});

const subTopicosDisponiveis = computed(() => {
  const topicos = editalCompleto[materiaSelecionada.value];
  if (topicoSelecionado.value && !Array.isArray(topicos)) {
    return topicos[topicoSelecionado.value] || [];
  }
  return [];
});

const planoDeAula = ref(null);
const isLoading = ref(false);
const error = ref(null);

const respostaUsuarioQuiz = ref(null);
const quizSubmetido = ref(false);

const buscarPlanoDeAula = async () => {
  isLoading.value = true;
  error.value = null;
  planoDeAula.value = null;
  respostaUsuarioQuiz.value = null;
  quizSubmetido.value = false;

  try {
    const response = await api.gerarPlanoDeAula(
      materiaSelecionada.value,
      topicoSelecionado.value,
      subTopicoSelecionado.value
    );
    planoDeAula.value = response.data;
  } catch (err) {
    error.value =
      err.response?.data?.detail || 'Falha ao gerar o plano de aula.';
  } finally {
    isLoading.value = false;
  }
};

const selecionarRespostaQuiz = (alternativa) => {
  if (quizSubmetido.value) return;
  respostaUsuarioQuiz.value = alternativa;
};

const verificarRespostaQuiz = () => {
  if (!respostaUsuarioQuiz.value) return;
  quizSubmetido.value = true;
};

const getQuizClass = (alternativa) => {
  if (!planoDeAula.value) return {};
  const questao = planoDeAula.value.questao_exemplo;
  if (!quizSubmetido.value) {
    return { selecionada: respostaUsuarioQuiz.value === alternativa };
  } else {
    const isCorreta = alternativa === questao.resposta_correta;
    const isSelecionada = alternativa === respostaUsuarioQuiz.value;
    return {
      correta: isCorreta,
      incorreta: !isCorreta && isSelecionada,
    };
  }
};
</script>

<template>
  <main class="container">
    <h2>Mentor AI - Seu Tutor Particular</h2>
    <p>
      Selecione um tópico do edital e receba um plano de aula completo para
      iniciar seus estudos.
    </p>

    <div class="form-container">
      <div class="form-group">
        <label>Matéria</label>
        <select v-model="materiaSelecionada">
          <option v-for="materia in materias" :key="materia" :value="materia">
            {{ materia }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>Tópico Principal</label>
        <select v-model="topicoSelecionado">
          <option
            v-for="topico in topicosDisponiveis"
            :key="topico"
            :value="topico"
          >
            {{ topico }}
          </option>
        </select>
      </div>
      <div v-if="subTopicosDisponiveis.length > 0" class="form-group">
        <label>Sub-Tópico</label>
        <select v-model="subTopicoSelecionado">
          <option
            v-for="subTopico in subTopicosDisponiveis"
            :key="subTopico"
            :value="subTopico"
          >
            {{ subTopico }}
          </option>
        </select>
      </div>
      <button
        @click="buscarPlanoDeAula"
        :disabled="isLoading || !topicoSelecionado"
      >
        {{ isLoading ? 'Ensinando...' : 'Me ensine!' }}
      </button>
    </div>

    <div v-if="isLoading" class="loading-indicator">
      Carregando plano de aula...
    </div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <article v-if="planoDeAula" class="plano-aula-container">
      <h3>
        Plano de Aula: {{ topicoSelecionado }}
        {{ subTopicoSelecionado ? ' - ' + subTopicoSelecionado : '' }}
      </h3>

      <section>
        <h4>Explicação Simples</h4>
        <p>{{ planoDeAula.explicacao_simples }}</p>
      </section>

      <section>
        <h4>Pontos-Chave para Memorizar</h4>
        <ul>
          <li v-for="(ponto, i) in planoDeAula.pontos_chave" :key="i">
            {{ ponto }}
          </li>
        </ul>
      </section>

      <section>
        <h4>Como Cai em Prova</h4>
        <p>{{ planoDeAula.como_cai_em_prova }}</p>
      </section>

      <section class="questao-exemplo">
        <h4>Teste seu Conhecimento</h4>
        <p class="enunciado">{{ planoDeAula.questao_exemplo.enunciado }}</p>
        <ul class="alternativas">
          <li
            v-for="(alt, i) in planoDeAula.questao_exemplo.alternativas"
            :key="i"
            @click="selecionarRespostaQuiz(alt)"
            :class="getQuizClass(alt)"
          >
            {{ alt }}
          </li>
        </ul>
        <button
          @click="verificarRespostaQuiz"
          v-if="!quizSubmetido"
          :disabled="!respostaUsuarioQuiz"
        >
          Verificar
        </button>
        <div v-if="quizSubmetido" class="revisao-comentarios">
          <p>
            <strong>Comentários:</strong>
            {{ planoDeAula.questao_exemplo.comentarios }}
          </p>
        </div>
      </section>
    </article>
  </main>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
}
.form-container {
  padding: 1.5rem;
  margin-bottom: 2rem;
}
.form-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
select,
button {
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}
button {
  background-color: #007bff;
  color: white;
  cursor: pointer;
  border: none;
  margin-top: 1rem;
}
button:disabled {
  background-color: #aaa;
}
.loading-indicator,
.error-message {
  text-align: center;
  margin: 2rem;
}
.error-message {
  color: red;
}

.plano-aula-container {
  margin-top: 2rem;
}
.plano-aula-container section {
  margin-bottom: 2rem;
}
.plano-aula-container h4 {
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.questao-exemplo {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
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
  margin: 0.5rem 0;
  border-radius: 4px;
  cursor: pointer;
}
.alternativas li:hover {
  background-color: #f0f0f0;
}
.alternativas .selecionada {
  background-color: #dbeafe;
}
.alternativas .correta {
  background-color: #dcfce7;
}
.alternativas .incorreta {
  background-color: #fee2e2;
  text-decoration: line-through;
}

.revisao-comentarios {
  margin-top: 1rem;
  background-color: #e9ecef;
  padding: 1rem;
  border-radius: 4px;
}
</style>
