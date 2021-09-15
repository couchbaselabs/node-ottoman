# FAQ

Before getting started with Ottoman, here are some useful questions and answers to what we think may help you get up and running quickly.

## What is Ottoman

Ottoman is an ODM (Object Document Mapper) for Couchbase. It leverages Couchbase Node.js SDK 3.x.

Like the name suggests it *“maps a document to an application object”*. ODM enables ways to define the structure of a document in the form of SCHEMAS and MODELS.

## What Can Ottoman Do That the NodeJS SDK Cannot?

We have created a [side-by-side comparison chart](/guides/sdk-comparison) of Ottoman v2.0 vs NodeJS SDK v3.2 to show the differences.

## How Is an ODM different from an ORM?

ODM's are very light weight powerful, focusing on mapping documents to your database through models defined in your application. ODM's are specific to document based databases like Couchbase.

An ORM does a lot of heavy lifting. They maintain and track the state of each object and its respective field, and management of relationships that come with a performance overhead.

## Is Ottoman version 2 backward compatible with version 1?

Ottoman 2.0 is written on top of the [Couchbase Nodejs SDK 3.x](https://docs.couchbase.com/nodejs-sdk/current/hello-world/start-using-sdk.html) and enables support for Scopes and Collections as well as writing your applications in TypeScript. 

Migration from other document databases is much more achievable as well as starting from a code first perspective. We've made a major overhaul in respect to the way bootstrapping occurs. Refer to the [Bootstrapping documentation](/guides/ottoman.html#not-using-scopes-collections) for more details.

## What are the benefits of using Ottoman?

An Object Document Mapper (ODM) like Ottoman allows for validation of schema and the application of quality controls on your JSON data. Since document databases like Couchbase are flexible considering schema, if one wants to put checks in place, an ODM is where you can do this.

Overall, Ottoman abstracts complexities from the official [NodeJS SDK](https://docs.couchbase.com/nodejs-sdk/current/hello-world/start-using-sdk.html) and makes working with Couchbase easier.

## What are the Couchbase Server features that Ottoman Supports?

Ottoman version 2 provides support for [Key Value](https://docs.couchbase.com/nodejs-sdk/current/howtos/kv-operations.html) and [Query (N1QL Search)](https://docs.couchbase.com/nodejs-sdk/current/howtos/n1ql-queries-with-sdk.html) services only. FTS, Analytics, and Eventing are not yet supported.

When working with Ottoman, you can drop down to the SDK level to utilize the features of the official SDK and run in tandem with Ottoman. It's worth noting that there is a workaround to use [FTS via Query Service](https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/searchfun.html).

## What is the bootstrapping process and best practices associated with it?

At a high-level, the bootstrapping process involves:

- Creating an Ottoman Instance
- Defining Schema.
- Declaring models
- Call the start method.

Points to consider when bootstrapping:

- Start method should always be called after all models have been declared.
- The start method attempts to create scopes and collections (in Couchbase 7) and also any required Indexes.
- Creation of Indexes is a resource-intensive process and as a best practice, every attempt should be made to create and build indexes outside Ottoman.

## What are the indexes created by Ottoman?

Ottoman, by default, creates a Global Secondary Index (GSI) on the property `type` and is the most recommended Index type.

Ottoman also supports View Indexes and Refdoc Index, however; we recommend using them with extreme caution and only if needed.

## Is there a sample project that uses Vanilla JS?

We have a sample project that utilizes ExpressJS, Ottoman, and Swagger using Vanilla JS, [please refer to the example repo on GitHub](https://github.com/couchbaselabs/try-ottoman).

## Does Ottoman provide support for Typescript?

[TypeScript](https://www.typescriptlang.org/) is a first-class programming language when it comes to Ottoman. We have a sample project that utilizes ExpressJS, Ottoman, and Swagger using TypeScript, [please refer to the example repo on GitHub](https://github.com/couchbaselabs/try-ottoman-ts).

## What are the different operations in Ottoman that use N1QL Queries under the hood?

- [find()](/interfaces/imodel.html#find)
- [findOne()](/interfaces/imodel.html#findone)
- [findOneAndUpdate()](/interfaces/imodel.html#findoneandupdate)
- [removeMany()](/interfaces/imodel.html#removemany)
- [updateMany()](/interfaces/imodel.html#updatemany)

## What is Ottoman’s compatibility with Couchbase Server?

Ottoman fully supports and is tested with Couchbase server 6.x and 7.x as well as [Couchbase Cloud](https://www.couchbase.com/products/cloud).

## I just created a document but the find method doesn't return the document, is this a bug?

No, when documents are created and attempted to be retrieved via non-kv operations like `.find()` are eventually consistent. You will have to pass `findOption` for `searchConsistency` as  `REQUEST_PLUS`.

## Can I upsert a document?

Model method [findOneAndUpdate](/interfaces/imodel.html#findoneandupdate) allows you to upsert a document by passing in an option called `upsert` with a value of `true`.

## Can I make certain fields immutable?

Yes, with Ottoman any field declared in a Schema as immutable will remain unchanged. However, this behavior can be overridden by passing in a strict option at the Schema level or at a Model method level.

- A strict option of false will allow you to update an immutable field.  
- A strict option of throw will throw an exception for any attempt made to update an immutable field.  
- By default the strict option is set to true, i.e any attempt to update an immutable field will be simply ignored.

You can find more info in our [Schema Types Immutable Option](/guides/schema.html#schema-types-immutable-option) documentation.

## Can I do a select with populate?

Yes, in Ottoman version 2 you can select certain fields while populating a referenced object.

You can find more info in our [_populate](/guides/schema.html#schema-types-immutable-option) documentation.

## What is lean and when should you use lean?

The [lean option](/guides/model.html#use-of-lean) tells Ottoman to skip a lot of internal state tracking of the result documents. This makes queries faster and less memory intensive, but the result documents are plain old JavaScript objects (POJOs), not Ottoman documents.

Use Lean when you don’t need to rely on Ottoman features like validators or hooks. For example, if you are executing queries and sending results without modification.

## Does Ottoman provide additional system debugging information?

Yes, [setting the Environment variable](/guides/ottoman.html#setting-environment-variables) DEBUG to `true`, gives you additional debugging information.

As an example: while working with ottoman operations that use N1QL queries (under the hood) you might want to print the N1QL query generated so that you can identify and create necessary indexes.
