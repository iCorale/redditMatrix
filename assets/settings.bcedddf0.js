import{S as re,i as ne,s as se,o as d,g as c,x as w,h as n,z as H,j as oe,A as t,B as I,y as J,n as le,k as ae,C as ce,q as ue,ah as ie,F as K}from"./vendor.0ae95c6a.js";import{b as g}from"./mwc-list.64318535.js";import"./if-defined.6486e9c9.js";const{document:de}=ie;function pe(a){var W,X,Y;let f,r,e,u,h,m=((W=a[0])==null?void 0:W.accentColor)+"",y,o,i,S,L,C,M,v,P,N,q=((X=a[0])==null?void 0:X.backgroundColor)+"",E,O,p,A,Q,b,R,k,B,T,F=((Y=a[0])==null?void 0:Y.foregroundColor)+"",D,U,_,z,G,V;return{c(){var l,s,j;f=d(),r=c("mwc-list"),e=c("mwc-list-item"),u=c("span"),h=w("Accent Color: "),y=w(m),o=d(),i=c("input"),L=d(),C=c("li"),M=d(),v=c("mwc-list-item"),P=c("span"),N=w("Background Color: "),E=w(q),O=d(),p=c("input"),Q=d(),b=c("li"),R=d(),k=c("mwc-list-item"),B=c("span"),T=w("Foreground Color: "),D=w(F),U=d(),_=c("input"),de.title="Settings",n(i,"slot","meta"),n(i,"type","color"),i.value=S=(l=a[0])==null?void 0:l.accentColor,H(e,"hasmeta",""),n(C,"divider",""),n(C,"padded",""),n(C,"role","separator"),n(C,"class","svelte-j3w3w2"),n(p,"slot","meta"),n(p,"type","color"),p.value=A=(s=a[0])==null?void 0:s.backgroundColor,H(v,"hasmeta",""),n(b,"divider",""),n(b,"padded",""),n(b,"role","separator"),n(b,"class","svelte-j3w3w2"),n(_,"slot","meta"),n(_,"type","color"),_.value=z=(j=a[0])==null?void 0:j.foregroundColor,H(k,"hasmeta","")},m(l,s){oe(l,f,s),oe(l,r,s),t(r,e),t(e,u),t(u,h),t(u,y),t(e,o),t(e,i),t(r,L),t(r,C),t(r,M),t(r,v),t(v,P),t(P,N),t(P,E),t(v,O),t(v,p),t(r,Q),t(r,b),t(r,R),t(r,k),t(k,B),t(B,T),t(B,D),t(k,U),t(k,_),G||(V=[I(i,"change",a[2]),I(p,"change",a[3]),I(_,"change",a[4])],G=!0)},p(l,[s]){var j,Z,x,$,ee,te;s&1&&m!==(m=((j=l[0])==null?void 0:j.accentColor)+"")&&J(y,m),s&1&&S!==(S=(Z=l[0])==null?void 0:Z.accentColor)&&(i.value=S),s&1&&q!==(q=((x=l[0])==null?void 0:x.backgroundColor)+"")&&J(E,q),s&1&&A!==(A=($=l[0])==null?void 0:$.backgroundColor)&&(p.value=A),s&1&&F!==(F=((ee=l[0])==null?void 0:ee.foregroundColor)+"")&&J(D,F),s&1&&z!==(z=(te=l[0])==null?void 0:te.foregroundColor)&&(_.value=z)},i:le,o:le,d(l){l&&ae(f),l&&ae(r),G=!1,ce(V)}}}function _e(a,f,r){let e;ue(a,g,o=>r(0,e=o));function u(o,i){switch(i){case"foreground":K(g,e.foregroundColor=o,e),g.set(e);break;case"background":K(g,e.backgroundColor=o,e),g.set(e);break;case"accent":K(g,e.accentColor=o,e),g.set(e);break}}const h=o=>u(o.target.value,"accent"),m=o=>u(o.target.value,"background"),y=o=>u(o.target.value,"foreground");return a.$$.update=()=>{if(a.$$.dirty&1){const o=document.documentElement;(e==null?void 0:e.accentColor)&&o.style.setProperty("--accent-color",e==null?void 0:e.accentColor),(e==null?void 0:e.backgroundColor)&&o.style.setProperty("--background-color",e==null?void 0:e.backgroundColor),(e==null?void 0:e.foregroundColor)&&o.style.setProperty("--foreground-color",e==null?void 0:e.foregroundColor)}},[e,u,h,m,y]}class Ce extends re{constructor(f){super();ne(this,f,_e,pe,se,{})}}export{Ce as default};
