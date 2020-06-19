import { model, Schema } from '../../lib';

export const GeolocationSchema = new Schema({
  alt: Number,
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  accuracy: String,
});

export const GeolocationModel = model('Geolocation', GeolocationSchema);
