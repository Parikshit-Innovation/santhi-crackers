import React, { useState, useEffect } from "react";
import "./StoreCartDrawer.css";
import { ComboItem } from "./ComboPackTable";

export interface CartEntry {
  item: ComboItem;
  quantity: number;
}

interface StoreCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartEntry[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart?: () => void;
}

export const StoreCartDrawer: React.FC<StoreCartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Close on Escape key & freeze body scrolling when open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const totalItemCount = cartItems.reduce((acc, entry) => acc + entry.quantity, 0);
  const rawSubtotal = cartItems.reduce((acc, entry) => acc + entry.item.price * entry.quantity, 0);
  const discountMultiplier = discountApplied ? 0.9 : 1; // 10% extra discount if applied
  const finalSubtotal = Math.round(rawSubtotal * discountMultiplier);

  const formatPrice = (val: number) => "₹" + val.toLocaleString("en-IN");

  const handleApplyDiscount = () => {
    if (
      discountCode.trim().toUpperCase() === "DIWALI10" ||
      discountCode.trim().toUpperCase() === "FESTIVE"
    ) {
      setDiscountApplied(true);
      setDiscountError("");
    } else if (!discountCode.trim()) {
      setDiscountError("Please enter a code");
    } else {
      setDiscountError("Invalid coupon code");
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      alert(
        `Order placed successfully for ${totalItemCount} items (${formatPrice(finalSubtotal)})! Thank you for shopping with us.`,
      );
      if (onClearCart) onClearCart();
      setIsCheckingOut(false);
      onClose();
    }, 600);
  };

  return (
    <>
      {/* Dark Dim Backdrop */}
      <div
        className={`store-drawer-backdrop ${isOpen ? "open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Right to Left Drawer Panel */}
      <aside
        className={`store-drawer-panel ${isOpen ? "open" : ""}`}
        aria-label="Shopping Cart Drawer"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="store-drawer-header">
          <h2 className="store-drawer-title">
            Your Cart {totalItemCount > 0 && `(${totalItemCount} items)`}
          </h2>
          <button
            type="button"
            className="store-drawer-close"
            onClick={onClose}
            aria-label="Close cart"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        {cartItems.length === 0 ? (
          /* Empty State matching Screenshot 1 */
          <div className="store-drawer-empty">
            <div className="store-empty-icon-circle">
              <svg
                viewBox="0 0 24 24"
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <h3 className="store-empty-title">Your cart is empty</h3>
            <p className="store-empty-desc">Add some products to get started</p>
            <button type="button" className="store-empty-action-btn" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        ) : (
          /* Populated State matching Screenshot 2 */
          <div className="store-drawer-body">
            {/* Scrollable Item Rows */}
            <div className="store-drawer-items">
              {cartItems.map(({ item, quantity }) => {
                const lineTotal = item.price * quantity;
                return (
                  <div key={item.id} className="store-drawer-item-row">
                    <img src={item.image} alt={item.name} className="store-drawer-item-img" />

                    <div className="store-drawer-item-main">
                      <div className="store-drawer-item-top">
                        <span className="store-drawer-item-title">{item.name}</span>
                        <button
                          type="button"
                          className="store-drawer-trash-btn"
                          onClick={() => onRemoveItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>

                      <div className="store-drawer-item-bottom">
                        {/* Stepper matching screenshot (- 3 +) */}
                        <div className="store-drawer-stepper">
                          <button
                            type="button"
                            className="store-drawer-stepper-btn"
                            onClick={() => onUpdateQuantity(item.id, Math.max(0, quantity - 1))}
                            aria-label="Decrease quantity"
                          >
                            –
                          </button>
                          <span className="store-drawer-stepper-val">{quantity}</span>
                          <button
                            type="button"
                            className="store-drawer-stepper-btn"
                            onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <span className="store-drawer-item-price">{formatPrice(lineTotal)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pinned Bottom Footer Section */}
            <div className="store-drawer-footer">
              {/* Discount Code Form */}
              <div className="store-discount-group">
                <input
                  type="text"
                  placeholder="Discount code"
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value);
                    setDiscountError("");
                  }}
                  className="store-discount-input"
                  disabled={discountApplied}
                />
                <button
                  type="button"
                  className="store-discount-btn"
                  onClick={handleApplyDiscount}
                  disabled={discountApplied}
                >
                  {discountApplied ? "Applied" : "Apply"}
                </button>
              </div>
              {discountError && <span className="store-discount-error">{discountError}</span>}
              {discountApplied && (
                <span className="store-discount-success">10% festive discount applied!</span>
              )}

              {/* Subtotal */}
              <div className="store-subtotal-row">
                <span className="store-subtotal-label">Subtotal</span>
                <span className="store-subtotal-amount">{formatPrice(finalSubtotal)}</span>
              </div>

              {/* Note */}
              <p className="store-shipping-note">Shipping calculated at checkout</p>

              {/* Checkout CTA */}
              <button
                type="button"
                className="store-checkout-btn"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? "Processing..." : "Checkout"}
              </button>

              {/* Continue Shopping Link */}
              <button type="button" className="store-continue-shopping-link" onClick={onClose}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
