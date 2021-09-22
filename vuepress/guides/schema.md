# Schema

Schema maps to a Couchbase collection and defines the shape of the documents within that collection.

![How to Use](./howToUse.jpg)

## Defining Your Schema

Everything in Ottoman starts with a Schema.

```javascript
import { Schema } from 'ottoman';

const blogSchema = new Schema({
  title: { type: String, required: true },
  author: String, // String is shorthand for { type: String }
  authorNative: Schema.Types.String,
  body: String,
  comments: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now },
  hidden: Boolean,
  status: { type: String, enum: ['Close', 'Open', 'Review'] },
  meta: {
    votes: { type: Number, min: 0, max: 5 },
    favs: Number,
  },
  mixedObject: Object,
  mixedNative: Schema.Types.Mixed,
});
```

For more information about options, please [review the types](/guides/schema.html#allowed-schematypes)

Each key in our code `blogSchema` defines a property in our documents which will be cast to its associated [SchemaType](#allowed-schematypes). For example, we've defined a property `title` that will be cast to the [String](/classes/stringtype.html) SchemaType and property `date` which will be cast to a [Date](/classes/datetype.html) SchemaType.

Please note above that if a property only requires a type, it can be specified using a shorthand notation (contrast the `title` property above with the `date` property).

Keys may also be assigned to nested objects containing further key/type definitions like the `meta` property above.
This will happen whenever a key's value is a POJO that lacks a bona fide `type` property.
In these cases, only the leaves in a tree are given actual paths in the schema (like `meta.votes` and `meta.favs` above), and the branches do not have actual paths.
The `meta` above cannot have its own validation as a side-effect of this. If validation is needed up the tree, a path needs to be created up the tree.

## Allowed SchemaTypes

- [String](/classes/stringtype)
- [Number](/classes/numbertype)
- [Boolean](/classes/booleantype)
- [Date](/classes/datetype)
- [Array](/classes/arraytype)
- [Embed](/classes/embedtype)
- [Reference](/classes/referencetype)
- [Mixed](/classes/mixedtype)
- *[Custom](/guides/schema.html#custom-schematypes)*

Schemas not only define the structure of your document and casting of properties, they also define document [instance methods](#instance-methods), [static Model methods](#statics),
[compound indexes](#indexes), [plugins](#plugins), and document lifecycle [hooks](#hooks).

### Custom SchemaTypes

Ottoman supports custom types. Before you reach for a custom type, however, know that a custom type is overkill for most use cases.

Let's take a look at an example of a basic schema type: a 1-byte integer. To create a new schema type, you need to inherit from `IOttomanType` and add the corresponding `registerType`. The only methods you need to implement are [cast()](/guides/schema.html#cast-method) and [validate()](/guides/schema.html#validate-method).

```typescript
class Int8 extends IOttomanType {
  constructor(name: string) {
    super(name, 'Int8');
  }

  cast(value: unknown): unknown {
    const castedValue = Number(value);
    return isNaN(castedValue)
      ? checkCastStrategy(value, CAST_STRATEGY.THROW, this)
      : castedValue;
  }

  validate(value: unknown): unknown {
    let int8Value = Number(value);
    if (isNaN(int8Value)) {
      throw new ValidationError(`Int8: ${value} is not a number`);
    }
    int8Value = Math.round(int8Value);
    if (int8Value < -0x80 || int8Value > 0x7f) {
      throw new ValidationError(`Int8: ${value} is outside of the range of valid 8-bit ints`);
    }
    return int8Value;
  }
}

// Don't forget to add `Int8` to the type registry
registerType(Int8.name, (fieldName) => new Int8(fieldName));

// Define schema and model
const CustomTypeSchema = new Schema({ test: Int8 });
const CustomTypeModel = model('CustomTypeExample', CustomTypeSchema);

CustomTypeSchema instanceof Schema; // true
CustomTypeSchema.path('test') instanceof Int8; // true

const value = new CustomTypeModel({ test: 0x6f });
value._validate().test; // 111

const bigger = new CustomTypeModel({ test: 0x8f });
bigger._validate(); // ValidationError: Int8: 143 is outside of the range of valid 8-bit ints

const invalid = new CustomTypeModel({ test: 'invalid test value' });
invalid._validate(); // ValidationError: Property 'test' must be of type 'Int8'

```

## Schema Options

Schemas have a few configurable options which can be passed to the constructor:

```typescript
new Schema({...}, options);
```

The availables options are:
```typescript
export interface SchemaOptions {
  strict?: boolean;
  preHooks?: Hook;
  postHooks?: Hook;
  timestamps?: boolean | SchemaTimestampsConfig;
}
```

### Option Timestamps

The timestamps option tells `Ottoman` to assign `createdAt` and `updatedAt` fields to your schema. The type assigned is `Date`.

By default, the names of the fields are `createdAt` and `updatedAt`. Customize the field names by setting `timestamps.createdAt` and `timestamps.updatedAt`.

Basic example:
```typescript
const travelSchema = new Schema({..}, { timestamps: true });
const Travel = model('Travel', thingSchema);
const travel = new Travel();
await travel.save(); // `createdAt` & `updatedAt` will be included
```

Customize `createdAt` to `created_at`
```typescript
const travelSchema = new Schema({..}, { timestamps: { createdAt: 'created_at' } });
const Travel = model('Travel', thingSchema);
const travel = new Travel();
await travel.save(); // `created_at` & `updatedAt` will be included
```

By default, Ottoman uses `new Date()` to get the current time. If you want to overwrite the function Ottoman uses to get the current time, you can set the `timestamps.currentTime` option.
Ottoman will call the `timestamps.currentTime` function whenever it needs to get the current time.

```typescript
const schema = Schema({
  createdAt: Number,
  updatedAt: Number,
  name: String
}, {
  // Make Ottoman use Unix time (seconds since Jan 1, 1970)
  timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
});
```

## Creating a Model

To use our schema definition, we need to convert our `blogSchema` into a [Model](/guides/model.html) we can work with. To do so, we pass it into `model(modelName, schema)`:

```javascript
const Blog = model('Blog', blogSchema);
// ready to go!
```

## Instance Methods

Instances of `Models` are [documents](/guides/document.md). Documents have many of their own [built-in instance methods](/classes/document.html). We may also define our own custom document instance methods.

```javascript
import { connect, Schema } from 'ottoman';
const main = async () => {
  // connecting
  const connection = await connect('couchbase://localhost/travel-sample@admin:password');

  // define a schema
  const animalSchema = new Schema({ name: String, type: String });

  // assign a function to the "methods" object of our animalSchema
  animalSchema.methods.findSimilarTypes = function () {
    return connection.getModel('Animal').find({ type: this.type });
  };
}

main();
```

Now all of our `animal` instances have a `findSimilarTypes` method available to them.

```javascript
const Animal = model('Animal', animalSchema);
const dog = new Animal({ type: 'dog' });

const dogs = await dog.findSimilarTypes();
console.log(dogs);
```

- Overwriting a default Ottoman document method may lead to unpredictable results.
- The example above uses the `Schema.methods` object directly to save an instance method.

::: danger Note
Do **not** declare _methods_ using ES6 arrow functions (`=>`). Arrow functions [explicitly prevent binding](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) `this`, so your method will **not** have access to the document, and the above examples will not work.
:::

## Statics

You can also add static functions to your model.

Add a function property to `schema.statics`

```javascript
// Assign a function to the "statics" object of our animalSchema
animalSchema.statics.findByName = function (name) {
  return this.find({ name: name });
};

const Animal = model('Animal', animalSchema);
let animals = await Animal.findByName('fido');
```

::: danger Note
Do **not** declare _statics_ using ES6 arrow functions (`=>`). Arrow functions [explicitly prevent binding](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) `this`, so the above examples will **not** work because of the value of `this`.
:::


## Indexes

You can specify several indexes on a model. There are different kinds of indexes, each with its own benefits and restrictions.

To specify indexes on a [Schema](/guides/schema), use the index key on the schema:

```javascript
import { Schema } from 'ottoman';

const schema = new Schema({
  email: String,
  name: {
    first: String,
    last: String,
    full: String,
  },
});

schema.index.findByEmail = {
  by: 'email',
  type: 'refdoc',
};

schema.index.findByFirstName = {
  by: 'name.first',
  type: 'view',
};

schema.index.findByLastName = {
  by: 'name.last',
  type: 'n1ql',
};
```

To ensure that server is working, you must call the `start` method. This method will internally generate a list of indexes and scopes, collections (if you have the developer preview active) which will be used with the most optimal configuration for them and will build the structures that might be missing on the server. This method must be called after all models are defined, and it is a good idea to call this only when needed rather than any time your server is started.

```javascript
const { connect, model, start, close } = require('ottoman');

async function createUser() {
  await connect('couchbase://localhost/travel-sample@admin:password');
  
  const User = model('User', { name: String });
  const user = new User({ name: 'Jane Doe' });

  try {
    await start();

    console.log("Ottoman is ready!")
    const newUser = await user.save();

    await close();
    console.log(`User '${ newUser.name }' successfully created`);
  } catch (e) {
    console.log(`ERROR: ${ e.message }`);
  }
}

createUser();
```

You should see results similar to the following:

```bash
Ottoman is ready!
User 'Jane Doe' successfully created
```

## Index Types

Below are some quick notes on the types of indexes available, and their pros and cons. For a more in-depth discussion, consider reading [Couchbasics: How Functional and Performance Needs Determine Data Access in Couchbase](https://blog.couchbase.com/determine-data-access-in-couchbase/).

### N1QL Query Language

These indexes are the default and use the Couchbase Server's SQL-like query language, [N1QL](https://docs.couchbase.com/server/current/n1ql/query.html). When `start` or `ensureIndexes` functions are executed, Ottoman automatically creates several secondary indexes so that the models can make queries to the database. These indexes are more performant than views in many cases and are significantly more flexible, allowing even un-indexed searches.

N1QL indexes in Ottoman use [Couchbase GSIs](https://docs.couchbase.com/server/current/learn/services-and-indexes/indexes/global-secondary-indexes.html). If you need speed, and the flexibility of queries, this is the way to go.

```typescript
const UserSchema = new Schema({
  name: String,
  email: String,
  card: {
    cardNumber: String,
    zipCode: String,
  },
  roles: [{ name: String }],
});

// N1QL index declaration
UserSchema.index.findN1qlByNameandEmail = {
  by: ['name', 'email'],
  options: { limit: 4, select: 'name, email' },
  type: 'n1ql',
};

// Model declaration
const User = model('User', UserSchema);

// Some data to test
const userData = {
  name: `index`,
  email: 'index@email.com',
  card: { cardNumber: '424242425252', zipCode: '42424' },
  roles: [{ name: 'admin' }],
};

// Create new user instance
const user = new User(userData);
// Save data
await user.save();

// Call findN1qlByNameandEmail index
const usersN1ql = await User.findN1qlByNameandEmail([userData.name, userData.email]);
console.log(usersN1ql.rows);

```

```sh
// Output!!!
[
  {
    "_type": "User",
    "email": "index@email.com",
    "name": "index"
  }
]
```

:::warning Not Recommended
`ensureIndex` is nice for development, but it's recommended this behavior be disabled in production since index creation can cause a significant performance impact.
Disable the behavior by not executing `ensureIndex` function. (for example you can use node env variable to know when you are in development mode [process.ENV.development])

Notice: the `start` function should be disabled too, owing to its use of `ensureIndexes` internally.
:::

### RefDoc

These indexes are the most performant, but the least flexible. They allow only a single document to occupy any particular value and do direct key-value lookups using a referential document to identify a matching document in Couchbase.

In short, if you need to look up a document by a single value of a single attribute quickly (e.g. key lookups), this is the way to go. But you cannot combine multiple refdoc indexes to speed up finding something like "all customers with the first name of 'John' and last name of 'Smith'".

```typescript
const UserSchema = new Schema({
  name: String,
  email: String,
  card: {
    cardNumber: String,
    zipCode: String,
  },
  roles: [{ name: String }],
});

// Refdoc index declaration
UserSchema.index.findRefName = { by: 'name', type: 'refdoc' };

// Model declaration
const User = model('User', UserSchema);

// Some data to test
const userData = {
  name: `index`,
  email: 'index@email.com',
  card: { cardNumber: '424242425252', zipCode: '42424' },
  roles: [{ name: 'admin' }],
};

// Create new user instance
const user = new User(userData);
// Save data
await user.save();

// Call findRefName index
const userRefdoc = await User.findRefName(userData.name);
console.log(userRefdoc);
```

```sh
{
  "name": "index",
  "email": "index@email.com",
  "card": {
    "cardNumber": "424242425252",
    "zipCode": "42424"
  },
  "roles": [
    {
      "name": "admin"
    }
  ],
  "id": "66c2d0dd-76ab-4b91-83b4-353893e3ede3",
  "_type": "User"
}
```

::: warning
**Refdoc Index** is not managed by Couchbase but strictly by Ottoman. It does not guarantee consistency if the keys that are a part of these indexes are updated by an external operation, like N1QL for example.

**_Needs to be used with caution!!!_**
:::

### View

:::warning Deprecated
View indexes were deprecated in Ottoman v2 and will be remove the next mayor version of the package.
:::

This type of index is always available once `ensureIndexes` is called and will work with any Couchbase Server version.

Because views use map-reduce, certain types of queries can be faster as the query can be parallelized over all nodes in the cluster, with each node returning only partial results. One of the cons of views is that they are eventually consistent by default, and incur a performance penalty if you want consistency in the result.

```typescript
const UserSchema = new Schema({
  name: String,
  email: String,
  card: {
    cardNumber: String,
    zipCode: String,
  },
  roles: [{ name: String }],
});

// View index declaration
UserSchema.index.findByName = { by: 'name', type: 'view' };

// Model declaration
const User = model('User', UserSchema);

// Some data to test
const userData = {
  name: `index`,
  email: 'index@email.com',
  card: { cardNumber: '424242425252', zipCode: '42424' },
  roles: [{ name: 'admin' }],
};

// Create new user instance
const user = new User(userData);
// Save data
await user.save();

// Call findByName index
const viewIndexOptions = new ViewIndexOptions({ limit: 1 });
const usersView = await User.findByName(userData.name, viewIndexOptions);
```

## Hooks

Hooks are functions that are passed control during the execution of asynchronous functions. Hooks are specified at the schema level and are useful for writing plugins.

### Available Hooks

- `validate`
- `save`
- `update`
- `remove`

### Register Hooks with `pre`

Pre functions are executed one after another, for each hook registered.

```javascript
import { Schema } from 'ottoman';

const schema = new Schema(...);
schema.pre('save', function (document) {
  // do stuff
});
```

You can use a function that returns a promise. In particular, you can use async/await.

```javascript
schema.pre('save', function () {
  return doStuff().then(() => doMoreStuff());
});

// Or, in Node.js >= 7.6.0:
schema.pre('save', async function () {
  await doStuff();
  await doMoreStuff();
});
```

### Hooks Use Cases

Hooks are useful for atomizing model logic, such as:

- Complex validation;
- Removing dependent documents (removing a user removes all his blogposts);
- Asynchronous defaults;
- Asynchronous tasks that a certain action triggers.

### Errors in Pre Hooks

If any pre hook errors out, Ottoman will not execute subsequent hooks or the hooked function.

```javascript
schema.pre('save', function () {
  // You can also return a promise that rejects
  return new Promise((resolve, reject) => {
    reject(new Error('something went wrong'));
  });
});

schema.pre('save', function () {
  // You can also throw a synchronous error
  throw new Error('something went wrong');
});

schema.pre('save', async function () {
  await Promise.resolve();
  // You can also throw an error in an `async` function
  throw new Error('something went wrong');
});

// later...

// Changes will not be persisted to Couchbase Server because a pre hook errored out
try {
  await myDoc.save();
} catch (e) {
  console.log(e.message); // something went wrong
}
```

### Post Hooks

`post` middleware is executed after the hooked method and all of its pre hooks have been completed.

```javascript
schema.post('validate', function (doc) {
  console.log('%s has been validated (but not saved yet)', doc.id);
});
schema.post('save', function (doc) {
  console.log('%s has been saved', doc.id);
});
schema.post('remove', function (doc) {
  console.log('%s has been removed', doc.id);
});
```

### Define Hooks Before Compiling Models

Calling `pre()` or `post()` after compiling a model does not work in Ottoman in general. For example, the below `pre('save')` hook will not fire.

```javascript
const schema = new Schema({ name: String });

// Compile a model from the schema
const User = model('User', schema);

// Ottoman will **not** call the middleware function, because
// this hook was defined after the model was compiled
schema.pre('save', () => console.log('Hello from pre save'));

new User({ name: 'test' }).save();
```

### Save/Validate Hooks

The `save()` function triggers `validate()` hooks, because Ottoman has a built-in `pre('save')` hook that calls `validate()`. This means that all `pre('validate')` and `post('validate')` hooks get called before any `pre('save')` hooks. The `updateById()` function have the same behavior.

```javascript
schema.pre('validate', function () {
  console.log('this gets printed first');
});
schema.post('validate', function () {
  console.log('this gets printed second');
});
schema.pre('save', function () {
  console.log('this gets printed third');
});
schema.post('save', function () {
  console.log('this gets printed fourth');
});
```

## Plugins

Schemas are pluggable, that is, they allow for applying pre-packaged capabilities to extend their functionality. This is a very powerful feature.

### Plugin Example

Plugins are a tool for reusing logic in multiple schemas. Suppose you have several models in your database and want to add a function to log all doc before save. Just create a plugin once and apply it to each Schema using the `plugin` function:

```javascript
const pluginLog = (schema) => {
  schema.pre('save', function (doc) {
    console.log(doc)
  });
};

const UserSchema = new Schema({
  isActive: Boolean,
  name: String
});

UserSchema.plugin(pluginLog)

const UserModel = model('User', UserSchema);

const user = new UserModel(...);
// Pre save hooks will be executed and it will print the document just before persisting to Couchbase Server
await user.save();
```

### Global Plugins

Want to register a plugin for all schemas? The Ottoman `registerGlobalPlugin` function registers a plugin for every schema. For example:

```javascript
import { registerGlobalPlugin } from 'ottoman';

const pluginLog = (schema) => {
  schema.pre('save', function (doc) {
    console.log(doc)
  });
};

registerGlobalPlugin(pluginLog);

const UserSchema = new Schema({
  isActive: Boolean,
  name: String
});

const UserModel = model('User', UserSchema);

const user = new UserModel(...);
// Pre save hooks will be executed and it will print the document just before persisting to Couchbase Server
await user.save();
```

## Strict Mode

The `strict` option (enabled by default) ensures that values passed to our model constructor that were not specified in our schema do not get saved to the database.

```javascript
const userSchema = new Schema({ ... })
const User = model('User', userSchema);
const user = new User({ iAmNotInTheSchema: true });
user.save(); // iAmNotInTheSchema is not saved to the db

// set to false..
const userSchema = new Schema({ ... }, { strict: false });
const user = new User({ iAmNotInTheSchema: true });
user.save(); // iAmNotInTheSchema is now saved to the db!
```

This value can be overridden at the model instance level by passing as second argument:

```javascript
const User = model('User', userSchema);
const user = new User(doc, { strict: true }); // enables strict mode
const user = new User(doc, { strict: false }); // disables strict mode
```

## Schema Types Immutable Option

Defines this path as `immutable`. Ottoman prevents you from changing `immutable` paths allowing, you to safely write untrusted data to Couchbase without any additional validation.

With update functions Ottoman also strips updates to `immutable` properties from [updateById()](/interfaces/imodel.html#updatebyid), [updateMany()](/interfaces/imodel.html#updatemany), [replaceById()](/interfaces/imodel.html#replacebyid) and [findOneAndUpdate()](/interfaces/imodel.html#findoneandupdate). Your update will succeed if you try to overwrite an `immutable` property, Ottoman will just strip out the `immutable` property.

Let's see this option in action using `findOneAndUpdate` on `immutable` properties:

```ts
// Define base data
const cardData = {
  cardNumber: '5678 5678 5678 5678',
  zipCode: '56789',
};

const cardDataUpdate = {
  cardNumber: '4321 4321 4321 4321',
  zipCode: '43210',
};

// Define schemas
const CardSchema = new Schema({
  cardNumber: { type: String, immutable: true },
  zipCode: String,
});

// Create model
const Card = model('Card', CardSchema);

// Start Ottoman instance
const ottoman = getDefaultInstance();
await ottoman.start();

// Initialize data
const { id } = await Card.create(cardData);
```

### Immutable with strategy `true` ***(default)***

```ts
await Card.findOneAndUpdate(
  { cardNumber: { $like: '%5678 5678 5678 5678%' } }, cardDataUpdate,
  { new: true, strict: true }
);
const result = await Card.findById(id);
console.log(result);
```

Since `cardNumber` is immutable, Ottoman ignores the update to `cardNumber` and only `zipCode` changed:

```sh
{
  cardNumber: '5678 5678 5678 5678',
  zipCode: '43210'
}
```

### Immutable with strategy `false`

```ts
await Card.findOneAndUpdate(
  { cardNumber: { $like: '%5678 5678 5678 5678%' } }, cardDataUpdate,
  { new: true, strict: false }
);
const result = await Card.findById(id);
console.log(result);
```

All properties must change:

```sh
{
  cardNumber: '4321 4321 4321 4321',
  zipCode: '43210'
}
```

### Immutable with strategy `THROW`

If `strict` is set to `THROW`, Ottoman will throw an error if you try to update `cardNumber`

```ts
await Card.findOneAndUpdate(
  { cardNumber: { $like: '%5678 5678 5678 5678%' } }, cardDataUpdate,
  { new: true, strict: CAST_STRATEGY.THROW }
);
```

will get:

```sh
ImmutableError: Field 'cardNumber' is immutable and current cast strategy is set to 'throw'
```

::: tip NOTE
Ottoman's immutability only applies to `document` that have already been saved to the database.
```ts
// Define schema
const CardSchema = new Schema({
  cardNumber: { type: String, immutable: true },
  zipCode: String,
});
// Create model
const Card = model('Card', CardSchema);
// Create document
const myCard = new Card({ cardNumber: '4321 4321 4321 4321', zipCode: '43210' });
// Document is new
myCard.$isNew; // true

// can update the document because $isNew: true
myCard.cardNumber = '0000 0000 0000 0000';
myCard.cardNumber; // '0000 0000 0000 0000'

// now let's save myCard
const ottoman = getDefaultInstance();
await ottoman.start();

const myCardSaved = await myCard.save();

// after save
myCardSaved.cardNumber = '1111 1111 1111 1111';
myCardSaved.cardNumber; // '0000 0000 0000 0000', because `cardNumber` is immutable

// Example with create
const myCard2 = await Card.create({
  cardNumber: '4321 4321 4321 4321',
  zipCode: '3232'
});
const myCard3 = await Card.findOne(
  { cardNumber: '4321 4321 4321 4321' }, // filters
  { consistency: SearchConsistency.LOCAL } // options
);

myCard2.$isNew; // false
myCard3.$isNew; // false
```
:::

## Schema Helpful Methods

Each `Schema` instance has two helpful methods: `cast` and `validate`.

### Cast Method

The `cast` method gets a Javascript Object as the first parameter and enforces schema types for each field in the schema definition.

```javascript
const schema = new Schema({
  name: String,
  price: Number,
  createdAt: Date
})

const result = schema.cast({
  name: 'TV',
  price: '345.99',
  createdAt: '2020-12-20T16:00:00.000Z'
})
```

Result variable now look like this:

```sh
{
  name: 'TV',
  price: 345.99, // price was casted to Number
  createdAt: 2020-12-20T16:00:00.000Z //createdAt was casted to Date
}
```

#### Cast Method Options

`cast` method have a few useful options:

```typescript
interface CastOptions {
  strict?: boolean;
  skip?: string[];
  strategy?: CAST_STRATEGY;
}
```

- `strict` will remove fields not defined in the schema. The default value is set to true.
- `skip` will be a string array with values of the key you may want to prevent to cast. The default value is empty [].
- `strategy` when cast action fails, defined strategy is applied. The default strategy is set to `defaultOrDrop`.

Available strategies are:

```js
CAST_STRATEGY
{
  KEEP = 'keep', // will return original value
  drop = 'DROP', // will remove the field
  THROW = 'throw', // will throw an exception
  DEFAULT_OR_DROP = 'defaultOrDrop', // use default or remove the field if no default was provided
  DEFAULT_OR_KEEP = 'defaultOrKeep' // use default or return original value
}
```

### Validate method

The `validate` method gets a Javascript Object as the first parameter and enforces schema types, rules, and validations for each field in the schema definition. If something fails an exception will be throw up, else the `validate` method will return a valid object for the current Schema.

```javascript
const schema = new Schema({
  name: String,
  price: Number,
  createdAt: Date
})

const result = schema.validate({
  name: 'TV',
  price: '345.99',
  createdAt: '2020-12-20T16:00:00.000Z'
})
```

Result variable now looks like this:

```sh
{
  name: 'TV',
  price: 345.99, # price was casted to Number
  createdAt: 2020-12-20T16:00:00.000Z # createdAt was casted to Date
}
```

#### Validate Method Options

`validate` method has 1 option:

```javascript
{
  strict: boolean; // strict set to true, will remove field not defined in the schema
}
```

By default, it will get the `strict` option value set via the Schema constructor.

## Extend Schemas

### Add Method

The `add` method allows adding extra fields or extending properties of other schemas.

```ts
const plane = new Schema({ name: String });
const boeing = new Schema({ price: Number });
boeing.add(plane);

// You can add also add fields to this schema
boeing.add({ status: Boolean });
```

::: tip
When a schema is added, the following properties are copied: fields, statics, indexes, methods, and hooks. Properties that already exist in the schema (fields, statics, indexes, methods) are overwritten by those of the added schema, except for hooks that are combined.
:::

## Next Up

Nice, now we'll can see how [Models](/guides/model) works.
