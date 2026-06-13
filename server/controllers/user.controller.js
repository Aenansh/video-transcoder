import { User } from "../models/user.model.js";

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

    const newUser = await User.create({
      username,
      email,
      password,
    });

    return res.status(201).json({ message: "New user created." });
  } catch (error) {
    console.log("Failed to register user.", error);
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
  }
};

export { signUpUser, signInUser };
