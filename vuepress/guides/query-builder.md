# Query Builder

[Query Builder](/classes/query.html) is a flexible tool designed to create N1QL queries by specifying parameters and methods. Query Builder lets you: create queries of unlimited length and complexity without the need to know the syntax of N1QL Queries.

## Using the Query Builder.

There are 3 ways to use the Query Builder: by using  parameters, by using access functions or by combining both.

### Build a Query by using parameters

To create queries by using parameters it is mandatory to define in the query constructor the [**parameters**](/interfaces/iconditionexpr.html#hierarchy) of the query and the **name** of the collection.

```ts
const params = {
  select: [
    {
      $count: {
        $field: {
          name: 'ottoman',
        },
        as: 'odm',
      },
    },

    {
      $max: {
        $field: 'amount',
      },
    },
  ],
  let: [
    { key: 'amount_val', value: 10 },
    { key: 'size_val', value: 20 },
  ],
  where: {
    $or: [{ price: { $gt: 'amount_val', $isNotNull: true } }, { auto: { $gt: 10 } }, { amount: 10 }],
    $and: [
      { price2: { $gt: 1.99, $isNotNull: true } },
      { $or: [{ price3: { $gt: 1.99, $isNotNull: true } }, { id: '20' }] },
    ],
  },
  orderBy: { size: 'DESC' },
  limit: 10,
  offset: 1,
  use: ['airlineR_8093', 'airlineR_8094'],
};
const query = new Query(params, 'collection-name').build();
console.log(query);
```

> SELECT COUNT(\`ottoman\`) AS odm,MAX(\`amount\`) FROM \`collection-name\` USE KEYS ['airlineR_8093','airlineR_8094'] LET amount_val = 10,size_val = 20 WHERE ((price > amount_val AND price IS NOT NULL) OR auto > 10 OR amount = 10) AND ((price2 > 1.99 AND price2 IS NOT NULL) AND ((price3 > 1.99 AND price3 IS NOT NULL) OR id = '20')) ORDER BY size = 'DESC' LIMIT 10 OFFSET 1

### Build a query by using access functions

Creating queries by using the access function is very similar to create them with parameters. The difference is that the parameters are not passed directly to the constructor, instead, they are passed using the different functions available in the Query Class.

```ts
const select = [
  {
    $count: {
      $field: {
        name: 'ottoman',
      },
      as: 'odm',
    },
  },
  {
    $max: {
      $field: 'amount',
    },
  },
];
const letExpr = [
  { key: 'amount_val', value: 10 },
  { key: 'size_val', value: 20 },
];
const where = {
  $or: [{ price: { $gt: 'amount_val', $isNotNull: true } }, { auto: { $gt: 10 } }, { amount: 10 }],
  $and: [
    { price2: { $gt: 1.99, $isNotNull: true } },
    { $or: [{ price3: { $gt: 1.99, $isNotNull: true } }, { id: '20' }] },
  ],
};
const orderBy = { size: 'DESC' };
const limit = 10;
const offset = 1;
const useExpr = ['airlineR_8093', 'airlineR_8094'];

const query = new Query({}, 'collection-name')
  .select(select)
  .let(letExpr)
  .where(where)
  .orderBy(orderBy)
  .limit(limit)
  .offset(offset)
  .useKeys(useExpr)
  .build();
console.log(query);
```

> SELECT COUNT(\`ottoman\`) AS odm,MAX(\`amount\`) FROM \`collection-name\` USE KEYS ['airlineR_8093','airlineR_8094'] LET amount_val = 10,size_val = 20 WHERE ((price > amount_val AND price IS NOT NULL) OR auto > 10 OR amount = 10) AND ((price2 > 1.99 AND price2 IS NOT NULL) AND ((price3 > 1.99 AND price3 IS NOT NULL) OR id = '20')) ORDER BY size = 'DESC' LIMIT 10 OFFSET 1

### Build a query by using parameters and function parameters

```ts
const select = [{ $field: 'address' }];
const query = new Query({ where: { price: { $gt: 5 } } }, 'collection_name').select(select).limit(10).build();
console.log(query);
```

> SELECT \`address\` FROM \`collection_name\` WHERE price > 5 LIMIT 10

## N1QL SELECT clause structure

The syntax of a SELECT clause in n1ql is documented here [link](https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/select-syntax.html).

Available Result Expression Arguments:


| key         | value       |
| ----------- | ----------- |
| \$all       | ALL         |
| \$distinct  | DISTINCT    |
| \$raw       | RAW         |
| \$element   | ELEMENT     |
| \$value     | VALUE       |


Available Aggregation Functions:

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

## N1QL WHERE clause structure

The syntax of a WHERE clause in n1ql is documented here [link](https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/where.html).

Available Comparison Operators:

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

Available Logical operators:

| key   | value |
| ----- | ----- |
| \$and | AND   |
| \$or  | OR    |
| \$not | NOT   |
