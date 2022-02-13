![CI](https://github.com/couchbaselabs/node-ottoman/workflows/CI/badge.svg)
[![codecov](https://codecov.io/gh/couchbaselabs/node-ottoman/branch/master/graph/badge.svg)](https://codecov.io/gh/couchbaselabs/node-ottoman)
[![npm version](https://badge.fury.io/js/ottoman.svg)](https://badge.fury.io/js/ottoman)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

# Introduction

Ottoman is an ODM built for Couchbase and Node.js.

Ottoman's goal is to provide a better development experience while using Couchbase,
bringing to developers a reliable tool to build systems that are easy to design, maintain, and scale.

## Installation

```
npm install ottoman
```

That's it, you are ready to use Ottoman.

### Dependencies Matrix

Supported version are:

| Ottoman     | Nodejs      | Couchbase SDK   | Couchbase Server
| ----------- | ----------- | --------------- | -----------------
| ^2.0.0      | ^8.0.0      |  ^3.2.2         | ^6.5.0

***Notice: make sure you are using supported versions***

## Getting started

```javascript
const { connect, model, start, close } = require('ottoman');

const main = async () => {
  await connect("couchbase://localhost/travel-sample@admin:password");

  const User = model('User', { name: String });

  const user = new User({ name: 'Jane Doe' });

  await start();

  await user.save();
  console.log('Nice Job!');

  await close();
}

main();
```

You should see results similar to the following:

```
Nice Job!
```

::: tip Note
If you are using the legacy version of Ottoman, check out the [V1 docs](https://v1.ottomanjs.com/).
:::


## Ottoman v2 main goals

- To add support to Couchbase SDK 3.
- To add typescript support.
- To have a powerful query builder built-in.
- To allow adding indexes to improve queries performance.
- To have extendable Schemas using statics, methods, hooks.
- To have Pluggable Schemas.

## Documentation

Checkout our [examples](https://ottomanjs.com/guides/first-app.html)  and [docs](https://ottomanjs.com/guides/quick-start.html) for typescript and javascript implementation.

## Questions

For questions and support please use [the official forum](https://forums.couchbase.com/) or [contact community](http://couchbase.com/communities/nodejs).
Please make sure to read the [Issue Reporting Checklist](https://github.com/couchbaselabs/node-ottoman/issues) before opening an issue.

## Changelog

Detailed changes for each release are documented in the [release notes](https://docs.couchbase.com/nodejs-sdk/current/project-docs/ottoman-release-notes.html).

## Stay In Touch

- [Blog](https://blog.couchbase.com/?s=ottoman)

## Contributions

Thank you to all the people who already contributed to Couchbase Ottoman!

### Guide for Developers

1. [Install Couchbase Server Using Docker](https://docs.couchbase.com/server/current/install/getting-started-docker.html).

::: tip Note
Check results on [http://localhost:8091/](http://localhost:8091/) couchbase web client.
:::


2. Get the repo and install dependencies

```
$ git clone https://github.com/couchbaselabs/node-ottoman.git
$ cd node-ottoman
$ yarn install
```

3. Available scripts

```
$ yarn dev
$ yarn build
$ yarn lint
$ yarn test
$ yarn test --coverage
$ yarn docs
$ yarn docs:dev
```

## Deploying Ottoman to NPM

- Pull master branch from repo
- yarn install
- ensure version number is bumped
- yarn build
- yarn is:ready

## Publishing to NPM

When publishing a new package to NPM, please follow the following steps:

- git pull (master branch)
- update the `package.json` file w/ new version
- yarn install && yarn build
- yarn test:legacy (Use `test:legacy` Until CB 7 Release)
- yarn pack (ensure package is packing as intended)
- npm publish (--tag alpha or --tag beta)
- push changes to `package.json` file w/ new version
- deploy docs *if required

Once package is published, *update the docs:

- yarn docs:dev (preview site)
- yarn docs (generate docs directory)
- copy files in `docs/.vuepress/dist` to ottomanjs-site
- ensure CNAME file is correct
- git push changes to ottomanjs-site

## License

© Copyright 2021 Couchbase Inc.

Licensed under the Apache License, Version 2.0.
See [the Apache 2.0 license](http://www.apache.org/licenses/LICENSE-2.0).
