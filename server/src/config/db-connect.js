import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const cluster = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`🥭 Connected to MongoDB cluster! \n😋 DB host: ${cluster.connection.host}`);
    } catch (err) {
        console.log("❌  MongoDB connection error: " + err)
        process.exit(1);
    }
}

export default connectDB;