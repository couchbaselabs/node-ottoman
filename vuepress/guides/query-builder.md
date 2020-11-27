# Query Builder

[Query Builder](/classes/query.html) is a flexible tool designed to create N1QL queries by specifying parameters and methods. Query Builder lets you: create queries of unlimited length and complexity without the need to know the syntax of N1QL Queries.

## Using the Query Builder.

There are 3 ways to use the Query Builder: by using parameters, by using access functions or by combining both.

### Build a Query by using parameters

To create queries by using parameters it is mandatory to define in the query constructor the [**parameters**](/interfaces/iconditionexpr.html#hierarchy) of the query and the **name** of the collection.

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
    $any: {
      $expr: [{ $in: { search_expr: 'search', target_expr: 'address' } }],
      $satisfied: { address: '10' },
    },
    $in: { search_expr: 'search', target_expr: ['address'] },
  },
  groupBy: [{ expr: 'type', as: 'sch' }],
  letting: [
    { key: 'amount_v2', value: 10 },
    { key: 'size_v2', value: 20 },
  ],
  having: { type: { $like: '%hotel%' } },
  orderBy: { type: 'DESC' },
  limit: 10,
  offset: 1,
  use: ['airlineR_8093', 'airlineR_8094'],
};
const query = new Query(params, 'travel-sample').build();
console.log(query);
```

> SELECT COUNT(type) AS odm FROM `travel-sample` USE KEYS ["airlineR_8093","airlineR_8094"] LET amount_val=10,size_val=20 WHERE ((price>amount_val AND price IS NOT NULL) OR auto>10 OR amount=10) AND ((price2>1.99 AND price2 IS NOT NULL) AND ((price3>1.99 AND price3 IS NOT NULL) OR id="20")) AND ANY search IN address SATISFIES address="10" END AND search IN ["address"] GROUP BY type AS sch LETTING amount_v2=10,size_v2=20 HAVING type LIKE "%hotel%" ORDER BY type DESC LIMIT 10 OFFSET 1

### Build a query by using access functions

Creating queries by using the access function is very similar to create them with parameters. The difference is that the parameters are not passed directly to the constructor, instead, they are passed using the different functions available in the Query Class.

```ts
const select = [
  {
    $count: {
      $field: {
        name: 'type',
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
const groupBy = [{ expr: 'type', as: 'sch' }];
const having = {
  type: { $like: '%hotel%' },
};
const lettingExpr = [
  { key: 'amount_v2', value: 10 },
  { key: 'size_v2', value: 20 },
];
const orderBy = { type: 'DESC' };
const limit = 10;
const offset = 1;
const useExpr = ['airlineR_8093', 'airlineR_8094'];

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

> SELECT COUNT(type) AS odm,MAX(amount) FROM \`travel-sample\` USE KEYS ['airlineR_8093','airlineR_8094'] LET amount_val = 10,size_val = 20 WHERE ((price > amount_val AND price IS NOT NULL) OR auto > 10 OR amount = 10) AND ((price2 > 1.99 AND price2 IS NOT NULL) AND ((price3 > 1.99 AND price3 IS NOT NULL) OR id = '20')) GROUP BY type AS sch LETTING amount_v2=10,size_v2=20 HAVING type LIKE "%hotel%" ORDER BY type = 'DESC' LIMIT 10 OFFSET 1

### Build a query by using parameters and function parameters

```ts
const select = [{ $field: 'address' }];
const query = new Query({ where: { price: { $gt: 5 } } }, 'travel-sample').select(select).limit(10).build();
console.log(query);
```

> SELECT address FROM \`travel-sample\` WHERE price > 5 LIMIT 10

### Advanced example of using the WHERE clause

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
  $and: [{ address: { $isNotNull: true } }, { address: { $isNotMissing: true } }, { address: { $isValued: true } }],
  $not: [
    {
      address: { $like: '%59%' },
      name: { $notLike: 'Otto%' },
      $or: [{ id: { $btw: [1, 2000] } }, { id: { $notBtw: [2001, 8000] } }],
    },
    {
      address: { $like: '%20%' },
    },
  ],
};
const query = new Query({}, 'travel-sample').select().where(where).limit(20).build();
console.log(query);
```

> SELECT * FROM `travel-sample` WHERE (address IS NULL OR free_breakfast IS MISSING OR free_breakfast IS NOT VALUED OR id=8000 OR id!=9000 OR id>7000 OR id>=6999 OR id<5000 OR id<=4999) AND (address IS NOT NULL AND address IS NOT MISSING AND address IS VALUED) AND NOT (address LIKE '%59%' AND name NOT LIKE 'Otto%' AND (id BETWEEN 1 AND 2000 OR id NOT BETWEEN 2001 AND 8000) AND address LIKE '%20%') LIMIT 20

## N1QL SELECT clause structure

See definition [here](/classes/query.html#select)

The syntax of a SELECT clause in n1ql is documented [here](https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/select-syntax.html).

Available Result Expression Arguments:

| key        | value    |
| ---------- | -------- |
| \$all      | ALL      |
| \$distinct | DISTINCT |
| \$raw      | RAW      |
| \$element  | ELEMENT  |
| \$value    | VALUE    |

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

See definition [here](/classes/query.html#where)

The syntax of a WHERE clause in n1ql is documented [here](https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/where.html).

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

Available COLLECTION operators:

| key         | value     |
| ----------- | --------- |
| \$any       | ANY       |
| \$every     | EVERY     |
| \$in        | IN        |
| \$within    | WITHIN    |
| \$satisfies | SATISFIES |

## N1QL JOIN clause structure (Currently the JOIN clause is only supported in string format.)

See definition [here](/classes/query.html#plainJoin)

The syntax of a JOIN clause in n1ql is documented [here](https://docs.couchbase.com/server/6.5/n1ql/n1ql-language-reference/join.html).

## N1QL GROUP BY clause structure

See definition [here](/classes/query.html#groupby)

The syntax of a GROUP BY clause in n1ql is documented [here](https://docs.couchbase.com/server/6.5/n1ql/n1ql-language-reference/groupby.html).
