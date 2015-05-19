## Indices

You can specify numerous indices on a model.  There are multiple different kinds of indices, each with it's own benefits and restrictions.

To specify indices on a model:
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

### Index Types

#### `refdoc`
These indices are the most performant.  They allow only a single document to occupy any particular value and do direct key-value lookups using a referential document to identify a matching document in Couchbase.

#### `view`
These indices are the default and use map-reduce views.  This type of index is always available once `ensureIndices` is called and will work with any Couchbase Server version.

#### `n1ql`
These indices utilize the new SQL-like query language available in Couchbase Server 4.0.0.  These indices are more performant than views in many cases and are significantly more flexible, allowing even un-indexed searches.


## Queries

Queries allow you to perform searches between your models.  For instance allowing you to query all of the posts published by a particular user.

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