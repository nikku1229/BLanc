import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/blanc";

    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB Disconnected");
});

// ✅ Handle graceful shutdown
export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log("✅ MongoDB Disconnected");
};

process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectDB();
  process.exit(0);
});
