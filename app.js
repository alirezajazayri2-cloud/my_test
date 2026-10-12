(() => {
  'use strict';
  const questions = window.WAI_QUESTIONS;
  // Each user has independent saved answers.
  const fa = n => new Intl.NumberFormat('fa-IR',{maximumFractionDigits:1}).format(n);
  const $ = id => document.getElementById(id);
  const escape = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let user=window.WAI_USERS.current();
  const userName=()=>window.WAI_USERS.current()?.name?.trim()||'کاربر ناشناس';
  function updateIdentityName(){if($('identity-title'))$('identity-title').textContent='📝 شناسنامه شخصیت شناسی '+userName()+' WAI';}
  updateIdentityName();
  window.addEventListener('wai:user-activated',()=>{
    user=window.WAI_USERS.current();state={answers:{...user?.answers},page:0};
    updateIdentityName();
    if(!user&&$('results-content')){
      $('results-content').hidden=true;$('empty-state').hidden=false;
      $('empty-message').textContent='ابتدا نام خود را وارد کن یا یک کاربر را انتخاب کن.';
      ['identity-user','identity-codes','result-summary','dominant-title','dominant-description','dominant-score','career-list','interest-chart'].forEach(id=>$(id).replaceChildren());
    }
  });
  if(!user&&document.body.dataset.page!=='questionnaire')return;
  let state={answers:{...user?.answers},page:0};
  function save(){if(!user)return;const available=WAI_USERS.save(state);if($('save-status'))$('save-status').textContent=available?'پاسخ‌های '+user.name+' ذخیره شده‌اند.':'ذخیره دائمی در دسترس نیست؛ صفحه را باز نگه دار.';}
  function reportURL(){return WAI_USERS.url('results.html');}
  if(document.body.dataset.page === 'questionnaire') {
    const pageSize=questions.length,totalPages=1;
    state.page=Math.max(0,Math.min(totalPages-1,state.page));
    $('page-select').innerHTML = Array.from({length:totalPages},(_,i)=>`<option value="${i}">بخش ${fa(i+1)} · پرسش ${fa(i*pageSize+1)} تا ${fa(Math.min((i+1)*pageSize,questions.length))}</option>`).join('');
    function updateProgress() {
      const answered=Object.keys(state.answers).length;
      const percent=Math.round(answered/questions.length*100);
      $('progress-ring').style.setProperty('--progress',percent+'%');
      $('progress-ring').setAttribute('aria-valuenow',percent);
      $('progress-percent').textContent=fa(percent)+'٪';
      $('progress-count').textContent=`${fa(answered)} از ${fa(questions.length)} پرسش پاسخ داده شده`;
      $('page-progress').style.width=answered/questions.length*100+'%';
      for(const option of $('page-select').options) {
        const page=Number(option.value),start=page*pageSize;
        const count=questions.slice(start,start+pageSize).filter(q=>Object.hasOwn(state.answers,q.id)).length;
        option.textContent=`بخش ${fa(page+1)} · ${fa(count)} از ${fa(Math.min(pageSize,questions.length-start))} پاسخ`;
      }
      if(!$('finish-panel').hidden) updateFinish();
    }
    function render(focus=false) {
      const start=state.page*pageSize;
      $('page-eyebrow').textContent='همهٔ پرسش‌ها';
      $('question-range').textContent=`پرسش ${fa(start+1)} تا ${fa(Math.min(start+pageSize,questions.length))}`;
      $('page-counter').textContent=`${fa(state.page+1)} / ${fa(totalPages)}`;
      $('page-select').value=state.page;
      $('previous').disabled=state.page===0;
      $('next').textContent=state.page===totalPages-1?'پایان و بررسی ←':'بخش بعد ←';
      $('questions').innerHTML=questions.slice(start,start+pageSize).map((q,i)=>`<fieldset class="question"><legend><span class="question-heading"><span class="question-number">${fa(start+i+1).padStart(2,'۰')}</span><span class="question-text">${escape(q.text)}</span></span></legend><div class="question-tools"><span class="axis-label">${escape(WAI.axes[q.interest][0])} <bdi>· ${q.id}</bdi></span><button class="clear-answer" type="button" data-clear="${q.id}" ${Object.hasOwn(state.answers,q.id)?'':'hidden'} aria-label="پاک کردن پاسخ پرسش ${fa(start+i+1)}">پاک کردن پاسخ</button></div><div class="options ${q.options.length===2?'two':''} ${q.options.some(o=>o.text.length>55)?'long':''}">${q.options.map(o=>`<label class="option"><input type="radio" name="${q.id}" value="${escape(o.value)}" ${state.answers[q.id]===o.value?'checked':''}><span class="option-content"><span class="option-dot" aria-hidden="true"></span><span><strong>${escape(o.value)})</strong> ${escape(o.text)}</span></span></label>`).join('')}</div></fieldset>`).join('');
      $('finish-panel').hidden=true;
      updateProgress();
      if(focus){$('form-title').focus({preventScroll:true});$('assessment').scrollIntoView({behavior:'instant',block:'start'});}
    }
    function updateFinish() {
      const result=WAI.calculate(questions,state.answers);
      $('finish-summary').textContent=`به ${fa(result.answered)} پرسش پاسخ داده‌ای و ${fa(result.total-result.answered)} پرسش بی‌پاسخ مانده است.`;
      $('coverage-note').textContent=result.eligible?'می‌توانی نتیجه را ببینی یا پیش از ادامه، پاسخ‌هایت را بررسی کنی.':`برای نمایش پیشنهادها، دست‌کم ۸۰٪ پرسش‌ها (${fa(Math.ceil(questions.length*.8))} پرسش) و حداقل یک پرسش از هر ۱۴ بُعد موجود را پاسخ بده. این حداقل برای نمایش نتیجه در این برنامه است.`;
      $('show-results').disabled=!result.eligible;
      $('review').hidden=result.answered===result.total;
      const missing=Array.from({length:totalPages},(_,page)=>({page,count:questions.slice(page*pageSize,(page+1)*pageSize).filter(q=>!Object.hasOwn(state.answers,q.id)).length})).filter(section=>section.count);
      $('unanswered-sections').innerHTML=missing.map(section=>`<button type="button" class="section-chip" data-page="${section.page}">پرسش‌های بی‌پاسخ <span>${fa(section.count)} بی‌پاسخ</span></button>`).join('');
    }
    function showReview() {
      $('finish-panel').hidden=false;updateFinish();
      $('review-title').focus({preventScroll:true});
      $('finish-panel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    }
    $('check-progress').addEventListener('click',showReview);
    $('unanswered-sections').addEventListener('click',e=>{
      const button=e.target.closest('[data-page]');if(!button)return;
      state.page=Number(button.dataset.page);save();render(true);
      const unanswered=questions.slice(state.page*pageSize,(state.page+1)*pageSize).find(q=>!Object.hasOwn(state.answers,q.id));
      if(unanswered)document.querySelector(`input[name="${unanswered.id}"]`).focus();
    });
    $('question-form').addEventListener('change',e=>{
      if(e.target.type!=='radio')return;
      state.answers[e.target.name]=e.target.value;
      e.target.closest('fieldset').querySelector('[data-clear]').hidden=false;
      save();updateProgress();
    });
    $('questions').addEventListener('click',e=>{
      const button=e.target.closest('[data-clear]');if(!button)return;
      delete state.answers[button.dataset.clear];
      button.closest('fieldset').querySelectorAll('input').forEach(input=>input.checked=false);
      button.closest('fieldset').querySelector('input').focus();
      button.hidden=true;save();updateProgress();
    });
    $('question-form').addEventListener('submit',e=>{
      e.preventDefault();
      if(state.page<totalPages-1){state.page++;save();render(true);}
      else{showReview();}
    });
    $('previous').addEventListener('click',()=>{if(state.page>0){state.page--;save();render(true);}});
    $('page-select').addEventListener('change',e=>{state.page=Number(e.target.value);save();render(true);});
    $('review').addEventListener('click',()=>{const unanswered=questions.find(q=>!Object.hasOwn(state.answers,q.id));if(unanswered)document.querySelector(`input[name="${unanswered.id}"]`).focus();});
    $('show-results').addEventListener('click',()=>{if(WAI.calculate(questions,state.answers).eligible){save();location.href=reportURL();}});
    document.querySelectorAll('a[href="results.html"]').forEach(a=>a.addEventListener('click',()=>{save();a.href=reportURL();}));
    $('reset').addEventListener('click',()=>$('reset-dialog').showModal());
    $('cancel-reset').addEventListener('click',()=>$('reset-dialog').close());
    $('confirm-reset').addEventListener('click',()=>{state={answers:{},page:0};save();$('reset-dialog').close();render(true);});
    window.addEventListener('wai:user-activated',()=>{
      $('assessment').hidden=!user;
      $('reset-dialog').close();
      $('save-status').textContent='پاسخ‌ها به‌صورت خودکار ذخیره می‌شوند.';
      render();
      if(user){
        save();
        const firstQuestion=$('questions').querySelector('.question');
        if(firstQuestion){
          const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
          firstQuestion.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
          const firstInput=firstQuestion.querySelector('input');
          if(firstInput)firstInput.focus({preventScroll:true});
        }
      }
    });
    render();
    if(Object.keys(state.answers).length)save();
  } else {
    save();

    const result=WAI.calculate(questions,state.answers);
    if(!result.eligible) {
      $('empty-state').hidden=false;
      if(result.answered) $('empty-message').textContent=`تا اینجا ${fa(result.answered)} پرسش پاسخ داده‌ای. برای دیدن پیشنهادها، حداقل ${fa(Math.ceil(questions.length*.8))} پرسش و یک پرسش از هر یک از ۱۴ بُعد موجود را تکمیل کن.`;
    } else {
      $('results-content').hidden=false;
      const identity=WAI.identity(result);
      const identityText=$('identity-title').textContent+'\n'+userName()+'\n\n'+identity.map(group=>group.map(i=>i.label+i.symbol+(i.note?' — '+i.note:'')).join('\n')).join('\n\n');
      $('identity-user').textContent='نام کاربر: '+userName();
      $('identity-codes').innerHTML=identity.map(group=>'<div class="identity-group">'+group.map(i=>'<div><bdi dir="ltr" aria-label="'+escape(i.label+' '+(i.color||i.note))+'">'+escape(i.label+i.symbol)+'</bdi>'+(i.note?'<small>'+escape(i.note)+'</small>':'')+'</div>').join('')+'</div>').join('');
      const dominant=result.interests[0];
      const date=new Intl.DateTimeFormat('fa-IR',{dateStyle:'long'}).format(new Date());
      $('result-summary').textContent=`${userName()} · ${fa(result.answered)} پاسخ از ${fa(result.total)} پرسش · ${fa(result.covered)} بُعد بررسی‌شده · ${date}`;
      $('dominant-title').textContent=dominant.label;
      $('dominant-description').textContent='این بُعد در پاسخ‌های تو بالاترین امتیاز را دارد؛ ترکیب همه رغبت‌ها را هم بررسی کن.';
      $('dominant-score').textContent=fa(dominant.score);
      if(result.interests.filter(i=>i.score!==null).every(i=>i.score===0)){
        $('dominant-title').textContent='هنوز رغبت برجسته‌ای مشخص نشده';
        $('dominant-description').textContent='امتیاز همه بُعدها صفر است. پیشنهادهای زیر هم‌رتبه‌اند و صرفاً ایده‌هایی برای بررسی هستند.';
      } else if(result.interests[1].score===dominant.score) {
        $('dominant-description').textContent='چند بُعد بالاترین امتیاز یکسان را دارند. نقشه کامل رغبت‌ها را برای دیدن این ترکیب بررسی کن.';
      }
      $('career-list').innerHTML=result.careers.map((c,i)=>`<article class="career-card"><span class="career-rank">${fa(i+1).padStart(2,'۰')}</span><div><h3>${escape(c.title)}</h3><p>${escape(c.description)}</p><div class="career-tags">${c.tags.map(tag=>`<span>${escape(tag)}</span>`).join('')}</div></div></article>`).join('');
      $('interest-chart').innerHTML=result.interests.map(i=>`<div class="chart-item"><div class="chart-label"><span>${escape(i.label)}</span><span>${i.score===null?(i.total?'بی‌پاسخ':'پرسش موجود نیست'):fa(i.score)} <bdi>· ${i.code}</bdi></span></div><div class="chart-track" aria-hidden="true"><span style="width:${Math.min(100,(i.score??0)/9*100)}%"></span></div></div>`).join('');
      let methodWasOpen=false;
      window.addEventListener('beforeprint',()=>{const method=document.querySelector('.method-panel');methodWasOpen=method.open;method.open=true;});
      window.addEventListener('afterprint',()=>document.querySelector('.method-panel').open=methodWasOpen);
      $('print-results').addEventListener('click',()=>window.print());
      $('download-results').addEventListener('click',()=>{
        const body=`من کی ام | گزارش رغبت‌های WAI\n${date}\n${$('result-summary').textContent}\n\n${identityText}\n\nنقشه رغبت‌ها\n${result.interests.map(i=>`${i.label} (${i.code}): ${i.score===null?(i.total?'بی‌پاسخ':'پرسش موجود نیست'):fa(i.score)} · پاسخ: ${fa(i.answered)}/${fa(i.total)}`).join('\n')}\n\n۵ مسیر پیشنهادی برای بررسی بیشتر\n${result.careers.map((c,i)=>`${fa(i+1)}. ${c.title}\n${c.description}\nرغبت‌های مرتبط: ${c.tags.join('، ')}`).join('\n\n')}\n\nروش محاسبه\n${Array.from(document.querySelectorAll('.method-panel p')).map(p=>p.textContent).join('\n\n')}\n\nپیشنهادهای دارای امتیاز یکسان، بر اساس ترتیب ثابت نمایش داده می‌شوند.\n`;
        const url=URL.createObjectURL(new Blob(['\uFEFF'+body],{type:'text/plain;charset=utf-8'}));
        const link=document.createElement('a');link.href=url;link.download='من کی ام-WAI-results.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
      });
    }
    document.querySelectorAll('a[href="results.html"]').forEach(a=>{a.href=reportURL();});
    // Carry the in-memory answers back when persistent storage is unavailable or file origins differ.
    document.querySelectorAll('a[href^="index.html"]').forEach(a=>{
      a.href=WAI_USERS.url('index.html');
    });
  }
})();
