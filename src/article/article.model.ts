import mongoose from 'mongoose';
import type { Article } from './article.schema';

const articleSectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['text', 'image', 'embed'],
      required: true,
    },
  },
  {
    _id: false,
    discriminatorKey: 'type',
  },
);

articleSectionSchema.discriminator(
  'text',
  new mongoose.Schema({
    content: {
      type: String,
      required: true,
    },
  }),
);

articleSectionSchema.discriminator(
  'image',
  new mongoose.Schema({
    uri: {
      type: String,
      required: true,
    },
    credits: String,
  }),
);

articleSectionSchema.discriminator(
  'embed',
  new mongoose.Schema({
    embeds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref() {
            return this.embedType;
          },
        },
      ],
      required: true,
    },
    embedType: {
      type: String,
      required: true,
      enum: ['Author', 'Article', 'Post', 'Comment', 'Spotlight'],
    },
  }),
);

export const articleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true,
  },
  sections: {
    type: [{ type: articleSectionSchema }],
    required: true,
  },
});

export const ArticleModel = mongoose.model<Article>('Article', articleSchema);
