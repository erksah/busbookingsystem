import jwt from "jsonwebtoken";

// 🔐 ADMIN PROTECT MIDDLEWARE
export const protectAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 🔹 Check header exists
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({
        message: "No token, admin access denied ❌",
      });
    }

    // 🔹 Extract token
    const token = authHeader.split(" ")[1];

    // 🔥 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔹 Check role
    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Access denied, not admin ❌",
      });
    }

    // 🔹 Attach admin data
    req.admin = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token ❌",
    });
  }
};