"use strict";(self.webpackChunkottoman_documentation=self.webpackChunkottoman_documentation||[]).push([[5393],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>m});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var l=a.createContext({}),p=function(e){var t=a.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},c=function(e){var t=p(e.components);return a.createElement(l.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,l=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),u=p(r),m=n,h=u["".concat(l,".").concat(m)]||u[m]||d[m]||i;return r?a.createElement(h,o(o({ref:t},c),{},{components:r})):a.createElement(h,o({ref:t},c))}));function m(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,o=new Array(i);o[0]=u;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:n,o[1]=s;for(var p=2;p<i;p++)o[p]=r[p];return a.createElement.apply(null,o)}return a.createElement.apply(null,r)}u.displayName="MDXCreateElement"},1950:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>d,frontMatter:()=>i,metadata:()=>s,toc:()=>p});var a=r(87462),n=(r(67294),r(3905));const i={id:"Couchbase.ThresholdLoggingTracer",title:"Class: ThresholdLoggingTracer",sidebar_label:"ThresholdLoggingTracer",custom_edit_url:null},o=void 0,s={unversionedId:"api/classes/Couchbase.ThresholdLoggingTracer",id:"api/classes/Couchbase.ThresholdLoggingTracer",title:"Class: ThresholdLoggingTracer",description:"Couchbase.ThresholdLoggingTracer",source:"@site/docs/api/classes/Couchbase.ThresholdLoggingTracer.md",sourceDirName:"api/classes",slug:"/api/classes/Couchbase.ThresholdLoggingTracer",permalink:"/docs/api/classes/Couchbase.ThresholdLoggingTracer",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"Couchbase.ThresholdLoggingTracer",title:"Class: ThresholdLoggingTracer",sidebar_label:"ThresholdLoggingTracer",custom_edit_url:null},sidebar:"tutorialSidebar",previous:{title:"TermSearchQuery",permalink:"/docs/api/classes/Couchbase.TermSearchQuery"},next:{title:"TimeoutError",permalink:"/docs/api/classes/Couchbase.TimeoutError"}},l={},p=[{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"_options",id:"_options",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"Methods",id:"methods",level:2},{value:"requestSpan",id:"requestspan",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns",level:4},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-2",level:4}],c={toc:p};function d(e){let{components:t,...r}=e;return(0,n.kt)("wrapper",(0,a.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/docs/api/namespaces/Couchbase"},"Couchbase"),".ThresholdLoggingTracer"),(0,n.kt)("p",null,"This implements a basic default tracer which keeps track of operations\nwhich falls outside a specified threshold.  Note that to reduce the\nperformance impact of using this tracer, this class is not actually\nused by the SDK, and simply acts as a placeholder which triggers a\nnative implementation to be used instead."),(0,n.kt)("h2",{id:"implements"},"Implements"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",{parentName:"li",href:"/docs/api/interfaces/Couchbase.RequestTracer"},(0,n.kt)("inlineCode",{parentName:"a"},"RequestTracer")))),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new ThresholdLoggingTracer"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"options"),")"),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"options")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/docs/api/interfaces/Couchbase.ThresholdLoggingTracerOptions"},(0,n.kt)("inlineCode",{parentName:"a"},"ThresholdLoggingTracerOptions")))))),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"node_modules/couchbase/dist/tracing.d.ts:78"),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"_options"},"_","options"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"_","options"),": ",(0,n.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.ThresholdLoggingTracerOptions"},(0,n.kt)("inlineCode",{parentName:"a"},"ThresholdLoggingTracerOptions"))),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"node_modules/couchbase/dist/tracing.d.ts:77"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"requestspan"},"requestSpan"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"requestSpan"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"name"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"parent"),"): ",(0,n.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.RequestSpan"},(0,n.kt)("inlineCode",{parentName:"a"},"RequestSpan"))),(0,n.kt)("h4",{id:"parameters-1"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"name")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"string"))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"parent")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"undefined")," ","|"," ",(0,n.kt)("a",{parentName:"td",href:"/docs/api/interfaces/Couchbase.RequestSpan"},(0,n.kt)("inlineCode",{parentName:"a"},"RequestSpan")))))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.RequestSpan"},(0,n.kt)("inlineCode",{parentName:"a"},"RequestSpan"))),(0,n.kt)("h4",{id:"implementation-of"},"Implementation of"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.RequestTracer"},"RequestTracer"),".",(0,n.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.RequestTracer#requestspan"},"requestSpan")),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"node_modules/couchbase/dist/tracing.d.ts:82"))}d.isMDXComponent=!0}}]);