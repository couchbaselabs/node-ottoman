"use strict";(self.webpackChunkottoman_documentation=self.webpackChunkottoman_documentation||[]).push([[2082],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>m});var i=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},l=Object.keys(e);for(i=0;i<l.length;i++)n=l[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(i=0;i<l.length;i++)n=l[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var d=i.createContext({}),u=function(e){var t=i.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},s=function(e){var t=u(e.components);return i.createElement(d.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},c=i.forwardRef((function(e,t){var n=e.components,a=e.mdxType,l=e.originalType,d=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),c=u(n),m=a,f=c["".concat(d,".").concat(m)]||c[m]||p[m]||l;return n?i.createElement(f,r(r({ref:t},s),{},{components:n})):i.createElement(f,r({ref:t},s))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=n.length,r=new Array(l);r[0]=c;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o.mdxType="string"==typeof e?e:a,r[1]=o;for(var u=2;u<l;u++)r[u]=n[u];return i.createElement.apply(null,r)}return i.createElement.apply(null,n)}c.displayName="MDXCreateElement"},82648:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>r,default:()=>p,frontMatter:()=>l,metadata:()=>o,toc:()=>u});var i=n(87462),a=(n(67294),n(3905));const l={id:"Couchbase.ConnectOptions",title:"Interface: ConnectOptions",sidebar_label:"ConnectOptions",custom_edit_url:null},r=void 0,o={unversionedId:"api/interfaces/Couchbase.ConnectOptions",id:"api/interfaces/Couchbase.ConnectOptions",title:"Interface: ConnectOptions",description:"Couchbase.ConnectOptions",source:"@site/docs/api/interfaces/Couchbase.ConnectOptions.md",sourceDirName:"api/interfaces",slug:"/api/interfaces/Couchbase.ConnectOptions",permalink:"/docs/api/interfaces/Couchbase.ConnectOptions",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"Couchbase.ConnectOptions",title:"Interface: ConnectOptions",sidebar_label:"ConnectOptions",custom_edit_url:null},sidebar:"tutorialSidebar",previous:{title:"ConnectAnalyticsLinkOptions",permalink:"/docs/api/interfaces/Couchbase.ConnectAnalyticsLinkOptions"},next:{title:"CreateAnalyticsDatasetOptions",permalink:"/docs/api/interfaces/Couchbase.CreateAnalyticsDatasetOptions"}},d={},u=[{value:"Properties",id:"properties",level:2},{value:"analyticsTimeout",id:"analyticstimeout",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"authenticator",id:"authenticator",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"kvDurableTimeout",id:"kvdurabletimeout",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"kvTimeout",id:"kvtimeout",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"logFunc",id:"logfunc",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"managementTimeout",id:"managementtimeout",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"meter",id:"meter",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"password",id:"password",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"queryTimeout",id:"querytimeout",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"searchTimeout",id:"searchtimeout",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"tracer",id:"tracer",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"transcoder",id:"transcoder",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"trustStorePath",id:"truststorepath",level:3},{value:"Defined in",id:"defined-in-12",level:4},{value:"username",id:"username",level:3},{value:"Defined in",id:"defined-in-13",level:4},{value:"viewTimeout",id:"viewtimeout",level:3},{value:"Defined in",id:"defined-in-14",level:4}],s={toc:u};function p(e){let{components:t,...n}=e;return(0,a.kt)("wrapper",(0,i.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/docs/api/namespaces/Couchbase"},"Couchbase"),".ConnectOptions"),(0,a.kt)("p",null,"Specifies the options which can be specified when connecting\nto a cluster."),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"analyticstimeout"},"analyticsTimeout"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"analyticsTimeout"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Specifies the default timeout for analytics query operations, specified in millseconds."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/cluster.d.ts:67"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"authenticator"},"authenticator"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"authenticator"),": ",(0,a.kt)("a",{parentName:"p",href:"/docs/api/namespaces/Couchbase#authenticator"},(0,a.kt)("inlineCode",{parentName:"a"},"Authenticator"))),(0,a.kt)("p",null,"Specifies a specific authenticator to use when connecting to the cluster."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/cluster.d.ts:42"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"kvdurabletimeout"},"kvDurableTimeout"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"kvDurableTimeout"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Specifies the default timeout for durable KV operations, specified in millseconds."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/cluster.d.ts:55"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"kvtimeout"},"kvTimeout"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"kvTimeout"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Specifies the default timeout for KV operations, specified in millseconds."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/cluster.d.ts:51"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"logfunc"},"logFunc"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"logFunc"),": ",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.LogFunc"},(0,a.kt)("inlineCode",{parentName:"a"},"LogFunc"))),(0,a.kt)("p",null,"Specifies a logging function to use when outputting logging."),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/cluster.d.ts:91"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"managementtimeout"},"managementTimeout"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"managementTimeout"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Specifies the default timeout for management operations, specified in millseconds."),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/cluster.d.ts:75"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"meter"},"meter"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"meter"),": ",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.Meter"},(0,a.kt)("inlineCode",{parentName:"a"},"Meter"))),(0,a.kt)("p",null,"Specifies the meter to use for diagnostics metrics."),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/cluster.d.ts:87"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"password"},"password"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"password"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"Specifies a password to be used in concert with username for authentication."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"See"))),(0,a.kt)("p",null,"ConnectOptions.username"),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/cluster.d.ts:38"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"querytimeout"},"queryTimeout"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"queryTimeout"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Specifies the default timeout for query operations, specified in millseconds."),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/cluster.d.ts:63"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"searchtimeout"},"searchTimeout"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"searchTimeout"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Specifies the default timeout for search query operations, specified in millseconds."),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/cluster.d.ts:71"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"tracer"},"tracer"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"tracer"),": ",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.RequestTracer"},(0,a.kt)("inlineCode",{parentName:"a"},"RequestTracer"))),(0,a.kt)("p",null,"Specifies the tracer to use for diagnostics tracing."),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/cluster.d.ts:83"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"transcoder"},"transcoder"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"transcoder"),": ",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.Transcoder"},(0,a.kt)("inlineCode",{parentName:"a"},"Transcoder"))),(0,a.kt)("p",null,"Specifies the default transcoder to use when encoding or decoding document values."),(0,a.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/cluster.d.ts:79"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"truststorepath"},"trustStorePath"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"trustStorePath"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"Specifies the path to a trust store file to be used when validating the\nauthenticity of the server when connecting over SSL."),(0,a.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/cluster.d.ts:47"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"username"},"username"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"username"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string")),(0,a.kt)("p",null,"Specifies a username to use for an implicitly created IPasswordAuthenticator\nused for authentication with the cluster."),(0,a.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/cluster.d.ts:32"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"viewtimeout"},"viewTimeout"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"viewTimeout"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Specifies the default timeout for views operations, specified in millseconds."),(0,a.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/cluster.d.ts:59"))}p.isMDXComponent=!0}}]);