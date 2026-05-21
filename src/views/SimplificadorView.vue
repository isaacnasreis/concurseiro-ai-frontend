<script setup>
import { ref } from 'vue';
import api from '@/services/api.js';

const textoOriginal = ref('');
const textoProcessado = ref('');
const comando = ref(
  'Explique este texto em termos simples, como se eu fosse um iniciante.'
);
const isLoading = ref(false);
const error = ref(null);

const uploadStatus = ref('');
const uploadError = ref(null);
const handleFileUpload = async (event) => {
  const arquivo = event.target.files[0];
  if (!arquivo) return;
  uploadStatus.value = 'Enviando arquivo...';
  uploadError.value = null;
  try {
    const response = await api.extrairContexto(arquivo);
    textoOriginal.value = response.data.contexto;
    uploadStatus.value = `Arquivo "${response.data.nome_arquivo}" carregado!`;
  } catch (err) {
    uploadError.value = err.response?.data?.detail || 'Erro no upload.';
  }
};

const processarTexto = async () => {
  if (!textoOriginal.value) return;
  isLoading.value = true;
  error.value = null;
  textoProcessado.value = '';
  try {
    const response = await api.simplificarTexto(
      textoOriginal.value,
      comando.value
    );
    textoProcessado.value = response.data.texto_processado;
  } catch (err) {
    error.value = err.response?.data?.detail || 'Falha ao processar o texto.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <main class="container">
    <h2>Simplificador de Conteúdo</h2>
    <p>
      Cole um texto ou envie um arquivo (.txt, .pdf) e peça para a IA
      explicá-lo.
    </p>

    <div class="form-container glass-panel">
      <div class="form-group">
        <label for="upload-contexto">1. Envie um arquivo (Opcional)</label>
        <input type="file" @change="handleFileUpload" accept=".txt,.pdf" />
        <p v-if="uploadStatus" class="upload-status">{{ uploadStatus }}</p>
        <p v-if="uploadError" class="error-message">{{ uploadError }}</p>
      </div>

      <div class="form-group">
        <label for="texto-original">2. Cole ou edite o texto</label>
        <textarea
          v-model="textoOriginal"
          rows="10"
          placeholder="O conteúdo do arquivo aparecerá aqui ou você pode colar diretamente."
        ></textarea>
      </div>

      <div class="form-group">
        <label for="comando">3. Diga à IA o que fazer</label>
        <input type="text" v-model="comando" />
      </div>

      <button @click="processarTexto" :disabled="isLoading || !textoOriginal">
        {{ isLoading ? 'Processando...' : 'Processar Texto' }}
      </button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>

    <div v-if="textoProcessado" class="resultado-container glass-panel">
      <h3>Texto Processado pela IA</h3>
      <pre>{{ textoProcessado }}</pre>
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

h2 {
  text-align: center;
  color: var(--c-text-primary);
  margin-bottom: var(--space-2);
}

p {
  text-align: center;
  color: var(--c-text-secondary);
  margin-bottom: var(--space-6);
}

.form-container,
.resultado-container {
  margin-bottom: var(--space-6);
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

input[type="text"],
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

input[type="text"]:focus, textarea:focus {
  outline: none;
  border-color: var(--c-brand-primary);
}

input[type="file"] {
  padding: var(--space-2) 0;
  color: var(--c-text-secondary);
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
  margin-top: var(--space-2);
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
  margin-top: var(--space-2);
  font-weight: 500;
}

.upload-status {
  color: var(--c-success);
  margin-top: var(--space-2);
  font-size: var(--font-size-sm);
}

.resultado-container h3 {
  color: var(--c-brand-primary);
  margin-bottom: var(--space-4);
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: var(--font-family);
  color: var(--c-text-primary);
  background: var(--c-bg-surface-hover);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  line-height: 1.6;
}
</style>
