import express from "express";
import UserController from "../controller/user.controller.js";
import { auth } from "../middleware/auth.middleware.js";

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

export default router;
