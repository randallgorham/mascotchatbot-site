"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  kind: "plan" | "addon" | "mascot";
  monthly: number; // recurring per month (0 for one-time items)
  oneTime: number; // setup / one-time fee
  billing?: string; // "monthly" | "annual"
  detail?: string;
  tier?: string; // for the mascot line: "predesigned" | "rigged" | "custom"
  img?: string; // picked character image slug (predesigned)
};

type Ctx = {
  items: CartItem[];
  add: (i: CartItem, openDrawer?: boolean) => void;
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

  // openDrawer defaults to false so stepped selections update the cart badge
  // without interrupting the flow. Pass true to pop the drawer open.
  function add(i: CartItem, openDrawer = false) {
    setItems((prev) => {
      // one plan and one mascot at a time; add-ons stack but no duplicates
      let base = prev;
      if (i.kind === "plan") base = prev.filter((p) => p.kind !== "plan");
      else if (i.kind === "mascot") base = prev.filter((p) => p.kind !== "mascot");
      else base = prev.filter((p) => p.id !== i.id);
      return [...base, i];
    });
    if (openDrawer) setOpen(true);
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
