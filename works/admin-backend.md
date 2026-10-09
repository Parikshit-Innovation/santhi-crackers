# Diwali Crackers Store --- Admin Dashboard Specification

## 1. Goal

Build an admin dashboard for managing the Diwali crackers store.

The first version should focus on:

1. Admin authentication
2. Product management
3. Category management
4. Cloudinary image upload
5. Inventory management
6. Product activation/deactivation
7. Featured products
8. Viewing placed orders
9. Order status management
10. Basic dashboard statistics

The existing Prisma schema already covers `Product`, `Category`, `Cart`,
and `CartItem`.

> Important: the current schema does **not** contain `Order` or
> `OrderItem` models. These must be added before the admin can reliably
> display completed purchases.

---

# 2. Admin Dashboard Pages

Recommended admin routes:

```text
/admin
/admin/login

/admin/products
/admin/products/new
/admin/products/:id/edit

/admin/categories

/admin/orders
/admin/orders/:id

/admin/inventory

/admin/settings
```

The admin dashboard sidebar can contain:

```text
Dashboard
Products
Categories
Orders
Inventory
Settings
Logout
```

---

# 3. Admin Dashboard Home

Display:

```text
Total Products
Active Products
Out of Stock
Total Orders
Pending Orders
Completed Orders
Total Sales
```

Example:

```text
┌──────────────────────────────────────────────┐
│ Products        Orders        Sales          │
│ 128             342           ₹4,82,500      │
├──────────────────────────────────────────────┤
│ Pending Orders     Low Stock Products        │
│ 24                 8                         │
└──────────────────────────────────────────────┘
```

The dashboard should also show:

- Recent orders
- Recently added products
- Low-stock products
- Top-selling products

---

# 4. Product Management

## Product List

Route:

```text
GET /admin/products
```

Display a table:

---

Image Code Product Category Actual Selling Stock Status Featured Actions
Name Price Price

---

image 251 3000 Combo ₹3000 ₹300 50 Active Yes Edit/Delete
Combo Packs
Pack

image 252 15000 Combo ₹15000 ₹1500 20 Active No Edit/Delete
Family Packs
Pack
----------------

Features:

- Search by product name
- Search by product code
- Filter by category
- Filter active/inactive
- Filter in-stock/out-of-stock
- Sort by price
- Sort by stock
- Sort by created date
- Pagination

---

# 5. Add Product

Route:

```text
GET /admin/products/new
```

The form should contain:

### Basic Information

```text
Product Code *
Product Name *
Description
Content *
Category *
```

Example:

```text
Product Code:
251

Product Name:
3000 COMBO PACK (Kids Pack)

Content:
Box

Category:
Combo Packs
```

---

# 6. Pricing

Fields:

```text
Actual Price *
Selling Price *
Discount
```

Example:

```text
Actual Price: ₹3000
Selling Price: ₹300
Discount: 90%
```

Prefer calculating discount automatically.

```ts
discount = ((actualPrice - price) / actualPrice) * 100;
```

Do not trust a discount value sent by the frontend if it can be
calculated from the two prices.

The backend should validate:

```text
actualPrice >= 0
price >= 0
price <= actualPrice
```

If your business intentionally allows selling above the displayed actual
price, remove the last validation.

---

# 7. Inventory

Fields:

```text
Stock *
Minimum Order Quantity
Maximum Order Quantity
```

Example:

```text
Stock: 100

Minimum Order Quantity: 1

Maximum Order Quantity: 10
```

Rules:

```text
stock >= 0
minOrderQty >= 1
maxOrderQty >= minOrderQty
```

When an order is successfully completed:

```text
stock = stock - orderedQuantity
```

The stock update should happen inside a database transaction.

Never allow stock to become negative.

---

# 8. Product Image --- Cloudinary

Product images should be stored in Cloudinary.

The database should store the Cloudinary URL.

Example:

```text
https://res.cloudinary.com/<cloud-name>/image/upload/v123/products/251.jpg
```

The database field:

```prisma
imageUrl String?
```

stores only the URL.

Do not store the actual image binary inside PostgreSQL.

---

# 9. Recommended Cloudinary Upload Flow

Preferred architecture:

```text
Admin Browser
     │
     │ request upload
     ▼
Backend
     │
     │ generate signed upload parameters
     ▼
Cloudinary
     │
     │ upload image
     ▼
Cloudinary URL
     │
     ▼
Backend
     │
     ▼
PostgreSQL
```

The admin frontend should not receive or expose the Cloudinary API
secret.

Environment variables:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

# 10. Product Image API

Recommended endpoint:

```http
POST /admin/products/upload-image
```

The backend can either:

1. Accept multipart form data and upload to Cloudinary, or
2. Generate a signed Cloudinary upload configuration and let the
   browser upload directly.

For a simple first implementation, multipart upload through the backend
is easier.

Example response:

```json
{
  "success": true,
  "imageUrl": "https://res.cloudinary.com/example/image/upload/v123/products/251.jpg"
}
```

Then create the product using:

