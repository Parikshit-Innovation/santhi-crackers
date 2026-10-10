import Router from "express";
import {
  createCategory,
  createProduct,
  getCart,
  getCrackersData,
  getProductById,
  updateProduct,
  updateProductStatus,
  updateProductFeatured,
  updateProductStock,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "./controller.js";

const router = Router();

// Existing routes from main
router.get("/items", getCrackersData);
router.post("/items", createProduct);
router.post("/categories", createCategory);
router.get("/cart", getCart);

// ==========================================
// 1. /admin/products/:id/edit - Product Edit APIs
// ==========================================
router.get("/admin/products/:id", getProductById);
router.get("/admin/products/:id/edit", getProductById);
router.get("/products/:id", getProductById);
router.patch("/admin/products/:id", updateProduct);
router.put("/admin/products/:id", updateProduct);
router.patch("/products/:id", updateProduct);
router.patch("/admin/products/:id/status", updateProductStatus);
router.patch("/admin/products/:id/featured", updateProductFeatured);
router.patch("/admin/products/:id/stock", updateProductStock);

// ==========================================
// 2. /admin/categories - Category Management APIs
// ==========================================
router.get("/admin/categories", getCategories);
router.get("/categories", getCategories);
router.post("/admin/categories", createCategory);
router.get("/admin/categories/:id", getCategoryById);
router.get("/categories/:id", getCategoryById);
router.patch("/admin/categories/:id", updateCategory);
router.put("/admin/categories/:id", updateCategory);
router.patch("/categories/:id", updateCategory);
router.delete("/admin/categories/:id", deleteCategory);
router.delete("/categories/:id", deleteCategory);

export default router;
