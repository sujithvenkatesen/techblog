import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const PERMISSIONS = ['posts', 'media', 'taxonomy', 'authors', 'users'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['admin', 'editor'], default: 'editor' },
    permissions: { type: [String], enum: PERMISSIONS, default: ['posts', 'media'] },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matches = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('User', userSchema);
