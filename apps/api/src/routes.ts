import Router from "express";
import { getItems } from "./controller.js";

const router = Router();

router.get("/items", getItems);

export default router;