"use strict";(self.webpackChunkottoman_documentation=self.webpackChunkottoman_documentation||[]).push([[7113],{3905:(e,n,t)=>{t.d(n,{Zo:()=>c,kt:()=>u});var i=t(67294);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function l(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?l(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):l(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function a(e,n){if(null==e)return{};var t,i,r=function(e,n){if(null==e)return{};var t,i,r={},l=Object.keys(e);for(i=0;i<l.length;i++)t=l[i],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(i=0;i<l.length;i++)t=l[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var s=i.createContext({}),d=function(e){var n=i.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},c=function(e){var n=d(e.components);return i.createElement(s.Provider,{value:n},e.children)},p={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},h=i.forwardRef((function(e,n){var t=e.components,r=e.mdxType,l=e.originalType,s=e.parentName,c=a(e,["components","mdxType","originalType","parentName"]),h=d(t),u=r,f=h["".concat(s,".").concat(u)]||h[u]||p[u]||l;return t?i.createElement(f,o(o({ref:n},c),{},{components:t})):i.createElement(f,o({ref:n},c))}));function u(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var l=t.length,o=new Array(l);o[0]=h;var a={};for(var s in n)hasOwnProperty.call(n,s)&&(a[s]=n[s]);a.originalType=e,a.mdxType="string"==typeof e?e:r,o[1]=a;for(var d=2;d<l;d++)o[d]=t[d];return i.createElement.apply(null,o)}return i.createElement.apply(null,t)}h.displayName="MDXCreateElement"},97636:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>o,default:()=>p,frontMatter:()=>l,metadata:()=>a,toc:()=>d});var i=t(87462),r=(t(67294),t(3905));const l={id:"Couchbase.ThresholdLoggingTracerOptions",title:"Interface: ThresholdLoggingTracerOptions",sidebar_label:"ThresholdLoggingTracerOptions",custom_edit_url:null},o=void 0,a={unversionedId:"api/interfaces/Couchbase.ThresholdLoggingTracerOptions",id:"api/interfaces/Couchbase.ThresholdLoggingTracerOptions",title:"Interface: ThresholdLoggingTracerOptions",description:"Couchbase.ThresholdLoggingTracerOptions",source:"@site/docs/api/interfaces/Couchbase.ThresholdLoggingTracerOptions.md",sourceDirName:"api/interfaces",slug:"/api/interfaces/Couchbase.ThresholdLoggingTracerOptions",permalink:"/docs/api/interfaces/Couchbase.ThresholdLoggingTracerOptions",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"Couchbase.ThresholdLoggingTracerOptions",title:"Interface: ThresholdLoggingTracerOptions",sidebar_label:"ThresholdLoggingTracerOptions",custom_edit_url:null},sidebar:"tutorialSidebar",previous:{title:"SearchQueryOptions",permalink:"/docs/api/interfaces/Couchbase.SearchQueryOptions"},next:{title:"TouchOptions",permalink:"/docs/api/interfaces/Couchbase.TouchOptions"}},s={},d=[{value:"Properties",id:"properties",level:2},{value:"analyticsThreshold",id:"analyticsthreshold",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"emitInterval",id:"emitinterval",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"kvThreshold",id:"kvthreshold",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"queryThreshold",id:"querythreshold",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"sampleSize",id:"samplesize",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"searchThreshold",id:"searchthreshold",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"viewsThreshold",id:"viewsthreshold",level:3},{value:"Defined in",id:"defined-in-6",level:4}],c={toc:d};function p(e){let{components:n,...t}=e;return(0,r.kt)("wrapper",(0,i.Z)({},c,t,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/namespaces/Couchbase"},"Couchbase"),".ThresholdLoggingTracerOptions"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"analyticsthreshold"},"analyticsThreshold"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"analyticsThreshold"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Specifies the threshold for when an analytics request should be included\nin the aggregated metrics, specified in millseconds."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/tracing.d.ts:31"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"emitinterval"},"emitInterval"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"emitInterval"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Specifies how often aggregated trace information should be logged,\nspecified in millseconds."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/tracing.d.ts:6"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"kvthreshold"},"kvThreshold"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"kvThreshold"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Specifies the threshold for when a kv request should be included\nin the aggregated metrics, specified in millseconds."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/tracing.d.ts:11"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"querythreshold"},"queryThreshold"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"queryThreshold"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Specifies the threshold for when a query request should be included\nin the aggregated metrics, specified in millseconds."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/tracing.d.ts:16"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"samplesize"},"sampleSize"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"sampleSize"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Specifies the number of entries which should be kept between each\nlogging interval."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/tracing.d.ts:36"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"searchthreshold"},"searchThreshold"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"searchThreshold"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Specifies the threshold for when a search request should be included\nin the aggregated metrics, specified in millseconds."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/tracing.d.ts:26"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"viewsthreshold"},"viewsThreshold"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"viewsThreshold"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Specifies the threshold for when a views request should be included\nin the aggregated metrics, specified in millseconds."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/tracing.d.ts:21"))}p.isMDXComponent=!0}}]);