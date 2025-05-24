import express from "express";

const router = express.Router();

import {
  RegisterController,
  LoginController,
  LogoutController,
  UpdateProfileController,
  GetCurrentUserController,
  ChangeUserRoleController,
  FollowUserController,
  ToggleUserStatusController,
  GetAllUsersController,
} from "../controllers/auth.controller.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadImageMiddleware.js";

router.post("/register", upload.single("profilePicture"), RegisterController);
router.post("/login", LoginController);

router.post("/logout", requireAuth, LogoutController);
router.put(
  "/update-profile",
  requireAuth,
  upload.single("profilePicture"),
  UpdateProfileController
);
router.get("/current-user", requireAuth, GetCurrentUserController);
router.post("/follow", requireAuth, FollowUserController);
router.put(
  "/change-role",
  requireAuth,
  requireRole(["admin"]),
  ChangeUserRoleController
);
router.put(
  "/toggle-status",
  requireAuth,
  requireRole(["admin"]),
  ToggleUserStatusController
);
router.get(
  "/all-users",
  requireAuth,
  requireRole(["admin"]),
  GetAllUsersController
);

export default router;
