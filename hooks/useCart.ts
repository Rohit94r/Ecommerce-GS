"use client";

import { createContext, createElement, useContext, useMemo, useSyncExternalStore } from "react";
import { getCartProductKey } from "@/lib/cart";
import type { CartItem, Product } from "@/types";

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (product: Product) => void;
  removeItem: (productKey: string) => void;
  updateQuantity: (productKey: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = "gargi-cart";
const CART_EVENT = "gargi-cart-change";
const EMPTY_CART: CartItem[] = [];
let cachedCartRaw = "";
let cachedCartItems: CartItem[] = [];

function readCart() {
  if (typeof window === "undefined") return EMPTY_CART;

  const raw = window.localStorage.getItem(CART_KEY) ?? "[]";
  if (raw === cachedCartRaw) return cachedCartItems;

  try {
    cachedCartItems = JSON.parse(raw) as CartItem[];
    cachedCartRaw = raw;
    return cachedCartItems;
  } catch {
    window.localStorage.removeItem(CART_KEY);
    cachedCartRaw = "[]";
    cachedCartItems = [];
    return cachedCartItems;
  }
}

function subscribeToCart(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(CART_EVENT, listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(CART_EVENT, listener);
  };
}

function writeCart(items: CartItem[]) {
  cachedCartItems = items;
  cachedCartRaw = JSON.stringify(items);
  window.localStorage.setItem(CART_KEY, cachedCartRaw);
  window.dispatchEvent(new Event(CART_EVENT));
}

function updateCart(updater: (items: CartItem[]) => CartItem[]) {
  writeCart(updater(readCart()));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribeToCart, readCart, () => EMPTY_CART);

  const value = useMemo<CartContextValue>(() => {
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      total,
      count,
      addItem(product) {
        if (product.stock <= 0) return;
        updateCart((current) => {
          const productKey = getCartProductKey(product);
          const existing = current.find((item) => getCartProductKey(item.product) === productKey);
          if (existing) {
            return current.map((item) =>
              getCartProductKey(item.product) === productKey ? { ...item, quantity: item.quantity + 1 } : item,
            );
          }
          return [...current, { product, quantity: 1 }];
        });
      },
      removeItem(productKey) {
        updateCart((current) => current.filter((item) => getCartProductKey(item.product) !== productKey));
      },
      updateQuantity(productKey, quantity) {
        updateCart((current) =>
          current
            .map((item) => (getCartProductKey(item.product) === productKey ? { ...item, quantity: Math.max(1, quantity) } : item))
            .filter((item) => item.quantity > 0),
        );
      },
      clearCart() {
        writeCart([]);
      },
    };
  }, [items]);

  return createElement(CartContext.Provider, { value }, children);
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
