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

## Step 1: Create The Ottoman Node JS Project

In this exercise, we will be working with the [Ottoman v2 ODM (Object Document Mapper)](https://github.com/couchbaselabs/node-ottoman)
in conjunction with the [NodeJS SDK v3](https://docs.couchbase.com/nodejs-sdk/3.0/hello-world/start-using-sdk.html) or any minor version that is higher will do.
I’m using Node JS version 12.14 and NPM version 6.13, you can find these version numbers for Node and NPM by running the following command:


```bash
node --version
npm --version
```

::: tip Note
You can get to the Couchbase Server Web UI at any time by visiting [localhost:8091](http://localhost:8091/).
:::

Let’s first create a project directory named `first-query-ottoman`, change directories into that directory and initialize NPM:

```bash
mkdir first-query-ottoman && cd $_ && npm init
```

::: tip Note
The double ampersands (`&&`) are just a way of chaining multiple shell commands. 
The `$_` command simply captures our last used argument which in our case was the directory that we created.
:::

Now with a node package manager and manifest (`package.json`) in place, let’s add Ottoman to our dependencies for the project:

```bash
npm install ottoman@alpha
```

Now we will create a file named `server.js` and launch Visual Studio Code:

```bash
touch server.js && code .
```

This command has set up a project directory and enabled npm, installed `ottoman` as well as created a `server.js` file and
finally opened up our VS Code editor to the project root.

Open `server.js` file, this is where we’ll add our code.

Taking each code sample below, we will add each new block of code done after one another.


## Connecting to a Couchbase Bucket

Create a connection to our Couchbase Server running in Docker. Your password may be different, just swap out yours if it is different.

```javascript
const ottoman = require('ottoman');

const connection = ottoman.connect({
    connectionString: 'couchbase://localhost',
    bucketName: 'default',
    username: 'admin',
    password: 'password'
});
```

## Creating an Ottoman Model

Create a model for our `User` document. It will get auto-created and stored in our already created `default` bucket in Couchbase.
Once our model is set up, we can add a few initial documents to populate our bucket.

```javascript
const User = ottoman.model('User', {
  firstName: String,
  lastName: String,
  email: String,
  tagline: String
})
```

Ottoman does support other data types like `boolean`, `number`, and `Date`.
A model can also define indexes similar to the ones we set up manually. 
For now, we are going to skip letting Ottoman set up our indexes as we already have them in place.

## Create New User Documents

Here we are defining a few documents that we want to persist to our bucket,
notice we are using the same document that we defined in our model.

```javascript
const perry = new User({
  firstName: 'Perry',
  lastName: 'Mason',
  email: 'perry.mason@acme.com',
  tagLine : 'Who can we get on the case?'
})

const tom = new User({
  firstName: 'Major',
  lastName: 'Tom',
  email: 'major.tom@acme.com',
  tagLine : 'Send me up a drink'
})
```

## Persist Documents to Our Bucket

Let's create an `async` function called `runAsync` to handle our code with the `async/await` technique. 
In the function body block just call Ottoman’s `save()` method on each of these objects which will add them to our database so long as no errors occur.


```javascript
const runAsync = async () => {
    try {
        await perry.save();
        console.log(`success: user ${perry.firstName} added!`)
    } catch (err) {
        throw err;
    }

    try {
        await tom.save();
        console.log(`success: user ${tom.firstName} added!`)
    } catch (err) {
        throw err;
    }
}

runAsync();
```

Now that we have added the code to save (persist) each record to the database, let’s run our app for the first time with Node:

```bash
node server.js
```

You should get two success messages in the console.

```bash
success: user Perry added!
success: user Major added!
```

If we open our Web UI at [localhost:8091](http://localhost:8091/) and navigate to the "Buckets" tab,
we can see that two records were added to the `default` bucket.

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
 
  try {
    const result = await User.find({ lastName: 'Tom' }, { consistency: ottoman.SearchConsistency.LOCAL })
    console.log('Query Result: ', result.rows)
  } catch (err) {
    throw err;
  }
}
```

The first two arguments to the `find()` method are `filter` and `options`.

Instead of passing objects along as parameters, 
let’s write our code to define the filter and options as objects first and then pass them into the function as arguments.


```javascript
runAsync = async () => {
  //...saving users
 
  try {
    const filter = { lastName: 'Tom' };
    const options = { consistency: ottoman.SearchConsistency.LOCAL };
    const result = await User.find(filter, options)
    console.log('Query Result: ', result.rows)
  } catch (err) {
    throw err;
  }
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

const connection = ottoman.connect({
    connectionString: 'couchbase://localhost',
    bucketName: 'default',
    username: 'admin',
    password: 'password'
});

const User = connection.model('User', {
    firstName: String,
    lastName: String,
    email: String,
    tagline: String
});

const perry = new User({
    firstName: 'Perry',
    lastName: 'Mason',
    email: 'perry.mason@acme.com',
    tagLine : 'Who can we get on the case?'
})

const tom = new User({
    firstName: 'Major',
    lastName: 'Tom',
    email: 'major.tom@acme.com',
    tagLine : 'Send me up a drink'
})

const runAsync = async () => {
    try {
        await perry.save();
        console.log(`success: user ${perry.firstName} added!`)
    } catch (err) {
        throw err;
    }

    try {
        await tom.save();
        console.log(`success: user ${tom.firstName} added!`)
    } catch (err) {
        throw err;
    }

    try {
        const filter = { lastName: 'Tom' };
        const options = { consistency: ottoman.SearchConsistency.LOCAL };
        const result = await User.find(filter, options)
        console.log('Query Result: ', result.rows)
    } catch (err) {
        throw err;
    }
}

runAsync();
```
:::

## Summary
We have created models in Ottoman, defined some documents, and persisted them to the database. 
We then subsequently looked them up using the built-in `find()` method which used the Ottoman Query API for Couchbase. 
We have not yet touched on indexes other than the fact that we created two of them during the docker and indexes section of the quickstart.

If you would like to continue learning about Ottoman, I suggest checking out the [Ottoman Documentation](http://ottomanjs.com/).


## Exercise Complete

Congratulations! You have engaged with the world’s most powerful JSON document database by using Ottoman. 
Know that our query language N1QL was run under the hood too but we did not have to write any N1QL, 
you can learn more about it with our [N1QL Tutorial](https://query-tutorial.couchbase.com/tutorial) 
if you are interested in exploring our query language for Couchbase.