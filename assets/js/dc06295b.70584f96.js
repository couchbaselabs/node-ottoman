"use strict";(self.webpackChunkottoman_documentation=self.webpackChunkottoman_documentation||[]).push([[7267],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>h});var i=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},l=Object.keys(e);for(i=0;i<l.length;i++)n=l[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(i=0;i<l.length;i++)n=l[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var o=i.createContext({}),d=function(e){var t=i.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},p=function(e){var t=d(e.components);return i.createElement(o.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},c=i.forwardRef((function(e,t){var n=e.components,a=e.mdxType,l=e.originalType,o=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),c=d(n),h=a,k=c["".concat(o,".").concat(h)]||c[h]||u[h]||l;return n?i.createElement(k,r(r({ref:t},p),{},{components:n})):i.createElement(k,r({ref:t},p))}));function h(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=n.length,r=new Array(l);r[0]=c;var s={};for(var o in t)hasOwnProperty.call(t,o)&&(s[o]=t[o]);s.originalType=e,s.mdxType="string"==typeof e?e:a,r[1]=s;for(var d=2;d<l;d++)r[d]=n[d];return i.createElement.apply(null,r)}return i.createElement.apply(null,n)}c.displayName="MDXCreateElement"},65056:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>r,default:()=>u,frontMatter:()=>l,metadata:()=>s,toc:()=>d});var i=n(87462),a=(n(67294),n(3905));const l={id:"Couchbase.SearchQueryOptions",title:"Interface: SearchQueryOptions",sidebar_label:"SearchQueryOptions",custom_edit_url:null},r=void 0,s={unversionedId:"api/interfaces/Couchbase.SearchQueryOptions",id:"api/interfaces/Couchbase.SearchQueryOptions",title:"Interface: SearchQueryOptions",description:"Couchbase.SearchQueryOptions",source:"@site/docs/api/interfaces/Couchbase.SearchQueryOptions.md",sourceDirName:"api/interfaces",slug:"/api/interfaces/Couchbase.SearchQueryOptions",permalink:"/docs/api/interfaces/Couchbase.SearchQueryOptions",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"Couchbase.SearchQueryOptions",title:"Interface: SearchQueryOptions",sidebar_label:"SearchQueryOptions",custom_edit_url:null},sidebar:"tutorialSidebar",previous:{title:"ResumeSearchIngestOptions",permalink:"/docs/api/interfaces/Couchbase.ResumeSearchIngestOptions"},next:{title:"ThresholdLoggingTracerOptions",permalink:"/docs/api/interfaces/Couchbase.ThresholdLoggingTracerOptions"}},o={},d=[{value:"Properties",id:"properties",level:2},{value:"collections",id:"collections",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"consistency",id:"consistency",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"consistentWith",id:"consistentwith",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"disableScoring",id:"disablescoring",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"explain",id:"explain",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"facets",id:"facets",level:3},{value:"Index signature",id:"index-signature",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"fields",id:"fields",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"highlight",id:"highlight",level:3},{value:"Type declaration",id:"type-declaration",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"includeLocations",id:"includelocations",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"limit",id:"limit",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"parentSpan",id:"parentspan",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"raw",id:"raw",level:3},{value:"Index signature",id:"index-signature-1",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"skip",id:"skip",level:3},{value:"Defined in",id:"defined-in-12",level:4},{value:"sort",id:"sort",level:3},{value:"Defined in",id:"defined-in-13",level:4},{value:"timeout",id:"timeout",level:3},{value:"Defined in",id:"defined-in-14",level:4}],p={toc:d};function u(e){let{components:t,...n}=e;return(0,a.kt)("wrapper",(0,i.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/docs/api/namespaces/Couchbase"},"Couchbase"),".SearchQueryOptions"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"collections"},"collections"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"collections"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string"),"[]"),(0,a.kt)("p",null,"Specifies the collections which should be searched as part of the query."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/searchtypes.d.ts:106"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"consistency"},"consistency"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"consistency"),": ",(0,a.kt)("a",{parentName:"p",href:"/docs/api/enums/Couchbase.SearchScanConsistency"},(0,a.kt)("inlineCode",{parentName:"a"},"SearchScanConsistency"))),(0,a.kt)("p",null,"Specifies the consistency requirements when executing the query."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"See"))),(0,a.kt)("p",null,"SearchScanConsistency"),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/searchtypes.d.ts:137"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"consistentwith"},"consistentWith"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"consistentWith"),": ",(0,a.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.MutationState"},(0,a.kt)("inlineCode",{parentName:"a"},"MutationState"))),(0,a.kt)("p",null,"Specifies a MutationState which the query should be consistent with."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("inlineCode",{parentName:"strong"},"See"))),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.MutationState"},"MutationState")),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/searchtypes.d.ts:143"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"disablescoring"},"disableScoring"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"disableScoring"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"Specifies that scoring should be disabled.  This improves performance but makes it\nimpossible to sort based on how well a particular result scored."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/searchtypes.d.ts:125"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"explain"},"explain"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"explain"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"Configures whether the result should contain the execution plan for the query."),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/searchtypes.d.ts:94"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"facets"},"facets"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"facets"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Object")),(0,a.kt)("p",null,"Specifies any facets that should be included in the query."),(0,a.kt)("h4",{id:"index-signature"},"Index signature"),(0,a.kt)("p",null,"\u25aa ","[name: ",(0,a.kt)("inlineCode",{parentName:"p"},"string"),"]",": ",(0,a.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.SearchFacet"},(0,a.kt)("inlineCode",{parentName:"a"},"SearchFacet"))),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/searchtypes.d.ts:114"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"fields"},"fields"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"fields"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string"),"[]"),(0,a.kt)("p",null,"Specifies the list of fields which should be searched."),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/searchtypes.d.ts:110"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"highlight"},"highlight"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"highlight"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Object")),(0,a.kt)("p",null,"Specifies how the highlighting should behave.  Specifically which mode should be\nused for highlighting as well as which fields should be highlighted."),(0,a.kt)("h4",{id:"type-declaration"},"Type declaration"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"fields?")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"string"),"[]")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"style?")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/docs/api/enums/Couchbase.HighlightStyle"},(0,a.kt)("inlineCode",{parentName:"a"},"HighlightStyle")))))),(0,a.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/searchtypes.d.ts:99"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"includelocations"},"includeLocations"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"includeLocations"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"boolean")),(0,a.kt)("p",null,"If set to true, will include the locations in the search result."),(0,a.kt)("p",null," This API is subject to change without notice."),(0,a.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/searchtypes.d.ts:131"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"limit"},"limit"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"limit"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Specifies the limit to the number of results that should be returned."),(0,a.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/searchtypes.d.ts:90"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"parentspan"},"parentSpan"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"parentSpan"),": ",(0,a.kt)("a",{parentName:"p",href:"/docs/api/interfaces/Couchbase.RequestSpan"},(0,a.kt)("inlineCode",{parentName:"a"},"RequestSpan"))),(0,a.kt)("p",null,"The parent tracing span that this operation will be part of."),(0,a.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/searchtypes.d.ts:154"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"raw"},"raw"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"raw"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Object")),(0,a.kt)("p",null,"Specifies any additional parameters which should be passed to the query engine\nwhen executing the query."),(0,a.kt)("h4",{id:"index-signature-1"},"Index signature"),(0,a.kt)("p",null,"\u25aa ","[key: ",(0,a.kt)("inlineCode",{parentName:"p"},"string"),"]",": ",(0,a.kt)("inlineCode",{parentName:"p"},"any")),(0,a.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/searchtypes.d.ts:148"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"skip"},"skip"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"skip"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Specifies the number of results to skip from the index before returning\nresults."),(0,a.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/searchtypes.d.ts:86"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"sort"},"sort"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"sort"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"string"),"[] ","|"," ",(0,a.kt)("a",{parentName:"p",href:"/docs/api/classes/Couchbase.SearchSort"},(0,a.kt)("inlineCode",{parentName:"a"},"SearchSort")),"[]"),(0,a.kt)("p",null,"Specifies a list of fields or SearchSort's to use when sorting the result sets."),(0,a.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/searchtypes.d.ts:120"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"timeout"},"timeout"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,a.kt)("strong",{parentName:"p"},"timeout"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The timeout for this operation, represented in milliseconds."),(0,a.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,a.kt)("p",null,"node_modules/couchbase/dist/searchtypes.d.ts:158"))}u.isMDXComponent=!0}}]);