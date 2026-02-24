import 'dotenv/config';
import app from './app.js';
import connectDB from './config/database.js';

const PORT = process.env.PORT || 5000;

// Start server immediately — DB will connect in the background
app.listen(PORT, () => {
    console.log(`\n🚀  ZakatAid API running on http://localhost:${PORT}`);
    console.log(`📂  Mode   : ${process.env.NODE_ENV}`);
    console.log(`🌐  Health : http://localhost:${PORT}/api/health\n`);
});

// Connect to MongoDB with auto-retry
const connectWithRetry = async (attempt = 1) => {
    try {
        await connectDB();
    } catch (err) {
        const delay = Math.min(5000 * attempt, 30000); // max 30s between retries
        console.error(`❌  DB connection failed (attempt ${attempt}): ${err.message}`);
        console.log(`🔄  Retrying in ${delay / 1000}s...`);
        setTimeout(() => connectWithRetry(attempt + 1), delay);
    }
};

connectWithRetry();
