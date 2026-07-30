import jwt from "jsonwebtoken";
import User from "../users/user.model.js";

// Protect routes — verify JWT from cookie
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — no token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — user not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized — invalid token",
    });
  }
};

// Authorize by role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Require employer account to be verified
export const requireVerifiedEmployer = (req, res, next) => {
  if (req.user && req.user.role === "employer" && !req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Your employer account is not verified. Only verified employers can create campaigns.",
    });
  }
  next();
};

