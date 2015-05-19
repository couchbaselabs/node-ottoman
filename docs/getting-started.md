## Getting Started

First step, install ottoman using `npm`:
```bash
$ npm install ottoman
```

Set up your ottoman instance with a connection to couchbase.
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

But we haven't actually saved anythign to Couchbase yet.  Let's do that:
```javascript
table.save(function(err) {
  if (err) return console.error(err);
  table.dance();
});
```

Now that we've saved our table to the database, we need to be able to retreive it.  Let's revise our model to add an index on the name!
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

### Nice Job!
We've now created our first model, gave it some methods, saved it to Couchbase and then retrieved it.