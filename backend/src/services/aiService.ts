// aiService.ts
// Integranción con Groq (reemplaza a Gemini para mejor fiabilidad gratuita).
// Inyecta el catálogo de productos de Supabase en el system prompt.

import Groq from 'groq-sdk';
import { buildProductContext } from './productContext';
import type { ChatMessage } from '../types/chat';

const apiKey = process.env.GROQ_API_KEY ?? '';
const groq = new Groq({ apiKey });

// Modelo de Groq sugerido (llama-3.3-70b es potente y rápido)
const MODEL: string = 'llama-3.3-70b-versatile';

/**
 * Construye el system prompt de AURA con el catálogo actual inyectado.
 */
async function buildSystemPrompt(): Promise<string> {
    const catalogContext = await buildProductContext();

    return `Eres el asistente virtual de AURA, una tienda de productos de alta calidad.
Tu misión es ayudar a los usuarios de forma MUY breve, concisa y comercial. 

INSTRUCCIONES CLAVE:
- Responde siempre de forma corta y directa, sin rodeos.
- Cuando menciones o recomiendes un producto, TIENES QUE incluir su imagen usando Markdown: ![Nombre](URL)
- Si un producto indica "[Imagen: URL]", usa esa URL. Si indica "[Sin imagen]", no pongas imagen.
- Cuando recomiendes, menciona nombre, precio y una frase corta sobre por qué es bueno.
- Si no sabes algo, dilo rápidamente. No inventes productos.

${catalogContext}

Recuerda: eres la cara digital de AURA. Sé útil, preciso y refleja los valores de innovación y calidad de la marca.`;
}

/**
 * Envía mensajes al modelo de Groq y devuelve la respuesta en texto.
 * @param messages - Historial de conversación (rol + contenido)
 * @returns Texto de la respuesta del asistente
 */
export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
    if (!apiKey) {
        throw new Error('GROQ_API_KEY no está configurada en las variables de entorno (.env). Consíguela en console.groq.com');
    }

    const systemPrompt = await buildSystemPrompt();

    // Mapeamos los mensajes al formato de ChatCompletion de Groq
    const chatMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map((msg) => ({
            role: (msg.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
            content: msg.content,
        }))
    ];

    try {
        const response = await groq.chat.completions.create({
            model: MODEL,
            messages: chatMessages,
            temperature: 0.7,
            max_tokens: 1024,
        });

        const reply = response.choices[0]?.message?.content;

        if (!reply) {
            throw new Error('Groq no devolvió una respuesta válida.');
        }

        return reply;
    } catch (error: any) {
        console.error('Error al llamar a Groq:', error);

        // Si falla el modelo grande, intentamos el pequeño como fallback
        if (MODEL !== 'llama3-8b-8192') {
            try {
                const fallbackResponse = await groq.chat.completions.create({
                    model: 'llama3-8b-8192',
                    messages: chatMessages,
                    temperature: 0.7,
                });
                return fallbackResponse.choices[0]?.message?.content ?? 'Error en fallback.';
            } catch (f) {
                throw new Error(`Error en Groq: ${error.message}`);
            }
        }

        throw new Error(`Error en Groq: ${error.message}`);
    }
}
