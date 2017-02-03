# Ottoman.js (Node.js ODM for Couchbase)

Ottoman is a ODM built for Couchbase and Node.js.  It is designed to remove all
of the boilerplate necessary to build Node.js apps with Couchbase.

[![Build Status](https://api.travis-ci.org/couchbaselabs/node-ottoman.png)](https://travis-ci.org/couchbaselabs/node-ottoman)


## Useful Links

Source - [http://github.com/couchbaselabs/node-ottoman](http://github.com/couchbaselabs/node-ottoman)

Documentation - [http://ottomanjs.com/](http://ottomanjs.com/)

Build Your First Application - [/docs/first-app.md](https://github.com/couchbaselabs/node-ottoman/blob/master/docs/first-app.md)

Couchbase Node.js Community - [http://couchbase.com/communities/nodejs](http://couchbase.com/communities/nodejs)

## Why Use Ottoman

An ODM allows developers to:

 - Work natively with JavaScript Objects.
 - Rapidly prototype and define your data model together with their relationships.
 - Let someone else handle the heavy lifting and tedious tasks.
 - Support many different data-types, including several which come predefined with Ottoman in addition to support for custom data-types.
 - Define your validation logic with the models it applies to.
 - Model your data for embedding objects or references and keep those relationships crisp.
 - Provide support for generic finds.
 - Support for multiple indexing strategies natively and automatically.
 - Control and enforce your data model from within your application.
 - Programmatically define object methods that map to the data model.


## Getting Started

### Installing

Ottoman is not yet published to npm, to install the development version
directly from GitHub, run:
```
npm install ottoman
```


### Introduction

Set up your Ottoman instance with a connection to Couchbase.
```javascript
var ottoman = require('ottoman');
var couchbase = require('couchbase');
var cluster = new couchbase.Cluster('couchbase://127.0.0.1');
ottoman.bucket = cluster.openBucket('default');
```

Let's say we want to track all of the furniture in our store.  Let's create a model to represent this furniture.
```javascript
var Furniture = ottoman.model('Furniture', {
  name: 'string'
});
```

How about we create our first furniture item.
```javascript
var couch = new Furniture({name:'Couch'});
console.log(couch.name); // 'Couch'
```

We can also add methods directly to our models.
```javascript
Furniture.prototype.dance = function() {
  console.log('I am furniture, I do not dance.');
};
```

Our furniture now can take an action!
```javascript
var table = new Furniture({name:'Table'});
table.dance();
```

But we haven't actually saved anything to Couchbase yet.  Let's do that:
```javascript
table.save(function(err) {
  if (err) return console.error(err);
  table.dance();
});
```

Now that we've saved our table to the database, we need to be able to retrieve it.  Let's revise our model to add an index on the name!
```javascript
var Furniture = ottoman.model('Furniture', {
  name: 'string'
}, {
  index: {
    findByName: {
      by: 'name'
    }
  }
});
```

Now we need to ensure that this index is available on the server for searching:
```javascript
ottoman.ensureIndices(function(err) {
  if (err) return console.error(err);
});
```

And finally we can search for our furniture by name:
```javascript
Furniture.findByName('table', function(err, tables) {
  if (err) return console.error(err);
  console.log(tables);
})
```

#### Nice Job!
We've now created our first model, gave it some methods, saved it to Couchbase and then retrieved it.

#### What Next?

Now that you've successfully built your first models, why not give our
full application tutorial a try?

[Build Your First Application](https://github.com/couchbaselabs/node-ottoman/blob/master/docs/first-app.md)

### Schemas

Schemas define the layout of our stored data objects.  They contain a list of properties for the document. This can be any JSON representable data.

You can store simple types:
```javascript
ottoman.model('User', {
    who: 'string',
    howmany: 'number',
    when: 'Date'
});
```

Ottoman supports a number of standard types:

- `string` - A string value.
- `number` - A floating point value.
- `integer` - An integer number.
- `boolean` - A boolean value.
- `Date` - A date value.
- `Mixed` - Any valid Ottoman type, both models and built-in types.

These simple types can have default values specified or default value generators:
```javascript
ottoman.model('User', {
  title: {type: 'string', default: 'No Title'},
  when: {type: 'Date', default: Date.now},
  rander: {type: 'number', default: function(){ return Math.random(); }}
});
```

We can also have arrays:
```javascript
ottoman.model('User', {
  name: 'string',
  roles: ['string']
});
```

And groups:
```javascript
ottoman.model('User', {
  name: {
    first: 'string',
    last: 'string',
    full: 'string'
  }
});
```

And arrays of groups:
```javascript
ottoman.model('User', {
  name: 'string',
  roles: [{
    type: 'string',
    permissions: ['string']
  }]
});
```

You can also define validator functions for model fields:
```javascript
function PhoneValidator(val) {
  var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  if (val && !val.match(phoneno)) {
    throw new Error('Phone number is invalid.');
  }
}

ottoman.model('User', {
  name: 'string',
  phone: { type:'string', validator:PhoneValidator },
});
```

### Model References

In addition to supporting groups of properties, models also support referencing whole other documents.  Through these references we are able to store related but not necessarily dependent data.

Example reference relationship:
```javascript
var Account = ottoman.model('Account', {
  email: 'string',
  name: 'string'
});
ottoman.model('User', {
  username: 'string',
  account: Account
});
```

Accessing the data of a referenced document is as simple as requesting the parent document; referenced documents will be loaded by default.

Example of creating a referenced document:
```javascript
var myAccount = new Account({
  email: 'burtteh@fakemail.com',
  name: 'Brett Lawson'
});
var myUser = new User({
  username: 'brett19',
  account: myAccount;
});
myUser.save(function(err) {
  if (err) throw err;

  console.log('Documents Saved!');
});
```

Example of accessing the referenced document:
```javascript
User.find({username: 'brett19'}, function(err, myUser) {
  if (err) throw err;

  console.log('My Email:', myUser.account.email);
  // My Email: burtteh@fakemail.com
});
```


### Indices

You can specify numerous indices on a model.  There are multiple different kinds of indices, each with it's own benefits and restrictions.

To specify indices on a model, pass a second "options" object to the model function, with an index key:
```javascript
ottoman.model('User', {
  email: 'string',
  name: {
    first: 'string',
    last: 'string',
    full: 'string'
  }
}, {
  index: {
    findByEmail: {
      by: 'email',
      type: 'refdoc'
    },
    findByFirstName: {
      by: 'name.first',
      type: 'view'
    },
    findByLastName: {
      by: 'name.last',
      type: 'n1ql'
    }
  }
});
```

In order for indices to be created on the server, you must call the `ensureIndices` method.  This method will internally generate a list of indexes which will be used and the most optimal configuration for them and build any which are missing on the server.  This must be called after all models are defined, and it is a good idea to only call this when needed rather than any time your server is started.

```javascript
var ottoman = require('ottoman');
var models = require('./all_my_models');
ottoman.ensureIndices(function(err) {
  if (err) {
    console.log('failed to created necessary indices', err);
    return;
  }

  console.log('ottoman indices are ready for use!');
});
```

#### Index Types

Below are some quick notes on the types of indices available, and their pros and cons.  For a more in-depth discussion, consider
reading [Couchbasics: How Functional and Performance Needs Determine Data Access in Couchbase](http://blog.couchbase.com/2015/october/determine-data-access-in-couchbase)

##### `refdoc`
These indices are the most performant, but the least flexible.  They allow only a single document to occupy any particular value and do direct key-value lookups using a referential document to identify a matching document in Couchbase.

In short, if you need to look up a document by a single value of a single attribute quickly (e.g. key lookups), this is the way to go.  But you cannot combine multiple refdoc indexes to speed up finding
something like "all customers with first name 'John' last name 'Smith'".

##### `view`
These indices are the default and use map-reduce views.  This type of index is always available once `ensureIndices` is called and will work with any Couchbase Server version.

Because views use map-reduce, certain types of queries can be faster as the query can be parallelized over all nodes in the cluster, with each node
returning only partial results.  One of the cons of views is that they are eventually consistent by default, and incur a performance
penalty if you want consistency in the result.

##### `n1ql`
These indices utilize the new SQL-like query language available in Couchbase Server 4.0.0.  These indices are more performant than views in many cases and are significantly more flexible, allowing even un-indexed searches.

N1QL indexes in Ottoman use [Couchbase GSIs](http://developer.couchbase.com/documentation/server/current/indexes/gsi-for-n1ql.html).  If you need flexibility of query and
speed, this is the way to go.

### Queries

Queries allow you to perform searches among your models.  For instance allowing you to query all of the posts published by a particular user.

User/Post example:
```javascript
ottoman.model('Post', {
  user: {ref:'User'},
  title: 'string',
  body: 'string'
});

ottoman.model('User', {
  name: 'string'
}, {
  queries: {
    myPosts: {
      of: 'Post',
      by: 'user'
    }
  }
});
```

### Finding models via N1QL Queries

All models also expose a `find` method that can locate model instances by any number of criteria, and that also support pagination.

This method is very useful for finding model instances under any arbitrary criteria; however keep in mind that you may wish to put
N1QL indexes on fields that would be very often a part of these queries, to improve lookup performance, and prevent Couchbase
from having to scan most or all documents in the bucket in order to find the results.

As you can see in the example below, you can even optionally specify pagination (limit/skip) and adjust the consistency of the query executed on Couchbase.

```javascript
var filters = { 
  lastName: 'Smith',
  state: 'VA'
};

var options = {
  limit: 10,
  skip: 10,
  consistency: ottoman.Consistency.LOCAL
};

Customer.find(filters, options,  
  function(err, items) {
    if (err) throw err;

    console.log('Page 2 of Smiths of Virginia: ', JSON.stringify(items));
  });
```


## License

Copyright 2013 Couchbase Inc.

Licensed under the Apache License, Version 2.0.

See [the Apache 2.0 license](http://www.apache.org/licenses/LICENSE-2.0).
