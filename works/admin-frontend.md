# Diwali Crackers Store --- Admin Frontend Specification

## 1. Purpose

Build a clean, premium, responsive admin dashboard frontend for the
Diwali crackers e-commerce platform.

The frontend should manage:

-   Products
-   Categories
-   Inventory
-   Orders
-   Product images through Cloudinary
-   Dashboard statistics
-   Admin account/session
-   Product activation/featured state

The visual style should match the customer website:

-   Minimal
-   White background
-   Warm beige / subtle gold accents
-   Dark navy/black text
-   Thin borders
-   Soft shadows
-   Rounded cards
-   No excessive gradients
-   No colorful dashboard widgets
-   Professional SaaS/e-commerce administration interface

------------------------------------------------------------------------

# 2. Recommended Frontend Stack

Use:

``` text
React
TypeScript
Vite
React Router
Tailwind CSS
Axios
Lucide React
React Hook Form
Zod
```

Optional:

``` text
TanStack Query
Sonner
Recharts
```

Recommended:

-   TanStack Query for API/server state
-   React Hook Form + Zod for forms
-   Lucide for icons
-   Recharts only for simple sales/order charts

------------------------------------------------------------------------

# 3. Admin URL Structure

``` text
/admin/login

/admin
/admin/products
/admin/products/new
/admin/products/:id/edit

/admin/categories

/admin/inventory

/admin/orders
/admin/orders/:id

/admin/settings
```

------------------------------------------------------------------------

# 4. Admin Layout

Use a persistent dashboard layout.

``` text
┌─────────────────────────────────────────────────────────────┐
│ Logo / Store Name                         Admin  ●           │
├───────────────┬─────────────────────────────────────────────┤
│               │                                             │
│ Dashboard     │                                             │
│ Products      │             Page Content                    │
│ Categories    │                                             │
│ Inventory     │                                             │
│ Orders        │                                             │
│               │                                             │
│ ─────────     │                                             │
│ Settings      │                                             │
│ Logout        │                                             │
│               │                                             │
└───────────────┴─────────────────────────────────────────────┘
```

Desktop:

``` text
Sidebar width: 240px
```

Mobile:

``` text
Sidebar → collapsible drawer
```

------------------------------------------------------------------------

# 5. Sidebar

Sidebar items:

``` text
Dashboard
Products
Categories
Inventory
Orders
────────────────
Settings
Logout
```

Each item should have:

``` text
Icon
Label
Active state
```

Example:

``` text
▣ Dashboard

▦ Products

▤ Categories

▥ Inventory

□ Orders
```

Active navigation:

``` text
background: warm beige
text: dark
left border/accent: gold
```

Do not use highly saturated colors.

------------------------------------------------------------------------

# 6. Header

Header contains:

``` text
Page title
Breadcrumb
Search
Notifications
Admin profile
```

Example:

``` text
Products

Home / Products

                         Search...
                         🔔
                         Admin
```

On smaller screens:

``` text
☰   Products                  Admin
```

------------------------------------------------------------------------

# 7. Login Page

Route:

``` text
/admin/login
```

Minimal centered layout:

``` text
┌─────────────────────────────────────┐
│                                     │
│          DeepaKart Admin            │
│       Manage your store             │
│                                     │
│ Email                               │
│ [____________________________]      │
│                                     │
│ Password                            │
│ [____________________________]      │
│                                     │
│ [        Sign In        ]           │
│                                     │
└─────────────────────────────────────┘
```

Include:

``` text
Email
Password
Show/hide password
Remember me
Sign in
Forgot password
```

Do not implement forgot-password UI unless the backend supports it.

------------------------------------------------------------------------

# 8. Dashboard

Route:

``` text
/admin
```

Page heading:

``` text
Dashboard
Good morning, Admin
```

Statistics cards:

``` text
Total Products
128

Active Products
116

Total Orders
342

Pending Orders
24

Total Sales
₹4,82,500

Out of Stock
8
```

Cards should be simple.

Example:

``` text
┌──────────────────────────────┐
│ Total Products               │
│                              │
│ 128                          │
│ +12 this month               │
└──────────────────────────────┘
```

------------------------------------------------------------------------

# 9. Dashboard Order Section

Show recent orders.

``` text
Recent Orders

Order       Customer       Total       Status       Date

#ORD1001    Sunil          ₹2,300      Processing   Oct 8
#ORD1002    Arun           ₹4,500      Shipped      Oct 8
#ORD1003    Priya          ₹850        Delivered    Oct 7
```

Button:

``` text
View All Orders →
```

