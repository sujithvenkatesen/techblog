import mongoose from 'mongoose';
import slugify from 'slugify';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    excerpt: { type: String, default: '', maxlength: 400 },
    // HTML body (headings, paragraphs, images, iframes, tables, <pre><code>)
    content: { type: String, default: '' },
    featuredImage: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
    status: { type: String, enum: ['draft', 'published', 'scheduled'], default: 'draft', index: true },
    publishedAt: { type: Date },
    scheduledFor: { type: Date },
    featured: { type: Boolean, default: false, index: true },
    views: { type: Number, default: 0 },
    readingTime: { type: Number, default: 1 },
    seoTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '', maxlength: 320 },
  },
  { timestamps: true }
);

export function estimateReadingTime(html = '') {
  const text = html.replace(/<pre[\s\S]*?<\/pre>/g, ' ').replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

postSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  } else if (this.slug) {
    this.slug = slugify(this.slug, { lower: true, strict: true });
  }
  next();
});

postSchema.pre('save', function (next) {
  this.readingTime = estimateReadingTime(this.content);
  if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date();
  next();
});

postSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

export default mongoose.model('Post', postSchema);
