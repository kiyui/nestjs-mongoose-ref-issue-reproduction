import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Author } from 'src/author/author.schema';

export type ArticleDocument = HydratedDocument<Article>;

@Schema()
export class Article {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Author.name,
    required: true,
  })
  author: Types.ObjectId | Author;

  @Prop({
    type: String,
    required: true,
  })
  content: string;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
