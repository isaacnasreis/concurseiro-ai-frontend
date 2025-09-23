<script setup>
import { ref } from "vue";
import api from "@/services/api.js";

const materia = ref("Direito Administrativo");
const topico = ref("Atos Administrativos");
const isLoading = ref(false);
const error = ref(null);

const questaoGerada = ref(null);
const respostaRevelada = ref(false);

const handleSubmit = async () => {
  isLoading.value = true;
  error.value = null;
  questaoGerada.value = null;
  respostaRevelada.value = false;

  try {
    const response = await api.gerarQuestao(
      materia.value,
      topico.value,
      "Médio"
    );
    questaoGerada.value = response.data;
  } catch (err) {
    console.error("Falha ao gerar questão:", err);
    error.value =
      "Não foi possível gerar a questão. Verifique o backend e tente novamente.";
  } finally {
    isLoading.value = false;
  }
};

const revelarResposta = () => {
  respostaRevelada.value = true;
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
        <input type="text" id="materia" v-model="materia" required />
      </div>
      <div class="form-group">
        <label for="topico">Tópico</label>
        <input type="text" id="topico" v-model="topico" required />
      </div>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? "Gerando..." : "Gerar Questão" }}
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
        <li v-for="(alt, index) in questaoGerada.alternativas" :key="index">
          {{ alt }}
        </li>
      </ul>
      <button @click="revelarResposta" v-if="!respostaRevelada">
        Revelar Resposta
      </button>
      <div v-if="respostaRevelada" class="resposta-container">
        <p>
          <strong>Resposta Correta:</strong>
          {{ questaoGerada.resposta_correta }}
        </p>
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
  color: #333;
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
}
.enunciado {
  font-weight: bold;
  margin-bottom: 1rem;
}
.alternativas {
  list-style-type: none;
  padding: 0;
}
.alternativas li {
  padding: 0.5rem;
  border: 1px solid #ddd;
  margin-bottom: 0.5rem;
  border-radius: 4px;
}
.resposta-container {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #e9f5e9;
  border: 1px solid #a3d9a3;
  border-radius: 4px;
}
</style>
