import UserModel from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ================= Register =================
export const RegisterController = async (req, res) => {
  try {
    const { fullName, username, email, password, bio, dateOfBirth } = req.body;

    // Validate dateOfBirth (optional, but recommended)
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();
      if (isNaN(dob.getTime()) || age < 13 || age > 120) {
        return res.status(400).json({
          error: true,
          message:
            "Invalid dateOfBirth: must be a valid date and age between 13 and 120 years",
        });
      }
    }

    const normalizedEmail = email.toLowerCase();

    const existEmail = await UserModel.findOne({
      email: normalizedEmail,
      isActive: true,
    });
    const existUsername = await UserModel.findOne({ username, isActive: true });

    if (existEmail || existUsername) {
      return res.status(400).json({
        error: true,
        message: existEmail
          ? "Email already registered"
          : "Username already taken",
      });
    }

    let profilePicture = null;
    let profilePictureId = null;

    if (req.file) {
      profilePicture = req.file.path || req.file.location;
      profilePictureId = req.file.filename || req.file.public_id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      fullName,
      username,
      email: normalizedEmail,
      password: hashedPassword,
      profilePicture,
      profilePictureId,
      bio,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    });

    await newUser.save();

    const userData = newUser.toObject();
    delete userData.password;

    // Format dateOfBirth before sending response
    if (userData.dateOfBirth) {
      userData.dateOfBirth = userData.dateOfBirth.toISOString().split("T")[0];
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userData,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================= Login =================
export const LoginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: "All fields are required",
      });
    }

    const findUser = await UserModel.findOne({ email });

    if (!findUser || !findUser.isActive) {
      return res.status(400).json({
        error: true,
        message: "User not found or inactive",
      });
    }

    const isMatch = await bcrypt.compare(password, findUser.password);
    if (!isMatch) {
      return res.status(400).json({
        error: true,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      { id: findUser._id, email: findUser.email, role: findUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, // ✅ true only in production (Render)
      sameSite: isProduction ? "None" : "Lax", // ✅ cross-site safe
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userData } = findUser.toObject();

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: userData,
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================= Logout =================
export const LogoutController = (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================= Update Profile =================
export const UpdateProfileController = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const existingUser = await UserModel.findById(userId);
    if (!existingUser || !existingUser.isActive) {
      return res.status(404).json({ message: "User not found or inactive" });
    }

    const { fullName, username, bio, dateOfBirth } = req.body;

    // Validate dateOfBirth (optional)
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();
      if (isNaN(dob.getTime()) || age < 13 || age > 120) {
        return res.status(400).json({
          error: true,
          message:
            "Invalid dateOfBirth: must be a valid date and age between 13 and 120 years",
        });
      }
    }

    // Check if username taken
    if (username && username !== existingUser.username) {
      const usernameExists = await UserModel.findOne({
        username,
        _id: { $ne: userId },
      });
      if (usernameExists) {
        return res
          .status(400)
          .json({ error: true, message: "Username already taken" });
      }
    }

    // If new file uploaded, delete old image from Cloudinary
    if (req.file) {
      if (existingUser.profilePictureId) {
        await cloudinary.uploader.destroy(existingUser.profilePictureId);
      }
    }

    // Use new image data if uploaded, else keep old
    const profilePicture = req.file
      ? req.file.path || req.file.location
      : existingUser.profilePicture;
    const profilePictureId = req.file
      ? req.file.filename || req.file.public_id
      : existingUser.profilePictureId;

    // Update user fields
    existingUser.fullName = fullName || existingUser.fullName;
    existingUser.username = username || existingUser.username;
    existingUser.bio = bio || existingUser.bio;
    existingUser.dateOfBirth = dateOfBirth
      ? new Date(dateOfBirth)
      : existingUser.dateOfBirth;
    existingUser.profilePicture = profilePicture;
    existingUser.profilePictureId = profilePictureId;

    await existingUser.save();

    const userData = existingUser.toObject();
    delete userData.password;

    // Format dateOfBirth before sending response
    if (userData.dateOfBirth) {
      userData.dateOfBirth = userData.dateOfBirth.toISOString().split("T")[0];
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================= Get Current User =================
export const GetCurrentUserController = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(decoded.id)
      .select("-password")
      .populate("followers", "fullName username profilePicture")
      .populate("following", "fullName username profilePicture");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Current User Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================= Get User By username =================
export const GetUserByUsernameController = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await UserModel.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const userData = user.toObject();
    delete userData.password;

    // Format dateOfBirth before sending response
    if (userData.dateOfBirth) {
      userData.dateOfBirth = userData.dateOfBirth.toISOString().split("T")[0];
    }
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Get User By Username Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

export const ChangeUserRoleController = async (req, res) => {
  try {
    const { userId, newRole } = req.body;

    if (!["user", "admin"].includes(newRole)) {
      return res.status(400).json({ error: true, message: "Invalid role" });
    }

    const user = await UserModel.findById(userId);
    if (!user)
      return res.status(404).json({ error: true, message: "User not found" });

    user.role = newRole;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "User role updated successfully" });
  } catch (error) {
    console.error("Change Role Error:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

export const FollowUserController = async (req, res) => {
  try {
    const currentUserId = req.user.id; // from middleware
    const { targetUserId } = req.body;

    if (currentUserId === targetUserId) {
      return res
        .status(400)
        .json({ error: true, message: "You can't follow yourself" });
    }

    const currentUser = await UserModel.findById(currentUserId);
    const targetUser = await UserModel.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: isFollowing
        ? "Unfollowed successfully"
        : "Followed successfully",
    });
  } catch (error) {
    console.error("Follow/Unfollow Error:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

export const ToggleUserStatusController = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await UserModel.findById(userId);
    if (!user)
      return res.status(404).json({ error: true, message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${
        user.isActive ? "reactivated" : "deactivated"
      } successfully`,
    });
  } catch (error) {
    console.error("Toggle Status Error:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

export const GetAllUsersController = async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");

    return res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================= Get Following List =================
export const getFollowingController = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await UserModel.findById(userId)
      .select("following")
      .populate("following", "fullName username profilePicture");

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Following list fetched successfully",
      following: user.following,
    });
  } catch (error) {
    console.error("Get Following Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================= Get Followers List =================
export const getFollowersController = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await UserModel.findById(userId)
      .select("followers")
      .populate("followers", "fullName username profilePicture");

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Followers list fetched successfully",
      followers: user.followers,
    });
  } catch (error) {
    console.error("Get Followers Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};
