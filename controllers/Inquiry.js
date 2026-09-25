import Inquiry from "../models/Inquiry.js";
import Destination from "../models/Destination.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import errorHandler from "../utils/errorHandler.js";

// @desc    Create a new public inquiry
// @route   POST /api/v1/inquiries
// @access  Public
export const createInquiry = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, message, destinationId } = req.body;

  if (destinationId) {
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return next(new errorHandler("Destination not found", 404));
    }
  }

  const inquiry = await Inquiry.create({
    name,
    email,
    phone,
    message,
    destination: destinationId || null,
  });

  res.status(201).json({
    success: true,
    message: "Inquiry submitted successfully! We will get back to you soon.",
    data: inquiry,
  });
});

// @desc    Get all inquiries (with pagination, status filter, & populate destination)
// @route   GET /api/v1/inquiries
// @access  Private/Admin
export const getAllInquiries = catchAsyncErrors(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.status) {
    query.status = req.query.status;
  }

  const inquiries = await Inquiry.find(query)
    .populate("destination", "title location.region category slug")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalInquiries = await Inquiry.countDocuments(query);

  res.status(200).json({
    success: true,
    count: inquiries.length,
    total: totalInquiries,
    page,
    pages: Math.ceil(totalInquiries / limit),
    data: inquiries,
  });
});

// @desc    Get single inquiry by ID
// @route   GET /api/v1/inquiries/:id
// @access  Private/Admin
export const getInquiryById = catchAsyncErrors(async (req, res, next) => {
  const inquiry = await Inquiry.findById(req.params.id).populate(
    "destination",
    "title location.region category slug",
  );

  if (!inquiry) {
    return next(new errorHandler("Inquiry not found", 404));
  }

  res.status(200).json({
    success: true,
    data: inquiry,
  });
});

// @desc    Update inquiry status ('pending' -> 'resolved')
// @route   PATCH /api/v1/inquiries/:id
// @access  Private/Admin
export const updateInquiryStatus = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.body;

  const inquiry = await Inquiry.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  ).populate("destination", "title location.region category slug");

  if (!inquiry) {
    return next(new errorHandler("Inquiry not found", 404));
  }

  res.status(200).json({
    success: true,
    message: `Inquiry marked as ${status}`,
    data: inquiry,
  });
});

// @desc    Delete inquiry
// @route   DELETE /api/v1/inquiries/:id
// @access  Private/Admin
export const deleteInquiry = catchAsyncErrors(async (req, res, next) => {
  const inquiry = await Inquiry.findByIdAndDelete(req.params.id);

  if (!inquiry) {
    return next(new errorHandler("Inquiry not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Inquiry deleted successfully",
  });
});
