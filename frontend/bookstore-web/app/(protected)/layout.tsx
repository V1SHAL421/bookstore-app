"use client";

import { useEffect, useState } from "react";
import { CartProvider } from "@/app/CartContext";
import { CartSidebar } from "@/components/CartSidebar";
import { getUser } from "@/app/utils";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const currentUser = getUser();
    setIsAdmin(currentUser?.role === "admin");
  }, []);

  return (
    <CartProvider>
      <div className="flex h-screen">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        {isAdmin ? null : <CartSidebar />}
      </div>
    </CartProvider>
  );
}
