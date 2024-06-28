import express from "express";
import UserController from "../controller/user.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import CategoryController from "../controller/category.controller.js";
import ProductController from "../controller/product.controller.js";

const router = express.Router();

// ---------- user ----------
router.get("/user/selectAll", auth, UserController.selectAll);
router.get("/user/selectOne/:uuid", auth, UserController.selectOne);
router.put("/user/update/:uuid", auth, UserController.updateUser);
router.delete("/user/delete/:uuid", auth, UserController.deleteUser);

router.put("/user/forgot", UserController.forgotPassword);
router.put("/user/updatePassword/:uuid", auth, UserController.updatePassword);
router.put("/user/updateProfile/:uuid", auth, UserController.updateProfile);

router.put("/user/refreshToken", auth, UserController.refreshToken);

router.post("/user/login", UserController.login);
router.post("/user/register", UserController.register);


// ---------- category ----------
router.get("/category/selectAll", auth, CategoryController.selectAll);
router.get("/category/selectOne/:cUuid", auth, CategoryController.selectOne);
router.post("/category/insert", auth, CategoryController.insert);
router.put("/category/update/:cUuid", auth, CategoryController.updateCategory);
router.delete("/category/delete/:cUuid", auth, CategoryController.deleteCategory);


// ---------- category ----------
router.get("/product/selectAll", auth, ProductController.selectAll);
router.get("/product/selectOne/:pUuid", auth, ProductController.selectOne);
router.post("/product/insert", auth, ProductController.insert);
router.put("/product/update/:pUuid", auth, ProductController.updateProduct);
router.delete("/product/delete/:pUuid", auth, ProductController.deleteProduct);

export default router;
