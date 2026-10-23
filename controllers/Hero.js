// import Hero from "../models/Hero.js";
// import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
// import errorHandler from "../utils/errorHandler.js";
// import cloudinary from "cloudinary";

// // @desc    Get active hero slides for public view
// // @route   GET /api/v1/heroes
// // @access  Public
// export const getActiveHeroes = catchAsyncErrors(async (req, res, next) => {
//   const heroes = await Hero.find({ isActive: true }).sort({
//     order: 1,
//     createdAt: -1,
//   });

//   res.status(200).json({
//     success: true,
//     count: heroes.length,
//     data: heroes,
//   });
// });

// // @desc    Get all hero slides for admin management
// // @route   GET /api/v1/heroes/admin
// // @access  Private/Admin
// export const getAllHeroesAdmin = catchAsyncErrors(async (req, res, next) => {
//   const heroes = await Hero.find().sort({ order: 1, createdAt: -1 });

//   res.status(200).json({
//     success: true,
//     count: heroes.length,
//     data: heroes,
//   });
// });

// // @desc    Create new hero slide
// // @route   POST /api/v1/heroes
// // @access  Private/Admin
// export const createHero = catchAsyncErrors(async (req, res, next) => {
//   const hero = await Hero.create(req.body);

//   res.status(201).json({
//     success: true,
//     message: "Hero slide created successfully",
//     data: hero,
//   });
// });

// // @desc    Update hero slide
// // @route   PUT /api/v1/heroes/:id
// // @access  Private/Admin
// export const updateHero = catchAsyncErrors(async (req, res, next) => {
//   let hero = await Hero.findById(req.params.id);

//   if (!hero) {
//     return next(new errorHandler("Hero slide not found", 404));
//   }

//   hero = await Hero.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   res.status(200).json({
//     success: true,
//     message: "Hero slide updated successfully",
//     data: hero,
//   });
// });

// // @desc    Delete hero slide (Includes Cloudinary image cleanup)
// // @route   DELETE /api/v1/heroes/:id
// // @access  Private/Admin
// export const deleteHero = catchAsyncErrors(async (req, res, next) => {
//   const hero = await Hero.findById(req.params.id);

//   if (!hero) {
//     return next(new errorHandler("Hero slide not found", 404));
//   }

//   // Delete associated Cloudinary image
//   if (hero.image?.public_id) {
//     await cloudinary.v2.uploader.destroy(hero.image.public_id);
//   }

//   await hero.deleteOne();

//   res.status(200).json({
//     success: true,
//     message: "Hero slide deleted successfully",
//   });
// });

import Hero from "../models/Hero.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import errorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";

// @desc    Get active hero slides for public view
// @route   GET /api/v1/heroes
// @access  Public
export const getActiveHeroes = catchAsyncErrors(async (req, res, next) => {
  const heroes = await Hero.find({ isActive: true }).sort({
    order: 1,
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: heroes.length,
    data: heroes,
  });
});

// @desc    Get all hero slides for admin management
// @route   GET /api/v1/heroes/admin
// @access  Private/Admin
export const getAllHeroesAdmin = catchAsyncErrors(async (req, res, next) => {
  const heroes = await Hero.find().sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: heroes.length,
    data: heroes,
  });
});

// @desc    Create new hero slide
// @route   POST /api/v1/heroes
// @access  Private/Admin
export const createHero = catchAsyncErrors(async (req, res, next) => {
  const hero = await Hero.create(req.body);

  res.status(201).json({
    success: true,
    message: "Hero slide created successfully",
    data: hero,
  });
});

// @desc    Update hero slide (with Cloudinary media cleanup on replacement)
// @route   PUT /api/v1/heroes/:id
// @access  Private/Admin
export const updateHero = catchAsyncErrors(async (req, res, next) => {
  let hero = await Hero.findById(req.params.id);

  if (!hero) {
    return next(new errorHandler("Hero slide not found", 404));
  }

  // Delete old Cloudinary asset if new media is uploaded
  if (
    req.body.media?.public_id &&
    req.body.media.public_id !== hero.media?.public_id
  ) {
    const resourceType = hero.mediaType === "video" ? "video" : "image";
    await cloudinary.v2.uploader.destroy(hero.media.public_id, {
      resource_type: resourceType,
    });
  }

  hero = await Hero.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Hero slide updated successfully",
    data: hero,
  });
});

// @desc    Delete hero slide (Includes Cloudinary media cleanup)
// @route   DELETE /api/v1/heroes/:id
// @access  Private/Admin
export const deleteHero = catchAsyncErrors(async (req, res, next) => {
  const hero = await Hero.findById(req.params.id);

  if (!hero) {
    return next(new errorHandler("Hero slide not found", 404));
  }

  // Destroy Cloudinary asset based on resource_type (video vs image)
  if (hero.media?.public_id) {
    const resourceType = hero.mediaType === "video" ? "video" : "image";
    await cloudinary.v2.uploader.destroy(hero.media.public_id, {
      resource_type: resourceType,
    });
  }

  await hero.deleteOne();

  res.status(200).json({
    success: true,
    message: "Hero slide deleted successfully",
  });
});
