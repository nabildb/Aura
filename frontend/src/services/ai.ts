// ai.ts
// Capa de servicio del frontend para comunicarse con el backend de AURA AI.
// Llama al servidor Express (backend/) que gestiona Gemini de forma segura.

import type { ChatMessage } from '@/types/chat';

// URL base del backend — configurable por variable de entorno
const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';

export const aiService = {
    /**
     * Envía el historial de mensajes al backend y obtiene la respuesta del asistente.
     *
     * @param messages - Array completo de mensajes (historial + mensaje actual del usuario)
     * @returns El texto de respuesta del asistente
     * @throws Error si la petición falla o el servidor devuelve un error
     */
    async sendMessage(messages: ChatMessage[]): Promise<string> {
        const response = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages }),
        });

        if (!response.ok) {
            // Intentamos leer el mensaje de error del servidor
            let errorMessage = `Error ${response.status}: ${response.statusText}`;
            try {
                const errorBody = await response.json() as { error?: string };
                if (errorBody.error) errorMessage = errorBody.error;
            } catch {
                // Ignoramos si no hay JSON en la respuesta de error
            }
            throw new Error(errorMessage);
        }

        const data = await response.json() as { reply: string };
        return data.reply;
    },

    /**
     * Comprueba que el backend está disponible.
     * Útil para mostrar un indicador de conectividad en la UI.
     *
     * @returns true si el backend responde correctamente
     */
    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${API_URL}/health`);
            return response.ok;
        } catch {
            return false;
        }
    },
};
