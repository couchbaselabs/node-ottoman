# How Ottoman Works

This section is for those who want to understand how Ottoman works in depth.

## Key Generation Layer

Ottoman provides an abstraction layer to handle the `keys` that will be used to store/access the documents on the Database Server.

Developers will only have to work with the `document` ids while ottoman handles the keys automatically for them.

## keyGenerator function

The default `keyGenerator` function is used to generate all keys by Ottoman in your Couchbase datastore.

```javascript
const keyGenerator = ({metadata}) => `${metadata.modelName}`
```

Using the default `keyGenerator` function that `Ottoman` provides and assuming your `modelName` is 'User', the key for your document would look like:

- `User::0477024c`

::: tip Notice
This resulted key is a combination of the prefix as provided by the default  `keyGenerator` function (`${metadata.modelName}`) [appended with an ID](/guides/model.html#model-id) (`0477024c`).
:::

### Override keyGenerator function

The `keyGenerator` function allows you to only override the prefix for a key, or completely remove the prefix such that the key always matches the ID of the document generated.

```javascript
const keyGenerator = ({metadata}) => `${metadata.scopeName}`
const User = model('User', schema, { keyGenerator, scopeName: 'myScope' })
```

In this example we are overiding the `keyGenerator` function and replacing the `${metadata.modelName}` with `${metadata.scopeName}`. Using this override, the key for your document would look like:

- `myScope::0477024c`

To understand how ID differs from keys in Ottoman we need to explore creating a model, understand how Ottoman deals with IDs which affect your key and then how to retrieve your document by ID.

### Defining a `Model`

```javascript
...
const userSchema = new Schema({ name: string });
const User = model('User', userSchema);
```

1. Set your rules in the `Schema`.
2. Now you can create your `Model` with the `Schema` defined.

### Creating a document

Let see how Ottoman handles a new document creation.

![How to Use](./create.png)

::: tip Notice
Using `Ottoman` you only need to think about `id` in order to execute CRUD Operations over documents.
All the `key` management will be automatically handled by `Ottoman`.
:::

### Retrieving a document

Ottoman provides a `findById` method at the `Model` level to retrieve a document by `id`. See the picture below to understand how it works.

![How to Use](./findById.png)
