# Ottoman V1 to Ottoman V2

Ottoman, for Couchbase, is an object document mapper (ODM) that allows you build what your object model would look like,
then auto-generate all the boilerplate logic that goes with it.

Ottoman us to easily access CRUD commands for Couchbase Server using Node.js. To use Ottoman, make sure you add it to
your Node.js project by using the following command:

```sh
npm install ottoman
```

Or using yarn:

```sh
yarn add ottoman
```

## Import Ottoman Module

Now that the libraries have been downloaded to our project, we need to include it in our source code. This can be done
by adding the following code:

***V1***

```js
const ottoman = require('ottoman');
```

***Current Version***

Current version entirely have support for typescript and you can also do:

```ts
import {getDefaultInstance, Ottoman} from 'ottoman';
```

## Couchbase Bucket Connection

***V1***

```js
ottoman.bucket = (new couchbase.Cluster('http://127.0.0.1:8091')).openBucket('bucket-name-here');
```

***Current Version***

```ts
// get the default Ottoman instance
let ottoman = getDefaultInstance();

if (!ottoman) {
  // if not exist default one, then create
  ottoman = new Ottoman({collectionName: '_default'});
}

ottoman.connect({
  connectionString: 'couchbase://127.0.0.1', // with default port 8091
  bucketName: 'bucket-name-here',
  username: 'Administrator',
  password: 'password'
});
```

## Sample Model Definition

Before we can start doing CRUD operations against Couchbase, we need to define our Ottoman model. These models represent
documents in our database.

The models we create with Ottoman can have properties and methods.

***V1***

```js
const UserModel = ottoman.model('User', {
  firstName: {type: 'string'},
  lastName: {type: 'string'},
  email: {type: 'string'}
});
```

***Current Version***

```ts
const UserModel = ottoman.model('User', {
  firstName: String,
  lastName: String,
  email: String
})
```

### Create New User Documents

```ts
const myUser = new UserModel({
  firstName: 'Perry',
  lastName: 'Mason',
  email: 'perry.mason@example.com',
});
```

## Persist Documents to Our Bucket

So far we have simply defined the model structure and created documents locally. Now we can persist the documents
calling Ottoman's `save()` method on each object:

***V1***

```js
myUser.save(function (error) {
  if (error) {
    console.log("An error happened:" + JSON.stringify(error));
    return;
  }
  console.log(`SUCCESS: user ${myUser.firstName} added!`);
});
```

***Current Version***

Using the async/await technique:

```ts
const runAsync = async () => {
  await myUser.save();
  console.log(`SUCCESS: user ${myUser.firstName} added!`);
}

ottoman.start()
  .then(runAsync)
  .catch((error) => console.log('An error happened: ' + JSON.stringify(error)))
  .finally(process.exit)
```

The output will be something like:

```sh
> SUCCESS: user Perry added!
```

## Retrieve Records From our Bucket

***V1***

```js
// Finding All Documents
UserModel.find({}, function (error, result) {
  // Do something with the resulting Ottoman models
});

// Finding a Specific Document
UserModel.find({lastName: 'Mason'}, function (error, result) {
  // Do something with the resulting Ottoman model
});

// Find a Document by ID
UserModel.getById('document-id-here', function (error, result) {
  // Do something with the resulting Ottoman model
});
```

***Current Version***

```ts
// Finding All Documents
await UserModel.find({}, {select: 'firstName,email', limit: 20});

// Finding a Specific Document
await UserModel.find({lastName: 'Mason'});

// Find a Document by ID
await UserModel.findById('document-id-here');
```

## Updating an Existing Document

***V1***

Updating documents in Version1 with Ottoman can be a little tricky because you must first have loaded the document
before trying to do a manipulation on it. What you could do is find the particular document by id, then perform the save
command like so:

```js
UserModel.getById('document-id-here', function (error, result) {
  if (error) {
    console.log('An error happened: ' + JSON.stringify(error));
  }
  result.firstname = 'Nicolas',
    result.save(function (error) {
      if (error) {
        console.log('An error happened: ' + JSON.stringify(error));
      }
    });
});
```

***Current version***


Is more simple do that with current version:

```ts
await UserModel.updateById('document-id-here', {firstname: 'Nicolas'});
```