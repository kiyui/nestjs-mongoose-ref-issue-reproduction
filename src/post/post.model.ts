import mongoose from 'mongoose';
import type { Post } from './post.schema';

export const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
  content: {
    type: String,
    required: true,
  },
});

export const PostModel = mongoose.model<Post>('Post', postSchema);
