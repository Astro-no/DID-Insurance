const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./models/db'); // Import MongoDB connection
const userRoutes = require('./routes/userRoutes'); // Import user routes


dotenv.config();
const app = express();

// Middleware
app.use(express.json()); // Parse JSON
app.use(cors()); // Enable CORS

// Connect to MongoDB
connectDB();

// Routes
//app.use('./models/User', userRoutes);
app.use('/api/users', userRoutes);


app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
