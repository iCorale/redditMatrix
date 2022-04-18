import{S as L,i as B,s as R,I as O,J as nt,K as D,j as I,L as ot,n as V,k as M,M as F,a5 as U,g as y,c as S,o as E,z as g,h as z,A as b,m as C,T as W,U as Y,V as q,t as _,a as w,d as k,q as T,D as K,F as N,ai as ht,B as $,C as it,aa as bt,r as gt,u as st,x as Q,y as pt,a4 as Nt,w as _t,l as wt,p as $t,a0 as vt,a3 as yt,aj as Pt}from"./vendor.0ae95c6a.js";import{_ as Tt,a as xt,b as P,e as tt,$ as ct,o as At,r as jt,n as Dt}from"./if-defined.6486e9c9.js";import{M as Vt,i as St,B as Ft,a as Ut,c as Wt,d as X}from"./mwc-list.64318535.js";import{a as Yt,S as qt,C as Gt}from"./CancellableList.15ab555b.js";import{m as H,q as Z}from"./aria-property.797fe874.js";import{h as Xt,a as Zt,s as Jt}from"./Card.4f5ef0cb.js";import"./index.bb1110f9.js";import"./transition.171a74a8.js";/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */var Kt={FIXED_CLASS:"mdc-top-app-bar--fixed",FIXED_SCROLLED_CLASS:"mdc-top-app-bar--fixed-scrolled",SHORT_CLASS:"mdc-top-app-bar--short",SHORT_COLLAPSED_CLASS:"mdc-top-app-bar--short-collapsed",SHORT_HAS_ACTION_ITEM_CLASS:"mdc-top-app-bar--short-has-action-item"},et={DEBOUNCE_THROTTLE_RESIZE_TIME_MS:100,MAX_TOP_APP_BAR_HEIGHT:128},Et={ACTION_ITEM_SELECTOR:".mdc-top-app-bar__action-item",NAVIGATION_EVENT:"MDCTopAppBar:nav",NAVIGATION_ICON_SELECTOR:".mdc-top-app-bar__navigation-icon",ROOT_SELECTOR:".mdc-top-app-bar",TITLE_SELECTOR:".mdc-top-app-bar__title"};/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */var Qt=function(e){Tt(t,e);function t(a){return e.call(this,xt(xt({},t.defaultAdapter),a))||this}return Object.defineProperty(t,"strings",{get:function(){return Et},enumerable:!1,configurable:!0}),Object.defineProperty(t,"cssClasses",{get:function(){return Kt},enumerable:!1,configurable:!0}),Object.defineProperty(t,"numbers",{get:function(){return et},enumerable:!1,configurable:!0}),Object.defineProperty(t,"defaultAdapter",{get:function(){return{addClass:function(){},removeClass:function(){},hasClass:function(){return!1},setStyle:function(){},getTopAppBarHeight:function(){return 0},notifyNavigationIconClicked:function(){},getViewportScrollY:function(){return 0},getTotalActionItems:function(){return 0}}},enumerable:!1,configurable:!0}),t.prototype.handleTargetScroll=function(){},t.prototype.handleWindowResize=function(){},t.prototype.handleNavigationClick=function(){this.adapter.notifyNavigationIconClicked()},t}(Vt);/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */var rt=0,te=function(e){Tt(t,e);function t(a){var r=e.call(this,a)||this;return r.wasDocked=!0,r.isDockedShowing=!0,r.currentAppBarOffsetTop=0,r.isCurrentlyBeingResized=!1,r.resizeThrottleId=rt,r.resizeDebounceId=rt,r.lastScrollPosition=r.adapter.getViewportScrollY(),r.topAppBarHeight=r.adapter.getTopAppBarHeight(),r}return t.prototype.destroy=function(){e.prototype.destroy.call(this),this.adapter.setStyle("top","")},t.prototype.handleTargetScroll=function(){var a=Math.max(this.adapter.getViewportScrollY(),0),r=a-this.lastScrollPosition;this.lastScrollPosition=a,this.isCurrentlyBeingResized||(this.currentAppBarOffsetTop-=r,this.currentAppBarOffsetTop>0?this.currentAppBarOffsetTop=0:Math.abs(this.currentAppBarOffsetTop)>this.topAppBarHeight&&(this.currentAppBarOffsetTop=-this.topAppBarHeight),this.moveTopAppBar())},t.prototype.handleWindowResize=function(){var a=this;this.resizeThrottleId||(this.resizeThrottleId=setTimeout(function(){a.resizeThrottleId=rt,a.throttledResizeHandler()},et.DEBOUNCE_THROTTLE_RESIZE_TIME_MS)),this.isCurrentlyBeingResized=!0,this.resizeDebounceId&&clearTimeout(this.resizeDebounceId),this.resizeDebounceId=setTimeout(function(){a.handleTargetScroll(),a.isCurrentlyBeingResized=!1,a.resizeDebounceId=rt},et.DEBOUNCE_THROTTLE_RESIZE_TIME_MS)},t.prototype.checkForUpdate=function(){var a=-this.topAppBarHeight,r=this.currentAppBarOffsetTop<0,o=this.currentAppBarOffsetTop>a,n=r&&o;if(n)this.wasDocked=!1;else if(this.wasDocked){if(this.isDockedShowing!==o)return this.isDockedShowing=o,!0}else return this.wasDocked=!0,!0;return n},t.prototype.moveTopAppBar=function(){if(this.checkForUpdate()){var a=this.currentAppBarOffsetTop;Math.abs(a)>=this.topAppBarHeight&&(a=-et.MAX_TOP_APP_BAR_HEIGHT),this.adapter.setStyle("top",a+"px")}},t.prototype.throttledResizeHandler=function(){var a=this.adapter.getTopAppBarHeight();this.topAppBarHeight!==a&&(this.wasDocked=!1,this.currentAppBarOffsetTop-=this.topAppBarHeight-a,this.topAppBarHeight=a),this.handleTargetScroll()},t}(Qt),ee=te;/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Ct=Wt?{passive:!0}:void 0;class J extends Ft{constructor(){super(...arguments);this.centerTitle=!1,this.handleTargetScroll=()=>{this.mdcFoundation.handleTargetScroll()},this.handleNavigationClick=()=>{this.mdcFoundation.handleNavigationClick()}}get scrollTarget(){return this._scrollTarget||window}set scrollTarget(t){this.unregisterScrollListener();const a=this.scrollTarget;this._scrollTarget=t,this.updateRootPosition(),this.requestUpdate("scrollTarget",a),this.registerScrollListener()}updateRootPosition(){if(this.mdcRoot){const t=this.scrollTarget===window;this.mdcRoot.style.position=t?"":"absolute"}}render(){let t=ct`<span class="mdc-top-app-bar__title"><slot name="title"></slot></span>`;return this.centerTitle&&(t=ct`<section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-center">${t}</section>`),ct`
      <header class="mdc-top-app-bar ${At(this.barClasses())}">
      <div class="mdc-top-app-bar__row">
        <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start" id="navigation">
          <slot name="navigationIcon"
            @click=${this.handleNavigationClick}></slot>
          ${this.centerTitle?null:t}
        </section>
        ${this.centerTitle?t:null}
        <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" id="actions" role="toolbar">
          <slot name="actionItems"></slot>
        </section>
      </div>
    </header>
    <div class="${At(this.contentClasses())}">
      <slot></slot>
    </div>
    `}createAdapter(){return Object.assign(Object.assign({},Ut(this.mdcRoot)),{setStyle:(t,a)=>this.mdcRoot.style.setProperty(t,a),getTopAppBarHeight:()=>this.mdcRoot.clientHeight,notifyNavigationIconClicked:()=>{this.dispatchEvent(new Event(Et.NAVIGATION_EVENT,{bubbles:!0,cancelable:!0}))},getViewportScrollY:()=>this.scrollTarget instanceof Window?this.scrollTarget.pageYOffset:this.scrollTarget.scrollTop,getTotalActionItems:()=>this._actionItemsSlot.assignedNodes({flatten:!0}).length})}registerListeners(){this.registerScrollListener()}unregisterListeners(){this.unregisterScrollListener()}registerScrollListener(){this.scrollTarget.addEventListener("scroll",this.handleTargetScroll,Ct)}unregisterScrollListener(){this.scrollTarget.removeEventListener("scroll",this.handleTargetScroll)}firstUpdated(){super.firstUpdated(),this.updateRootPosition(),this.registerListeners()}disconnectedCallback(){super.disconnectedCallback(),this.unregisterListeners()}}P([St(".mdc-top-app-bar")],J.prototype,"mdcRoot",void 0);P([St('slot[name="actionItems"]')],J.prototype,"_actionItemsSlot",void 0);P([tt({type:Boolean})],J.prototype,"centerTitle",void 0);P([tt({type:Object})],J.prototype,"scrollTarget",null);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class lt extends J{constructor(){super(...arguments);this.mdcFoundationClass=ee,this.prominent=!1,this.dense=!1,this.handleResize=()=>{this.mdcFoundation.handleWindowResize()}}barClasses(){return{"mdc-top-app-bar--dense":this.dense,"mdc-top-app-bar--prominent":this.prominent,"center-title":this.centerTitle}}contentClasses(){return{"mdc-top-app-bar--fixed-adjust":!this.dense&&!this.prominent,"mdc-top-app-bar--dense-fixed-adjust":this.dense&&!this.prominent,"mdc-top-app-bar--prominent-fixed-adjust":!this.dense&&this.prominent,"mdc-top-app-bar--dense-prominent-fixed-adjust":this.dense&&this.prominent}}registerListeners(){super.registerListeners(),window.addEventListener("resize",this.handleResize,Ct)}unregisterListeners(){super.unregisterListeners(),window.removeEventListener("resize",this.handleResize)}}P([tt({type:Boolean,reflect:!0})],lt.prototype,"prominent",void 0);P([tt({type:Boolean,reflect:!0})],lt.prototype,"dense",void 0);/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-LIcense-Identifier: Apache-2.0
 */const re=jt`.mdc-top-app-bar{background-color:#6200ee;background-color:var(--mdc-theme-primary, #6200ee);color:white;display:flex;position:fixed;flex-direction:column;justify-content:space-between;box-sizing:border-box;width:100%;z-index:4}.mdc-top-app-bar .mdc-top-app-bar__action-item,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon{color:#fff;color:var(--mdc-theme-on-primary, #fff)}.mdc-top-app-bar .mdc-top-app-bar__action-item::before,.mdc-top-app-bar .mdc-top-app-bar__action-item::after,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon::after{background-color:#fff;background-color:var(--mdc-ripple-color, var(--mdc-theme-on-primary, #fff))}.mdc-top-app-bar .mdc-top-app-bar__action-item:hover::before,.mdc-top-app-bar .mdc-top-app-bar__action-item.mdc-ripple-surface--hover::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon:hover::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon.mdc-ripple-surface--hover::before{opacity:0.08;opacity:var(--mdc-ripple-hover-opacity, 0.08)}.mdc-top-app-bar .mdc-top-app-bar__action-item.mdc-ripple-upgraded--background-focused::before,.mdc-top-app-bar .mdc-top-app-bar__action-item:not(.mdc-ripple-upgraded):focus::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded--background-focused::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:0.24;opacity:var(--mdc-ripple-focus-opacity, 0.24)}.mdc-top-app-bar .mdc-top-app-bar__action-item:not(.mdc-ripple-upgraded)::after,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-top-app-bar .mdc-top-app-bar__action-item:not(.mdc-ripple-upgraded):active::after,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:0.24;opacity:var(--mdc-ripple-press-opacity, 0.24)}.mdc-top-app-bar .mdc-top-app-bar__action-item.mdc-ripple-upgraded,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded{--mdc-ripple-fg-opacity:var(--mdc-ripple-press-opacity, 0.24)}.mdc-top-app-bar__row{display:flex;position:relative;box-sizing:border-box;width:100%;height:64px}.mdc-top-app-bar__section{display:inline-flex;flex:1 1 auto;align-items:center;min-width:0;padding:8px 12px;z-index:1}.mdc-top-app-bar__section--align-start{justify-content:flex-start;order:-1}.mdc-top-app-bar__section--align-end{justify-content:flex-end;order:1}.mdc-top-app-bar__title{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-headline6-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:1.25rem;font-size:var(--mdc-typography-headline6-font-size, 1.25rem);line-height:2rem;line-height:var(--mdc-typography-headline6-line-height, 2rem);font-weight:500;font-weight:var(--mdc-typography-headline6-font-weight, 500);letter-spacing:0.0125em;letter-spacing:var(--mdc-typography-headline6-letter-spacing, 0.0125em);text-decoration:inherit;text-decoration:var(--mdc-typography-headline6-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-headline6-text-transform, inherit);padding-left:20px;padding-right:0;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;z-index:1}[dir=rtl] .mdc-top-app-bar__title,.mdc-top-app-bar__title[dir=rtl]{padding-left:0;padding-right:20px}.mdc-top-app-bar--short-collapsed{border-top-left-radius:0;border-top-right-radius:0;border-bottom-right-radius:24px;border-bottom-left-radius:0}[dir=rtl] .mdc-top-app-bar--short-collapsed,.mdc-top-app-bar--short-collapsed[dir=rtl]{border-top-left-radius:0;border-top-right-radius:0;border-bottom-right-radius:0;border-bottom-left-radius:24px}.mdc-top-app-bar--short{top:0;right:auto;left:0;width:100%;transition:width 250ms cubic-bezier(0.4, 0, 0.2, 1)}[dir=rtl] .mdc-top-app-bar--short,.mdc-top-app-bar--short[dir=rtl]{right:0;left:auto}.mdc-top-app-bar--short .mdc-top-app-bar__row{height:56px}.mdc-top-app-bar--short .mdc-top-app-bar__section{padding:4px}.mdc-top-app-bar--short .mdc-top-app-bar__title{transition:opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);opacity:1}.mdc-top-app-bar--short-collapsed{box-shadow:0px 2px 4px -1px rgba(0, 0, 0, 0.2),0px 4px 5px 0px rgba(0, 0, 0, 0.14),0px 1px 10px 0px rgba(0,0,0,.12);width:56px;transition:width 300ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-top-app-bar--short-collapsed .mdc-top-app-bar__title{display:none}.mdc-top-app-bar--short-collapsed .mdc-top-app-bar__action-item{transition:padding 150ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item{width:112px}.mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item .mdc-top-app-bar__section--align-end{padding-left:0;padding-right:12px}[dir=rtl] .mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item .mdc-top-app-bar__section--align-end,.mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item .mdc-top-app-bar__section--align-end[dir=rtl]{padding-left:12px;padding-right:0}.mdc-top-app-bar--dense .mdc-top-app-bar__row{height:48px}.mdc-top-app-bar--dense .mdc-top-app-bar__section{padding:0 4px}.mdc-top-app-bar--dense .mdc-top-app-bar__title{padding-left:12px;padding-right:0}[dir=rtl] .mdc-top-app-bar--dense .mdc-top-app-bar__title,.mdc-top-app-bar--dense .mdc-top-app-bar__title[dir=rtl]{padding-left:0;padding-right:12px}.mdc-top-app-bar--prominent .mdc-top-app-bar__row{height:128px}.mdc-top-app-bar--prominent .mdc-top-app-bar__title{align-self:flex-end;padding-bottom:2px}.mdc-top-app-bar--prominent .mdc-top-app-bar__action-item,.mdc-top-app-bar--prominent .mdc-top-app-bar__navigation-icon{align-self:flex-start}.mdc-top-app-bar--fixed{transition:box-shadow 200ms linear}.mdc-top-app-bar--fixed-scrolled{box-shadow:0px 2px 4px -1px rgba(0, 0, 0, 0.2),0px 4px 5px 0px rgba(0, 0, 0, 0.14),0px 1px 10px 0px rgba(0,0,0,.12);transition:box-shadow 200ms linear}.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__row{height:96px}.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__section{padding:0 12px}.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__title{padding-left:20px;padding-right:0;padding-bottom:9px}[dir=rtl] .mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__title,.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__title[dir=rtl]{padding-left:0;padding-right:20px}.mdc-top-app-bar--fixed-adjust{padding-top:64px}.mdc-top-app-bar--dense-fixed-adjust{padding-top:48px}.mdc-top-app-bar--short-fixed-adjust{padding-top:56px}.mdc-top-app-bar--prominent-fixed-adjust{padding-top:128px}.mdc-top-app-bar--dense-prominent-fixed-adjust{padding-top:96px}@media(max-width: 599px){.mdc-top-app-bar__row{height:56px}.mdc-top-app-bar__section{padding:4px}.mdc-top-app-bar--short{transition:width 200ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-top-app-bar--short-collapsed{transition:width 250ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-top-app-bar--short-collapsed .mdc-top-app-bar__section--align-end{padding-left:0;padding-right:12px}[dir=rtl] .mdc-top-app-bar--short-collapsed .mdc-top-app-bar__section--align-end,.mdc-top-app-bar--short-collapsed .mdc-top-app-bar__section--align-end[dir=rtl]{padding-left:12px;padding-right:0}.mdc-top-app-bar--prominent .mdc-top-app-bar__title{padding-bottom:6px}.mdc-top-app-bar--fixed-adjust{padding-top:56px}}:host{display:block}.mdc-top-app-bar{color:#fff;color:var(--mdc-theme-on-primary, #fff);width:100%;width:var(--mdc-top-app-bar-width, 100%)}.mdc-top-app-bar--prominent #navigation ::slotted(*),.mdc-top-app-bar--prominent #actions ::slotted(*){align-self:flex-start}#navigation ::slotted(*),#actions ::slotted(*){--mdc-icon-button-ripple-opacity: 0.24}.mdc-top-app-bar--short-collapsed #actions ::slotted(*){transition:padding 150ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-top-app-bar__section--align-center{justify-content:center}.mdc-top-app-bar__section--align-center .mdc-top-app-bar__title{padding-left:0;padding-right:0}.center-title .mdc-top-app-bar__section--align-start,.center-title .mdc-top-app-bar__section--align-end{flex-basis:0}.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__section--align-center .mdc-top-app-bar__title{padding-left:0;padding-right:0}.mdc-top-app-bar--fixed-scrolled{box-shadow:var(--mdc-top-app-bar-fixed-box-shadow, 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12))}`;/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */let dt=class extends lt{};dt.styles=[re];dt=P([Dt("mwc-top-app-bar")],dt);function ae(e){let t,a='<path d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z" fill="currentColor"/>',r=[{width:"1.2em"},{height:"1.2em"},{preserveAspectRatio:"xMidYMid meet"},{viewBox:"0 0 24 24"},e[0]],o={};for(let n=0;n<r.length;n+=1)o=O(o,r[n]);return{c(){t=nt("svg"),D(t,o)},m(n,i){I(n,t,i),t.innerHTML=a},p(n,[i]){D(t,o=ot(r,[{width:"1.2em"},{height:"1.2em"},{preserveAspectRatio:"xMidYMid meet"},{viewBox:"0 0 24 24"},i&1&&n[0]]))},i:V,o:V,d(n){n&&M(t)}}}function ne(e,t,a){return e.$$set=r=>{a(0,t=O(O({},t),F(r)))},t=F(t),[t]}class oe extends L{constructor(t){super();B(this,t,ne,ae,R,{})}}function ie(e){let t,a,r,o,n,i,p;r=new oe({});const d=e[2].default,c=U(d,e,e[1],null);return{c(){t=y("mwc-top-app-bar"),a=y("mwc-icon-button"),S(r.$$.fragment),o=E(),n=y("div"),n.textContent="RMatrix",i=E(),c&&c.c(),g(a,"aria-label","navigation drawer"),g(a,"slot","navigationIcon"),z(n,"slot","title"),g(t,"dense",e[0])},m(l,m){I(l,t,m),b(t,a),C(r,a,null),b(t,o),b(t,n),b(t,i),c&&c.m(t,null),p=!0},p(l,[m]){c&&c.p&&(!p||m&2)&&W(c,d,l,l[1],p?q(d,l[1],m,null):Y(l[1]),null),(!p||m&1)&&g(t,"dense",l[0])},i(l){p||(_(r.$$.fragment,l),_(c,l),p=!0)},o(l){w(r.$$.fragment,l),w(c,l),p=!1},d(l){l&&M(t),k(r),c&&c.d(l)}}}function se(e,t,a){let r;T(e,H,p=>a(3,r=p));let{$$slots:o={},$$scope:n}=t,{dense:i}=t;return K(()=>{N(H,r="idle",r)}),e.$$set=p=>{"dense"in p&&a(0,i=p.dense),"$$scope"in p&&a(1,n=p.$$scope)},[i,n,o]}class pe extends L{constructor(t){super();B(this,t,se,ie,R,{dense:0})}}function ce(e){let t,a='<path d="M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11h12z" fill="currentColor"/>',r=[{width:"1.2em"},{height:"1.2em"},{preserveAspectRatio:"xMidYMid meet"},{viewBox:"0 0 24 24"},e[0]],o={};for(let n=0;n<r.length;n+=1)o=O(o,r[n]);return{c(){t=nt("svg"),D(t,o)},m(n,i){I(n,t,i),t.innerHTML=a},p(n,[i]){D(t,o=ot(r,[{width:"1.2em"},{height:"1.2em"},{preserveAspectRatio:"xMidYMid meet"},{viewBox:"0 0 24 24"},i&1&&n[0]]))},i:V,o:V,d(n){n&&M(t)}}}function le(e,t,a){return e.$$set=r=>{a(0,t=O(O({},t),F(r)))},t=F(t),[t]}class kt extends L{constructor(t){super();B(this,t,le,ce,R,{})}}function de(e){let t,a,r,o,n,i,p,d,c,l;r=new kt({});const m=e[7].default,s=U(m,e,e[6],null);return{c(){t=y("mwc-top-app-bar"),a=y("mwc-icon-button"),S(r.$$.fragment),o=E(),n=y("input"),p=E(),s&&s.c(),g(a,"aria-label","back"),g(a,"slot","navigationIcon"),z(n,"id","searchbar"),z(n,"autocomplete","off"),z(n,"slot","title"),z(n,"placeholder",i=`Search r/${e[4].subreddit}`),z(n,"class","svelte-j75jqb"),g(t,"dense",e[0])},m(f,v){I(f,t,v),b(t,a),C(r,a,null),b(t,o),b(t,n),e[9](n),ht(n,e[3]),b(t,p),s&&s.m(t,null),d=!0,c||(l=[$(a,"click",e[8]),$(n,"keypress",e[5]),$(n,"input",e[10])],c=!0)},p(f,[v]){(!d||v&16&&i!==(i=`Search r/${f[4].subreddit}`))&&z(n,"placeholder",i),v&8&&n.value!==f[3]&&ht(n,f[3]),s&&s.p&&(!d||v&64)&&W(s,m,f,f[6],d?q(m,f[6],v,null):Y(f[6]),null),(!d||v&1)&&g(t,"dense",f[0])},i(f){d||(_(r.$$.fragment,f),_(s,f),d=!0)},o(f){w(r.$$.fragment,f),w(s,f),d=!1},d(f){f&&M(t),k(r),e[9](null),s&&s.d(f),c=!1,it(l)}}}function ue(e,t,a){let r,o,n,i,p;T(e,H,u=>a(2,r=u)),T(e,Z,u=>a(3,o=u)),T(e,bt,u=>a(4,n=u)),T(e,gt,u=>a(11,i=u)),T(e,X,u=>a(12,p=u));let{$$slots:d={},$$scope:c}=t,{dense:l}=t,m;K(async()=>{Promise.resolve().then(()=>m.focus())});function s(u){u.key==="Enter"&&(p.includes(o.toLowerCase())||(p.push(o.toLowerCase()),p.sort(),X.set(p)),i(`/r/${n.subreddit}?q=${o}`),N(H,r="idle",r))}const f=()=>{N(H,r="idle",r)};function v(u){st[u?"unshift":"push"](()=>{m=u,a(1,m)})}function x(){o=this.value,Z.set(o)}return e.$$set=u=>{"dense"in u&&a(0,l=u.dense),"$$scope"in u&&a(6,c=u.$$scope)},[l,m,r,o,n,s,c,d,f,v,x]}class me extends L{constructor(t){super();B(this,t,ue,de,R,{dense:0})}}function fe(e){let t,a='<path d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12V1z" fill="currentColor"/>',r=[{width:"1.2em"},{height:"1.2em"},{preserveAspectRatio:"xMidYMid meet"},{viewBox:"0 0 24 24"},e[0]],o={};for(let n=0;n<r.length;n+=1)o=O(o,r[n]);return{c(){t=nt("svg"),D(t,o)},m(n,i){I(n,t,i),t.innerHTML=a},p(n,[i]){D(t,o=ot(r,[{width:"1.2em"},{height:"1.2em"},{preserveAspectRatio:"xMidYMid meet"},{viewBox:"0 0 24 24"},i&1&&n[0]]))},i:V,o:V,d(n){n&&M(t)}}}function he(e,t,a){return e.$$set=r=>{a(0,t=O(O({},t),F(r)))},t=F(t),[t]}class be extends L{constructor(t){super();B(this,t,he,fe,R,{})}}function ge(e){let t,a,r,o,n,i,p,d,c,l,m,s,f,v;r=new Yt({}),l=new be({});const x=e[3].default,u=U(x,e,e[2],null);return{c(){t=y("mwc-top-app-bar"),a=y("mwc-icon-button"),S(r.$$.fragment),o=E(),n=y("div"),i=Q(e[1]),p=Q(" Selected"),d=E(),c=y("mwc-icon-button"),S(l.$$.fragment),m=E(),u&&u.c(),g(a,"aria-label","discard selection"),g(a,"slot","navigationIcon"),z(n,"slot","title"),g(c,"aria-label","search"),g(c,"slot","actionItems"),g(t,"dense",e[0])},m(h,A){I(h,t,A),b(t,a),C(r,a,null),b(t,o),b(t,n),b(n,i),b(n,p),b(t,d),b(t,c),C(l,c,null),b(t,m),u&&u.m(t,null),s=!0,f||(v=[$(a,"click",Xt),$(c,"click",Zt)],f=!0)},p(h,[A]){(!s||A&2)&&pt(i,h[1]),u&&u.p&&(!s||A&4)&&W(u,x,h,h[2],s?q(x,h[2],A,null):Y(h[2]),null),(!s||A&1)&&g(t,"dense",h[0])},i(h){s||(_(r.$$.fragment,h),_(l.$$.fragment,h),_(u,h),s=!0)},o(h){w(r.$$.fragment,h),w(l.$$.fragment,h),w(u,h),s=!1},d(h){h&&M(t),k(r),k(l),u&&u.d(h),f=!1,it(v)}}}function _e(e,t,a){let r;T(e,Jt,p=>a(1,r=p));let{$$slots:o={},$$scope:n}=t,{dense:i}=t;return e.$$set=p=>{"dense"in p&&a(0,i=p.dense),"$$scope"in p&&a(2,n=p.$$scope)},[i,r,n,o]}class we extends L{constructor(t){super();B(this,t,_e,ge,R,{dense:0})}}function ve(e){let t,a,r,o,n,i=e[1].subreddit+"",p,d,c,l,m,s,f,v;r=new kt({}),l=new qt({});const x=e[5].default,u=U(x,e,e[4],null);return{c(){t=y("mwc-top-app-bar"),a=y("mwc-icon-button"),S(r.$$.fragment),o=E(),n=y("div"),p=Q(i),d=E(),c=y("mwc-icon-button"),S(l.$$.fragment),m=E(),u&&u.c(),g(a,"aria-label","home"),g(a,"slot","navigationIcon"),z(n,"slot","title"),g(c,"aria-label","search"),g(c,"slot","actionItems"),g(t,"dense",e[0])},m(h,A){I(h,t,A),b(t,a),C(r,a,null),b(t,o),b(t,n),b(n,p),b(t,d),b(t,c),C(l,c,null),b(t,m),u&&u.m(t,null),s=!0,f||(v=[$(a,"click",e[3]),$(c,"click",e[6])],f=!0)},p(h,[A]){(!s||A&2)&&i!==(i=h[1].subreddit+"")&&pt(p,i),u&&u.p&&(!s||A&16)&&W(u,x,h,h[4],s?q(x,h[4],A,null):Y(h[4]),null),(!s||A&1)&&g(t,"dense",h[0])},i(h){s||(_(r.$$.fragment,h),_(l.$$.fragment,h),_(u,h),s=!0)},o(h){w(r.$$.fragment,h),w(l.$$.fragment,h),w(u,h),s=!1},d(h){h&&M(t),k(r),k(l),u&&u.d(h),f=!1,it(v)}}}function ye(e,t,a){let r,o,n;T(e,H,s=>a(7,r=s)),T(e,gt,s=>a(8,o=s)),T(e,bt,s=>a(1,n=s));let{$$slots:i={},$$scope:p}=t;const d=Nt();let{dense:c}=t;function l(){o("/")}K(()=>{N(H,r="idle",r)});const m=()=>d("search");return e.$$set=s=>{"dense"in s&&a(0,c=s.dense),"$$scope"in s&&a(4,p=s.$$scope)},[c,n,d,l,p,i,m]}class Te extends L{constructor(t){super();B(this,t,ye,ve,R,{dense:0})}}const Lt=Symbol("Comlink.proxy"),xe=Symbol("Comlink.endpoint"),Ae=Symbol("Comlink.releaseProxy"),ut=Symbol("Comlink.thrown"),Bt=e=>typeof e=="object"&&e!==null||typeof e=="function",Se={canHandle:e=>Bt(e)&&e[Lt],serialize(e){const{port1:t,port2:a}=new MessageChannel;return It(e,t),[a,[a]]},deserialize(e){return e.start(),Ot(e)}},Ee={canHandle:e=>Bt(e)&&ut in e,serialize({value:e}){let t;return e instanceof Error?t={isError:!0,value:{message:e.message,name:e.name,stack:e.stack}}:t={isError:!1,value:e},[t,[]]},deserialize(e){throw e.isError?Object.assign(new Error(e.value.message),e.value):e.value}},Rt=new Map([["proxy",Se],["throw",Ee]]);function It(e,t=self){t.addEventListener("message",function a(r){if(!r||!r.data)return;const{id:o,type:n,path:i}=Object.assign({path:[]},r.data),p=(r.data.argumentList||[]).map(j);let d;try{const c=i.slice(0,-1).reduce((m,s)=>m[s],e),l=i.reduce((m,s)=>m[s],e);switch(n){case"GET":d=l;break;case"SET":c[i.slice(-1)[0]]=j(r.data.value),d=!0;break;case"APPLY":d=l.apply(c,p);break;case"CONSTRUCT":{const m=new l(...p);d=Be(m)}break;case"ENDPOINT":{const{port1:m,port2:s}=new MessageChannel;It(e,s),d=Le(m,[m])}break;case"RELEASE":d=void 0;break;default:return}}catch(c){d={value:c,[ut]:0}}Promise.resolve(d).catch(c=>({value:c,[ut]:0})).then(c=>{const[l,m]=ft(c);t.postMessage(Object.assign(Object.assign({},l),{id:o}),m),n==="RELEASE"&&(t.removeEventListener("message",a),Mt(t))})}),t.start&&t.start()}function Ce(e){return e.constructor.name==="MessagePort"}function Mt(e){Ce(e)&&e.close()}function Ot(e,t){return mt(e,[],t)}function at(e){if(e)throw new Error("Proxy has been released and is not useable")}function mt(e,t=[],a=function(){}){let r=!1;const o=new Proxy(a,{get(n,i){if(at(r),i===Ae)return()=>G(e,{type:"RELEASE",path:t.map(p=>p.toString())}).then(()=>{Mt(e),r=!0});if(i==="then"){if(t.length===0)return{then:()=>o};const p=G(e,{type:"GET",path:t.map(d=>d.toString())}).then(j);return p.then.bind(p)}return mt(e,[...t,i])},set(n,i,p){at(r);const[d,c]=ft(p);return G(e,{type:"SET",path:[...t,i].map(l=>l.toString()),value:d},c).then(j)},apply(n,i,p){at(r);const d=t[t.length-1];if(d===xe)return G(e,{type:"ENDPOINT"}).then(j);if(d==="bind")return mt(e,t.slice(0,-1));const[c,l]=zt(p);return G(e,{type:"APPLY",path:t.map(m=>m.toString()),argumentList:c},l).then(j)},construct(n,i){at(r);const[p,d]=zt(i);return G(e,{type:"CONSTRUCT",path:t.map(c=>c.toString()),argumentList:p},d).then(j)}});return o}function ke(e){return Array.prototype.concat.apply([],e)}function zt(e){const t=e.map(ft);return[t.map(a=>a[0]),ke(t.map(a=>a[1]))]}const Ht=new WeakMap;function Le(e,t){return Ht.set(e,t),e}function Be(e){return Object.assign(e,{[Lt]:!0})}function ft(e){for(const[t,a]of Rt)if(a.canHandle(e)){const[r,o]=a.serialize(e);return[{type:"HANDLER",name:t,value:r},o]}return[{type:"RAW",value:e},Ht.get(e)||[]]}function j(e){switch(e.type){case"HANDLER":return Rt.get(e.name).deserialize(e.value);case"RAW":return e.value}}function G(e,t,a){return new Promise(r=>{const o=Re();e.addEventListener("message",function n(i){!i.data||!i.data.id||i.data.id!==o||(e.removeEventListener("message",n),r(i.data))}),e.start&&e.start(),e.postMessage(Object.assign({id:o},t),a)})}function Re(){return new Array(4).fill(0).map(()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16)).join("-")}function Ie(){return new Worker("/redditMatrix/assets/search.85302df6.js",{type:"classic"})}var Me=()=>Ot(new Ie);function Oe(e){let t,a=e[6]+"",r;return{c(){t=y("span"),r=Q(a)},m(o,n){I(o,t,n),b(t,r)},p(o,n){n&64&&a!==(a=o[6]+"")&&pt(r,a)},d(o){o&&M(t)}}}function ze(e){let t,a,r;function o(i){e[4](i)}let n={removeItem:e[2],$$slots:{default:[Oe,({item:i})=>({6:i}),({item:i})=>i?64:0]},$$scope:{ctx:e}};return e[1]!==void 0&&(n.items=e[1]),t=new Gt({props:n}),st.push(()=>_t(t,"items",o)),t.$on("click",e[5]),{c(){S(t.$$.fragment)},m(i,p){C(t,i,p),r=!0},p(i,[p]){const d={};p&192&&(d.$$scope={dirty:p,ctx:i}),!a&&p&2&&(a=!0,d.items=i[1],wt(()=>a=!1)),t.$set(d)},i(i){r||(_(t.$$.fragment,i),r=!0)},o(i){w(t.$$.fragment,i),r=!1},d(i){k(t,i)}}}const He=Me();function Ne(e,t,a){let r;T(e,X,c=>a(3,r=c));let{input:o=""}=t,n=[];function i(c){N(X,r=r.filter(l=>c!==l),r)}function p(c){n=c,a(1,n),a(0,o),a(3,r)}const d=({detail:c})=>a(0,o=c);return e.$$set=c=>{"input"in c&&a(0,o=c.input)},e.$$.update=()=>{e.$$.dirty&9&&(X&&o.trim()!==""?async function(){const c=await He.search(r,o);a(1,n=c.map(l=>l.value))}():a(1,n=r!=null?r:[]))},[o,n,i,r,p,d]}class $e extends L{constructor(t){super();B(this,t,Ne,ze,R,{input:0})}}function Pe(e){let t;const a=e[7].default,r=U(a,e,e[6],null);return{c(){r&&r.c()},m(o,n){r&&r.m(o,n),t=!0},p(o,n){r&&r.p&&(!t||n&64)&&W(r,a,o,o[6],t?q(a,o[6],n,null):Y(o[6]),null)},i(o){t||(_(r,o),t=!0)},o(o){w(r,o),t=!1},d(o){r&&r.d(o)}}}function je(e){let t,a,r;function o(i){e[8](i)}let n={};return e[3]!==void 0&&(n.input=e[3]),t=new $e({props:n}),st.push(()=>_t(t,"input",o)),{c(){S(t.$$.fragment)},m(i,p){C(t,i,p),r=!0},p(i,p){const d={};!a&&p&8&&(a=!0,d.input=i[3],wt(()=>a=!1)),t.$set(d)},i(i){r||(_(t.$$.fragment,i),r=!0)},o(i){w(t.$$.fragment,i),r=!1},d(i){k(t,i)}}}function De(e){let t,a,r,o,n,i;var p=e[2];function d(s){return{props:{dense:s[1]}}}p&&(t=new p(d(e)),t.$on("search",e[4]));const c=[je,Pe],l=[];function m(s,f){return s[0]==="search"?0:1}return r=m(e),o=l[r]=c[r](e),{c(){t&&S(t.$$.fragment),a=E(),o.c(),n=$t()},m(s,f){t&&C(t,s,f),I(s,a,f),l[r].m(s,f),I(s,n,f),i=!0},p(s,[f]){const v={};if(f&2&&(v.dense=s[1]),p!==(p=s[2])){if(t){vt();const u=t;w(u.$$.fragment,1,0,()=>{k(u,1)}),yt()}p?(t=new p(d(s)),t.$on("search",s[4]),S(t.$$.fragment),_(t.$$.fragment,1),C(t,a.parentNode,a)):t=null}else p&&t.$set(v);let x=r;r=m(s),r===x?l[r].p(s,f):(vt(),w(l[x],1,1,()=>{l[x]=null}),yt(),o=l[r],o?o.p(s,f):(o=l[r]=c[r](s),o.c()),_(o,1),o.m(n.parentNode,n))},i(s){i||(t&&_(t.$$.fragment,s),_(o),i=!0)},o(s){t&&w(t.$$.fragment,s),w(o),i=!1},d(s){t&&k(t,s),s&&M(a),l[r].d(s),s&&M(n)}}}function Ve(e,t,a){let r,o,n;T(e,H,s=>a(0,r=s)),T(e,Z,s=>a(3,o=s)),T(e,Pt,s=>a(5,n=s));let{$$slots:i={},$$scope:p}=t,d=!1;K(async()=>{a(1,d=window.innerWidth>768),window.addEventListener("resize",()=>{a(1,d=window.innerWidth>768)})});let c;async function l(){N(Z,o="",o),N(H,r="search",r)}function m(s){o=s,Z.set(o)}return e.$$set=s=>{"$$scope"in s&&a(6,p=s.$$scope)},e.$$.update=()=>{e.$$.dirty&33&&(n("/index")?a(2,c=pe):r==="idle"?a(2,c=Te):r==="search"?a(2,c=me):r==="selection"&&a(2,c=we))},[r,d,c,o,l,n,p,i,m]}class Fe extends L{constructor(t){super();B(this,t,Ve,De,R,{})}}function Ue(e){let t;const a=e[0].default,r=U(a,e,e[1],null);return{c(){r&&r.c()},m(o,n){r&&r.m(o,n),t=!0},p(o,n){r&&r.p&&(!t||n&2)&&W(r,a,o,o[1],t?q(a,o[1],n,null):Y(o[1]),null)},i(o){t||(_(r,o),t=!0)},o(o){w(r,o),t=!1},d(o){r&&r.d(o)}}}function We(e){let t,a;return t=new Fe({props:{$$slots:{default:[Ue]},$$scope:{ctx:e}}}),{c(){S(t.$$.fragment)},m(r,o){C(t,r,o),a=!0},p(r,[o]){const n={};o&2&&(n.$$scope={dirty:o,ctx:r}),t.$set(n)},i(r){a||(_(t.$$.fragment,r),a=!0)},o(r){w(t.$$.fragment,r),a=!1},d(r){k(t,r)}}}function Ye(e,t,a){let{$$slots:r={},$$scope:o}=t;return e.$$set=n=>{"$$scope"in n&&a(1,o=n.$$scope)},[r,o]}class rr extends L{constructor(t){super();B(this,t,Ye,We,R,{})}}export{rr as default};
