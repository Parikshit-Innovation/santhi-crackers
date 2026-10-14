import React, { useState } from "react";
import "./OrderReceipt.css";
import { PlacedOrderData } from "./CheckoutConfirmation";

interface OrderReceiptProps {
  isOpen?: boolean;
  order: PlacedOrderData;
  onNavigateHome: () => void;
  isPreview?: boolean;
}

const WHATSAPP_CONTACT_NUMBER = "917373292931";

export const OrderReceipt: React.FC<OrderReceiptProps> = ({
  isOpen = true,
  order,
  onNavigateHome,
  isPreview = false,
}) => {
  const [simulatedPaid, setSimulatedPaid] = useState(false);

  // Check if payment is completed (or simulated in preview mode)
  const isPaid = order.paymentStatus === "PAID" || simulatedPaid;

  const formatPrice = (val: string | number) => {
    const num = Number(val) || 0;
    return "₹ " + num.toFixed(2);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  // Build the prefilled WhatsApp message with order details
  const generateWhatsAppMessage = (): string => {
    const lines = [
      "🎆 *SHANTHI SIVAKASI CRACKERS - ORDER CONFIRMATION* 🎆",
      "━━━━━━━━━━━━━━━━━━━━━━━━━",
      `*Order ID:* #${order.id}`,
      `*Date:* ${formatDate(order.createdAt)}`,
      `*Payment Status:* ${isPaid ? "PAID ✓" : order.paymentStatus || "PENDING"}`,
      "",
      "👤 *Customer Information:*",
      `• *Name:* ${order.customerName}`,
      `• *Mobile:* ${order.customerPhone}`,
      order.customerEmail ? `• *Email:* ${order.customerEmail}` : "",
      `• *State:* Tamil Nadu`,
      order.city ? `• *City:* ${order.city}` : "",
      `• *Delivery Address:* ${order.deliveryAddress}`,
      "",
      "📦 *Ordered Products:*",
    ];

    order.items.forEach((item, index) => {
      const linePrice = Number(item.lineTotal) || Number(item.unitPrice) * item.quantity;
      lines.push(`${index + 1}. *${item.productName}* (${item.productCode})`);
      lines.push(
        `   └ Qty: ${item.quantity} × ₹${Number(item.unitPrice).toFixed(2)} = ₹${linePrice.toFixed(2)}`
      );
    });

    lines.push("");
    lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━");
    lines.push(`*Subtotal:* ${formatPrice(order.subtotal)}`);
    if (order.packingCharges) {
      lines.push(`*Packing Charges:* ₹ ${order.packingCharges}`);
    }
    if (order.roundOff !== 0 && order.roundOff !== undefined) {
      lines.push(`*Round Off:* ${formatPrice(order.roundOff)}`);
    }
    lines.push(`*Overall Amount:* ${formatPrice(order.total)}`);
    lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━");
    lines.push("");
    lines.push("Payment has been completed. Kindly confirm dispatch of my order. Thank you! 🙏");

    return lines.filter(Boolean).join("\n");
  };

  const handleSendWhatsApp = () => {
    if (!isPaid) return;
    const text = generateWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_CONTACT_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };


  return (
    <>
      {/* Dark Dim Backdrop - sits over cart drawer */}
      <div
        className={`receipt-drawer-backdrop ${isOpen ? "open" : ""}`}
        onClick={onNavigateHome}
        aria-hidden="true"
      />

      {/* Slide-over Right Drawer Panel - overlapping cart */}
      <aside
        className={`receipt-drawer-panel ${isOpen ? "open" : ""}`}
        aria-label="Order Receipt Drawer"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Orange Header Bar */}
        <div className="receipt-drawer-top-bar" />

        <div className="receipt-drawer-body">
          {isPreview && (
            <div className="simple-receipt-dev-tag no-print">
              Order Receipt Preview
            </div>
          )}

          {/* Header */}
          <div className="simple-receipt-header">
            <h2 className="simple-receipt-title">Shanthi Sivakasi Crackers</h2>

            <div className="simple-receipt-meta-grid">
              <div className="simple-receipt-meta-row">
                <span className="simple-receipt-meta-label">Order ID:</span>
                <span className="simple-receipt-meta-val">#{order.id}</span>
              </div>
              <div className="simple-receipt-meta-row">
                <span className="simple-receipt-meta-label">Date:</span>
                <span className="simple-receipt-meta-val">{formatDate(order.createdAt)}</span>
              </div>
              <div className="simple-receipt-meta-row">
                <span className="simple-receipt-meta-label">Payment:</span>
                <span
                  className={`simple-receipt-meta-val ${isPaid ? "paid" : "pending"}`}
                >
                  {isPaid ? "PAID ✓" : "PENDING"}
                </span>
              </div>
            </div>
          </div>

          <hr className="simple-receipt-divider" />

          {/* Customer Information */}
          <div className="simple-receipt-section-heading">Customer Details</div>
          <div className="simple-receipt-cust-info">
            <div className="simple-receipt-cust-row">
              <span className="simple-receipt-cust-label">Name:</span>
              <span className="simple-receipt-cust-val">{order.customerName}</span>
            </div>
            <div className="simple-receipt-cust-row">
              <span className="simple-receipt-cust-label">Mobile.No:</span>
              <span className="simple-receipt-cust-val">{order.customerPhone}</span>
            </div>
            {order.customerEmail && (
              <div className="simple-receipt-cust-row">
                <span className="simple-receipt-cust-label">Email:</span>
                <span className="simple-receipt-cust-val">{order.customerEmail}</span>
              </div>
            )}
            <div className="simple-receipt-cust-row">
              <span className="simple-receipt-cust-label">State:</span>
              <span className="simple-receipt-cust-val">Tamil Nadu</span>
            </div>
            {order.city && (
              <div className="simple-receipt-cust-row">
                <span className="simple-receipt-cust-label">City:</span>
                <span className="simple-receipt-cust-val">{order.city}</span>
              </div>
            )}
            <div className="simple-receipt-cust-row">
              <span className="simple-receipt-cust-label">Address:</span>
              <span className="simple-receipt-cust-val">{order.deliveryAddress}</span>
            </div>
          </div>

          <hr className="simple-receipt-divider" />

          {/* Products Ordered */}
          <div className="simple-receipt-section-heading">Items Ordered</div>
          <div className="simple-receipt-items-wrap">
            {order.items.map((item, idx) => {
              const unitP = Number(item.unitPrice) || 0;
              const lineP = Number(item.lineTotal) || unitP * item.quantity;
              return (
                <div key={item.productId || idx} className="simple-receipt-item-row">
                  <div className="simple-receipt-item-left">
                    <span className="simple-receipt-item-name">{item.productName}</span>
                    <span className="simple-receipt-item-code">{item.productCode}</span>
                    <div className="simple-receipt-item-sub">
                      {item.quantity} × ₹ {unitP.toFixed(2)}
                    </div>
                  </div>
                  <div className="simple-receipt-item-right">
                    ₹ {lineP.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          <hr className="simple-receipt-divider" />

          {/* Financial Breakdown */}
          <div className="simple-receipt-summary">
            <div className="simple-summary-row">
              <span>Sub Total</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>

            <div className="simple-summary-row">
              <span>Packing Charges</span>
              <span>₹ {Number(order.packingCharges || 50)}</span>
            </div>

            {order.roundOff !== undefined && (
              <div className="simple-summary-row">
                <span>Round OFF</span>
                <span>{formatPrice(order.roundOff || 0)}</span>
              </div>
            )}

            <div className="simple-summary-row overall">
              <span>Overall Amount</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Action Buttons: WhatsApp (Green) & Continue Shopping (Red) */}
          <div className="simple-receipt-actions no-print">
            <button
              type="button"
              className={`simple-btn-whatsapp-confirm ${!isPaid ? "disabled" : ""}`}
              onClick={handleSendWhatsApp}
              disabled={!isPaid}
              title={
                !isPaid
                  ? "WhatsApp confirmation is only available after payment"
                  : "Send WhatsApp Confirmation"
              }
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>
                {isPaid
                  ? "Send WhatsApp Confirmation"
                  : "Send WhatsApp Confirmation (Available After Payment)"}
              </span>
            </button>

            {!isPaid && (
              <p className="receipt-payment-pending-note no-print">
                🔒 WhatsApp confirmation will be unlocked once payment is completed.
              </p>
            )}

            {isPreview && !order.paymentStatus?.includes("PAID") && (
              <div style={{ textAlign: "center", marginTop: 2 }} className="no-print">
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "1px dashed #0284c7",
                    borderRadius: 4,
                    color: "#0284c7",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 8px",
                    cursor: "pointer",
                  }}
                  onClick={() => setSimulatedPaid((prev) => !prev)}
                >
                  ⚡ Preview Toggle: {simulatedPaid ? "Simulate PENDING" : "Simulate PAID"}
                </button>
              </div>
            )}

            <button
              type="button"
              className="simple-btn-receipt-continue"
              onClick={onNavigateHome}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
