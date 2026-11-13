import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blockwise_blog';
  mongoose.set('strictQuery', true);
  // Fail fast when the DB is down so the client can switch to its fallback data quickly.
  mongoose.set('bufferTimeoutMS', 2000);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`[db] connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}
