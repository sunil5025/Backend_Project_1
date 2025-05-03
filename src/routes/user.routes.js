import { Router } from "express";
import { changeCurrentPassword,
         getCurrentUser,
          getUserChannelProfile,
           getWatchedHistory,
           loginUser,
            logoutUser,
             refreshAccessToken,
              registerUser,
               updateAccountDeatils,
                updateUserAvatar,
                 updateUserCoverImage } from "../controllers/user.controller.js";
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

router.route("/refresh-token").post(refreshAccessToken) // Refresh access token

router.route("/change-password").post(verifyJWT, changeCurrentPassword) // Change current password

router.route("/current-user").get(verifyJWT, getCurrentUser) // Get current user

router.route("/update-account").patch(verifyJWT, updateAccountDeatils) // Update account details

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar) // Update user avatar

router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage) // Update user cover image

router.route("/c/:username").get(verifyJWT,getUserChannelProfile) // Get user channel profile

router.route("/history").get(verifyJWT, getWatchedHistory) // Get user history


export default router
// Define your user-related routes here