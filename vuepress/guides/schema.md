# Schema

Schema maps to a Couchbase collection and defines the shape of the documents within that collection.

![How to Use](./how-to-use.png)

## Defining your schema

Everything in Ottoman starts with a Schema. 

```javascript
const blogSchema = new Schema({
  title:  String, // String is shorthand for {type: String}
  author: String,
  body:   String,
  comments: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now },
  hidden: Boolean,
  meta: {
    votes: Number,
    favs:  Number
  }
});
```

Each key in our code blogSchema defines a property in our documents which will be cast to its associated SchemaType. For example, we've defined a property title which will be cast to the String SchemaType and property date which will be cast to a Date SchemaType.

Notice above that if a property only requires a type, it can be specified using a shorthand notation (contrast the title property above with the date property).

Keys may also be assigned to nested objects containing further key/type definitions like the meta property above. 
This will happen whenever a key's value is a POJO that lacks a bona-fide type property. 
In these cases, only the leaves in a tree are given actual paths in the schema (like meta.votes and meta.favs above), and the branches do not have actual paths.
A side-effect of this is that meta above cannot have its own validation. If validation is needed up the tree. A path needs to be created up the tree 
- see the Subdocuments section for more information on how to do this. Also read the Mixed subsection of the SchemaTypes guide for some gotchas.


## Allowed SchemaTypes are:
* [String](/classes/stringtype)
* [Number](/classes/numbertype)
* [Boolean](/classes/booleantype)
* [Date](/classes/datetype)
* [Object](/classes/objecttype)
* [Array](/classes/arraytype)
* Mixed


Schemas not only define the structure of your document and casting of properties,
they also define document instance methods, static Model methods, 
compound indexes, and document lifecycle hooks.


## Creating a model
To use our schema definition, we need to convert our blogSchema into a Model we can work with. 
To do so, we pass it into ottoman.model(modelName, schema):

```javascript
const Blog = model('Blog', blogSchema);
// ready to go!
```

## Indexes

You can specify numerous indexes on a model.  There are multiple different kinds of indexes, each with it's own benefits and restrictions.

To specify indexes on a [Schema](/guides/schema), use the index key on the schema:
```javascript
import {Schema} from 'ottoman';

const schema = new Schema({
  email: 'string',
  name: {
    first: 'string',
    last: 'string',
    full: 'string'
  }
});

schema.index.findByEmail = {
  by: 'email',
  type: 'refdoc'
};

schema.index.findByFirstName = {
  by: 'name.first',
  type: 'view'
};

schema.index.findByLastName = {
  by: 'name.last',
        type: 'n1ql'
};
```

In order for indexes to be created on the server, you must call the `ensureIndexes` method. 
This method will internally generate a list of indexes which will be used and the most optimal 
configuration for them and build any which are missing on the server. 
This must be called after all models are defined, and it is a good idea to only call this when needed rather than any time your server is started.

```javascript
import express from 'express';
import { ensureIndexes } from 'ottoman';
import { UserRoutes } from './users/users.controller';
const app = express();

app.use('/users', UserRoutes);

ensureIndexes()
  .then(() => {
    console.log('All the indexes were registered');
    app.listen(5000);
  })
```

### Index Types

