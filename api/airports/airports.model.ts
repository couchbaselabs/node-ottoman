import { model, Schema } from '../../lib';
import { GeolocationSchema } from '../shared/geolocation.model';

const AirportSchema = new Schema({
  airportname: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  faa: String,
  geo: GeolocationSchema,
  icao: String,
  tz: { type: String, required: true },
});

export const AirportModel = model('airport', AirportSchema);
