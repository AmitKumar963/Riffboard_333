const router = require("express").Router();
const {
  getAllCanvases,
  createCanvas,
  loadCanvas,
  updateCanvas,
  shareCanvas,
} = require("../controllers/canvasController");
const authenticationMiddleware = require("../middleware/authenticationMiddleware");

router.get("/", authenticationMiddleware, getAllCanvases);
router.post("/", authenticationMiddleware, createCanvas);
router.get("/:id", authenticationMiddleware, loadCanvas);
router.put("/:id", authenticationMiddleware, updateCanvas);
router.put("/share/:id", authenticationMiddleware, shareCanvas);

module.exports = router;
