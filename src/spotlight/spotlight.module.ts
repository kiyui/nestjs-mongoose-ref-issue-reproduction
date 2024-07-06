import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Spotlight, SpotlightSchema } from './spotlight.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Spotlight.name, schema: SpotlightSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class SpotlightModule {}
