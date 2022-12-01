"use strict";(self.webpackChunkottoman_documentation=self.webpackChunkottoman_documentation||[]).push([[6168],{3905:(e,t,a)=>{a.d(t,{Zo:()=>o,kt:()=>k});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function p(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var d=n.createContext({}),s=function(e){var t=n.useContext(d),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},o=function(e){var t=s(e.components);return n.createElement(d.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,d=e.parentName,o=p(e,["components","mdxType","originalType","parentName"]),c=s(a),k=r,u=c["".concat(d,".").concat(k)]||c[k]||m[k]||i;return a?n.createElement(u,l(l({ref:t},o),{},{components:a})):n.createElement(u,l({ref:t},o))}));function k(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=c;var p={};for(var d in t)hasOwnProperty.call(t,d)&&(p[d]=t[d]);p.originalType=e,p.mdxType="string"==typeof e?e:r,l[1]=p;for(var s=2;s<i;s++)l[s]=a[s];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}c.displayName="MDXCreateElement"},28962:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>m,frontMatter:()=>i,metadata:()=>p,toc:()=>s});var n=a(87462),r=(a(67294),a(3905));const i={id:"ReferenceType",title:"Class: ReferenceType",sidebar_label:"ReferenceType",sidebar_position:0,custom_edit_url:null},l=void 0,p={unversionedId:"api/classes/ReferenceType",id:"api/classes/ReferenceType",title:"Class: ReferenceType",description:"The Reference type creates a relationship between two schemas.",source:"@site/docs/api/classes/ReferenceType.md",sourceDirName:"api/classes",slug:"/api/classes/ReferenceType",permalink:"/docs/api/classes/ReferenceType",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"ReferenceType",title:"Class: ReferenceType",sidebar_label:"ReferenceType",sidebar_position:0,custom_edit_url:null},sidebar:"tutorialSidebar",previous:{title:"QueryOperatorNotFoundException",permalink:"/docs/api/classes/QueryOperatorNotFoundException"},next:{title:"Schema",permalink:"/docs/api/classes/Schema"}},d={},s=[{value:"Options",id:"options",level:2},{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"name",id:"name",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"options",id:"options-1",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"refModel",id:"refmodel",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"schema",id:"schema",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"typeName",id:"typename",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"sName",id:"sname",level:3},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"Accessors",id:"accessors",level:2},{value:"default",id:"default",level:3},{value:"Returns",id:"returns",level:4},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"required",id:"required",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"validator",id:"validator",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"Methods",id:"methods",level:2},{value:"buildDefault",id:"builddefault",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"cast",id:"cast",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"checkRequired",id:"checkrequired",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"checkValidator",id:"checkvalidator",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"isEmpty",id:"isempty",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"isStrictStrategy",id:"isstrictstrategy",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"validate",id:"validate",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-9",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"Defined in",id:"defined-in-16",level:4}],o={toc:s};function m(e){let{components:t,...a}=e;return(0,r.kt)("wrapper",(0,n.Z)({},o,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"Reference")," type creates a relationship between two schemas."),(0,r.kt)("h2",{id:"options"},"Options"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"required")," flag to define if the field is mandatory"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"validator")," that will be applied to the field a validation function, validation object or string with the name of the custom validator"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"default")," that will define the initial value of the field, this option allows a value or a function"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"immutable")," that will define this field as immutable. Ottoman prevents you from changing immutable fields if the schema as configure like strict")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Example"))),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"const Cat = model('Cat', {name: String});\nconst schema = new Schema({\n    type: String,\n    isActive: Boolean,\n    name: String,\n    cats: [{ type: CatSchema, ref: 'Cat' }],\n  });\nconst User = model('User', schema);\n")),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType"},(0,r.kt)("inlineCode",{parentName:"a"},"CoreType"))),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"ReferenceType"))))),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new ReferenceType"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"name"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"schema"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"refModel"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"options?"),")"),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"name")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"schema")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/docs/api/classes/Schema"},(0,r.kt)("inlineCode",{parentName:"a"},"Schema")))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"refModel")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"options?")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"CoreTypeOptions"))))),(0,r.kt)("h4",{id:"overrides"},"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType"},"CoreType"),".",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType#constructor"},"constructor")),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/couchbaselabs/node-ottoman/blob/cb5536c/src/schema/types/reference-type.ts#L36"},"src/schema/types/reference-type.ts:36")),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"name"},"name"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"name"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")),(0,r.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType"},"CoreType"),".",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType#name"},"name")),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/couchbaselabs/node-ottoman/blob/cb5536c/src/schema/interfaces/schema.types.ts#L51"},"src/schema/interfaces/schema.types.ts:51")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"options-1"},"options"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"options"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"CoreTypeOptions")),(0,r.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType"},"CoreType"),".",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType#options"},"options")),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/couchbaselabs/node-ottoman/blob/cb5536c/src/schema/types/core-type.ts#L23"},"src/schema/types/core-type.ts:23")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"refmodel"},"refModel"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"refModel"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/couchbaselabs/node-ottoman/blob/cb5536c/src/schema/types/reference-type.ts#L36"},"src/schema/types/reference-type.ts:36")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"schema"},"schema"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"schema"),": ",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/Schema"},(0,r.kt)("inlineCode",{parentName:"a"},"Schema"))),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/couchbaselabs/node-ottoman/blob/cb5536c/src/schema/types/reference-type.ts#L36"},"src/schema/types/reference-type.ts:36")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"typename"},"typeName"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"typeName"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")),(0,r.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType"},"CoreType"),".",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType#typename"},"typeName")),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/couchbaselabs/node-ottoman/blob/cb5536c/src/schema/interfaces/schema.types.ts#L51"},"src/schema/interfaces/schema.types.ts:51")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"sname"},"sName"),(0,r.kt)("p",null,"\u25aa ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("strong",{parentName:"p"},"sName"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," = ",(0,r.kt)("inlineCode",{parentName:"p"},"'Reference'")),(0,r.kt)("h4",{id:"overrides-1"},"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType"},"CoreType"),".",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType#sname"},"sName")),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/couchbaselabs/node-ottoman/blob/cb5536c/src/schema/types/reference-type.ts#L39"},"src/schema/types/reference-type.ts:39")),(0,r.kt)("h2",{id:"accessors"},"Accessors"),(0,r.kt)("h3",{id:"default"},"default"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"get")," ",(0,r.kt)("strong",{parentName:"p"},"default"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"unknown")),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"unknown")),(0,r.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,r.kt)("p",null,"CoreType.default"),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/couchbaselabs/node-ottoman/blob/cb5536c/src/schema/types/core-type.ts#L39"},"src/schema/types/core-type.ts:39")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"required"},"required"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"get")," ",(0,r.kt)("strong",{parentName:"p"},"required"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"RequiredOption")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"RequiredFunction")),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"boolean")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"RequiredOption")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"RequiredFunction")),(0,r.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,r.kt)("p",null,"CoreType.required"),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/couchbaselabs/node-ottoman/blob/cb5536c/src/schema/types/core-type.ts#L31"},"src/schema/types/core-type.ts:31")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"validator"},"validator"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"get")," ",(0,r.kt)("strong",{parentName:"p"},"validator"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"ValidatorFunction")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/docs/api/interfaces/ValidatorOption"},(0,r.kt)("inlineCode",{parentName:"a"},"ValidatorOption"))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"ValidatorFunction")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/docs/api/interfaces/ValidatorOption"},(0,r.kt)("inlineCode",{parentName:"a"},"ValidatorOption"))),(0,r.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,r.kt)("p",null,"CoreType.validator"),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/couchbaselabs/node-ottoman/blob/cb5536c/src/schema/types/core-type.ts#L35"},"src/schema/types/core-type.ts:35")),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"builddefault"},"buildDefault"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"buildDefault"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"unknown")),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"unknown")),(0,r.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType"},"CoreType"),".",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType#builddefault"},"buildDefault")),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/couchbaselabs/node-ottoman/blob/cb5536c/src/schema/types/core-type.ts#L43"},"src/schema/types/core-type.ts:43")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"cast"},"cast"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"cast"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"value"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"any")),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"value")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"any"))))),(0,r.kt)("h4",{id:"returns-4"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"any")),(0,r.kt)("h4",{id:"overrides-2"},"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType"},"CoreType"),".",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType#cast"},"cast")),(0,r.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/couchbaselabs/node-ottoman/blob/cb5536c/src/schema/types/reference-type.ts#L41"},"src/schema/types/reference-type.ts:41")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"checkrequired"},"checkRequired"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"checkRequired"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"returns-5"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"string")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType"},"CoreType"),".",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType#checkrequired"},"checkRequired")),(0,r.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/couchbaselabs/node-ottoman/blob/cb5536c/src/schema/types/core-type.ts#L62"},"src/schema/types/core-type.ts:62")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"checkvalidator"},"checkValidator"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"checkValidator"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"value"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"value")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"unknown"))))),(0,r.kt)("h4",{id:"returns-6"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"inherited-from-8"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType"},"CoreType"),".",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType#checkvalidator"},"checkValidator")),(0,r.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/couchbaselabs/node-ottoman/blob/cb5536c/src/schema/types/core-type.ts#L71"},"src/schema/types/core-type.ts:71")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isempty"},"isEmpty"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"isEmpty"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"value"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("h4",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"value")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"unknown"))))),(0,r.kt)("h4",{id:"returns-7"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("h4",{id:"inherited-from-9"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType"},"CoreType"),".",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType#isempty"},"isEmpty")),(0,r.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/couchbaselabs/node-ottoman/blob/cb5536c/src/schema/types/core-type.ts#L75"},"src/schema/types/core-type.ts:75")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isstrictstrategy"},"isStrictStrategy"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"isStrictStrategy"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"strategy"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("h4",{id:"parameters-4"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"strategy")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/docs/api/enums/VALIDATION_STRATEGY"},(0,r.kt)("inlineCode",{parentName:"a"},"VALIDATION_STRATEGY")))))),(0,r.kt)("h4",{id:"returns-8"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("h4",{id:"inherited-from-10"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType"},"CoreType"),".",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType#isstrictstrategy"},"isStrictStrategy")),(0,r.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/couchbaselabs/node-ottoman/blob/cb5536c/src/schema/types/core-type.ts#L79"},"src/schema/types/core-type.ts:79")),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"validate"},"validate"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"validate"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"value"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"strategy"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"any")),(0,r.kt)("h4",{id:"parameters-5"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"value")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"unknown"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"strategy")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"any"))))),(0,r.kt)("h4",{id:"returns-9"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"any")),(0,r.kt)("h4",{id:"overrides-3"},"Overrides"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType"},"CoreType"),".",(0,r.kt)("a",{parentName:"p",href:"/docs/api/classes/CoreType#validate"},"validate")),(0,r.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://github.com/couchbaselabs/node-ottoman/blob/cb5536c/src/schema/types/reference-type.ts#L45"},"src/schema/types/reference-type.ts:45")))}m.isMDXComponent=!0}}]);