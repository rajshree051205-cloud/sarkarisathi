import { Router } from "express";
import { registerUser, loginUser, logoutUser ,getCurrentUser } from "../controllers/User.controller.js";
import { verifyJWT } from "../middlewares/Auth.middlewares.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// secured route — must be logged in to log out
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);

export default router;