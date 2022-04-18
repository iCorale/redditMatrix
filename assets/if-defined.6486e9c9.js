var bt=Object.defineProperty,wt=Object.defineProperties;var Ct=Object.getOwnPropertyDescriptors;var Y=Object.getOwnPropertySymbols;var Ut=Object.prototype.hasOwnProperty,Pt=Object.prototype.propertyIsEnumerable;var F=(i,t,e)=>t in i?bt(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e,M=(i,t)=>{for(var e in t||(t={}))Ut.call(t,e)&&F(i,e,t[e]);if(Y)for(var e of Y(t))Pt.call(t,e)&&F(i,e,t[e]);return i},N=(i,t)=>wt(i,Ct(t));/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */var H=function(i,t){return H=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,s){e.__proto__=s}||function(e,s){for(var n in s)Object.prototype.hasOwnProperty.call(s,n)&&(e[n]=s[n])},H(i,t)};function Gt(i,t){if(typeof t!="function"&&t!==null)throw new TypeError("Class extends value "+String(t)+" is not a constructor or null");H(i,t);function e(){this.constructor=i}i.prototype=t===null?Object.create(t):(e.prototype=t.prototype,new e)}var G=function(){return G=Object.assign||function(t){for(var e,s=1,n=arguments.length;s<n;s++){e=arguments[s];for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[r]=e[r])}return t},G.apply(this,arguments)};function Qt(i,t,e,s){var n=arguments.length,r=n<3?t:s===null?s=Object.getOwnPropertyDescriptor(t,e):s,o;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(i,t,e,s);else for(var h=i.length-1;h>=0;h--)(o=i[h])&&(r=(n<3?o(r):n>3?o(t,e,r):o(t,e))||r);return n>3&&r&&Object.defineProperty(t,e,r),r}function Xt(i){var t=typeof Symbol=="function"&&Symbol.iterator,e=t&&i[t],s=0;if(e)return e.call(i);if(i&&typeof i.length=="number")return{next:function(){return i&&s>=i.length&&(i=void 0),{value:i&&i[s++],done:!i}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const te=i=>t=>typeof t=="function"?((e,s)=>(window.customElements.define(e,s),s))(i,t):((e,s)=>{const{kind:n,elements:r}=s;return{kind:n,elements:r,finisher(o){window.customElements.define(e,o)}}})(i,t);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Tt=(i,t)=>t.kind==="method"&&t.descriptor&&!("value"in t.descriptor)?N(M({},t),{finisher(e){e.createProperty(t.key,i)}}):{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:t.key,initializer(){typeof t.initializer=="function"&&(this[t.key]=t.initializer.call(this))},finisher(e){e.createProperty(t.key,i)}};function ee(i){return(t,e)=>e!==void 0?((s,n,r)=>{n.constructor.createProperty(r,s)})(i,t,e):Tt(i,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ot=({finisher:i,descriptor:t})=>(e,s)=>{var n;if(s===void 0){const r=(n=e.originalKey)!==null&&n!==void 0?n:e.key,o=t!=null?{kind:"method",placement:"prototype",key:r,descriptor:t(e.key)}:N(M({},e),{key:r});return i!=null&&(o.finisher=function(h){i(h,r)}),o}{const r=e.constructor;t!==void 0&&Object.defineProperty(e,s,t(s)),i==null||i(r,s)}};/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var k;const xt=((k=window.HTMLSlotElement)===null||k===void 0?void 0:k.prototype.assignedElements)!=null?(i,t)=>i.assignedElements(t):(i,t)=>i.assignedNodes(t).filter(e=>e.nodeType===Node.ELEMENT_NODE);function se(i){const{slot:t,selector:e}=i!=null?i:{};return Ot({descriptor:s=>({get(){var n;const r="slot"+(t?`[name=${t}]`:":not([name])"),o=(n=this.renderRoot)===null||n===void 0?void 0:n.querySelector(r),h=o!=null?xt(o,i):[];return e?h.filter(l=>l.matches(e)):h},enumerable:!0,configurable:!0})})}/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const j=window.ShadowRoot&&(window.ShadyCSS===void 0||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Q=Symbol(),X=new Map;class Rt{constructor(t,e){if(this._$cssResult$=!0,e!==Q)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t}get styleSheet(){let t=X.get(this.cssText);return j&&t===void 0&&(X.set(this.cssText,t=new CSSStyleSheet),t.replaceSync(this.cssText)),t}toString(){return this.cssText}}const Mt=i=>new Rt(typeof i=="string"?i:i+"",Q),Nt=(i,t)=>{j?i.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet):t.forEach(e=>{const s=document.createElement("style"),n=window.litNonce;n!==void 0&&s.setAttribute("nonce",n),s.textContent=e.cssText,i.appendChild(s)})},tt=j?i=>i:i=>i instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return Mt(e)})(i):i;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var L;const et=window.trustedTypes,Ht=et?et.emptyScript:"",st=window.reactiveElementPolyfillSupport,z={toAttribute(i,t){switch(t){case Boolean:i=i?Ht:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,t){let e=i;switch(t){case Boolean:e=i!==null;break;case Number:e=i===null?null:Number(i);break;case Object:case Array:try{e=JSON.parse(i)}catch{e=null}}return e}},it=(i,t)=>t!==i&&(t==t||i==i),B={attribute:!0,type:String,converter:z,reflect:!1,hasChanged:it};class S extends HTMLElement{constructor(){super(),this._$Et=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Ei=null,this.o()}static addInitializer(t){var e;(e=this.l)!==null&&e!==void 0||(this.l=[]),this.l.push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach((e,s)=>{const n=this._$Eh(s,e);n!==void 0&&(this._$Eu.set(n,s),t.push(n))}),t}static createProperty(t,e=B){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const s=typeof t=="symbol"?Symbol():"__"+t,n=this.getPropertyDescriptor(t,s,e);n!==void 0&&Object.defineProperty(this.prototype,t,n)}}static getPropertyDescriptor(t,e,s){return{get(){return this[e]},set(n){const r=this[t];this[e]=n,this.requestUpdate(t,r,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||B}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),this.elementProperties=new Map(t.elementProperties),this._$Eu=new Map,this.hasOwnProperty("properties")){const e=this.properties,s=[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)];for(const n of s)this.createProperty(n,e[n])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const n of s)e.unshift(tt(n))}else t!==void 0&&e.push(tt(t));return e}static _$Eh(t,e){const s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}o(){var t;this._$Ep=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$Em(),this.requestUpdate(),(t=this.constructor.l)===null||t===void 0||t.forEach(e=>e(this))}addController(t){var e,s;((e=this._$Eg)!==null&&e!==void 0?e:this._$Eg=[]).push(t),this.renderRoot!==void 0&&this.isConnected&&((s=t.hostConnected)===null||s===void 0||s.call(t))}removeController(t){var e;(e=this._$Eg)===null||e===void 0||e.splice(this._$Eg.indexOf(t)>>>0,1)}_$Em(){this.constructor.elementProperties.forEach((t,e)=>{this.hasOwnProperty(e)&&(this._$Et.set(e,this[e]),delete this[e])})}createRenderRoot(){var t;const e=(t=this.shadowRoot)!==null&&t!==void 0?t:this.attachShadow(this.constructor.shadowRootOptions);return Nt(e,this.constructor.elementStyles),e}connectedCallback(){var t;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$Eg)===null||t===void 0||t.forEach(e=>{var s;return(s=e.hostConnected)===null||s===void 0?void 0:s.call(e)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$Eg)===null||t===void 0||t.forEach(e=>{var s;return(s=e.hostDisconnected)===null||s===void 0?void 0:s.call(e)})}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ES(t,e,s=B){var n,r;const o=this.constructor._$Eh(t,s);if(o!==void 0&&s.reflect===!0){const h=((r=(n=s.converter)===null||n===void 0?void 0:n.toAttribute)!==null&&r!==void 0?r:z.toAttribute)(e,s.type);this._$Ei=t,h==null?this.removeAttribute(o):this.setAttribute(o,h),this._$Ei=null}}_$AK(t,e){var s,n,r;const o=this.constructor,h=o._$Eu.get(t);if(h!==void 0&&this._$Ei!==h){const l=o.getPropertyOptions(h),a=l.converter,p=(r=(n=(s=a)===null||s===void 0?void 0:s.fromAttribute)!==null&&n!==void 0?n:typeof a=="function"?a:null)!==null&&r!==void 0?r:z.fromAttribute;this._$Ei=h,this[h]=p(e,l.type),this._$Ei=null}}requestUpdate(t,e,s){let n=!0;t!==void 0&&(((s=s||this.constructor.getPropertyOptions(t)).hasChanged||it)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),s.reflect===!0&&this._$Ei!==t&&(this._$E_===void 0&&(this._$E_=new Map),this._$E_.set(t,s))):n=!1),!this.isUpdatePending&&n&&(this._$Ep=this._$EC())}async _$EC(){this.isUpdatePending=!0;try{await this._$Ep}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Et&&(this._$Et.forEach((n,r)=>this[r]=n),this._$Et=void 0);let e=!1;const s=this._$AL;try{e=this.shouldUpdate(s),e?(this.willUpdate(s),(t=this._$Eg)===null||t===void 0||t.forEach(n=>{var r;return(r=n.hostUpdate)===null||r===void 0?void 0:r.call(n)}),this.update(s)):this._$EU()}catch(n){throw e=!1,this._$EU(),n}e&&this._$AE(s)}willUpdate(t){}_$AE(t){var e;(e=this._$Eg)===null||e===void 0||e.forEach(s=>{var n;return(n=s.hostUpdated)===null||n===void 0?void 0:n.call(s)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EU(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$Ep}shouldUpdate(t){return!0}update(t){this._$E_!==void 0&&(this._$E_.forEach((e,s)=>this._$ES(s,this[s],e)),this._$E_=void 0),this._$EU()}updated(t){}firstUpdated(t){}}S.finalized=!0,S.elementProperties=new Map,S.elementStyles=[],S.shadowRootOptions={mode:"open"},st==null||st({ReactiveElement:S}),((L=globalThis.reactiveElementVersions)!==null&&L!==void 0?L:globalThis.reactiveElementVersions=[]).push("1.2.0");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var D;const y=globalThis.trustedTypes,nt=y?y.createPolicy("lit-html",{createHTML:i=>i}):void 0,v=`lit$${(Math.random()+"").slice(9)}$`,rt="?"+v,kt=`<${rt}>`,m=document,b=(i="")=>m.createComment(i),w=i=>i===null||typeof i!="object"&&typeof i!="function",ot=Array.isArray,jt=i=>{var t;return ot(i)||typeof((t=i)===null||t===void 0?void 0:t[Symbol.iterator])=="function"},C=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,lt=/-->/g,ht=/>/g,f=/>|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g,at=/'/g,ct=/"/g,dt=/^(?:script|style|textarea)$/i,Lt=i=>(t,...e)=>({_$litType$:i,strings:t,values:e}),ie=Lt(1),_=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),ut=new WeakMap,zt=(i,t,e)=>{var s,n;const r=(s=e==null?void 0:e.renderBefore)!==null&&s!==void 0?s:t;let o=r._$litPart$;if(o===void 0){const h=(n=e==null?void 0:e.renderBefore)!==null&&n!==void 0?n:null;r._$litPart$=o=new P(t.insertBefore(b(),h),h,void 0,e!=null?e:{})}return o._$AI(i),o},g=m.createTreeWalker(m,129,null,!1),Bt=(i,t)=>{const e=i.length-1,s=[];let n,r=t===2?"<svg>":"",o=C;for(let l=0;l<e;l++){const a=i[l];let p,c,d=-1,$=0;for(;$<a.length&&(o.lastIndex=$,c=o.exec(a),c!==null);)$=o.lastIndex,o===C?c[1]==="!--"?o=lt:c[1]!==void 0?o=ht:c[2]!==void 0?(dt.test(c[2])&&(n=RegExp("</"+c[2],"g")),o=f):c[3]!==void 0&&(o=f):o===f?c[0]===">"?(o=n!=null?n:C,d=-1):c[1]===void 0?d=-2:(d=o.lastIndex-c[2].length,p=c[1],o=c[3]===void 0?f:c[3]==='"'?ct:at):o===ct||o===at?o=f:o===lt||o===ht?o=C:(o=f,n=void 0);const T=o===f&&i[l+1].startsWith("/>")?" ":"";r+=o===C?a+kt:d>=0?(s.push(p),a.slice(0,d)+"$lit$"+a.slice(d)+v+T):a+v+(d===-2?(s.push(void 0),l):T)}const h=r+(i[e]||"<?>")+(t===2?"</svg>":"");if(!Array.isArray(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return[nt!==void 0?nt.createHTML(h):h,s]};class U{constructor({strings:t,_$litType$:e},s){let n;this.parts=[];let r=0,o=0;const h=t.length-1,l=this.parts,[a,p]=Bt(t,e);if(this.el=U.createElement(a,s),g.currentNode=this.el.content,e===2){const c=this.el.content,d=c.firstChild;d.remove(),c.append(...d.childNodes)}for(;(n=g.nextNode())!==null&&l.length<h;){if(n.nodeType===1){if(n.hasAttributes()){const c=[];for(const d of n.getAttributeNames())if(d.endsWith("$lit$")||d.startsWith(v)){const $=p[o++];if(c.push(d),$!==void 0){const T=n.getAttribute($.toLowerCase()+"$lit$").split(v),O=/([.?@])?(.*)/.exec($);l.push({type:1,index:r,name:O[2],strings:T,ctor:O[1]==="."?It:O[1]==="?"?qt:O[1]==="@"?Kt:x})}else l.push({type:6,index:r})}for(const d of c)n.removeAttribute(d)}if(dt.test(n.tagName)){const c=n.textContent.split(v),d=c.length-1;if(d>0){n.textContent=y?y.emptyScript:"";for(let $=0;$<d;$++)n.append(c[$],b()),g.nextNode(),l.push({type:2,index:++r});n.append(c[d],b())}}}else if(n.nodeType===8)if(n.data===rt)l.push({type:2,index:r});else{let c=-1;for(;(c=n.data.indexOf(v,c+1))!==-1;)l.push({type:7,index:r}),c+=v.length-1}r++}}static createElement(t,e){const s=m.createElement("template");return s.innerHTML=t,s}}function E(i,t,e=i,s){var n,r,o,h;if(t===_)return t;let l=s!==void 0?(n=e._$Cl)===null||n===void 0?void 0:n[s]:e._$Cu;const a=w(t)?void 0:t._$litDirective$;return(l==null?void 0:l.constructor)!==a&&((r=l==null?void 0:l._$AO)===null||r===void 0||r.call(l,!1),a===void 0?l=void 0:(l=new a(i),l._$AT(i,e,s)),s!==void 0?((o=(h=e)._$Cl)!==null&&o!==void 0?o:h._$Cl=[])[s]=l:e._$Cu=l),l!==void 0&&(t=E(i,l._$AS(i,t.values),l,s)),t}class Dt{constructor(t,e){this.v=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}p(t){var e;const{el:{content:s},parts:n}=this._$AD,r=((e=t==null?void 0:t.creationScope)!==null&&e!==void 0?e:m).importNode(s,!0);g.currentNode=r;let o=g.nextNode(),h=0,l=0,a=n[0];for(;a!==void 0;){if(h===a.index){let p;a.type===2?p=new P(o,o.nextSibling,this,t):a.type===1?p=new a.ctor(o,a.name,a.strings,this,t):a.type===6&&(p=new Wt(o,this,t)),this.v.push(p),a=n[++l]}h!==(a==null?void 0:a.index)&&(o=g.nextNode(),h++)}return r}m(t){let e=0;for(const s of this.v)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class P{constructor(t,e,s,n){var r;this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=n,this._$Cg=(r=n==null?void 0:n.isConnected)===null||r===void 0||r}get _$AU(){var t,e;return(e=(t=this._$AM)===null||t===void 0?void 0:t._$AU)!==null&&e!==void 0?e:this._$Cg}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&t.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=E(this,t,e),w(t)?t===u||t==null||t===""?(this._$AH!==u&&this._$AR(),this._$AH=u):t!==this._$AH&&t!==_&&this.$(t):t._$litType$!==void 0?this.T(t):t.nodeType!==void 0?this.S(t):jt(t)?this.A(t):this.$(t)}M(t,e=this._$AB){return this._$AA.parentNode.insertBefore(t,e)}S(t){this._$AH!==t&&(this._$AR(),this._$AH=this.M(t))}$(t){this._$AH!==u&&w(this._$AH)?this._$AA.nextSibling.data=t:this.S(m.createTextNode(t)),this._$AH=t}T(t){var e;const{values:s,_$litType$:n}=t,r=typeof n=="number"?this._$AC(t):(n.el===void 0&&(n.el=U.createElement(n.h,this.options)),n);if(((e=this._$AH)===null||e===void 0?void 0:e._$AD)===r)this._$AH.m(s);else{const o=new Dt(r,this),h=o.p(this.options);o.m(s),this.S(h),this._$AH=o}}_$AC(t){let e=ut.get(t.strings);return e===void 0&&ut.set(t.strings,e=new U(t)),e}A(t){ot(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,n=0;for(const r of t)n===e.length?e.push(s=new P(this.M(b()),this.M(b()),this,this.options)):s=e[n],s._$AI(r),n++;n<e.length&&(this._$AR(s&&s._$AB.nextSibling,n),e.length=n)}_$AR(t=this._$AA.nextSibling,e){var s;for((s=this._$AP)===null||s===void 0||s.call(this,!1,!0,e);t&&t!==this._$AB;){const n=t.nextSibling;t.remove(),t=n}}setConnected(t){var e;this._$AM===void 0&&(this._$Cg=t,(e=this._$AP)===null||e===void 0||e.call(this,t))}}class x{constructor(t,e,s,n,r){this.type=1,this._$AH=u,this._$AN=void 0,this.element=t,this.name=e,this._$AM=n,this.options=r,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=u}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,s,n){const r=this.strings;let o=!1;if(r===void 0)t=E(this,t,e,0),o=!w(t)||t!==this._$AH&&t!==_,o&&(this._$AH=t);else{const h=t;let l,a;for(t=r[0],l=0;l<r.length-1;l++)a=E(this,h[s+l],e,l),a===_&&(a=this._$AH[l]),o||(o=!w(a)||a!==this._$AH[l]),a===u?t=u:t!==u&&(t+=(a!=null?a:"")+r[l+1]),this._$AH[l]=a}o&&!n&&this.k(t)}k(t){t===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t!=null?t:"")}}class It extends x{constructor(){super(...arguments),this.type=3}k(t){this.element[this.name]=t===u?void 0:t}}const Vt=y?y.emptyScript:"";class qt extends x{constructor(){super(...arguments),this.type=4}k(t){t&&t!==u?this.element.setAttribute(this.name,Vt):this.element.removeAttribute(this.name)}}class Kt extends x{constructor(t,e,s,n,r){super(t,e,s,n,r),this.type=5}_$AI(t,e=this){var s;if((t=(s=E(this,t,e,0))!==null&&s!==void 0?s:u)===_)return;const n=this._$AH,r=t===u&&n!==u||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,o=t!==u&&(n===u||r);r&&this.element.removeEventListener(this.name,this,n),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,s;typeof this._$AH=="function"?this._$AH.call((s=(e=this.options)===null||e===void 0?void 0:e.host)!==null&&s!==void 0?s:this.element,t):this._$AH.handleEvent(t)}}class Wt{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){E(this,t)}}const pt=window.litHtmlPolyfillSupport;pt==null||pt(U,P),((D=globalThis.litHtmlVersions)!==null&&D!==void 0?D:globalThis.litHtmlVersions=[]).push("2.1.1");/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const I=window.ShadowRoot&&(window.ShadyCSS===void 0||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,V=Symbol(),$t=new Map;class vt{constructor(t,e){if(this._$cssResult$=!0,e!==V)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t}get styleSheet(){let t=$t.get(this.cssText);return I&&t===void 0&&($t.set(this.cssText,t=new CSSStyleSheet),t.replaceSync(this.cssText)),t}toString(){return this.cssText}}const Jt=i=>new vt(typeof i=="string"?i:i+"",V),ne=(i,...t)=>{const e=i.length===1?i[0]:t.reduce((s,n,r)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+i[r+1],i[0]);return new vt(e,V)},Zt=(i,t)=>{I?i.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet):t.forEach(e=>{const s=document.createElement("style"),n=window.litNonce;n!==void 0&&s.setAttribute("nonce",n),s.textContent=e.cssText,i.appendChild(s)})},_t=I?i=>i:i=>i instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return Jt(e)})(i):i;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var q;const ft=window.trustedTypes,Yt=ft?ft.emptyScript:"",yt=window.reactiveElementPolyfillSupport,K={toAttribute(i,t){switch(t){case Boolean:i=i?Yt:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,t){let e=i;switch(t){case Boolean:e=i!==null;break;case Number:e=i===null?null:Number(i);break;case Object:case Array:try{e=JSON.parse(i)}catch{e=null}}return e}},mt=(i,t)=>t!==i&&(t==t||i==i),W={attribute:!0,type:String,converter:K,reflect:!1,hasChanged:mt};class A extends HTMLElement{constructor(){super(),this._$Et=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Ei=null,this.o()}static addInitializer(t){var e;(e=this.l)!==null&&e!==void 0||(this.l=[]),this.l.push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach((e,s)=>{const n=this._$Eh(s,e);n!==void 0&&(this._$Eu.set(n,s),t.push(n))}),t}static createProperty(t,e=W){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const s=typeof t=="symbol"?Symbol():"__"+t,n=this.getPropertyDescriptor(t,s,e);n!==void 0&&Object.defineProperty(this.prototype,t,n)}}static getPropertyDescriptor(t,e,s){return{get(){return this[e]},set(n){const r=this[t];this[e]=n,this.requestUpdate(t,r,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||W}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),this.elementProperties=new Map(t.elementProperties),this._$Eu=new Map,this.hasOwnProperty("properties")){const e=this.properties,s=[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)];for(const n of s)this.createProperty(n,e[n])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const n of s)e.unshift(_t(n))}else t!==void 0&&e.push(_t(t));return e}static _$Eh(t,e){const s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}o(){var t;this._$Ep=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$Em(),this.requestUpdate(),(t=this.constructor.l)===null||t===void 0||t.forEach(e=>e(this))}addController(t){var e,s;((e=this._$Eg)!==null&&e!==void 0?e:this._$Eg=[]).push(t),this.renderRoot!==void 0&&this.isConnected&&((s=t.hostConnected)===null||s===void 0||s.call(t))}removeController(t){var e;(e=this._$Eg)===null||e===void 0||e.splice(this._$Eg.indexOf(t)>>>0,1)}_$Em(){this.constructor.elementProperties.forEach((t,e)=>{this.hasOwnProperty(e)&&(this._$Et.set(e,this[e]),delete this[e])})}createRenderRoot(){var t;const e=(t=this.shadowRoot)!==null&&t!==void 0?t:this.attachShadow(this.constructor.shadowRootOptions);return Zt(e,this.constructor.elementStyles),e}connectedCallback(){var t;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$Eg)===null||t===void 0||t.forEach(e=>{var s;return(s=e.hostConnected)===null||s===void 0?void 0:s.call(e)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$Eg)===null||t===void 0||t.forEach(e=>{var s;return(s=e.hostDisconnected)===null||s===void 0?void 0:s.call(e)})}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ES(t,e,s=W){var n,r;const o=this.constructor._$Eh(t,s);if(o!==void 0&&s.reflect===!0){const h=((r=(n=s.converter)===null||n===void 0?void 0:n.toAttribute)!==null&&r!==void 0?r:K.toAttribute)(e,s.type);this._$Ei=t,h==null?this.removeAttribute(o):this.setAttribute(o,h),this._$Ei=null}}_$AK(t,e){var s,n,r;const o=this.constructor,h=o._$Eu.get(t);if(h!==void 0&&this._$Ei!==h){const l=o.getPropertyOptions(h),a=l.converter,p=(r=(n=(s=a)===null||s===void 0?void 0:s.fromAttribute)!==null&&n!==void 0?n:typeof a=="function"?a:null)!==null&&r!==void 0?r:K.fromAttribute;this._$Ei=h,this[h]=p(e,l.type),this._$Ei=null}}requestUpdate(t,e,s){let n=!0;t!==void 0&&(((s=s||this.constructor.getPropertyOptions(t)).hasChanged||mt)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),s.reflect===!0&&this._$Ei!==t&&(this._$E_===void 0&&(this._$E_=new Map),this._$E_.set(t,s))):n=!1),!this.isUpdatePending&&n&&(this._$Ep=this._$EC())}async _$EC(){this.isUpdatePending=!0;try{await this._$Ep}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Et&&(this._$Et.forEach((n,r)=>this[r]=n),this._$Et=void 0);let e=!1;const s=this._$AL;try{e=this.shouldUpdate(s),e?(this.willUpdate(s),(t=this._$Eg)===null||t===void 0||t.forEach(n=>{var r;return(r=n.hostUpdate)===null||r===void 0?void 0:r.call(n)}),this.update(s)):this._$EU()}catch(n){throw e=!1,this._$EU(),n}e&&this._$AE(s)}willUpdate(t){}_$AE(t){var e;(e=this._$Eg)===null||e===void 0||e.forEach(s=>{var n;return(n=s.hostUpdated)===null||n===void 0?void 0:n.call(s)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EU(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$Ep}shouldUpdate(t){return!0}update(t){this._$E_!==void 0&&(this._$E_.forEach((e,s)=>this._$ES(s,this[s],e)),this._$E_=void 0),this._$EU()}updated(t){}firstUpdated(t){}}A.finalized=!0,A.elementProperties=new Map,A.elementStyles=[],A.shadowRootOptions={mode:"open"},yt==null||yt({ReactiveElement:A}),((q=globalThis.reactiveElementVersions)!==null&&q!==void 0?q:globalThis.reactiveElementVersions=[]).push("1.2.0");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var J,Z;class R extends A{constructor(){super(...arguments),this.renderOptions={host:this},this._$Dt=void 0}createRenderRoot(){var t,e;const s=super.createRenderRoot();return(t=(e=this.renderOptions).renderBefore)!==null&&t!==void 0||(e.renderBefore=s.firstChild),s}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Dt=zt(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Dt)===null||t===void 0||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Dt)===null||t===void 0||t.setConnected(!1)}render(){return _}}R.finalized=!0,R._$litElement$=!0,(J=globalThis.litElementHydrateSupport)===null||J===void 0||J.call(globalThis,{LitElement:R});const gt=globalThis.litElementPolyfillSupport;gt==null||gt({LitElement:R});((Z=globalThis.litElementVersions)!==null&&Z!==void 0?Z:globalThis.litElementVersions=[]).push("3.1.1");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Et={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},At=i=>(...t)=>({_$litDirective$:i,values:t});class St{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,s){this._$Ct=t,this._$AM=e,this._$Ci=s}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const re=At(class extends St{constructor(i){var t;if(super(i),i.type!==Et.ATTRIBUTE||i.name!=="class"||((t=i.strings)===null||t===void 0?void 0:t.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(i){return" "+Object.keys(i).filter(t=>i[t]).join(" ")+" "}update(i,[t]){var e,s;if(this.st===void 0){this.st=new Set,i.strings!==void 0&&(this.et=new Set(i.strings.join(" ").split(/\s/).filter(r=>r!=="")));for(const r in t)t[r]&&!((e=this.et)===null||e===void 0?void 0:e.has(r))&&this.st.add(r);return this.render(t)}const n=i.element.classList;this.st.forEach(r=>{r in t||(n.remove(r),this.st.delete(r))});for(const r in t){const o=!!t[r];o===this.st.has(r)||((s=this.et)===null||s===void 0?void 0:s.has(r))||(o?(n.add(r),this.st.add(r)):(n.remove(r),this.st.delete(r)))}return _}});/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const oe=At(class extends St{constructor(i){var t;if(super(i),i.type!==Et.ATTRIBUTE||i.name!=="style"||((t=i.strings)===null||t===void 0?void 0:t.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(i){return Object.keys(i).reduce((t,e)=>{const s=i[e];return s==null?t:t+`${e=e.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(i,[t]){const{style:e}=i.element;if(this.ct===void 0){this.ct=new Set;for(const s in t)this.ct.add(s);return this.render(t)}this.ct.forEach(s=>{t[s]==null&&(this.ct.delete(s),s.includes("-")?e.removeProperty(s):e[s]="")});for(const s in t){const n=t[s];n!=null&&(this.ct.add(s),s.includes("-")?e.setProperty(s,n):e[s]=n)}return _}});/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const le=i=>i!=null?i:u;export{ie as $,Gt as _,G as a,Qt as b,At as c,Xt as d,ee as e,_ as f,Ot as g,se as h,St as i,oe as j,le as l,te as n,re as o,ne as r,R as s,Et as t,u as w};