```json
{
  "code": "251",
  "name": "3000 COMBO PACK (Kids Pack)",
  "content": "Box",
  "actualPrice": 3000,
  "price": 300,
  "stock": 100,
  "imageUrl": "https://res.cloudinary.com/example/image/upload/v123/products/251.jpg",
  "categoryId": "category-id"
}
```

---

# 11. Product API

Recommended APIs:

```http
GET    /admin/products
GET    /admin/products/:id

POST   /admin/products
PATCH  /admin/products/:id
DELETE /admin/products/:id

PATCH  /admin/products/:id/status
PATCH  /admin/products/:id/featured
PATCH  /admin/products/:id/stock
```

### Create Product

```http
POST /admin/products
```

Request:

```json
{
  "code": "251",
  "name": "3000 COMBO PACK (Kids Pack)",
  "description": "Premium Diwali combo pack",
  "content": "Box",
  "actualPrice": 3000,
  "price": 300,
  "stock": 100,
  "minOrderQty": 1,
  "maxOrderQty": 10,
  "imageUrl": "cloudinary-url",
  "categoryId": "category-id",
  "isActive": true,
  "isFeatured": false
}
```

---

# 12. Product Validation

Backend validation is mandatory.

Required:

```text
code
name
content
actualPrice
price
stock
categoryId
```

Validation:

```text
code must be unique
name cannot be empty
price >= 0
actualPrice >= 0
stock >= 0
minOrderQty >= 1
maxOrderQty >= minOrderQty
category must exist
```

The frontend validation improves UX, but the backend must perform the
final validation.

---

# 13. Edit Product

Route:

```text
/admin/products/:id/edit
```

The same form used for creating a product can be reused.

Allow changing:

```text
Product Code
Product Name
Description
Content
Category
Actual Price
Selling Price
Stock
Min Order Quantity
Max Order Quantity
Image
Active status
Featured status
```

When replacing an image, upload the new image to Cloudinary and update
`imageUrl`.

---

# 14. Delete Product

Prefer **soft deletion** rather than permanently deleting products that
may have appeared in previous orders.

Use:

```prisma
isActive Boolean @default(true)
```

Instead of immediately deleting:

```text
Delete
```

use:

```text
Deactivate
```

The product remains in the database but is hidden from the
customer-facing store.

This is especially important once orders reference the product.

---

# 15. Categories

Admin route:

```text
/admin/categories
```

Fields:

```text
Name
Slug
Description
Image
Sort Order
Active
```

Example:

```text
Combo Packs
Sparklers
Flower Pots
Ground Chakkars
Rockets
Kids Special
Fancy Crackers
Gift Packs
```

APIs:

```http
GET    /admin/categories
POST   /admin/categories
PATCH  /admin/categories/:id
DELETE /admin/categories/:id
```

For deletion, prevent deleting a category that still contains products
unless the products are moved to another category.

---

# 16. Orders

The current Prisma schema does not have an order model.

Do not use `Cart` as the permanent order record.

A cart is temporary.

An order must preserve:

```text
Customer
Products purchased
Quantity
Price at purchase time
Subtotal
Shipping
Discount
Total
Payment status
Order status
Delivery address
Created date
```

---

# 17. Required Order Schema

Add these models:

```prisma
enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

model Order {
  id              String        @id @default(cuid())

  orderNumber     String        @unique

  userId          String?

  subtotal        Decimal       @db.Decimal(10, 2)
  shippingAmount  Decimal       @default(0) @db.Decimal(10, 2)
  discountAmount  Decimal       @default(0) @db.Decimal(10, 2)
  total           Decimal       @db.Decimal(10, 2)

  status          OrderStatus   @default(PENDING)
  paymentStatus   PaymentStatus @default(PENDING)

  paymentId       String?

  customerName    String
  customerPhone   String
  customerEmail   String?

  addressLine1    String
  addressLine2    String?
  city            String
  state           String
  pincode         String

  items           OrderItem[]

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([status])
  @@index([paymentStatus])
  @@index([createdAt])
  @@index([userId])
}

model OrderItem {
  id          String   @id @default(cuid())

  orderId     String
  productId   String?

  productCode String
  productName String
  imageUrl    String?

  quantity    Int

  price       Decimal  @db.Decimal(10, 2)
  total       Decimal  @db.Decimal(10, 2)

  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product     Product? @relation(fields: [productId], references: [id])

  createdAt   DateTime @default(now())

  @@index([orderId])
  @@index([productId])
}
```

Then add this relation to `Product`:

```prisma
orderItems OrderItem[]
```

---

# 18. Why OrderItem Stores Product Information

Do not rely only on:

```prisma
productId
```

because the product can later change.

For example:

```text
Today:
3000 Combo Pack
Price = ₹300
```

A month later:

```text
3000 Combo Pack
Price = ₹500
```

The old order must still display:

```text
3000 Combo Pack
₹300
```

Therefore `OrderItem` stores a snapshot:

```text
productCode
productName
imageUrl
price
quantity
total
```

---

# 19. Admin Orders Page

Route:

```text
/admin/orders
```

Table:

---

Order ID Customer Items Total Payment Status Date Action

---

