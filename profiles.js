(() => {
'use strict';
const KEY='mankiam-users-v1', questions=window.WAI_QUESTIONS;
let store={activeId:null,users:[],deletedIds:[]}, available=true, legacy=null;
const dirtyUsers=new Set();
const clean=s=>({deletedIds:Array.isArray(s?.deletedIds)?s.deletedIds.filter(id=>typeof id==='string'):[],activeId:typeof s?.activeId==='string'?s.activeId:null,users:Array.isArray(s?.users)?s.users.filter(u=>u&&typeof u.id==='string').map(u=>({id:u.id,name:(typeof u.name==='string'&&u.name.trim()?u.name.trim().slice(0,80):'کاربر ناشناس'),answers:WAI.validAnswers(questions,u.answers),page:0})):[]});
try {store=clean(JSON.parse(localStorage.getItem(KEY)));if(!localStorage.getItem(KEY))legacy=JSON.parse(localStorage.getItem('heda-wai-v1'));}catch{available=false;}
if(location.hash.startsWith('#session=')){try{const incoming=clean(JSON.parse(decodeURIComponent(location.hash.slice(9))));incoming.deletedIds=[...new Set([...store.deletedIds,...incoming.deletedIds])];store=incoming;if(store.activeId)dirtyUsers.add(store.activeId);}catch{}}
else if(location.hash.startsWith('#report=')&&!store.users.length){try{legacy={answers:JSON.parse(decodeURIComponent(location.hash.slice(8)))};}catch{}}
function applyDeletions(){store.users=store.users.filter(u=>!store.deletedIds.includes(u.id));if(!store.users.some(u=>u.id===store.activeId))store.activeId=null;}
applyDeletions();
function current(){return store.users.find(u=>u.id===store.activeId)||null;}
function persist(){try{let disk;try{disk=clean(JSON.parse(localStorage.getItem(KEY)));}catch{disk=clean(null);}store.deletedIds=[...new Set([...store.deletedIds,...disk.deletedIds])];const merged=new Map(disk.users.map(saved=>[saved.id,saved]));for(const local of store.users)if(dirtyUsers.has(local.id)||!merged.has(local.id))merged.set(local.id,local);store.users=[...merged.values()];applyDeletions();localStorage.setItem(KEY,JSON.stringify(store));dirtyUsers.clear();available=true;}catch{available=false;}document.getElementById('user-storage-note').textContent=available?'کاربران و پاسخ‌ها در همین مرورگر نگهداری می‌شوند.':'ذخیره دائمی در دسترس نیست؛ با بستن صفحه ممکن است اطلاعات از دست برود.';}
function url(page){return page+(!available||location.protocol==='file:'?'#session='+encodeURIComponent(JSON.stringify(store)):'');}
const panel=document.createElement('section');panel.className='container panel user-panel';panel.setAttribute('aria-label','انتخاب کاربر');
panel.innerHTML='<h2>کاربر آزمون</h2><label for="user-select">ادامه با کاربر قبلی</label><select id="user-select"><option value="">انتخاب کاربر</option></select><div id="user-management" class="user-management" aria-label="حذف کاربران"></div><form id="user-form"><label for="user-name">نام و نام خانوادگی کاربر جدید</label><div class="user-create"><input id="user-name" name="name" maxlength="80" required autocomplete="name" placeholder="نام خود را وارد کنید"><button class="button primary" type="submit">افزودن کاربر و شروع</button></div></form><p id="user-message" role="status"></p><p id="user-storage-note"></p>';
document.querySelector('main').before(panel);
const select=document.getElementById('user-select');
const compact=document.createElement('div');compact.className='container user-session-bar';compact.hidden=true;
const activeName=document.createElement('span');activeName.setAttribute('role','status');
const manage=document.createElement('button');manage.type='button';manage.className='button secondary';manage.textContent='مدیریت کاربران';manage.setAttribute('aria-expanded','false');
compact.append(activeName,manage);panel.before(compact);
manage.addEventListener('click',()=>{panel.hidden=!panel.hidden;manage.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)document.getElementById('user-name').focus();});
function collapsePanel(){document.getElementById('user-message').textContent='کاربر فعلی: '+current().name;panel.hidden=true;compact.hidden=false;activeName.textContent='کاربر فعلی: '+current().name;manage.setAttribute('aria-expanded','false');}
function refreshUsers(){
 select.replaceChildren();const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent='انتخاب کاربر';select.append(placeholder);
 for(const u of store.users){const o=document.createElement('option');o.value=u.id;o.textContent=u.name;select.append(o);}select.value=current()?.id||'';
 management.replaceChildren();

for(const u of store.users){
 const row=document.createElement('div');row.className='user-row';
 const name=document.createElement('span');name.textContent=u.name;
 const remove=document.createElement('button');remove.type='button';remove.className='button delete-user';remove.textContent='🗑 حذف';remove.setAttribute('aria-label','حذف کاربر '+u.name);
 remove.addEventListener('click',()=>{
  if(!window.confirm('کاربر «'+u.name+'» و تمام پاسخ‌های ذخیره‌شدهٔ او حذف شوند؟ این کار قابل بازگشت نیست.'))return;
  const previousActiveId=current()?.id;
  store.deletedIds.push(u.id);applyDeletions();legacy=null;persist();
  try{localStorage.removeItem('heda-wai-v1');}catch{}
  refreshUsers();
  if(previousActiveId!==current()?.id){
   panel.hidden=false;compact.hidden=true;activeName.textContent='';manage.setAttribute('aria-expanded','true');
   window.dispatchEvent(new Event('wai:user-activated'));
  }
  document.getElementById('user-message').textContent='کاربر «'+u.name+'» حذف شد.';
  if(location.hash.startsWith('#session=')){try{history.replaceState(null,'',url(location.pathname+location.search));}catch{}}
  if(document.body.dataset.page==='results')document.querySelectorAll('a[href^="index.html"],a[href^="results.html"]').forEach(a=>{a.href=url(a.getAttribute('href').split('#')[0]);});
 });row.append(name,remove);management.append(row);
}

}
const management=document.getElementById('user-management');
refreshUsers();
function navigate(){persist();location.href=url(document.body.dataset.page==='results'?'results.html':'index.html');}
function activateNewUser(){
 persist();refreshUsers();
 if(document.body.dataset.page!=='questionnaire'){location.href=url('index.html?start=1');return;}
 collapsePanel();document.getElementById('user-name').value='';
 window.dispatchEvent(new Event('wai:user-activated'));
}
select.addEventListener('change',()=>{store.activeId=select.value||null;navigate();});
document.getElementById('user-form').addEventListener('submit',e=>{e.preventDefault();const input=document.getElementById('user-name'),name=input.value.trim();if(!name){input.setCustomValidity('لطفاً نام خود را وارد کنید.');input.reportValidity();return;}if(store.users.some(u=>u.name===name)){document.getElementById('user-message').textContent='این نام قبلاً ثبت شده است؛ کاربر قبلی را انتخاب کن یا نام متمایزی وارد کن.';return;}const id=crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);store.users.push({id,name,answers:legacy?WAI.validAnswers(questions,legacy.answers):{},page:0});legacy=null;store.activeId=id;activateNewUser();});
document.getElementById('user-name').addEventListener('input',e=>e.target.setCustomValidity(''));
persist();if(available&&location.hash.startsWith('#session=')){try{history.replaceState(null,'',location.pathname+location.search);}catch{}}
if(!current()){const assessment=document.getElementById('assessment');if(assessment)assessment.hidden=true;const empty=document.getElementById('empty-state');if(empty){empty.hidden=false;document.getElementById('empty-message').textContent='ابتدا نام خود را وارد کن یا یک کاربر را انتخاب کن.';}document.getElementById('user-message').textContent='پیش از پاسخ دادن، نام خود را وارد کن یا کاربر قبلی را انتخاب کن.';}
else document.getElementById('user-message').textContent='کاربر فعلی: '+current().name;
if(current()&&new URLSearchParams(location.search).get('start')==='1')collapsePanel();
window.WAI_USERS={current,save(state){const u=current();if(u){u.answers=WAI.validAnswers(questions,state.answers);u.page=0;dirtyUsers.add(u.id);}persist();if(location.hash.startsWith('#session=')){try{history.replaceState(null,'',url(location.pathname));}catch{}}return available;},url};
})();
