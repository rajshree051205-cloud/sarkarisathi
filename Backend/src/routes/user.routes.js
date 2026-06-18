import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/User.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// secured route — must be logged in to log out
router.route("/logout").post(verifyJWT, logoutUser);

export default router;