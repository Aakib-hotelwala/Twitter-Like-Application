import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getSearchSuggestions } from "../controllers/search.controller.js";

const router = express.Router();

router.get("/suggestions", requireAuth, getSearchSuggestions);

export default router;
