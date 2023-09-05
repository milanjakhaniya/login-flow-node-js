const express = require("express");
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB (replace 'mongodb://localhost/yourdb' with your MongoDB connection string)
const url = "mongodb+srv://milanjakhaniya:bdSsEEISS2ocDurU@cluster0.253vfsu.mongodb.net/demo?retryWrites=true&w=majority";
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model("user", {
  name: String,
  dob: Date,
  email: String,
  password: String,
});

module.exports = {
    User
}

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from the server');
})

// Registration API
app.post("/api/register", async (req, res) => {
  const { name, dob, email, password } = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      dob,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ newUser });
  } catch (error) {
    console.error("Registration failed:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login API
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!password) {
        return res.status(404).json({ message: "Password is required" });
      }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ email: user.email, id: user._id }, "login_jwt_secret", { expiresIn: "1h" });

    user.password = ""
    res.status(200).json({ user, token });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});