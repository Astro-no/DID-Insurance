const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

exports.registerUser = async (req, res) => {
  const { firstName, secondName, email, idNumber, password, did } = req.body;

  try {
    // Check if the user already exists
    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      firstName,
      secondName,
      email,
      idNumber,
      password: hashedPassword,
      did,
      role: "policyholder",
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
