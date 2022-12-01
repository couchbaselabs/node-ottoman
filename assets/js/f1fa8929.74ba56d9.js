"use strict";(self.webpackChunkottoman_documentation=self.webpackChunkottoman_documentation||[]).push([[8034],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>u});var a=r(67294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var s=a.createContext({}),d=function(e){var t=a.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},c=function(e){var t=d(e.components);return a.createElement(s.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},h=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),h=d(r),u=n,m=h["".concat(s,".").concat(u)]||h[u]||p[u]||i;return r?a.createElement(m,o(o({ref:t},c),{},{components:r})):a.createElement(m,o({ref:t},c))}));function u(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,o=new Array(i);o[0]=h;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:n,o[1]=l;for(var d=2;d<i;d++)o[d]=r[d];return a.createElement.apply(null,o)}return a.createElement.apply(null,r)}h.displayName="MDXCreateElement"},66228:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>p,frontMatter:()=>i,metadata:()=>l,toc:()=>d});var a=r(87462),n=(r(67294),r(3905));const i={id:"Couchbase.ScoreSearchSort",title:"Class: ScoreSearchSort",sidebar_label:"ScoreSearchSort",custom_edit_url:null},o=void 0,l={unversionedId:"api/classes/Couchbase.ScoreSearchSort",id:"api/classes/Couchbase.ScoreSearchSort",title:"Class: ScoreSearchSort",description:"Couchbase.ScoreSearchSort",source:"@site/docs/api/classes/Couchbase.ScoreSearchSort.md",sourceDirName:"api/classes",slug:"/api/classes/Couchbase.ScoreSearchSort",permalink:"/docs/api/classes/Couchbase.ScoreSearchSort",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"Couchbase.ScoreSearchSort",title:"Class: ScoreSearchSort",sidebar_label:"ScoreSearchSort",custom_edit_url:null},sidebar:"tutorialSidebar",previous:{title:"ScopeSpec",permalink:"/docs/api/classes/Couchbase.ScopeSpec"},next:{title:"SearchErrorContext",permalink:"/docs/api/classes/Couchbase.SearchErrorContext"}},s={},d=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"_data",id:"_data",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"Methods",id:"methods",level:2},{value:"descending",id:"descending",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"toJSON",id:"tojson",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"field",id:"field",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"geoDistance",id:"geodistance",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"id",id:"id",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"score",id:"score",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-7",level:4}],c={toc:d};function p(e){let{components:t,...r}=e;return(0,n.kt)("wrapper",(0,a.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/docs/api/namespaces/Couchbase"},"Couchbase"),".ScoreSearchSort"),(0,n.kt)("p",null,"Provides sorting for a search query by score."),(0,n.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("p",{parentName:"li"},(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.SearchSort"},(0,n.kt)("inlineCode",{parentName:"a"},"SearchSort"))),(0,n.kt)("p",{parentName:"li"},"\u21b3 ",(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("inlineCode",{parentName:"strong"},"ScoreSearchSort"))))),(0,n.kt)("h2",{id:"constructors"},"Constructors"),(0,n.kt)("h3",{id:"constructor"},"constructor"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("strong",{parentName:"p"},"new ScoreSearchSort"),"()"),(0,n.kt)("h4",{id:"overrides"},"Overrides"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.SearchSort"},"SearchSort"),".",(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.SearchSort#constructor"},"constructor")),(0,n.kt)("h4",{id:"defined-in"},"Defined in"),(0,n.kt)("p",null,"node_modules/couchbase/dist/searchsort.d.ts:24"),(0,n.kt)("h2",{id:"properties"},"Properties"),(0,n.kt)("h3",{id:"_data"},"_","data"),(0,n.kt)("p",null,"\u2022 ",(0,n.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,n.kt)("strong",{parentName:"p"},"_","data"),": ",(0,n.kt)("inlineCode",{parentName:"p"},"any")),(0,n.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.SearchSort"},"SearchSort"),".",(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.SearchSort#_data"},"_data")),(0,n.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,n.kt)("p",null,"node_modules/couchbase/dist/searchsort.d.ts:7"),(0,n.kt)("h2",{id:"methods"},"Methods"),(0,n.kt)("h3",{id:"descending"},"descending"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"descending"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"descending"),"): ",(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.ScoreSearchSort"},(0,n.kt)("inlineCode",{parentName:"a"},"ScoreSearchSort"))),(0,n.kt)("h4",{id:"parameters"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"descending")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"boolean"))))),(0,n.kt)("h4",{id:"returns"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.ScoreSearchSort"},(0,n.kt)("inlineCode",{parentName:"a"},"ScoreSearchSort"))),(0,n.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,n.kt)("p",null,"node_modules/couchbase/dist/searchsort.d.ts:25"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"tojson"},"toJSON"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("strong",{parentName:"p"},"toJSON"),"(): ",(0,n.kt)("inlineCode",{parentName:"p"},"any")),(0,n.kt)("h4",{id:"returns-1"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("inlineCode",{parentName:"p"},"any")),(0,n.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.SearchSort"},"SearchSort"),".",(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.SearchSort#tojson"},"toJSON")),(0,n.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,n.kt)("p",null,"node_modules/couchbase/dist/searchsort.d.ts:9"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"field"},"field"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,n.kt)("strong",{parentName:"p"},"field"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"field"),"): ",(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.FieldSearchSort"},(0,n.kt)("inlineCode",{parentName:"a"},"FieldSearchSort"))),(0,n.kt)("h4",{id:"parameters-1"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"field")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"string"))))),(0,n.kt)("h4",{id:"returns-2"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.FieldSearchSort"},(0,n.kt)("inlineCode",{parentName:"a"},"FieldSearchSort"))),(0,n.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.SearchSort"},"SearchSort"),".",(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.SearchSort#field"},"field")),(0,n.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,n.kt)("p",null,"node_modules/couchbase/dist/searchsort.d.ts:12"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"geodistance"},"geoDistance"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,n.kt)("strong",{parentName:"p"},"geoDistance"),"(",(0,n.kt)("inlineCode",{parentName:"p"},"field"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"lat"),", ",(0,n.kt)("inlineCode",{parentName:"p"},"lon"),"): ",(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.GeoDistanceSearchSort"},(0,n.kt)("inlineCode",{parentName:"a"},"GeoDistanceSearchSort"))),(0,n.kt)("h4",{id:"parameters-2"},"Parameters"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"field")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"string"))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"lat")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number"))),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"lon")),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"number"))))),(0,n.kt)("h4",{id:"returns-3"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.GeoDistanceSearchSort"},(0,n.kt)("inlineCode",{parentName:"a"},"GeoDistanceSearchSort"))),(0,n.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.SearchSort"},"SearchSort"),".",(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.SearchSort#geodistance"},"geoDistance")),(0,n.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,n.kt)("p",null,"node_modules/couchbase/dist/searchsort.d.ts:13"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"id"},"id"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,n.kt)("strong",{parentName:"p"},"id"),"(): ",(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.IdSearchSort"},(0,n.kt)("inlineCode",{parentName:"a"},"IdSearchSort"))),(0,n.kt)("h4",{id:"returns-4"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.IdSearchSort"},(0,n.kt)("inlineCode",{parentName:"a"},"IdSearchSort"))),(0,n.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.SearchSort"},"SearchSort"),".",(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.SearchSort#id"},"id")),(0,n.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,n.kt)("p",null,"node_modules/couchbase/dist/searchsort.d.ts:11"),(0,n.kt)("hr",null),(0,n.kt)("h3",{id:"score"},"score"),(0,n.kt)("p",null,"\u25b8 ",(0,n.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,n.kt)("strong",{parentName:"p"},"score"),"(): ",(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.ScoreSearchSort"},(0,n.kt)("inlineCode",{parentName:"a"},"ScoreSearchSort"))),(0,n.kt)("h4",{id:"returns-5"},"Returns"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.ScoreSearchSort"},(0,n.kt)("inlineCode",{parentName:"a"},"ScoreSearchSort"))),(0,n.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.SearchSort"},"SearchSort"),".",(0,n.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.SearchSort#score"},"score")),(0,n.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,n.kt)("p",null,"node_modules/couchbase/dist/searchsort.d.ts:10"))}p.isMDXComponent=!0}}]);