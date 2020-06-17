import { model, Schema } from '../../lib';

export const GeolocationSchema = new Schema({
  alt: { type: Number, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
});

export const GeolocationModel = model('Geolocation', GeolocationSchema);
