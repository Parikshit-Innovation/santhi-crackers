import Router from "express";
import {
  createCategory,
  createProduct,
  getCart,
  getCategories,
  getCategoryBySlug,
  getCrackersData,
  getProductById,
  getProducts,
} from "./controller.js";
import { corsMiddleware } from "./utils.js";

const router = Router();

router.use(corsMiddleware);

router.get("/items", getCrackersData);
router.post("/items", createProduct);
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.get("/categories", getCategories);
router.get("/categories/:slug", getCategoryBySlug);
router.post("/categories", createCategory);
router.get("/cart", getCart);

export default router;
