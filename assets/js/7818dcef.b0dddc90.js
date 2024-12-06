"use strict";(self.webpackChunkottoman_documentation=self.webpackChunkottoman_documentation||[]).push([[1032],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>c});var a=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},l=Object.keys(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=a.createContext({}),u=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},p=function(e){var t=u(e.components);return a.createElement(s.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,l=e.originalType,s=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),m=u(n),c=r,N=m["".concat(s,".").concat(c)]||m[c]||d[c]||l;return n?a.createElement(N,i(i({ref:t},p),{},{components:n})):a.createElement(N,i({ref:t},p))}));function c(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var l=n.length,i=new Array(l);i[0]=m;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o.mdxType="string"==typeof e?e:r,i[1]=o;for(var u=2;u<l;u++)i[u]=n[u];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},8183:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>d,frontMatter:()=>l,metadata:()=>o,toc:()=>u});var a=n(7462),r=(n(7294),n(3905));const l={sidebar_position:6,title:"Query Builder"},i="Query Builder",o={unversionedId:"basic/query-builder",id:"basic/query-builder",title:"Query Builder",description:"Query Builder is a flexible tool designed to create N1QL queries by specifying parameters and methods. Query Builder lets you: create queries of unlimited length and complexity without the need to know the syntax of N1QL Queries.",source:"@site/docs/basic/query-builder.md",sourceDirName:"basic",slug:"/basic/query-builder",permalink:"/docs/basic/query-builder",draft:!1,tags:[],version:"current",sidebarPosition:6,frontMatter:{sidebar_position:6,title:"Query Builder"},sidebar:"tutorialSidebar",previous:{title:"Ottoman Class",permalink:"/docs/basic/ottoman"},next:{title:"Full Text Search",permalink:"/docs/advanced/fts"}},s={},u=[{value:"Using the Query Builder",id:"using-the-query-builder",level:2},{value:"Build a Query by Using Parameters",id:"build-a-query-by-using-parameters",level:3},{value:"Build a Query by Using Access Functions",id:"build-a-query-by-using-access-functions",level:3},{value:"Build a Query by Using Parameters and Function Parameters",id:"build-a-query-by-using-parameters-and-function-parameters",level:3},{value:"Advanced Example of Using the WHERE Clause",id:"advanced-example-of-using-the-where-clause",level:3},{value:"N1QL SELECT Clause Structure",id:"n1ql-select-clause-structure",level:2},{value:"Available Result Expression Arguments",id:"available-result-expression-arguments",level:3},{value:"Available Aggregation Functions",id:"available-aggregation-functions",level:3},{value:"N1QL SELECT Nested Clause Example",id:"n1ql-select-nested-clause-example",level:3},{value:"N1QL WHERE Clause Structure",id:"n1ql-where-clause-structure",level:2},{value:"Available Comparison Operators",id:"available-comparison-operators",level:3},{value:"Available Logical Operators",id:"available-logical-operators",level:3},{value:"Available Collection Operators",id:"available-collection-operators",level:3},{value:"Functional <em>COLLECTION</em> Operators Examples",id:"functional-collection-operators-examples",level:2},{value:"Using Deep Search Operators <em>( NOT IN | WITHIN )</em>",id:"using-deep-search-operators--not-in--within-",level:3},{value:"Using Range Predicate Operators <em>( ANY | EVERY )</em>",id:"using-range-predicate-operators--any--every-",level:3},{value:"Query Builder &amp; Model Find Method",id:"query-builder--model-find-method",level:3},{value:"N1QL JOIN Clause Structure",id:"n1ql-join-clause-structure",level:2},{value:"N1QL GROUP BY Clause Structure",id:"n1ql-group-by-clause-structure",level:2}],p={toc:u};function d(e){let{components:t,...n}=e;return(0,r.kt)("wrapper",(0,a.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"query-builder"},"Query Builder"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/query.html"},"Query Builder")," is a flexible tool designed to create N1QL queries by specifying parameters and methods. Query Builder lets you: create queries of unlimited length and complexity without the need to know the syntax of N1QL Queries."),(0,r.kt)("h2",{id:"using-the-query-builder"},"Using the Query Builder"),(0,r.kt)("p",null,"There are 3 ways to use the Query Builder: by using parameters, by using access functions, or by combining both."),(0,r.kt)("h3",{id:"build-a-query-by-using-parameters"},"Build a Query by Using Parameters"),(0,r.kt)("p",null,"To create queries by using parameters it is mandatory to define in the query constructor the ",(0,r.kt)("a",{parentName:"p",href:"/docs/api/interfaces/iconditionexpr.html#hierarchy"},(0,r.kt)("strong",{parentName:"a"},"parameters"))," of the query and the ",(0,r.kt)("strong",{parentName:"p"},"name")," of the collection."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const params = {\n  select: [\n    {\n      $count: {\n        $field: {\n          name: 'type',\n        },\n        as: 'odm',\n      },\n    },\n  ],\n  let: { amount_val: 10, size_val: 20 },\n  where: {\n    $or: [\n      { price: { $gt: 'amount_val', $isNotNull: true } },\n      { auto: { $gt: 10 } },\n      { amount: 10 }\n    ],\n    $and: [\n      { price2: { $gt: 1.99, $isNotNull: true } },\n      {\n        $or: [\n          { price3: { $gt: 1.99, $isNotNull: true } },\n          { id: '20' }\n        ]\n      },\n      { name: { $eq: 'John', $ignoreCase: true } },\n    ],\n    $any: {\n      $expr: [{ search: { $in: 'address' } }],\n      $satisfies: { search: '10' },\n    },\n    search: { $in: ['address'] },\n  },\n  groupBy: [{ expr: 'type', as: 'sch' }],\n  letting: { amount_v2: 10, size_v2: 20 },\n  having: { type: { $like: '%hotel%' } },\n  orderBy: { type: 'DESC' },\n  limit: 10,\n  offset: 1,\n  use: ['airline_8093', 'airline_8094'],\n};\nconst query = new Query(params, 'travel-sample').build();\nconsole.log(query);\n")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-sql"},'-- N1QL query result:\nSELECT COUNT(type) AS odm\nFROM `travel-sample`._default._default\n USE KEYS ["airline_8093","airline_8094"]\n LET amount_val=10, size_val=20\nWHERE ((price > "amount_val"\n  AND price IS NOT NULL)\n  OR auto > 10\n  OR amount = 10)\n  AND ((price2 > 1.99\n  AND price2 IS NOT NULL)\n  AND ((price3 > 1.99\n    AND price3 IS NOT NULL)\n    OR id = "20")\n  AND (LOWER(name) = LOWER("John")))\n  AND ANY search IN address SATISFIES address = "10" END\n  AND search IN ["address"]\nGROUP BY type AS sch LETTING amount_v2=10, size_v2=20\nHAVING type LIKE "%hotel%"\nORDER BY type DESC\nLIMIT 10 OFFSET 1\n')),(0,r.kt)("h3",{id:"build-a-query-by-using-access-functions"},"Build a Query by Using Access Functions"),(0,r.kt)("p",null,"Creating queries by using the access function is very similar to create them with parameters. The difference is that the parameters are not passed directly to the constructor, instead, they are passed using the different functions available in the Query Class."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const select = [\n  {\n    $count: {\n      $field: { name: 'type' },\n      as: 'odm',\n    },\n  },\n  {\n    $max: {\n      $field: 'amount',\n    },\n  },\n];\nconst letExpr = { amount_val: 10, size_val: 20 };\nconst where = {\n  $or: [\n    { price: { $gt: 'amount_val', $isNotNull: true } },\n    { auto: { $gt: 10 } },\n    { amount: 10 }\n  ],\n  $and: [\n    { price2: { $gt: 1.99, $isNotNull: true } },\n    {\n      $or: [\n        { price3: { $gt: 1.99, $isNotNull: true } },\n        { id: '20' }\n      ]\n    },\n  ],\n};\nconst groupBy = [{ expr: 'type', as: 'sch' }];\nconst having = { type: { $like: '%hotel%' } };\nconst lettingExpr = { amount_v2: 10, size_v2: 20 };\nconst orderBy = { type: 'DESC' };\nconst limit = 10;\nconst offset = 1;\nconst useExpr = ['airline_8093', 'airline_8094'];\n\nconst query = new Query({}, 'collection-name')\n  .select(select)\n  .let(letExpr)\n  .where(where)\n  .groupBy(groupBy)\n  .letting(lettingExpr)\n  .having(having)\n  .orderBy(orderBy)\n  .limit(limit)\n  .offset(offset)\n  .useKeys(useExpr)\n  .build();\nconsole.log(query);\n")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-sql"},"-- N1QL query result:\nSELECT COUNT(type) AS odm, MAX(amount)\nFROM `travel-sample` USE KEYS ['airline_8093','airline_8094']\n  LET amount_val = 10, size_val = 20\nWHERE ((price > amount_val\n  AND price IS NOT NULL)\n  OR auto > 10\n  OR amount = 10)\n  AND ((price2 > 1.99\n  AND price2 IS NOT NULL)\n  AND ((price3 > 1.99\n    AND price3 IS NOT NULL)\n    OR id = '20'))\nGROUP BY type AS sch LETTING amount_v2=10, size_v2=20\nHAVING type LIKE \"%hotel%\"\nORDER BY type = 'DESC'\nLIMIT 10 OFFSET 1\n")),(0,r.kt)("h3",{id:"build-a-query-by-using-parameters-and-function-parameters"},"Build a Query by Using Parameters and Function Parameters"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const select = [{ $field: 'address' }];\nconst query = new Query({ where: { price: { $gt: 5 } } }, 'travel-sample')\n  .select(select)\n  .limit(10)\n  .build();\nconsole.log(query);\n")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-sql"},"-- N1QL query result:\nSELECT address\nFROM `travel-sample`\nWHERE price > 5\nLIMIT 10\n")),(0,r.kt)("h3",{id:"advanced-example-of-using-the-where-clause"},"Advanced Example of Using the WHERE Clause"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const where = {\n  $or: [\n    { address: { $isNull: true } },\n    { free_breakfast: { $isMissing: true } },\n    { free_breakfast: { $isNotValued: true } },\n    { id: { $eq: 8000 } },\n    { id: { $neq: 9000 } },\n    { id: { $gt: 7000 } },\n    { id: { $gte: 6999 } },\n    { id: { $lt: 5000 } },\n    { id: { $lte: 4999 } },\n  ],\n  $and: [\n    { address: { $isNotNull: true } },\n    { address: { $isNotMissing: true } },\n    { address: { $isValued: true } }\n  ],\n  $not: [\n    {\n      address: { $like: '%59%' },\n      name: { $notLike: 'Otto%' },\n      $or: [{ id: { $btw: [1, 2000] } }, { id: { $notBtw: [2001, 8000] } }],\n    },\n    {\n      address: { $like: 'St%', $ignoreCase: true },\n    },\n  ],\n};\nconst query = new Query({}, 'travel-sample')\n  .select()\n  .where(where)\n  .limit(20)\n  .build();\nconsole.log(query);\n")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-sql"},'-- N1QL query result:\nSELECT *\nFROM `travel-sample`\nWHERE (address IS NULL\n  OR free_breakfast IS MISSING\n  OR free_breakfast IS NOT VALUED\n  OR id = 8000\n  OR id != 9000\n  OR id > 7000\n  OR id >= 6999\n  OR id < 5000\n  OR id <= 4999)\n  AND (address IS NOT NULL\n  AND address IS NOT MISSING\n  AND address IS VALUED)\n  AND NOT (address LIKE "%59%"\n  AND name NOT LIKE "Otto%"\n  AND (id BETWEEN 1 AND 2000\n    OR id NOT BETWEEN 2001 AND 8000)\n  AND (LOWER(address) LIKE LOWER("St%")))\nLIMIT 20\n')),(0,r.kt)("p",null,"::: tip Note\nCan also use ",(0,r.kt)("inlineCode",{parentName:"p"},"ignoreCase")," as part of the ",(0,r.kt)("inlineCode",{parentName:"p"},"build")," method, this will always prioritize the ",(0,r.kt)("inlineCode",{parentName:"p"},"$ignoreCase")," value defined in clause"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const expr_where = {\n  $or: [\n    { address: { $like: '%57-59%', $ignoreCase: false } }, // ignoreCase not applied\n    { free_breakfast: true },\n    { name: { $eq: 'John' } } //  ignoreCase applied\n  ],\n};\n/**\n * Can also use:\n * const expr_where = {\n *   $or: [\n *     ...\n *     { name: 'John' } // ignoreCase applied\n *   ],\n * };\n *\n */\nconst query = new Query({}, 'travel-sample');\nconst result = query\n  .select([{ $field: 'address' }])\n  .where(expr_where)\n  .build({ ignoreCase: true }); // ignoreCase enabled for WHERE clause\nconsole.log(result)\n")),(0,r.kt)("p",null,"Would have as output:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-sql"},'-- N1QL query result:\nSELECT address\nFROM `travel-sample`\nWHERE (address LIKE "%57-59%"\n  OR free_breakfast = TRUE\n  OR (LOWER(name) = LOWER("John")));\n')),(0,r.kt)("p",null,":::"),(0,r.kt)("h2",{id:"n1ql-select-clause-structure"},"N1QL SELECT Clause Structure"),(0,r.kt)("p",null,"See definition ",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/query.html#select"},"here")),(0,r.kt)("p",null,"The syntax of a SELECT clause in n1ql is documented ",(0,r.kt)("a",{parentName:"p",href:"https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/select-syntax.html"},"here"),"."),(0,r.kt)("h3",{id:"available-result-expression-arguments"},"Available Result Expression Arguments"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"key"),(0,r.kt)("th",{parentName:"tr",align:null},"value"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$all"),(0,r.kt)("td",{parentName:"tr",align:null},"ALL")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$distinct"),(0,r.kt)("td",{parentName:"tr",align:null},"DISTINCT")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$raw"),(0,r.kt)("td",{parentName:"tr",align:null},"RAW")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$element"),(0,r.kt)("td",{parentName:"tr",align:null},"ELEMENT")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$value"),(0,r.kt)("td",{parentName:"tr",align:null},"VALUE")))),(0,r.kt)("h3",{id:"available-aggregation-functions"},"Available Aggregation Functions"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"key"),(0,r.kt)("th",{parentName:"tr",align:null},"value"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$arrayAgg"),(0,r.kt)("td",{parentName:"tr",align:null},"ARRAY_AGG")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$avg"),(0,r.kt)("td",{parentName:"tr",align:null},"AVG")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$mean"),(0,r.kt)("td",{parentName:"tr",align:null},"MEAN")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$count"),(0,r.kt)("td",{parentName:"tr",align:null},"COUNT")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$countn"),(0,r.kt)("td",{parentName:"tr",align:null},"COUNTN")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$max"),(0,r.kt)("td",{parentName:"tr",align:null},"MAX")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$median"),(0,r.kt)("td",{parentName:"tr",align:null},"MEDIAN")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$min"),(0,r.kt)("td",{parentName:"tr",align:null},"MIN")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$stddev"),(0,r.kt)("td",{parentName:"tr",align:null},"STDDEV")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$stddevPop"),(0,r.kt)("td",{parentName:"tr",align:null},"STDDEV_POP")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$stddevSamp"),(0,r.kt)("td",{parentName:"tr",align:null},"STDDEV_SAMP")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$sum"),(0,r.kt)("td",{parentName:"tr",align:null},"SUM")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$variance"),(0,r.kt)("td",{parentName:"tr",align:null},"VARIANCE")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$variancePop"),(0,r.kt)("td",{parentName:"tr",align:null},"VARIANCE_POP")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$varianceSamp"),(0,r.kt)("td",{parentName:"tr",align:null},"VARIANCE_SAMP")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$varPop"),(0,r.kt)("td",{parentName:"tr",align:null},"VAR_SAMP")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$varSamp"),(0,r.kt)("td",{parentName:"tr",align:null},"VAR_SAMP")))),(0,r.kt)("h3",{id:"n1ql-select-nested-clause-example"},"N1QL SELECT Nested Clause Example"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"const query = new Query({}, 'travel-sample a');\nconst result = query\n  .select([{\n    $field: {\n      name: '{ \"latLon\": { geo.lat, geo.lon } }',\n      as: 'geo'\n    }\n  }])\n  .where({ 'a.type': 'hotel' })\n  .build();\n")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-sql"},'SELECT {"latLon": {geo.lat, geo.lon} } AS geo\nFROM `travel-sample` a\nWHERE a.type = "hotel"\n')),(0,r.kt)("h2",{id:"n1ql-where-clause-structure"},"N1QL WHERE Clause Structure"),(0,r.kt)("p",null,"See definition ",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/query.html#where"},"here")),(0,r.kt)("p",null,"The syntax of a WHERE clause in N1QL is documented ",(0,r.kt)("a",{parentName:"p",href:"https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/where.html"},"here"),"."),(0,r.kt)("h3",{id:"available-comparison-operators"},"Available Comparison Operators"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"key"),(0,r.kt)("th",{parentName:"tr",align:null},"value"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$isNull"),(0,r.kt)("td",{parentName:"tr",align:null},"IS NULL")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$isNotNull"),(0,r.kt)("td",{parentName:"tr",align:null},"IS NOT NULL")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$isMissing"),(0,r.kt)("td",{parentName:"tr",align:null},"IS MISSING")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$isNotMissing"),(0,r.kt)("td",{parentName:"tr",align:null},"IS NOT MISSING")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$isValued"),(0,r.kt)("td",{parentName:"tr",align:null},"IS VALUED")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$isNotValued"),(0,r.kt)("td",{parentName:"tr",align:null},"IS NOT VALUED")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$eq"),(0,r.kt)("td",{parentName:"tr",align:null},"=")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$neq"),(0,r.kt)("td",{parentName:"tr",align:null},"!","=")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$gt"),(0,r.kt)("td",{parentName:"tr",align:null},">")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$gte"),(0,r.kt)("td",{parentName:"tr",align:null},">=")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$lt"),(0,r.kt)("td",{parentName:"tr",align:null},"<")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$lte"),(0,r.kt)("td",{parentName:"tr",align:null},"<=")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$like"),(0,r.kt)("td",{parentName:"tr",align:null},"LIKE")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$notLike"),(0,r.kt)("td",{parentName:"tr",align:null},"NOT LIKE")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$btw"),(0,r.kt)("td",{parentName:"tr",align:null},"BETWEEN")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$notBtw"),(0,r.kt)("td",{parentName:"tr",align:null},"NOT BETWEEN")))),(0,r.kt)("h3",{id:"available-logical-operators"},"Available Logical Operators"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"key"),(0,r.kt)("th",{parentName:"tr",align:null},"value"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$and"),(0,r.kt)("td",{parentName:"tr",align:null},"AND")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$or"),(0,r.kt)("td",{parentName:"tr",align:null},"OR")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$not"),(0,r.kt)("td",{parentName:"tr",align:null},"NOT")))),(0,r.kt)("h3",{id:"available-collection-operators"},"Available Collection Operators"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"key"),(0,r.kt)("th",{parentName:"tr",align:null},"value"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$any"),(0,r.kt)("td",{parentName:"tr",align:null},"ANY")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$every"),(0,r.kt)("td",{parentName:"tr",align:null},"EVERY")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$in"),(0,r.kt)("td",{parentName:"tr",align:null},"IN")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$notIn"),(0,r.kt)("td",{parentName:"tr",align:null},"NOT IN")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$within"),(0,r.kt)("td",{parentName:"tr",align:null},"WITHIN")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$notWithin"),(0,r.kt)("td",{parentName:"tr",align:null},"NOT WITHIN")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$satisfies"),(0,r.kt)("td",{parentName:"tr",align:null},"SATISFIES")))),(0,r.kt)("p",null,"Available String Modifiers:"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"key"),(0,r.kt)("th",{parentName:"tr",align:null},"value"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\\$ignoreCase"),(0,r.kt)("td",{parentName:"tr",align:null},"Boolean")))),(0,r.kt)("h2",{id:"functional-collection-operators-examples"},"Functional ",(0,r.kt)("em",{parentName:"h2"},"COLLECTION")," Operators Examples"),(0,r.kt)("p",null,"Let's take a deeper dive into using various collection operators with Ottoman's Query Builder"),(0,r.kt)("h3",{id:"using-deep-search-operators--not-in--within-"},"Using Deep Search Operators ",(0,r.kt)("em",{parentName:"h3"},"( ","[NOT]"," IN | WITHIN )")),(0,r.kt)("p",null,"The ",(0,r.kt)("a",{parentName:"p",href:"https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/collectionops.html#collection-op-in"},"IN")," operator specifies the search depth to ",(0,r.kt)("em",{parentName:"p"},"include")," ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("em",{parentName:"strong"},"only"))," ",(0,r.kt)("em",{parentName:"p"},"the current level of an array and")," ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("em",{parentName:"strong"},"not"))," ",(0,r.kt)("em",{parentName:"p"},"to include any child or descendant arrays"),". On the other hand the ",(0,r.kt)("a",{parentName:"p",href:"https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/collectionops.html#collection-op-within"},"WITHIN")," operator ",(0,r.kt)("em",{parentName:"p"},"include the current level of an array and")," ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("em",{parentName:"strong"},"all"))," ",(0,r.kt)("em",{parentName:"p"},"of its child and descendant arrays"),"."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"// Defining our where clause\nconst where: LogicalWhereExpr = {\n  type: 'airline',\n  country: { $in: ['United Kingdom', 'France'] },\n  [`\"CORSAIR\"`]: { $within: { $field: 't' } },\n};\nconst query = new Query({}, `travel-sample t`)\n  .select('name,country,id')\n  .where(where)\n  .build();\n")),(0,r.kt)("p",null,"With the above implementation will get this sql query:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-sql"},'SELECT name, country, id\nFROM `travel-sample` t\nWHERE type = "airline"\n  AND country IN ["United Kingdom","France"]\n  AND "CORSAIR" WITHIN t;\n')),(0,r.kt)("p",null,"Now we call to Ottoman instance"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const ottoman = getDefaultInstance();\nawait ottoman.start();\n// Query execution\nconst response = await ottoman.query(query);\nconsole.log(response);\n")),(0,r.kt)("p",null,"Here is the output:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-sh"},"[\n  {\n    country: 'France',\n    id: 1908,\n    name: 'Corsairfly',\n  }\n]\n")),(0,r.kt)("h3",{id:"using-range-predicate-operators--any--every-"},"Using Range Predicate Operators ",(0,r.kt)("em",{parentName:"h3"},"( ANY | EVERY )")),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/collectionops.html#collection-op-any"},"ANY")," is a range predicate that tests a Boolean condition over the elements or attributes of a collection, object, or objects. It uses the ",(0,r.kt)("inlineCode",{parentName:"p"},"IN")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"WITHIN")," operators to range through the collection. If at least one item in the array satisfies the ",(0,r.kt)("inlineCode",{parentName:"p"},"ANY")," expression, then it returns the entire array; otherwise, it returns an empty array. Let's see it in action:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"// Defining our selection\nconst selectExpr = 'airline,airlineid,destinationairport,distance';\n\n// Using LET operator to store some data\nconst letExpr: LetExprType = { destination: ['ATL'] };\n")),(0,r.kt)("p",null,"For ",(0,r.kt)("inlineCode",{parentName:"p"},"ANY")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"EVERY")," in Ottoman we use the operators ",(0,r.kt)("inlineCode",{parentName:"p"},"$expr")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"$satisfies"),":"),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("em",{parentName:"strong"},"$expr:"))," is an array of expressions with the structure: \\\n",(0,r.kt)("inlineCode",{parentName:"p"},"[{ SEARCH_EXPRESSION: { [$in|$within]: TARGET_EXPRESSION } }]")),(0,r.kt)("ul",{parentName:"blockquote"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("em",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"em"},"SEARCH_EXPRESSION")),": A string or expression that evaluates to a string representing the variable name in the ",(0,r.kt)("inlineCode",{parentName:"li"},"ANY | EVERY")," loop."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("em",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"em"},"TARGET_EXPRESSION")),": A string or expression that evaluates to a string representing the array to loop through.")),(0,r.kt)("p",{parentName:"blockquote"},(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("em",{parentName:"strong"},"$satisfies:"))," An expression representing the limiting or matching clause to test against")),(0,r.kt)("p",null,"Now we create the ",(0,r.kt)("inlineCode",{parentName:"p"},"WHERE")," clause including the ",(0,r.kt)("inlineCode",{parentName:"p"},"ANY")," operator:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const whereExpr: LogicalWhereExpr = {\n  type: { $eq: 'route' },\n  $and: [\n    { sourceairport: { $eq: 'ABQ' } },\n    {\n      // Here is where the magic happen\n      $any: {\n        $expr: [\n          { departure: { $in: 'schedule' } },\n          { other: { $within: ['KL', 'AZ'] } }\n        ],\n        $satisfies: {\n          $and: [\n            { 'departure.utc': { $gt: '03:53' } },\n            { other: { $field: 'airline' } }\n          ],\n        },\n      },\n    },\n    { destinationairport: { $in: { $field: 'destination' } } },\n  ],\n};\n\nconst query = new Query({}, 'travel-sample')\n  .select(selectExpr)\n  .let(letExpr)\n  .where(whereExpr)\n  .build();\nconsole.log(query);\n")),(0,r.kt)("p",null,"We will obtain the query:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-sql"},'SELECT airline, airlineid, destinationairport, distance\nFROM `travel-sample`\nLET destination=["ATL"]\nWHERE type = "route"\n  AND (\n    sourceairport = "ABQ"\n    AND ANY departure IN schedule,\n    other WITHIN ["KL","AZ"]\n    SATISFIES (\n        departure.utc > "03:53" AND other = airline\n    ) END\n    AND destinationairport IN destination)\n')),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const ottoman = getDefaultInstance();\nawait ottoman.start();\n\n// After initializing Ottoman we run the query\nconst { rows } = await ottoman.query(query);\nconsole.log(rows);\n")),(0,r.kt)("p",null,"The query output:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-sh"},"[\n  {\n    airline: 'AZ',\n    airlineid: 'airline_596',\n    destinationairport: 'ATL',\n    distance: 2038.3535078909663,\n  },\n  {\n    airline: 'KL',\n    airlineid: 'airline_3090',\n    destinationairport: 'ATL',\n    distance: 2038.3535078909663,\n  },\n]\n")),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/collectionops.html#collection-op-every"},"EVERY")," is very similar to",(0,r.kt)("inlineCode",{parentName:"p"}," ANY")," with the main difference being that all the elements of the array must satisfy the defined condition. Let's see how it works:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"// Changing a little the above where expression definition:\nconst whereExpr: LogicalWhereExpr = {\n  type: { $eq: 'route' },\n  $and: [\n    { airline: { $eq: 'KL' } },\n    { sourceairport: { $like: 'ABQ' } },\n    { destinationairport: { $in: ['ATL'] } },\n    {\n      $every: {\n        $expr: [{ departure: { $in: 'schedule' } }],\n        $satisfies: { 'departure.utc': { $gt: '00:35' } },\n      },\n    },\n  ],\n};\n\n// Building the query\nconst query = new Query({}, 'travel-sample')\n  .select(selectExpr)\n  .where(whereExpr)\n  .build();\nconsole.log(query);\n")),(0,r.kt)("p",null,"The resulting query would be:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-sql"},'SELECT airline, airlineid, destinationairport, distance\nFROM `travel-sample`\nWHERE type = "route"\n  AND (\n    airline = "KL"\n    AND sourceairport LIKE "ABQ"\n    AND destinationairport IN ["ATL"]\n    AND EVERY departure IN schedule SATISFIES departure.utc > "00:35" END\n  );\n')),(0,r.kt)("p",null,"Now let's run the query:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const ottoman = getDefaultInstance();\nawait ottoman.start();\n\nconst { rows } = await ottoman.query(query);\nconsole.log(rows);\n")),(0,r.kt)("p",null,"We would have as a result:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-sh"},"[\n  {\n    airline: 'KL',\n    airlineid: 'airline_3090',\n    destinationairport: 'ATL',\n    distance: 2038.3535078909663,\n  },\n]\n")),(0,r.kt)("h3",{id:"query-builder--model-find-method"},"Query Builder & Model Find Method"),(0,r.kt)("p",null,"Let's start from query:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-sql"},'SELECT country, icao, name\nFROM `travel-sample`\nWHERE type = "airline"\n  AND (country IN ["United Kingdom","France"])\n  AND callsign IS NOT NULL\n  AND ANY description WITHIN ["EU"] SATISFIES icao\n  LIKE "%" || description END\nLIMIT 2\n')),(0,r.kt)("p",null,"Using Model find method"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"// Defining our SCHEMA\nconst airlineSchema = new Schema({\n  callsign: String,\n  country: String,\n  iata: String,\n  icao: String,\n  id: Number,\n  name: String,\n  type: String,\n});\n\n// Model Airline creation\nconst Airline = model('airline', airlineSchema, { modelKey: 'type' });\n\n//Start Ottoman instance\nconst ottoman = getDefaultInstance();\nawait ottoman.start();\n\n// Our find method with a filter and options definitions\nconst response = await Airline.find(\n  {\n    type: 'airline',\n    $and: [{ country: { $in: ['United Kingdom', 'France'] } }],\n    callsign: { $isNotNull: true },\n    $any: {\n      $expr: [{ description: { $within: ['EU'] } }],\n      $satisfies: { icao: { $like: { $field: '\"%\"||description' } } },\n    },\n  },\n  { limit: 2, select: 'country,icao,name', lean: true },\n);\n// Print output\nconsole.log(response.rows);\n")),(0,r.kt)("p",null,"Via Query Builder"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"// Defining our query\nconst query = new Query({ select: 'country,icao,name' }, 'travel-sample')\n  .where({\n    type: 'airline',\n    $and: [{ country: { $in: ['United Kingdom', 'France'] } }],\n    callsign: { $isNotNull: true },\n    $any: {\n      $expr: [{ description: { $within: ['EU'] } }],\n      $satisfies: { icao: { $like: { $field: '\"%\"||description' } } },\n    },\n  })\n  .limit(2)\n  .build();\n\n//Start Ottoman instance\nconst ottoman = getDefaultInstance();\nawait ottoman.start();\n\n// Runing query\nconst response = await ottoman.query(query);\n\n// Print output\nconsole.log(response.rows);\n")),(0,r.kt)("p",null,"For above examples we get this output:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-sh"},"[\n  {\n    country: 'United Kingdom',\n    icao: 'AEU',\n    name: 'Astraeus'\n  },\n  {\n    country: 'France',\n    icao: 'REU',\n    name: 'Air Austral'\n  },\n]\n")),(0,r.kt)("h2",{id:"n1ql-join-clause-structure"},"N1QL JOIN Clause Structure"),(0,r.kt)("p",null,"Notice: Currently the JOIN clause is only supported in string format."),(0,r.kt)("p",null,"See definition ",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/query.html#plainJoin"},"here")),(0,r.kt)("p",null,"The syntax of a JOIN clause in n1ql is documented ",(0,r.kt)("a",{parentName:"p",href:"https://docs.couchbase.com/server/6.5/n1ql/n1ql-language-reference/join.html"},"here"),"."),(0,r.kt)("h2",{id:"n1ql-group-by-clause-structure"},"N1QL GROUP BY Clause Structure"),(0,r.kt)("p",null,"See definition ",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/query.html#groupby"},"here")),(0,r.kt)("p",null,"The syntax of a GROUP BY clause in n1ql is documented ",(0,r.kt)("a",{parentName:"p",href:"https://docs.couchbase.com/server/6.5/n1ql/n1ql-language-reference/groupby.html"},"here"),"."))}d.isMDXComponent=!0}}]);