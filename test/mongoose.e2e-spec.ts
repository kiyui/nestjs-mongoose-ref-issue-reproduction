import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Error } from 'mongoose';
import { faker } from '@faker-js/faker';
import { Author, AuthorSchema } from 'src/author/author.schema';
import { Article, ArticleSchema } from 'src/article/article.schema';
import { Post, PostSchema } from 'src/post/post.schema';
import { Comment, CommentSchema } from 'src/comment/comment.schema';
import { Spotlight, SpotlightSchema } from 'src/spotlight/spotlight.schema';
import {
  ArticleEmbedSection,
  ArticleSection,
} from 'src/article/article-section.schema';

describe('Mongoose Sanity Checks', () => {
  let mongod: MongoMemoryServer;

  const AuthorModel = mongoose.model<Author>('Author', AuthorSchema);
  const ArticleModel = mongoose.model<Article>('Article', ArticleSchema);
  const PostModel = mongoose.model<Post>('Post', PostSchema);
  const CommentModel = mongoose.model<Comment>('Comment', CommentSchema);
  const SpotlightModel = mongoose.model<Spotlight>(
    'Spotlight',
    SpotlightSchema,
  );

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    mongoose.connect(mongod.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
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
        sections: [
          {
            type: 'text',
            content: faker.lorem.paragraph(),
          },
        ],
      },
      {
        author: author2._id,
        name: faker.lorem.sentence(),
        sections: [
          {
            type: 'text',
            content: faker.lorem.paragraph(),
          },
        ],
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

  it('can use refPath for vector references', async () => {
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
        sections: [
          {
            type: 'text',
            content: faker.lorem.paragraph(),
          },
        ],
      },
      {
        author: author2._id,
        name: faker.lorem.sentence(),
        sections: [
          {
            type: 'text',
            content: faker.lorem.paragraph(),
          },
        ],
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

    const [articleSpotlight, postSpotlight] = await SpotlightModel.create([
      {
        docs: [article1._id, article2._id],
        docsModel: Article.name,
      },
      {
        docs: [post1._id, post2._id, post3._id],
        docsModel: Post.name,
      },
    ]);

    // Assert that the "docs" field is not populated
    expect(
      articleSpotlight.docs.every(
        (doc) => doc instanceof mongoose.Types.ObjectId,
      ),
    ).toBe(true);

    expect(
      postSpotlight.docs.every((doc) => doc instanceof mongoose.Types.ObjectId),
    ).toBe(true);

    // Populate the "docs" field and assert that the populated fields use the appropriate models
    await articleSpotlight.populate('docs');
    await postSpotlight.populate('docs');

    expect(
      articleSpotlight.docs.every((doc) => doc instanceof ArticleModel),
    ).toBe(true);

    expect(postSpotlight.docs.every((doc) => doc instanceof PostModel)).toBe(
      true,
    );
  });

  it('should validate embedded discriminators in arrays', async () => {
    const author = await AuthorModel.create({
      name: faker.person.fullName(),
      description: faker.person.bio(),
    });

    await expect(
      ArticleModel.create({
        author: author._id,
        name: faker.lorem.sentence(),
        sections: [{ type: 'text', invalid: faker.lorem.paragraph() }],
      }),
    ).rejects.toThrow(Error.ValidationError);

    await expect(
      ArticleModel.create({
        author: author._id,
        name: faker.lorem.sentence(),
        sections: [{ type: 'text', content: faker.lorem.paragraph() }],
      }),
    ).resolves.not.toThrow();
  });

  it('should be able to populate embedded discriminators in arrays', async () => {
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
        sections: [
          {
            type: 'text',
            content: faker.lorem.paragraph(),
          },
        ],
      },
      {
        author: author2._id,
        name: faker.lorem.sentence(),
        sections: [
          {
            type: 'text',
            content: faker.lorem.paragraph(),
          },
        ],
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

    const [articleSpotlight, postSpotlight] = await SpotlightModel.create([
      {
        docs: [article1._id, article2._id],
        docsModel: Article.name,
      },
      {
        docs: [post1._id, post2._id, post3._id],
        docsModel: Post.name,
      },
    ]);

    const article3 = await ArticleModel.create({
      author: author3._id,
      name: faker.lorem.sentence(),
      sections: [
        {
          type: 'text',
          content: faker.lorem.paragraph(),
        },
        {
          type: 'embed',
          embeds: [author1._id, author2._id],
          embedType: Author.name,
        },
        {
          type: 'image',
          uri: faker.image.url(),
          credits: faker.lorem.paragraph(),
        },
        {
          type: 'embed',
          embeds: [articleSpotlight, postSpotlight],
          embedType: Spotlight.name,
        },
      ],
    });

    // Assert that the embed sections are not populated
    expect(
      article3.sections
        .filter(
          (section: ArticleSection): section is ArticleEmbedSection =>
            section.type === 'embed',
        )
        .every((section) =>
          section.embeds.every(
            (embed) => embed instanceof mongoose.Types.ObjectId,
          ),
        ),
    ).toBe(true);

    // Populate and assert that the sections are populated with the appropriate models
    await article3.populate({
      path: 'sections',
      populate: [
        {
          path: 'embeds',
        },
      ],
    });

    expect(
      article3.sections
        .filter(
          (section: ArticleSection): section is ArticleEmbedSection =>
            section.type === 'embed',
        )
        .filter((section) => section.embedType === Author.name)
        .every((section) =>
          section.embeds.every((embed) => embed instanceof AuthorModel),
        ),
    ).toBe(true);

    expect(
      article3.sections
        .filter(
          (section: ArticleSection): section is ArticleEmbedSection =>
            section.type === 'embed',
        )
        .filter((section) => section.embedType === Spotlight.name)
        .every((section) =>
          section.embeds.every((embed) => embed instanceof SpotlightModel),
        ),
    ).toBe(true);
  });
});
