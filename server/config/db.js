const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Ensure a DB name is appended to the Atlas URI if not already present
    let uri = process.env.MONGO_URI || 'mongodb://localhost:27017/healsync';
    if (uri.endsWith('/')) {
      uri += 'healsync';
    }
    const conn = await mongoose.connect(uri, {
      dbName: 'healsync'
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