------------------------------------------------------------------------

# 10. Dashboard Low Stock Section

Display:

``` text
Low Stock Products
```

Example:

``` text
Product                     Stock

3000 Combo Pack              8
Kids Special Pack            4
Flower Pot Deluxe             2
```

Button:

``` text
Manage Inventory →
```

------------------------------------------------------------------------

# 11. Dashboard Sales Chart

Optional simple chart:

``` text
Sales Overview

₹
│                 ●
│           ●     │
│       ●   │     ●
│   ●   │   │     │
└────────────────────
 Mon Tue Wed Thu Fri
```

Filters:

``` text
7 Days
30 Days
This Month
```

Do not make the dashboard overly analytical in the MVP.

------------------------------------------------------------------------

# 12. Products Page

Route:

``` text
/admin/products
```

Header:

``` text
Products

Manage your crackers and combo packs

                         + Add Product
```

Toolbar:

``` text
Search products...

Category ▼

Status ▼

Sort ▼
```

------------------------------------------------------------------------

# 13. Product Table

Columns:

``` text
Image
Code
Product Name
Category
Actual Price
Price
Stock
Status
Featured
Actions
```

Example:

``` text
┌────┬──────┬──────────────────────┬────────────┬────────┬───────┬───────┬────────┐
│Img │ Code │ Product              │ Category   │ Actual │ Price │ Stock │ Status │
├────┼──────┼──────────────────────┼────────────┼────────┼───────┼───────┼────────┤
│img │ 251  │ 3000 Combo Pack      │ Combo Pack │ ₹3000  │ ₹300  │ 50    │ Active │
│img │ 252  │ 15000 Family Pack    │ Combo Pack │ ₹15000 │ ₹1500 │ 12    │ Active │
└────┴──────┴──────────────────────┴────────────┴────────┴───────┴───────┴────────┘
```

Actions:

``` text
Edit
Deactivate
Delete
Mark Featured
```

Prefer deactivation over permanent deletion.

------------------------------------------------------------------------

# 14. Add Product Page

Route:

``` text
/admin/products/new
```

Layout:

``` text
Add Product

┌─────────────────────────────┬────────────────────────────┐
│ Product Information         │ Product Image              │
│                             │                            │
│ Product Code                │   ┌──────────────────┐     │
│ [____________]              │   │                  │     │
│                             │   │   Upload Image   │     │
│ Product Name                │   │                  │     │
│ [____________]              │   └──────────────────┘     │
│                             │                            │
│ Description                 │   JPG / PNG / WEBP         │
│ [____________________]      │   Max 5MB                  │
│                             │                            │
│ Content                     │                            │
│ [Box ▼]                     │                            │
│                             │                            │
│ Category                    │                            │
│ [Combo Packs ▼]             │                            │
└─────────────────────────────┴────────────────────────────┘
```

------------------------------------------------------------------------

# 15. Pricing Section

``` text
Pricing

Actual Price
[ ₹3000 ]

Selling Price
[ ₹300 ]

Discount
90% OFF
```

Discount should preferably be calculated automatically.

Example:

``` ts
discount =
  ((actualPrice - price) / actualPrice) * 100;
```

Do not require the admin to manually enter the discount if it can be
calculated.

------------------------------------------------------------------------

# 16. Inventory Section

``` text
Inventory

Stock
[ 100 ]

Minimum Order Quantity
[ 1 ]

Maximum Order Quantity
[ 10 ]
```

Show:

``` text
In Stock
Low Stock
Out of Stock
```

Example:

``` text
100 → In Stock
8   → Low Stock
0   → Out of Stock
```

------------------------------------------------------------------------

# 17. Product Settings

``` text
Product Settings

[✓] Active Product

[ ] Featured Product
```

Active:

``` text
Product visible in customer shop
```

Inactive:

``` text
Product hidden from customer shop
```

Featured:

``` text
Product appears in featured sections
```

------------------------------------------------------------------------

# 18. Product Image Upload UX

Use a drag-and-drop upload box:

``` text
┌──────────────────────────────────────┐
│                                      │
│              ↑                       │
│        Upload product image          │
│                                      │
│    Drag & drop or click to browse    │
│                                      │
│        JPG PNG WEBP · Max 5MB        │
│                                      │
└──────────────────────────────────────┘
```

After upload:

``` text
┌───────────────┐
│               │
│ Product Image │
│               │
└───────────────┘

[Replace] [Remove]
```

Upload flow:

``` text
Select Image
     ↓
Frontend validates type/size
     ↓
Upload to backend / Cloudinary
     ↓
Receive imageUrl
     ↓
Store imageUrl in product form
     ↓
Submit Product
```

