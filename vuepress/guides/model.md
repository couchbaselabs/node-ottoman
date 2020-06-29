# Model

Models are fancy constructors compiled from [Schema](/guides/schema) definitions. 
An instance of a model is called a document. 
Models are responsible for creating and reading documents from the underlying Couchbase database.

## Compiling your first model

When you call `model()` function on a schema, Ottoman compiles a model for you.

```javascript
const schema = new Schema({name: String, age: Number})
const User = model('User', schema);
```
The first argument is the name of the collection your model is for. For the example above, the `model` User is for the **User** collection in the database.

::: warning
The `model()` function makes a copy of the schema. Make sure that you've added everything you want to the schema, including hooks, before calling model()!
:::


### Model Options

You can pass a third argument to `model()` functions in order to setup your needs. 
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
}
```


## Constructing Documents

An instance of a model is called a document. Creating and saving them to the database is easy.

```javascript
const User = model('User', schema);

const user = new User({name:"Jane", age: 29})

user.save()
// saved!

// or

User.create({name:"Jane", age: 29})
// saved!

```

Note that no users will be created/removed until the connection your model uses is open. 
Every model has an associated connection. When you use ottoman.model(), your model will use the default ottoman connection.


## Querying

Finding documents is easy with Ottoman, powered by the built-in Query Builder. 
Documents can be retrieved using each models `find`, `findById`, defined [indexes](/guides/schema.html#indexes) or where [static methods](/guides/schema.html#statics).

```javascript
User.find({name: "Jane"})
// will return a list of all users with the name "Jane"
```

```javascript
User.findById('userId')
// will return the user document with the current id.
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

Models have static remove() function to remove documents matching the given filter.

```javascript
User.remove('userId')
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

