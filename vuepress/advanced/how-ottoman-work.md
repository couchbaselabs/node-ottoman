This section is for those who want to understand how Ottoman works in depth.

## Key Generation Layer

Ottoman provides an abstraction layer to handle the `keys` that will be used to store/access the documents on the Database Server.

Developers will only have to work with the `document` ids while ottoman handles the keys automatically for them.

## keyGenerator function

The default `keyGenerator` function is used to generate all keys by Ottoman in your Couchbase datastore.

```javascript
const keyGenerator =
    ({metadata}) => `${metadata.modelName}`
```

Using the default `keyGenerator` function that `Ottoman` provides and assuming your `modelName` is 'User', the key for your document would look like:

- `User::0477024c`

::: Note
This resulted key is a combination of the prefix as provided by the default  `keyGenerator` function (`${metadata.modelName}`) appended with an ID.
:::

### Override keyGenerator function

The `keyGenerator` function allows you to only override the prefix for a key, or completely remove the prefix such that the key always matches the ID of the document generated.

```javascript
const keyGenerator = ({metadata}) => `${metadata.scopeName}`
const User = model('User', schema, { keyGenerator, scopeName: 'myScope' })
```

In this example we are overiding the `keyGenerator` function and replacing the `${metadata.modelName}` with `${metadata.scopeName}`. Using this override, the key for your document would look like:

- `myScope::0477024c`

### Defining a `Model`
```typescript
...
const userSchema = new Schema({ name: string });
const User = model('User', userSchema);
```

1. Set your rules in the `Schema`.
2. Now you can create your `Model` with the `Schema` defined.

### Creating a document

Let see how Ottoman handles a new document creation.

![How to Use](./create.jpg)

::: tip Notice
Using `Ottoman` you only need to think about `id` in order to execute CRUD Operation over documents.
All the `key` management will be automated by `Ottoman`.
:::

### Retrieving a document

Ottoman provides a `findById` method at the `Model` level to retrieve a document by `id`.
See the picture below to understand how it works.

![How to Use](./findById.jpg)


### Caution: While Overwrite keyGenerator

::: danger Danger
There is a real danger when overwriting the `keyGenerator` function. Don't do this if you're not sure what are you doing.

You must ensure 2 things:
1. The result will be always the same for the same inputs.
2. The result will be always distinct for different inputs.

The following cases are bad implementations of `keyGenerator` and Ottoman will don't work as expected.

Case 1: keyGenerator returning always the same value with different inputs.
```typescript
// Assume that the `random` function returns a random integer, for this example, the first execution returns 1234.
const myId = random(); 

const keyGenerator = 
    ({metadata, id}) => `${metadata.collectionName}::${myId}`
// Notice: `myId` is already created then it will have the same value for every execution of `keyGenerator`
// for collectionName `User` it will always return User::1234
```

Case 2: keyGenerator never returns the same value for the same inputs.
```typescript

const keyGenerator =
        ({metadata, id}) => `${metadata.collectionName}::${random()}`
// Now we are using `random()` inside the keyGenerator function, therefore every single execution will return a different value,
// Ottoman will be unable to retrieve documents because the stored document key was `User::1234`,
// but keyGenerator will not return this key anymore.
```
:::