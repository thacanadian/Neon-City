import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';
export {THREE};
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const rand=(a,b)=>a+Math.random()*(b-a);
export const dist2=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function banner(text,cls=''){const el=document.getElementById('banner');el.className=cls;el.textContent=text;el.style.opacity='1';clearTimeout(banner.t);banner.t=setTimeout(()=>el.style.opacity='0',2200)}
export function boxAt(x,y,z,sx,sy,sz){return new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x,y,z),new THREE.Vector3(sx,sy,sz))}
