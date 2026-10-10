import Router from "express";
import {
    clearAdminSession,
    createAdminProduct,
    createAdminSession,
    createCategory,
    createCloudinaryUploadSignature,
    createProduct,
    getAdminCategories,
    getAdminProducts,
    getCart,
    getCrackersData,
    requireAdminSession,
    requireSameOrigin,
    updateAdminProduct,
} from "./controller.js";

const router = Router();

router.get("/items", getCrackersData);
router.post("/items", requireAdminSession, requireSameOrigin, createProduct);
router.post("/categories", requireAdminSession, requireSameOrigin, createCategory);
router.get("/cart", getCart);

router.post("/admin/session", requireSameOrigin, createAdminSession);
router.delete("/admin/session", requireSameOrigin, clearAdminSession);
router.get("/admin/categories", requireAdminSession, getAdminCategories);
router.post("/admin/categories", requireAdminSession, requireSameOrigin, createCategory);
router.get("/admin/products", requireAdminSession, getAdminProducts);
router.post("/admin/products", requireAdminSession, requireSameOrigin, createAdminProduct);
router.patch("/admin/products/:id", requireAdminSession, requireSameOrigin, updateAdminProduct);
router.post(
	"/admin/cloudinary/signature",
	requireAdminSession,
	requireSameOrigin,
	createCloudinaryUploadSignature,
);

export default router;
