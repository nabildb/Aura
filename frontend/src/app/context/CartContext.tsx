// Contexto global del carrito: gestiona estado, sincronización con Supabase
// y expone funciones para añadir/editar/eliminar items.
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { cartService } from '@/services/cartService';
import type { CartItemWithProduct } from '@/types/cart';

interface CartContextType {
  items: CartItemWithProduct[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      const cartItems = await cartService.getCartItems();
      setItems(cartItems);
    } catch (err) {
      console.error('Error al cargar el carrito:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Cargar carrito cuando el usuario inicia sesión
  useEffect(() => {
    if (!authLoading) {
      refreshCart();
    }
  }, [user, authLoading, refreshCart]);

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!user) return;
    try {
      await cartService.addItem(productId, quantity);
      await refreshCart();
      setDrawerOpen(true);
    } catch (err) {
      console.error('Error al añadir al carrito:', err);
      throw err;
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      await cartService.updateItemQuantity(itemId, quantity);
      await refreshCart();
    } catch (err) {
      console.error('Error al actualizar cantidad:', err);
      throw err;
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      await cartService.removeItem(itemId);
      await refreshCart();
    } catch (err) {
      console.error('Error al eliminar del carrito:', err);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      await refreshCart();
    } catch (err) {
      console.error('Error al vaciar carrito:', err);
      throw err;
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = Number(item.products?.price ?? 0);
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        loading,
        drawerOpen,
        setDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
