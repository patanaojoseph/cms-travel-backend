import Destination from "../models/Destination.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import errorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";

// @desc    Get all active destinations (Filter, Search, Pagination)
// @route   GET /api/v1/destinations
// @access  Public
export const getAllDestinations = catchAsyncErrors(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = {};

  if (req.query.category) query.category = req.query.category;
  if (req.query.budgetLevel) query.budgetLevel = req.query.budgetLevel;
  if (req.query.country)
    query["location.country"] = { $regex: req.query.country, $options: "i" };
  if (req.query.isFeatured) query.isFeatured = req.query.isFeatured === "true";

  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: "i" } },
      { shortDescription: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const destinations = await Destination.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Destination.countDocuments(query);

  res.status(200).json({
    success: true,
    count: destinations.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: destinations,
  });
});

// @desc    Get single destination by slug
// @route   GET /api/v1/destinations/slug/:slug
// @access  Public
export const getDestinationBySlug = catchAsyncErrors(async (req, res, next) => {
  const destination = await Destination.findOne({ slug: req.params.slug });

  if (!destination) {
    return next(new errorHandler("Destination not found", 404));
  }

  res.status(200).json({
    success: true,
    data: destination,
  });
});

// @desc    Create a new destination
// @route   POST /api/v1/destinations
// @access  Private/Admin
export const createDestination = catchAsyncErrors(async (req, res, next) => {
  req.body.createdBy = req.user._id;

  const destination = await Destination.create(req.body);

  res.status(201).json({
    success: true,
    message: "Destination created successfully",
    data: destination,
  });
});

// @desc    Update destination
// @route   PUT /api/v1/destinations/:id
// @access  Private/Admin
export const updateDestination = catchAsyncErrors(async (req, res, next) => {
  let destination = await Destination.findById(req.params.id);

  if (!destination) {
    return next(new errorHandler("Destination not found", 404));
  }

  // Update slug if title is modified (since findByIdAndUpdate bypasses pre-save hook)
  if (req.body.title) {
    req.body.slug = req.body.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  destination = await Destination.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Destination updated successfully",
    data: destination,
  });
});

// @desc    Delete destination (Includes parallel Cloudinary cleanup)
// @route   DELETE /api/v1/destinations/:id
// @access  Private/Admin
export const deleteDestination = catchAsyncErrors(async (req, res, next) => {
  const destination = await Destination.findById(req.params.id);

  if (!destination) {
    return next(new errorHandler("Destination not found", 404));
  }

  const deletePromises = [];

  if (destination.featuredImage?.public_id) {
    deletePromises.push(
      cloudinary.v2.uploader.destroy(destination.featuredImage.public_id),
    );
  }

  if (destination.gallery?.length > 0) {
    destination.gallery.forEach((img) => {
      if (img.public_id) {
        deletePromises.push(cloudinary.v2.uploader.destroy(img.public_id));
      }
    });
  }

  if (deletePromises.length > 0) {
    await Promise.all(deletePromises);
  }

  await destination.deleteOne();

  res.status(200).json({
    success: true,
    message: "Destination deleted successfully",
  });
});
