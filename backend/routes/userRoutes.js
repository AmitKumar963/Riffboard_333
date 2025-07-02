const router = require("express").Router();
const authenticationMiddleware = require("../middleware/authenticationMiddleware");

const {
  createUser,
  loginUser,
  getUserProfile,
} = require("../controllers/userController");

// toh ye sab /users/... yaha aayega
router.post("/login", loginUser);
router.post("/register", createUser);
router.get("/profile", authenticationMiddleware, getUserProfile);

module.exports = router;
