"use client";

import { useState } from "react";
import { useCart } from "@/app/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutDialog } from "./CheckoutDialog";

export function CartSidebar() {
  const { items, updateQuantity, total } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <div className="w-64 md:w-80 h-full bg-background border-l border-border p-4 overflow-y-auto container">
      <Card>
        <CardHeader>
          <CardTitle>Shopping Cart</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground">Select a book to add it to your cart.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      £{item.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full mt-2"
                  onClick={() => setCheckoutOpen(true)}
                  disabled={items.length === 0}
                >
                  Checkout
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        total={total}
      />
    </div>
  );
}
