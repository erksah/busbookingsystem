import jwt from "jsonwebtoken";

// 🔐 PASSENGER PROTECT MIDDLEWARE
export const protectPassenger = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 🔹 Check header
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({
        message: "No token, access denied ❌",
      });
    }

    // 🔹 Extract token
    const token = authHeader.split(" ")[1];

    // 🔥 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔹 Check role
    if (decoded.role !== "passenger") {
      return res.status(403).json({
        message: "Access denied, not a passenger ❌",
      });
    }

    // 🔹 Attach passenger data
    req.passenger = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token ❌",
    });
  }
};