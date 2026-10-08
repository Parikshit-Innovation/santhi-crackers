import React from "react";
import "./StoreFooter.css";

interface StoreFooterProps {
  onNavigate?: (page: string) => void;
  onCategorySelect?: (category: string) => void;
}

export const StoreFooter: React.FC<StoreFooterProps> = ({
  onNavigate,
  onCategorySelect,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLinkClick = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
    scrollToTop();
  };

  const handleCategoryClick = (cat: string) => {
    if (onNavigate) {
      onNavigate("home");
    }
    if (onCategorySelect) {
      onCategorySelect(cat);
    }
    setTimeout(() => {
      const table = document.querySelector(".combo-table-wrapper");
      if (table) {
        table.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <footer className="store-footer">
      {/* Main Footer Content */}
      <div className="store-footer-main">
        <div className="store-footer-container">
          <div className="store-footer-grid">
            {/* Col 1: Brand & Bio */}
            <div className="store-footer-col store-footer-brand-col">
              <h3 className="store-footer-brand-name">Elephant Crackers SR Traders</h3>
              <p className="store-footer-brand-desc">
                Your premier Sivakasi fireworks wholesale depot. Dedicated to bringing vibrant lights,
                unforgettable joy, and certified safe festive celebrations to homes across India.
              </p>
              <div className="store-footer-badge">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>Direct Sivakasi Hub • Est. Quality</span>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="store-footer-col">
              <h4 className="store-footer-col-title">Navigation</h4>
              <ul className="store-footer-links">
                <li>
                  <button type="button" onClick={() => handleLinkClick("home")}>
                    Home
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleLinkClick("about")}>
                    About Us
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleLinkClick("home")}>
                    Explore Crackers
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleLinkClick("contact")}>
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Crackers Categories */}
            <div className="store-footer-col">
              <h4 className="store-footer-col-title">Crackers Categories</h4>
              <ul className="store-footer-links">
                <li>
                  <button type="button" onClick={() => handleCategoryClick("sparklers")}>
                    Sparklers & Crackers
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleCategoryClick("chakkars")}>
                    Ground Chakkars
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleCategoryClick("flowerpots")}>
                    Flower Pots & Fountains
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleCategoryClick("rockets")}>
                    Rockets & Sky Shots
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleCategoryClick("giftbox")}>
                    Special Combo Gift Boxes
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Store Contact & Location */}
            <div className="store-footer-col store-footer-contact-col">
              <h4 className="store-footer-col-title">Store & Depot</h4>
              <address className="store-footer-address">
                3/1322/3/1, Opposite to SNM Matriculation School,<br />
                Checkpost, Parapatti, Sivakasi,<br />
                Tamil Nadu 626 189
              </address>

              <div className="store-footer-contact-actions">
                <div className="store-footer-phones">
                  <a href="tel:+918072011455" className="store-footer-phone-pill">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    +91 80720 11455
                  </a>
                  <a href="tel:+919345189265" className="store-footer-phone-pill">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    +91 93451 89265
                  </a>
                </div>

                <a
                  href="https://wa.me/919345189265?text=Hello%20Elephant%20Crackers%20SR%20Traders,%20I%20would%20like%20to%20order%20crackers."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-footer-whatsapp-btn"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>Chat on WhatsApp</span>
                </a>

                <a
                  href="mailto:sronlinecrackers@gmail.com"
                  className="store-footer-email-link"
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>sronlinecrackers@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal & Copyright Bar */}
      <div className="store-footer-bottom">
        <div className="store-footer-bottom-container">
          <div className="store-footer-copy">
            © {new Date().getFullYear()} Elephant Crackers SR Traders. All rights reserved.
          </div>
          <div className="store-footer-notice">
            Green Crackers Certified • Direct Sivakasi Wholesale
          </div>
          <button
            type="button"
            className="store-footer-back-to-top"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
};
