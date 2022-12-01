"use strict";(self.webpackChunkottoman_documentation=self.webpackChunkottoman_documentation||[]).push([[8679],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>f});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var o=i.createContext({}),s=function(e){var t=i.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},p=function(e){var t=s(e.components);return i.createElement(o.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},d=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,o=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),d=s(n),f=r,y=d["".concat(o,".").concat(f)]||d[f]||u[f]||a;return n?i.createElement(y,c(c({ref:t},p),{},{components:n})):i.createElement(y,c({ref:t},p))}));function f(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,c=new Array(a);c[0]=d;var l={};for(var o in t)hasOwnProperty.call(t,o)&&(l[o]=t[o]);l.originalType=e,l.mdxType="string"==typeof e?e:r,c[1]=l;for(var s=2;s<a;s++)c[s]=n[s];return i.createElement.apply(null,c)}return i.createElement.apply(null,n)}d.displayName="MDXCreateElement"},92495:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>c,default:()=>u,frontMatter:()=>a,metadata:()=>l,toc:()=>s});var i=n(87462),r=(n(67294),n(3905));const a={id:"Couchbase.ICouchbaseAnalyticsEncryptionSettings",title:"Interface: ICouchbaseAnalyticsEncryptionSettings",sidebar_label:"ICouchbaseAnalyticsEncryptionSettings",custom_edit_url:null},c=void 0,l={unversionedId:"api/interfaces/Couchbase.ICouchbaseAnalyticsEncryptionSettings",id:"api/interfaces/Couchbase.ICouchbaseAnalyticsEncryptionSettings",title:"Interface: ICouchbaseAnalyticsEncryptionSettings",description:"Couchbase.ICouchbaseAnalyticsEncryptionSettings",source:"@site/docs/api/interfaces/Couchbase.ICouchbaseAnalyticsEncryptionSettings.md",sourceDirName:"api/interfaces",slug:"/api/interfaces/Couchbase.ICouchbaseAnalyticsEncryptionSettings",permalink:"/docs/api/interfaces/Couchbase.ICouchbaseAnalyticsEncryptionSettings",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"Couchbase.ICouchbaseAnalyticsEncryptionSettings",title:"Interface: ICouchbaseAnalyticsEncryptionSettings",sidebar_label:"ICouchbaseAnalyticsEncryptionSettings",custom_edit_url:null},sidebar:"tutorialSidebar",previous:{title:"ICollectionSpec",permalink:"/docs/api/interfaces/Couchbase.ICollectionSpec"},next:{title:"ICouchbaseRemoteAnalyticsLink",permalink:"/docs/api/interfaces/Couchbase.ICouchbaseRemoteAnalyticsLink"}},o={},s=[{value:"Implemented by",id:"implemented-by",level:2},{value:"Properties",id:"properties",level:2},{value:"certificate",id:"certificate",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"clientCertificate",id:"clientcertificate",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"clientKey",id:"clientkey",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"encryptionLevel",id:"encryptionlevel",level:3},{value:"Defined in",id:"defined-in-3",level:4}],p={toc:s};function u(e){let{components:t,...n}=e;return(0,r.kt)("wrapper",(0,i.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/namespaces/Couchbase"},"Couchbase"),".ICouchbaseAnalyticsEncryptionSettings"),(0,r.kt)("p",null,"Specifies encryption options for an analytics remote link."),(0,r.kt)("h2",{id:"implemented-by"},"Implemented by"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/docs/api/classes/Couchbase.CouchbaseAnalyticsEncryptionSettings"},(0,r.kt)("inlineCode",{parentName:"a"},"CouchbaseAnalyticsEncryptionSettings")))),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"certificate"},"certificate"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"certificate"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Buffer")),(0,r.kt)("p",null,"Provides a certificate to use for connecting when encryption level is set\nto full.  Required when encryptionLevel is set to Full."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/analyticsindexmanager.d.ts:109"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"clientcertificate"},"clientCertificate"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"clientCertificate"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Buffer")),(0,r.kt)("p",null,"Provides a client certificate to use for connecting when encryption level\nis set to full.  Cannot be set if a username/password are used."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/analyticsindexmanager.d.ts:114"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"clientkey"},"clientKey"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"clientKey"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Buffer")),(0,r.kt)("p",null,"Provides a client key to use for connecting when encryption level is set\nto full.  Cannot be set if a username/password are used."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/analyticsindexmanager.d.ts:119"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"encryptionlevel"},"encryptionLevel"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"encryptionLevel"),": ",(0,r.kt)("a",{parentName:"p",href:"/docs/api/enums/Couchbase.AnalyticsEncryptionLevel"},(0,r.kt)("inlineCode",{parentName:"a"},"AnalyticsEncryptionLevel"))),(0,r.kt)("p",null,"Specifies what level of encryption should be used."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"node_modules/couchbase/dist/analyticsindexmanager.d.ts:104"))}u.isMDXComponent=!0}}]);