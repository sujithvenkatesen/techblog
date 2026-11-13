import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { seedAll } from './index.js';

await connectDB();
await seedAll();
await mongoose.disconnect();
console.log('[seed] done');
