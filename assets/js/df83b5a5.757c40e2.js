"use strict";(self.webpackChunkottoman_documentation=self.webpackChunkottoman_documentation||[]).push([[25],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>k});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var l=a.createContext({}),d=function(e){var t=a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},s=function(e){var t=d(e.components);return a.createElement(l.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,l=e.parentName,s=p(e,["components","mdxType","originalType","parentName"]),u=d(n),k=r,m=u["".concat(l,".").concat(k)]||u[k]||c[k]||o;return n?a.createElement(m,i(i({ref:t},s),{},{components:n})):a.createElement(m,i({ref:t},s))}));function k(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,i=new Array(o);i[0]=u;var p={};for(var l in t)hasOwnProperty.call(t,l)&&(p[l]=t[l]);p.originalType=e,p.mdxType="string"==typeof e?e:r,i[1]=p;for(var d=2;d<o;d++)i[d]=n[d];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}u.displayName="MDXCreateElement"},3185:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>i,default:()=>c,frontMatter:()=>o,metadata:()=>p,toc:()=>d});var a=n(87462),r=(n(67294),n(3905));const o={id:"Couchbase.LookupInSpec",title:"Class: LookupInSpec",sidebar_label:"LookupInSpec",custom_edit_url:null},i=void 0,p={unversionedId:"api/classes/Couchbase.LookupInSpec",id:"api/classes/Couchbase.LookupInSpec",title:"Class: LookupInSpec",description:"Couchbase.LookupInSpec",source:"@site/docs/api/classes/Couchbase.LookupInSpec.md",sourceDirName:"api/classes",slug:"/api/classes/Couchbase.LookupInSpec",permalink:"/docs/api/classes/Couchbase.LookupInSpec",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"Couchbase.LookupInSpec",title:"Class: LookupInSpec",sidebar_label:"LookupInSpec",custom_edit_url:null},sidebar:"tutorialSidebar",previous:{title:"LookupInResultEntry",permalink:"/docs/api/classes/Couchbase.LookupInResultEntry"},next:{title:"MatchAllSearchQuery",permalink:"/docs/api/classes/Couchbase.MatchAllSearchQuery"}},l={},d=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"_flags",id:"_flags",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"_op",id:"_op",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"_path",id:"_path",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"_create",id:"_create",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"Accessors",id:"accessors",level:2},{value:"Expiry",id:"expiry",level:3},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"Methods",id:"methods",level:2},{value:"count",id:"count",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"exists",id:"exists",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"get",id:"get",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-8",level:4}],s={toc:d};function c(e){let{components:t,...n}=e;return(0,r.kt)("wrapper",(0,a.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/namespaces/Couchbase"},"Couchbase"),".LookupInSpec"),(0,r.kt)("p",null,"Represents a sub-operation to perform within a lookup-in operation."),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"new LookupInSpec"),"()"),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/sdspecs.d.ts:99"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"_flags"},"_","flags"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"_","flags"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"CppSdSpecFlag")),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/sdspecs.d.ts:98"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"_op"},"_","op"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"_","op"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"CppSdCmdType")),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/sdspecs.d.ts:90"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"_path"},"_","path"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"_","path"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/sdspecs.d.ts:94"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"_create"},"_","create"),(0,r.kt)("p",null,"\u25aa ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"_","create"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"any")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/sdspecs.d.ts:100"),(0,r.kt)("h2",{id:"accessors"},"Accessors"),(0,r.kt)("h3",{id:"expiry"},"Expiry"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("inlineCode",{parentName:"p"},"get")," ",(0,r.kt)("strong",{parentName:"p"},"Expiry"),"(): ",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.LookupInMacro"},(0,r.kt)("inlineCode",{parentName:"a"},"LookupInMacro"))),(0,r.kt)("p",null,"BUG(JSCBC-756): Previously provided access to the expiry macro for a\nlookup-in operation."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Deprecated"))),(0,r.kt)("p",null,"Use ",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.LookupInMacro#expiry"},"Expiry")," instead."),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.LookupInMacro"},(0,r.kt)("inlineCode",{parentName:"a"},"LookupInMacro"))),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/sdspecs.d.ts:86"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"count"},"count"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("strong",{parentName:"p"},"count"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"path"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"options?"),"): ",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.LookupInSpec"},(0,r.kt)("inlineCode",{parentName:"a"},"LookupInSpec"))),(0,r.kt)("p",null,"Returns the number of elements in the array reference by the path."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"path")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string")," ","|"," ",(0,r.kt)("a",{parentName:"td",href:"/docs/api/classes/Couchbase.LookupInMacro"},(0,r.kt)("inlineCode",{parentName:"a"},"LookupInMacro"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The path to the field.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"options?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Object")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Optional parameters for this operation.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"options.xattr?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether this operation should reference the document body or the extended attributes data for the document.")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.LookupInSpec"},(0,r.kt)("inlineCode",{parentName:"a"},"LookupInSpec"))),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/sdspecs.d.ts:134"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"exists"},"exists"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("strong",{parentName:"p"},"exists"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"path"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"options?"),"): ",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.LookupInSpec"},(0,r.kt)("inlineCode",{parentName:"a"},"LookupInSpec"))),(0,r.kt)("p",null,"Returns whether a specific field exists in the document."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"path")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string")," ","|"," ",(0,r.kt)("a",{parentName:"td",href:"/docs/api/classes/Couchbase.LookupInMacro"},(0,r.kt)("inlineCode",{parentName:"a"},"LookupInMacro"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The path to the field.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"options?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Object")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Optional parameters for this operation.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"options.xattr?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether this operation should reference the document body or the extended attributes data for the document.")))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.LookupInSpec"},(0,r.kt)("inlineCode",{parentName:"a"},"LookupInSpec"))),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/sdspecs.d.ts:122"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"get"},"get"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("strong",{parentName:"p"},"get"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"path"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"options?"),"): ",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.LookupInSpec"},(0,r.kt)("inlineCode",{parentName:"a"},"LookupInSpec"))),(0,r.kt)("p",null,"Creates a LookupInSpec for fetching a field from the document."),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"path")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string")," ","|"," ",(0,r.kt)("a",{parentName:"td",href:"/docs/api/classes/Couchbase.LookupInMacro"},(0,r.kt)("inlineCode",{parentName:"a"},"LookupInMacro"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The path to the field.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"options?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Object")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Optional parameters for this operation.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"options.xattr?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"boolean")),(0,r.kt)("td",{parentName:"tr",align:"left"},"Whether this operation should reference the document body or the extended attributes data for the document.")))),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.LookupInSpec"},(0,r.kt)("inlineCode",{parentName:"a"},"LookupInSpec"))),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/sdspecs.d.ts:110"))}c.isMDXComponent=!0}}]);