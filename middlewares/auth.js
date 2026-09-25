import jwt from "jsonwebtoken";
import catchAsyncErrors from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import User from "../models/User.js";

// GATEWAY 1: Verify user authentication state via session validations
export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  let token;

  // Extract from HTTP cookies or check fallback request Authorization headers
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ErrorHandler(
        "Login session not found. Please access the portal credentials interface.",
        401,
      ),
    );
  }

  try {
    // Cryptographically verify token parameters against system signature key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user pointer context into Express request cycle
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(
        new ErrorHandler(
          "User account associated with this token no longer exists.",
          401,
        ),
      );
    }

    next();
  } catch (error) {
    return next(
      new ErrorHandler(
        "Invalid or expired session token. Please log in again.",
        401,
      ),
    );
  }
});

// Alias export for consistency across routes
export { isAuthenticatedUser as isAuthenticated };

// GATEWAY 2: Strict Systemic Access Restrictions (Role-Based Firewall Rule)
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if current user matches allowed system role definitions
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Unauthorized Access Encountered. User role '${req.user?.role}' cannot perform target operations.`,
          403,
        ),
      );
    }
    next();
  };
};
