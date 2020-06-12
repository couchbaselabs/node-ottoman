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

When you load documents from Couchbase Server using model functions like getById(), you get a Ottoman `document` back.

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

// Ottoman sends an `update({ name: 'foo' }, doc._id)`
// to Couchbase Server.
await doc.save();
```

If the document with the corresponding _id is not found, Ottoman will report a `DocumentNotFoundError`:

```javascript
const doc = await MyModel.findOne();

// Delete the document so Ottoman won't be able to save changes
await MyModel.remove(doc._id);

doc.name = 'foo';
await doc.save(); // Throws DocumentNotFoundError
```

The save() function is generally the right way to update a document with Ottoman. With save(), you get full validation and middleware.

For cases when save() isn't flexible enough, Ottoman lets you create your own Couchbase Server updates with casting, hooks, and limited validation.

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


## Next Up
Now that we've covered Documents, let's take a look at [Subdocuments](/).
