<script setup>
import { ref, computed } from 'vue';
import api from '@/services/api.js';
import { edital, niveisDificuldade } from '@/data/editalData.js';

const materiaSelecionada = ref(Object.keys(edital)[0]);
const topicoSelecionado = ref(edital[materiaSelecionada.value][0]);
const nivelSelecionado = ref(niveisDificuldade[1]);
const contexto = ref('');
const uploadStatus = ref('');
const uploadError = ref(null);

const isLoading = ref(false);
const error = ref(null);
const questaoGerada = ref(null);
const respostaUsuario = ref(null);
const quizSubmetido = ref(false);

const topicosDisponiveis = computed(() => {
  return edital[materiaSelecionada.value] || [];
});

const handleSubmit = async () => {
  isLoading.value = true;
  error.value = null;
  questaoGerada.value = null;
  respostaUsuario.value = null;
  quizSubmetido.value = false;

  try {
    const response = await api.gerarQuestao(
      materiaSelecionada.value,
      topicoSelecionado.value,
      nivelSelecionado.value,
      contexto.value
    );
    questaoGerada.value = response.data;
  } catch (err) {
    console.error('Falha ao gerar questão:', err);
    error.value =
      'Não foi possível gerar a questão. Verifique o backend e tente novamente.';
  } finally {
    isLoading.value = false;
  }
};

const handleFileUpload = async (event) => {
  const arquivo = event.target.files[0];
  if (!arquivo) return;

  uploadStatus.value = 'Enviando arquivo...';
  uploadError.value = null;
  contexto.value = '';

  try {
    const response = await api.extrairContexto(arquivo);
    contexto.value = response.data.contexto;
    uploadStatus.value = `Arquivo "${response.data.nome_arquivo}" carregado com sucesso!`;
  } catch (err) {
    console.error('Falha no upload:', err);
    uploadStatus.value = '';
    uploadError.value =
      err.response?.data?.detail || 'Ocorreu um erro ao enviar o arquivo.';
  }
};

const selecionarResposta = (alternativa) => {
  if (quizSubmetido.value) return;

  respostaUsuario.value = alternativa;
};

const verificarResposta = () => {
  if (!respostaUsuario.value) return;
  quizSubmetido.value = true;
};

const atualizarTopico = () => {
  topicoSelecionado.value = edital[materiaSelecionada.value][0];
};

const getAlternativaClass = (alternativa) => {
  if (!quizSubmetido.value) {
    return { selecionada: respostaUsuario.value === alternativa };
  } else {
    const isCorreta = alternativa === questaoGerada.value.resposta_correta;
    const isSelecionadaPeloUsuario = alternativa === respostaUsuario.value;

    return {
      correta: isCorreta,
      incorreta: !isCorreta && isSelecionadaPeloUsuario,
    };
  }
};
</script>

<template>
  <main class="container">
    <header>
      <h1>ConcurseiroAI 🧠</h1>
      <p>Sua ferramenta de estudos com Inteligência Artificial</p>
    </header>

    <form @submit.prevent="handleSubmit" class="form-container">
      <div class="form-group">
        <label for="materia">Matéria</label>
        <select
          id="materia"
          v-model="materiaSelecionada"
          @change="atualizarTopico"
        >
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
        <select id="topico" v-model="topicoSelecionado">
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
        <label for="nivel">Nível de Dificuldade</label>
        <select id="nivel" v-model="nivelSelecionado">
          <option
            v-for="nivel in niveisDificuldade"
            :key="nivel"
            :value="nivel"
          >
            {{ nivel }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="upload-contexto">Contexto (Opcional)</label>
        <input
          type="file"
          id="upload-contexto"
          @change="handleFileUpload"
          accept=".txt,.pdf"
        />

        <p v-if="uploadStatus" class="upload-status">{{ uploadStatus }}</p>
        <p v-if="uploadError" class="error-message">{{ uploadError }}</p>

        <textarea
          v-if="contexto"
          id="contexto"
          v-model="contexto"
          rows="8"
          placeholder="Conteúdo do arquivo aparecerá aqui..."
          readonly
        ></textarea>
      </div>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Gerando...' : 'Gerar Questão' }}
      </button>
    </form>

    <div v-if="isLoading" class="loading-indicator">
      <p>Aguarde, a IA está elaborando sua questão...</p>
    </div>

    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>

    <article v-if="questaoGerada" class="questao-container">
      <h2>Questão Gerada:</h2>
      <p class="enunciado">{{ questaoGerada.enunciado }}</p>

      <ul class="alternativas">
        <li
          v-for="(alt, index) in questaoGerada.alternativas"
          :key="index"
          @click="selecionarResposta(alt)"
          :class="getAlternativaClass(alt)"
        >
          <span class="letra">{{ String.fromCharCode(65 + index) }}</span>
          {{ alt }}
        </li>
      </ul>

      <button
        @click="verificarResposta"
        v-if="!quizSubmetido"
        :disabled="!respostaUsuario"
      >
        Confirmar Resposta
      </button>

      <div v-if="quizSubmetido" class="resposta-container">
        <p><strong>Comentários:</strong> {{ questaoGerada.comentarios }}</p>
      </div>
    </article>
  </main>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: sans-serif;
  color: #bebebe;
}
header {
  text-align: center;
  margin-bottom: 2rem;
}
.form-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}
.form-group {
  display: flex;
  flex-direction: column;
}
label {
  margin-bottom: 0.5rem;
  font-weight: bold;
}
input {
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
  cursor: not-allowed;
}
.loading-indicator,
.error-message {
  text-align: center;
  margin: 2rem 0;
  font-weight: bold;
}
.error-message {
  color: red;
}
.questao-container {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  padding: 1.5rem;
  border-radius: 8px;
  color: #333;
}
.enunciado {
  font-weight: bold;
  margin-bottom: 1rem;
}
.alternativas li {
  padding: 0.8rem;
  border: 1px solid #ddd;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
}
.alternativas li:hover {
  background-color: #f0f0f0;
}
.alternativas .letra {
  font-weight: bold;
  margin-right: 0.8rem;
}
.alternativas .selecionada {
  background-color: #dbeafe;
  border-color: #93c5fd;
}
.alternativas .correta {
  background-color: #dcfce7;
  border-color: #86efac;
  color: #15803d;
}
.alternativas .incorreta {
  background-color: #fee2e2;
  border-color: #fca5a5;
  color: #b91c1c;
}
.resposta-container {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #e9f5e9;
  border: 1px solid #a3d9a3;
  border-radius: 4px;
}
select {
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
}
.upload-status {
  font-size: 0.9rem;
  color: green;
  margin-top: 0.5rem;
}
textarea[readonly] {
  background-color: #f1f1f1;
  color: #555;
  margin-top: 0.5rem;
}
</style>
