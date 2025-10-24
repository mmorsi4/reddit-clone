import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const token = req.cookies.token; // read from cookies

  if (!token) {
    return res.status(401).json({ message: "No token, unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // attach user ID to the request
    next(); // move on to the next middleware/route
  } catch (err) {
    console.error("JWT verification failed:", err);
    res.status(403).json({ message: "Invalid or expired token" });
  }
}
