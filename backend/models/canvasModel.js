const mongoose = require("mongoose");
const Users = require("../models/userModel.js");

const canvasSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    elements: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],
    shared_with: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
  },
  { timestamps: true }
);

canvasSchema.statics.getAllCanvases = async function (email) {
  // Attempt to find the user by their email
  const user = await Users.findOne({ email });
  try {
    // If the user is not found, throw an error
    if (!user) {
      throw new Error("User not found");
    }

    // Retrieve canvases that the user owns or has been shared with them
    const canvases = await this.find({
      $or: [{ owner: user._id }, { shared_with: user._id }],
    });

    // Return the retrieved canvases
    return canvases;
  } catch (error) {
    // Throw an error if there's an issue during retrieval
    throw new Error(`Error getting canvases: ${error.message}`);
  }
};

canvasSchema.statics.createCanvas = async function (email, name) {
  const user = await Users.findOne({ email });
  try {
    // Find the user by email
    if (!user) {
      throw new Error("User not found");
    }

    // Create the new canvas
    const canvas = new this({
      owner: user._id,
      name,
      elements: [],
      shared_with: [],
    });

    // Save the new canvas
    const newCanvas = await canvas.save();

    // Return the newly created canvas
    return newCanvas;
  } catch (error) {
    throw new Error(`Error creating canvas: ${error.message}`);
  }
};

canvasSchema.statics.loadCanvas = async function (email, canvasId) {
  const user = await Users.findOne({ email });
  try {
    // Find the user by email
    if (!user) {
      throw new Error("User not found");
    }

    // Find the canvas that the user owns or has access to
    const canvas = await this.findOne({
      _id: canvasId,
      $or: [{ owner: user._id }, { shared_with: user._id }],
    });

    // If the canvas was not found, throw an error
    if (!canvas) {
      throw new Error("Canvas not found");
    }

    // Return the loaded canvas
    return canvas;
  } catch (error) {
    throw new Error(`Error loading canvas: ${error.message}`);
  }
};

canvasSchema.statics.updateCanvas = async function (email, canvasId, elements) {
  try {
    // Find the user by email
    const user = await Users.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    // Find the canvas that the user owns or has access to
    const canvas = await this.findOne({
      _id: canvasId,
      $or: [{ owner: user._id }, { shared_with: user._id }],
    });
    if (!canvas) {
      throw new Error("Canvas not found");
    }

    // Update the canvas elements
    canvas.elements = elements;
    const updatedCanvas = await canvas.save();

    return updatedCanvas;
  } catch (error) {
    throw new Error(`Error updating canvas: ${error.message}`);
  }
};

canvasSchema.statics.updateCanvasProfile = async function (
  email,
  name,
  canvasId
) {
  try {
    // Find the user by email
    const user = await Users.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    // Find the canvas that the user owns or has access to
    const canvas = await this.findOne({
      _id: canvasId,
      $or: [{ owner: user._id }, { shared_with: user._id }],
    });

    if (!canvas) {
      throw new Error(
        "Canvas not found or you do not have permission to update"
      );
    }

    // Update the canvas name
    canvas.name = name;
    await canvas.save();

    // Return the updated canvas
    return canvas;
  } catch (error) {
    throw new Error(`Error updating canvas profile: ${error.message}`);
  }
};

canvasSchema.statics.deleteCanvas = async function (email, canvasId) {
  try {
    // Find the user who is attempting to delete the canvas
    const user = await Users.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    // Find the canvas that the user owns or has access to
    const canvas = await this.findOne({
      _id: canvasId,
      $or: [{ owner: user._id }, { shared_with: user._id }],
    });

    if (!canvas) {
      throw new Error(
        "Canvas not found or you do not have permission to delete it"
      );
    }

    // Delete the canvas
    await this.deleteOne({ _id: canvasId });
    return { message: "Canvas deleted successfully" };
  } catch (error) {
    throw new Error(`Error deleting canvas: ${error.message}`);
  }
};

canvasSchema.statics.shareCanvas = async function (
  email,
  canvasId,
  sharedEmail
) {
  try {
    // Find the requesting user
    const user = await Users.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    // Find the canvas that the user owns or has access to
    const canvas = await this.findOne({
      _id: canvasId,
      $or: [{ owner: user._id }, { shared_with: user._id }],
    });

    if (!canvas) {
      throw new Error(
        "Canvas not found or you do not have permission to share it"
      );
    }

    // Find the user to be shared with
    const sharedUser = await Users.findOne({ email: sharedEmail });
    if (!sharedUser) {
      throw new Error("User to be shared with not found");
    }

    // Check if the user is already in the shared_with list
    if (canvas.shared_with.includes(sharedUser._id)) {
      throw new Error("User is already shared with this canvas");
    }

    // Add the user to shared_with array
    canvas.shared_with.push(sharedUser._id);
    await canvas.save();

    return { message: "Canvas shared successfully" };
  } catch (error) {
    throw new Error(`Error sharing canvas: ${error.message}`);
  }
};

const Canvas = mongoose.model("Canvas", canvasSchema);
module.exports = Canvas;
