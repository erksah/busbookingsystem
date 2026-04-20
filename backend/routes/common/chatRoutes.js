import express from "express";
import { handleChat, getChatHistory, clearChatHistory } from "../../controllers/common/chatController.js";

const router = express.Router();

router.get("/:sessionId", getChatHistory);
router.delete("/:sessionId", clearChatHistory);
router.post("/", handleChat);

export default router;
