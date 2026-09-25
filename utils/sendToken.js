import jwt from "jsonwebtoken";

// Project Travel Stateless JWT Cookie Delivery Layer
const sendToken = (user, statusCode, res) => {
  // 1. Generate the JSON Web Token using the User Model method or standalone signature
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_TIME || "7d",
    },
  );

  // SECURITY RECOVERY INTEGRATION FIX:
  // Puwersahing maging tunay na Integer Number ang string property mula sa .env file mo
  const cookieExpiresDays = parseInt(process.env.COOKIE_EXPIRES_TIME, 10) || 7;

  // 2. Configure HttpOnly Cookie transport properties for absolute security
  const cookieOptions = {
    expires: new Date(
      Date.now() + cookieExpiresDays * 24 * 60 * 60 * 1000, // Siguradong tumpak na milliseconds array value na ngayon!
    ),
    httpOnly: true, // Prevents client-side scripts from reading token bytes
    secure: process.env.NODE_ENV === "PRODUCTION", // Enforces HTTPS encryption injection in production
    sameSite: process.env.NODE_ENV === "PRODUCTION" ? "None" : "Lax", // Dynamic support para sa cross-origin deployments
  };

  // 3. Scrub password records entirely before passing the document model downstream
  if (user.password) {
    user.password = undefined;
  }

  // 4. Return successful JSON validation signature package back to client applications
  res.status(statusCode).cookie("token", token, cookieOptions).json({
    success: true,
    token,
    user,
  });
};

export default sendToken;
