# FAQ

Before getting started with Ottoman, here are some useful questions and answers to what we think may help you get up and running quickly.

## What is Ottoman

Ottoman is an ODM (Object Document Mapper) for Couchbase. It leverages Couchbase Node.js SDK 3.x.

Like the name suggests it *“maps a document to an application object”*. ODM enables ways to define the structure of a document in the form of SCHEMAS and MODELS.

## How Is an Odm Different from an Orm?

ODM  are very light weight but at the same time they are very powerful and all it does it maps to a document in the database. It's more suitable for a document based database like Couchbase.

An ORM does a lot of heavy lifting like maintaining and tracking the state of each object and its respective field, managing relationships that come with a performance overhead.

## What Are the Indexes Created by Ottoman?

Ottoman by default creates a Global Secondary Index (GSI) on the property `type` and is the most recommended Index type.

Ottoman also supports View Indexes and Refdoc Index, however we recommend to use them with extreme caution and only if absolutely needed.

## Is There a Sample Project that uses Vanilla JS?

We have a sample project that utilizes ExpressJS, Ottoman, and Swagger using Vanilla JS, [please refer to the example repo on GitHub](https://github.com/couchbaselabs/try-ottoman).

## Does Ottoman Provide Support for Typescript?

Typescript is a first class programming language when it comes to Ottoman. We have a sample project that utilizes ExpressJS, Ottoman, and Swagger using TypeScript, [please refer to the example repo on GitHub](https://github.com/couchbaselabs/try-ottoman-ts).

## Does Ottoman Provide Additional System Debugging Information?

Yes, by [setting the Environment variable](https://ottomanjs.com/guides/ottoman.html#setting-environment-variables) DEBUG to true, you can get additional debugging information. As an example: while working with ottoman operations that use N1QL queries (under the hood) you might want to print the N1QL query generated so that you can identify and create necessary indexes. 