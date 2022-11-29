---
sidebar_position: 2
title: Advanced Concepts
---

# Advanced Concepts

This section will cover some advanced concepts and options in `Ottoman`.

## Ottoman Configuration

```typescript
interface OttomanConfig {
  collectionName?: string;
  scopeName?: string;
  idKey?: string;
  modelKey?: string;
  populateMaxDeep?: number;
  consistency?: SearchConsistency;
  maxExpiry?: number;
  keyGenerator?: (params: { metadata: ModelMetadata }) => string;
  keyGeneratorDelimiter?: string;
}
```

- `collectionName`: Store value to use for each Model if not provided. Default: Model's name
- `scopeName`: Store value to use for each Model if not provided. Default: `_default`
- `idKey`: Value of the key to save your **id**. Default: Document's `id`
- `modelKey`: Key to store the model name into the document. Default: `_type`
- `populateMaxDeep`: Numeric Value for how many levels deep you want to *_populate*. Default: `1`
- `consistency`: Value for *Search Consistency Strategy*. Default: `SearchConsistency.NONE`
- `maxExpiry`: Numeric value (based in Milliseconds) used to create a collection for this instance. Default: `300000`
- `keyGenerator`: Function to generate the key to store documents. Default: `(params: { metadata: ModelMetadata }) => string`
- `keyGeneratorDelimiter`: String value used to build the document key. Default: `::`

A complete new section is available to show how the [key-generation-layer](/docs/advanced/how-ottoman-works.html#key-generation-layer) works.

### PopulateMaxDeep Option

This option sets the default value for the population. The default value is `1`. This number will be the number of times `Ottoman` will go deeper populating the `document`.

#### Shape the Solution

Let's see a whole example to show how to populate and populateMaxDeep option works using `ReferenceType`:
We'll go to create Address, Person, Company `Models`.

```typescript
import { Schema, model } from 'ottoman';

const addressSchema = new Schema({
  address: String
})

const personSchema = Schema({
  name: String,
  age: Number,
  address: { type: addressSchema, ref: 'Address'}
});

const companySchema = Schema({
  president: { type: personSchema, ref: 'Person' },
  ceo: { type: personSchema, ref: 'Person' },
  name: String,
  workers: [{ type: personSchema, ref: 'Person' }]
});

const Address = model('Address', addressSchema);
const Story = model('Story', storySchema);
const Company = model('Company', companySchema);
```

In the example above, we define a "Schema" for the company that uses the "Person" schema to define "president" and "workers" and the person scheme uses the address Schema in turn. A reference representation of the modeling might be `Company -> Person -> Address`.

#### Saving Documents

Now we are going to create a new Company with John Smith as President and Jane Doe as CEO.

```typescript
const johnAddress = new Address({address: '13 Washington Square S, New York, NY 10012, USA'});
await address.save();

const john = new Person({name: 'John Smith', age: 52, address: johnAddress});
await john.save();

const janeAddress = new Address({address: '55 Clark St, Brooklyn, NY 11201, USA'});
await address.save();

const jane = new Person({name: 'Jane Doe', age: 45, address: janeAddress});
await jane.save();

const spaceX = new Company({name: 'Space X', president: john, ceo: jane})
await spaceX.save()
```

These few lines of code create the `Space X` company. Notice how we use the ReferenceType to create 
relations between our models.

#### Retrieving Documents with Populate

We already have the `Space X` company saved, let's see how we can retrieve it

```typescript
// this line of code will quere db for the Space X company
const spaceX = await Company.findOne({name: 'Space X'});
```

The result should look like this:

```json
{
  "id": "2454353-34543-34534534",
  "name": "Space X",
  "president": "123456-1234-12345",
  "ceo": "654321-4321-54321"
}
```

Notice: The `president` and `ceo` field don't have the data, they are just saving a reference to the data in the `Person` collection

If we want to get the data reference for the `president` and `ceo` fields we need to use the `populate` feature.

Example:

```typescript
// first we need to Space X company
const spaceX = await Company.findOne({name: 'Space X'});

// now we will use _populate function to populate the references
await spaceX._populate('*')
```

::: tip
The '_populate' function will receive 1 or many field names separate by a comma to know
the field to populate or just use the `*` wildcard to populate all references in the document,
as we showed in the above example. If you want just to populate the `ceo` field for example you
just need to write this line instead `await spaceX._populate('ceo')`.
:::

The result should look like this:

```json
{
  "id": "2454353-34543-34534534",
  "name": "Space X",
  "president": {
    "id": "123456-1234-12345",
    "name": "John Smith",
    "age": 52,
    "address": "34215-7645-87906"
  },
  "ceo": {
    "id": "654321-4321-54321",
    "name": "Jane Doe",
    "age": 45,
    "address": "10032-7645-87906"
  }
}
```

As you can see we retrieved successfully the data for the `president` and `ceo` fields, but if you look
closer the address field inside them still have a reference to the address, due to we have 3 level
of nested `Schemas`, for a case like this, we can use the `populateMaxDeep` option, the default value is 1,
this means that only the field in the first level will be populated even if we use the `*` wildcard,
this wildcard is only to notified the fields to populate not the deep of the search if we use nested `Schemas` and want to `Ottoman` handle the population we need to use the `populateMaxDeep` option. Let's see how it work.

```typescript
// first we need to Space X company
const spaceX = await Company.findOne({name: 'Space X'});

// now we will use _populate function to populate the references
await spaceX._populate('*', 2)
```

The `_populate` function accepts a second argument to define `populateMaxDeep` if we set it to look deep for 2 level
the result will be:

```json
{
  "id": "2454353-34543-34534534",
  "name": "Space X",
  "president": {
    "id": "123456-1234-12345",
    "name": "John Smith",
    "age": 52,
    "address": {
      "id": "34215-7645-87906",
      "address": "13 Washington Square S, New York, NY 10012, USA"
    }
  },
  "ceo": {
    "id": "654321-4321-54321",
    "name": "Jane Doe",
    "age": 45,
    "address": {
      "id": "10032-7645-87906",
      "address": "55 Clark St, Brooklyn, NY 11201, USA"
    }
  }
}
```

Congratulations! You retrieve the entire `Space X` data, from the nested Schemas `Company -> Person -> Address` design.

::: tip Rewriting `populateMaxDeep`
`populateMaxDeep` option is set to 1, as we can see in the previous example, but you can override it when creating the
`Ottoman` instance.

```typescript
const ottoman = new Ottoman({populateMaxDeep: 5});

...

// will populate 5 level down from nested references
await spaceX._populate('*')
```

This way every `_populate` function will try to populate documents 5 levels deep instead of just 1 default and recommended value. Populations are one of the more expensive operations in Databases as a general concept, try to avoid high numbers in `populateMaxDeep`. Ottoman takes advantage of key/value operation to execute populate to reduce the query times as much as possible.
:::