------------------------------------------------------------------------

# 19. Product Form Validation

Frontend validation:

``` text
Code       → required
Name       → required
Content    → required
Category   → required
Price      → required
Stock      → required
Image      → optional/required depending on business rules
```

Errors should appear directly below fields.

Example:

``` text
Selling Price

[ -100 ]

Selling price cannot be negative.
```

Use Zod for validation.

------------------------------------------------------------------------

# 20. Categories Page

Route:

``` text
/admin/categories
```

Header:

``` text
Categories

                         + Add Category
```

Table:

``` text
Category
Slug
Products
Sort Order
Status
Actions
```

Example:

``` text
Combo Packs
combo-packs
24 products
1
Active
```

Categories:

``` text
Combo Packs
Sparklers
Flower Pots
Ground Chakkars
Rockets
Kids Special
Fancy Crackers
Gift Packs
```

------------------------------------------------------------------------

# 21. Add Category Modal

Use a modal rather than a separate page.

``` text
Add Category

Category Name
[________________]

Slug
[________________]

Description
[________________]

Sort Order
[1]

[Cancel] [Create Category]
```

Slug can be automatically generated:

``` text
Combo Packs
↓
combo-packs
```

------------------------------------------------------------------------

# 22. Inventory Page

Route:

``` text
/admin/inventory
```

Top statistics:

``` text
Total Stock
Low Stock
Out of Stock
```

Table:

``` text
Product
Code
Current Stock
Status
Update Stock
```

Example:

``` text
3000 Combo Pack
251
50
In Stock
[Update]
```

Update stock modal:

``` text
Update Inventory

Current Stock: 50

New Stock
[100]

[Cancel] [Update]
```

------------------------------------------------------------------------

# 23. Orders Page

Route:

``` text
/admin/orders
```

Header:

``` text
Orders

View and manage customer purchases
```

Toolbar:

``` text
Search order...

Status ▼

Payment ▼

Date ▼
```

------------------------------------------------------------------------

# 24. Orders Table

Columns:

``` text
Order
Customer
Items
Total
Payment
Status
Date
Actions
```

Example:

``` text
┌─────────┬─────────┬───────┬────────┬─────────┬────────────┐
│ Order   │ Customer│ Items │ Total  │ Payment │ Status     │
├─────────┼─────────┼───────┼────────┼─────────┼────────────┤
│ ORD1001 │ Sunil   │ 3     │ ₹2300  │ Paid    │ Processing │
│ ORD1002 │ Arun    │ 5     │ ₹4500  │ Paid    │ Shipped    │
│ ORD1003 │ Priya   │ 2     │ ₹850   │ Pending │ Pending    │
└─────────┴─────────┴───────┴────────┴─────────┴────────────┘
```

------------------------------------------------------------------------

# 25. Order Status Badges

Use subtle badges.

``` text
Pending
background: light beige

Confirmed
background: light blue/gray

Processing
background: light amber

Shipped
background: light blue

Delivered
background: light green

Cancelled
background: light red
```

Keep colors muted.

------------------------------------------------------------------------

# 26. Order Details Page

Route:

``` text
/admin/orders/:id
```

Header:

``` text
Order #ORD1001

Processing

[Update Status]
```

Customer card:

``` text
Customer

Sunil Kumar
+91 XXXXX XXXXX
sunil@example.com
```

Delivery card:

``` text
Delivery Address

Address Line
Salem
Tamil Nadu
636xxx
```

------------------------------------------------------------------------

# 27. Order Items

``` text
Order Items

Image   Product             Price    Qty    Total

img     3000 Combo Pack    ₹300     2      ₹600
img     Flower Pot         ₹150     3      ₹450
img     Rocket Pack        ₹500     1      ₹500
```

------------------------------------------------------------------------

# 28. Order Summary

``` text
Subtotal
₹1550

Shipping
₹50

Discount
₹0

────────────────

Total
₹1600
```

Payment:

``` text
Payment Status: PAID
Payment ID: pay_xxxxx
```

------------------------------------------------------------------------

# 29. Update Order Status

Use a dropdown or status stepper:

``` text
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

Example:

``` text
Status

[ Processing ▼ ]

[Save Status]
```

For cancellation:

``` text
[Cancel Order]
```

Require confirmation before cancellation.

------------------------------------------------------------------------

# 30. Confirmation Dialogs

For destructive actions:

``` text
Deactivate Product?

This product will no longer appear
in the customer store.

[Cancel] [Deactivate]
```

For cancellation:

``` text
Cancel Order?