Below are some quick notes on the types of indexes available, and their pros and cons.  For a more in-depth discussion, consider
reading [Couchbasics: How Functional and Performance Needs Determine Data Access in Couchbase](https://blog.couchbase.com/determine-data-access-in-couchbase/)

#### `refdoc`
These indexes are the most performant, but the least flexible.  They allow only a single document to occupy any particular value and do direct key-value lookups using a referential document to identify a matching document in Couchbase.

In short, if you need to look up a document by a single value of a single attribute quickly (e.g. key lookups), this is the way to go.  But you cannot combine multiple refdoc indexes to speed up finding
something like "all customers with first name 'John' last name 'Smith'".

#### `view`
These indexes are the default and use map-reduce views.  This type of index is always available once `ensureIndexes` is called and will work with any Couchbase Server version.

Because views use map-reduce, certain types of queries can be faster as the query can be parallelized over all nodes in the cluster, with each node
returning only partial results.  One of the cons of views is that they are eventually consistent by default, and incur a performance
penalty if you want consistency in the result.

#### `n1ql`
These indexes utilize the new SQL-like query language available in Couchbase Server 4.0.0.  These indexes are more performant than views in many cases and are significantly more flexible, allowing even un-indexed searches.

N1QL indexes in Ottoman use [Couchbase GSIs](http://developer.couchbase.com/documentation/server/current/indexes/gsi-for-n1ql.html).  If you need flexibility of query and
speed, this is the way to go.

## Instance methods
Instances of Models are documents. Documents have many of their own built-in instance methods. 
We may also define our own custom document instance methods.

```javascript
import {getModel} from 'ottoman';
// define a schema
const animalSchema = new Schema({ name: String, type: String });

// assign a function to the "methods" object of our animalSchema
animalSchema.methods.findSimilarTypes = function() {
return getModel('Animal').find({ type: this.type });
};
```

Now all of our animal instances have a findSimilarTypes method available to them.

```javascript
const Animal = model('Animal', animalSchema);
const dog = new Animal({ type: 'dog' });

const dogs = await dog.findSimilarTypes();
console.log(dogs); // woof
```

* Overwriting a default ottoman document method may lead to unpredictable results.
* The example above uses the Schema.methods object directly to save an instance method. You can also use the Schema.method() helper as described here.
* Do not declare methods using ES6 arrow functions (=>). Arrow functions explicitly prevent binding this, so your method will not have access to the document and the above examples will not work.

## Statics

You can also add static functions to your model. There are two equivalent ways to add a static:

Add a function property to schema.statics
Call the Schema#static() function

```javascript
// Assign a function to the "statics" object of our animalSchema
animalSchema.statics.findByName = function(name) {
  return this.find({ name: name });
};

const Animal = model('Animal', animalSchema);
let animals = await Animal.findByName('fido');
```

Do **not** declare statics using ES6 arrow functions (=>). Arrow functions explicitly prevent binding this,
so the above examples will not work because of the value of this.

## Hooks

Hooks are functions which are passed control during execution of asynchronous functions. 
Hooks is specified on the schema level and is useful for writing plugins.

### The available hooks are:

- `validate`
- `save`
- `update`
- `remove`

### Register hooks with `pre` function

Pre functions are executed one after another, for each hooks register.

```javascript
import {Schema} from 'ottoman';

const schema = new Schema(...);
schema.pre('save', function(document) {
  // do stuff
});
```

You can use a function that returns a promise. In particular, you can use async/await.
```javascript
schema.pre('save', function() {
  return doStuff().
    then(() => doMoreStuff());
});

// Or, in Node.js >= 7.6.0:
schema.pre('save', async function() {
  await doStuff();
  await doMoreStuff();
});
```

### Hooks Use Cases

Middleware are useful for atomizing model logic. Here are some other ideas:

- complex validation
- removing dependent documents (removing a user removes all his blogposts)
- asynchronous defaults
- asynchronous tasks that a certain action triggers

Errors in Pre Hooks

If any pre hook errors out, ottoman will not execute subsequent hooks or the hooked function.

```javascript
schema.pre('save', function() {
  // You can also return a promise that rejects
  return new Promise((resolve, reject) => {
    reject(new Error('something went wrong'));
  });
});

schema.pre('save', function() {
  // You can also throw a synchronous error
  throw new Error('something went wrong');
});

schema.pre('save', async function() {
  await Promise.resolve();
  // You can also throw an error in an `async` function
  throw new Error('something went wrong');
});

// later...

// Changes will not be persisted to Couchbase Server because a pre hook errored out
try {
  await myDoc.save();
} catch (err) {
  console.log(err.message); // something went wrong
}
```

### Post Hooks

`post` middleware are executed after the hooked method and all of its pre hooks have completed.

```javascript
schema.post('validate', function(doc) {
  console.log('%s has been validated (but not saved yet)', doc.id);
});
schema.post('save', function(doc) {
  console.log('%s has been saved', doc.id);
});
schema.post('remove', function(doc) {
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

The `save()` function triggers `validate()` hooks, because ottoman has a built-in `pre('save')` hook that calls `validate()`.
This means that all `pre('validate')` and `post('validate')` hooks get called before any `pre('save')` hooks.
The `update()` function have the same behavior.

```javascript
schema.pre('validate', function() {
  console.log('this gets printed first');
});
schema.post('validate', function() {
  console.log('this gets printed second');
});
schema.pre('save', function() {
  console.log('this gets printed third');
});
schema.post('save', function() {
  console.log('this gets printed fourth');
});
```

## Plugins

Schemas are pluggable, that is, they allow for applying pre-packaged capabilities to extend their functionality. This is a very powerful feature.

### Plugin Example

Plugins are a tool for reusing logic in multiple schemas.
Suppose you have several models in your database and want to add a loadedAt property to each one.
Just create a plugin once and apply it to each Schema using the `plugin` function:

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
// Pre save hooks will be execute and it will print the document just before save it to Couchbase server.
await user.save();
```

### Global Plugins
Want to register a plugin for all schemas? The ottoman `registerGlobalPlugin` function registers a plugin for every schema. For example:

```javascript
import {registerGlobalPlugin} from 'ottoman';

registerGlobalPlugin(pluginLog);

const UserSchema = new Schema({
  isActive: Boolean,
  name: String
});

const UserModel = model('User', UserSchema);

const user = new UserModel(...);
// Pre save hooks will be execute and it will print the document just before save it to Couchbase server.
await user.save();
```

## Next Up

Nice, now we'll can see how [Models](/guides/model) works.