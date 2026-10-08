import React from "react";
import "./AboutSection.css";

interface AboutSectionProps {
  onExploreProducts?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onExploreProducts }) => {
  return (
    <div className="about-page-wrapper">
      {/* 1. Hero Section: ABOUT US */}
      <section className="about-hero-section">
        <div className="about-hero-container">
          <div className="about-hero-text">
            <span className="about-eyebrow">ABOUT US</span>
            <h1 className="about-hero-title">
              Bringing Brighter Celebrations to Every Home
            </h1>
            <p className="about-hero-desc">
              We are a trusted Diwali crackers store committed to providing
              high-quality, safe and certified fireworks. With years of experience,
              we aim to make your celebrations brighter and safer.
            </p>
            <button
              type="button"
              className="about-btn-copper"
              onClick={onExploreProducts}
            >
              <span>Shop Now</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          <div className="about-hero-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80"
              alt="Happy Indian family celebrating Diwali with sparklers"
              className="about-rounded-image"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* 2. Value Props / Trust Highlights Bar */}
      <section className="about-trust-bar-section">
        <div className="about-trust-bar-container">
          {/* Card 1: Genuine */}
          <div className="about-trust-card">
            <div className="about-trust-icon-box">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="about-trust-info">
              <h4 className="about-trust-title">100% Genuine Products</h4>
              <p className="about-trust-sub">Trusted brands and certified crackers</p>
            </div>
          </div>

          {/* Card 2: Delivery */}
          <div className="about-trust-card">
            <div className="about-trust-icon-box">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div className="about-trust-info">
              <h4 className="about-trust-title">Fast &amp; Safe Delivery</h4>
              <p className="about-trust-sub">Across Tamil Nadu &amp; India</p>
            </div>
          </div>

          {/* Card 3: Offers */}
          <div className="about-trust-card">
            <div className="about-trust-icon-box">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
            </div>
            <div className="about-trust-info">
              <h4 className="about-trust-title">Best Festive Offers</h4>
              <p className="about-trust-sub">Great deals this season</p>
            </div>
          </div>

          {/* Card 4: Locations */}
          <div className="about-trust-card">
            <div className="about-trust-icon-box">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="about-trust-info">
              <h4 className="about-trust-title">Multiple Store Locations</h4>
              <p className="about-trust-sub">Find the nearest store</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR STORY Section */}
      <section className="about-story-section">
        <div className="about-story-container">
          <div className="about-story-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80"
              alt="Diwali crackers special gift packaging and traditional diyas"
              className="about-rounded-image"
              loading="lazy"
            />
          </div>

          <div className="about-story-text">
            <span className="about-eyebrow">OUR STORY</span>
            <h2 className="about-section-heading">
              A Tradition of Trust and Happiness
            </h2>
            <p className="about-story-p">
              Started with a simple vision — to make Diwali celebrations
              happier, safer and more affordable for every family. Over the years,
              we have grown into a leading crackers store, serving thousands of happy
              customers across Tamil Nadu and beyond.
            </p>
            <p className="about-story-p">
              We carefully source products from licensed manufacturers and ensure
              quality, safety and the best prices for your celebrations.
            </p>
            <button
              type="button"
              className="about-btn-outline"
              onClick={onExploreProducts}
            >
              <span>Our Products</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US Section */}
      <section className="about-why-section">
        <div className="about-why-container">
          <div className="about-why-left">
            <span className="about-eyebrow">WHY CHOOSE US</span>
            <h2 className="about-why-title">Why Customers Trust Us</h2>
          </div>

          <div className="about-why-grid">
            {/* Feature 1 */}
            <div className="about-why-card">
              <div className="about-why-icon-circle">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
                </svg>
              </div>
              <h4 className="about-why-name">Quality Products</h4>
              <p className="about-why-desc">Genuine and certified crackers</p>
            </div>

            {/* Feature 2 */}
            <div className="about-why-card">
              <div className="about-why-icon-circle">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <h4 className="about-why-name">Safe Delivery</h4>
              <p className="about-why-desc">Secure packaging and on-time delivery</p>
            </div>

            {/* Feature 3 */}
            <div className="about-why-card">
              <div className="about-why-icon-circle">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <line x1="19" y1="5" x2="5" y2="19" />
                  <circle cx="6.5" cy="6.5" r="2.5" />
                  <circle cx="17.5" cy="17.5" r="2.5" />
                </svg>
              </div>
              <h4 className="about-why-name">Festive Offers</h4>
              <p className="about-why-desc">Best prices and combo packs</p>
            </div>

            {/* Feature 4 */}
            <div className="about-why-card">
              <div className="about-why-icon-circle">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h4 className="about-why-name">Happy Customers</h4>
              <p className="about-why-desc">Thousands of satisfied families</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. OUR MISSION Section */}
      <section className="about-mission-section">
        <div className="about-mission-container">
          <div className="about-mission-text">
            <span className="about-eyebrow">OUR MISSION</span>
            <h2 className="about-section-heading">
              To Make Every Diwali Brighter and Safer
            </h2>
            <p className="about-mission-desc">
              We believe celebrations should bring happiness, not worry.
              Our mission is to provide safe, high-quality and eco-friendly fireworks
              so that every family can celebrate with joy.
            </p>
            <button
              type="button"
              className="about-btn-copper"
              onClick={onExploreProducts}
            >
              <span>Shop Combo Packs</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          <div className="about-mission-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=1200&q=80"
              alt="Hands holding sparkling golden sparklers against night sky"
              className="about-rounded-image"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* 6. DOS AND DON'TS SAFETY GUIDE */}
      <section className="about-safety-section">
        <div className="about-safety-container">
          <div className="about-safety-header">
            <span className="about-eyebrow">FIREWORKS SAFETY GUIDE</span>
            <h2 className="about-section-heading">
              Dos & Don'ts While Handling Crackers
            </h2>
            <p className="about-safety-subtitle">
              Celebrate this Diwali with sparkling joy and complete peace of mind.
              Please follow these 4 essential safety guidelines.
            </p>
          </div>

          <div className="about-safety-grid">
            {/* DO's Column */}
            <div className="about-safety-card about-safety-card-dos">
              <div className="about-safety-card-header">
                <div className="about-safety-badge about-badge-dos">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>DO'S</span>
                </div>
                <h3 className="about-safety-card-title">Recommended Safety Measures</h3>
              </div>

              <ul className="about-safety-list">
                <li className="about-safety-item">
                  <div className="about-safety-icon-wrap about-icon-do">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="about-safety-item-text">
                    <strong>Ignite in open spaces:</strong>
                    <span> Always burst crackers in an open ground or open terrace, clear of vehicles, electrical wires, and dry trees.</span>
                  </div>
                </li>

                <li className="about-safety-item">
                  <div className="about-safety-icon-wrap about-icon-do">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="about-safety-item-text">
                    <strong>Wear fitted cotton clothes:</strong>
                    <span> Wear snug-fitting pure cotton clothing and closed footwear. Tie long hair back securely before lighting fireworks.</span>
                  </div>
                </li>

                <li className="about-safety-item">
                  <div className="about-safety-icon-wrap about-icon-do">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="about-safety-item-text">
                    <strong>Keep water & sand buckets ready:</strong>
                    <span> Always keep two buckets of water and sand nearby for instant emergency response and safe disposal of burnt sparklers.</span>
                  </div>
                </li>

                <li className="about-safety-item">
                  <div className="about-safety-icon-wrap about-icon-do">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="about-safety-item-text">
                    <strong>Light from an arm's length:</strong>
                    <span> Use a long incense stick (agarbatti) or sparkler to light fireworks at arm's length, then immediately retreat to a safe distance.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* DON'TS Column */}
            <div className="about-safety-card about-safety-card-donts">
              <div className="about-safety-card-header">
                <div className="about-safety-badge about-badge-donts">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span>DON'TS</span>
                </div>
                <h3 className="about-safety-card-title">Practices to Strictly Avoid</h3>
              </div>

              <ul className="about-safety-list">
                <li className="about-safety-item">
                  <div className="about-safety-icon-wrap about-icon-dont">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                  <div className="about-safety-item-text">
                    <strong>Never hold crackers in hand:</strong>
                    <span> Never light crackers while holding them in your hands or attempt to throw ignited fireworks towards persons, roads, or animals.</span>
                  </div>
                </li>

                <li className="about-safety-item">
                  <div className="about-safety-icon-wrap about-icon-dont">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                  <div className="about-safety-item-text">
                    <strong>Never relight unexploded duds:</strong>
                    <span> If a firecracker does not burst, do not lean over or inspect it. Wait at least 15 minutes, then soak it thoroughly in a bucket of water.</span>
                  </div>
                </li>

                <li className="about-safety-item">
                  <div className="about-safety-icon-wrap about-icon-dont">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                  <div className="about-safety-item-text">
                    <strong>Avoid synthetic or loose clothes:</strong>
                    <span> Avoid loose dupattas, sarees, flowing kurtas, or synthetic fabrics like nylon, polyester, and silk that catch fire rapidly.</span>
                  </div>
                </li>

                <li className="about-safety-item">
                  <div className="about-safety-icon-wrap about-icon-dont">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                  <div className="about-safety-item-text">
                    <strong>Never ignite in enclosed containers:</strong>
                    <span> Never place crackers inside glass bottles, tin cans, or enclosed spaces. Exploding shrapnel can cause serious physical injuries.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
