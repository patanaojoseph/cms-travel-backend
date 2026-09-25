import Hero from "../models/Hero.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import errorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";

// // @desc    Get active hero slides for public homepage
// // @route   GET /api/v1/heroes
// // @access  Public
// export const getActiveHeroes = catchAsyncErrors(async (req, res, next) => {
//   const heroes = await Hero.find({ isActive: true }).sort({ order: 1 });

//   res.status(200).json({
//     success: true,
//     count: heroes.length,
//     data: heroes,
//   });
// });

// // @desc    Get all hero slides (Admin view, includes inactive)
// // @route   GET /api/v1/heroes/admin
// // @access  Private/Admin
// export const getAllHeroesAdmin = catchAsyncErrors(async (req, res, next) => {
//   const heroes = await Hero.find().sort({ order: 1 });

//   res.status(200).json({
//     success: true,
//     count: heroes.length,
//     data: heroes,
//   });
// });

// // @desc    Create a new hero slide
// // @route   POST /api/v1/heroes
// // @access  Private/Admin
// export const createHero = catchAsyncErrors(async (req, res, next) => {
//   const {
//     title,
//     subtitle,
//     description,
//     ctaLink,
//     ctaText,
//     order,
//     isActive,
//     image,
//   } = req.body;

//   if (!image || !image.url || !image.public_id) {
//     return next(
//       new errorHandler("Please provide an image with public_id and url", 400),
//     );
//   }

//   const hero = await Hero.create({
//     title,
//     subtitle,
//     description,
//     ctaLink,
//     ctaText,
//     order,
//     isActive,
//     image,
//   });

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

//   // If a new image is provided, clean up the old image from Cloudinary
//   if (req.body.image && req.body.image.public_id !== hero.image.public_id) {
//     if (hero.image.public_id) {
//       await cloudinary.v2.uploader.destroy(hero.image.public_id);
//     }
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

// // @desc    Delete hero slide
// // @route   DELETE /api/v1/heroes/:id
// // @access  Private/Admin
// export const deleteHero = catchAsyncErrors(async (req, res, next) => {
//   const hero = await Hero.findById(req.params.id);

//   if (!hero) {
//     return next(new errorHandler("Hero slide not found", 404));
//   }

//   // Delete image from Cloudinary
//   if (hero.image && hero.image.public_id) {
//     await cloudinary.v2.uploader.destroy(hero.image.public_id);
//   }

//   await hero.deleteOne();

//   res.status(200).json({
//     success: true,
//     message: "Hero slide deleted successfully",
//   });
// });

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

// @desc    Update hero slide
// @route   PUT /api/v1/heroes/:id
// @access  Private/Admin
export const updateHero = catchAsyncErrors(async (req, res, next) => {
  let hero = await Hero.findById(req.params.id);

  if (!hero) {
    return next(new errorHandler("Hero slide not found", 404));
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

// @desc    Delete hero slide (Includes Cloudinary image cleanup)
// @route   DELETE /api/v1/heroes/:id
// @access  Private/Admin
export const deleteHero = catchAsyncErrors(async (req, res, next) => {
  const hero = await Hero.findById(req.params.id);

  if (!hero) {
    return next(new errorHandler("Hero slide not found", 404));
  }

  // Delete associated Cloudinary image
  if (hero.image?.public_id) {
    await cloudinary.v2.uploader.destroy(hero.image.public_id);
  }

  await hero.deleteOne();

  res.status(200).json({
    success: true,
    message: "Hero slide deleted successfully",
  });
});
