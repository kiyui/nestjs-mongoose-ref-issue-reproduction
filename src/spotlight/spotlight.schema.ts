import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import type { Article } from 'src/article/article.schema';
import type { Post } from 'src/post/post.schema';

export type SpotlightDocument = HydratedDocument<Spotlight>;

@Schema()
export class Spotlight {
  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'docsModel',
      },
    ],
  })
  docs: Types.ObjectId[] | Article[] | Post[];

  @Prop({
    type: String,
    required: true,
    enum: ['Article', 'Post'],
  })
  docsModel: string;
}

export const SpotlightSchema = SchemaFactory.createForClass(Spotlight);
