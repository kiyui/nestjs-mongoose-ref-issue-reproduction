import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthorModule } from 'src/author/author.module';
import { Author } from 'src/author/author.schema';
import { ArticleModule } from 'src/article/article.module';
import { Article } from 'src/article/article.schema';
import { PostModule } from 'src/post/post.module';
import { Post } from 'src/post/post.schema';
import { CommentModule } from 'src/comment/comment.module';
import { Comment } from 'src/comment/comment.schema';
import { Spotlight } from 'src/spotlight/spotlight.schema';
import { SpotlightModule } from 'src/spotlight/spotlight.module';
import runMongooseTests from './run-mongoose-tests';

describe('NestJS Mongoose Sanity Checks', () => {
  let mongod: MongoMemoryServer;
  let app: INestApplication;

  let AuthorModel: Model<Author>;
  let ArticleModel: Model<Article>;
  let PostModel: Model<Post>;
  let CommentModel: Model<Comment>;
  let SpotlightModel: Model<Spotlight>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthorModule,
        ArticleModule,
        PostModule,
        CommentModule,
        SpotlightModule,
        MongooseModule.forRoot(mongod.getUri()),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    AuthorModel = app.get(getModelToken(Author.name));
    ArticleModel = app.get(getModelToken(Article.name));
    PostModel = app.get(getModelToken(Post.name));
    CommentModel = app.get(getModelToken(Comment.name));
    SpotlightModel = app.get(getModelToken(Spotlight.name));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  runMongooseTests({
    get AuthorModel() {
      return AuthorModel;
    },
    get ArticleModel() {
      return ArticleModel;
    },
    get PostModel() {
      return PostModel;
    },
    get CommentModel() {
      return CommentModel;
    },
    get SpotlightModel() {
      return SpotlightModel;
    },
  });
});
