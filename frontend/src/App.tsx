// Componente raíz: envuelve la aplicación con autenticación,
// el proveedor de chat IA, carrito de compras y monta el enrutador principal.
import AppRouter from './app/routes/AppRouter';
import { AuthProvider } from './app/context/AuthContext';
import { ChatProvider } from './app/context/ChatContext';
import { CartProvider } from './app/context/CartContext';
import ChatWidget from './app/components/ChatWidget';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ChatProvider>
          <AppRouter />
          <ChatWidget />
        </ChatProvider>
      </CartProvider>
    </AuthProvider>
  );
}
