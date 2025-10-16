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

  simplificarTexto(texto_original, comando) {
    return apiClient.post('/simplificar-texto', { texto_original, comando });
  },

  salvarSimulado(resultado) {
    const payload = {
      materia: resultado.materia,
      topico: resultado.topico,
      questoes: resultado.questoes.map((q, index) => ({
        enunciado: q.enunciado,
        resposta_correta: q.resposta_correta,
        resposta_usuario: resultado.respostasUsuario[index] || null,
      })),
    };
    return apiClient.post('/salvar-simulado/', payload);
  },
};
