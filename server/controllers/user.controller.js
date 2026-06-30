import { User } from "../models/user.model.js";

const setAccessAndRefreshToken = async (userId) => {
  try {
    const userData = await User.findById(userId);

    if (!userData) return res.status(404).json({ error: "No user found!" });

    const accessToken = userData.generateAccessToken();
    const refreshToken = userData.generateRefreshToken();

    userData.refreshToken = refreshToken;
    await userData.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const signUpUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields required." });
    }

    const userExists = await User.findOne({
      email,
    });

    if (userExists) {
      return res
        .status(400)
        .json({ error: "A user with same e-mail already exists." });
    }

    const avatarLocal = req.files?.avatar[0].path;
    if (!avatarLocal)
      return res.status(400).json({ error: "Avatar is required." });
    
    const newUser = await User.create({
      username,
      email,
      password,
    });

    return res.status(201).json({ message: "New user created." });
  } catch (error) {
    console.log("Failed to register user.", error);
    return res.status(500).json({ error: "Failed to register user." });
  }
};

const signInUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "All fields required." });
    }

    const userExists = await User.findOne({
      email,
    });

    if (!userExists) {
      return res
        .status(400)
        .json({ error: "New user detected, please sign up first." });
    }

    if (!(await userExists.isPasswordCorrect(password)))
      return res.status(400).json({ error: "Incorrect password provided." });
    return res.status(200).json({ message: "Welcome back user." });
  } catch (error) {
    console.log("Failed to login user.", error);
    return res.status(500).json({ error: "Failed to login user." });
  }
};

const signOutUser = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) return res(200).json({ message: "No user active." });

    await User.findByIdAndUpdate(
      userId,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      { new: true },
    );

    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ message: "Logged out!" });
  } catch (error) {}
};

export { signUpUser, signInUser, signOutUser };
