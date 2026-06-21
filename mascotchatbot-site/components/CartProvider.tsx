"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  kind: "plan" | "addon";
  monthly: number; // recurring per month (0 for one-time items)
  oneTime: number; // setup / one-time fee
  billing?: string; // "monthly" | "annual" | "prepay3"
  detail?: string;
};

type Ctx = {
  items: CartItem[];
  add: (i: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (b: boolean) => void;
  monthlyTotal: number;
  oneTimeTotal: number;
};

const CartCtx = createContext<Ctx | null>(null);

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("mcb_cart");
      if (s) setItems(JSON.parse(s));
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("mcb_cart", JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  function add(i: CartItem) {
    setItems((prev) => {
      // one plan at a time; add-ons stack but no duplicates
      const base = i.kind === "plan" ? prev.filter((p) => p.kind !== "plan") : prev.filter((p) => p.id !== i.id);
      return [...base, i];
    });
    setOpen(true);
  }
  function remove(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }
  function clear() {
    setItems([]);
  }

  let monthlyTotal = 0;
  let oneTimeTotal = 0;
  for (let i = 0; i < items.length; i++) {
    monthlyTotal += items[i].monthly || 0;
    oneTimeTotal += items[i].oneTime || 0;
  }

  return (
    <CartCtx.Provider value={{ items, add, remove, clear, open, setOpen, monthlyTotal, oneTimeTotal }}>
      {children}
    </CartCtx.Provider>
  );
}
