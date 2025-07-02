const Canvas = require("../models/canvasModel.js");
const Users = require("../models/userModel.js");

const getAllCanvases = async (req, res) => {
  // Even if this is a get method -> we are getting the email as we are taking out the information from the token and add it in req.user = decoded ( so when it pass from the middleware we have all the information about the user in req.user)
  const email = req.user.email;
  try {
    const canvases = await Canvas.getAllCanvases(email);
    res.status(200).json(canvases);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createCanvas = async (req, res) => {
  const { name } = req.body;
  const email = req.user.email; // Get the email from the token decoded in the authentication middleware
  try {
    const canvas = await Canvas.createCanvas(email, name);
    res.status(201).json(canvas);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const loadCanvas = async (req, res) => {
  try {
    const canvasId = req.params.id;
    const email = req.user.email;

    const canvas = await Canvas.loadCanvas(email, canvasId);
    if (!canvas) {
      return res.status(404).json({ error: "Canvas not found" });
    }

    res.status(200).json(canvas);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to load canvas", details: error.message });
  }
};

const updateCanvas = async (req, res) => {
  try {
    const canvasId = req.params.id;
    const email = req.user.email;
    const { elements } = req.body;

    const canvas = await Canvas.updateCanvas(email, canvasId, elements);
    if (!canvas) {
      return res.status(404).json({ error: "Canvas not found" });
    }

    res.status(200).json(canvas);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Failed to update canvas", details: error.message });
  }
};

const shareCanvas = async (req, res) => {
  try {
    const canvasId = req.params.id;
    const email = req.user.email;
    const { sharedEmail } = req.body;

    if (!sharedEmail) {
      return res.status(400).json({ error: "Shared email is required" });
    }

    const result = await Canvas.shareCanvas(email, canvasId, sharedEmail);
    return res.status(200).json(result);
  } catch (error) {
    // Determine status code based on error message
    let statusCode = 500;

    if (error.message.includes("not found")) {
      statusCode = 404;
    } else if (error.message.includes("permission")) {
      statusCode = 403;
    } else if (error.message.includes("already shared")) {
      statusCode = 400;
    }

    return res.status(statusCode).json({ error: error.message });
  }
};

module.exports = {
  getAllCanvases,
  createCanvas,
  loadCanvas,
  updateCanvas,
  shareCanvas,
};
