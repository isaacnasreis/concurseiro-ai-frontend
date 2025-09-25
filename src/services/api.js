import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default {
  gerarQuestao(materia, topico, nivel_dificuldade, contexto) {
    const payload = {
      materia,
      topico,
      nivel_dificuldade,
      contexto
    };
    return apiClient.post("/gerar-questao", payload);
  },
};
