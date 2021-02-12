![CI](https://github.com/couchbaselabs/node-ottoman/workflows/CI/badge.svg?branch=v2) 
[![npm version](https://badge.fury.io/js/ottoman.svg)](https://badge.fury.io/js/ottoman)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Introduction
Ottoman V2 is an Object Document Mapper (ODM) built for Couchbase and Node.js.

Ottoman's [goal][#ottoman-v2-main-goals] is to provide a better development experience while using Couchbase,
bringing to developers a reliable tool to build systems that are easy-to-design, to  maintain and to scale.

#### Getting started

```javascript
import { connect, model } from "ottoman";
connect("couchbase://localhost/travel-sample@admin:password");

const User = model('User', { name: String });

const user = new User({name:'Jane Doe'});
user.save().then(() => console.log('Nice Job!'));
```

#### Ottoman v2 main goals

- Add support to Couchbase SDK 3
- Add typescript support
- Update Documentation and Examples
 
...and many more, new features coming soon.

## Documentation

To check out `examples` and docs, visit [v2.ottomanjs.com](http://v2.ottomanjs.com).

## Questions

For questions and support please use [the official forum](https://forums.couchbase.com/) or [contact community](http://couchbase.com/communities/nodejs). 

## Stay In Touch

- [Blog](https://blog.couchbase.com/?s=ottoman)

<!--
## Issues

Please make sure to read the [Issue Reporting Checklist](http://issues.couchbase.com/) before opening an issue.

## Changelog

Detailed changes for each release are documented in the [release notes](https://github.com/couchbaselabs/node-ottoman/releases).

## Contribution

Please make sure to read the `Contributing Guide` before making a pull request. 
Thank you to all the people who already contributed to Couchbase Ottoman!
-->

#### Development Guide

1. [Install Couchbase Server Using Docker](https://docs.couchbase.com/server/current/install/getting-started-docker.html).

2. Get repo and install dependencies 
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
© Copyright 2021 Couchbase Inc.

Licensed under the Apache License, Version 2.0.
See [the Apache 2.0 license](http://www.apache.org/licenses/LICENSE-2.0).