ORD-1001 Sunil 3 ₹2,300 Paid Processing Oct 8 View

ORD-1002 Arun 5 ₹4,500 Paid Shipped Oct 8 View

ORD-1003 Priya 2 ₹850 Pending Pending Oct 7 View
-------------------------------------------------

Filters:

```text
All
Pending
Confirmed
Processing
Shipped
Delivered
Cancelled
```

Payment filters:

```text
All
Paid
Pending
Failed
Refunded
```

Search:

```text
Search by order number
Search by customer name
Search by phone
```

---

# 20. Order Details

Route:

```text
/admin/orders/:id
```

Show:

### Customer

```text
Name
Phone
Email
```

### Delivery Address

```text
Address
City
State
Pincode
```

### Products

```text
Image
Product
Code
Quantity
Price
Total
```

### Payment

```text
Payment ID
Payment Status
Subtotal
Shipping
Discount
Total
```

### Order Status

Admin can change:

```text
Pending
↓
Confirmed
↓
Processing
↓
Shipped
↓
Delivered
```

Cancelled orders should be handled separately.

---

# 21. Order Status API

```http
GET   /admin/orders
GET   /admin/orders/:id

PATCH /admin/orders/:id/status
PATCH /admin/orders/:id/payment-status
```

Example:

```json
{
  "status": "SHIPPED"
}
```

Backend must validate that the requested status is valid.

---

# 22. Inventory Page

Route:

```text
/admin/inventory
```

Display:

Product Code Stock Status Action

---

3000 Combo Pack 251 50 In Stock Update
15000 Family Pack 252 5 Low Stock Update
Kids Pack 253 0 Out of Stock Update

Use thresholds such as:

```text
0       → Out of Stock
1-10    → Low Stock
11+     → In Stock
```

The threshold can later be made configurable.

---

# 23. Security

Admin APIs must never be publicly accessible.

Required:

```text
Admin authentication
Admin authorization
Protected admin routes
Input validation
Rate limiting
Secure cookies/token handling
Cloudinary secret protection
```

Customer users must not be able to call:

```text
POST /admin/products
PATCH /admin/products/:id
DELETE /admin/products/:id
GET /admin/orders
```

unless they are authorized admins.

---

# 24. Recommended Backend Structure

Example:

```text
src/
├── modules/
│   ├── auth/
│   ├── products/
│   │   ├── product.controller.ts
│   │   ├── product.service.ts
│   │   ├── product.validation.ts
│   │   └── product.routes.ts
│   │
│   ├── categories/
│   ├── orders/
│   ├── inventory/
│   └── uploads/
│
├── lib/
│   ├── prisma.ts
│   └── cloudinary.ts
│
├── middleware/
│   ├── auth.ts
│   └── admin.ts
│
└── app.ts
```

---

# 25. Minimum Admin MVP

For the first version, implement only:

### 1. Admin Login

```text
/admin/login
```

### 2. Dashboard

```text
/admin
```

Show:

```text
Total Products
Total Orders
Pending Orders
Total Sales
```

### 3. Product Management

```text
/admin/products
/admin/products/new
/admin/products/:id/edit
```

Features:

```text
Create
Read
Update
Deactivate
Search
Filter
Pagination
```

### 4. Cloudinary

```text
Upload product image
Store image URL in Product.imageUrl
```

### 5. Categories

```text
Create
Update
List
Deactivate
```

### 6. Orders

```text
List orders
View order
Update order status
View payment status
```

---

# 26. Product Creation Flow

The complete flow should be:

```text
Admin Login
     ↓
Admin Dashboard
     ↓
Products
     ↓
Add Product
     ↓
Enter Product Details
     ↓
Upload Image
     ↓
Cloudinary
     ↓
Receive imageUrl
     ↓
Select Category
     ↓
Enter Price + Stock
     ↓
Submit
     ↓
Backend Validation
     ↓
Prisma Product.create()
     ↓
Product appears in Shop
```

---

# 27. Customer Purchase Flow

The complete customer flow should be:

```text
Customer
   ↓
Browse Products
   ↓
Add to Cart
   ↓
CartItem
   ↓
Checkout
   ↓
Payment
   ↓
Payment Success
   ↓
Create Order
   ↓
Create OrderItems
   ↓
Decrease Product Stock
   ↓
Clear Cart
   ↓
Order Confirmation
   ↓
Admin sees Order
```

The order creation, stock deduction, and cart clearing should be handled
carefully in a Prisma transaction after successful payment verification.

---

# 28. Important Schema Decision

Your existing schema is a good starting point:

```text
Product
Category
Cart
CartItem
```

Add:

```text
Order
OrderItem
```

Later, if required, add:

```text
User
Admin
Address
Payment
Coupon
```

But do not over-engineer the first version.

For the current Diwali shop MVP, the priority should be:

```text
Admin Login
     ↓
Product CRUD
     ↓
Cloudinary
     ↓
Categories
     ↓
Cart
     ↓
Checkout
     ↓
Payment
     ↓
Orders
     ↓
Admin Order Management
```

This gives you a complete working e-commerce flow rather than only an
admin product-entry system.
