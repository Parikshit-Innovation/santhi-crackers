import Router from "express";
import {
  createCategory,
  createProduct,
  getCart,
  getCrackersData,
  getProducts,
} from "./controller.js";

const router = Router();

router.get("/items", getCrackersData);
router.post("/items", createProduct);
router.get("/products", getProducts);
router.post("/categories", createCategory);
router.get("/cart", getCart);

export default router;
