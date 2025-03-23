const mongoose = require('mongoose');
// require('dotenv').config();

const connectionString = "mongodb://localhost:27017/eBooklog"

const connectDB = async () => {
  try {
    // await mongoose.connect(process.env.MONGO_URI);
    await mongoose.connect(connectionString);
    console.log('You successfully connected to MongoDB!');
  } catch (error) {
    console.log('Error connecting to MongoDB:', error);
  }
};

module.exports = connectDB;