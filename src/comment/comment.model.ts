import mongoose from 'mongoose';
import type { Comment } from './comment.schema';

export const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  doc: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'docModel',
  },
  docModel: {
    type: String,
    required: true,
    enum: ['Article', 'Post'],
  },
});

export const CommentModel = mongoose.model<Comment>('Comment', commentSchema);
