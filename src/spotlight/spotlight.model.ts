import mongoose from 'mongoose';
import type { Spotlight } from './spotlight.schema';

export const spotlightSchema = new mongoose.Schema({
  docs: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'docsModel',
      },
    ],
  },
  docsModel: {
    type: String,
    required: true,
    enum: ['Article', 'Post'],
  },
});

export const SpotlightModel = mongoose.model<Spotlight>(
  'Spotlight',
  spotlightSchema,
);
