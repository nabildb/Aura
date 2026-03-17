// Servicio CRUD del carrito de compras usando Supabase.
// Cada usuario autenticado tiene un carrito único (creado automáticamente por trigger).
import { supabase } from './supabase';
import type { Cart, CartItemWithProduct } from '@/types/cart';

export const cartService = {
  /**
   * Obtiene el carrito del usuario autenticado.
   */
  async getCart(): Promise<Cart | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Obtiene los items del carrito con datos del producto (join).
   */
  async getCartItems(): Promise<CartItemWithProduct[]> {
    const cart = await this.getCart();
    if (!cart) return [];

    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('cart_id', cart.id)
      .order('added_at', { ascending: true });

    if (error) throw error;
    return (data ?? []) as CartItemWithProduct[];
  },

  /**
   * Añade un producto al carrito. Si ya existe, incrementa la cantidad.
   */
  async addItem(productId: number, quantity: number = 1): Promise<void> {
    const cart = await this.getCart();
    if (!cart) throw new Error('No se encontró el carrito. Inicia sesión.');

    // Comprobar si el producto ya está en el carrito
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      // Actualizar cantidad
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      // Insertar nuevo item
      const { error } = await supabase
        .from('cart_items')
        .insert({ cart_id: cart.id, product_id: productId, quantity });
      if (error) throw error;
    }

    // Actualizar timestamp del carrito
    await supabase
      .from('carts')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', cart.id);
  },

  /**
   * Actualiza la cantidad de un item.
   */
  async updateItemQuantity(itemId: number, quantity: number): Promise<void> {
    if (quantity < 1) {
      return this.removeItem(itemId);
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (error) throw error;
  },

  /**
   * Elimina un item del carrito.
   */
  async removeItem(itemId: number): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  /**
   * Vacía todo el carrito del usuario.
   */
  async clearCart(): Promise<void> {
    const cart = await this.getCart();
    if (!cart) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id);

    if (error) throw error;
  },
};
