# Documents
Ottoman documents represent a one-to-one mapping to documents as stored in Couchbase Server. Each document is an instance of its Model.


## Documents vs Models

Document and [Model](/guides/model) are distinct classes in Ottoman. The Model class is a subclass of the Document class. 
When you use the Model constructor, you create a new document.

```javascript
const MyModel = ottoman.model('Test', new Schema({ name: String }));
const doc = new MyModel();

doc instanceof MyModel; // true
doc instanceof ottoman.Model; // true
doc instanceof ottoman.Document; // true
```

In Ottoman, a `document` generally means an instance of a model. You should not have to create an instance of the Document class without going through a model.

## Retrieving

When you load documents from Couchbase Server using model functions like findById(), you get a Ottoman `document` back.

```javascript
const doc = await MyModel.findOne();

doc instanceof MyModel; // true
doc instanceof ottoman.Model; // true
doc instanceof ottoman.Document; // true
```

## Updating

Ottoman documents track changes. You can modify a document using vanilla JavaScript assignments and Ottoman will convert it into Couchbase update operators.

```javascript
doc.name = 'foo';

// Ottoman sends an `update({ name: 'foo' }, doc.id)`
// to Couchbase Server.
await doc.save();
```

If the document with the corresponding id is not found, Ottoman will report a `DocumentNotFoundError`:

```javascript
const doc = await MyModel.findOne();

// Delete the document so Ottoman won't be able to save changes
await MyModel.removeById(doc._id);

doc.name = 'foo';
await doc.save(); // Throws DocumentNotFoundError
```

The `save()` function is generally the right way to update a document with Ottoman. With `save()`, you get full validation and middleware.

## Validating

Documents are casted and validated before they are saved. 
Ottoman first casts values to the specified type and then validates them. Internally, 
Ottoman calls the document's validate() method before saving.

```javascript
const schema = new Schema({ name: String, age: { type: Number, min: 0 } });
const Person = ottoman.model('Person', schema);

let p = new Person({ name: 'foo', age: 'bar' });
// Cast to Number failed for value "bar" at path "age"
await p.validate();

let p2 = new Person({ name: 'foo', age: -1 });
// Path `age` (-1) is less than minimum allowed value (0).
await p2.validate();
```

## Populate

Population is the process of automatically replacing the specified paths in the document with document(s) from other collection(s).
We may populate a single document, multiple documents, a plain object, multiple plain objects, or all objects returned from a query.
Let's look at some examples.


```javascript
import {Schema, model} from 'ottoman';

const personSchema = new Schema({
  name: String,
  age: Number,
  stories: [{ type: String, ref: 'Story' }]
});

const storySchema = new Schema({
  author: { type: String, ref: 'Person' },
  title: String,
  fans: [{ type: String, ref: 'Person' }]
});

const Story = model('Story', storySchema);
const Person = model('Person', personSchema);
```

So far we've created two Models. Our Person model has its stories field set to an array of ids.
The ref option is what tells Ottoman which model to use during population, in our case the Story model.
All ids we store here must be document ids from the Story model.

### Saving refs

Saving refs to other documents works the same way you normally save properties, just assign the `id` value:

```javascript
const author = new Person({
  name: 'Ian Fleming',
  age: 50
});

await author.save();
const story1 = new Story({
  title: 'Casino Royale',
  author: author.id    // assign the id from the person
});

await story1.save()
```

### Using Population

So far we haven't done anything much different. We've merely created a Person and a Story.
Now let's take a look at populating our story's author:

```javascript
// Populate using document
const story = await Story.findById('storyId')
await story._populate('author');
console.log('The author is %s', story.author.name);
// prints "The author is Ian Fleming"


// Populate using Model
const stories = await Story.find({ title: 'Casino Royale' }, {populate: 'author'})
const story = stories[0];
console.log('The author is %s', story.author.name);
    // prints "The author is Ian Fleming"
```

Populated paths are no longer set to their original id, their value is replaced with the Ottoman document returned from the database by performing a separate query before returning the results.

Arrays of refs work the same way. Just call the populate method on the query and an array of documents will be returned in place of the original ids.

### Checking Whether a Field is Populated

You can call the `_populated()` function to check whether a field is populated. If `_populated()` returns a truthy value, you can assume the field is populated.

```javascript
story._populated('author'); // truthy

story._depopulate('author'); // Make `author` not populated anymore
story._populated('author'); // undefined
```

A common reason for checking whether a path is populated is getting the author id.

```javascript
story.populated('author'); // truthy
story.author.id; 

story.depopulate('author'); // Make `author` not populated anymore
story.populated('author'); // false
```

### Advanced Population

You can use the `*` symbol as a wildcard to populate all references in the current model, in this example all properties types references will be populated:

```javascript
await story._populate('*');
```

Also, you can setup to automatically populate child document references, by passing a second integer value to `_populate` function,
this value will tell to Ottoman how deep you want to populate.

```javascript
// Using on a document
await story._populate('*', 2);

// Using on a Model
const stories = await Story.find({ title: 'Casino Royale' }, {populate: 'author', populateMaxDeep: 2})
```

In the above example Ottoman will populate all references on story and story children. 
It doesn't matter if they are single or array references.

::: warning
Beware from setting a large integer value on populate `deep` argument, it could affect the query performance.
:::


## Next Up
Now that we've covered Documents, let's take a look at [Query Builder](/guides/query-builder).
