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

const router = express.Router();
const adminOnly = [isAuthenticatedUser, authorizeRoles("admin", "superadmin")];

// Public Route
router.get("/", getActiveHeroes);

// Protected Admin Routes
router.get("/admin", adminOnly, getAllHeroesAdmin);

router.post("/", adminOnly, validateRequest(createHeroSchema), createHero);

router
  .route("/:id")
  .put(adminOnly, validateRequest(updateHeroSchema), updateHero)
  .delete(adminOnly, deleteHero);

export default router;
