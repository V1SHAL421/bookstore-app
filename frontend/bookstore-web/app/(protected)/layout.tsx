"use client";

import { useEffect, useState } from "react";
import { CartProvider } from "@/app/CartContext";
import { CartSidebar } from "@/components/CartSidebar";
import { getUser, refreshAccessToken } from "@/app/utils";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { BreadcrumbProvider } from "@/app/BreadcrumbContext";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      await refreshAccessToken();
      if (!isMounted) return;
      const currentUser = getUser();
      setIsAdmin(currentUser?.role === "admin");
    };

    hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <BreadcrumbProvider>
      <CartProvider>
        <div className="flex h-screen">
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <Breadcrumb />
              {children}
            </div>
          </div>
          {isAdmin ? null : <CartSidebar />}
        </div>
      </CartProvider>
    </BreadcrumbProvider>
  );
}
