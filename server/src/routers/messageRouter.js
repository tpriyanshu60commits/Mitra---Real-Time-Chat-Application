import express from "express";
import {
  SendMessage,
  GetMessages,
  GetConversations,
  StreamMessageFile,
} from "../controllers/messageController.js";
import { Protect } from "../middleware/authMiddleware.js";
import { uploadMedia } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/send", Protect, uploadMedia.single("file"), SendMessage);
router.get("/conversations", Protect, GetConversations);
router.get("/file/:messageId", StreamMessageFile);
router.get("/download/:messageId", StreamMessageFile);
router.get("/:friendId", Protect, GetMessages);

export default router;


