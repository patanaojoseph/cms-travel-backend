export default (err, req, res, next) => {
  let error = {
    statusCode: err.statusCode || 500,
    message: err.message || "Internal Server Error",
  };

  // CASE 1: Paghawak sa Maling Mongoose Object ID (CastError)
  if (err.name === "CastError") {
    error.message = `Resource not found. Invalid Mongoose ID Field: ${err.path}`;
    error.statusCode = 400;
  }

  // CASE 2: Paghawak sa Mongoose Validation Failures (Validation Error)
  if (err.name === "ValidationError") {
    error.message = Object.values(err.errors)
      .map((value) => value.message)
      .join(", ");
    error.statusCode = 400;
  }

  // CASE 3: Handling Duplicate Key Entry sa MongoDB Unique Indices (e.g. Same Email Registration)
  if (err.code === 11000) {
    error.message = `Duplicate entry error. Field entry: ${Object.keys(err.keyValue)} already exists.`;
    error.statusCode = 400;
  }

  // CASE 4: Invalid/Expired JSON Web Tokens (JWT Validation Failures)
  if (err.name === "JsonWebTokenError") {
    error.message =
      "JSON Web Token configuration parameters are invalid. Try again.";
    error.statusCode = 400;
  }

  if (err.name === "TokenExpiredError") {
    error.message =
      "JSON Web Token has expired. Secure validation session terminated.";
    error.statusCode = 400;
  }

  // I-return ang pinal na malinis na JSON structured payload sa Client Side Browser Interface
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    // Ipakita lang natin ang detalyadong error stack kung hindi pa naka-Production build ang server
    ...(process.env.NODE_ENV === "DEVELOPMENT" && { errorStack: err.stack }),
  });
};
