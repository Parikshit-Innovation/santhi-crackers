import React from "react";
import "./DeepaCartDrawer.css";
import { FeaturedProduct } from "./DeepaFeatured";

export interface CartItem {
  product: FeaturedProduct;
  quantity: number;
}

interface DeepaCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (id: string, qty: number) => void;
  onClear: () => void;
}

export const DeepaCartDrawer: React.FC<DeepaCartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onClear,
}) => {
  if (!isOpen) return null;

  const totalAmount = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalOriginal = items.reduce(
    (acc, item) => acc + item.product.originalPrice * item.quantity,
    0,
  );
  const totalSavings = totalOriginal - totalAmount;

  return (
    <div className="deepa-drawer-overlay" onClick={onClose}>
      <div className="deepa-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="deepa-drawer-header">
          <h3>Your Shopping Cart</h3>
          <button className="deepa-drawer-close" onClick={onClose} aria-label="Close cart">
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="deepa-empty-cart">
            <span className="deepa-empty-spark">✨</span>
            <h4>Your cart is empty</h4>
            <p>Explore our popular categories and add crackers to your festive cart.</p>
            <button className="deepa-btn-primary" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="deepa-drawer-items">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="deepa-drawer-item">
                  <img src={product.image} alt={product.name} className="deepa-drawer-item-img" />
                  <div className="deepa-drawer-item-info">
                    <h4 className="deepa-drawer-item-title">{product.name}</h4>
                    <span className="deepa-drawer-item-meta">{product.pieces}</span>
                    <span className="deepa-drawer-item-price">₹{product.price * quantity}</span>
                  </div>
                  <div className="deepa-drawer-qty-stepper">
                    <button onClick={() => onUpdateQty(product.id, quantity - 1)}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => onUpdateQty(product.id, quantity + 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="deepa-drawer-summary">
              <div className="deepa-summary-line">
                <span>Total MRP</span>
                <span>₹{totalOriginal}</span>
              </div>
              <div className="deepa-summary-line savings">
                <span>Festive Savings</span>
                <span>-₹{totalSavings}</span>
              </div>
              <div className="deepa-summary-line final">
                <span>Subtotal</span>
                <span>₹{totalAmount}</span>
              </div>
              <button
                className="deepa-checkout-btn"
                onClick={() => {
                  alert("Thank you for shopping at DeepaKart! Order ready for checkout.");
                  onClear();
                  onClose();
                }}
              >
                Proceed to Checkout • ₹{totalAmount}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
