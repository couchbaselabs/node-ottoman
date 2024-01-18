---
sidebar_position: 0
title: Full Text Search
---

You can use the Full Text Search service (FTS) to create queryable full-text indexes in Couchbase Server.
FTS allows you to create, manage, and query full-text indexes on JSON documents stored in Couchbase buckets.

It uses natural language processing for querying documents, provides relevance scoring on the results of your queries, and has fast indexes for querying a wide range of possible text searches.

Supported query types include simple queries like Match and Term queries; range queries like Date Range and Numeric Range; and compound queries for conjunctions, disjunctions, and/or boolean queries.

Ottoman exposes an API for performing FTS queries which abstracts some of the complexity of using the Node.js SDK.

## Examples

Search queries are executed at the cluster level (not bucket or collection). All examples below will console log our returned documents along with their metadata and rows, each returned document has an index, id, score and sort value.

#### Match

Using the `travel-sample` [Sample Bucket](https://docs.couchbase.com/server/7.1/manage/manage-settings/install-sample-buckets.html), we define an FTS SearchQuery using the `match()` method to search for the specified term: "five-star".

```javascript
import { searchQuery, SearchQuery } from 'ottoman';

async function ftsMatchWord(term) {
  return await searchQuery('index-hotel-description', SearchQuery.match(term), { limit: 5 });
}

var result = await ftsMatchWord('five-star');
console.log('RESULT:', result);
```

#### Match Phrase

An FTS SearchQuery using the `matchPhrase()` method to find a specified phrase: `"10-minute walk from the"`.

```javascript
import { searchQuery, SearchQuery } from 'ottoman';

async function ftsMatchPhrase(phrase) {
  return await searchQuery('index-hotel-description', SearchQuery.matchPhrase(phrase), { limit: 10 });
}

result = await ftsMatchPhrase('10-minute walk from the');
console.log('RESULT:', result);
```

When searching for a phrase we get some additional benefits outside of the `match()` method. The match phrase query for `"10-minute walk from the"` will produce the following hits from our travel-sample dataset:

```shell
hits:
  hotel_11331: "10-minute walk from village"
  hotel_15915: "10 minute walk from Echo Arena"
  hotel_3606: "10 minute walk to the centre"
  hotel_28259: "10 minute walk to the coastal path"
```

If you run this code, notice that we matched `"10-minute"` with three additional hits on `"10 minute"` (without the dash).
So, we get some of the same matches on variations of that term just as we would with a regular `match()` method search,
however; notice that `"walk from the"` hits on several variations of this phrase:
`"walk from"` (where `"the"` was removed) and `"walk to the"` (where `"from"` was removed).
This is specific to searching phrases and helps provide us with various matches relevant to our search.


#### Date Range 

Here we define an FTS SearchQuery that uses the `dateRange()` method to search for hotels where the updated field (`datetime`) falls within a specified date range.

```javascript
import { searchQuery, SearchQuery, Schema, model } from 'ottoman';

async function ftsHotelByDateRange(startDate, endDate) {
  const schema = new Schema({
      name: String,
      updated: Date,
      description: String
    });
  
  const Hotel = model('hotel', schema, {modelKey: 'type', keyGeneratorDelimiter: '_'});
  
  await Hotel.updateById('hotel_fts_123', {
    name: 'HotelFTS',
    updated: new Date('2010-11-10 18:33:50 +0300'),
    description: 'a fancy hotel',
  })

  return searchQuery(
    'index-hotel-description',
    SearchQuery.dateRange().start(startDate).end(endDate),
    {
      limit: 5,
    }
  )
}

result = await ftsHotelByDateRange('2010-11-10', '2010-11-20')
console.log('RESULT:', result)
```

#### Conjunction

A query satisfying multiple child queries. The example below will only return two documents hitting on the term `"five-star"` 
and the phrase `"luxury hotel"` while no other documents match both criteria.

````javascript
import { searchQuery, SearchQuery } from 'ottoman';

async function ftsConjunction() {
  return await searchQuery(
    'index-hotel-description',
    SearchQuery.conjuncts(
      SearchQuery.match('five-star'),
      SearchQuery.matchPhrase('luxury hotel')
    )
  )
}

var result = await ftsConjunction()
console.log('RESULT:', result)
````

:::info
Our match for `"five-star"` was not exact, but still produced a result because a similar term was found `"Five star"`, 
we could have potentially matched `"5 star"` or the word `"five"`.
When you work with any full-text search the number of hits you get and their score are variable.
:::

#### Disjunction

A query satisfying (by default) one query or another. 
If a conjunction query can be thought of like using an `AND` operator, a disjunction would be like using an `OR` operator.
The example below will return seven documents hitting on the term `"Louvre"` and five hits on the term `"Eiffel"` returning a total of 12 rows together as part of a disjunction query.

```javascript
import { searchQuery, SearchQuery, TermSearchFacet } from 'ottoman';

async function ftsDisjunction() {
  return await searchQuery(
    'index-hotel-description',
    SearchQuery.disjuncts(
      SearchQuery.match('Louvre'),
      SearchQuery.match('Eiffel')
    ),
    {
      facets: {
        Descriptions: new TermSearchFacet('description', 5),
      },
      limit: 12,
    }
  )
}

result = await ftsDisjunction()
console.log('RESULT:', result)
```

## Working with Results

As with all query result types in Ottoman, the search query results object contains two properties. The hits reflecting the documents that matched your query, emitted as rows. Along with the metadata available in the meta property.

Metadata holds additional information not directly related to your query, such as success total hits and how long the query took to execute in the cluster.

#### Iterating over Hits

```javascript
result.rows.forEach((hit, index) => {
  const docId = hit.id
  const score = hit.score
  const resultNum = index + 1
  console.log(`Result #${resultNum} ID: ${docId} Score: ${score}`)
})
```

#### Facets

```javascript
var facets = result.meta.facets
console.log('Descriptions facet:', facets.Descriptions)
```

## Scan Consistency and ConsistentWith

By default, all Search queries will return the data from whatever is in the index at the time of query. 
These semantics can be tuned if needed so that the hits returned include the most recently performed mutations,
at the cost of slightly higher latency since the index needs to be updated first.

There are two ways to control consistency: either by supplying a custom `SearchScanConsistency` or using `consistentWith`.
At the moment the cluster only supports `consistentWith`, which is why you only see `SearchScanConsistency.NotBounded`
in the enum which is the default setting.
The way to make sure that recently written documents show up in the search works as follows (commonly referred to "read your own writes" — RYOW):

#### Scan consistency example:

```javascript
import { searchQuery, SearchQuery, SearchScanConsistency } from 'ottoman';

result = await searchQuery(
  'index-hotel-description',
  SearchQuery.match('swanky'),
  { consistency: SearchScanConsistency.NotBounded }
)    
```


