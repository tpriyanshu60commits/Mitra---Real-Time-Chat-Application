import express from "express";
import { UserRegister, UserLogin, GoogleUserLogin } from "../controllers/authController.js";
import { GoogleProtect } from "../middleware/googleMiddleware.js";

const router = express.Router();

router.post("/register", UserRegister);
router.post("/login", UserLogin);
router.post("/googleLogin", GoogleProtect, GoogleUserLogin);

export default router;