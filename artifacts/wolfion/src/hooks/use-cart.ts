import { useState, useEffect } from 'react';
import { Product } from '@/lib/data';

export type CartItem = {
  product: Product;
  quantity: number;
  size: string;
};

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('wolfion_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('wolfion_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, size: string, quantity: number = 1) => {
    setItems(current => {
      const existing = current.find(i => i.product.id === product.id && i.size === size);
      if (existing) {
        return current.map(i => 
          i.product.id === product.id && i.size === size 
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...current, { product, size, quantity }];
    });
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size);
      return;
    }
    setItems(current => 
      current.map(i => 
        i.product.id === productId && i.size === size 
          ? { ...i, quantity }
          : i
      )
    );
  };

  const removeItem = (productId: string, size: string) => {
    setItems(current => current.filter(i => !(i.product.id === productId && i.size === size)));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    totalPrice
  };
}
