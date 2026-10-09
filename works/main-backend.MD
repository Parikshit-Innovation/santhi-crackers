# Diwali Product Catalog

Software requirements specification and backend development guide for the Diwali
product catalog website.

## 1. Purpose and scope

This project is a simple product catalog site for displaying Diwali products.
The backend provides product, category, and guest-cart data to the frontend.

### In scope

- Product listing and pagination
- Product details
- Category listing
- Products grouped by category
- Guest cart retrieval using an HTTP-only cookie
- PostgreSQL persistence through Prisma

### Out of scope for this version

- Customer registration and login
- Admin dashboard
- Payment gateway
- Order creation and order history
- Delivery tracking
- Coupons
- Notifications
- Reviews and ratings
- Product management APIs

## 2. Technology stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- Docker Compose for local PostgreSQL
- npm workspaces and Turborepo

## 3. System overview

```text
Frontend
   |
   | HTTP requests
   v
Express API
   |
   | Prisma queries
   v
PostgreSQL
```

The API is located in [`apps/api`](./apps/api). The reusable Prisma package is
located in [`packages/db`](./packages/db).

## 4. Public API

The API is served from `http://localhost:3007` during local development.


| Method | Endpoint                | Purpose                         |
| ------ | ----------------------- | ------------------------------- |
| `GET`  | `/health`               | Check API availability          |
| `GET`  | /api/products           | List active products            |
| `GET`  | `/api/products/:id`     | Get one active product          |
| `GET`  | `/api/categories`       | List active categories          |
| `GET`  | `/api/categories/:slug` | Get a category and its products |
| `GET`  | `/api/cart`             | Get the current guest cart      |

### 4.1 List products

```http
GET /api/products?page=1&limit=10&category=rockets&sort=price_asc
```

Supported query parameters:


| Parameter  | Type    | Required | Description                                                     |
| ---------- | ------- | -------: | --------------------------------------------------------------- |
| `page`     | integer |       No | Page number; defaults to`1`                                     |
| `limit`    | integer |       No | Number of records; maximum is`10`                               |
| `search`   | string  |       No | Search by product name or code                                  |
| `category` | string  |       No | Filter by category slug                                         |
| `sort`     | string  |       No | `newest`, `price_asc`, `price_desc`, `name_asc`, or `name_desc` |

Response:

