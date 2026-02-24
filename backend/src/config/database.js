import mongoose from 'mongoose';

const connectDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zakataid';

    try {
        const conn = await mongoose.connect(uri, {
            // Mongoose 8 has these as defaults, but explicit for clarity
            serverSelectionTimeoutMS: 5000,
        });

        console.log(`✅  MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌  MongoDB connection error: ${error.message}`);
        throw error;
    }
};

export default connectDB;
