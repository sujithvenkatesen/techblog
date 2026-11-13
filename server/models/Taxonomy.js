import mongoose from 'mongoose';
import slugify from 'slugify';

const slugger = (v) => slugify(v, { lower: true, strict: true });

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, default: '' },
    shortName: { type: String, default: '' },
  },
  { timestamps: true }
);
categorySchema.pre('validate', function (next) {
  if (!this.slug) this.slug = slugger(this.name);
  next();
});

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },
  },
  { timestamps: true }
);
tagSchema.pre('validate', function (next) {
  if (!this.slug) this.slug = slugger(this.name);
  next();
});

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    role: { type: String, default: 'Contributor' },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
  },
  { timestamps: true }
);
authorSchema.pre('validate', function (next) {
  if (!this.slug) this.slug = slugger(this.name);
  next();
});

export const Category = mongoose.model('Category', categorySchema);
export const Tag = mongoose.model('Tag', tagSchema);
export const Author = mongoose.model('Author', authorSchema);
