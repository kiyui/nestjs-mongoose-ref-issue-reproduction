import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import type { Author } from 'src/author/author.schema';
import type { Comment } from 'src/comment/comment.schema';
import type { Post } from 'src/post/post.schema';
import type { Spotlight } from 'src/spotlight/spotlight.schema';
import type { Article } from './article.schema';

export enum ArticleSectionType {
  Text = 'text',
  Image = 'image',
  Embed = 'embed',
}

export interface ArticleTextSection {
  type: ArticleSectionType;
  content: string;
}

export interface ArticleImageSection {
  type: ArticleSectionType;
  uri: string;
  credits: string;
}

export interface ArticleEmbedSection {
  type: ArticleSectionType;
  embeds:
    | Types.ObjectId[]
    | Author[]
    | Article[]
    | Post[]
    | Comment[]
    | Spotlight[];
  embedType: string;
}

@Schema({
  _id: false,
  discriminatorKey: 'type',
})
export class ArticleSection {
  @Prop({
    type: String,
    enum: [
      ArticleSectionType.Text,
      ArticleSectionType.Image,
      ArticleSectionType.Embed,
    ],
    required: true,
  })
  type: ArticleSectionType;
}

// Create schema and discriminators
export const ArticleSectionSchema =
  SchemaFactory.createForClass(ArticleSection);

ArticleSectionSchema.discriminator(
  ArticleSectionType.Text,
  new mongoose.Schema({
    content: {
      type: String,
      required: true,
    },
  }),
);

ArticleSectionSchema.discriminator(
  ArticleSectionType.Image,
  new mongoose.Schema({
    uri: {
      type: String,
      required: true,
    },
    credits: String,
  }),
);

ArticleSectionSchema.discriminator(
  ArticleSectionType.Embed,
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
