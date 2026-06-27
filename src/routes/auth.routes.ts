import { Router } from "express";
import { authRequired } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  forgotPasswordController,
  loginController,
  logoutController,
  meController,
  registerController,
  resetPasswordController,
} from "../controllers/auth.controller";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "../validation/auth";

const router = Router();

router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);
router.post("/logout", authRequired, logoutController);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPasswordController);
router.post("/reset-password", validate(resetPasswordSchema), resetPasswordController);
router.get("/me", authRequired, meController);

export { router as authRoutes };
