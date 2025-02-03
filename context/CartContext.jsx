import React, { createContext, useContext, useState } from 'react';
import cartService from '../api/services/cartService';
import { useUserStore } from '../stores/userStore';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUserStore();

  const createNewCart = async (restaurantId, item) => {
    try {
      setLoading(true);
      const cartData = {
        restaurant: restaurantId,
        items: [{
          menu: item.id,
          quantity: 1,
          addons: item.selectedAddons || []
        }]
      };
      const newCart = await cartService.createCart(cartData);
      setCart(newCart);
      return newCart;
    } catch (error) {
      console.error('Error creating cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (item) => {
    if (!cart) {
      throw new Error('No active cart');
    }

    try {
      setLoading(true);
      const cartData = {
        items: [{
          menu: item.id,
          quantity: 1,
          addons: item.selectedAddons || []
        }]
      };
      const updatedCart = await cartService.updateCart(cart.id, cartData);
      setCart(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    if (!cart) {
      throw new Error('No active cart');
    }

    try {
      setLoading(true);
      const updatedCart = await cartService.deleteItemCart(cart.id, itemId);
      setCart(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!cart) return;

    try {
      setLoading(true);
      await cartService.deleteCart(cart.id);
      setCart(null);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (restaurantId, item) => {
    if (!user) {
      throw new Error('User must be logged in to add items to cart');
    }

    try {
      if (!cart || cart.restaurant !== restaurantId) {
        return await createNewCart(restaurantId, item);
      } else {
        return await updateCartItem(item);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const getTotalItems = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalCost = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      const itemCost = item.menu.cost * item.quantity;
      const addonsCost = (item.addons || []).reduce((acc, addon) => acc + addon.cost, 0);
      return total + itemCost + (addonsCost * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeItem,
        clearCart,
        getTotalItems,
        getTotalCost,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
