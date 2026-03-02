# 🤖 Guía de Integración — AURA AI Assistant

> Documentación para el desarrollador **frontend** sobre cómo integrar el asistente IA en la UI.

---

## Arquitectura

```
Frontend (React/Vite)          Backend (Node.js/Express)
┌──────────────────────┐       ┌─────────────────────────┐
│  ChatContext.tsx      │──────▶│  POST /api/chat          │
│  useChat() hook       │◀──────│  → Gemini API            │
│  ai.ts (fetch)        │       │  → Supabase (contexto)   │
└──────────────────────┘       └─────────────────────────┘
```

El **frontend nunca llama a Gemini directamente**. Todas las llamadas pasan por el servidor Express que gestiona las API keys de forma segura.

---

## Setup rápido

### 1. Variables de entorno del frontend

En `frontend/.env`, asegúrate de tener:
```env
VITE_API_URL=http://localhost:3001
```

### 2. Arrancar el backend

```bash
cd backend
npm install
npm run dev   # Inicia en localhost:3001 con hot-reload
```

Verifica que funciona:
```bash
curl http://localhost:3001/health
# → { "status": "ok", "service": "AURA AI Backend", ... }
```

### 3. ⚠️ Rellenar el `SUPABASE_SERVICE_KEY` en `backend/.env`

El archivo `backend/.env` ya tiene la API key de Gemini y la URL de Supabase.
Solo falta el **service_role key** de Supabase (distinto del anon key):

1. Ve a [supabase.com](https://supabase.com) → Tu proyecto
2. Settings → API
3. Copia el valor de **service_role** (no el anon)
4. Pégalo en `backend/.env`:
   ```
   SUPABASE_SERVICE_KEY=tu_service_role_key
   ```

---

## Cómo usar en el frontend

### Paso 1 — Envolver la app con `<ChatProvider>`

```tsx
// main.tsx o App.tsx
import { ChatProvider } from '@/app/context/ChatContext';

function App() {
  return (
    <ChatProvider>
      {/* resto de tu aplicación */}
    </ChatProvider>
  );
}
```

### Paso 2 — Usar el hook `useChat()` en tu componente

```tsx
import { useChat } from '@/app/context/ChatContext';

export function ChatWidget() {
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();

  return (
    <div>
      {/* Historial de mensajes */}
      {messages.map((msg, i) => (
        <div key={i} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
          <span>{msg.content}</span>
        </div>
      ))}

      {/* Indicador de carga */}
      {isLoading && <span>El asistente está escribiendo...</span>}

      {/* Error */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Input */}
      <input
        onKeyDown={(e) => {
          if (e.key === 'Enter') sendMessage(e.currentTarget.value);
        }}
        placeholder="Escribe un mensaje..."
      />

      {/* Limpiar chat */}
      <button onClick={clearChat}>Nueva conversación</button>
    </div>
  );
}
```

---

## API del hook `useChat()`

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `messages` | `ChatMessage[]` | Historial completo de mensajes |
| `isLoading` | `boolean` | `true` mientras el asistente responde |
| `error` | `string \| null` | Error legible, `null` si todo va bien |
| `sendMessage(text)` | `(text: string) => Promise<void>` | Envía un mensaje del usuario |
| `clearChat()` | `() => void` | Resetea la conversación |

---

## Tipos TypeScript

```ts
// src/types/chat.ts
export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp?: Date;
}
```

---

## API REST del backend (referencia)

### `POST /api/chat`

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "¿Qué productos tenéis?" }
  ]
}
```

**Response:**
```json
{
  "reply": "¡Hola! En AURA tenemos una gran variedad de productos..."
}
```

**Errores:**
| Código | Causa |
|--------|-------|
| `400` | `messages` vacío o mal formado |
| `500` | Error interno (Gemini o Supabase) |

### `GET /health`

Devuelve `{ "status": "ok" }` si el servidor está funcionando.

---

## Arrancar todo (desarrollo)

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend  
cd frontend && npm run dev
```
