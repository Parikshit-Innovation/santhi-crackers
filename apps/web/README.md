# Santhi Crackers Web (React + Vite)

This is the front-facing storefront for **Santhi Crackers**, built using [React 19](https://react.dev) and [Vite](https://vite.dev) within the Turborepo monorepo.

## Features

- **React 19 + Vite**: High-performance lightning-fast HMR and bundle compilation.
- **Interactive Fireworks Engine**: Dynamic Canvas-based fireworks particles responding to clicks and festive ambient animation.
- **Sivakasi Wholesale Catalog**: Product browsing across categories (Aerial shots, Sparklers, Flower Pots, Sound crackers, Family Combos).
- **Instant Price Estimator & Cart**: Direct factory wholesale discount calculator (up to 75% OFF) with WhatsApp ordering flow.
- **CSIR-NEERI Green Crackers Compliance**: Verified eco-friendly cracker guidelines and safety tips.
- **Monorepo Integration**: Seamlessly integrates `@repo/ui`, `@repo/typescript-config`, and `@repo/eslint-config`.

## Getting Started

Run the development server from the repository root:

```bash
npm run dev --filter=web
```

Or directly from `apps/web`:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## Build

```bash
npm run build --filter=web
```
