import jwt from "jsonwebtoken";

export const optionalPassenger = (req, res, next) => {
  const auth = req.headers.authorization;

  if (auth && auth.startsWith("Bearer")) {
    try {
      const token = auth.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.passenger = decoded;
    } catch (error) {
      req.passenger = null;
    }
  }

  next();
};