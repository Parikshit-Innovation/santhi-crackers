import Router from "express";
import { createCategory, createProduct, getCart, getCrackersData } from "./controller.js";

const router = Router();

router.get("/items", getCrackersData);
router.post("/items", createProduct);
router.post("/categories", createCategory);
router.get("/cart", getCart);

export default router;
