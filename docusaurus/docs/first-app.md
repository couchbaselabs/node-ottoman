---
sidebar_position: -1
title: Building Your First App
---

# Building Your First App

Our goal is to provide you with a demo application to explore how to setup and use Ottoman using best practices.

## Prepare Couchbase Server

This is a sample application for getting started with Ottoman using Couchbase Server 6.x. The application provides a Rest API and demonstrates Ottoman's ODM capabilities. It uses Ottoman v2, Express, and the Couchbase NodeJS SDK. The Travel-Sample API we buildcould be used in a flight planner application that allows the user to search for and select a flight route based on airports and dates.

## Prepare Our Project Folder

Install Node.js from the [Node.js website](http://nodejs.org/).  
Once Node.js is installed, we can bootstrap our application.

### Development Guide

1. [Install Couchbase Server Using Docker](https://docs.couchbase.com/server/current/install/getting-started-docker.html).

2. Clone the repo and install the dependencies 
```
$ git clone https://github.com/couchbaselabs/node-ottoman.git
$ cd node-ottoman
$ yarn install
```

3. Now we are ready to run the API example.
```
$ yarn api:dev
```

## Tutorial Project (Travel-Sample) Goals

What want to build a REST API for a Travel-Sample Application that stores and queries hotel, flight, and airport information using Couchbase Server as the system of record.

### Data Model

The flexiblity and dynamic nature of a NOSQL Document Database and JSON simplifies building the data model.
For the travel sample application we will use three types of objects, and we'll define those in specific modules in the node application.  

- airports
- flightPaths
- hotels

The source code is organized by each module in a folder under the root of the application, a module defines REST endpoints, and the data model of a resource. 
The data model is defined in `.model.ts` by the schema and model, and in the case of the endpoints, there are defined in various `.controller.ts` files, such as `flights.controller.ts`.  
Let's walk through the code starting with the `hotels` module.

### Hotel Model

The first section of the hotel module instantiates module dependencies which, for this particular example, are Ottoman and the database file where the information on the Couchbase instance is stored.

```ts
import { model, addValidators, Schema } from 'ottoman';    // ← use ottoman
import { GeolocationSchema } from '../shared/geolocation.model';
```

Next, a custom validator function is defined to make sure that a phone number in the standard USA format is created.

```ts
addValidators({
  phone: (value) => {
      const phone = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
      if(value && !value.match(phone)) {
        throw new Error('Phone number is invalid.');
      }
  },
});
```

The model for the Hotels object is defined, using several of the built in types that Ottoman supports.  

For additional reference, see http://www.ottomanjs.com.  

Several indices are defined along with the model &mdash; the indices are utilized as methods for each instance of the Hotel Object. Ottoman supports complex data types, embedded references to other models, and customization.

We are going to define a custom type link:

```ts
    import { IOttomanType, ValidationError, registerType } from 'ottoman';
    
    /**
     * Custom type to manage the links.
     */
    export class LinkType extends IOttomanType {
      constructor(name: string) {
        super(name, 'Link');
      }
      cast(value: unknown) {
        if (!isLink(String(value))) {
          throw new ValidationError(`Field ${this.name} only allows a Link`);
        }
        return String(value);
      }
    }
    
    /**
     * Factory function.
     * @param name of field
     */
    export const linkTypeFactory = (name) => new LinkType(name);
    
    /**
     * Register type on Schema Supported Types.
     */
    registerType(LinkType.name, linkTypeFactory);
    
    /**
     * Check if value is a valid Link.
     * @param value
     */
    const isLink = (value: string) => {
      const regExp = new RegExp(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
      );
      return regExp.test(value);
    };
```

With the link custom type, we can continue with the schema definition:

```ts
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

HotelSchema.index.findByName = { by: 'name', type: 'n1ql' };

export const HotelModel = model('hotel', HotelSchema);
```

In the Hotel model above, there is one explicit index defined. By default, if an index type is not specified Ottoman will select the fastest available index supported within the current Couchbase cluster.  

In addition to utilizing built in secondary index support within Couchbase, Ottoman can also utilize referential documents and maintain the referential integrity for updates and deletes. This is a powerful features that allows for blazingly fast lookups by a particular field. This type of index in Ottoman is useful for finding a particular object by a unique field such as customer id or email address in the example above.  

In addition to any explicit index, Ottoman also provides a generic find capability using the Query api and N1QL.

### Airport Model

The airport module begins much the same way as the hotel module.  

```ts
import { model, addValidators, Schema } from 'ottoman';    // ← use ottoman
import { GeolocationSchema } from '../shared/geolocation.model';
```

As in the Hotel model example, the Airport object is defined with several different data types, embedded references to other Ottoman models, and explicitly-defined secondary indexes. 

```ts
const AirportSchema = new Schema({
  airportname: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  faa: String,
  geo: GeolocationSchema,
  icao: String,
  tz: { type: String, required: true },
});

AirportSchema.index.findByName = { by: 'name', type: 'n1ql' };

export const AirportModel = model('airport', AirportSchema);
```

### Application and Routing

Now that the models are defined above, the controller functionality is defined in the ```index.ts``` file in the root directory and the routes on the ```*.controller.ts``` files in the module directory.

#### App

The `index.ts` file is the entry point to the application and defines how the application will function.

```ts
import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { UserRoutes, AuthRoutes } from './users/users.controller';
import { start } from '../lib/connections/connection-handler';
import { jwtMiddleware } from './shared/protected.router';
import { AirportRoutes } from './airports/airports.controller';
import { HotelRoutes } from './hotels/hotels.controller';
import { RouteRoutes } from './routes/routes.controller';

const app = express();

app.use(express.json());
app.get('/', (req, res) => {
  res.send('index');
});
app.use('/users', jwtMiddleware, UserRoutes);
app.use('/user', AuthRoutes);
app.use('/airports', jwtMiddleware, AirportRoutes);
app.use('/hotels', jwtMiddleware, HotelRoutes);
app.use('/flightPaths', jwtMiddleware, RouteRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(YAML.load('./api/swagger.yaml')));

// Handle not found and catch exception layer
app.use((req: Request, res: Response) => res.status(404).json({ error: 'Route Not Match' }));
app.use((err: Error, req: Request, res: Response) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token...' });
  }
  return res.status(500).json({ error: err.toString() });
});
const useCollections = false; // set this to true to create scopes/collections
start({ useCollections })
  .then(() => {
    console.log('All the indexes were registered');
    const port = 4500;
    app.listen(port, () => {
      console.log(`API started at http://localhost:${port}`);
    });
  })
  .catch((e) => console.log(e));
// ← API started at http://localhost:4500
```

#### Routes and Documentations

Once you have the example running, you can find all definitions in Swagger:

```http://127.0.0.1:4500/api-docs```
