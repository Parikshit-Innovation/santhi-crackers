import Router from "express";
import { loginAdmin, requireAdmin } from "./admin-auth.js";
import {
  createCategory,
  createProduct,
  createQuery,
  deleteProduct,
  getCart,
  getCategories,
  getCategoryBySlug,
  getCrackersData,
  getProductById,
  getQueries,
  handleContactForm,
  updateCategory,
  updateProduct,
} from "./controller.js";
import { getAdminInventory, updateProductStock } from "./inventory.js";
import { createOrder, getAdminOrderById, getAdminOrders } from "./orders.js";
import { corsMiddleware } from "./utils.js";

const router = Router();

router.use(corsMiddleware);

router.post("/admin/login", loginAdmin);
router.get("/admin/orders", requireAdmin, getAdminOrders);
router.get("/admin/orders/:id", requireAdmin, getAdminOrderById);
router.get("/admin/inventory", requireAdmin, getAdminInventory);
router.patch("/admin/inventory/:id", requireAdmin, updateProductStock);
router.post("/orders", createOrder);

router.get("/products", getCrackersData);
router.post("/product", createProduct);
// router.post("/products", createProduct);

router.get("/product/:id", getProductById);
router.get("/products/:id", getProductById);

router.put("/product/:id", updateProduct);
router.put("/products/:id", updateProduct);
router.patch("/product/:id", updateProduct);
router.patch("/products/:id", updateProduct);

router.delete("/product/:id", deleteProduct);
router.delete("/products/:id", deleteProduct);

router.get("/categories", getCategories);
router.get("/categories/:slug", getCategoryBySlug);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.patch("/categories/:id", updateCategory);
router.put("/category/:id", updateCategory);
router.patch("/category/:id", updateCategory);
router.get("/cart", getCart);

// Contact / Mail / Queries APIs
router.post("/contact", handleContactForm);
router.post("/send-email", handleContactForm);
router.post("/queries", createQuery);
router.get("/queries", getQueries);

export default router;
