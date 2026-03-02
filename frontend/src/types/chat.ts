// Tipos del sistema de chat — espejo de backend/src/types/chat.ts
// El frontend usa estos tipos para tipar el contexto y las llamadas al API.

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
    role: ChatRole;
    content: string;
    timestamp?: Date;
}
