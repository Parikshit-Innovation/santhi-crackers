import React, { useState } from "react";
import "./ContactSection.css";
import { useLanguage } from "../context/LanguageContext";

interface ContactSectionProps {
  onNavigateHome?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onNavigateHome }) => {
  const { t } = useLanguage();
  const [mobileNumber, setMobileNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showFaq, setShowFaq] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileNumber: mobileNumber.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit query.");
      }

      setSubmitted(true);
      setMobileNumber("");
      setMessage("");
    } catch (err: unknown) {
      console.error("Failed to submit customer query:", err);
      const errText = err instanceof Error ? err.message : String(err);
      setErrorMessage(
        errText || t("Failed to send message. Please try again or reach out on WhatsApp."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page-wrapper">
      <div className="contact-page-container">
        {/* Breadcrumb Navigation */}
        <nav className="contact-breadcrumb" aria-label={t("Breadcrumb")}>
          <button type="button" className="contact-breadcrumb-link" onClick={onNavigateHome}>
            {t("Home")}
          </button>
          <span className="contact-breadcrumb-separator">/</span>
          <span className="contact-breadcrumb-current">{t("Contact Us")}</span>
        </nav>

        {/* Heading & Subtitle */}
        <h1 className="contact-heading">{t("Contact Us")}</h1>
        <p className="contact-subtitle">
          {t(
            "Have a question or just want to say hello? Send us a message and we'll get back to you as soon as we can.",
          )}
        </p>

        {/* Form */}
        <form className="contact-form" onSubmit={handleSubmit}>
          {submitted && (
            <div className="contact-success-banner">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{t("Thank you! Your message has been sent. We'll get back to you shortly.")}</span>
            </div>
          )}

          {errorMessage && (
            <div className="contact-error-banner">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Mobile Number Field */}
          <div className="contact-field-group">
            <label htmlFor="contact-mobile" className="contact-label">
              {t("Mobile Number")}
            </label>
            <input
              id="contact-mobile"
              type="tel"
              required
              className="contact-input"
              placeholder={t("Your mobile number") || "e.g. 98652 40462"}
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
            />
          </div>

          {/* Message Field */}
          <div className="contact-field-group">
            <label htmlFor="contact-message" className="contact-label">
              {t("Message")}
            </label>
            <textarea
              id="contact-message"
              required
              rows={7}
              className="contact-textarea"
              placeholder={t("How can we help?")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Send Message Button */}
          <div className="contact-action-wrap">
            <button type="submit" className="contact-submit-btn" disabled={isSubmitting}>
              <span>{isSubmitting ? t("Sending...") : t("Send message")}</span>
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="contact-arrow-icon"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </form>

        {/* Store Information Section */}
        <section className="contact-details-section">
          <div className="contact-details-header">
            <div className="contact-details-badge">{t("Official Store & Depot")}</div>
            <h2 className="contact-store-name">{t("Santhi Sivakasi Crackers")}</h2>
            <p className="contact-store-desc">
              {t(
                "Visit our Sivakasi wholesale store or reach out via phone, WhatsApp, and email for bulk inquiries & orders.",
              )}
            </p>
          </div>

          <div className="contact-info-grid">
            {/* 1. Store Addresses & Branches Card */}
            <div className="contact-info-card contact-card-branches">
              <div className="contact-card-header">
                <div className="contact-info-icon-wrap">
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="contact-card-title-group">
                  <h3 className="contact-info-title">{t("Store Address")}</h3>
                  <p className="contact-info-sub">
                    {t("We have two branches in Gobichettipalayam:")}
                  </p>
                </div>
              </div>

              <div className="contact-branches-list">
                <div className="contact-branch-box">
                  <span className="contact-branch-badge">{t("Branch 1")}</span>
                  <p className="contact-branch-text">
                    {t("15A, College Division, Karattupalyam, Gobichettipalayam.")}
                  </p>
                </div>

                <div className="contact-branch-box">
                  <span className="contact-branch-badge">{t("Branch 2")}</span>
                  <p className="contact-branch-text">
                    {t("1/1, Kalingiyam Main Road, Kalingiyam, Gobichettipalayam.")}
                  </p>
                </div>
              </div>

              <a
                href="https://maps.google.com/?q=1/1,+Kalingiyam+Main+Road,+Kalingiyam,+Gobichettipalayam"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-map-link"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{t("View on Google Maps")}</span>
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            </div>

            {/* 2. Phone, WhatsApp & Email Inquiries Card */}
            <div className="contact-info-card contact-card-direct">
              <div className="contact-card-header">
                <div className="contact-info-icon-wrap contact-icon-phone">
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="contact-card-title-group">
                  <h3 className="contact-info-title">{t("Phone & Orders")}</h3>
                  <p className="contact-info-sub">
                    {t("Tap below to call our store representatives directly:")}
                  </p>
                </div>
              </div>

              {/* Direct WhatsApp Action Button */}
              <a
                href="https://wa.me/917373292931?text=%E0%AE%B5%E0%AE%A3%E0%AE%95%E0%AF%8D%E0%AE%95%E0%AE%AE%E0%AF%8D!%20%E0%AE%A8%E0%AE%BE%E0%AE%99%E0%AF%8D%E0%AE%95%E0%AE%B3%E0%AF%8D%20%E0%AE%89%E0%AE%99%E0%AF%8D%E0%AE%95%E0%AE%B3%E0%AE%BF%E0%AE%9F%E0%AE%AE%E0%AF%8D%20%E0%AE%AA%E0%AE%9F%E0%AF%8D%E0%AE%9F%E0%AE%BE%E0%AE%9A%E0%AF%81%E0%AE%95%E0%AE%B3%E0%AF%8D%20%E0%AE%B5%E0%AE%BE%E0%AE%99%E0%AF%8D%E0%AE%95%20%E0%AE%B5%E0%AE%BF%E0%AE%B0%E0%AF%81%E0%AE%AE%E0%AF%8D%E0%AE%AA%E0%AF%81%E0%AE%95%E0%AE%BF%E0%AE%B1%E0%AF%8B%E0%AE%AE%E0%AF%8D."
                target="_blank"
                rel="noopener noreferrer"
                className="contact-whatsapp-btn"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="currentColor"
                  className="contact-whatsapp-icon"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="contact-whatsapp-text">
                  {t("Instant WhatsApp Chat")}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  className="contact-whatsapp-arrow"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>

              {/* 2x2 Phone Numbers Grid */}
              <div className="contact-phone-grid">
                <a href="tel:+917373292931" className="contact-phone-pill contact-phone-primary">
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>+91 73732 92931</span>
                </a>
                <a href="tel:+919865240462" className="contact-phone-pill">
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>+91 98652 40462</span>
                </a>
                <a href="tel:+919486688699" className="contact-phone-pill">
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>+91 94866 88699</span>
                </a>
                <a href="tel:+919865240095" className="contact-phone-pill">
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>+91 98652 40095</span>
                </a>
              </div>

              {/* Email Inquiry Link */}
              <a
                href="mailto:shanthicracker@gmail.com"
                className="contact-email-badge"
                title="shanthicracker@gmail.com"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="contact-email-icon"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span className="contact-email-text">shanthicracker@gmail.com</span>
              </a>
            </div>
          </div>
        </section>

        {/* FAQ helper note */}
        <div className="contact-faq-note">
          {t("Looking for a quick answer? Check our")}{" "}
          <button type="button" className="contact-faq-link" onClick={() => setShowFaq(!showFaq)}>
            {t("frequently asked questions")}
          </button>
          .
        </div>

        {/* Expandable FAQs */}
        {showFaq && (
          <div className="contact-faq-accordion">
            <div className="contact-faq-item">
              <h4 className="contact-faq-q">
                {t("Where is Santhi Crackers located?")}
              </h4>
              <p className="contact-faq-a">
                {t("We have two branches in Gobichettipalayam:")}
                <br />
                • <strong>{t("Branch 1")}:</strong> {t("15A, College Division, Karattupalyam, Gobichettipalayam.")}
                <br />
                • <strong>{t("Branch 2")}:</strong> {t("1/1, Kalingiyam Main Road, Kalingiyam, Gobichettipalayam.")}
              </p>
            </div>
            <div className="contact-faq-item">
              <h4 className="contact-faq-q">
                {t("When will my Diwali order be dispatched?")}
              </h4>
              <p className="contact-faq-a">
                {t(
                  "Orders are dispatched within 24 to 48 hours directly from our Sivakasi hub via dedicated transport.",
                )}
              </p>
            </div>
            <div className="contact-faq-item">
              <h4 className="contact-faq-q">
                {t("Are all crackers 100% genuine and certified?")}
              </h4>
              <p className="contact-faq-a">
                {t(
                  "Yes, all products comply with PESO safety norms and are sourced directly from premier Sivakasi manufacturers.",
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
