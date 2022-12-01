"use strict";(self.webpackChunkottoman_documentation=self.webpackChunkottoman_documentation||[]).push([[8531],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>f});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=i.createContext({}),p=function(e){var t=i.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},d=function(e){var t=p(e.components);return i.createElement(s.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},c=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,s=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),c=p(n),f=r,m=c["".concat(s,".").concat(f)]||c[f]||u[f]||a;return n?i.createElement(m,o(o({ref:t},d),{},{components:n})):i.createElement(m,o({ref:t},d))}));function f(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,o=new Array(a);o[0]=c;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:r,o[1]=l;for(var p=2;p<a;p++)o[p]=n[p];return i.createElement.apply(null,o)}return i.createElement.apply(null,n)}c.displayName="MDXCreateElement"},27871:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>u,frontMatter:()=>a,metadata:()=>l,toc:()=>p});var i=n(87462),r=(n(67294),n(3905));const a={id:"Couchbase.InsertOptions",title:"Interface: InsertOptions",sidebar_label:"InsertOptions",custom_edit_url:null},o=void 0,l={unversionedId:"api/interfaces/Couchbase.InsertOptions",id:"api/interfaces/Couchbase.InsertOptions",title:"Interface: InsertOptions",description:"Couchbase.InsertOptions",source:"@site/docs/api/interfaces/Couchbase.InsertOptions.md",sourceDirName:"api/interfaces",slug:"/api/interfaces/Couchbase.InsertOptions",permalink:"/docs/api/interfaces/Couchbase.InsertOptions",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"Couchbase.InsertOptions",title:"Interface: InsertOptions",sidebar_label:"InsertOptions",custom_edit_url:null},sidebar:"tutorialSidebar",previous:{title:"IncrementOptions",permalink:"/docs/api/interfaces/Couchbase.IncrementOptions"},next:{title:"LogData",permalink:"/docs/api/interfaces/Couchbase.LogData"}},s={},p=[{value:"Properties",id:"properties",level:2},{value:"durabilityLevel",id:"durabilitylevel",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"durabilityPersistTo",id:"durabilitypersistto",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"durabilityReplicateTo",id:"durabilityreplicateto",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"expiry",id:"expiry",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"parentSpan",id:"parentspan",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"timeout",id:"timeout",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"transcoder",id:"transcoder",level:3},{value:"Defined in",id:"defined-in-6",level:4}],d={toc:p};function u(e){let{components:t,...n}=e;return(0,r.kt)("wrapper",(0,i.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/namespaces/Couchbase"},"Couchbase"),".InsertOptions"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"durabilitylevel"},"durabilityLevel"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"durabilityLevel"),": ",(0,r.kt)("a",{parentName:"p",href:"/docs/api/enums/Couchbase.DurabilityLevel"},(0,r.kt)("inlineCode",{parentName:"a"},"DurabilityLevel"))),(0,r.kt)("p",null,"Specifies the level of synchronous durability for this operation."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/collection.d.ts:64"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"durabilitypersistto"},"durabilityPersistTo"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"durabilityPersistTo"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Specifies the number of nodes this operation should be persisted to\nbefore it is considered successful.  Note that this option is mutually\nexclusive of ",(0,r.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.InsertOptions#durabilitylevel"},"durabilityLevel"),"."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/collection.d.ts:70"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"durabilityreplicateto"},"durabilityReplicateTo"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"durabilityReplicateTo"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Specifies the number of nodes this operation should be replicated to\nbefore it is considered successful.  Note that this option is mutually\nexclusive of ",(0,r.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.InsertOptions#durabilitylevel"},"durabilityLevel"),"."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/collection.d.ts:76"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"expiry"},"expiry"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"expiry"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Specifies the expiry time for this document, specified in seconds."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/collection.d.ts:60"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"parentspan"},"parentSpan"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"parentSpan"),": ",(0,r.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.RequestSpan"},(0,r.kt)("inlineCode",{parentName:"a"},"RequestSpan"))),(0,r.kt)("p",null,"The parent tracing span that this operation will be part of."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/collection.d.ts:84"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"timeout"},"timeout"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"timeout"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The timeout for this operation, represented in milliseconds."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/collection.d.ts:88"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"transcoder"},"transcoder"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"transcoder"),": ",(0,r.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.Transcoder"},(0,r.kt)("inlineCode",{parentName:"a"},"Transcoder"))),(0,r.kt)("p",null,"Specifies an explicit transcoder to use for this specific operation."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/collection.d.ts:80"))}u.isMDXComponent=!0}}]);