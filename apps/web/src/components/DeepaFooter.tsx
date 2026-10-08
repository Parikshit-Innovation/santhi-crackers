import React from "react";
import "./DeepaFooter.css";

export const DeepaFooter: React.FC = () => {
  return (
    <footer className="deepa-footer">
      <div className="deepa-footer-container">
        <div className="deepa-footer-top">
          <div className="deepa-footer-brand-col">
            <div className="deepa-footer-logo">
              <svg viewBox="0 0 36 36" width="28" height="28" fill="none">
                <circle cx="18" cy="18" r="1.5" fill="#c38b55" />
                <line
                  x1="18"
                  y1="4"
                  x2="18"
                  y2="10"
                  stroke="#c38b55"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="18"
                  y1="26"
                  x2="18"
                  y2="32"
                  stroke="#c38b55"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="4"
                  y1="18"
                  x2="10"
                  y2="18"
                  stroke="#c38b55"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="26"
                  y1="18"
                  x2="32"
                  y2="18"
                  stroke="#c38b55"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="8.1"
                  y1="8.1"
                  x2="12.3"
                  y2="12.3"
                  stroke="#c38b55"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="23.7"
                  y1="23.7"
                  x2="27.9"
                  y2="27.9"
                  stroke="#c38b55"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="27.9"
                  y1="8.1"
                  x2="23.7"
                  y2="12.3"
                  stroke="#c38b55"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="12.3"
                  y1="23.7"
                  x2="8.1"
                  y2="27.9"
                  stroke="#c38b55"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>DeepaKart</span>
            </div>
            <p className="deepa-footer-about">
              Crafting sparkling memories and bright family festivities with
              certified, premium-quality green crackers direct from master
              artisans.
            </p>
          </div>

          <div className="deepa-footer-col">
            <h4>Shop</h4>
            <ul>
              <li>
                <a href="#sparklers">Sparklers & Chakkars</a>
              </li>
              <li>
                <a href="#flower-pots">Flower Pots & Fountains</a>
              </li>
              <li>
                <a href="#sky-shots">Multi-Sky Aerial Shots</a>
              </li>
              <li>
                <a href="#gift-boxes">Family Combo Boxes</a>
              </li>
            </ul>
          </div>

          <div className="deepa-footer-col">
            <h4>Company</h4>
            <ul>
              <li>
                <a href="#about">About DeepaKart</a>
              </li>
              <li>
                <a href="#locations">Store Locations</a>
              </li>
              <li>
                <a href="#safety">Green Certification</a>
              </li>
              <li>
                <a href="#contact">Contact Support</a>
              </li>
            </ul>
          </div>

          <div className="deepa-footer-col">
            <h4>Stay Connected</h4>
            <p className="deepa-newsletter-text">
              Subscribe for exclusive festive early-bird offers and discounts.
            </p>
            <div className="deepa-newsletter-input-wrap">
              <input type="email" placeholder="Enter your email" />
              <button>Subscribe</button>
            </div>
          </div>
        </div>

        <div className="deepa-footer-bottom">
          <p>
            © {new Date().getFullYear()} DeepaKart. All rights reserved. Safe
            celebrations & eco-friendly green crackers.
          </p>
          <div className="deepa-footer-trust-marks">
            <span>🌿 CSIR-NEERI Certified</span>
            <span>⚡ Sivakasi Direct</span>
            <span>🔒 Safe Transport</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