Are you sure you want to cancel
order #ORD1001?

[Keep Order] [Cancel Order]
```

------------------------------------------------------------------------

# 31. API Integration

Create a central API client.

Example:

``` text
src/
├── api/
│   ├── client.ts
│   ├── auth.ts
│   ├── products.ts
│   ├── categories.ts
│   ├── inventory.ts
│   └── orders.ts
```

Example:

``` ts
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});
```

Environment:

``` env
VITE_API_URL=http://localhost:4000
```

------------------------------------------------------------------------

# 32. Product API Functions

Frontend service:

``` ts
getProducts()
getProduct(id)
createProduct(data)
updateProduct(id, data)
deactivateProduct(id)
toggleFeatured(id)
updateStock(id, stock)
```

Endpoints:

``` text
GET    /admin/products
GET    /admin/products/:id
POST   /admin/products
PATCH  /admin/products/:id
PATCH  /admin/products/:id/status
PATCH  /admin/products/:id/featured
PATCH  /admin/products/:id/stock
```

------------------------------------------------------------------------

# 33. Category API Functions

``` ts
getCategories()
createCategory(data)
updateCategory(id, data)
deactivateCategory(id)
```

------------------------------------------------------------------------

# 34. Order API Functions

``` ts
getOrders(params)
getOrder(id)
updateOrderStatus(id, status)
updatePaymentStatus(id, status)
```

Endpoints:

``` text
GET   /admin/orders
GET   /admin/orders/:id
PATCH /admin/orders/:id/status
PATCH /admin/orders/:id/payment-status
```

------------------------------------------------------------------------

# 35. TanStack Query

Recommended query structure:

``` text
products
product
categories
orders
order
inventory
dashboard
```

Example:

``` ts
useQuery({
  queryKey: ["products", filters],
  queryFn: () => getProducts(filters)
});
```

After creating a product:

``` ts
queryClient.invalidateQueries({
  queryKey: ["products"]
});
```

------------------------------------------------------------------------

# 36. Loading States

Every page should have proper loading UI.

For tables:

``` text
Skeleton rows
```

For forms:

``` text
Creating...
Uploading...
Saving...
```

Never leave the interface blank during API calls.

------------------------------------------------------------------------

# 37. Error Handling

API errors should be displayed using a toast.

Example:

``` text
✓ Product created successfully

✕ Failed to create product

✕ Image upload failed

✕ Unable to load orders
```

Do not expose raw backend errors to the admin.

------------------------------------------------------------------------

# 38. Empty States

Products:

``` text
No products found.

Add your first product to start selling.

[+ Add Product]
```

Orders:

``` text
No orders yet.

Orders will appear here after customers
complete their purchases.
```

Categories:

``` text
No categories created.

[+ Add Category]
```

------------------------------------------------------------------------

# 39. Pagination

Products and orders should use pagination.

Example:

``` text
Showing 1–20 of 128

← Previous

1 2 3 4 5

Next →
```

Do not load hundreds/thousands of records at once.

------------------------------------------------------------------------

# 40. Search

Product search:

``` text
Search by product name or code
```

Orders:

``` text
Search by order number,
customer name or phone
```

Use debouncing for search requests.

Recommended:

``` text
300–500ms debounce
```

------------------------------------------------------------------------

# 41. Responsive Design

Desktop:

``` text
Sidebar + content
```

Tablet:

``` text
Collapsible sidebar
```

Mobile:

``` text
Top navigation
Drawer sidebar
Stacked cards
Horizontal-scroll tables
```

Product forms should become:

``` text
Desktop:
2 columns

Mobile:
1 column
```

------------------------------------------------------------------------

# 42. Recommended Component Structure

``` text
src/
├── components/
│   ├── layout/
│   │   ├── AdminLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Breadcrumbs.tsx
│   │
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── RecentOrders.tsx
│   │   └── LowStockProducts.tsx
│   │
│   ├── products/
│   │   ├── ProductTable.tsx
│   │   ├── ProductForm.tsx
│   │   ├── ProductImageUpload.tsx
│   │   ├── ProductFilters.tsx
│   │   └── ProductActions.tsx
│   │
│   ├── categories/
│   │   ├── CategoryTable.tsx
│   │   └── CategoryModal.tsx
│   │
│   ├── inventory/
│   │   ├── InventoryTable.tsx
│   │   └── UpdateStockModal.tsx
│   │
│   └── orders/
│       ├── OrderTable.tsx
│       ├── OrderDetails.tsx
│       ├── OrderItems.tsx
│       └── OrderStatus.tsx
│
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Products.tsx
│   ├── AddProduct.tsx
│   ├── EditProduct.tsx
│   ├── Categories.tsx
│   ├── Inventory.tsx
│   ├── Orders.tsx
│   ├── OrderDetails.tsx
│   └── Settings.tsx
│
├── api/
├── hooks/
├── schemas/
├── types/
└── utils/
```

------------------------------------------------------------------------

# 43. Route Protection

Customer users must not access admin pages.

Use:

``` text
AdminRoute
```

Flow:

``` text
/admin/products
       ↓
