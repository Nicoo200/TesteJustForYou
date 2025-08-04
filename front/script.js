document.addEventListener('DOMContentLoaded', () => {
    const questionInput = document.getElementById('questionInput');
    const askButton = document.getElementById('askButton');
    const answerDiv = document.getElementById('answer');
    const loadingSpinner = document.getElementById('loading');

    // URL do seu backend. Certifique-se de que ele esteja rodando!
    const BACKEND_URL = 'http://localhost:3000/ask-gemini';

    const handleAsk = async () => {
        const question = questionInput.value.trim();
        if (question === "") {
            answerDiv.innerHTML = '<p style="color: #FF5733;">Por favor, digite uma pergunta antes de pesquisar.</p>';
            return;
        }

        answerDiv.innerHTML = ''; // Limpa a resposta anterior
        loadingSpinner.style.display = 'block'; // Mostra o spinner

        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: question }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido do servidor.' }));
                throw new Error(`Erro do servidor: ${response.status} - ${errorData.error || errorData.message || 'Ocorreu um erro.'}`);
            }

            const data = await response.json();
            
            let geminiAnswer = data.answer;
            if (!geminiAnswer.includes("[Fonte:")) {
                 geminiAnswer += " [Fonte: Google Gemini Flash]"; // Atualizado a fonte para o modelo Flash
            }

            answerDiv.innerHTML = `<p>${geminiAnswer}</p>`;

        } catch (error) {
            console.error("Erro ao comunicar com o backend:", error);
            answerDiv.innerHTML = `<p style="color: #FF5733;">Erro: ${error.message}. Verifique se o backend está rodando em "${BACKEND_URL}".</p>`;
        } finally {
            loadingSpinner.style.display = 'none'; // Esconde o spinner
            questionInput.value = ''; // Limpa o input
        }
    };

    askButton.addEventListener('click', handleAsk);

    questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAsk();
        }
    });
});
