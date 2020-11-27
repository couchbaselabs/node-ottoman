# Model

Models are fancy constructors compiled from [Schema](/guides/schema) definitions. 
An instance of a model is called a document. 
Models are responsible for creating and reading documents from the underlying Couchbase database.

## Compiling your first model

When you call [model()](/classes/ottoman.html#model) function on a schema, Ottoman compiles a model for you.

```javascript
const schema = new Schema({name: String, age: Number})
const User = model('User', schema);
```
The first argument is the name of the collection your model is for. For the example above, the `model` User is for the **User** collection in the database.

::: warning
The [model()](/classes/ottoman.html#model) function makes a copy of the schema. Make sure that you've added everything you want to the schema, including hooks, before calling model()!
:::


### Model Options

You can pass a third argument to [model()](/classes/ottoman.html#model) functions in order to setup your needs. 
In the next example we will set the `collectionName` to be `users`. 


```javascript
const schema = new Schema({name: String, age: Number})
const User = model('User', schema, {collectionName: 'users'});
```

::: tip
By default Ottoman will take the model name if `collectionName` isn't provided.
:::

The models options are:

```typescript
interface ModelOptions {
  collectionName?: string;
  scopeName?: string;
  idKey?: string;
  scopeKey?: string;
  collectionKey?: string;
  keyGenerator?: (params: { metadata: ModelMetadata; id: any }) => string;
}
```

### Model key
Ottoman will generate automatically your document's `key` and will guarantee that each `key` will be unique.

Each document's `key` will be included on the document under a property called `id` by default.

The `id` property name can be modified using the `ModelOptions.idKey` 

```javascript
const schema = new Schema({name: String, age: Number})
const User = model('User', schema, {collectionName: 'users', idKey: '__id'});
```

The above example will override the default `id` with `__id`, now for the `User`'s documents you can get the `key` value from doc.__id.

::: tip
You can also get the `id` value by calling the `doc._getId()` methods, regardless of the `id` property name.
:::

## Constructing Documents

An instance of a model is called a [document](/guides/document). Creating and saving them to the database is easy.

```javascript
const User = model('User', schema);

const user = new User({name:"Jane", age: 29})

user.save()
// saved!

// or

User.create({name:"Jane", age: 29})
// saved!
```

Note that no users will be created/removed until the connection that your model uses is open. 
Every model has an associated connection. When you use [model()](/classes/ottoman.html#model),
your model will use the default Ottoman connection.


## Querying

Finding documents is easy with Ottoman, powered by the built-in Query Builder. 
Documents can be retrieved using each models `find`, `findById`, defined [indexes](/guides/schema.html#indexes) or where [static methods](/guides/schema.html#statics).

```javascript
User.find({name: "Jane"})
// will return a list of all users with the name "Jane"

User.find({name: "Jane"}, {limit: 10})
// will return a list of all users with the name "Jane" and limited to 10 items
```

```javascript
User.findOne({name: "Jane"})
// will return a document with a User with the name "Jane" or null in case of not finding it
```

```javascript
User.findById('userId')
// will return the user document with the current id.

User.findById('userId', {select: 'name, cards', populate: 'cards'})
// will return the user document with the current id only with the fields name and cards populated
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
User.find(filter)
// Returns a list of the elements that match the applied filters.
```
See the chapter on queries for more details on how to use the [Query](/guides/query-builder) API.

## Deleting

Models have static removeById() function to remove documents matching the given filter.

```javascript
User.removeById('userId')
```

## Updating 
Each `model` has its own `update` method for modifying documents in the database without returning them to your application.
See the [API](/classes/model) docs for more detail.

```javascript
User.update({age: 30}, 'userId')
// update document with id equal to 'userId' with age 30.
```

## Next Up

Now that we've covered `Models`, let's take a look at [Documents](/guides/document).

