// Componente raíz: envuelve la aplicación con autenticación,
// el proveedor de chat IA y monta el enrutador principal.
import AppRouter from './app/routes/AppRouter';
import { AuthProvider } from './app/context/AuthContext';
import { ChatProvider } from './app/context/ChatContext';
import ChatWidget from './app/components/ChatWidget';

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <AppRouter />
        <ChatWidget />
      </ChatProvider>
    </AuthProvider>
  );
}
