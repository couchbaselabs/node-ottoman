# Quick Start with Ottoman v2

>Before we get started with Ottoman and Node JS, we need to ensure you have Couchbase up and running.
>We will create a data bucket and two indexes for basic queries. Using Couchbase’s N1QL query syntax,
>we will create two indexes, a primary and adaptive index.
>After we upsert our records, these indexes will allow us to look up our documents with the Query API in Ottoman

## Prerequisites: Three Steps required to Query our Bucket

1. Setup Couchbase Server 6.5 and ensure it is running.
2. Create an empty bucket named "default".
3. Add a primary and adaptive index for our default bucket.

If you still need to perform these tasks please use one of the following:

- [5-minute Couchbase Docker Container Configuration](https://docs.couchbase.com/tutorials/quick-start/quickstart-docker-image-manual-cb65.html)

## Create the Ottoman NodeJS Project

In this exercise, we will be working with the [Ottoman v2 ODM (Object Document Mapper)](https://github.com/couchbaselabs/node-ottoman)
in conjunction with the [NodeJS SDK v3](https://docs.couchbase.com/nodejs-sdk/current/hello-world/start-using-sdk.html)

This tutorial was written using Node JS version 12.14, NPM version 6.13, and the Couchbase SDK 3.0, but higher version numbers should do.

You can check your version numbers by running the following commands:

```bash
node --version
npm --version
```

::: tip Note
You can get to the Couchbase Server Web UI at any time by visiting [localhost:8091](http://localhost:8091/).
:::

Let’s first create a project directory named `first-query-ottoman`, change directories into that directory and initialize NPM:

```bash
mkdir first-query-ottoman
cd first-query-ottoman
npm init
```

Now with a node package manager and manifest (`package.json`) in place, let’s add Ottoman to our dependencies for the project:

```bash
npm install ottoman@alpha
```

Now we will create a file named `server.js` and launch Visual Studio Code:

```bash
touch server.js
code .
```

We have now set up a project directory and enabled npm, installed `ottoman`,
created a `server.js` file, and finally opened up our VS Code editor to the project root.

Open `server.js` file, this is where we’ll add our code.

Taking each code sample below, we will add each new block of code done after one another.

## Connecting to a Couchbase Bucket

Create a connection to our Couchbase Server running in Docker. Your password may be different, just swap out yours if it is different.

```javascript
const ottoman = require('ottoman');

connect({
  connectionString: 'couchbase://localhost',
  bucketName: 'default',
  username: 'Administrator',
  password: 'password'
});
```

## Creating an Ottoman Model

Create a model for our `User` document.
This defines the expected structure of each document, and also which "Collection" Couchbase will store the documents in.

```javascript
const User = ottoman.model('User', {
  firstName: String,
  lastName: String,
  email: String,
  tagline: String
})
```

Ottoman does support other data types like `boolean`, `number`, and `Date`.
A model can also define indexes, but for now, we will skip this,
as we already set up indexes manually in the prerequisites.

## Create New User Documents

Now we will define a few documents that we want to persist to our bucket.
We are using the document structure that we defined in our model.

```javascript
const perry = new User({
  firstName: 'Perry',
  lastName: 'Mason',
  email: 'perry.mason@example.com',
  tagLine : 'Who can we get on the case?'
})

const tom = new User({
  firstName: 'Major',
  lastName: 'Tom',
  email: 'major.tom@example.com',
  tagLine : 'Send me up a drink'
})
```

## Persist Documents to Our Bucket

So far we have simply defined the model structure and created documents locally.

Now that we want to persist the documents, all our interaction with the Couchbase server
will be done asynchronously, so we will call Ottomonan's `save()` method on each
object using the `async`/`await` technique.


```javascript
const runAsync = async () => {
  await perry.save();
  console.log(`success: user ${perry.firstName} added!`)

  await tom.save();
  console.log(`success: user ${tom.firstName} added!`)
}

ottoman.start()
  .then(runAsync)
  .catch((error) => console.log(error))
  .finally(process.exit)
```

Now that we have added the code to save (persist) each record to the database, let’s run our app for the first time with Node:

```bash
node server.js
```

You should get success messages in the console.
(Note that the collection creation will happen only the first time you run the code.)

```bash
collection created: _default/User
success: user Perry added!
success: user Major added!
```

If we open our Web UI at [localhost:8091](http://localhost:8091/) and navigate to the "Buckets" tab,
we can see that the `User` collection, and two records have been added to the `default` bucket.

::: tip Note
You can edit the document in place by clicking the pencil icon or remove them individually with the trash icon.
You can also edit the buckets and in the section "Advanced bucket settings" enable Flush. When flushed, all items in the bucket are removed.
This is a quick way to remove all documents.
:::

Let’s remove these two documents, write some more code that will add the documents, and then turn around and query them.

## Write a Query with Ottoman’s Query API

In Ottoman, we can retrieve records from our bucket using the adaptive index we have in place by calling the `find()` method.
Append the `find()` logic to our `runAsync` function.

```javascript
runAsync = async () => {
  //...saving users
  const result = await User.find(
    { lastName: 'Tom' },
    { consistency: ottoman.SearchConsistency.LOCAL })
  console.log('Query Result: ', result.rows)
}
```

The first two arguments to the `find()` method are `filter` and `options`.

Instead of passing objects along as parameters,
let’s write our code to define the filter and options as objects first and then pass them into the function as arguments.

```javascript
runAsync = async () => {
  //...saving users

  const filter = { lastName: 'Tom' };
  const options = { consistency: ottoman.SearchConsistency.LOCAL };
  const result = await User.find(filter, options)
}
```

::: tip Note
If we had a lot more data and we were expecting hundreds of records to be returned,
we could page the results with our options to get the second page (pagination), like this:
:::

```javascript
const options = {
  limit: 10,
  skip: 10,
  consistency: ottoman.SearchConsistency.LOCAL
}
```

Let’s run Node again and now we should get the same two success messages and an object returned to us that we queried for:

```bash
node server.js
```

You should see results similar to the following in your command line:

```bash
success: user Perry added!
success: user Major added!
Query results:  [
  {
    _scope: '_default',
    email: 'major.tom@acme.com',
    firstName: 'Major',
    id: '02374d71-6e4d-47f1-9cbe-54b487cec89b',
    lastName: 'Tom',
    tagLine: 'Send me up a drink',
    type: 'User'
  }
]
```

::: tip Note
In our case indexes were added manually, if not Ottoman would have given us this error message:
:::

```bash
"errors": [
  {
    "code": 4000,
    "msg": "No index available on keyspace default that matches your query.
     Use CREATE INDEX or CREATE PRIMARY INDEX to create an index,
     or check that your expected index is online."
  }
]
```

::: details Here you can see the complete content of the server.js file.
```javascript
const ottoman = require('ottoman');

ottoman.connect({
  connectionString: 'couchbase://localhost',
  bucketName: 'default',
  username: 'Administrator',
  password: 'password'
});

const User = ottoman.model('User', {
  firstName: String,
  lastName: String,
  email: String,
  tagline: String
})

const perry = new User({
  firstName: 'Perry',
  lastName: 'Mason',
  email: 'perry.mason@example.com',
  tagLine : 'Who can we get on the case?'
})

const tom = new User({
  firstName: 'Major',
  lastName: 'Tom',
  email: 'major.tom@example.com',
  tagLine : 'Send me up a drink'
})

const runAsync = async () => {
  await perry.save();
  console.log(`success: user ${perry.firstName} added!`)

  await tom.save();
  console.log(`success: user ${tom.firstName} added!`)

  const filter = { lastName: 'Tom' };
  const options = { consistency: ottoman.SearchConsistency.LOCAL };

  const result = await User.find(filter, options)
  console.log('Query Result: ', result.rows)
}

ottoman.start()
  .then(runAsync)
  .catch((error) => console.log(error))
  .finally(process.exit)
```
:::

## Summary

We have created models in Ottoman, defined some documents, and persisted them to the database.
We then subsequently looked them up using the built-in `find()` method which used the Ottoman Query API for Couchbase.
We have not yet touched on indexes other than the fact that we created two of them during the docker and indexes section of the quickstart.

If you would like to continue learning about Ottoman, we suggest checking out the [Ottoman Documentation](http://ottomanjs.com/).

## Exercise Complete

Congratulations! You have engaged with the world’s most powerful JSON document database by using Ottoman.

Note that our query language N1QL was run under the hood too but we did not have to write any directly.
You can learn more about it with our [N1QL Tutorial](https://query-tutorial.couchbase.com/tutorial)
if you are interested in exploring our query language for Couchbase.
