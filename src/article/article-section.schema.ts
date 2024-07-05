import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import type { Author } from 'src/author/author.schema';
import type { Comment } from 'src/comment/comment.schema';
import type { Post } from 'src/post/post.schema';
import type { Spotlight } from 'src/spotlight/spotlight.schema';
import type { Article } from './article.schema';

enum ArticleSectionType {
  Text = 'text',
  Image = 'image',
  Embed = 'embed',
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

@Schema({ _id: false })
export class ArticleTextSection {
  type: ArticleSectionType;

  @Prop({
    type: String,
    required: true,
  })
  content: string;
}

@Schema({ _id: false })
export class ArticleImageSection {
  type: ArticleSectionType;

  @Prop({
    type: String,
    required: true,
  })
  uri: string;

  @Prop({
    type: String,
  })
  credits: string;
}

@Schema({ _id: false })
export class ArticleEmbedSection {
  type: ArticleSectionType;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref() {
          return this.embedType;
        },
      },
    ],
    required: true,
  })
  embeds:
    | Types.ObjectId[]
    | Author[]
    | Article[]
    | Post[]
    | Comment[]
    | Spotlight[];

  @Prop({
    type: String,
    required: true,
    enum: ['Author', 'Article', 'Post', 'Comment', 'Spotlight'],
  })
  embedType: string;
}

// Create schema and discriminators
export const ArticleSectionSchema =
  SchemaFactory.createForClass(ArticleSection);

export const ArticleTextSectionSchema =
  SchemaFactory.createForClass(ArticleTextSection);

export const ArticleImageSectionSchema =
  SchemaFactory.createForClass(ArticleImageSection);

export const ArticleEmbedSectionSchema =
  SchemaFactory.createForClass(ArticleEmbedSection);

ArticleSectionSchema.discriminator(
  ArticleSectionType.Text,
  ArticleTextSectionSchema,
);

ArticleSectionSchema.discriminator(
  ArticleSectionType.Image,
  ArticleImageSectionSchema,
);

ArticleSectionSchema.discriminator(
  ArticleSectionType.Embed,
  ArticleEmbedSectionSchema,
);
