(function (root) {
  'use strict';
  const axes = {
    N: ['فضای باز',46], B: ['ارتباط با بی‌جان · B',20], R: ['ریسک‌پذیری',39], D: ['پژوهشی',54], P: ['محاسباتی',50],
    L: ['تحرک محدود',31], C: ['ارتباط با بی‌جان · C',26], T: ['گروهی',44], K: ['بدنی',34], F: ['پیشرو در سیستم',30],
    I: ['درون‌فردی',34], S: ['شنیداری',49], O: ['امنیت و ثبات',30], V: ['دیداری',67], M: ['جامعه‌محور',34]
  };
  // Exploratory editorial mapping, not part of the supplied WAI source material.
  const careers = [
    ['تحلیلگر داده','کشف الگوها در داده‌ها، حل مسئله و تبدیل عددها به بینش‌های کاربردی.',{P:3,D:2,L:1}],
    ['پژوهشگر','بررسی پرسش‌های تازه، مطالعه عمیق و آزمودن ایده‌ها به شیوه‌ای منظم.',{D:3,P:1,I:1}],
    ['توسعه‌دهنده نرم‌افزار','ساخت ابزارهای دیجیتال با ترکیبی از منطق، حل مسئله و کار دقیق.',{P:3,B:1,D:2}],
    ['طراح گرافیک','تبدیل ایده‌ها به تصویر و ساخت تجربه‌های بصری با توجه به جزئیات.',{V:3,C:1,I:1}],
    ['مدرس و آموزشگر','توضیح مفاهیم، همراهی در یادگیری و تعامل پیوسته با دیگران.',{M:3,T:2,S:1}],
    ['کارشناس منابع انسانی','کمک به رشد افراد و بهبود همکاری و ارتباط در یک مجموعه.',{M:3,T:2,I:1}],
    ['مدیر پروژه','هماهنگی افراد، برنامه‌ریزی فعالیت‌ها و پیگیری اجرای کارها.',{F:3,T:2,P:1}],
    ['کارشناس محیط زیست','مطالعه محیط طبیعی و مشارکت در پروژه‌های حفاظت از آن.',{N:3,D:2,K:1}],
    ['راهنمای طبیعت‌گردی','همراهی گروه‌ها در فضای باز و طراحی تجربه‌های آشنایی با طبیعت.',{N:3,T:2,K:1}],
    ['تکنسین فنی','کار عملی با تجهیزات، عیب‌یابی و بهبود عملکرد ابزارها.',{B:2,K:3,C:1}],
    ['مربی ورزشی','آموزش مهارت‌های حرکتی و همراهی افراد در تمرین‌های منظم.',{K:3,T:2,M:1}],
    ['تدوینگر صدا','کار با صدا، توجه به تفاوت‌های شنیداری و ساخت محتوای صوتی.',{S:3,C:1,I:1}],
    ['حسابدار','رسیدگی دقیق به اطلاعات مالی در یک محیط ساختارمند و منظم.',{P:3,O:2,L:1}],
    ['مددکار اجتماعی','شناخت نیازهای افراد و همراهی در حل مسائل اجتماعی.',{M:3,T:1,I:2}],
    ['طراح صنعتی','ترکیب درک بصری و شناخت ابزارها برای طراحی محصولات کاربردی.',{V:3,B:2,K:1}],
    ['کارآفرین','آغاز پروژه‌های تازه، تصمیم‌گیری در ابهام و هدایت یک تیم.',{F:3,R:2,T:1}],
    ['کارشناس کنترل کیفیت','بررسی منظم فرایندها، شناسایی خطاها و حفظ کیفیت خروجی.',{O:2,D:2,P:2}],
    ['نویسنده','پرداخت ایده‌ها، تأمل در تجربه‌ها و بیان آن‌ها در قالب متن.',{I:3,V:1,D:1}]
  ];
  function color(code, score) {
    if ('NBRDPLC'.includes(code)) {
      if (score >= 1 && score <= 3.6) return 'مشکی';
      if (score >= 3.7 && score <= 5.4) return 'NBLCD'.includes(code) && score >= 4.1 ? 'نارنجی' : 'قرمز';
      if (score >= 5.5 && score <= 7.8) return 'آبی';
      return 'سبز';
    }
    if (score >= .5 && score <= 3.1) return 'مشکی';
    if (score >= 3.2 && score <= 4.1) return 'قرمز';
    if (score >= 5 && score <= 7.3) return 'آبی';
    return 'سبز';
  }
  function validAnswers(questions, input) {
    const clean = {};
    for (const q of questions) if (input && q.options.some(o => o.value === input[q.id])) clean[q.id] = input[q.id];
    return clean;
  }
  function calculate(questions, input) {
    const answers = validAnswers(questions, input);
    const interests = Object.entries(axes).map(([code, [label, base]]) => {
      let aPlus = base, b = 0, answered = 0;
      const group = questions.filter(q => q.interest === code);
      for (const q of group) {
        if (Object.hasOwn(answers, q.id)) { b += {'الف':0,'ب':1,'ج':2}[answers[q.id]]; answered++; }
        else aPlus -= (q.options_count === 2 ? 1 : q.options_count === 3 ? 2 : 0) * (q.weighted ? 2 : 1);
      }
      aPlus = Math.max(1, aPlus);
      const score = answered ? Math.ceil((b / aPlus) * 90) / 10 : null;
      return {code,label,base,aPlus,b,score,answered,total:group.length,color:score === null ? null : color(code,score)};
    }).sort((a,b)=>(b.score ?? -1)-(a.score ?? -1));
    const byCode = Object.fromEntries(interests.map(i=>[i.code,i]));
    const ranked = careers.map(([title,description,weights],index)=>{
      let score=0,weight=0;
      for(const [code,w] of Object.entries(weights)) {
        if(byCode[code].score !== null) { score += Math.min(9,byCode[code].score)/9*w; weight += w; }
      }
      return {title,description,score:weight ? score/weight : 0,index,tags:Object.keys(weights).map(c=>axes[c][0])};
    }).filter(c=>Object.keys(careers[c.index][2]).every(code=>byCode[code].score !== null)).sort((a,b)=>b.score-a.score || a.index-b.index).slice(0,5);
    const covered = interests.filter(i=>i.answered>0).length;
    const answered = Object.keys(answers).length;
    const available = interests.filter(i=>i.total>0).length;
    return {answered,total:questions.length,covered,available,interests,careers:ranked,eligible:answered>=Math.ceil(questions.length*.8)&&covered===available};
  }
  function identity(result) {
    const byCode=Object.fromEntries(result.interests.map(i=>[i.code,i]));
    const symbols={'مشکی':'⚫️','قرمز':'🔴','آبی':'🔵','سبز':'🟢','نارنجی':'🟠'};
    const complements={'مشکی':'سبز','سبز':'مشکی','قرمز':'آبی','آبی':'قرمز','نارنجی':'نارنجی'};
    const item=(label,axis,opposite=false)=>{const i=byCode[axis],color=i?.color?(opposite?complements[i.color]:i.color):null;return {label,color,symbol:symbols[color]||'',note:!i?'تعریف نشده در منبع':i.score===null?(i.total?'بی‌پاسخ':'پرسش موجود نیست'):''};};
    return [
      [item('GAN','B',true),item('BGAN','B')],
      [item('PER','F'),item('PIR','F',true)],
      [item('EBA','C',true),item('EBI','C')],
      [item('MIN',null)], [item('DRN','I')],
      [item('ENF','T',true),item('GRH','T')],
      [item('JAM','M')], [item('PJO','D'),item('AML','D',true)],
      [item('BAZ','N'),item('BST','N',true)],
      [item('TMA','L'),item('TNA','L',true)],
      [item('DID','V'),item('SHE','S')], [item('BDN','K')],
      [item('MHS','P')], [item('AMN','O'),item('NAMN','R')]
    ];
  }
  root.WAI = {axes,careers,calculate,validAnswers,identity};
})(typeof window !== 'undefined' ? window : globalThis);