```json
{
  "items": [
    {
      "id": "product-id",
      "code": "ROCKET-001",
      "name": "Deluxe Rocket",
      "description": "Colorful sky rocket",
      "content": "Pack of 5",
      "actualPrice": "500.00",
      "price": "425.00",
      "discount": "15.00",
      "stock": 20,
      "imageUrl": "/images/deluxe-rocket.jpg",
      "category": {
        "id": "category-id",
        "name": "Rockets",
        "slug": "rockets"
      },
      "isActive": true,
      "isFeatured": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

Requirements:

- Return only products where `isActive` is `true`.
- Default to newest products first.
- Include category information when available.
- Enforce a maximum page size of `10`.
- Return an empty `items` array when no products match.

### 4.2 Get product details

```http
GET /api/products/:id
```

Return the requested active product with its category. If the product does not
exist or is inactive, return:

```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found."
  }
}
```

### 4.3 List categories

```http
GET /api/categories
```

Return active categories ordered by `sortOrder ASC`, then `name ASC`.
Categories should include the count of active products.

```json
{
  "categories": [
    {
      "id": "category-id",
      "name": "Rockets",
      "slug": "rockets",
      "description": "Colorful sky rockets",
      "imageUrl": "/images/categories/rockets.jpg",
      "sortOrder": 1,
      "productCount": 12
    }
  ]
}
```

### 4.4 Get products by category

```http
GET /api/categories/:slug?page=1&limit=10
```

Return the active category and its active, paginated products. Return `404`
when the category does not exist or is inactive.

```json
{
  "category": {
    "id": "category-id",
    "name": "Sparklers",
    "slug": "sparklers"
  },
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

### 4.5 Get guest cart

```http
GET /api/cart
```

The backend identifies a guest cart using an HTTP-only `cart_id` cookie. On the
first request without a cookie, it shall:

1. Generate a random cart identifier.
2. Create an empty cart.
3. Return `Set-Cookie: cart_id=<cart-id>`.
4. Configure the cookie as HTTP-only.

Example response:

```json
{
  "cart": {
    "id": "cart-id",
    "items": [],
    "summary": {
      "totalItems": 0,
      "subtotal": "0.00"
    }
  }
}
```

For a frontend and backend running on different origins, frontend requests
must include credentials:

```ts
fetch("http://localhost:3007/api/cart", {
  credentials: "include"
});
```

The browser sends the cookie automatically on later requests. The frontend
must not manually send `cart_id` in the request body or headers.

Recommended cookie settings:

```ts
{
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 1000 * 60 * 60 * 24 * 30,
  path: "/"
}
```

## 5. Database requirements

The Prisma schema is in
[`packages/db/prisma/schema.prisma`](./packages/db/prisma/schema.prisma).

### Product

A product contains:

- Unique ID and product code
- Name, description, and pack/content information
- Original price, selling price, and discount
- Stock, minimum quantity, and maximum quantity
- Image URL
- Category
- Active and featured flags
- Creation and update timestamps

### Category

A category contains:

- Unique ID, name, and slug
- Description and image URL
- Sort order
- Active flag
- Creation and update timestamps

### Cart and cart items

A cart contains a unique ID, optional guest token, optional user ID, cart
items, and timestamps. A cart item contains a product, quantity, price, and
timestamps.

Because this version has no login, guest carts should use a random token:

```prisma
model Cart {
  id         String     @id @default(cuid())
  guestToken String?    @unique
  userId     String?    @unique
  items      CartItem[]
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
}
```

The backend must calculate prices from the database and must not trust prices
sent by the frontend.

## 6. Response and error standards

All API responses use JSON.

Collection response:

```json
{
  "items": [],
  "pagination": {}
}
```

Error response:

```json
{
  "error": {
    "code": "INVALID_PAGINATION",
    "message": "Page must be a positive integer and limit must be between 1 and 10."
  }
}
```

Required status codes:


| Status | Usage                              |
| -----: | ---------------------------------- |
|  `200` | Successful request                 |
|  `400` | Invalid query or request parameter |
|  `404` | Product or category not found      |
|  `500` | Unexpected server error            |

Invalid values such as `page=0`, `page=-1`, `page=abc`, `limit=0`, or
`limit=100` must return `400`.

## 7. Non-functional requirements

### Performance

- Use database pagination for product queries.
- Return no more than 10 products per page.
- Use indexes for product codes, categories, active status, and slugs.
- Select only fields required by each response.

### Security

- Keep database credentials in environment variables.
- Do not commit `.env`.
- Use HTTP-only guest-cart cookies.
- Use `secure: true` for production HTTPS cookies.
- Restrict CORS to the configured frontend origin.
- Validate all query parameters and path parameters.
- Do not expose internal database errors.
- Add rate limiting before production deployment.

### Reliability and maintainability

- Use Prisma migrations for schema changes.
- Handle database errors centrally.
- Keep the health endpoint available.
- Separate routes, controllers, services, and database access as the project
  grows.

Recommended structure:

```text
apps/api/
├── server.ts
└── src/
    ├── routes.ts
    ├── controllers/
    │   ├── product-controller.ts
    │   ├── category-controller.ts
    │   └── cart-controller.ts
    ├── services/
    │   ├── product-service.ts
    │   ├── category-service.ts
    │   └── cart-service.ts
    ├── middleware/
    │   ├── error-handler.ts
    │   └── validation.ts
    └── types/
        └── api.ts
```

## 8. Testing requirements

Tests should verify:

- Active products are returned and inactive products are excluded.
- Pagination and the maximum limit of `10` work correctly.
- Search, sorting, and category filtering work correctly.
- Missing products and categories return `404`.
- Categories are sorted correctly.
- Category product results are paginated.
- A missing cart cookie creates a cart and sets `cart_id`.
- Later requests return the same cart.
- Invalid cart cookies are handled safely.
- Inactive products are not exposed as available cart products.
- TypeScript compilation and Prisma migrations succeed.

## 9. Acceptance criteria

The implementation is complete when:

- `GET /api/products` returns active, paginated products.
- Product responses contain no more than 10 products.
- `GET /api/products/:id` returns the correct active product.
- `GET /api/categories` returns active categories.
- `GET /api/categories/:slug` returns the category and its products.
- `GET /api/cart` creates a guest cart when no cookie exists.
- The backend sends an HTTP-only `cart_id` cookie.
- The browser sends the cookie automatically on subsequent requests.
- Invalid pagination input returns `400`.
- Missing products and categories return `404`.
- Database credentials are loaded from environment variables.
- TypeScript compilation succeeds.
- Prisma migrations apply successfully.

## 10. Local development

Install dependencies:

```bash
npm install
```

Start the local PostgreSQL database:

```bash
docker compose up -d
```

The local database is exposed on port `5433` because port `5432` is already in
use by another local container. The connection string is configured in `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5433/app"
```

Apply migrations:

```bash
npm run db:migrate --workspace @repo/db -- --name init
```

Generate Prisma Client:

```bash
npm run db:generate --workspace @repo/db
```

Start the API with automatic TypeScript rebuilding and server restart:

```bash
npm run dev --workspace api
```

The API will be available at:

```text
http://localhost:3007
```

Check the API:

```bash
curl http://localhost:3007/health
```

* [ ]

1. Implement `/api/products` with pagination, search, sorting, and category
   filtering.
2. Implement `/api/products/:id`.
3. Implement `/api/categories`.
4. Implement `/api/categories/:slug`.
5. Add guest-token cookie handling.
6. Implement `/api/cart`.
7. Add request validation and centralized error handling.
8. Add CORS configuration for the frontend.
9. Add API and database integration tests.
10. Add logging and production monitoring.

For this simple catalog site, payment, login, order management, and admin
features can remain out of scope until the business requirements expand.
