import { createSchema } from '../../src/schema/helpers';
import { model } from '../../src';

export const CardSchema = createSchema({
  number: String,
  zipCode: String,
});

export const CardModel = model('Card', CardSchema);
