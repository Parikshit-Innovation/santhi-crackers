import React from "react";
import "./DeepaHero.css";

interface DeepaHeroProps {
  onShopNow: () => void;
  onViewOffers: () => void;
}

export const DeepaHero: React.FC<DeepaHeroProps> = ({ onShopNow, onViewOffers }) => {
  return (
    <section className="deepa-hero-section">
      <div className="deepa-hero-container">
        {/* Left Column: Text Content */}
        <div className="deepa-hero-left">
          <span className="deepa-eyebrow">CELEBRATE A BRIGHTER TOGETHER</span>
          <h1 className="deepa-hero-title">
            Make This Diwali
            <br />
            <span className="deepa-title-gold">Truly Special</span>
          </h1>
          <p className="deepa-hero-desc">
            Premium quality crackers, safe celebrations and unforgettable moments with your loved
            ones.
          </p>

          <div className="deepa-hero-buttons">
            <button className="deepa-btn-primary" onClick={onShopNow}>
              <span>Shop Now</span>
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
                <polyline points="12 5 19 12 12 19" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="deepa-btn-secondary" onClick={onViewOffers}>
              View Offers
            </button>
          </div>
        </div>

        {/* Right Column: 100% Pure React 3D Luxury Packaging Showcase */}
        <div className="deepa-hero-right">
          <div className="deepa-stage-showcase">
            {/* Soft Foliage / Branch Shadows in Background */}
            <svg className="deepa-foliage-shadow" viewBox="0 0 400 400" fill="none">
              <path
                d="M320 20 C280 80, 310 140, 240 200 C170 260, 200 320, 140 380"
                stroke="rgba(0, 0, 0, 0.05)"
                strokeWidth="18"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M270 120 C220 150, 190 200, 150 220"
                stroke="rgba(0, 0, 0, 0.04)"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M330 180 C370 220, 340 260, 310 300"
                stroke="rgba(0, 0, 0, 0.04)"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Pedestal Base Plinth */}
            <div className="deepa-pedestal-plinth"></div>

            {/* 3 Luxury Packaging Boxes */}
            <div className="deepa-boxes-row">
              {/* Box 1: SPARKLERS (Tall slender box) */}
              <div className="deepa-pack-box box-sparklers">
                <div className="deepa-box-ivory">
                  <div className="deepa-box-sunburst">
                    <svg viewBox="0 0 48 48" width="34" height="34" fill="none">
                      <circle cx="24" cy="24" r="2" fill="#c38b55" />
                      {[
                        0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270,
                        292.5, 315, 337.5,
                      ].map((deg, i) => (
                        <line
                          key={i}
                          x1={24 + Math.cos((deg * Math.PI) / 180) * 6}
                          y1={24 + Math.sin((deg * Math.PI) / 180) * 6}
                          x2={24 + Math.cos((deg * Math.PI) / 180) * (i % 2 === 0 ? 16 : 11)}
                          y2={24 + Math.sin((deg * Math.PI) / 180) * (i % 2 === 0 ? 16 : 11)}
                          stroke="#c38b55"
                          strokeWidth={i % 2 === 0 ? "1.5" : "1"}
                          strokeLinecap="round"
                        />
                      ))}
                    </svg>
                  </div>
                  <h3 className="deepa-box-title">SPARKLERS</h3>
                  <div className="deepa-box-subtitle">
                    <span>BRIGHTER</span>
                    <span>SAFER</span>
                    <span>HAPPIER DIWALI</span>
                  </div>
                </div>
                <div className="deepa-box-kraft"></div>
              </div>

              {/* Box 2: FLOWER POTS (Medium center box) */}
              <div className="deepa-pack-box box-flowerpots">
                <div className="deepa-box-ivory">
                  <div className="deepa-box-sunburst">
                    <svg viewBox="0 0 48 48" width="30" height="30" fill="none">
                      <circle cx="24" cy="24" r="2" fill="#c38b55" />
                      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
                        <line
                          key={i}
                          x1={24 + Math.cos((deg * Math.PI) / 180) * 6}
                          y1={24 + Math.sin((deg * Math.PI) / 180) * 6}
                          x2={24 + Math.cos((deg * Math.PI) / 180) * (i % 2 === 0 ? 15 : 10)}
                          y2={24 + Math.sin((deg * Math.PI) / 180) * (i % 2 === 0 ? 15 : 10)}
                          stroke="#c38b55"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                        />
                      ))}
                    </svg>
                  </div>
                  <h3 className="deepa-box-title">FLOWER POTS</h3>
                  <div className="deepa-box-subtitle">
                    <span>BRIGHTER</span>
                    <span>SAFER</span>
                    <span>HAPPIER DIWALI</span>
                  </div>
                </div>
                <div className="deepa-box-kraft"></div>
              </div>

              {/* Box 3: SKY SHOTS (Wide prominent box) */}
              <div className="deepa-pack-box box-skyshots">
                <div className="deepa-box-ivory">
                  <div className="deepa-box-sunburst">
                    <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
                      <circle cx="24" cy="24" r="2.2" fill="#c38b55" />
                      {[
                        0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270,
                        292.5, 315, 337.5,
                      ].map((deg, i) => (
                        <line
                          key={i}
                          x1={24 + Math.cos((deg * Math.PI) / 180) * 6}
                          y1={24 + Math.sin((deg * Math.PI) / 180) * 6}
                          x2={24 + Math.cos((deg * Math.PI) / 180) * (i % 2 === 0 ? 17 : 12)}
                          y2={24 + Math.sin((deg * Math.PI) / 180) * (i % 2 === 0 ? 17 : 12)}
                          stroke="#c38b55"
                          strokeWidth={i % 2 === 0 ? "1.5" : "1"}
                          strokeLinecap="round"
                        />
                      ))}
                    </svg>
                  </div>
                  <h3 className="deepa-box-title">SKY SHOTS</h3>
                  <div className="deepa-box-subtitle">
                    <span>BRIGHTER</span>
                    <span>SAFER</span>
                    <span>HAPPIER DIWALI</span>
                  </div>
                </div>
                <div className="deepa-box-kraft"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
