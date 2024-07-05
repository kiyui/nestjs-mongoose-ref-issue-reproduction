import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { faker } from '@faker-js/faker';
import { AuthorModule } from 'src/author/author.module';
import { Author } from 'src/author/author.schema';
import { ArticleModule } from 'src/article/article.module';
import { Article } from 'src/article/article.schema';
import { PostModule } from 'src/post/post.module';
import { Post } from 'src/post/post.schema';
import { CommentModule } from 'src/comment/comment.module';
import { Comment } from 'src/comment/comment.schema';

describe('Mongoose', () => {
  let mongod: MongoMemoryServer;
  let app: INestApplication;

  let AuthorModel: Model<Author>;
  let ArticleModel: Model<Article>;
  let PostModel: Model<Post>;
  let CommentModel: Model<Comment>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthorModule,
        ArticleModule,
        PostModule,
        CommentModule,
        MongooseModule.forRoot(mongod.getUri()),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    AuthorModel = app.get(getModelToken(Author.name));
    ArticleModel = app.get(getModelToken(Article.name));
    PostModel = app.get(getModelToken(Post.name));
    CommentModel = app.get(getModelToken(Comment.name));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  it('can use refPath for scalar references', async () => {
    const [author1, author2, author3] = await AuthorModel.create([
      {
        name: faker.person.fullName(),
        description: faker.person.bio(),
      },
      {
        name: faker.person.fullName(),
        description: faker.person.bio(),
      },
      {
        name: faker.person.fullName(),
      },
    ]);

    const [article1, article2] = await ArticleModel.create([
      {
        author: author1._id,
        name: faker.lorem.sentence(),
        content: faker.lorem.paragraph(),
      },
      {
        author: author2._id,
        name: faker.lorem.sentence(),
        content: faker.lorem.paragraph(),
      },
    ]);

    const [post1, post2, post3] = await PostModel.create([
      {
        author: author2._id,
        content: faker.lorem.paragraph(),
      },
      {
        author: author3._id,
        content: faker.lorem.paragraph(),
      },
      {
        content: faker.lorem.paragraph(),
      },
    ]);

    const comments = await CommentModel.create([
      {
        author: author2,
        content: faker.lorem.paragraph(),
        doc: article1._id,
        docModel: Article.name,
      },
      {
        author: author3,
        content: faker.lorem.paragraph(),
        doc: article2._id,
        docModel: Article.name,
      },
      {
        author: author1,
        content: faker.lorem.paragraph(),
        doc: post1._id,
        docModel: Post.name,
      },
      {
        author: author2,
        content: faker.lorem.paragraph(),
        doc: post2._id,
        docModel: Post.name,
      },
      {
        author: author2,
        content: faker.lorem.paragraph(),
        doc: post3._id,
        docModel: Post.name,
      },
    ]);

    // Assert that the "doc" field is not populated
    expect(
      comments.every(
        (comment) => comment.doc instanceof mongoose.Types.ObjectId,
      ),
    ).toBe(true);

    // Fetch comments with the "doc" field populated
    const populatedComments = await CommentModel.find(
      {
        _id: { $in: comments.map((comment) => comment._id) },
      },
      {},
      {
        populate: 'doc',
      },
    );

    // Assert that the "doc" fields use the appropriate models
    expect(
      populatedComments
        .filter((comment) => comment.docModel === Article.name)
        .every((comment) => comment.doc instanceof ArticleModel),
    ).toBe(true);

    expect(
      populatedComments
        .filter((comment) => comment.docModel === Post.name)
        .every((comment) => comment.doc instanceof PostModel),
    ).toBe(true);
  });
});
