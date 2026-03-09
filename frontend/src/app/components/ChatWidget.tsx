// ChatWidget.tsx
// Widget flotante del asistente IA de AURA.
// Aparece como botón fijo en la esquina inferior derecha; al pulsarlo se abre el panel de chat.

import { useRef, useState, useEffect, type KeyboardEvent } from 'react';
import { useChat } from '@/app/context/ChatContext';
import type { ChatMessage } from '@/types/chat';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Helpers de formato                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */

function formatTime(date?: Date): string {
    if (!date) return '';
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Sub-componentes                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

function MessageBubble({ msg }: { msg: ChatMessage }) {
    const isUser = msg.role === 'user';

    // Miniparser para renderizar las imágenes markdown: ![texto](url)
    const renderContent = (text: string) => {
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = imageRegex.exec(text)) !== null) {
            // Añadir texto precedente
            if (match.index > lastIndex) {
                parts.push(text.slice(lastIndex, match.index));
            }
            // Añadir imagen
            const alt = match[1];
            const url = match[2];
            parts.push(
                <img
                    key={lastIndex}
                    src={url}
                    alt={alt}
                    style={{ maxWidth: '100%', borderRadius: '0.5rem', marginTop: '0.5rem' }}
                    loading="lazy"
                />
            );
            lastIndex = match.index + match[0].length;
        }
        // Añadir el resto
        if (lastIndex < text.length) {
            parts.push(text.slice(lastIndex));
        }

        return parts.length > 0 ? parts : text;
    };

    return (
        <div className={`chat-bubble-row ${isUser ? 'chat-bubble-row--user' : 'chat-bubble-row--assistant'}`}>
            {!isUser && (
                <div className="chat-avatar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                            fill="url(#star-gradient)" />
                        <defs>
                            <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#00d4ff" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            )}
            <div className={`chat-bubble ${isUser ? 'chat-bubble--user' : 'chat-bubble--assistant'}`}>
                <div className="chat-bubble__text" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.85rem' }}>
                    {renderContent(msg.content)}
                </div>
                <span className="chat-bubble__time">{formatTime(msg.timestamp)}</span>
            </div>
        </div>
    );
}

function TypingIndicator() {
    return (
        <div className="chat-bubble-row chat-bubble-row--assistant">
            <div className="chat-avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                        fill="url(#star-gradient2)" />
                    <defs>
                        <linearGradient id="star-gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00d4ff" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <div className="chat-bubble chat-bubble--assistant chat-bubble--typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Widget principal                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

export default function ChatWidget() {
    const { messages, isLoading, error, sendMessage, clearChat } = useChat();
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Scroll al final cuando llegan nuevos mensajes
    useEffect(() => {
        if (open) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading, open]);

    // Foco en input al abrir
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [open]);

    const handleSend = async () => {
        const text = inputValue.trim();
        if (!text || isLoading) return;
        setInputValue('');
        await sendMessage(text);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void handleSend();
        }
    };

    return (
        <>
            {/* Panel del chat */}
            <div
                className={`chat-panel ${open ? 'chat-panel--open' : ''}`}
                role="dialog"
                aria-label="Asistente IA de AURA"
                aria-hidden={!open}
            >
                {/* Header */}
                <div className="chat-header">
                    <div className="chat-header__brand">
                        <div className="chat-header__avatar">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                    fill="url(#star-h)" />
                                <defs>
                                    <linearGradient id="star-h" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#00d4ff" />
                                        <stop offset="100%" stopColor="#a855f7" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <div>
                            <p className="chat-header__name">AURA AI</p>
                            <p className="chat-header__status">
                                <span className="chat-header__dot" />
                                En línea
                            </p>
                        </div>
                    </div>
                    <div className="chat-header__actions">
                        <button
                            className="chat-icon-btn"
                            onClick={clearChat}
                            title="Nueva conversación"
                            aria-label="Nueva conversación"
                        >
                            {/* refresh icon */}
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 4 23 10 17 10" />
                                <polyline points="1 20 1 14 7 14" />
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                        </button>
                        <button
                            className="chat-icon-btn"
                            onClick={() => setOpen(false)}
                            title="Cerrar"
                            aria-label="Cerrar chat"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mensajes */}
                <div className="chat-messages" role="log" aria-live="polite">
                    {messages.map((msg, i) => (
                        <MessageBubble key={i} msg={msg} />
                    ))}
                    {isLoading && <TypingIndicator />}
                    {error && (
                        <p className="chat-error">{error}</p>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="chat-input-area">
                    <input
                        ref={inputRef}
                        className="chat-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe un mensaje…"
                        disabled={isLoading}
                        aria-label="Mensaje al asistente"
                        maxLength={500}
                    />
                    <button
                        className="chat-send-btn"
                        onClick={() => void handleSend()}
                        disabled={isLoading || !inputValue.trim()}
                        aria-label="Enviar mensaje"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Botón flotante */}
            <button
                id="chat-fab"
                className={`chat-fab ${open ? 'chat-fab--open' : ''}`}
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? 'Cerrar asistente IA' : 'Abrir asistente IA'}
                aria-expanded={open}
            >
                {/* Ícono chat (visible cuando cerrado) */}
                <svg className="chat-fab__icon chat-fab__icon--chat" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {/* Ícono X (visible cuando abierto) */}
                <svg className="chat-fab__icon chat-fab__icon--close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                {/* Círculo de notificación */}
                {!open && messages.length <= 1 && (
                    <span className="chat-fab__badge" aria-label="Nuevo mensaje" />
                )}
            </button>
        </>
    );
}
