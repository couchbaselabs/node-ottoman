import { Schema, model } from '../../lib';

export const CardSchema = new Schema({
  number: String,
  zipCode: String,
});

export const CardModel = model('Card', CardSchema);
