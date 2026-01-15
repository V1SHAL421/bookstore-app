"use client";

import { useEffect, useState } from "react";
import { CartProvider } from "@/app/CartContext";
import { CartSidebar } from "@/components/CartSidebar";
import { getUser, refreshAccessToken, logout } from "@/app/utils";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { BreadcrumbProvider } from "@/app/BreadcrumbContext";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      await refreshAccessToken();
      if (!isMounted) return;
      const currentUser = getUser();
      setIsAdmin(currentUser?.role === "admin");
      setUserName(currentUser?.full_name ?? null);
    };

    hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <BreadcrumbProvider>
      <CartProvider>
        <div className="flex h-screen flex-col">
          <header className="flex justify-between items-center p-4 border-b">
            <div></div>
            <div className="flex items-center gap-3">
              {userName ? (
                <span className="text-sm text-muted-foreground">{userName}</span>
              ) : null}
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </header>
          <div className="flex flex-1">
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <Breadcrumb />
                {children}
              </div>
            </div>
            {isAdmin ? null : <CartSidebar />}
          </div>
        </div>
      </CartProvider>
    </BreadcrumbProvider>
  );
}
