"use strict";(self.webpackChunkottoman_documentation=self.webpackChunkottoman_documentation||[]).push([[8498],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>m});var i=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},r=Object.keys(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var o=i.createContext({}),u=function(e){var t=i.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=u(e.components);return i.createElement(o.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},p=i.forwardRef((function(e,t){var n=e.components,a=e.mdxType,r=e.originalType,o=e.parentName,s=d(e,["components","mdxType","originalType","parentName"]),p=u(n),m=a,k=p["".concat(o,".").concat(m)]||p[m]||c[m]||r;return n?i.createElement(k,l(l({ref:t},s),{},{components:n})):i.createElement(k,l({ref:t},s))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var r=n.length,l=new Array(r);l[0]=p;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d.mdxType="string"==typeof e?e:a,l[1]=d;for(var u=2;u<r;u++)l[u]=n[u];return i.createElement.apply(null,l)}return i.createElement.apply(null,n)}p.displayName="MDXCreateElement"},88353:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>c,frontMatter:()=>r,metadata:()=>d,toc:()=>u});var i=n(87462),a=(n(67294),n(3905));const r={id:"Couchbase.ICreateBucketSettings",title:"Interface: ICreateBucketSettings",sidebar_label:"ICreateBucketSettings",custom_edit_url:null},l=void 0,d={unversionedId:"api/interfaces/Couchbase.ICreateBucketSettings",id:"api/interfaces/Couchbase.ICreateBucketSettings",title:"Interface: ICreateBucketSettings",description:"Couchbase.ICreateBucketSettings",source:"@site/docs/api/interfaces/Couchbase.ICreateBucketSettings.md",sourceDirName:"api/interfaces",slug:"/api/interfaces/Couchbase.ICreateBucketSettings",permalink:"/docs/api/interfaces/Couchbase.ICreateBucketSettings",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"Couchbase.ICreateBucketSettings",title:"Interface: ICreateBucketSettings",sidebar_label:"ICreateBucketSettings",custom_edit_url:null},sidebar:"tutorialSidebar",previous:{title:"ICouchbaseRemoteAnalyticsLink",permalink:"/docs/api/interfaces/Couchbase.ICouchbaseRemoteAnalyticsLink"},next:{title:"IGroup",permalink:"/docs/api/interfaces/Couchbase.IGroup"}},o={},u=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"bucketType",id:"buckettype",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"compressionMode",id:"compressionmode",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"conflictResolutionType",id:"conflictresolutiontype",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"durabilityMinLevel",id:"durabilityminlevel",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"ejectionMethod",id:"ejectionmethod",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"evictionPolicy",id:"evictionpolicy",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"flushEnabled",id:"flushenabled",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"maxExpiry",id:"maxexpiry",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"maxTTL",id:"maxttl",level:3},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"minimumDurabilityLevel",id:"minimumdurabilitylevel",level:3},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"name",id:"name",level:3},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"numReplicas",id:"numreplicas",level:3},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"ramQuotaMB",id:"ramquotamb",level:3},{value:"Inherited from",id:"inherited-from-11",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"replicaIndexes",id:"replicaindexes",level:3},{value:"Inherited from",id:"inherited-from-12",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"storageBackend",id:"storagebackend",level:3},{value:"Inherited from",id:"inherited-from-13",level:4},{value:"Defined in",id:"defined-in-14",level:4}],s={toc:u};function c(e){let{components:t,...n}=e;return(0,a.kt)("wrapper",(0,i.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/docs/api/namespaces/Couchbase"},"Couchbase"),".ICreateBucketSettings"),(0,a.kt)("p",null,"Specifies a number of settings which can be set when creating a bucket."),(0,a.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("p",{parentName:"li"},(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings"},(0,a.kt)("inlineCode",{parentName:"a"},"IBucketSettings"))),(0,a.kt)("p",{parentName:"li"},"\u21b3 ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"ICreateBucketSettings"))))),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"buckettype"},"bucketType"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"bucketType"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"Specifies the type of bucket that should be used."),(0,a.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings"},"IBucketSettings"),".",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings#buckettype"},"bucketType")),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/bucketmanager.d.ts:141"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"compressionmode"},"compressionMode"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"compressionMode"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"Specifies the compression mode that should be used."),(0,a.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings"},"IBucketSettings"),".",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings#compressionmode"},"compressionMode")),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/bucketmanager.d.ts:159"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"conflictresolutiontype"},"conflictResolutionType"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"conflictResolutionType"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"Specifies the conflict resolution mode to use for XDCR of this bucket."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/bucketmanager.d.ts:284"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"durabilityminlevel"},"durabilityMinLevel"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"durabilityMinLevel"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"Same as ",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings#minimumdurabilitylevel"},"minimumDurabilityLevel"),", but represented as\nthe raw server-side configuration string."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Deprecated"))),(0,a.kt)("p",null,"Use ",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings#minimumdurabilitylevel"},"minimumDurabilityLevel")," instead."),(0,a.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings"},"IBucketSettings"),".",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings#durabilityminlevel"},"durabilityMinLevel")),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/bucketmanager.d.ts:177"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"ejectionmethod"},"ejectionMethod"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"ejectionMethod"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"Same as ",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings#evictionpolicy"},"evictionPolicy"),", but represented as\nthe raw server-side configuration string."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Deprecated"))),(0,a.kt)("p",null,"Use ",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings#evictionpolicy"},"evictionPolicy")," instead."),(0,a.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings"},"IBucketSettings"),".",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings#ejectionmethod"},"ejectionMethod")),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/bucketmanager.d.ts:184"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"evictionpolicy"},"evictionPolicy"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"evictionPolicy"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"Specifies the ejection method that should be used."),(0,a.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings"},"IBucketSettings"),".",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings#evictionpolicy"},"evictionPolicy")),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/bucketmanager.d.ts:149"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"flushenabled"},"flushEnabled"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"flushEnabled"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"Whether the flush operation (truncating all data in the bucket) should\nbe enabled."),(0,a.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings"},"IBucketSettings"),".",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings#flushenabled"},"flushEnabled")),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/bucketmanager.d.ts:124"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"maxexpiry"},"maxExpiry"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"maxExpiry"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Specifies the maximum expiry time that any document should be permitted\nto have.  Any documents stored with an expiry configured higher than this\nwill be forced to this number."),(0,a.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings"},"IBucketSettings"),".",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings#maxexpiry"},"maxExpiry")),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/bucketmanager.d.ts:155"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"maxttl"},"maxTTL"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"maxTTL"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Same as ",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings#maxexpiry"},"maxExpiry"),"."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"Deprecated"))),(0,a.kt)("p",null,"Use ",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings#maxexpiry"},"maxExpiry")," instead."),(0,a.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings"},"IBucketSettings"),".",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings#maxttl"},"maxTTL")),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/bucketmanager.d.ts:170"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"minimumdurabilitylevel"},"minimumDurabilityLevel"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"minimumDurabilityLevel"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,a.kt)("a",{parentName:"p",href:"/docs/api/enums/Couchbase.DurabilityLevel"},(0,a.kt)("inlineCode",{parentName:"a"},"DurabilityLevel"))),(0,a.kt)("p",null,"Specifies the minimum durability level that should be used for any write\noperations which are performed against this bucket."),(0,a.kt)("h4",{id:"inherited-from-8"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings"},"IBucketSettings"),".",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings#minimumdurabilitylevel"},"minimumDurabilityLevel")),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/bucketmanager.d.ts:164"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"name"},"name"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"name"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"The name of the bucket."),(0,a.kt)("h4",{id:"inherited-from-9"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings"},"IBucketSettings"),".",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings#name"},"name")),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/bucketmanager.d.ts:119"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"numreplicas"},"numReplicas"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"numReplicas"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The number of replicas that should exist for this bucket."),(0,a.kt)("h4",{id:"inherited-from-10"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings"},"IBucketSettings"),".",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings#numreplicas"},"numReplicas")),(0,a.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/bucketmanager.d.ts:133"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"ramquotamb"},"ramQuotaMB"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"ramQuotaMB"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The amount of RAM which should be allocated to this bucket, expressed in\nmegabytes."),(0,a.kt)("h4",{id:"inherited-from-11"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings"},"IBucketSettings"),".",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings#ramquotamb"},"ramQuotaMB")),(0,a.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/bucketmanager.d.ts:129"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"replicaindexes"},"replicaIndexes"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"replicaIndexes"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"Whether the indexes on this bucket should be replicated."),(0,a.kt)("h4",{id:"inherited-from-12"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings"},"IBucketSettings"),".",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings#replicaindexes"},"replicaIndexes")),(0,a.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/bucketmanager.d.ts:137"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"storagebackend"},"storageBackend"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"storageBackend"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"Specifies the storage backend to use for the bucket."),(0,a.kt)("h4",{id:"inherited-from-13"},"Inherited from"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings"},"IBucketSettings"),".",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.IBucketSettings#storagebackend"},"storageBackend")),(0,a.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/bucketmanager.d.ts:145"))}c.isMDXComponent=!0}}]);