import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => boolean;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(persist((set, get) => ({
  items: [],
  addItem: (item) => {
    const currentState = get();
    if (currentState.items.some((current) => current.vendorId !== item.vendorId)) {
      return false;
    }
    set((state) => {
      const existing = state.items.find(
        ({ productId }) => productId === item.productId,
      );

      if (!existing) {
        return { items: [...state.items, item] };
      }

      return {
        items: state.items.map((current) =>
          current.productId === item.productId
            ? { ...current, quantity: current.quantity + item.quantity }
            : current,
        ),
      };
    });
    return true;
  },
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    })),
  setQuantity: (productId, quantity) =>
    set((state) => ({
      items:
        quantity < 1
          ? state.items.filter((item) => item.productId !== productId)
          : state.items.map((item) =>
              item.productId === productId ? { ...item, quantity } : item,
            ),
    })),
  clear: () => set({ items: [] }),
  totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
  subtotal: () =>
    get().items.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0,
    ),
}), {
  name: "quickmart-cart",
  version: 2,
  migrate: (persisted) => {
    const state = persisted as Partial<CartState> | undefined;
    return {
      ...state,
      items: (state?.items ?? []).filter(
        (item) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.productId) &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.vendorId),
      ),
    } as CartState;
  },
}));
