import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

export const requireAuth = async (req, res, next) => {
  try {
    // Support token from cookie or header
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ error: true, message: "Unauthorized: No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        error: true,
        message: "Unauthorized: Invalid or expired token",
      });
    }

    const user = await UserModel.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ error: true, message: "Unauthorized: User not found" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ error: true, message: "Account is deactivated" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: true,
        message: `Access denied: Requires role(s) ${roles.join(", ")}`,
      });
    }
    next();
  };
};
