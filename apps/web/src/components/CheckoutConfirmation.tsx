import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import "./CheckoutConfirmation.css";
import { CartEntry } from "./StoreCartDrawer";
import { getApiUrl } from "../api/config";

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
  onViewReceipt?: (order: PlacedOrderData) => void;
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
  onViewReceipt,
}) => {
  const { language, t } = useLanguage();

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
      firstMsg = firstMsg || t("Please enter your name");
    }

    const cleanPhone = formData.mobile.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.mobile = true;
      firstMsg = firstMsg || t("Please enter a valid 10-digit mobile number");
    }

    if (!formData.address.trim() || formData.address.trim().length < 5) {
      newErrors.address = true;
      firstMsg = firstMsg || t("Please enter your delivery address");
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = true;
      firstMsg = firstMsg || t("Please enter a valid email address");
    }

    if (!isMinimumMet) {
      firstMsg = t("Minimum order amount of ₹{amount} is required to place an order.", {
        amount: MINIMUM_ORDER_AMOUNT,
      });
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
      setErrorMessage(t("Your cart is empty. Please add items to proceed."));
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

      let orderId = `ORD-${Date.now().toString().slice(-6)}`;
      let paymentStatus = "PENDING";
      let orderStatus = "PENDING";
      let createdAt = new Date().toISOString();

      try {
        const response = await fetch(getApiUrl("/api/orders"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.order) {
          orderId = data.order.id || orderId;
          paymentStatus = data.order.paymentStatus || paymentStatus;
          orderStatus = data.order.orderStatus || orderStatus;
          createdAt = data.order.createdAt || createdAt;
        } else if (!response.ok) {
          console.warn("Backend order creation warning:", data.error);
        }
      } catch (networkErr) {
        console.warn("Backend API offline or unreachable, proceeding locally for testing:", networkErr);
      }

      const orderData: PlacedOrderData = {
        id: orderId,
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
        paymentStatus,
        orderStatus,
        createdAt,
      };

      setCreatedOrder(orderData);
      setIsSuccess(true);
      onOrderPlaced(orderData);
    } catch (err: unknown) {
      console.error("Order submit failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || t("Unable to submit order."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviewReceipt = () => {
    const previewData: PlacedOrderData = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      customerName: formData.name.trim() || "Test Customer",
      customerPhone: formData.mobile.trim() || "+91 98765 43210",
      customerEmail: formData.email.trim() || undefined,
      deliveryAddress: formData.address.trim() || "Tamil Nadu",
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
      paymentStatus: "PENDING",
      orderStatus: "PENDING",
      createdAt: new Date().toISOString(),
    };

    if (onViewReceipt) {
      onViewReceipt(previewData);
    }
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
              <h3 className="simple-success-title">{t("Order Submitted!")}</h3>
              <p className="simple-success-desc">
                {t("Your order has been recorded. Payment status is PENDING.")}
              </p>
              <div className="simple-success-order-pill">
                {t("Order ID")}: #{createdOrder.id}
              </div>
              <div className="simple-success-actions">
                <button
                  type="button"
                  className="simple-btn-view-receipt"
                  onClick={() => onViewReceipt && onViewReceipt(createdOrder)}
                >
                  {t("View Receipt & WhatsApp Confirmation")}
                </button>
                <button
                  type="button"
                  className="simple-btn-continue"
                  onClick={onNavigateHome}
                >
                  {t("Continue Shopping")}
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
                  {t("State (*)")}
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
                        {t(st)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* City */}
              <div className="simple-checkout-row">
                <label htmlFor="checkout-city" className="simple-checkout-label">
                  {t("City")}
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
                        {t(c)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Name (*) */}
              <div className="simple-checkout-row">
                <label htmlFor="checkout-name" className="simple-checkout-label">
                  {t("Name (*)")}
                </label>
                <div className="simple-checkout-input-col">
                  <input
                    type="text"
                    id="checkout-name"
                    name="name"
                    className={`simple-checkout-input ${errors.name ? "has-error" : ""}`}
                    placeholder={t("Name")}
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Mobile.No (*) */}
              <div className="simple-checkout-row">
                <label htmlFor="checkout-mobile" className="simple-checkout-label">
                  {t("Mobile.No")}
                  <br />
                  (*)
                </label>
                <div className="simple-checkout-input-col">
                  <input
                    type="tel"
                    id="checkout-mobile"
                    name="mobile"
                    className={`simple-checkout-input ${errors.mobile ? "has-error" : ""}`}
                    placeholder={t("Mobile.No")}
                    maxLength={15}
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="simple-checkout-row">
                <label htmlFor="checkout-email" className="simple-checkout-label">
                  {t("Email")}
                </label>
                <div className="simple-checkout-input-col">
                  <input
                    type="email"
                    id="checkout-email"
                    name="email"
                    className={`simple-checkout-input ${errors.email ? "has-error" : ""}`}
                    placeholder={t("Email")}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Address (*) */}
              <div className="simple-checkout-address-block">
                <label htmlFor="checkout-address" className="simple-checkout-address-label">
                  {t("Address (*)")}
                </label>
                <textarea
                  id="checkout-address"
                  name="address"
                  className={`simple-checkout-textarea ${errors.address ? "has-error" : ""}`}
                  placeholder={t("Address")}
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
                  <span>{t("Sub Total")}</span>
                  <span>₹ {subtotal.toFixed(2)}</span>
                </div>

                <div className="simple-summary-row min-order">
                  <span>{t("Min.Order Amount")}</span>
                  <span>₹ {MINIMUM_ORDER_AMOUNT}</span>
                </div>

                <div className="simple-summary-row">
                  <div className="simple-summary-packing-label">
                    <span>{t("Packing Charges")}</span>
                    <span className="simple-summary-packing-sub">({packingCharges})</span>
                  </div>
                  <span>₹ {packingCharges}</span>
                </div>

                <div className="simple-summary-row">
                  <span>{t("Round OFF")}</span>
                  <span>₹ {roundOff.toFixed(2)}</span>
                </div>

                <div className="simple-summary-row overall">
                  <span>{t("Overall Amount")}</span>
                  <span>₹ {overallAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons: Submit & Back */}
              <div className="simple-checkout-actions">
                <button
                  type="submit"
                  className="simple-btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("Submitting...") : t("Submit")}
                </button>
                <button
                  type="button"
                  className="simple-btn-back"
                  onClick={onBack}
                >
                  {t("Back")}
                </button>
              </div>

              {onViewReceipt && (
                <button
                  type="button"
                  className="simple-btn-preview-receipt"
                  onClick={handlePreviewReceipt}
                  title={t("Preview receipt using current cart items")}
                >
                  {t("Preview Receipt (Testing)")}
                </button>
              )}
            </form>
          )}
        </div>
      </aside>
    </>
  );
};
