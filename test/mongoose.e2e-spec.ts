import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import type { Author } from 'src/author/author.schema';
import type { Article } from 'src/article/article.schema';
import type { Post } from 'src/post/post.schema';
import type { Comment } from 'src/comment/comment.schema';
import type { Spotlight } from 'src/spotlight/spotlight.schema';
import runMongooseTests from './run-mongoose-tests';

describe('Mongoose Sanity Checks', () => {
  let mongod: MongoMemoryServer;

  const authorSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    description: String,
  });

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

  const articleSchema = new mongoose.Schema({
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

  const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
    content: {
      type: String,
      required: true,
    },
  });

  const commentSchema = new mongoose.Schema({
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

  const spotlightSchema = new mongoose.Schema({
    docs: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: 'docsModel',
        },
      ],
    },
    docsModel: {
      type: String,
      required: true,
      enum: ['Article', 'Post'],
    },
  });

  const AuthorModel = mongoose.model<Author>('Author', authorSchema);
  const ArticleModel = mongoose.model<Article>('Article', articleSchema);
  const PostModel = mongoose.model<Post>('Post', postSchema);
  const CommentModel = mongoose.model<Comment>('Comment', commentSchema);
  const SpotlightModel = mongoose.model<Spotlight>(
    'Spotlight',
    spotlightSchema,
  );

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    mongoose.connect(mongod.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  runMongooseTests({
    AuthorModel,
    ArticleModel,
    PostModel,
    CommentModel,
    SpotlightModel,
  });
});
