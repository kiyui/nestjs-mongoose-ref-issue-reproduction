import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { AuthorModel } from 'src/author/author.model';
import { ArticleModel } from 'src/article/article.model';
import { PostModel } from 'src/post/post.model';
import { CommentModel } from 'src/comment/comment.model';
import { SpotlightModel } from 'src/spotlight/spotlight.model';
import runMongooseTests from './run-mongoose-tests';

describe('Mongoose Sanity Checks', () => {
  let mongod: MongoMemoryServer;

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
