import React from "react";
import "./DeepaFeatured.css";

export interface FeaturedProduct {
  id: string;
  name: string;
  category: string;
  pieces: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  image: string;
}

const FEATURED_PRODUCTS: FeaturedProduct[] = [
  {
    id: "fp-1",
    name: "120 Multi-Sky Star Shots (Grand Finale)",
    category: "Sky Shots",
    pieces: "1 Box • 120 Shots",
    price: 890,
    originalPrice: 2800,
    discount: 68,
    rating: 4.9,
    image: "/category-skyshots.jpg",
  },
  {
    id: "fp-2",
    name: "Tri-Colour Giant Flower Pots (Koti Deluxe)",
    category: "Flower Pots",
    pieces: "5 Pcs / Box",
    price: 160,
    originalPrice: 480,
    discount: 66,
    rating: 4.8,
    image: "/category-flowerpots.jpg",
  },
  {
    id: "fp-3",
    name: "Electric Cold Sparklers (Golden Aura)",
    category: "Sparklers",
    pieces: "10 Pcs / Pack",
    price: 65,
    originalPrice: 190,
    discount: 65,
    rating: 4.9,
    image: "/category-sparklers.jpg",
  },
  {
    id: "fp-4",
    name: "Deluxe Spinning Ground Chakkars",
    category: "Ground Chakkar",
    pieces: "10 Pcs / Box",
    price: 110,
    originalPrice: 320,
    discount: 65,
    rating: 4.7,
    image: "/category-chakkar.jpg",
  },
];

interface DeepaFeaturedProps {
  onAddToCart: (p: FeaturedProduct) => void;
  onViewAllProducts?: () => void;
}

export const DeepaFeatured: React.FC<DeepaFeaturedProps> = ({
  onAddToCart,
  onViewAllProducts,
}) => {
  return (
    <section className="deepa-featured-section">
      <div className="deepa-featured-container">
        {/* Section Header */}
        <div className="deepa-featured-header">
          <div className="deepa-feat-header-left">
            <span className="deepa-feat-eyebrow">BEST PICKS</span>
            <h2 className="deepa-feat-title">Featured Products</h2>
          </div>
          <button className="deepa-view-all-btn" onClick={onViewAllProducts}>
            <span>View All Products</span>
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

        {/* Products Grid */}
        <div className="deepa-featured-grid">
          {FEATURED_PRODUCTS.map((prod) => (
            <div key={prod.id} className="deepa-product-card">
              <div className="deepa-product-badge">-{prod.discount}% OFF</div>
              <div className="deepa-product-img-wrap">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="deepa-product-img"
                />
              </div>

              <div className="deepa-product-body">
                <div className="deepa-product-meta-row">
                  <span className="deepa-product-cat">{prod.category}</span>
                  <span className="deepa-product-rating">★ {prod.rating}</span>
                </div>

                <h3 className="deepa-product-name">{prod.name}</h3>
                <span className="deepa-product-pieces">{prod.pieces}</span>

                <div className="deepa-product-pricing">
                  <div className="deepa-product-prices">
                    <span className="deepa-price-current">₹{prod.price}</span>
                    <span className="deepa-price-original">
                      ₹{prod.originalPrice}
                    </span>
                  </div>

                  <button
                    className="deepa-add-cart-btn"
                    onClick={() => onAddToCart(prod)}
                    aria-label="Add to cart"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
