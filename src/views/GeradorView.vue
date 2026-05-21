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

      <div v-if="isLoading" class="loading-container glass-panel">
        <div class="spinner">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="50" r="40" stroke="var(--c-brand-primary)" stroke-width="8" fill="none" stroke-dasharray="160" stroke-linecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1.2s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
        <h3>Processando com IA...</h3>
        <p>A inteligência artificial está elaborando sua questão. Isso pode levar alguns segundos.</p>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="form-container glass-panel">
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
          <div class="file-upload-wrapper">
            <label for="upload-contexto" class="btn-file-upload">
              📁 Escolher Arquivo PDF ou TXT
            </label>
            <input
              type="file"
              id="upload-contexto"
              @change="handleFileUpload"
              accept=".txt,.pdf"
              class="hidden-input"
            />
          </div>

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

        <button type="submit">Gerar Questão</button>
        <div v-if="error" class="error-message">{{ error }}</div>
      </form>

    <article v-if="questaoGerada && !isLoading" class="questao-container glass-panel">
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
  margin: var(--space-4) auto;
  padding: var(--space-4);
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.form-container,
.questao-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: var(--space-2);
  font-weight: 600;
  color: var(--c-text-primary);
}

input[type="text"],
input[type="number"],
select,
textarea {
  padding: var(--space-3);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  background-color: var(--c-bg-surface);
  color: var(--c-text-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-fast);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--c-brand-primary);
}

/* Estilo melhorado para upload de arquivo */
.file-upload-wrapper {
  margin-top: var(--space-2);
}

.hidden-input {
  display: none !important;
}

.btn-file-upload {
  display: inline-block;
  padding: var(--space-3) var(--space-4);
  background-color: var(--c-bg-surface-hover);
  border: 1px dashed var(--c-brand-primary);
  color: var(--c-brand-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-fast);
  text-align: center;
  width: 100%;
}

.btn-file-upload:hover {
  background-color: rgba(59, 130, 246, 0.1);
  border-style: solid;
}

button {
  padding: var(--space-3);
  background-color: var(--c-brand-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: 600;
  transition: background-color var(--transition-fast);
  margin-top: var(--space-4);
}

button:hover:not(:disabled) {
  background-color: var(--c-brand-primary-hover);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  text-align: center;
  color: var(--c-danger);
  margin-top: var(--space-4);
  font-weight: 600;
}

.questao-container h2 {
  margin-bottom: var(--space-4);
  color: var(--c-brand-primary);
}

.enunciado {
  font-size: var(--font-size-lg);
  font-weight: 500;
  margin-bottom: var(--space-6);
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
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  background: var(--c-bg-surface);
}

.alternativas li:hover {
  border-color: var(--c-brand-primary);
  background-color: var(--c-bg-surface-hover);
}

.alternativas .letra {
  font-weight: bold;
  margin-right: var(--space-3);
  color: var(--c-text-tertiary);
}

.alternativas .selecionada {
  background-color: rgba(59, 130, 246, 0.1);
  border-color: var(--c-brand-primary);
  color: var(--c-brand-primary);
}

.selecionada .letra {
  color: var(--c-brand-primary);
}

.alternativas .correta {
  background-color: rgba(16, 185, 129, 0.1);
  border-color: var(--c-success);
  color: var(--c-success);
}

.alternativas .incorreta {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: var(--c-danger);
  color: var(--c-danger);
  text-decoration: line-through;
}

.resposta-container {
  margin-top: var(--space-6);
  padding: var(--space-4);
  background-color: var(--c-bg-surface-hover);
  border-left: 4px solid var(--c-success);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.upload-status {
  font-size: var(--font-size-sm);
  color: var(--c-success);
  margin-top: var(--space-2);
}

textarea[readonly] {
  background-color: var(--c-bg-surface-hover);
  color: var(--c-text-secondary);
  margin-top: var(--space-2);
}

/* Loading State UI */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-6);
  text-align: center;
  background: var(--c-bg-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-6);
}

.spinner {
  margin-bottom: var(--space-6);
}

.loading-container h3 {
  font-size: var(--font-size-2xl);
  color: var(--c-brand-primary);
  margin-bottom: var(--space-2);
}

.loading-container p {
  color: var(--c-text-secondary);
  max-width: 400px;
}
</style>
