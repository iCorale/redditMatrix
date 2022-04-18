import{G as n}from"./vendor.0ae95c6a.js";const l=n([]),y=n("idle"),b=n("");/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function p(e,t,r){const a=e.constructor;if(!r){const i=`__${t}`;if(r=a.getPropertyDescriptor(t,i),!r)throw new Error("@ariaProperty must be used after a @property decorator")}const o=r;let s="";if(!o.set)throw new Error(`@ariaProperty requires a setter for ${t}`);if(e.dispatchWizEvent)return r;const u={configurable:!0,enumerable:!0,set(i){if(s===""){const c=a.getPropertyOptions(t);s=typeof c.attribute=="string"?c.attribute:t}this.hasAttribute(s)&&this.removeAttribute(s),o.set.call(this,i)}};return o.get&&(u.get=function(){return o.get.call(this)}),u}function h(e,t,r){if(t!==void 0)return p(e,t,r);throw new Error("@ariaProperty only supports TypeScript Decorators")}export{h as a,y as m,l as p,b as q};
