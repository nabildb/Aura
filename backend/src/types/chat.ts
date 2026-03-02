// Tipos compartidos del sistema de chat.
// Estos mismos tipos se replican en frontend/src/types/chat.ts.

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
    role: ChatRole;
    content: string;
    timestamp?: Date;
}

export interface ChatRequest {
    messages: ChatMessage[];
}

export interface ChatResponse {
    reply: string;
}
