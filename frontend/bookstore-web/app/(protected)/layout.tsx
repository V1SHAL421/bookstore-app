"use client";

import { CartProvider } from "@/app/CartContext";
import { CartSidebar } from "@/components/CartSidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex h-screen">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        <CartSidebar />
      </div>
    </CartProvider>
  );
}