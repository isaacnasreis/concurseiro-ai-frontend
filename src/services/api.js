import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default {
  extrairContexto(arquivo) {
    const formData = new FormData();
    formData.append('arquivo', arquivo);

    return apiClient.post('/extrair-contexto-arquivo/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  gerarQuestao(materia, topico, nivel_dificuldade, contexto) {
    const payload = {
      materia,
      topico,
      nivel_dificuldade,
      contexto,
    };
    return apiClient.post('/gerar-questao', payload);
  },

  gerarSimulado(config) {
    const payload = {
      materia: config.materia,
      topico: config.topico,
      nivel_dificuldade: config.nivel,
      quantidade_questoes: config.quantidade,
      contexto: config.contexto,
    };
    return apiClient.post('/gerar-simulado', payload);
  },
};
