const mongoose = require('mongoose');

const connectDB = async () => {
  const RETRY_DELAY = 5000;

  const tryConnect = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      console.log(`🔄 Retrying in ${RETRY_DELAY / 1000}s...`);
      setTimeout(tryConnect, RETRY_DELAY);
    }
  };

  await tryConnect();
};

module.exports = connectDB;
