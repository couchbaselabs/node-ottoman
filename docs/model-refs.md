## Model References

In addition to supporting groups of properties, models also support referencing whole other documents.  Through these references we are able to store related by not neccessarily dependant data.

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

Through these references, 