import React, { useState } from "react";
import "./ContactSection.css";

interface ContactSectionProps {
  onNavigateHome?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onNavigateHome }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showFaq, setShowFaq] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setEmail("");
      setMessage("");
    }, 600);
  };

  return (
    <div className="contact-page-wrapper">
      <div className="contact-page-container">
        {/* Breadcrumb Navigation */}
        <nav className="contact-breadcrumb" aria-label="Breadcrumb">
          <button type="button" className="contact-breadcrumb-link" onClick={onNavigateHome}>
            Home
          </button>
          <span className="contact-breadcrumb-separator">/</span>
          <span className="contact-breadcrumb-current">Contact Us</span>
        </nav>

        {/* Heading & Subtitle */}
        <h1 className="contact-heading">Contact Us</h1>
        <p className="contact-subtitle">
          Have a question or just want to say hello? Send us a message and we'll get back to you as
          soon as we can.
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
              <span>Thank you! Your message has been sent. We'll get back to you shortly.</span>
            </div>
          )}

          {/* Email Field */}
          <div className="contact-field-group">
            <label htmlFor="contact-email" className="contact-label">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              required
              className="contact-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Message Field */}
          <div className="contact-field-group">
            <label htmlFor="contact-message" className="contact-label">
              Message
            </label>
            <textarea
              id="contact-message"
              required
              rows={7}
              className="contact-textarea"
              placeholder="How can we help?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Send Message Button */}
          <div className="contact-action-wrap">
            <button type="submit" className="contact-submit-btn" disabled={isSubmitting}>
              <span>{isSubmitting ? "Sending..." : "Send message"}</span>
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
            <div className="contact-details-badge">Official Store & Depot</div>
            <h2 className="contact-store-name">Santhi Sivakasi Crackers</h2>
            <p className="contact-store-desc">
              Visit our wholesale depots in Gobichettipalayam or reach out via phone, WhatsApp, and email for
              bulk inquiries & orders.
            </p>
          </div>

          <div className="contact-info-grid">
            {/* Address Card */}
            <div className="contact-info-card">
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
              <div className="contact-info-content">
                <h3 className="contact-info-title">Store Address</h3>
                <address className="contact-info-address">
                  <div style={{ marginBottom: "10px" }}>
                    <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
                      Branch 1
                    </div>
                    <div>15A, College Division, Karattupalyam, Gobichettipalayam.</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
                      Branch 2
                    </div>
                    <div>1/1, Kalingiyam Main Road, Kalingiyam, Gobichettipalayam.</div>
                  </div>
                </address>
                <a
                  href="https://maps.google.com/?q=1/1,+Kalingiyam+Main+Road,+Kalingiyam,+Gobichettipalayam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-map-link"
                >
                  <span>View on Google Maps</span>
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Phone & WhatsApp Card */}
            <div className="contact-info-card">
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
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div className="contact-info-content">
                <h3 className="contact-info-title">Phone & Orders</h3>
                <p className="contact-info-sub">
                  Tap below to call our store representatives directly:
                </p>
                <div className="contact-phone-list">
                  <div className="contact-phone-grid">
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
                      +91 98652 40462
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
                      +91 94866 88699
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
                      +91 98652 40095
                    </a>
                    <a href="tel:+917373292931" className="contact-phone-pill">
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
                      +91 73732 92931
                    </a>
                  </div>
                  <a
                    href="https://wa.me/919865240462?text=Hello%20Santhi%20Crackers,%20I%20would%20like%20to%20order%20crackers."
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
                    <span className="contact-whatsapp-text">Instant WhatsApp Chat</span>
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
                </div>
              </div>
            </div>

            {/* Email Card */}
            <div className="contact-info-card">
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
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className="contact-info-content">
                <h3 className="contact-info-title">Email Inquiries</h3>
                <p className="contact-info-sub">
                  Send us your product requirements or order queries:
                </p>
                <a
                  href="mailto:sronlinecrackers@gmail.com"
                  className="contact-email-badge"
                  title="sronlinecrackers@gmail.com"
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
                  <span className="contact-email-text">sronlinecrackers@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ helper note */}
        <div className="contact-faq-note">
          Looking for a quick answer? Check our{" "}
          <button type="button" className="contact-faq-link" onClick={() => setShowFaq(!showFaq)}>
            frequently asked questions
          </button>
          .
        </div>

        {/* Expandable FAQs */}
        {showFaq && (
          <div className="contact-faq-accordion">
            <div className="contact-faq-item">
              <h4 className="contact-faq-q">Where is Santhi Crackers located?</h4>
              <p className="contact-faq-a">
                We have two branches in Gobichettipalayam:
                <br />
                • <strong>Branch 1:</strong> 15A, College Division, Karattupalyam, Gobichettipalayam.
                <br />
                • <strong>Branch 2:</strong> 1/1, Kalingiyam Main Road, Kalingiyam, Gobichettipalayam.
              </p>
            </div>
            <div className="contact-faq-item">
              <h4 className="contact-faq-q">When will my Diwali order be dispatched?</h4>
              <p className="contact-faq-a">
                Orders are dispatched within 24 to 48 hours directly from our Sivakasi hub via
                dedicated transport.
              </p>
            </div>
            <div className="contact-faq-item">
              <h4 className="contact-faq-q">Are all crackers 100% genuine and certified?</h4>
              <p className="contact-faq-a">
                Yes, all products comply with PESO safety norms and are sourced directly from
                premier Sivakasi manufacturers.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
