(() => {
'use strict';
const KEY='mankiam-theme',root=document.documentElement;
let theme='light';try{const saved=localStorage.getItem(KEY);if(saved==='dark'||saved==='light')theme=saved;}catch{}
function apply(value){theme=value;root.dataset.theme=value;const button=document.getElementById('theme-toggle');if(button){button.textContent=value==='dark'?'☀️':'🌙';button.setAttribute('aria-label',value==='dark'?'فعال کردن حالت روشن':'فعال کردن حالت تاریک');button.title=button.getAttribute('aria-label');button.setAttribute('aria-pressed',String(value==='dark'));}const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=value==='dark'?'#101827':'#164ed5';}
apply(theme);
document.addEventListener('DOMContentLoaded',()=>{apply(theme);document.getElementById('theme-toggle')?.addEventListener('click',()=>{apply(theme==='dark'?'light':'dark');try{localStorage.setItem(KEY,theme);}catch{}});});
window.addEventListener('storage',event=>{if(event.key===KEY)apply(event.newValue==='dark'?'dark':'light');});
})();
