// server.js
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

// --- Inicialização e Configuração ---
const app = express();
const port = process.env.PORT || 3000;

// --- Validação das Variáveis de Ambiente ---
const API_KEY = process.env.GEMINI_API_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!API_KEY) {
    console.error("ERRO CRÍTICO: Variável de ambiente GEMINI_API_KEY não foi definida.");
    console.error("Por favor, crie um arquivo .env na raiz do projeto e adicione sua chave.");
    process.exit(1); // Encerra a aplicação se a chave essencial estiver faltando
}

// --- Configuração de Middlewares ---

// Configuração de CORS para permitir requisições apenas da URL do seu frontend
const corsOptions = {
    origin: FRONTEND_URL || 'http://127.0.0.1:5500' // Usa a URL do .env ou um padrão seguro
};

app.use(cors(corsOptions));
app.use(express.json()); // Middleware para interpretar o corpo das requisições como JSON

// --- Inicialização do Cliente da API Gemini ---
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // mudamos para o gemini flash

// --- Definição da Rota Principal da API ---
app.post('/ask-gemini', async (req, res) => {
    // 1. Validar a requisição
    const { question } = req.body;
    if (!question || typeof question !== 'string' || question.trim() === '') {
        return res.status(400).json({ error: 'Nenhuma pergunta válida foi fornecida no corpo da requisição.' });
    }

    try {
        // 2. Preparar o prompt para o modelo
        // Adicionar instruções ao prompt pode guiar o modelo para o formato de resposta desejado
        const prompt = `Responda de forma concisa e factual, como uma busca do Google: ${question}`;

        // 3. Chamar a API e gerar o conteúdo
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 4. Enviar a resposta de volta ao cliente
        res.json({ answer: text });

    } catch (error) {
        // 5. Tratar possíveis erros da API ou do servidor
        console.error("Erro ao chamar a API do Gemini:", error);
        res.status(500).json({ error: "Ocorreu um erro ao processar sua pergunta. Verifique o console do servidor para mais detalhes." });
    }
});

// --- Inicialização do Servidor ---
app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
    console.log(`Modelo Gemini utilizado: gemini-flash`);
    console.log(`Permitindo requisições da origem (CORS): ${corsOptions.origin}`);
    console.log("Aguardando requisições na rota /ask-gemini...");
});