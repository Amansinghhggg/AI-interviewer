import jwt from "jsonwebtoken";
import User from "../users/user.model.js";
import { signupSchema, loginSchema } from "./auth.validator.js";
import StorageService from "../../shared/services/StorageService.js";



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

    // Candidate specific validation before user creation
    if (validated.role === "candidate") {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "Resume upload is required for candidates" });
      }
      if (req.file.mimetype !== "application/pdf" || !StorageService.validateResume(req.file.buffer)) {
        return res.status(400).json({ success: false, message: "Only valid PDF files are supported" });
      }
    }

    // Create user
    let user = await User.create({
      name: validated.name,
      email: validated.email,
      password: validated.password,
      role: validated.role,
    });

    // Handle Cloudinary upload if candidate
    if (validated.role === "candidate" && req.file) {
      try {
        const result = await StorageService.uploadResume(req.file.buffer, {
          folder: `interviewos/resumes/${user._id}`,
        });

        user.resume = {
          publicId: result.public_id,
          url: result.secure_url,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          uploadedAt: new Date(),
        };

        await user.save();
      } catch (uploadError) {
        console.error("Resume upload failed, rolling back user creation", uploadError);
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({ success: false, message: "Failed to upload resume. Please try again." });
      }
    }

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
      profilePicture: req.user.profilePicture,
      authProvider: req.user.authProvider,
    },
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.name = name;
    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Please provide both passwords" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.authProvider === "google") {
      return res.status(400).json({ success: false, message: "Cannot change password for OAuth account" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

export { signup, login, logout, getMe, updateProfile, updatePassword };
