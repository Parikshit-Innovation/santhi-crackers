import React from "react";
import "./DeepaCategories.css";
import {
  SparklersIcon,
  FlowerPotsIcon,
  CrackersIcon,
  GroundChakkarIcon,
  RocketsIcon,
  SkyShotsIcon,
} from "./CategoryIcons";

interface CategoryItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: "sparklers",
    name: "Sparklers",
    icon: <SparklersIcon className="deepa-cat-svg" />,
  },
  {
    id: "flower-pots",
    name: "Flower Pots",
    icon: <FlowerPotsIcon className="deepa-cat-svg" />,
  },
  {
    id: "crackers",
    name: "Crackers",
    icon: <CrackersIcon className="deepa-cat-svg" />,
  },
  {
    id: "ground-chakkar",
    name: "Ground Chakkar",
    icon: <GroundChakkarIcon className="deepa-cat-svg" />,
  },
  {
    id: "rockets",
    name: "Rockets",
    icon: <RocketsIcon className="deepa-cat-svg" />,
  },
  {
    id: "sky-shots",
    name: "Sky Shots",
    icon: <SkyShotsIcon className="deepa-cat-svg" />,
  },
];

interface DeepaCategoriesProps {
  onSelectCategory?: (id: string) => void;
  onViewAll?: () => void;
}

export const DeepaCategories: React.FC<DeepaCategoriesProps> = ({
  onSelectCategory,
  onViewAll,
}) => {
  return (
    <section className="deepa-categories-section">
      <div className="deepa-categories-container">
        {/* Section Header */}
        <div className="deepa-categories-header">
          <div className="deepa-cat-header-left">
            <span className="deepa-cat-eyebrow">EXPLORE</span>
            <h2 className="deepa-cat-title">Popular Categories</h2>
          </div>
          <button className="deepa-view-all-btn" onClick={onViewAll}>
            <span>View All Categories</span>
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
              <polyline
                points="12 5 19 12 12 19"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Categories Grid (6 Cards, 100% Pure React SVGs) */}
        <div className="deepa-categories-grid">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="deepa-cat-card"
              onClick={() => onSelectCategory?.(cat.id)}
            >
              <div className="deepa-cat-img-box">{cat.icon}</div>
              <div className="deepa-cat-footer">
                <span className="deepa-cat-name">{cat.name}</span>
                <span className="deepa-cat-arrow">
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line
                      x1="5"
                      y1="12"
                      x2="19"
                      y2="12"
                      strokeLinecap="round"
                    />
                    <polyline
                      points="12 5 19 12 12 19"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
