// server.js
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config(); // Para carregar variáveis de ambiente do .env

const app = express();
const port = 3000;

// Configurar CORS para permitir requisições do seu frontend
// Mantenha esta URL correspondente à URL onde seu HTML está sendo servido (ex: Live Server)
app.use(cors({
    origin: 'http://127.0.0.1:5500' // MUITO IMPORTANTE: Ajuste para a URL correta do seu frontend!
}));
app.use(express.json()); // Para parsear JSON no corpo das requisições

// **ATENÇÃO: Sua chave de API DEVE ser armazenada em variáveis de ambiente!**
// Crie um arquivo .env na mesma pasta do server.js com:
// GEMINI_API_KEY="SUA_CHAVE_DE_API_DO_GEMINI_AQUI"
// Para este exemplo, você usaria: GEMINI_API_KEY="AIzaSyDpEzZ7y3ALEzIHgm5qupAqePUwxF5E5cY"
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("Erro: Variável de ambiente GEMINI_API_KEY não definida. Por favor, crie um arquivo .env na raiz do backend.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

app.post('/ask-gemini', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Nenhuma pergunta fornecida.' });
    }

    try {
        // *** MUDANÇA AQUI: Utilizando o modelo gemini-flash ***
        const model = genAI.getGenerativeModel({ model: "gemini-flash" });
        
        // Crie um histórico de conversa básico para manter o contexto, se necessário
        // Para uma pergunta simples e única, o histórico pode não ser crucial.
        // const chat = model.startChat({
        //     history: [ /* histórico de mensagens anteriores, se houver */ ],
        //     generationConfig: {
        //         maxOutputTokens: 100, // Limite para respostas concisas
        //     },
        // });

        // Se você quiser que a resposta seja mais "Google-like", pode adicionar instruções na pergunta
        const prompt = `Responda de forma concisa e factual, como uma busca do Google: ${question}`;

        const result = await model.generateContent(prompt); // Usando generateContent para uma única pergunta
        const response = await result.response;
        const text = response.text();
        res.json({ answer: text });
    } catch (error) {
        console.error("Erro ao chamar a API do Gemini:", error);
        res.status(500).json({ error: "Ocorreu um erro ao processar sua pergunta. Verifique o console do servidor." });
    }
});

app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
    console.log(`Modelo Gemini utilizado: gemini-flash`);
    console.log("Certifique-se de que sua chave GEMINI_API_KEY está no arquivo .env");
});