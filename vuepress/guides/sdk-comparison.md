# Ottoman Vs SDK Comparison

This document outlines subtle differences between Ottoman and Node.js SDK
and also demonstrate the value proposition (advantages) that Ottoman brings over Node.js SDK.

## Value Proposition

Data Integrity:
Defining structure to data, validating data and enforcing constraints using lightweight code patterns.

Cost:  
Open Source, secure, fully supported, less maintenance overhead, less infrastructure cost, extensible and can work with any Javascript or Typescript native application.

Agile Development:
Be a leader in your space, build and deliver applications quickly and timely. Spend your time solving business problems rather than coding.

Adaptability:
Minimal learning curve, resource with skill set available in abundance.

| Feature     | Ottoman     | NodeJS SDK  | Value Prop  | Description |
| ---------- | :---------: | :---------: | ----------- | ----------- |
| Schema, Constraints | ✅ | 🚫 | Data Integrity | Schemas and Constraints enables end users to control document shape. |
| Validators | ✅ | 🚫 | Data Integrity | Provides data quality. |
| Reference Types and Populate | ✅ | 🚫 | Data Integrity | Provides means to refer and populate referenced documents. |
| Scopes and collections | ✅ | ✅ | Data Integrity | Organize data enabling multi-tenancy and microservices. |
| Certificate Authentication | ✅ | ✅| Cost | Sets up a secure channel between the application and the Couchbase server. |
| Document Expiry (TTL) | ✅ | ✅  | Cost, Data Integrity | Ensures documents get removed from a collection post expiry set. |
| Model Methods `find()`<br/>`findOne()`<br/>`findOneAndRemove()`| ✅ | 🚫 | Agile Development, Adaptability | Provides methods to easily access documents. |
| Bootstrapping | ✅ | 🚫 | Agile Development, Cost | Establishes the connection, issues command to create scopes, collection and build indexes. |
| Audit Fields (Timestamp) | ✅ | 🚫 | Agile Development | Auto enables auditing of fields. |
| Refdoc Index | ✅ | 🚫 | Data Integrity | Empowers co-existence of non-key unique values. |
| Typescript, Javascript, Generics support | ✅ | ✅ | Adaptability, Cost | Written and supported in Javascript and Typescript. |
| Typescript, Javascript, Generics support | ✅ | ✅ | Adaptability, Cost | Written and supported in Javascript and Typescript. |
| Hooks | ✅ | 🚫 | Agile Development, Data Integrity | Asynchronous middleware components that perform actions before and after a document is mutated. |
| Plugins | ✅ | 🚫 | Agile Development | Reusable components that can be exported and used across multiple schemas. |
| Immutable | ✅ | 🚫 | Agile Development, Data Integrity | Ensures certain data fields remains unchanged. |
| Lean | ✅ | N/A | Agile Development, Cost | Save on resources when data integrity is not a concern. |
| Management API | ✅<br/>(Basic) | ✅  | Agile Development | Improve tests provide basic functions to drop buckets,scopes and collections. |
| Query Builder | ✅ | 🚫 | Agile Development, Adaptability | Build, test and execute N1QL queries via Javascript and Typescript. |
| Bulk Operations | ✅ | 🚫 | Agile Development | Provides means to mutate multiple documents in a single operation. |
| Query | ✅ | ✅ | Agile Development, Data Integrity | Enables document to be accessed via Couchbase N1QL Query. |
| Search | 🚫 | ✅ | N/A | Currently Search is available only via [N1QL Integration](https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/searchfun.html). |
| Analytics | 🚫 | ✅ | N/A | Currently not available in Ottoman V2. |
| Field Level Encryption | 🚫 | ✅ | N/A | Currently not available in Ottoman V2. |
| Subdocument Operations | 🚫 | ✅ | N/A | Currently not available in Ottoman V2. |
| MapReduce Views | 🚫 | ✅ | N/A | Currently not available in Ottoman V2. |
| Transactions | 🚫 | ✅ | N/A | Currently not available in Ottoman V2. |