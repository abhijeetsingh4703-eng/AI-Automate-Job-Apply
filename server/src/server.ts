import { setDefaultResultOrder, setServers } from 'dns';
setDefaultResultOrder('ipv4first');
setServers(['8.8.8.8', '1.1.1.1']); // Fix: local router DNS fails to resolve MongoDB Atlas SRV records


import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/database';
import { setMongoUnavailable } from './config/mongoState';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to MongoDB (optional in dev - continues with mock data if fails)
    try {
      await connectDB();
      console.log('✅ MongoDB connected');
    } catch (dbError) {
      setMongoUnavailable(true);
      console.warn('⚠️  MongoDB unavailable - using mock data');
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api/v1\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⛔ Shutting down...');
  process.exit(0);
});
