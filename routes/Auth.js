import express from "express";
import {
  loginAdmin,
  getAdminProfile,
  logoutAdmin,
  updatePassword,
  verifyPassword,
} from "../controllers/Auth.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  loginSchema,
  updatePasswordSchema,
  verifyPasswordSchema,
} from "../validators/authValidator.js";

const router = express.Router();

router.post("/login", validateRequest(loginSchema), loginAdmin);
router.get("/logout", logoutAdmin);

// Protected Identity State Route Gate
router.get("/me", isAuthenticatedUser, getAdminProfile);

router.put(
  "/password/update",
  isAuthenticatedUser,
  validateRequest(updatePasswordSchema),
  updatePassword,
);

router.post(
  "/password/verify",
  isAuthenticatedUser,
  validateRequest(verifyPasswordSchema),
  verifyPassword,
);

export default router;
