import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  createInquirySchema,
  updateInquiryStatusSchema,
} from "../validators/inquiryValidator.js";
import {
  createInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry,
} from "../controllers/Inquiry.js";

const router = express.Router();
const adminOnly = [isAuthenticatedUser, authorizeRoles("admin", "superadmin")];

// Public POST / Admin GET
router
  .route("/")
  .post(validateRequest(createInquirySchema), createInquiry)
  .get(adminOnly, getAllInquiries);

// Protected Admin Routes
router
  .route("/:id")
  .get(adminOnly, getInquiryById)
  .patch(
    adminOnly,
    validateRequest(updateInquiryStatusSchema),
    updateInquiryStatus,
  )
  .delete(adminOnly, deleteInquiry);

export default router;
