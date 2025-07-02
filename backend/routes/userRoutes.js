const router = require("express").Router();
const authenticationMiddleware = require("../middleware/authenticationMiddleware");

const {
  createUser,
  loginUser,
  getUserProfile,
  deleteUser,
  updateUser,
} = require("../controllers/userController");

// toh ye sab /users/... yaha aayega
router.post("/login", loginUser);
router.post("/register", createUser);
router.get("/profile", authenticationMiddleware, getUserProfile);
router.delete("/delete", authenticationMiddleware, deleteUser);
router.put("/update", authenticationMiddleware, updateUser);

module.exports = router;
