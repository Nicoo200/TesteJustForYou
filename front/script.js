// Adiciona um listener que executa o código apenas quando todo o HTML foi carregado.
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Seleção dos Elementos do DOM ---
    // Agrupar a busca por elementos no início torna o código mais organizado.
    const questionInput = document.getElementById('questionInput');
    const askButton = document.getElementById('askButton');
    const answerDiv = document.getElementById('answer');
    const loadingSpinner = document.getElementById('loading');

    // URL do seu backend.
    const BACKEND_URL = 'http://localhost:3000/ask-gemini';

    // --- 2. Funções Auxiliares para Melhor Organização ---

    /**
     * Controla o estado de carregamento da interface.
     * @param {boolean} isLoading - True para mostrar o spinner e desabilitar inputs, false para o contrário.
     */
    const setUiLoadingState = (isLoading) => {
        if (isLoading) {
            loadingSpinner.style.display = 'block';
            askButton.disabled = true;
            questionInput.disabled = true;
            askButton.innerText = 'Pensando...'; // Feedback visual no botão
        } else {
            loadingSpinner.style.display = 'none';
            askButton.disabled = false;
            questionInput.disabled = false;
            askButton.innerText = 'Pesquisar';
        }
    };

    /**
     * Renderiza a resposta ou o erro na tela de forma segura.
     * @param {string} content - O texto a ser exibido.
     * @param {boolean} isError - Se true, aplica um estilo de erro.
     */
    const renderResponse = (content, isError = false) => {
        answerDiv.innerHTML = ''; // Limpa conteúdo anterior

        const p = document.createElement('p');
        
        // **MELHORIA DE SEGURANÇA CRÍTICA**
        // Usar .textContent em vez de .innerHTML previne ataques de XSS.
        // O navegador tratará qualquer tag HTML como texto puro, em vez de executá-la.
        p.textContent = content;

        if (isError) {
            p.style.color = '#D8000C'; // Vermelho para erros
            p.style.backgroundColor = '#FFD2D2'; // Fundo claro para destaque
            p.style.padding = '10px';
            p.style.borderRadius = '5px';
        }
        
        answerDiv.appendChild(p);
    };


    // --- 3. Função Principal ---

    /**
     * Função principal que envia a pergunta para o backend e processa a resposta.
     */
    const handleAsk = async () => {
        const question = questionInput.value.trim();

        if (question === "") {
            renderResponse("Por favor, digite uma pergunta antes de pesquisar.", true);
            return;
        }

        setUiLoadingState(true); // Inicia o estado de carregamento
        answerDiv.innerHTML = '';  // Limpa a resposta anterior imediatamente

        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question }), // Sintaxe de objeto mais curta
            });

            // O método .json() também pode falhar, então o colocamos dentro do try
            const data = await response.json();

            if (!response.ok) {
                // Usa a mensagem de erro do backend se disponível, senão uma mensagem padrão.
                throw new Error(data.error || `O servidor respondeu com status ${response.status}.`);
            }

            renderResponse(data.answer);

        } catch (error) {
            console.error("Falha na comunicação ou processamento:", error);
            renderResponse(`Erro: ${error.message}. Verifique o console e se o backend está online.`, true);
        } finally {
            // Este bloco SEMPRE será executado, seja em caso de sucesso ou falha.
            setUiLoadingState(false); // Restaura a interface para o estado normal
        }
    };

    // --- 4. Event Listeners ---

    // Adiciona o evento ao clique do botão.
    askButton.addEventListener('click', handleAsk);

    // Adiciona o evento para a tecla "Enter" no campo de input.
    // 'keydown' é mais moderno e confiável que 'keypress'.
    questionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Previne o comportamento padrão (como submeter um formulário)
            handleAsk();
        }
    });
});