---
sidebar_position: 6
title: Query Builder    
---

# Query Builder

[Query Builder](/docs/api/classes/query.html) is a flexible tool designed to create N1QL queries by specifying parameters and methods. Query Builder lets you: create queries of unlimited length and complexity without the need to know the syntax of N1QL Queries.

## Using the Query Builder

There are 3 ways to use the Query Builder: by using parameters, by using access functions, or by combining both.

### Build a Query by Using Parameters

To create queries by using parameters it is mandatory to define in the query constructor the [**parameters**](/docs/api/interfaces/iconditionexpr.html#hierarchy) of the query and the **name** of the collection.

```ts
const params = {
  select: [
    {
      $count: {
        $field: {
          name: 'type',
        },
        as: 'odm',
      },
    },
  ],
  let: { amount_val: 10, size_val: 20 },
  where: {
    $or: [
      { price: { $gt: 'amount_val', $isNotNull: true } },
      { auto: { $gt: 10 } },
      { amount: 10 }
    ],
    $and: [
      { price2: { $gt: 1.99, $isNotNull: true } },
      {
        $or: [
          { price3: { $gt: 1.99, $isNotNull: true } },
          { id: '20' }
        ]
      },
      { name: { $eq: 'John', $ignoreCase: true } },
    ],
    $any: {
      $expr: [{ search: { $in: 'address' } }],
      $satisfies: { search: '10' },
    },
    search: { $in: ['address'] },
  },
  groupBy: [{ expr: 'type', as: 'sch' }],
  letting: { amount_v2: 10, size_v2: 20 },
  having: { type: { $like: '%hotel%' } },
  orderBy: { type: 'DESC' },
  limit: 10,
  offset: 1,
  use: ['airline_8093', 'airline_8094'],
};
const query = new Query(params, 'travel-sample').build();
console.log(query);
```

```sql
-- N1QL query result:
SELECT COUNT(type) AS odm
FROM `travel-sample`._default._default
 USE KEYS ["airline_8093","airline_8094"]
 LET amount_val=10, size_val=20
WHERE ((price > "amount_val"
  AND price IS NOT NULL)
  OR auto > 10
  OR amount = 10)
  AND ((price2 > 1.99
  AND price2 IS NOT NULL)
  AND ((price3 > 1.99
    AND price3 IS NOT NULL)
    OR id = "20")
  AND (LOWER(name) = LOWER("John")))
  AND ANY search IN address SATISFIES address = "10" END
  AND search IN ["address"]
GROUP BY type AS sch LETTING amount_v2=10, size_v2=20
HAVING type LIKE "%hotel%"
ORDER BY type DESC
LIMIT 10 OFFSET 1
```

### Build a Query by Using Access Functions

Creating queries by using the access function is very similar to create them with parameters. The difference is that the parameters are not passed directly to the constructor, instead, they are passed using the different functions available in the Query Class.

```ts
const select = [
  {
    $count: {
      $field: { name: 'type' },
      as: 'odm',
    },
  },
  {
    $max: {
      $field: 'amount',
    },
  },
];
const letExpr = { amount_val: 10, size_val: 20 };
const where = {
  $or: [
    { price: { $gt: 'amount_val', $isNotNull: true } },
    { auto: { $gt: 10 } },
    { amount: 10 }
  ],
  $and: [
    { price2: { $gt: 1.99, $isNotNull: true } },
    {
      $or: [
        { price3: { $gt: 1.99, $isNotNull: true } },
        { id: '20' }
      ]
    },
  ],
};
const groupBy = [{ expr: 'type', as: 'sch' }];
const having = { type: { $like: '%hotel%' } };
const lettingExpr = { amount_v2: 10, size_v2: 20 };
const orderBy = { type: 'DESC' };
const limit = 10;
const offset = 1;
const useExpr = ['airline_8093', 'airline_8094'];

const query = new Query({}, 'collection-name')
  .select(select)
  .let(letExpr)
  .where(where)
  .groupBy(groupBy)
  .letting(lettingExpr)
  .having(having)
  .orderBy(orderBy)
  .limit(limit)
  .offset(offset)
  .useKeys(useExpr)
  .build();
console.log(query);
```

```sql
-- N1QL query result:
SELECT COUNT(type) AS odm, MAX(amount)
FROM `travel-sample` USE KEYS ['airline_8093','airline_8094']
  LET amount_val = 10, size_val = 20
WHERE ((price > amount_val
  AND price IS NOT NULL)
  OR auto > 10
  OR amount = 10)
  AND ((price2 > 1.99
  AND price2 IS NOT NULL)
  AND ((price3 > 1.99
    AND price3 IS NOT NULL)
    OR id = '20'))
GROUP BY type AS sch LETTING amount_v2=10, size_v2=20
HAVING type LIKE "%hotel%"
ORDER BY type = 'DESC'
LIMIT 10 OFFSET 1
```

### Build a Query by Using Parameters and Function Parameters

```ts
const select = [{ $field: 'address' }];
const query = new Query({ where: { price: { $gt: 5 } } }, 'travel-sample')
  .select(select)
  .limit(10)
  .build();
console.log(query);
```

```sql
-- N1QL query result:
SELECT address
FROM `travel-sample`
WHERE price > 5
LIMIT 10
```

### Advanced Example of Using the WHERE Clause

```ts
const where = {
  $or: [
    { address: { $isNull: true } },
    { free_breakfast: { $isMissing: true } },
    { free_breakfast: { $isNotValued: true } },
    { id: { $eq: 8000 } },
    { id: { $neq: 9000 } },
    { id: { $gt: 7000 } },
    { id: { $gte: 6999 } },
    { id: { $lt: 5000 } },
    { id: { $lte: 4999 } },
  ],
  $and: [
    { address: { $isNotNull: true } },
    { address: { $isNotMissing: true } },
    { address: { $isValued: true } }
  ],
  $not: [
    {
      address: { $like: '%59%' },
      name: { $notLike: 'Otto%' },
      $or: [{ id: { $btw: [1, 2000] } }, { id: { $notBtw: [2001, 8000] } }],
    },
    {
      address: { $like: 'St%', $ignoreCase: true },
    },
  ],
};
const query = new Query({}, 'travel-sample')
  .select()
  .where(where)
  .limit(20)
  .build();
console.log(query);
```

```sql
-- N1QL query result:
SELECT *
FROM `travel-sample`
WHERE (address IS NULL
  OR free_breakfast IS MISSING
  OR free_breakfast IS NOT VALUED
  OR id = 8000
  OR id != 9000
  OR id > 7000
  OR id >= 6999
  OR id < 5000
  OR id <= 4999)
  AND (address IS NOT NULL
  AND address IS NOT MISSING
  AND address IS VALUED)
  AND NOT (address LIKE "%59%"
  AND name NOT LIKE "Otto%"
  AND (id BETWEEN 1 AND 2000
    OR id NOT BETWEEN 2001 AND 8000)
  AND (LOWER(address) LIKE LOWER("St%")))
LIMIT 20
```

:::tip Note
Can also use `ignoreCase` as part of the `build` method, this will always prioritize the `$ignoreCase` value defined in clause

```ts
const expr_where = {
  $or: [
    { address: { $like: '%57-59%', $ignoreCase: false } }, // ignoreCase not applied
    { free_breakfast: true },
    { name: { $eq: 'John' } } //  ignoreCase applied
  ],
};
/**
 * Can also use:
 * const expr_where = {
 *   $or: [
 *     ...
 *     { name: 'John' } // ignoreCase applied
 *   ],
 * };
 *
 */
const query = new Query({}, 'travel-sample');
const result = query
  .select([{ $field: 'address' }])
  .where(expr_where)
  .build({ ignoreCase: true }); // ignoreCase enabled for WHERE clause
console.log(result)
```

Would have as output:

```sql
-- N1QL query result:
SELECT address
FROM `travel-sample`
WHERE (address LIKE "%57-59%"
  OR free_breakfast = TRUE
  OR (LOWER(name) = LOWER("John")));
```

:::

## N1QL SELECT Clause Structure

See definition [here](/docs/api/classes/query.html#select)

The syntax of a SELECT clause in n1ql is documented [here](https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/select-syntax.html).

### Available Result Expression Arguments

| key        | value    |
| ---------- | -------- |
| \$all      | ALL      |
| \$distinct | DISTINCT |
| \$raw      | RAW      |
| \$element  | ELEMENT  |
| \$value    | VALUE    |

### Available Aggregation Functions

| key            | value         |
| -------------- | ------------- |
| \$arrayAgg     | ARRAY_AGG     |
| \$avg          | AVG           |
| \$mean         | MEAN          |
| \$count        | COUNT         |
| \$countn       | COUNTN        |
| \$max          | MAX           |
| \$median       | MEDIAN        |
| \$min          | MIN           |
| \$stddev       | STDDEV        |
| \$stddevPop    | STDDEV_POP    |
| \$stddevSamp   | STDDEV_SAMP   |
| \$sum          | SUM           |
| \$variance     | VARIANCE      |
| \$variancePop  | VARIANCE_POP  |
| \$varianceSamp | VARIANCE_SAMP |
| \$varPop       | VAR_SAMP      |
| \$varSamp      | VAR_SAMP      |

### N1QL SELECT Nested Clause Example

```typescript
const query = new Query({}, 'travel-sample a');
const result = query
  .select([{
    $field: {
      name: '{ "latLon": { geo.lat, geo.lon } }',
      as: 'geo'
    }
  }])
  .where({ 'a.type': 'hotel' })
  .build();
```

```sql
SELECT {"latLon": {geo.lat, geo.lon} } AS geo
FROM `travel-sample` a
WHERE a.type = "hotel"
```

## N1QL WHERE Clause Structure

See definition [here](/docs/api/classes/query.html#where)

The syntax of a WHERE clause in N1QL is documented [here](https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/where.html).

### Available Comparison Operators

| key            | value          |
| -------------- | -------------- |
| \$isNull       | IS NULL        |
| \$isNotNull    | IS NOT NULL    |
| \$isMissing    | IS MISSING     |
| \$isNotMissing | IS NOT MISSING |
| \$isValued     | IS VALUED      |
| \$isNotValued  | IS NOT VALUED  |
| \$eq           | =              |
| \$neq          | \!=            |
| \$gt           | >              |
| \$gte          | >=             |
| \$lt           | <              |
| \$lte          | <=             |
| \$like         | LIKE           |
| \$notLike      | NOT LIKE       |
| \$btw          | BETWEEN        |
| \$notBtw       | NOT BETWEEN    |

### Available Logical Operators

| key   | value |
| ----- | ----- |
| \$and | AND   |
| \$or  | OR    |
| \$not | NOT   |

### Available Collection Operators

| key         | value      |
| ----------- | ---------- |
| \$any       | ANY        |
| \$every     | EVERY      |
| \$in        | IN         |
| \$notIn     | NOT IN     |
| \$within    | WITHIN     |
| \$notWithin | NOT WITHIN |
| \$satisfies | SATISFIES  |

Available String Modifiers:

| key          | value   |
| ------------ | ------- |
| \$ignoreCase | Boolean |

## Functional *COLLECTION* Operators Examples

Let's take a deeper dive into using various collection operators with Ottoman's Query Builder

### Using Deep Search Operators *( [NOT] IN | WITHIN )*

The [IN](https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/collectionops.html#collection-op-in) operator specifies the search depth to *include* ***only*** *the current level of an array and* ***not*** *to include any child or descendant arrays*. On the other hand the [WITHIN](https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/collectionops.html#collection-op-within) operator *include the current level of an array and* ***all*** *of its child and descendant arrays*.

```ts
// Defining our where clause
const where: LogicalWhereExpr = {
  type: 'airline',
  country: { $in: ['United Kingdom', 'France'] },
  [`"CORSAIR"`]: { $within: { $field: 't' } },
};
const query = new Query({}, `travel-sample t`)
  .select('name,country,id')
  .where(where)
  .build();
```

With the above implementation will get this sql query:

```sql
SELECT name, country, id
FROM `travel-sample` t
WHERE type = "airline"
  AND country IN ["United Kingdom","France"]
  AND "CORSAIR" WITHIN t;
```

Now we call to Ottoman instance

```ts
const ottoman = getDefaultInstance();
await ottoman.start();
// Query execution
const response = await ottoman.query(query);
console.log(response);
```

Here is the output:

```sh
[
  {
    country: 'France',
    id: 1908,
    name: 'Corsairfly',
  }
]
```

### Using Range Predicate Operators *( ANY | EVERY )*

[ANY](https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/collectionops.html#collection-op-any) is a range predicate that tests a Boolean condition over the elements or attributes of a collection, object, or objects. It uses the `IN` and `WITHIN` operators to range through the collection. If at least one item in the array satisfies the `ANY` expression, then it returns the entire array; otherwise, it returns an empty array. Let's see it in action:

```ts
// Defining our selection
const selectExpr = 'airline,airlineid,destinationairport,distance';

// Using LET operator to store some data
const letExpr: LetExprType = { destination: ['ATL'] };
```

For `ANY` and `EVERY` in Ottoman we use the operators `$expr` and `$satisfies`:
> ***$expr:*** is an array of expressions with the structure: \
> `[{ SEARCH_EXPRESSION: { [$in|$within]: TARGET_EXPRESSION } }]`
>   - *`SEARCH_EXPRESSION`*: A string or expression that evaluates to a string representing the variable name in the `ANY | EVERY` loop.
>   - *`TARGET_EXPRESSION`*: A string or expression that evaluates to a string representing the array to loop through.
>
> ***$satisfies:*** An expression representing the limiting or matching clause to test against

Now we create the `WHERE` clause including the `ANY` operator:

```ts
const whereExpr: LogicalWhereExpr = {
  type: { $eq: 'route' },
  $and: [
    { sourceairport: { $eq: 'ABQ' } },
    {
      // Here is where the magic happen
      $any: {
        $expr: [
          { departure: { $in: 'schedule' } },
          { other: { $within: ['KL', 'AZ'] } }
        ],
        $satisfies: {
          $and: [
            { 'departure.utc': { $gt: '03:53' } },
            { other: { $field: 'airline' } }
          ],
        },
      },
    },
    { destinationairport: { $in: { $field: 'destination' } } },
  ],
};

const query = new Query({}, 'travel-sample')
  .select(selectExpr)
  .let(letExpr)
  .where(whereExpr)
  .build();
console.log(query);
```

We will obtain the query:

```sql
SELECT airline, airlineid, destinationairport, distance
FROM `travel-sample`
LET destination=["ATL"]
WHERE type = "route"
  AND (
    sourceairport = "ABQ"
    AND ANY departure IN schedule,
    other WITHIN ["KL","AZ"]
    SATISFIES (
        departure.utc > "03:53" AND other = airline
    ) END
    AND destinationairport IN destination)
```

```ts
const ottoman = getDefaultInstance();
await ottoman.start();

// After initializing Ottoman we run the query
const { rows } = await ottoman.query(query);
console.log(rows);
```

The query output:

```sh
[
  {
    airline: 'AZ',
    airlineid: 'airline_596',
    destinationairport: 'ATL',
    distance: 2038.3535078909663,
  },
  {
    airline: 'KL',
    airlineid: 'airline_3090',
    destinationairport: 'ATL',
    distance: 2038.3535078909663,
  },
]
```

[EVERY](https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/collectionops.html#collection-op-every) is very similar to` ANY` with the main difference being that all the elements of the array must satisfy the defined condition. Let's see how it works:

```ts
// Changing a little the above where expression definition:
const whereExpr: LogicalWhereExpr = {
  type: { $eq: 'route' },
  $and: [
    { airline: { $eq: 'KL' } },
    { sourceairport: { $like: 'ABQ' } },
    { destinationairport: { $in: ['ATL'] } },
    {
      $every: {
        $expr: [{ departure: { $in: 'schedule' } }],
        $satisfies: { 'departure.utc': { $gt: '00:35' } },
      },
    },
  ],
};

// Building the query
const query = new Query({}, 'travel-sample')
  .select(selectExpr)
  .where(whereExpr)
  .build();
console.log(query);
```

The resulting query would be:

```sql
SELECT airline, airlineid, destinationairport, distance
FROM `travel-sample`
WHERE type = "route"
  AND (
    airline = "KL"
    AND sourceairport LIKE "ABQ"
    AND destinationairport IN ["ATL"]
    AND EVERY departure IN schedule SATISFIES departure.utc > "00:35" END
  );
```

Now let's run the query:

```ts
const ottoman = getDefaultInstance();
await ottoman.start();

const { rows } = await ottoman.query(query);
console.log(rows);
```

We would have as a result:

```sh
[
  {
    airline: 'KL',
    airlineid: 'airline_3090',
    destinationairport: 'ATL',
    distance: 2038.3535078909663,
  },
]
```

### Query Builder & Model Find Method

Let's start from query:

```sql
SELECT country, icao, name
FROM `travel-sample`
WHERE type = "airline"
  AND (country IN ["United Kingdom","France"])
  AND callsign IS NOT NULL
  AND ANY description WITHIN ["EU"] SATISFIES icao
  LIKE "%" || description END
LIMIT 2
```

Using Model find method

```ts
// Defining our SCHEMA
const airlineSchema = new Schema({
  callsign: String,
  country: String,
  iata: String,
  icao: String,
  id: Number,
  name: String,
  type: String,
});

// Model Airline creation
const Airline = model('airline', airlineSchema, { modelKey: 'type' });

//Start Ottoman instance
const ottoman = getDefaultInstance();
await ottoman.start();

// Our find method with a filter and options definitions
const response = await Airline.find(
  {
    type: 'airline',
    $and: [{ country: { $in: ['United Kingdom', 'France'] } }],
    callsign: { $isNotNull: true },
    $any: {
      $expr: [{ description: { $within: ['EU'] } }],
      $satisfies: { icao: { $like: { $field: '"%"||description' } } },
    },
  },
  { limit: 2, select: 'country,icao,name', lean: true },
);
// Print output
console.log(response.rows);
```

Via Query Builder

```ts
// Defining our query
const query = new Query({ select: 'country,icao,name' }, 'travel-sample')
  .where({
    type: 'airline',
    $and: [{ country: { $in: ['United Kingdom', 'France'] } }],
    callsign: { $isNotNull: true },
    $any: {
      $expr: [{ description: { $within: ['EU'] } }],
      $satisfies: { icao: { $like: { $field: '"%"||description' } } },
    },
  })
  .limit(2)
  .build();

//Start Ottoman instance
const ottoman = getDefaultInstance();
await ottoman.start();

// Runing query
const response = await ottoman.query(query);

// Print output
console.log(response.rows);
```

For above examples we get this output:

```sh
[
  {
    country: 'United Kingdom',
    icao: 'AEU',
    name: 'Astraeus'
  },
  {
    country: 'France',
    icao: 'REU',
    name: 'Air Austral'
  },
]
```

## N1QL JOIN Clause Structure

Notice: Currently the JOIN clause is only supported in string format.

See definition [here](/docs/api/classes/query.html#plainJoin)

The syntax of a JOIN clause in n1ql is documented [here](https://docs.couchbase.com/server/6.5/n1ql/n1ql-language-reference/join.html).

## N1QL GROUP BY Clause Structure

See definition [here](/docs/api/classes/query.html#groupby)

The syntax of a GROUP BY clause in n1ql is documented [here](https://docs.couchbase.com/server/6.5/n1ql/n1ql-language-reference/groupby.html).
