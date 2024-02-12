# Ottoman Vs SDK Comparison

This document outlines subtle differences between Ottoman and Node.js SDK
and also demonstrate the value proposition (advantages) that Ottoman brings over Node.js SDK.

## Value Proposition (Benefits)

### Data Quality
Defining structure to data, validating data and enforcing constraints using lightweight code patterns.

### Affordability

Open Source, secure, fully supported, less maintenance overhead, less infrastructure Affordability, extensible and can work with any Javascript or Typescript native application.

### Agility

Be a leader in your space, build and deliver applications quickly and timely. Spend your time solving business problems rather than coding.

### Adaptability

Don't need specialized skills, all you need is to know JavaScript or TypeScript and you are good to go.

### Supportability and Sustainability

Leave the burden of scanning and patching the software for security vulnerabilities on us. Get constant software updates to align with server releases and get full support from our support team and large developer community.


Affordability, Adaptability, Supportability and Sustainability are available by default across all features in Ottoman.

| Feature    | Ottoman     | NodeJS SDK  | Benefits                   | Description                                                                                     |
| ---------- | :---------: | :---------: |----------------------------|-------------------------------------------------------------------------------------------------|
| Schema, Constraints and Models | ✅ | 🚫 | Data Quality               | Enables end users to control document shape.                                                    |
| Validators and Custom Data-Type | ✅ | 🚫 | Data Quality               | Ensures data accuracy.                                                                          |
| Reference Types and Populate | ✅ | 🚫 | Data Quality               | Provides means to automagically refer and populate referenced documents.                        |
| Scopes and collections | ✅ | ✅ | Data Quality               | Organize data enabling multi-tenancy and microservices.                                         |
| Certificate Authentication | ✅ | ✅| Data Quality               | Sets up a secure channel between the application and the Couchbase server.                      |
| Document Expiry (TTL) | ✅ | ✅  | Data Quality               | Ensures documents get removed from a collection post expiry set.                                |
| Model Methods <br/>`find()`<br/>`findOne()`<br/>`findOneAndRemove()`| ✅ | 🚫 | Agility                    | Provides methods to easily access documents.                                                    |
| Bootstrapping | ✅ | 🚫 | Agility                    | Establishes the connection, issues command to create scopes, collection and build indexes.      |
| Audit Fields (Timestamp) | ✅ | 🚫 | Agility                    | Auto enables auditing of fields.                                                                |
| Refdoc Index | ✅ | 🚫 | Data Quality               | Empowers co-existence of non-key unique values.                                                 |
| Typescript, Javascript, Generics support | ✅ | ✅ | Adaptability, Affordability | Written and supported in Javascript and Typescript.                                             |
| Hooks | ✅ | 🚫 | Agility, Data Quality      | Asynchronous middleware components that perform actions before and after a document is mutated. |
| Plugins | ✅ | 🚫 | Agility                    | Reusable components that can be exported and used across multiple schemas.                      |
| Immutable | ✅ | 🚫 | Agility, Data Quality      | Ensures certain data fields remains unchanged.                                                  |
| Lean | ✅ | N/A | Agility, Affordability     | Save on resources when data Quality is not a concern.                                           |
| Management API | ✅<br/>(Basic) | ✅  | Agility                    | Improve tests provide basic functions to drop buckets,scopes and collections.                   |
| Query Builder | ✅ | 🚫 | Agility                    | Build, test and execute N1QL queries via Javascript and Typescript.                             |
| Bulk Operations | ✅ | 🚫 | Agility                    | Provides means to mutate multiple documents in a single operation.                              |
| Query | ✅ | ✅ | Agility, Data Quality      | Enables document to be accessed via Couchbase N1QL Query.                                       |
| Search | ✅ | ✅ | Agility                | Allow full-text-search                                                                          |
| Analytics | 🚫 | ✅ | N/A                        | Currently not available in Ottoman 2.0.                                                         |
| Field Level Encryption | 🚫 | ✅ | N/A                        | Currently not available in Ottoman 2.0.                                                         |
| Subdocument Operations | 🚫 | ✅ | N/A                        | Currently not available in Ottoman 2.0.                                                         |
| MapReduce Views | 🚫 | ✅ | N/A                        | Currently not available in Ottoman 2.0.                                                         |
| Transactions | ✅ | ✅ | ACID                       | perform multi-document ACID (atomic, consistent, isolated, and durable) database transactions   |