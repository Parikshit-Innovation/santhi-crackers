import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import "./CheckoutConfirmation.css";
import { CartEntry } from "./StoreCartDrawer";

export interface CustomerFormData {
  name: string;
  mobile: string;
  email: string;
  state: string;
  city: string;
  address: string;
}

export interface OrderPricingSummary {
  subtotal: number;
  minimumOrderAmount: number;
  packingCharges: number;
  roundOff: number;
  overallAmount: number;
  isMinimumMet: boolean;
}

export interface PlacedOrderData {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  city?: string;
  state?: string;
  items: Array<{
    productId: string;
    productName: string;
    productCode: string;
    quantity: number;
    unitPrice: string | number;
    lineTotal: string | number;
  }>;
  subtotal: string | number;
  packingCharges: number;
  roundOff: number;
  total: string | number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

interface CheckoutConfirmationProps {
  isOpen?: boolean;
  cartItems: CartEntry[];
  onBack: () => void;
  onNavigateHome: () => void;
  onOrderPlaced: (order: PlacedOrderData) => void;
  onOpenReceiptPreview?: (sampleOrder: PlacedOrderData) => void;
}

// Only Tamil Nadu is needed as requested
const INDIAN_STATES = ["Tamil Nadu"];

const TN_CITIES = [
  "Select City",
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Sivakasi",
  "Tiruchirappalli",
  "Salem",
  "Tirunelveli",
  "Erode",
  "Vellore",
  "Thoothukudi",
  "Dindigul",
  "Thanjavur",
  "Ranipet",
  "Virudhunagar",
  "Karur",
  "Nagercoil",
  "Kanchipuram",
  "Hosur",
  "Cuddalore",
  "Tiruvannamalai",
  "Kumbakonam",
  "Pollachi",
  "Rajapalayam",
  "Theni",
  "Ariyalur",
  "Chengalpattu",
  "Dharmapuri",
  "Kallakurichi",
  "Kanyakumari",
  "Krishnagiri",
  "Mayiladuthurai",
  "Nagapattinam",
  "Namakkal",
  "Nilgiris",
  "Perambalur",
  "Pudukkottai",
  "Ramanathapuram",
  "Sivaganga",
  "Tenkasi",
  "Tirupathur",
  "Tiruppur",
  "Tiruvallur",
  "Tiruvarur",
  "Viluppuram",
  "Other",
];

const MINIMUM_ORDER_AMOUNT = 3000;
const PACKING_CHARGES = 50;

export const CheckoutConfirmation: React.FC<CheckoutConfirmationProps> = ({
  isOpen = true,
  cartItems,
  onBack,
  onNavigateHome,
  onOrderPlaced,
  onOpenReceiptPreview,
}) => {
  const { language } = useLanguage();

  const [formData, setFormData] = useState<CustomerFormData>({
    state: "Tamil Nadu",
    city: "",
    name: "",
    mobile: "",
    email: "",
    address: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, boolean>>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<PlacedOrderData | null>(null);

  // Pricing calculations
  const subtotal = cartItems.reduce(
    (acc, entry) => acc + (Number(entry.item.price) || 0) * entry.quantity,
    0,
  );
  const isMinimumMet = subtotal >= MINIMUM_ORDER_AMOUNT;
  const packingCharges = cartItems.length > 0 ? PACKING_CHARGES : 0;
  const rawOverall = subtotal + packingCharges;
  const overallAmount = Math.round(rawOverall);
  const roundOff = Math.round((overallAmount - rawOverall) * 100) / 100;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerFormData, boolean>> = {};
    let firstMsg = "";

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = true;
      firstMsg = firstMsg || "Please enter your Name.";
    }

    const cleanPhone = formData.mobile.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.mobile = true;
      firstMsg = firstMsg || "Please enter a valid 10-digit Mobile Number.";
    }

    if (!formData.address.trim() || formData.address.trim().length < 5) {
      newErrors.address = true;
      firstMsg = firstMsg || "Please enter your complete Address.";
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = true;
      firstMsg = firstMsg || "Please enter a valid Email address.";
    }

    if (!isMinimumMet) {
      firstMsg = `Min.Order Amount is ₹ ${MINIMUM_ORDER_AMOUNT}. Current Sub Total is ₹ ${subtotal.toFixed(2)}.`;
    }

    setErrors(newErrors);
    setErrorMessage(firstMsg);
    return Object.keys(newErrors).length === 0 && isMinimumMet;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CustomerFormData]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage("Your cart is empty. Please add items to proceed.");
      return;
    }

    setIsSubmitting(true);

    try {
      const fullDeliveryAddress = `${formData.address.trim()}${
        formData.city.trim() ? `, ${formData.city.trim()}` : ""
      }, Tamil Nadu${formData.email.trim() ? ` - Email: ${formData.email.trim()}` : ""}`;

      const payload = {
        customerName: formData.name.trim(),
        customerPhone: formData.mobile.trim(),
        deliveryAddress: fullDeliveryAddress,
        items: cartItems.map((entry) => ({
          productId: entry.item.id,
          quantity: entry.quantity,
        })),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit order. Please try again.");
      }

      const orderData: PlacedOrderData = {
        id: data.order?.id || `ORD-${Date.now()}`,
        customerName: formData.name.trim(),
        customerPhone: formData.mobile.trim(),
        customerEmail: formData.email.trim(),
        deliveryAddress: formData.address.trim(),
        city: formData.city.trim() || "Tamil Nadu",
        state: "Tamil Nadu",
        items: cartItems.map((entry) => ({
          productId: entry.item.id,
          productName:
            language === "ta" && entry.item.nameTam
              ? entry.item.nameTam
              : entry.item.nameEng || entry.item.name,
          productCode: entry.item.code || "CRK",
          quantity: entry.quantity,
          unitPrice: entry.item.price,
          lineTotal: entry.item.price * entry.quantity,
        })),
        subtotal,
        packingCharges,
        roundOff,
        total: overallAmount,
        paymentStatus: data.order?.paymentStatus || "PENDING",
        orderStatus: data.order?.orderStatus || "PENDING",
        createdAt: data.order?.createdAt || new Date().toISOString(),
      };

      setCreatedOrder(orderData);
      setIsSuccess(true);
      onOrderPlaced(orderData);
    } catch (err: unknown) {
      console.error("Order submit failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || "Unable to submit order. Please check network connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDevPreview = () => {
    if (!onOpenReceiptPreview) return;
    const sampleOrder: PlacedOrderData = {
      id: createdOrder?.id || `DEV-PREVIEW-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: formData.name.trim() || "Ramesh Kumar",
      customerPhone: formData.mobile.trim() || "+91 98765 43210",
      customerEmail: formData.email.trim() || "ramesh.kumar@example.com",
      deliveryAddress: formData.address.trim() || "12/4 Gandhi Nagar, Near Temple",
      city: formData.city.trim() || "Coimbatore",
      state: "Tamil Nadu",
      items:
        cartItems.length > 0
          ? cartItems.map((entry) => ({
              productId: entry.item.id,
              productName:
                language === "ta" && entry.item.nameTam
                  ? entry.item.nameTam
                  : entry.item.nameEng || entry.item.name,
              productCode: entry.item.code || "CRK",
              quantity: entry.quantity,
              unitPrice: entry.item.price,
              lineTotal: entry.item.price * entry.quantity,
            }))
          : [
              {
                productId: "sample-1",
                productName: "Flower Pots Special (10 Pcs)",
                productCode: "SF2026-032",
                quantity: 2,
                unitPrice: 150,
                lineTotal: 300,
              },
              {
                productId: "sample-2",
                productName: "10 Cm Colour Sparklers",
                productCode: "SF2026-077",
                quantity: 4,
                unitPrice: 75,
                lineTotal: 300,
              },
            ],
      subtotal: subtotal || 3000,
      packingCharges,
      roundOff,
      total: overallAmount || 3050,
      paymentStatus: "PENDING",
      orderStatus: "PENDING",
      createdAt: new Date().toISOString(),
    };
    onOpenReceiptPreview(sampleOrder);
  };

  return (
    <>
      {/* Dark Dim Backdrop - sits over cart drawer */}
      <div
        className={`checkout-drawer-backdrop ${isOpen ? "open" : ""}`}
        onClick={onBack}
        aria-hidden="true"
      />

      {/* Slide-over Right Drawer Panel - overlapping cart */}
      <aside
        className={`checkout-drawer-panel ${isOpen ? "open" : ""}`}
        aria-label="Checkout Confirmation Drawer"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Orange Header Line */}
        <div className="checkout-drawer-top-bar" />

        <div className="checkout-drawer-body">
          {isSuccess && createdOrder ? (
            <div className="simple-success-view">
              <div className="simple-success-icon">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="simple-success-title">Order Submitted!</h3>
              <p className="simple-success-desc">
                Your order has been recorded. Payment status is <strong>PENDING</strong>.
              </p>
              <div className="simple-success-order-pill">
                Order ID: #{createdOrder.id}
              </div>
              <div className="simple-success-actions">
                <button
                  type="button"
                  className="simple-btn-view-receipt"
                  onClick={() => onOpenReceiptPreview && onOpenReceiptPreview(createdOrder)}
                >
                  View Receipt &amp; WhatsApp Confirmation
                </button>
                <button
                  type="button"
                  className="simple-btn-continue"
                  onClick={onNavigateHome}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {errorMessage && (
                <div className="simple-alert-box" role="alert">
                  {errorMessage}
                </div>
              )}

              {/* State (*) - Only Tamil Nadu */}
              <div className="simple-checkout-row">
                <label htmlFor="checkout-state" className="simple-checkout-label">
                  State (*)
                </label>
                <div className="simple-checkout-input-col">
                  <select
                    id="checkout-state"
                    name="state"
                    className="simple-checkout-input"
                    value={formData.state}
                    onChange={handleChange}
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* City */}
              <div className="simple-checkout-row">
                <label htmlFor="checkout-city" className="simple-checkout-label">
                  City
                </label>
                <div className="simple-checkout-input-col">
                  <select
                    id="checkout-city"
                    name="city"
                    className="simple-checkout-input"
                    value={formData.city}
                    onChange={handleChange}
                  >
                    {TN_CITIES.map((c) => (
                      <option key={c} value={c === "Select City" ? "" : c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Name (*) */}
              <div className="simple-checkout-row">
                <label htmlFor="checkout-name" className="simple-checkout-label">
                  Name (*)
                </label>
                <div className="simple-checkout-input-col">
                  <input
                    type="text"
                    id="checkout-name"
                    name="name"
                    className={`simple-checkout-input ${errors.name ? "has-error" : ""}`}
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Mobile.No (*) */}
              <div className="simple-checkout-row">
                <label htmlFor="checkout-mobile" className="simple-checkout-label">
                  Mobile.No
                  <br />
                  (*)
                </label>
                <div className="simple-checkout-input-col">
                  <input
                    type="tel"
                    id="checkout-mobile"
                    name="mobile"
                    className={`simple-checkout-input ${errors.mobile ? "has-error" : ""}`}
                    placeholder="Mobile.No"
                    maxLength={15}
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="simple-checkout-row">
                <label htmlFor="checkout-email" className="simple-checkout-label">
                  Email
                </label>
                <div className="simple-checkout-input-col">
                  <input
                    type="email"
                    id="checkout-email"
                    name="email"
                    className={`simple-checkout-input ${errors.email ? "has-error" : ""}`}
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Address (*) */}
              <div className="simple-checkout-address-block">
                <label htmlFor="checkout-address" className="simple-checkout-address-label">
                  Address (*)
                </label>
                <textarea
                  id="checkout-address"
                  name="address"
                  className={`simple-checkout-textarea ${errors.address ? "has-error" : ""}`}
                  placeholder="Address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              {/* Divider */}
              <hr className="simple-checkout-divider" />

              {/* Financial Breakdown matching screenshot */}
              <div className="simple-checkout-summary">
                <div className="simple-summary-row">
                  <span>Sub Total</span>
                  <span>₹ {subtotal.toFixed(2)}</span>
                </div>

                <div className="simple-summary-row min-order">
                  <span>Min.Order Amount</span>
                  <span>₹ {MINIMUM_ORDER_AMOUNT}</span>
                </div>

                <div className="simple-summary-row">
                  <div className="simple-summary-packing-label">
                    <span>Packing Charges</span>
                    <span className="simple-summary-packing-sub">({packingCharges})</span>
                  </div>
                  <span>₹ {packingCharges}</span>
                </div>

                <div className="simple-summary-row">
                  <span>Round OFF</span>
                  <span>₹ {roundOff.toFixed(2)}</span>
                </div>

                <div className="simple-summary-row overall">
                  <span>Overall Amount</span>
                  <span>₹ {overallAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons: Submit (Green) & Back (Red) */}
              <div className="simple-checkout-actions">
                <button
                  type="submit"
                  className="simple-btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
                <button
                  type="button"
                  className="simple-btn-back"
                  onClick={onBack}
                >
                  Back
                </button>
              </div>

              {/* Dev Preview Quick Link */}
              {onOpenReceiptPreview && (
                <button
                  type="button"
                  className="simple-dev-preview-link"
                  onClick={handleDevPreview}
                >
                  Preview Receipt Page
                </button>
              )}
            </form>
          )}
        </div>
      </aside>
    </>
  );
};
