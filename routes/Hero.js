import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  createHeroSchema,
  updateHeroSchema,
} from "../validators/heroValidator.js";
import {
  getActiveHeroes,
  getAllHeroesAdmin,
  createHero,
  updateHero,
  deleteHero,
} from "../controllers/Hero.js";
import { uploadMedia } from "../config/cloudinaryConfig.js";

const router = express.Router();
const adminOnly = [isAuthenticatedUser, authorizeRoles("admin", "superadmin")];

// Public Route
router.get("/", getActiveHeroes);

// Protected Admin Routes
router.get("/admin", adminOnly, getAllHeroesAdmin);

// 1. UPLOAD ROUTE MUST COME BEFORE /:id to prevent parameter capture
router.post(
  "/upload",
  isAuthenticatedUser,
  authorizeRoles("admin", "superadmin"),
  uploadMedia.single("media"),
  (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    res.status(200).json({
      success: true,
      media: {
        public_id: req.file.filename,
        url: req.file.path,
      },
      mediaType: req.file.mimetype.startsWith("video/") ? "video" : "image",
    });
  },
);

router.post("/", adminOnly, validateRequest(createHeroSchema), createHero);

router
  .route("/:id")
  .put(adminOnly, validateRequest(updateHeroSchema), updateHero)
  .delete(adminOnly, deleteHero);

export default router;
