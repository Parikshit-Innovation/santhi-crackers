import Router from "express";
import { createCategory, createProduct, getCart, getCrackersData, getProductsByCategory } from "./controller.js";
import { corsMiddleware } from "./utils.js";

const router = Router();

router.use(corsMiddleware);

router.get("/items", getCrackersData);
router.post("/items", createProduct);
router.post("/categories", createCategory);
router.get("/categories/:slug", getProductsByCategory);
router.get("/cart", getCart);

export default router;
