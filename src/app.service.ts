import { Model, Types } from 'mongoose';
import { faker } from '@faker-js/faker';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Author } from './author/author.schema';
import { Article, ArticleDocument } from './article/article.schema';
import { Post } from './post/post.schema';
import { Comment } from './comment/comment.schema';
import { Spotlight } from './spotlight/spotlight.schema';

@Injectable()
export class AppService implements OnModuleInit {
  private articleWithPopulatedEmbeddedDiscriminatorsInArrays: Types.ObjectId;

  constructor(
    @InjectModel(Author.name) private authorModel: Model<Author>,
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Spotlight.name) private spotlightModel: Model<Spotlight>,
  ) {}

  async onModuleInit() {
    const [author1, author2, author3] = await this.authorModel.create([
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

    const [article1, article2] = await this.articleModel.create([
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

    const [post1, post2, post3] = await this.postModel.create([
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

    const [articleSpotlight, postSpotlight] = await this.spotlightModel.create([
      {
        docs: [article1._id, article2._id],
        docsModel: 'Article',
      },
      {
        docs: [post1._id, post2._id, post3._id],
        docsModel: 'Post',
      },
    ]);

    const article3 = await this.articleModel.create({
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

    this.articleWithPopulatedEmbeddedDiscriminatorsInArrays = article3._id;
  }

  getArticleWithPopulatedEmbeddedDiscriminatorsInArrays(): Promise<ArticleDocument> {
    return this.articleModel
      .findById(
        this.articleWithPopulatedEmbeddedDiscriminatorsInArrays,
        {},
        {
          populate: [
            {
              path: 'sections',
              populate: [
                {
                  path: 'embeds',
                },
              ],
            },
          ],
        },
      )
      .exec();
  }
}
