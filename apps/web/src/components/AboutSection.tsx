import React from "react";
import "./AboutSection.css";
import { useLanguage } from "../context/LanguageContext";

interface AboutSectionProps {
  onExploreProducts?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onExploreProducts }) => {
  const { t } = useLanguage();

  return (
    <div className="about-page-wrapper">
      {/* 1. Hero Section: ABOUT US */}
      <section className="about-hero-section">
        <div className="about-hero-container">
          <div className="about-hero-text">
            <span className="about-eyebrow">{t("About us")}</span>
            <h1 className="about-hero-title">
              {t("Making Festive Moments Unforgettable")}
            </h1>
            <p className="about-hero-desc">
              {t(
                "Celebrate the festival of lights with Shanthi Crackers. We are dedicated to bringing families together through joyful traditions, quality products, and a memorable festive shopping experience.",
              )}
            </p>
            <button type="button" className="about-btn-copper" onClick={onExploreProducts}>
              <span>{t("Shop Now")}</span>
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          <div className="about-hero-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80"
              alt={t("Happy Indian family celebrating Diwali with sparklers")}
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
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="about-trust-info">
              <h4 className="about-trust-title">{t("100% Genuine Products")}</h4>
              <p className="about-trust-sub">{t("Trusted brands and certified crackers")}</p>
            </div>
          </div>

          {/* Card 2: Delivery */}
          <div className="about-trust-card">
            <div className="about-trust-icon-box">
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div className="about-trust-info">
              <h4 className="about-trust-title">{t("Fast & Safe Delivery")}</h4>
              <p className="about-trust-sub">{t("Across Tamil Nadu")}</p>
            </div>
          </div>

          {/* Card 3: Offers */}
          <div className="about-trust-card">
            <div className="about-trust-icon-box">
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
            </div>
            <div className="about-trust-info">
              <h4 className="about-trust-title">{t("Best Festive Offers")}</h4>
              <p className="about-trust-sub">{t("Great deals this season")}</p>
            </div>
          </div>

          {/* Card 4: Locations */}
          <div className="about-trust-card">
            <div className="about-trust-icon-box">
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="about-trust-info">
              <h4 className="about-trust-title">{t("Multiple Store Locations")}</h4>
              <p className="about-trust-sub">{t("Find the nearest store")}</p>
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
            <span className="about-eyebrow">{t("Our story")}</span>
            <h2 className="about-section-heading">
              {t("Where Tradition Meets Celebration")}
            </h2>
            <p className="about-story-p">
              {t(
                "At Shanthi Crackers, our journey began with a simple vision - to bring joy to every Diwali celebration across Tamil Nadu. We are committed to quality products, great value, and a delightful festive shopping experience for every family.",
              )}
            </p>
            <p className="about-story-p">
              {t(
                "We carefully source products from licensed manufacturers and ensure quality, safety and the best prices for your celebrations.",
              )}
            </p>
            <button type="button" className="about-btn-outline" onClick={onExploreProducts}>
              <span>{t("Our Products")}</span>
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
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
            <span className="about-eyebrow">{t("Why choose us")}</span>
            <h2 className="about-why-title">{t("Why Customers Trust Us")}</h2>
          </div>

          <div className="about-why-grid">
            {/* Feature 1 */}
            <div className="about-why-card">
              <div className="about-why-icon-circle">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                >
                  <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
                </svg>
              </div>
              <h4 className="about-why-name">{t("Quality Products")}</h4>
              <p className="about-why-desc">{t("Genuine and certified crackers")}</p>
            </div>

            {/* Feature 2 */}
            <div className="about-why-card">
              <div className="about-why-icon-circle">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                >
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <h4 className="about-why-name">{t("Safe Delivery")}</h4>
              <p className="about-why-desc">{t("Secure packaging and on-time delivery")}</p>
            </div>

            {/* Feature 3 */}
            <div className="about-why-card">
              <div className="about-why-icon-circle">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                >
                  <line x1="19" y1="5" x2="5" y2="19" />
                  <circle cx="6.5" cy="6.5" r="2.5" />
                  <circle cx="17.5" cy="17.5" r="2.5" />
                </svg>
              </div>
              <h4 className="about-why-name">{t("Festive Offers")}</h4>
              <p className="about-why-desc">{t("Best prices and combo packs")}</p>
            </div>

            {/* Feature 4 */}
            <div className="about-why-card">
              <div className="about-why-icon-circle">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h4 className="about-why-name">{t("Happy Customers")}</h4>
              <p className="about-why-desc">{t("Thousands of satisfied families")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. OUR MISSION Section */}
      <section className="about-mission-section">
        <div className="about-mission-container">
          <div className="about-mission-text">
            <span className="about-eyebrow">{t("Our mission")}</span>
            <h2 className="about-section-heading">
              {t("A Brighter Diwali for Every Home")}
            </h2>
            <p className="about-mission-desc">
              {t(
                "We believe every celebration should be filled with joy and togetherness. Our mission is to offer quality products and encourage responsible celebrations, making every festive moment more memorable for families.",
              )}
            </p>
            <button type="button" className="about-btn-copper" onClick={onExploreProducts}>
              <span>{t("Shop Combo Packs")}</span>
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          <div className="about-mission-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=1200&q=80"
              alt={t("Hands holding sparkling golden sparklers against night sky")}
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
            <span className="about-eyebrow">{t("Fireworks safety guide")}</span>
            <h2 className="about-section-heading">
              {t("Do's & Don'ts While Handling Crackers")}
            </h2>
            <p className="about-safety-subtitle">
              {t(
                "Celebrate this Diwali with joy and peace of mind by following these four essential safety guidelines.",
              )}
            </p>
          </div>

          {/* Clean Safety Comparison Matrix (Pure White, Neutral Format) */}
          <div className="about-safety-matrix">
            <div className="about-safety-matrix-header">
              <div className="about-matrix-col-title about-col-topic">
                {t("SAFETY MEASURE")}
              </div>
              <div className="about-matrix-col-title about-col-do">
                <span className="about-matrix-tag tag-do">{t("DO'S")}</span>
                <span>{t("Recommended Practice")}</span>
              </div>
              <div className="about-matrix-col-title about-col-dont">
                <span className="about-matrix-tag tag-dont">{t("DON'TS")}</span>
                <span>{t("Strictly Avoid")}</span>
              </div>
            </div>

            <div className="about-safety-matrix-body">
              {/* Row 1 */}
              <div className="about-safety-row">
                <div className="about-safety-row-topic">
                  <span className="about-topic-num">01</span>
                  <span className="about-topic-name">{t("Location & Space")}</span>
                </div>
                <div className="about-safety-cell cell-do">
                  <span className="about-cell-label label-do">{t("✓ DO")}</span>
                  <p>
                    <strong>{t("Burst in open grounds:")}</strong>
                    {t(
                      " Light crackers in an open area, away from vehicles, wires, and trees.",
                    )}
                  </p>
                </div>
                <div className="about-safety-cell cell-dont">
                  <span className="about-cell-label label-dont">{t("✕ DON'T")}</span>
                  <p>
                    <strong>{t("Never use enclosed spaces:")}</strong>
                    {t(
                      " Never burst crackers inside bottles, cans, or closed containers. ",
                    )}
                  </p>
                </div>
              </div>

              {/* Row 2 */}
              <div className="about-safety-row">
                <div className="about-safety-row-topic">
                  <span className="about-topic-num">02</span>
                  <span className="about-topic-name">{t("Attire & Hair")}</span>
                </div>
                <div className="about-safety-cell cell-do">
                  <span className="about-cell-label label-do">{t("✓ DO")}</span>
                  <p>
                    <strong>{t("Wear fitted cotton clothes:")}</strong>
                    {t(
                      " Wear fitted cotton clothes and closed shoes. Tie back long hair before lighting fireworks.",
                    )}
                  </p>
                </div>
                <div className="about-safety-cell cell-dont">
                  <span className="about-cell-label label-dont">{t("✕ DON'T")}</span>
                  <p>
                    <strong>{t("Avoid loose synthetic fabrics:")}</strong>
                    {t(
                      " Avoid flowing dupattas, loose sarees, or synthetic materials like nylon and polyester that catch fire rapidly.",
                    )}
                  </p>
                </div>
              </div>

              {/* Row 3 */}
              <div className="about-safety-row">
                <div className="about-safety-row-topic">
                  <span className="about-topic-num">03</span>
                  <span className="about-topic-name">{t("Emergency Readiness")}</span>
                </div>
                <div className="about-safety-cell cell-do">
                  <span className="about-cell-label label-do">{t("✓ DO")}</span>
                  <p>
                    <strong>{t("Keep water & sand nearby:")}</strong>
                    {t(
                      " Always keep two buckets of water and sand ready at hand for instant emergency response and burnt sparkler disposal.",
                    )}
                  </p>
                </div>
                <div className="about-safety-cell cell-dont">
                  <span className="about-cell-label label-dont">{t("✕ DON'T")}</span>
                  <p>
                    <strong>{t("Never relight failed crackers:")}</strong>
                    {t(
                      " If a firecracker does not burst, do not lean over it. Wait 15 minutes, then soak it thoroughly in a water bucket.",
                    )}
                  </p>
                </div>
              </div>

              {/* Row 4 */}
              <div className="about-safety-row">
                <div className="about-safety-row-topic">
                  <span className="about-topic-num">04</span>
                  <span className="about-topic-name">{t("Lighting & Distance")}</span>
                </div>
                <div className="about-safety-cell cell-do">
                  <span className="about-cell-label label-do">{t("✓ DO")}</span>
                  <p>
                    <strong>{t("Light at arm's length:")}</strong>
                    {t(
                      " Use a long incense stick (agarbatti) or sparkler to light fireworks at arm's length, then immediately retreat to a safe distance.",
                    )}
                  </p>
                </div>
                <div className="about-safety-cell cell-dont">
                  <span className="about-cell-label label-dont">{t("✕ DON'T")}</span>
                  <p>
                    <strong>{t("Never hold crackers in hand:")}</strong>
                    {t(
                      " Never ignite crackers while holding them in your hands or attempt to throw ignited fireworks towards roads, animals, or people.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
