import React from "react";
import { PlacedOrderData } from "./CheckoutConfirmation";
import { useLanguage } from "../context/LanguageContext";
import "./OrderReceipt.css";

interface OrderReceiptProps {
  isOpen?: boolean;
  order: PlacedOrderData;
  onNavigateHome: () => void;
}

const WHATSAPP_CONTACT_NUMBER = "917373292931";

export const OrderReceipt: React.FC<OrderReceiptProps> = ({
  isOpen = true,
  order,
  onNavigateHome,
}) => {
  const { t } = useLanguage();
  // Real payment status from the placed order
  const isPaid = order.paymentStatus === "PAID";

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

  // Build the comprehensive prefilled WhatsApp message containing everything in the receipt
  const generateWhatsAppMessage = (): string => {
    const lines = [
      "🎆 *SHANTHI SIVAKASI CRACKERS - ORDER CONFIRMATION* 🎆",
      "━━━━━━━━━━━━━━━━━━━━━━━━━",
      `*Order ID:* #${order.id}`,
      `*Date:* ${formatDate(order.createdAt)}`,
      "",
      "👤 *Customer Information:*",
      `• *Name:* ${order.customerName}`,
      `• *Mobile:* ${order.customerPhone}`,
      order.customerEmail ? `• *Email:* ${order.customerEmail}` : "",
      order.city ? `• *City:* ${order.city}` : "",
      `• *Delivery Address:* ${order.deliveryAddress}`,
      `• *State:* Tamil Nadu`,
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
    lines.push("🏬 *Store Branches:*");
    lines.push("• Branch 1: 15A, College Division, Karattadipalayam, Gobichettipalayam");
    lines.push("• Branch 2: 1/1, Kalingiam Main Road, Kalingiam, Gobichettipalayam");
    lines.push("• Contact: +91 73732 92931 / +91 98652 40462");
    lines.push("");
    lines.push("Order details submitted. Kindly share payment / dispatch instructions. Thank you! 🙏");

    return lines.filter(Boolean).join("\n");
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank", "width=850,height=950");
    if (!printWindow) {
      window.print();
      return;
    }

    const itemsRows = order.items
      .map(
        (item, idx) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px; text-align: center; color: #64748b; font-size: 13px;">${idx + 1}</td>
          <td style="padding: 10px;">
            <div style="font-weight: 700; color: #492201; font-size: 14px;">${item.productName}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Code: ${item.productCode}</div>
          </td>
          <td style="padding: 10px; text-align: center; font-weight: 600; font-size: 13px;">${item.quantity}</td>
          <td style="padding: 10px; text-align: right; color: #334155; font-size: 13px;">₹${Number(item.unitPrice).toFixed(2)}</td>
          <td style="padding: 10px; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">₹${(Number(item.lineTotal) || Number(item.unitPrice) * item.quantity).toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    const logoSrc = window.location.origin + "/home/logo-santhi.png";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Order Receipt - #${order.id}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              padding: 30px;
              color: #150A06;
              background: #fff;
              line-height: 1.45;
            }
            .invoice-box {
              max-width: 780px;
              margin: auto;
              border: 1.5px solid #CDB462;
              border-radius: 8px;
              padding: 28px 32px;
              box-shadow: 0 4px 14px rgba(0,0,0,0.06);
              background: #ffffff;
            }
            .header-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #BF7F35;
              padding-bottom: 18px;
              margin-bottom: 20px;
            }
            .brand-left {
              display: flex;
              align-items: center;
              gap: 14px;
            }
            .brand-logo {
              width: 58px;
              height: 58px;
              object-fit: contain;
              border: 1.5px solid #CDB462;
              padding: 2px;
              background: #fff;
            }
            .brand-title {
              font-size: 22px;
              font-weight: 800;
              color: #492201;
              line-height: 1.15;
            }
            .brand-tamil {
              font-size: 14px;
              color: #BF7F35;
              font-weight: 700;
              margin-top: 2px;
            }
            .order-meta-box {
              text-align: right;
            }
            .order-title {
              font-size: 11px;
              text-transform: uppercase;
              font-weight: 700;
              color: #64748b;
              letter-spacing: 0.05em;
            }
            .order-id {
              font-size: 17px;
              font-weight: 800;
              color: #492201;
              margin-top: 2px;
            }
            .order-date {
              font-size: 12px;
              color: #64748b;
              margin-top: 3px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin-bottom: 22px;
            }
            .info-panel {
              background: #FAF5DE;
              border: 1px solid #CDB462;
              border-radius: 6px;
              padding: 14px 16px;
            }
            .info-panel-title {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              color: #492201;
              border-bottom: 1px solid rgba(191, 127, 53, 0.35);
              padding-bottom: 6px;
              margin-bottom: 8px;
            }
            .info-line {
              font-size: 13px;
              color: #150A06;
              margin-bottom: 4px;
            }
            .info-line strong {
              color: #492201;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background: #FAF5DE;
              color: #492201;
              font-size: 11.5px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.04em;
              padding: 10px;
              border-top: 1.5px solid #CDB462;
              border-bottom: 1.5px solid #CDB462;
            }
            .summary-wrap {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 20px;
            }
            .summary-box {
              width: 300px;
              background: #FAF5DE;
              border: 1.5px solid #CDB462;
              border-radius: 6px;
              padding: 12px 16px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              font-size: 13.5px;
              padding: 4px 0;
              color: #334155;
            }
            .summary-row.total {
              border-top: 1.5px solid #BF7F35;
              margin-top: 6px;
              padding-top: 8px;
              font-size: 16px;
              font-weight: 800;
              color: #492201;
            }
            .footer-note {
              border-top: 1px dashed #CDB462;
              padding-top: 14px;
              text-align: center;
              font-size: 12px;
              color: #64748b;
              line-height: 1.5;
            }
            @media print {
              body { padding: 0; background: #fff; }
              .invoice-box { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header-bar">
              <div class="brand-left">
                <img src="${logoSrc}" alt="Shanthi Crackers Logo" class="brand-logo" onerror="this.style.display='none'" />
                <div>
                  <div class="brand-title">Shanthi Crackers</div>
                  <div class="brand-tamil">சாந்தி பட்டாசுகள் · சிவகாசி</div>
                </div>
              </div>
              <div class="order-meta-box">
                <div class="order-title">Official Order Receipt</div>
                <div class="order-id">#${order.id}</div>
                <div class="order-date">${formatDate(order.createdAt)}</div>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-panel">
                <div class="info-panel-title">Customer Details</div>
                <div class="info-line"><strong>Name:</strong> ${order.customerName}</div>
                <div class="info-line"><strong>Mobile No:</strong> ${order.customerPhone}</div>
                ${order.customerEmail ? `<div class="info-line"><strong>Email:</strong> ${order.customerEmail}</div>` : ""}
                <div class="info-line"><strong>Delivery:</strong> ${order.deliveryAddress}</div>
                ${order.city ? `<div class="info-line"><strong>City:</strong> ${order.city}, Tamil Nadu</div>` : ""}
              </div>
              <div class="info-panel">
                <div class="info-panel-title">Store & Depot Branches</div>
                <div class="info-line"><strong>Branch 1:</strong> 15A, College Division, Karattadipalayam, Gobichettipalayam</div>
                <div class="info-line"><strong>Branch 2:</strong> 1/1, Kalingiam Main Road, Kalingiam, Gobichettipalayam</div>
                <div class="info-line"><strong>Contact / WhatsApp:</strong> +91 73732 92931 / +91 98652 40462</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="text-align: center; width: 40px;">#</th>
                  <th style="text-align: left;">Product Description</th>
                  <th style="text-align: center; width: 60px;">Qty</th>
                  <th style="text-align: right; width: 100px;">Price</th>
                  <th style="text-align: right; width: 110px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <div class="summary-wrap">
              <div class="summary-box">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span>${formatPrice(order.subtotal)}</span>
                </div>
                ${order.packingCharges ? `
                <div class="summary-row">
                  <span>Packing Charges</span>
                  <span>₹ ${order.packingCharges}</span>
                </div>` : ""}
                ${order.roundOff !== 0 && order.roundOff !== undefined ? `
                <div class="summary-row">
                  <span>Round Off</span>
                  <span>${formatPrice(order.roundOff)}</span>
                </div>` : ""}
                <div class="summary-row total">
                  <span>Total Amount</span>
                  <span>${formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            <div class="footer-note">
              <strong>Thank you for choosing Shanthi Crackers!</strong><br />
              Direct Sivakasi Crackers · Quality & Safety Assured · Gobichettipalayam
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSendWhatsApp = () => {
    // Directly opens WhatsApp with pre-filled message including viewable receipt link
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
          {/* Header */}
          <div className="simple-receipt-header">
            <div className="receipt-brand-row">
              <img
                src="/home/logo-santhi.png"
                alt="Shanthi Crackers Logo"
                className="receipt-brand-logo receipt-print-allowed"
              />
              <div className="receipt-brand-text">
                <h2 className="simple-receipt-title">{t("Shanthi Sivakasi Crackers")}</h2>
                <span className="receipt-brand-subtitle">சாந்தி பட்டாசுகள்</span>
              </div>
            </div>

            <div className="simple-receipt-meta-grid">
              <div className="simple-receipt-meta-row">
                <span className="simple-receipt-meta-label">{t("Order ID:")}</span>
                <span className="simple-receipt-meta-val">#{order.id}</span>
              </div>
              <div className="simple-receipt-meta-row">
                <span className="simple-receipt-meta-label">{t("Date:")}</span>
                <span className="simple-receipt-meta-val">{formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>

          <hr className="simple-receipt-divider" />

          {/* Customer Information */}
          <div className="simple-receipt-section-heading">{t("Customer Details")}</div>
          <div className="simple-receipt-cust-info">
            <div className="simple-receipt-cust-row">
              <span className="simple-receipt-cust-label">{t("Name:")}</span>
              <span className="simple-receipt-cust-val">{order.customerName}</span>
            </div>
            <div className="simple-receipt-cust-row">
              <span className="simple-receipt-cust-label">{t("Mobile.No:")}</span>
              <span className="simple-receipt-cust-val">{order.customerPhone}</span>
            </div>
            {order.customerEmail && (
              <div className="simple-receipt-cust-row">
                <span className="simple-receipt-cust-label">{t("Email:")}</span>
                <span className="simple-receipt-cust-val">{order.customerEmail}</span>
              </div>
            )}
            <div className="simple-receipt-cust-row">
              <span className="simple-receipt-cust-label">{t("State:")}</span>
              <span className="simple-receipt-cust-val">{t("Tamil Nadu")}</span>
            </div>
            {order.city && (
              <div className="simple-receipt-cust-row">
                <span className="simple-receipt-cust-label">{t("City:")}</span>
                <span className="simple-receipt-cust-val">{t(order.city)}</span>
              </div>
            )}
            <div className="simple-receipt-cust-row">
              <span className="simple-receipt-cust-label">{t("Address:")}</span>
              <span className="simple-receipt-cust-val">{order.deliveryAddress}</span>
            </div>
          </div>

          <hr className="simple-receipt-divider" />

          {/* Products Ordered */}
          <div className="simple-receipt-section-heading">{t("Items Ordered")}</div>
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
              <span>{t("Sub Total")}</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>

            <div className="simple-summary-row">
              <span>{t("Packing Charges")}</span>
              <span>₹ {Number(order.packingCharges || 50)}</span>
            </div>

            {order.roundOff !== undefined && (
              <div className="simple-summary-row">
                <span>{t("Round OFF")}</span>
                <span>{formatPrice(order.roundOff || 0)}</span>
              </div>
            )}

            <div className="simple-summary-row overall">
              <span>{t("Overall Amount")}</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Action Buttons: WhatsApp (Green), Download PDF, & Continue Shopping (Red) */}
          <div className="simple-receipt-actions no-print">
            <button
              type="button"
              className="simple-btn-whatsapp-confirm"
              onClick={handleSendWhatsApp}
              title={t("Send WhatsApp Confirmation")}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>{t("Send WhatsApp Confirmation")}</span>
            </button>

            {/* Download Receipt PDF button */}
            <button
              type="button"
              className="simple-btn-receipt-download"
              onClick={handleDownloadPDF}
              title={t("Download Receipt PDF")}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>{t("Download Receipt PDF")}</span>
            </button>

            <p className="receipt-payment-pending-note no-print">
              {t("Tap Send WhatsApp Confirmation to share your order with us directly. You can also download the receipt PDF anytime.")}
            </p>

            <button
              type="button"
              className="simple-btn-receipt-continue"
              onClick={onNavigateHome}
            >
              {t("Continue Shopping")}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
