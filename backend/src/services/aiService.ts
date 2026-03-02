// aiService.ts
// Integración con Google Gemini API.
// Construye el system prompt con contexto de AURA e invoca el modelo de chat.

import { GoogleGenAI, Content } from '@google/genai';
import { buildProductContext } from './productContext';
import type { ChatMessage } from '../types/chat';

const apiKey = process.env.GOOGLE_API_KEY ?? '';
const ai = new GoogleGenAI({ apiKey });

// Nombre del modelo Gemini a usar
const MODEL = 'gemini-2.0-flash';

/**
 * Construye el system prompt de AURA con el catálogo actual inyectado.
 * Se llama en cada petición para que el contexto sea siempre fresco.
 */
async function buildSystemPrompt(): Promise<string> {
    const catalogContext = await buildProductContext();

    return `Eres el asistente virtual de AURA, una tienda de productos de alta calidad.
Tu misión es ayudar a los usuarios a encontrar productos, responder preguntas sobre el catálogo
y ofrecer una experiencia de compra excepcional.

INSTRUCCIONES:
- Responde siempre en el mismo idioma que usa el usuario (español, català, inglés, etc.)
- Sé amable, conciso y profesional. No uses emojis en exceso.
- Solo habla de temas relacionados con AURA y sus productos. Si te preguntan algo no relacionado, redirige amablemente.
- Si no sabes el stock exacto o información no listada, dilo honestamente y sugiere contactar con el soporte.
- Cuando recomiendes productos, menciona el nombre, la categoría y el precio.
- No inventes productos que no estén en el catálogo.

${catalogContext}

Recuerda: eres la cara digital de AURA. Sé útil, preciso y refleja los valores de innovación y calidad de la marca.`;
}

/**
 * Envía mensajes al modelo Gemini y devuelve la respuesta en texto.
 * @param messages - Historial de conversación (rol + contenido)
 * @returns Texto de la respuesta del asistente
 */
export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
    if (!apiKey) {
        throw new Error('GOOGLE_API_KEY no está configurada en las variables de entorno.');
    }

    const systemPrompt = await buildSystemPrompt();

    // Mapeamos los mensajes al formato que espera la SDK de Gemini
    const history: Content[] = messages.slice(0, -1).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
    }));

    // El último mensaje es el del usuario actual
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
        throw new Error('El último mensaje debe ser del usuario.');
    }

    const chat = ai.chats.create({
        model: MODEL,
        config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
            maxOutputTokens: 1024,
        },
        history,
    });

    const response = await chat.sendMessage({ message: lastMessage.content });

    const text = response.text;
    if (!text) {
        throw new Error('Gemini devolvió una respuesta vacía.');
    }

    return text;
}
