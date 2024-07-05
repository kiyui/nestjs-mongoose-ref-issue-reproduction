import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostModule } from './post/post.module';
import { ArticleModule } from './article/article.module';
import { CommentModule } from './comment/comment.module';
import { AuthorModule } from './author/author.module';

@Module({
  imports: [PostModule, ArticleModule, CommentModule, AuthorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