Is authenticated?
       ↓
No → /admin/login
       ↓
Yes
       ↓
Is admin?
       ↓
No → Unauthorized
       ↓
Yes
       ↓
Render page
```

------------------------------------------------------------------------

# 44. Product Form Type

Frontend type:

``` ts
export interface ProductFormData {
  code: string;
  name: string;
  description?: string;
  content: string;
  actualPrice: number;
  price: number;
  stock: number;
  minOrderQty: number;
  maxOrderQty?: number;
  imageUrl?: string;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
}
```

------------------------------------------------------------------------

# 45. UI Design Rules

Follow these rules throughout the admin dashboard.

### Colors

``` text
Background: #FFFFFF
Secondary background: #FAF8F4
Border: #E8E5DF
Primary text: #111827
Secondary text: #6B7280
Accent: warm gold / beige
```

Avoid:

``` text
Neon colors
Heavy gradients
Dark dashboard themes
Excessive shadows
Overly rounded UI
```

### Typography

Use a clean modern font:

``` text
Inter
Manrope
Plus Jakarta Sans
```

Headings should be strong but not oversized.

------------------------------------------------------------------------

# 46. Buttons

Primary:

``` text
+ Add Product
Create Product
Save Changes
Update Stock
```

Secondary:

``` text
Cancel
View
Edit
```

Destructive:

``` text
Delete
Deactivate
Cancel Order
```

Keep buttons compact and professional.

------------------------------------------------------------------------

# 47. Product Creation UX

Ideal flow:

``` text
Products
   ↓
+ Add Product
   ↓
Product Form
   ↓
Upload Image
   ↓
Enter Details
   ↓
Pricing
   ↓
Inventory
   ↓
Settings
   ↓
Create Product
   ↓
Success Toast
   ↓
Redirect to Products
```

After creation:

``` text
Product created successfully
```

Then redirect:

``` text
/admin/products
```

------------------------------------------------------------------------

# 48. MVP Implementation Order

Build the frontend in this order:

## Phase 1

``` text
Admin Login
Admin Layout
Sidebar
Header
Protected Routes
```

## Phase 2

``` text
Dashboard
Statistics
Recent Orders
Low Stock
```

## Phase 3

``` text
Products List
Search
Filter
Pagination
```

## Phase 4

``` text
Add Product
Edit Product
Product Validation
Cloudinary Upload
```

## Phase 5

``` text
Categories
Inventory
```

## Phase 6

``` text
Orders List
Order Details
Order Status
Payment Status
```

## Phase 7

``` text
Responsive Design
Loading States
Error States
Empty States
Polish
```

------------------------------------------------------------------------

# 49. Final Admin Frontend Goal

The final admin experience should feel like a professional modern
commerce dashboard:

``` text
                    DEEPAKART ADMIN

┌──────────────┐ ┌──────────────────────────────────────────┐
│ Dashboard    │ │ Dashboard                                │
│              │ │                                          │
│ Products     │ │  Products   Orders   Sales   Low Stock  │
│              │ │                                          │
│ Categories   │ │  128        342      ₹4.8L     8       │
│              │ │                                          │
│ Inventory    │ │ ┌──────────────────────────────────────┐ │
│              │ │ │ Recent Orders                        │ │
│ Orders       │ │ │                                      │ │
│              │ │ │ ORD1001   Sunil   ₹2300   Processing │ │
│              │ │ │ ORD1002   Priya    ₹4500   Shipped    │ │
│              │ │ └──────────────────────────────────────┘ │
│              │ │                                          │
│ Settings     │ │ ┌──────────────────────────────────────┐ │
│              │ │ │ Low Stock Products                   │ │
│ Logout       │ │ │ 3000 Combo Pack              8        │ │
└──────────────┘ │ │ Kids Special                  4       │ │
                 │ └──────────────────────────────────────┘ │
                 └──────────────────────────────────────────┘
```

The admin frontend should remain focused on **managing the store
efficiently**, while the customer website remains focused on **shopping
and checkout**.
