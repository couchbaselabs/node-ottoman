import { createSchema } from '../../src/schema/helpers';
import { model } from '../../src';

export const CatSchema = createSchema({
  name: String,
  age: Number,
});

export const CatModel = model('Cat', CatSchema);
