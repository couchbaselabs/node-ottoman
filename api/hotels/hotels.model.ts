import { model, Schema, addValidators } from '../../lib';
import { GeolocationSchema } from '../shared/geolocation.model';
import { LinkType } from '../shared/link.type';
addValidators({
  phone: (value) => {
    const phone = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (value && !value.match(phone)) {
      throw new Error('Phone number is invalid.');
    }
  },
});

const ReviewSchema = new Schema({
  author: String,
  content: String,
  date: Date,
  ratings: {
    Cleanliness: { type: Number, min: 1, max: 5 },
    Overall: { type: Number, min: 1, max: 5 },
    Rooms: { type: Number, min: 1, max: 5 },
    Service: { type: Number, min: 1, max: 5 },
    Value: { type: Number, min: 1, max: 5 },
  },
});

const HotelSchema = new Schema({
  address: { type: String, required: true },
  alias: String,
  checkin: String,
  checkout: String,
  city: { type: String, required: true },
  country: { type: String, required: true },
  description: String,
  directions: [String],
  email: String,
  fax: String,
  free_breakfast: Boolean,
  free_internet: Boolean,
  free_parking: Boolean,
  geo: GeolocationSchema,
  name: { type: String, required: true },
  pets_ok: Boolean,
  phone: { type: String, validator: 'phone' },
  price: Number,
  public_likes: [String],
  reviews: [ReviewSchema],
  state: String,
  title: String,
  tollfree: String,
  url: LinkType,
  vacancy: Boolean,
});

HotelSchema.index.findByName = { by: 'name' };
HotelSchema.index.findByAlias = { by: 'alias', type: 'n1ql' };
HotelSchema.index.findViewCountry = { by: 'email', type: 'view' };
HotelSchema.index.findRefName = { by: 'name', type: 'refdoc' };

export const HotelModel = model('hotel', HotelSchema);
