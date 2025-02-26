const mongoose = require("mongoose");
const User = require("./models/User");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/insuranceDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Update email and promote user to admin
const updateAdminUser = async () => {
  try {
    //const oldEmail = "otivil@gmail.com"; // I USED THIS TO CREATE THE ADMIN
    //const newEmail = "admin@insurance.app";

    const updatedUser = await User.findOneAndUpdate(
      { email: oldEmail },
      { email: newEmail, role: "admin", status: "active" },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      console.log("❌ User not found");
    } else {
      console.log("✅ User updated successfully:", updatedUser);
    }
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error updating user:", error);
  }
};

// Run the script
updateAdminUser();
