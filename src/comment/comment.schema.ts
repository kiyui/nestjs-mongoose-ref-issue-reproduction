import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Article } from 'src/article/article.schema';
import { Author } from 'src/author/author.schema';
import { Post } from 'src/post/post.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class Comment {
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

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'docModel',
  })
  doc: Types.ObjectId | Article | Post;

  @Prop({
    type: String,
    required: true,
    enum: [Article.name, Post.name],
  })
  docModel: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
