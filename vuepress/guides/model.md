# Model

[Models](/classes/model.html) are fancy constructors compiled from [Schema](/guides/schema) definitions.

An instance of a model is called a [document](/guides/document.html).

Models are responsible for creating and reading documents from the underlying Couchbase database.

## Compiling Your First Model

When you call [model()](/classes/ottoman.html#model) function on a schema, Ottoman compiles a model for you.

```javascript
const schema = new Schema({ name: String, age: Number });
const User = model('User', schema);
```

::: warning
The [model()](/classes/ottoman.html#model) function makes a copy of the `schema`. Make sure that you've added everything you want to the `schema`, including hooks, before calling `model()`!
:::

### Model Options

You can pass a third argument to [model()](/classes/ottoman.html#model) functions in order to setup your needs.
In the next example we will set the `collectionName` to be `users`.

```javascript
const schema = new Schema({ name: String, age: Number });
const User = model('User', schema, { collectionName: 'users' });
```

::: tip Defining Collection Name
Models will be mapped to your Collections, if no Collection name option is provided then the Collection name will be equal to the Model name.
There is an exception to this rule:

- If you provide a `collectionName` option at Ottoman instance level then the Collection name will be equal to Ottoman `collectionName` option
  if it's not explicitly passed as `collectionName` in model options.

  ```typescript
  import { Ottoman } from 'ottoman';

  const ottoman = new Ottoman({ collectionName: '_default' });
  const schema = new Schema({ name: String, age: Number });

  // Collection name for model `Cat` will be `_default`
  const Cat = ottoman.model('Cat', schema);

  // Collection name for model `Dog` will be `dogs`
  const Dog = ottoman.model('Dog', schema, { collectionName: 'dogs' });
  ```

  Therefore this is the way to get the Collection name for a Model:
  Collection Name = Model `collectionName` Options > Ottoman `collectionName` Options > Model name
  :::

The models options are:

```typescript
interface ModelOptions {
  collectionName?: string;
  scopeName?: string;
  idKey?: string;
  modelKey?: string;
  maxExpiry?: number;
  keyGenerator?: (params: { metadata: ModelMetadata }) => string;
  keyGeneratorDelimiter?: string;
}
```

- `collectionName`: define the collection name to be use in the Couchbase Server. The default value will be the Model's name.
- `scopeName`: define the scope where the collection will be placed. The default value is `_default`
- `idKey`: it's the value of the key to save your id. The default value is set to 'id'.
- `modelKey`: define the key to store the model name into the document. The default value is `_type`
- `maxExpiry`: value used to create a collection for this instance. The default value is `0`.
- `keyGenerator`: function to generate the key to store documents.
- `keyGeneratorDelimiter`: string value used to build the document key. The default value is `::`

If you don't provided a `keyGenerator` or `keyGeneratorDelimiter` implementation it will be inherited by `Ottoman` instance options, check this in [Ottoman options](/guides/ottoman.html#ottoman-constructor-options)

### Model Id

Ottoman will generate automatically your document's `id` and will guarantee that each `id` will be unique.

Each document's `id` will be included on the document under a property called `id` by default.

The `id` property name can be modified using the `ModelOptions.idKey`

```javascript
const schema = new Schema({ name: String, age: Number });
const User = model('User', schema, { collectionName: 'users', idKey: '__id' });
```

The above example will override the default `id` with `__id`, now for the `User`'s documents you can get the `id` value from doc.\_\_id.

::: tip
You can also get the `id` value by calling the `doc._getId()` methods, regardless of the `id` property name.
:::

## Constructing Documents

An instance of a model is called a [document](/guides/document). Creating and saving them to the database is easy.

```javascript
const User = model('User', schema);

const user = new User({ name: 'Jane', age: 29 });

user.save();
// saved!

User.create({ name: 'Jane', age: 29 });
// also saved!
```

Note that no users will be created/removed until the connection that your model uses is open.
Every model has an associated connection. When you use [model()](/classes/ottoman.html#model),
your model will use the default Ottoman connection.

### Create Many

Also you can use `createMany` static function to create multiples documents at once.
See the [API](/classes/model.html#static-createmany) docs for more detail.

```javascript
User.createMany([{ name: 'John' }, { name: 'Jane' }]);
```

::: tip
The response status will be **SUCCESS** as long as no error occurs, otherwise it will be **FAILURE**.
:::

## Querying

Finding documents is easy with Ottoman, powered by the built-in Query Builder.
Documents can be retrieved using each `models` [find](/interfaces/imodel.html#find), [findById](/interfaces/imodel.html#findbyid), [findOne](/interfaces/imodel.html#findone), defined [indexes](/guides/schema.html#indexes) or where [static methods](/guides/schema.html#statics).

```javascript
User.find({ name: 'Jane' });
// will return a list of all users with the name "Jane"

User.find({ name: 'Jane' }, { limit: 10 });
// will return a list of all users with the name "Jane" and limited to 10 items

User.find({ name: {$eq: 'Jane', $ignoreCase: true }});
// In some cases you need to compare without taking into account case sensitive, for this you can use the $ ignoreCase property: true

```

```javascript
User.findOne({ name: 'Jane' });
// will return a document with a User with the name "Jane" or null in case of not finding it
```

```javascript
User.findById('userId');
// will return the user document with the current id

User.findById('userId', { select: 'name, cards', populate: 'cards' });
// will return the user document with the current id only with the fields name and cards populated
```

The find options are: [link](/classes/findoptions.html#hierarchy)

```typescript
export interface IFindOptions {
  skip?: number;
  limit?: number;
  sort?: Record<string, SortType>;
  populate?: string | string[];
  populateMaxDeep?: number;
  select?: ISelectType[] | string | string[];
  consistency?: SearchConsistency;
  noCollection?: boolean;
  lean?: boolean;
  ignoreCase?: boolean;
}
```

### Advanced Use of Select Parameter

You can select nested objects using the structure defined in the N1QL Language documentation [Link]([https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/constructionops.html)

```typescript
User.find({name: 'john'}, {select: '{"latLon": {geo.lat, geo.lon}, geo.lat} as geo  }'})

```

### Advanced Use of Filter Parameter

```typescript
const filter = {
  $or: [{ price: { $gt: 'amount_val', $isNotNull: true } }, { auto: { $gt: 10 } }, { amount: 10 }],
  $and: [
    { price2: { $gt: 1.99, $isNotNull: true } },
    { $or: [{ price3: { $gt: 1.99, $isNotNull: true } }, { id: '20' }] },
  ],
};
User.find(filter);
// Returns a list of the elements that match the applied filters
```

### Use of `ignoreCase`

```typescript
// Defining `User` schema
const userSchema = {
  name: String,
};
// Some test documents
const user1 = { name: 'COUCHBASE' };
const user2 = { name: 'couchbase' };

// Create and save `User` model
const UserModel = model('User', userSchema);

await UserModel.create(user1);
await UserModel.create(user2);
```

* Without `ignoreCase`

```typescript
const { rows: documents } = await UserModel.find({ name: { $eq: 'Couchbase' } }, { lean: true });
console.log(`Documents: `, documents);
```

Will get:

```sh
$> Documents:  []
```

* Using `$ignoreCase` in filters params

```typescript
const { rows: documents } = await UserModel.find(
    { name: { $eq: 'Couchbase', $ignoreCase: true } }, // Find filters
    { lean: true } // Find ptions
);
console.log(`Documents: `, documents);
```

* Using `ignoreCase` in find options

```typescript
const { rows: documents } = await UserModel.find(
    { name: { $like: 'Couch%' } }, // Find filters
    { lean: true, ignoreCase: true } // Find ptions
);
// Could also use:
const { rows: documents } = await UserModel.find(
        { name: 'Couchbase' }, // Find filters
        { lean: true, ignoreCase: true } // Find ptions 
);
console.log(`Documents: `, documents);
```

For the two previous examples will get something like this:

```sh
$> Documents: [
  {
    _type: 'User',
    id: 'da520506-11c3-4f66-b36c-6cb38d51fd16',
    name: 'COUCHBASE'
  },
  {
    _type: 'User',
    id: '97a3b89e-9c2e-4a75-86d0-f83a5b6f3aa3',
    name: 'couchbase'
  }
]
```

::: tip Note
Using `ignoreCase` as part of find functions options will always prioritize the value of `$ignoreCase` defined in the clause

```typescript
UserModel.find([
  { address: { $like: 'NY-%', $ignoreCase: false } }, // ignoreCase will not be applied
  { name: 'John' } //  ignoreCase will be applied
], { ignoreCase: true });
```
:::

See the chapter on queries for more details on how to use the [Query](/guides/query-builder) API.

## Deleting

Models have static `removeById()` function to remove documents matching the given id value.
See the [API](/classes/model.html#static-removebyid) docs for more detail.

```javascript
User.removeById('userId');
```

Models have static `removeMany()` function to remove all documents matching the given condition.
See the [API](/classes/model.html#static-removemany) docs for more detail.

```javascript
User.removeMany({ name: { $like: '%JohnDoe%' } });
```

::: tip
The response status will be **SUCCESS** as long as no error occurs, otherwise it will be **FAILURE**.
:::

## Updating

Each `model` has its own `updateById` method for modifying documents in the database without returning them to your application.
See the [API](/classes/model.html#static-updatebyid) docs for more detail.

```javascript
User.updateById('userId', { age: 30 });
// update document with id equal to 'userId' with age 30
```

Models have static method `replaceById` which has the same behavior as **updateById**, except that the replaceById replaces the existing document with the given document.
See the [API](/classes/model.html#static-replacebyid) docs for more detail.

```javascript
User.replaceById('userId', { age: 30, name: 'John' });
```

::: warning
The replaceById method completely replaces the existing document as long as the new document complies with the schema rules.
:::

Models have static `updateMany` function to update all documents matching the given condition.
See the [API](/classes/model.html#static-updatemany) docs for more detail.

```javascript
User.updateMany({ name: { $like: '%JohnDoe%' } }, { name: 'John' });
```

::: tip
The response status will be **SUCCESS** as long as no error occurs, otherwise it will be **FAILURE**.
:::

Models have static `findOneAndUpdate` function to finds a document that matches the conditions of the collection and updates it.
See the [API](/classes/model.html#static-findoneandupdate) docs for more detail.

```javascript
User.findOneAndUpdate({ name: { $like: '%John Doe%' } }, { name: 'John' }, { new: true, upsert: true });
```

::: tip
By default the option **new** and **upsert** are **false**

If options.new is **true** return the document after update otherwise by default return the document before update.

If options.upsert is **true** insert a document if the document does not exist.
:::

## Handling Multilpe Models

When you create a new `Model` Ottoman will register it by name.

```javascript
const User = model('User', userSchema);

// Ottoman under the hood will register in a dictionary object with a key set to model name
const models = {
  User: UserModel,
};
```

::: warning
Duplicate Model's name will throw an exception notifying about the register model duplication.
:::

### Getting Existing Models

You can retrieve a registered Model using the `getModel` function.

```javascript
import { getModel, model } from 'ottoman';

const User = model('User', { name: string });

// anywhere else in the app
const User = getModel('User');
```

If the name provided doesn't match any registered model `undefined` value will be returned.

:::tip
Maybe you want to get an existing model and if it's don't exist then attempt to create, the next example could be helpful.

```javascript
import { getModel, model } from 'ottoman';

const User = getModel('User') || model('User', userSchema);
```

:::

### Drop Collection

Ottoman's `Models` provide a `dropCollection` static method to remove a collection.

```typescript
...
const User = model('User', schema, {scopeName: 'scopeA'});

// dropCollection without parameter will drop it's own collection
// This case User Collection in the scopeA will be removed
User.dropCollection()

// dropCollection with collectionName parameter will drop the collection in the same scope
// This case Cat Collection in the scopeA will be removed
User.dropCollection('Cat')

// dropCollection can even drop a collection from another scope, if it's provide explicitly
// This case Cat Collection in the scopeB will be removed
User.dropCollection('Cat', 'scopeB')
```

To check the dropCollection API click [here](/classes/model.html#static-dropcollection)

## Next Up

Now that we've covered `Models`, let's take a look at [Documents](/guides/document).
