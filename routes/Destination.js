import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  createDestinationSchema,
  updateDestinationSchema,
} from "../validators/destinationValidator.js";
import {
  getAllDestinations,
  getDestinationBySlug,
  createDestination,
  updateDestination,
  deleteDestination,
} from "../controllers/Destination.js";

const router = express.Router();
const adminOnly = [isAuthenticatedUser, authorizeRoles("admin", "superadmin")];

// Public Routes
router.route("/").get(getAllDestinations);
router.route("/slug/:slug").get(getDestinationBySlug);

// Protected Admin Routes with Validation
router
  .route("/")
  .post(adminOnly, validateRequest(createDestinationSchema), createDestination);

router
  .route("/:id")
  .put(adminOnly, validateRequest(updateDestinationSchema), updateDestination)
  .delete(adminOnly, deleteDestination);

export default router;
