"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { postJSON } from "@/app/utils";
import { useCart } from "@/app/CartContext";

type OrderCreateInput = {
  book_id: string;
  quantity: number;
  total_amount: number;
};

type OrderOutput = {
  id: string;
  user_id: string;
  book_id: string;
  quantity: number;
  total_amount: number;
  status: string;
};

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
}

export function CheckoutDialog({ open, onOpenChange, total }: CheckoutDialogProps) {
  const { items, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create orders for each cart item
      const orderPromises = items.map((item) =>
        postJSON<OrderOutput, OrderCreateInput>("/orders", {
          book_id: item.id,
          quantity: item.quantity,
          total_amount: item.price * item.quantity,
        })
      );

      await Promise.all(orderPromises);

      // Clear cart on success
      clearCart();
      setSuccess(true);
    } catch (err) {
      console.error("Checkout failed:", err);
      setError("Checkout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {success ? "Order Confirmed!" : "Confirm Purchase"}
          </DialogTitle>
          <DialogDescription>
            {success
              ? "Your order has been successfully placed."
              : `Please confirm your order total of £${total.toFixed(2)}.`}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {success ? (
            <div className="text-center">
              <p className="text-green-600 font-semibold mb-2">✓ Order placed successfully!</p>
              <p className="text-sm text-muted-foreground">
                Your cart has been cleared and your order is being processed.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.title} (x{item.quantity})
                    </span>
                    <span>£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 mt-4">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
              </div>
              {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          {success ? (
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleCheckout} disabled={isLoading}>
                {isLoading ? "Processing..." : "Confirm Purchase"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
