import User from "../models/User.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/sendToken.js";

// @desc    Authenticate Administrative User & Issue Session Token
// @route   POST /api/v1/auth/login
// @access  Public (Hidden Route Gate)
export const loginAdmin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Query user record while explicitly including password field
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(
      new ErrorHandler(
        "Invalid system administration credentials supplied",
        401,
      ),
    );
  }

  // 2. Compare password using user model instance method
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(
      new ErrorHandler(
        "Invalid system administration credentials supplied",
        401,
      ),
    );
  }

  // 3. Issue session token via HttpOnly cookie
  sendToken(user, 200, res);
});

// @desc    Retrieve Current Authenticated Session Profile details
// @route   GET /api/v1/auth/me
// @access  Private (Admins Only)
export const getAdminProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Clear Administrative Session Cookies (Logout)
// @route   GET /api/v1/auth/logout
// @access  Public
export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: process.env.NODE_ENV === "PRODUCTION",
    sameSite: process.env.NODE_ENV === "PRODUCTION" ? "None" : "Lax",
  });

  res.status(200).json({
    success: true,
    message: "Administrative portal session terminated successfully.",
  });
});

// @desc    Update Admin Password
// @route   PUT /api/v1/auth/password/update
// @access  Private (Admins Only)
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    return next(new ErrorHandler("Incorrect current password", 401));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

// @desc    Verify current password for secure operations
// @route   POST /api/v1/auth/password/verify
// @access  Private (Admins Only)
export const verifyPassword = catchAsyncErrors(async (req, res, next) => {
  const { password } = req.body;
  const user = await User.findById(req.user.id).select("+password");

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new ErrorHandler("Invalid admin password", 401));
  }

  res.status(200).json({ success: true });
});
