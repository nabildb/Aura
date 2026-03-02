// routes/chat.ts
// Define el endpoint POST /api/chat para el asistente IA de AURA.

import { Router, Request, Response } from 'express';
import { sendChatMessage } from '../services/aiService';
import type { ChatRequest, ChatResponse } from '../types/chat';

const router = Router();

/**
 * POST /api/chat
 *
 * Body (JSON):
 * {
 *   "messages": [
 *     { "role": "user", "content": "Hola, ¿qué productos tenéis?" },
 *     { "role": "assistant", "content": "¡Hola! Tenemos..." },
 *     { "role": "user", "content": "¿Y de electrónica?" }
 *   ]
 * }
 *
 * Response (JSON):
 * { "reply": "Texto de respuesta del asistente" }
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const body = req.body as ChatRequest;

        // Validación básica del cuerpo
        if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
            res.status(400).json({ error: 'El campo "messages" es obligatorio y debe ser un array no vacío.' });
            return;
        }

        // Validamos que todos los mensajes tienen role y content
        for (const msg of body.messages) {
            if (!msg.role || !msg.content || typeof msg.content !== 'string') {
                res.status(400).json({ error: 'Cada mensaje debe tener "role" (user | assistant) y "content" (string).' });
                return;
            }
            if (msg.role !== 'user' && msg.role !== 'assistant') {
                res.status(400).json({ error: `Rol inválido: "${msg.role}". Usa "user" o "assistant".` });
                return;
            }
        }

        const reply = await sendChatMessage(body.messages);

        const response: ChatResponse = { reply };
        res.status(200).json(response);

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error interno del servidor';
        console.error('[POST /api/chat] Error:', message);
        res.status(500).json({ error: message });
    }
});

export default router;
