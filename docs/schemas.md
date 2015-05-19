## Schemas

Schema's define the layout of our stored data objects.  They contain a list of properties for the document, this can be any JSON representable data.

You can store simple types:
```javascript
ottoman.model('User', {
  who: 'string',
  howmany: 'number',
  when: 'Date'
});
```

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

and arrays of groups:
```javascript
ottoman.model('User', {
  name: 'string',
  roles: [{
    type: 'string',
    permissions: ['string']
  }]
});
```