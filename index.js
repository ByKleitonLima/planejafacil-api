import { config } from 'dotenv';
config();

import express from 'express';
import admin from 'firebase-admin';
import Groq from 'groq-sdk';
import { transactionsRouter } from './transactions/routes.js';
import { authenticateToken } from './middlewares/authenticate-jwt.js';

const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    client_x509_cert_url: process.env.FIREBASE_CERT_URL
};

const app = express();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

app.use(express.json());
app.use('/home', transactionsRouter);

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

app.post('/ai/summary',
    (request, response, next) => authenticateToken(request, response, next, admin.auth()),
    async (request, response) => {
        try {
            const { contexto } = request.body;

            if (!contexto) {
                return response.status(400).json({ message: 'Nenhum dado informado' });
            }

            const prompt = `Você é um assistente financeiro pessoal simpático e direto. 
                Analise os dados financeiros do usuário e gere exatamente 3 insights curtos e úteis em português brasileiro.
                Responda APENAS com JSON válido, sem markdown, sem backticks, no formato:
                {"insights": [{"emoji": "emoji", "texto": "insight aqui"}, ...]}
                Regras:
                - Cada insight deve ter no máximo 1 linha
                - Use negrito com <b>palavra</b> para destacar valores ou categorias importantes
                - Tom: amigável, encorajador, honesto
                - Varie os emojis: use emojis relevantes ao conteúdo (💰🎉⚠️📉📈🛒🏆💡🔥✨)
                - Se o saldo for positivo, celebre; se negativo, alerte com cuidado
                - Compare com mês anterior se os dados estiverem disponíveis
                - Destaque a maior categoria de gasto se houver

                Dados financeiros de ${contexto.mes}:
                - Receita: ${contexto.receita}
                - Despesa: ${contexto.despesa}
                - Saldo: ${contexto.saldo}
                - Total de transações: ${contexto.totalTransacoes}
                ${contexto.receitaAnterior ? `- Receita mês anterior: ${contexto.receitaAnterior}` : ''}
                ${contexto.despesaAnterior ? `- Despesa mês anterior: ${contexto.despesaAnterior}` : ''}
                ${contexto.topCategorias ? `- Maiores gastos por categoria:\n  ${contexto.topCategorias.join('\n  ')}` : ''}
                Gere 3 insights financeiros personalizados.`;

            const completion = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                response_format: { type: 'json_object' }
            });

            const text = completion.choices[0].message.content;
            const parsed = JSON.parse(text);

            response.json({ summary: parsed });

        } catch (error) {
            console.error('Erro ao chamar Groq:', error);

            return response.status(200).json({
                summary: {
                    insights: [
                        { emoji: '💰', texto: 'Continue registrando suas transações para obter insights personalizados.' },
                        { emoji: '📊', texto: 'Acompanhe seus gastos mensalmente para manter o controle financeiro.' },
                        { emoji: '🎯', texto: 'Defina metas de economia para conquistar sua liberdade financeira.' }
                    ]
                }
            });
        }
    }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rest iniciada na porta ${PORT}`));