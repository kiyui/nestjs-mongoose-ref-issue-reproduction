import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Author } from 'src/author/author.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Author.name })
  author?: Types.ObjectId | Author;

  @Prop({
    type: String,
    required: true,
  })
  content: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
