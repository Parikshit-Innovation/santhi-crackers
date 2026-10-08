import React from "react";
import "./DeepaTrustBar.css";

export const DeepaTrustBar: React.FC = () => {
  const trustItems = [
    {
      title: "100% Genuine Products",
      desc: "Trusted brands and certified crackers",
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          stroke="#c38b55"
          strokeWidth="1.8"
        >
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 12l2 2 4-4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "Fast & Safe Delivery",
      desc: "Available in selected areas",
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          stroke="#c38b55"
          strokeWidth="1.8"
        >
          <rect
            x="1"
            y="4"
            width="14"
            height="12"
            rx="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 8h4l3 3v5h-7V8z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="17.5" cy="18.5" r="2.5" />
        </svg>
      ),
    },
    {
      title: "Best Festive Offers",
      desc: "Great deals this season",
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          stroke="#c38b55"
          strokeWidth="1.8"
        >
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "Multiple Store Locations",
      desc: "Find the nearest store",
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          stroke="#c38b55"
          strokeWidth="1.8"
        >
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      ),
    },
  ];

  return (
    <div className="deepa-trust-bar">
      <div className="deepa-trust-container">
        {trustItems.map((item, idx) => (
          <div key={idx} className="deepa-trust-item">
            <div className="deepa-trust-icon-box">{item.icon}</div>
            <div className="deepa-trust-text">
              <h4 className="deepa-trust-title">{item.title}</h4>
              <p className="deepa-trust-desc">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
