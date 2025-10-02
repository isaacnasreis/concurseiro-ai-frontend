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

    <div class="form-container">
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

    <div v-if="textoProcessado" class="resultado-container">
      <h3>Texto Processado pela IA</h3>
      <pre>{{ textoProcessado }}</pre>
    </div>
  </main>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
}
.form-container,
.resultado-container {
  margin-top: 2rem;
  color: #343a40;
}
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}
label {
  margin-bottom: 0.5rem;
  font-weight: bold;
}
input,
textarea,
button {
  font-family: sans-serif;
  font-size: 1rem;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  background-color: #28a745;
  color: white;
  cursor: pointer;
}
button:disabled {
  background-color: #aaa;
}
.error-message {
  color: red;
}
.upload-status {
  color: green;
}
.resultado-container {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: sans-serif;
}
</style>
