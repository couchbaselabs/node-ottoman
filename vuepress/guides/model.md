# Model

Models are fancy constructors compiled from [Schema](/guides/schema) definitions. 
An instance of a model is called a document. 
Models are responsible for creating and reading documents from the underlying Couchbase database.

## Compiling your first model

When you call ottoman.model() on a schema, Ottoman compiles a model for you.

```javascript
const schema = new Schema({name: String, age: Number})
const User = model('User', schema);
```
The first argument is the name of the collection your model is for. for the example above, the `model` User is for the **User** collection in the database.

::: warning
The model() function makes a copy of schema. Make sure that you've added everything you want to schema, including hooks, before calling model()!
:::


## Constructing Documents

An instance of a model is called a document. Creating them and saving to the database is easy.

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

Finding documents is easy with Ottoman, empower by a built-in Query Builder. 
Documents can be retreived using each models find, findById or where static methods.

```javascript
User.find({name: "Jane"})
// will return a list of all users with the name "Jane"
```

See the chapter on queries for more details on how to use the [Query](/guides/query-builder) api.

## Deleting

Models have static remove() function to remove documents matching the given filter.

```javascript
User.remove({age: 29})
// will remove all users with age equal to 29
```

## Updating 
Each `model` has its own `update` method for modifying documents in the database without returning them to your application.
See the [API](/classes/model) docs for more detail.

```javascript
User.update({age: 30}, 'userId')
// update document with id equal to 'userId' with age 30.
```

<i>If you want to update a single document in the db and return it to your application, use findOneAndUpdate instead.</i>


## Next Up

Now that we've covered `Models`, let's take a look at [Documents](/guides/document).

