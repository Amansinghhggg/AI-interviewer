const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { signupSchema, loginSchema } = require("../validators/auth.validator");

// Helper: generate JWT and set cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.status(statusCode).cookie("token", token, cookieOptions).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// @desc    Register user
// @route   POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    // Validate request body
    const validated = signupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create user
    const user = await User.create({
      name: validated.name,
      email: validated.email,
      password: validated.password,
      role: validated.role,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    // Validate request body
    const validated = loginSchema.parse(req.body);

    // Find user and include password field
    const user = await User.findOne({ email: validated.email }).select(
      "+password"
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(validated.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
const logout = async (req, res) => {
  res
    .status(200)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

module.exports = { signup, login, logout, getMe };
