import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 5
        }
    ]),
    registerUser
) // Register a new user


router.route("/login").post(loginUser) // Login a user

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser) // Logout a user



export default router
// Define your user-related routes here