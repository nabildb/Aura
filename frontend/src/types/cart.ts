// Tipos de datos para el carrito de compras.
import type { Product } from './product';

export type Cart = {
  id: number;
  user_id: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CartItem = {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  added_at?: string | null;
  // Joined product data
  product?: Product | null;
};

export type CartItemWithProduct = CartItem & {
  products: Product;
};
