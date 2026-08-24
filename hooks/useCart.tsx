"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from "react";

export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  price: number;
  currencyCode: string;
  image?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  checkoutUrl: string | null;
}

type CartAction =
  | { type: "LOAD_CART"; payload: Partial<CartState> }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "SET_CHECKOUT_URL"; payload: string | null };

const CART_STORAGE_KEY = "khayal-cart";

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "LOAD_CART":
      return { ...state, ...action.payload };

    case "ADD_ITEM": {
      const existing = state.items.find(
        (item) => item.variantId === action.payload.variantId
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.variantId === action.payload.variantId
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
          isOpen: true,
        };
      }
      return {
        ...state,
        items: [...state.items, action.payload],
        isOpen: true,
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity < 1) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }

    case "CLEAR_CART":
      return { ...state, items: [], checkoutUrl: null };

    case "OPEN_CART":
      return { ...state, isOpen: true };

    case "CLOSE_CART":
      return { ...state, isOpen: false };

    case "SET_CHECKOUT_URL":
      return { ...state, checkoutUrl: action.payload };

    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  subtotal: number;
  currencyCode: string;
  checkoutUrl: string | null;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
    checkoutUrl: null,
  });

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: "LOAD_CART", payload: parsed });
      }
    } catch {
      // Ignore corrupted cart data
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ items: state.items, checkoutUrl: state.checkoutUrl })
      );
    }
  }, [state.items, state.checkoutUrl, mounted]);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    const id = `${item.variantId}-${Date.now()}`;
    dispatch({ type: "ADD_ITEM", payload: { ...item, id } });
  }, []);

  const removeItem = useCallback((lineId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: lineId });
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: lineId, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const openCart = useCallback(() => {
    dispatch({ type: "OPEN_CART" });
  }, []);

  const closeCart = useCallback(() => {
    dispatch({ type: "CLOSE_CART" });
  }, []);

  const value = useMemo(() => {
    const currencyCode = state.items[0]?.currencyCode || "PKR";
    const subtotal = state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return {
      items: state.items,
      isOpen: state.isOpen,
      totalItems: state.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      currencyCode,
      checkoutUrl: state.checkoutUrl,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
    };
  }, [state, addItem, removeItem, updateQuantity, clearCart, openCart, closeCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
