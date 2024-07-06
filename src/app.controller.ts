import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getArticleWithPopulatedEmbeddedDiscriminatorsInArrays(
    @Res() res: Response,
  ) {
    const article3 =
      await this.appService.getArticleWithPopulatedEmbeddedDiscriminatorsInArrays();
    return res.status(HttpStatus.OK).json(article3.toJSON());
  }
}
