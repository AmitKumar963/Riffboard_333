require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

//schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// Helper functions
userSchema.statics.validateEmail = function (email) {
  if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }
};

userSchema.statics.validatePassword = function (password) {
  // Check if the password is strong enough
  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new Error(
      "Password must be at least 8 characters long and contain at least one letter and one number and one special character"
    );
  }
};

// hash password
userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 9); // here 9 -> is the salt round
};

userSchema.statics.findUserByEmail = async function (email) {
  const user = await this.findOne({ email }); // findOne is a mongoose builtin method that searches in the collection connnected to the model
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

userSchema.statics.generateToken = function (user) {
  return jwt.sign(
    // Payload that contains the user's ID and email
    { userId: user._id, email: user.email },
    // Secret to sign the token with
    process.env.JWT_SECRET,
    // Options for the token
    {
      // The token will expire in 1 day
      expiresIn: "9h",
    }
  );
};

//static functions
userSchema.statics.register = async function (name, email, password) {
  try {
    // check if email and password are valid
    this.validateEmail(email);
    this.validatePassword(password);

    //hash the password
    const hashedPassword = await this.hashPassword(password);

    // Create the new user
    const user = new this({
      name,
      email,
      password: hashedPassword,
    });

    // Save the new user
    // return user.save(); // since we are directly returning it -> writing await here won't matter
    const newUser = await user.save();
    return newUser;
  } catch (error) {
    // Throw an error if something goes wrong
    throw new Error(`Error registering user: ${error.message}`);
  }
};

userSchema.statics.getUser = async function (userId) {
  try {
    // Find the user by their ID
    const user = await this.findById(userId);
    // If the user is not found, throw an error
    if (!user) {
      throw new Error("User not found");
    }
    // Return the retrieved user
    return user;
  } catch (error) {
    // Throw an error if there's an issue during retrieval
    throw new Error(`Error fetching user: ${error.message}`);
  }
};

userSchema.statics.login = async function (email, password) {
  try {
    const user = await this.findUserByEmail(email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Invalid email or password");
    }

    // Login successful
    // Generate a JWT token for the user
    const token = this.generateToken(user);

    // Return the JWT token
    return { message: "Successfully logged in!", token };
  } catch (error) {
    throw new Error(`Error logging in: ${error.message}`);
  }
};

userSchema.statics.deleteUser = async function (userId) {
  try {
    // Find the user to be deleted
    const user = await this.findByIdAndDelete(userId);
    if (!user) {
      // Throw an error if the user was not found
      throw new Error("User not found");
    }
    // Return a success message
    return { message: "User deleted successfully" };
  } catch (error) {
    // Throw an error if there's an issue during the deletion process
    throw new Error(`Error deleting user: ${error.message}`);
  }
};

userSchema.statics.updateUser = async function (userId, updatedFields) {
  try {
    // Check if the password needs to be updated and hash it
    if (updatedFields.password) {
      updatedFields.password = await this.hashPassword(updatedFields.password);
    }

    // Update the user with the provided fields and return the updated user object
    const user = await this.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    // If the user is not found, throw an error
    if (!user) {
      throw new Error("User not found");
    }

    // Return the updated user object
    return user;
  } catch (error) {
    // Throw an error if there's an issue during the update process
    throw new Error(`Error updating user: ${error.message}`);
  }
};

const userModel = mongoose.model("Users", userSchema);

module.exports = userModel;
