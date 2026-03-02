// ChatContext.tsx
// Context React para el asistente IA de AURA.
// El frontend solo necesita envolver la app con <ChatProvider> y usar el hook useChat().

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { aiService } from '@/services/ai';
import type { ChatMessage } from '@/types/chat';

// ── Mensaje de bienvenida inicial ─────────────────────────────────────────────
const WELCOME_MESSAGE: ChatMessage = {
    role: 'assistant',
    content: '¡Hola! Soy el asistente de AURA. Puedo ayudarte a encontrar productos, ' +
        'resolver dudas sobre el catálogo o guiarte en tu compra. ¿En qué puedo ayudarte?',
    timestamp: new Date(),
};

// ── Tipos del contexto ────────────────────────────────────────────────────────

interface ChatContextValue {
    /** Historial completo de mensajes del chat */
    messages: ChatMessage[];
    /** true mientras espera respuesta del backend */
    isLoading: boolean;
    /** Mensaje de error legible, null si no hay error */
    error: string | null;
    /** Envía un mensaje de texto del usuario y añade la respuesta al historial */
    sendMessage: (text: string) => Promise<void>;
    /** Resetea el historial al mensaje de bienvenida inicial */
    clearChat: () => void;
}

// ── Creación del contexto ─────────────────────────────────────────────────────

const ChatContext = createContext<ChatContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

interface ChatProviderProps {
    children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isLoading) return;

        // Añadimos el mensaje del usuario al historial inmediatamente
        const userMessage: ChatMessage = { role: 'user', content: trimmed, timestamp: new Date() };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setIsLoading(true);
        setError(null);

        try {
            // Enviamos el historial completo al backend (excluimos el mensaje de bienvenida del asistente
            // para que la IA no lo tome como contexto adicional, solo los mensajes reales)
            const historyForApi: ChatMessage[] = updatedMessages
                .filter((m) => !(m.role === 'assistant' && m === WELCOME_MESSAGE))
                .map(({ role, content }) => ({ role, content }));

            const reply = await aiService.sendMessage(historyForApi);

            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: reply,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'No se pudo conectar con el asistente.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [messages, isLoading]);

    const clearChat = useCallback(() => {
        setMessages([{ ...WELCOME_MESSAGE, timestamp: new Date() }]);
        setError(null);
    }, []);

    return (
        <ChatContext.Provider value={{ messages, isLoading, error, sendMessage, clearChat }}>
            {children}
        </ChatContext.Provider>
    );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Hook para acceder al contexto del chat.
 * Debe usarse dentro de un componente envuelto por <ChatProvider>.
 *
 * @example
 * const { messages, isLoading, sendMessage, clearChat } = useChat();
 */
export function useChat(): ChatContextValue {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat debe usarse dentro de un <ChatProvider>.');
    }
    return context;
}
