import cron from 'node-cron';
import Post from '../models/Post.js';

// Every minute: flip due scheduled posts to published.
export function startScheduler() {
  cron.schedule('* * * * *', async () => {
    try {
      const due = await Post.find({ status: 'scheduled', scheduledFor: { $lte: new Date() } });
      for (const post of due) {
        post.status = 'published';
        post.publishedAt = post.scheduledFor || new Date();
        post.scheduledFor = undefined;
        await post.save();
        console.log(`[cron] published scheduled post: ${post.slug}`);
      }
    } catch (err) {
      console.error('[cron] failed', err.message);
    }
  });
  console.log('[cron] scheduler started');
}
