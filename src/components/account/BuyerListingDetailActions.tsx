"use client";

import { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import {
  toggleCartListingInlineAction,
  toggleSavedListingInlineAction
} from "@/actions/account";
import FormMessage from "@/components/auth/FormMessage";
import Button from "@/components/ui/Button";

export default function BuyerListingDetailActions({
  listingId,
  initialSaved,
  initialInCart,
  isSold
}: {
  listingId: string;
  initialSaved: boolean;
  initialInCart: boolean;
  isSold: boolean;
}) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isInCart, setIsInCart] = useState(initialInCart);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingCart, setIsUpdatingCart] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const toggleCart = async () => {
    const previousValue = isInCart;

    setErrorMessage("");
    setIsUpdatingCart(true);
    setIsInCart(!previousValue);

    const result = await toggleCartListingInlineAction(listingId);

    setIsUpdatingCart(false);

    if (!result.ok) {
      setIsInCart(previousValue);
      setErrorMessage(result.message);
      return;
    }

    setIsInCart(result.inCart);
  };

  const toggleSaved = async () => {
    const previousValue = isSaved;

    setErrorMessage("");
    setIsSaving(true);
    setIsSaved(!previousValue);

    const result = await toggleSavedListingInlineAction(listingId);

    setIsSaving(false);

    if (!result.ok) {
      setIsSaved(previousValue);
      setErrorMessage(result.message);
      return;
    }

    setIsSaved(result.saved);
  };

  return (
    <div className="space-y-3">
      <FormMessage message={errorMessage} tone="error" />

      <div className="grid grid-cols-[1fr_1fr] gap-3">
        <Button
          type="button"
          onClick={() => {
            void toggleCart();
          }}
          disabled={isSold || isUpdatingCart}
          variant={isInCart ? "subtle" : "secondary"}
          className="w-full rounded-2xl"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isInCart ? "Remove from Cart" : "Add to Cart"}
        </Button>

        <Button
          type="button"
          onClick={() => {
            void toggleSaved();
          }}
          disabled={isSaving}
          variant={isSaved ? "danger" : "secondary"}
          className="w-full rounded-2xl"
        >
          <Heart className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          {isSaved ? "Saved" : "Save"}
        </Button>
      </div>
    </div>
  );
}
