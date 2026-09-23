import express from "express";
import {
  getAllUsers,
  updateProfile,
  updateProfilePic,
} from "../controllers/userController.js";
import { Protect } from "../middleware/authMiddleware.js";
import { uploadMedia } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/allusers", Protect, getAllUsers);
router.put("/profile", Protect, uploadMedia.single("image"), updateProfile);
router.put(
  "/profile-pic",
  Protect,
  uploadMedia.single("image"),
  updateProfilePic,
);

export default router;