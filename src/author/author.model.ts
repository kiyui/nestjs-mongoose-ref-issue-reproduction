import mongoose from 'mongoose';
import type { Author } from './author.schema';

export const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
});

export const AuthorModel = mongoose.model<Author>('Author', authorSchema);
