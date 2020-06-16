import { Schema, model } from '../../lib';

export const CatSchema = new Schema({
  name: String,
  age: Number,
});

export const CatModel = model('Cat', CatSchema);
