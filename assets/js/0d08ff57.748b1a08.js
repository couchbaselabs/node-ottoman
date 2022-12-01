"use strict";(self.webpackChunkottoman_documentation=self.webpackChunkottoman_documentation||[]).push([[7401],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>f});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=r.createContext({}),l=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},c=function(e){var t=l(e.components);return r.createElement(p.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,p=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),d=l(n),f=a,m=d["".concat(p,".").concat(f)]||d[f]||u[f]||i;return n?r.createElement(m,o(o({ref:t},c),{},{components:n})):r.createElement(m,o({ref:t},c))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=d;var s={};for(var p in t)hasOwnProperty.call(t,p)&&(s[p]=t[p]);s.originalType=e,s.mdxType="string"==typeof e?e:a,o[1]=s;for(var l=2;l<i;l++)o[l]=n[l];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},29511:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>o,default:()=>u,frontMatter:()=>i,metadata:()=>s,toc:()=>l});var r=n(87462),a=(n(67294),n(3905));const i={id:"Couchbase.CreateAnalyticsLinkOptions",title:"Interface: CreateAnalyticsLinkOptions",sidebar_label:"CreateAnalyticsLinkOptions",custom_edit_url:null},o=void 0,s={unversionedId:"api/interfaces/Couchbase.CreateAnalyticsLinkOptions",id:"api/interfaces/Couchbase.CreateAnalyticsLinkOptions",title:"Interface: CreateAnalyticsLinkOptions",description:"Couchbase.CreateAnalyticsLinkOptions",source:"@site/docs/api/interfaces/Couchbase.CreateAnalyticsLinkOptions.md",sourceDirName:"api/interfaces",slug:"/api/interfaces/Couchbase.CreateAnalyticsLinkOptions",permalink:"/docs/api/interfaces/Couchbase.CreateAnalyticsLinkOptions",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"Couchbase.CreateAnalyticsLinkOptions",title:"Interface: CreateAnalyticsLinkOptions",sidebar_label:"CreateAnalyticsLinkOptions",custom_edit_url:null},sidebar:"tutorialSidebar",previous:{title:"CreateAnalyticsIndexOptions",permalink:"/docs/api/interfaces/Couchbase.CreateAnalyticsIndexOptions"},next:{title:"CreateBucketOptions",permalink:"/docs/api/interfaces/Couchbase.CreateBucketOptions"}},p={},l=[{value:"Properties",id:"properties",level:2},{value:"parentSpan",id:"parentspan",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"timeout",id:"timeout",level:3},{value:"Defined in",id:"defined-in-1",level:4}],c={toc:l};function u(e){let{components:t,...n}=e;return(0,a.kt)("wrapper",(0,r.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/docs/api/namespaces/Couchbase"},"Couchbase"),".CreateAnalyticsLinkOptions"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"parentspan"},"parentSpan"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"parentSpan"),": ",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.RequestSpan"},(0,a.kt)("inlineCode",{parentName:"a"},"RequestSpan"))),(0,a.kt)("p",null,"The parent tracing span that this operation will be part of."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/analyticsindexmanager.d.ts:649"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"timeout"},"timeout"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"timeout"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The timeout for this operation, represented in milliseconds."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/analyticsindexmanager.d.ts:653"))}u.isMDXComponent=!0}}]);