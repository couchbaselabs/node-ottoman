"use strict";(self.webpackChunkottoman_documentation=self.webpackChunkottoman_documentation||[]).push([[6705],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>m});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=a.createContext({}),u=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},c=function(e){var t=u(e.components);return a.createElement(s.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},d=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),d=u(n),m=r,f=d["".concat(s,".").concat(m)]||d[m]||p[m]||o;return n?a.createElement(f,i(i({ref:t},c),{},{components:n})):a.createElement(f,i({ref:t},c))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,i=new Array(o);i[0]=d;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:r,i[1]=l;for(var u=2;u<o;u++)i[u]=n[u];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},85118:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>p,frontMatter:()=>o,metadata:()=>l,toc:()=>u});var a=n(87462),r=(n(67294),n(3905));const o={id:"Couchbase.MutationResult",title:"Class: MutationResult",sidebar_label:"MutationResult",custom_edit_url:null},i=void 0,l={unversionedId:"api/classes/Couchbase.MutationResult",id:"api/classes/Couchbase.MutationResult",title:"Class: MutationResult",description:"Couchbase.MutationResult",source:"@site/docs/api/classes/Couchbase.MutationResult.md",sourceDirName:"api/classes",slug:"/api/classes/Couchbase.MutationResult",permalink:"/docs/api/classes/Couchbase.MutationResult",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"Couchbase.MutationResult",title:"Class: MutationResult",sidebar_label:"MutationResult",custom_edit_url:null},sidebar:"tutorialSidebar",previous:{title:"MutationLostError",permalink:"/docs/api/classes/Couchbase.MutationLostError"},next:{title:"MutationState",permalink:"/docs/api/classes/Couchbase.MutationState"}},s={},u=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"cas",id:"cas",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"token",id:"token",level:3},{value:"Defined in",id:"defined-in-2",level:4}],c={toc:u};function p(e){let{components:t,...n}=e;return(0,r.kt)("wrapper",(0,a.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/namespaces/Couchbase"},"Couchbase"),".MutationResult"),(0,r.kt)("p",null,"Contains the results of a mutate-in operation."),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new MutationResult"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"data"),")"),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"data")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/docs/api/classes/Couchbase.MutationResult"},(0,r.kt)("inlineCode",{parentName:"a"},"MutationResult")))))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/crudoptypes.d.ts:81"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"cas"},"cas"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"cas"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"any")),(0,r.kt)("p",null,"The updated CAS for the document."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/crudoptypes.d.ts:73"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"token"},"token"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"token"),": ",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.MutationToken"},(0,r.kt)("inlineCode",{parentName:"a"},"MutationToken"))),(0,r.kt)("p",null,"The token representing the mutation performed."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/crudoptypes.d.ts:77"))}p.isMDXComponent=!0}}]);