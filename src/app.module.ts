import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostModule } from './post/post.module';
import { ArticleModule } from './article/article.module';
import { CommentModule } from './comment/comment.module';
import { AuthorModule } from './author/author.module';
import { SpotlightModule } from './spotlight/spotlight.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const mongod = await MongoMemoryServer.create();

        return {
          uri: mongod.getUri(),
        };
      },
    }),
    PostModule,
    ArticleModule,
    CommentModule,
    AuthorModule,
    SpotlightModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
