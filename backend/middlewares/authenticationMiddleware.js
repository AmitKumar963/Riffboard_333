const jwt = require("jsonwebtoken");

// Middleware to authenticate users using JWT
const authenticationMiddleware = (req, res, next) => {
  // STEP 1: Extract token from Authorization header
  // Expected format: Authorization: Bearer <token>
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    // If token is not provided, return a 401 Unauthorized
    return res.status(401).json({ message: "Authentication failed" });
  }

  try {
    // STEP 2: Verify token using the secret key from environment variable
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // STEP 3: Attach decoded user data to the request object
    // So downstream middleware/controllers can access req.user
    req.user = decoded;

    next();
  } catch (error) {
    // If token is invalid or expired
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticationMiddleware;
