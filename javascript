// QuizManager.js - classe moderna e complexa com eventos e retry

class QuizManager {
  constructor(apiEndpoint, options = {}) {
    this.apiEndpoint = apiEndpoint;
    this.currentStep = 1;
    this.answers = {};
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 2000; // ms
    this.callbacks = {
      onProgress: null,
      onResult: null,
      onError: null,
      onLoading: null,
    };
    this.abortController = null;
  }

  // Registrar callbacks para interação com UI
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = callback;
    }
  }

  off(event) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = null;
    }
  }

  // Avançar e guardar resposta validada
  guardarResposta(questaoId, valorResposta) {
    if (!questaoId || valorResposta === undefined) {
      throw new Error('Questão ou resposta inválida');
    }

    this.answers[questaoId] = valorResposta;
    this.currentStep++;

    if (typeof this.callbacks.onProgress === 'function') {
      this.callbacks.onProgress(this.currentStep, this.answers);
    }
  }

  // Validação simples (pode ser extendida)
  validarRespostas() {
    // Exemplo: deve ter pelo menos 3 respostas
    if (Object.keys(this.answers).length < 3) {
      throw new Error('Responda todas as perguntas para continuar');
    }
  }

  // Cancelar requisição ativa (se houver)
  cancelarRequisicao() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  // Enviar dados para o Back-End com retry automático
  async finalizarQuiz() {
    this.validarRespostas();

    let tentativa = 0;

    if (typeof this.callbacks.onLoading === 'function') {
      this.callbacks.onLoading(true);
    }

    while (tentativa < this.maxRetries) {
      tentativa++;
      try {
        this.abortController = new AbortController();

        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.answers),
          signal: this.abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const resultado = await response.json();

        if (typeof this.callbacks.onResult === 'function') {
          this.callbacks.onResult(resultado);
        }

        if (typeof this.callbacks.onLoading === 'function') {
          this.callbacks.onLoading(false);
        }

        this.abortController = null;
        return resultado; // sucesso

      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('Requisição abortada');
          if (typeof this.callbacks.onLoading === 'function') {
            this.callbacks.onLoading(false);
          }
          return null; // cancelado explicitamente
        }

        if (tentativa >= this.maxRetries) {
          if (typeof this.callbacks.onError === 'function') {
            this.callbacks.onError(error);
          }

          if (typeof this.callbacks.onLoading === 'function') {
            this.callbacks.onLoading(false);
          }

          throw error; // erro definitivo
        }

        // Espera antes da próxima tentativa
        await new Promise(r => setTimeout(r, this.retryDelay));
      }
    }
  }

  // Métodos extras para UI (exemplo de renderização simples)
  renderizarProximoPasso() {
    // Hook para integrar com UI, ex: atualizar estado no React
    if (typeof this.callbacks.onProgress === 'function') {
      this.callbacks.onProgress(this.currentStep, this.answers);
    }
  }

  renderizarResultado(resultado) {
    if (typeof this.callbacks.onResult === 'function') {
      this.callbacks.onResult(resultado);
    }
  }
}

export default QuizManager;
