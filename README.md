![CI](https://github.com/couchbaselabs/node-ottoman/workflows/CI/badge.svg)
[![codecov](https://codecov.io/gh/couchbaselabs/node-ottoman/branch/master/graph/badge.svg)](https://codecov.io/gh/couchbaselabs/node-ottoman)
[![npm version](https://badge.fury.io/js/ottoman.svg)](https://badge.fury.io/js/ottoman)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Introduction
Ottoman is an ODM built for Couchbase and Node.js.

Ottoman's goal is to provide a better development experience while using Couchbase,
bringing to developers a reliable tool to build systems that are easy-to-design, to  maintain and to scale.

#### Installation

```
npm install ottoman
```

That's it, you are ready to use Ottoman.

#### Dependencies Matrix

Supported version are:

| Ottoman     | Nodejs      | Couchbase SDK   | Couchbase Server 
| ----------- | ----------- | --------------- | -----------------
| ^2.0.0      | ^8.0.0      |  ^3.0.0         | ^6.5.0

***Notice: make sure you are using supported versions***

#### Getting started

```javascript
import { connect, model } from "ottoman";
connect("couchbase://localhost/travel-sample@admin:password");

const User = model('User', { name: String });

const user = new User({name:'Jane Doe'});
user.save().then(() => console.log('Nice Job!'));
```

#### Ottoman v2 main goals

- To add support to Couchbase SDK 3.
- To add typescript support.
- To have a powerful query builder built-in.
- To allow adding indexes to improve queries performance.
- To have extendable Schemas using statics, methods, hooks.
- To have Pluggable Schemas.

## Documentation

To check out `examples` and docs, visit [ottomanjs.com](http://ottomanjs.com).

## Questions

For questions and support please use [the official forum](https://forums.couchbase.com/) or [contact community](http://couchbase.com/communities/nodejs). 

## Issues

Please make sure to read the [Issue Reporting Checklist](http://issues.couchbase.com/) before opening an issue.
 
## Changelog

Detailed changes for each release are documented in the [release notes](https://github.com/couchbaselabs/node-ottoman/releases).

## Stay In Touch

- [Blog](https://blog.couchbase.com/?s=ottoman)

## Contributions

Please make sure to read the `Contributing Guide` before making a pull request. 
Thank you to all the people who already contributed to Couchbase Ottoman!

#### Guide for Developers

1. [Install Couchbase Server Using Docker](https://docs.couchbase.com/server/current/install/getting-started-docker.html).

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
```
Check results on [http://localhost:8091/](http://localhost:8091/) couchbase web client

## License
© Copyright 2013 Couchbase Inc.

Licensed under the Apache License, Version 2.0.
See [the Apache 2.0 license](http://www.apache.org/licenses/LICENSE-2.0).

