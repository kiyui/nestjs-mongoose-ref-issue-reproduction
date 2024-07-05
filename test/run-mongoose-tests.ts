import mongoose, { Error, Model } from 'mongoose';
import { faker } from '@faker-js/faker';
import type { Author } from 'src/author/author.schema';
import type { Article } from 'src/article/article.schema';
import type { Post } from 'src/post/post.schema';
import type { Comment } from 'src/comment/comment.schema';
import type { Spotlight } from 'src/spotlight/spotlight.schema';
import type {
  ArticleEmbedSection,
  ArticleSection,
} from 'src/article/article-section.schema';

export default function runMongooseTests(models: {
  AuthorModel: Model<Author>;
  ArticleModel: Model<Article>;
  PostModel: Model<Post>;
  CommentModel: Model<Comment>;
  SpotlightModel: Model<Spotlight>;
}) {
  let AuthorModel: Model<Author>;
  let ArticleModel: Model<Article>;
  let PostModel: Model<Post>;
  let CommentModel: Model<Comment>;
  let SpotlightModel: Model<Spotlight>;

  beforeAll(() => {
    AuthorModel = models.AuthorModel;
    ArticleModel = models.ArticleModel;
    PostModel = models.PostModel;
    CommentModel = models.CommentModel;
    SpotlightModel = models.SpotlightModel;
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
        docModel: 'Article',
      },
      {
        author: author3,
        content: faker.lorem.paragraph(),
        doc: article2._id,
        docModel: 'Article',
      },
      {
        author: author1,
        content: faker.lorem.paragraph(),
        doc: post1._id,
        docModel: 'Post',
      },
      {
        author: author2,
        content: faker.lorem.paragraph(),
        doc: post2._id,
        docModel: 'Post',
      },
      {
        author: author2,
        content: faker.lorem.paragraph(),
        doc: post3._id,
        docModel: 'Post',
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
        .filter((comment) => comment.docModel === 'Article')
        .every((comment) => comment.doc instanceof ArticleModel),
    ).toBe(true);

    expect(
      populatedComments
        .filter((comment) => comment.docModel === 'Post')
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
        docsModel: 'Article',
      },
      {
        docs: [post1._id, post2._id, post3._id],
        docsModel: 'Post',
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
        docsModel: 'Article',
      },
      {
        docs: [post1._id, post2._id, post3._id],
        docsModel: 'Post',
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
          embedType: 'Author',
        },
        {
          type: 'image',
          uri: faker.image.url(),
          credits: faker.lorem.paragraph(),
        },
        {
          type: 'embed',
          embeds: [articleSpotlight, postSpotlight],
          embedType: 'Spotlight',
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

    const article3AuthorEmbed = article3.sections
      .filter(
        (section: ArticleSection): section is ArticleEmbedSection =>
          section.type === 'embed',
      )
      .find((section) => section.embedType === 'Author');

    const article3SpotlightEmbed = article3.sections
      .filter(
        (section: ArticleSection): section is ArticleEmbedSection =>
          section.type === 'embed',
      )
      .find((section) => section.embedType === 'Spotlight');

    expect(article3AuthorEmbed.embeds).toHaveLength(2);
    expect(
      article3AuthorEmbed.embeds.every((embed) => embed instanceof AuthorModel),
    ).toBe(true);

    expect(article3SpotlightEmbed.embeds).toHaveLength(2);
    expect(
      article3SpotlightEmbed.embeds.every(
        (embed) => embed instanceof SpotlightModel,
      ),
    ).toBe(true);
  });
}
