import express from "express";
import { getAllUsers, updateProfile } from "../controllers/userController.js";
import { Protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/allusers", Protect, getAllUsers);
router.put("/profile", Protect, updateProfile);

export default router;