# Node.js ODM for Couchbase

Ottoman is a ODM built for Couchbase and Node.js.  It is designed to remove all
of the boilerplate neccessary to build Node.js apps with Couchbase.

[![Build Status](https://api.travis-ci.org/couchbaselabs/node-ottoman.png)](https://travis-ci.org/couchbaselabs/node-ottoman)


## Useful Links

Source - http://github.com/couchbaselabs/node-ottoman

Couchbase Node.js Community - http://couchbase.com/communities/nodejs


## Installing

Ottoman is not yet published to npm, to install the in development version
directly from GitHub, run:
```
npm install git+https://github.com/couchbaselabs/node-ottoman.git
```


## Introduction

Building and interacting with models using ottoman is very simple:

```javascript
var User = Ottoman.model('User', {
  'username': 'string',
  'name': 'string',
  'email': 'string'
}, {
  bucket: new couchbase.Connection({})
});

var test = new User();
test.username = 'brett19';
test.name = 'Brett Lawson';
test.email = 'brett19@gmail.com';

Ottoman.save(test, function(err) {
  if (err) throw err;

  MyModel.findById(test._id, function(err, obj) {
    if (err) throw err;

    console.log(obj.name);
    // Brett Lawson
  });
});

```

## Documentation

As ottoman is currently in rapid active development, documentation for it is
not yet available.  A good source of information in the interim should be the
test cases which are available in the /test/ directory.


## Source Control

The source code is available at
[https://github.com/couchbaselabs/node-ottoman](https://github.com/couchbaselabs/node-ottoman).
Once you have cloned the repository, you may contribute changes by submitting
a GitHub Pull Request.

To execute our test suite, run `npm test` from your checked out root directory.

## License

Copyright 2013 Couchbase Inc.

Licensed under the Apache License, Version 2.0.

See [the Apache 2.0 license](http://www.apache.org/licenses/LICENSE-2.0).
