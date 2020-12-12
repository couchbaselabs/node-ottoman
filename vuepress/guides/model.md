# Model

Models are fancy constructors compiled from [Schema](/guides/schema) definitions.
An instance of a model is called a document.
Models are responsible for creating and reading documents from the underlying Couchbase database.

## Compiling your first model

When you call [model()](/classes/ottoman.html#model) function on a schema, Ottoman compiles a model for you.

```javascript
const schema = new Schema({ name: String, age: Number });
const User = model('User', schema);
```

::: warning
The [model()](/classes/ottoman.html#model) function makes a copy of the schema. Make sure that you've added everything you want to the schema, including hooks, before calling model()!
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
  keyGenerator?: (params: { metadata: ModelMetadata; id: any }) => string;
}
```

### Model id

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

// or

User.create({ name: 'Jane', age: 29 });
// saved!
```

Note that no users will be created/removed until the connection that your model uses is open.
Every model has an associated connection. When you use [model()](/classes/ottoman.html#model),
your model will use the default Ottoman connection.

## Querying

Finding documents is easy with Ottoman, powered by the built-in Query Builder.
Documents can be retrieved using each models `find`, `findById`, `findOne`, defined [indexes](/guides/schema.html#indexes) or where [static methods](/guides/schema.html#statics).

```javascript
User.find({ name: 'Jane' });
// will return a list of all users with the name "Jane"

User.find({ name: 'Jane' }, { limit: 10 });
// will return a list of all users with the name "Jane" and limited to 10 items
```

```javascript
User.findOne({ name: 'Jane' });
// will return a document with a User with the name "Jane" or null in case of not finding it
```

```javascript
User.findById('userId');
// will return the user document with the current id.

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
}
```

### Advanced use of filter parameter.

```javascript
const filter = {
  $or: [{ price: { $gt: 'amount_val', $isNotNull: true } }, { auto: { $gt: 10 } }, { amount: 10 }],
  $and: [
    { price2: { $gt: 1.99, $isNotNull: true } },
    { $or: [{ price3: { $gt: 1.99, $isNotNull: true } }, { id: '20' }] },
  ],
};
User.find(filter);
// Returns a list of the elements that match the applied filters.
```

See the chapter on queries for more details on how to use the [Query](/guides/query-builder) API.

## Deleting

Models have static removeById() function to remove documents matching the given id value.
See the [API](/classes/model.html#static-removebyid) docs for more detail.

```javascript
User.removeById('userId');
```

Models have static removeMany() function to remove all documents matching the given condition.
See the [API](/classes/model.html#static-removemany) docs for more detail.

```javascript
User.removeMany({ name: { $like: '%JohnDoe%' } });
```

## Updating

Each `model` has its own `updateById` method for modifying documents in the database without returning them to your application.
See the [API](/classes/model.html#static-update) docs for more detail.

```javascript
User.updateById('userId', { age: 30 });
// update document with id equal to 'userId' with age 30.
```

Models have static `updateMany` function to update all documents matching the given condition.
See the [API](/classes/model.html#static-updatemany) docs for more detail.

```javascript
User.updateMany({ name: { $like: '%JohnDoe%' } }, { name: 'John' });
```

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

## Next Up

Now that we've covered `Models`, let's take a look at [Documents](/guides/document).
