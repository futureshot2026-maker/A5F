// mobile menu
const menuBtn=document.querySelector('.menu-btn'),navList=document.querySelector('.nav ul');
menuBtn?.addEventListener('click',()=>{
  const open=navList.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
});

// scroll reveal — fail-safe: content stays visible if an older browser/host blocks IntersectionObserver.
const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
if('IntersectionObserver' in window){
  document.documentElement.classList.add('js-reveal-ready');
  const io=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{threshold:.15});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in'));
}

// signature terminal (only runs if #term-lines present)
const termWrap=document.getElementById('term-lines');
if(termWrap){
  const lines=JSON.parse(termWrap.dataset.lines||'[]');
  function renderStatic(){
    termWrap.innerHTML=lines.map(l=>`<div><span class="k">${l.k}</span><span class="v">${l.v}</span><br><span class="ok">${l.ok}</span></div>`).join('<br>')
      +'<br><span class="muted">$ </span><span class="cursor"></span>';
  }
  async function typeLines(){
    for(const l of lines){
      const row=document.createElement('div');
      termWrap.appendChild(row);
      const full=l.k+l.v;
      for(let i=1;i<=full.length;i++){
        row.innerHTML=`<span class="k">${full.slice(0,i)}</span>`;
        await new Promise(r=>setTimeout(r,14));
      }
      row.innerHTML=`<span class="k">${l.k}</span><span class="v">${l.v}</span>`;
      const ok=document.createElement('div');
      ok.innerHTML=`<span class="ok">${l.ok}</span>`;
      termWrap.appendChild(ok);
      termWrap.appendChild(document.createElement('br'));
      await new Promise(r=>setTimeout(r,260));
    }
    const prompt=document.createElement('span');
    prompt.className='muted'; prompt.textContent='$ ';
    termWrap.appendChild(prompt);
    const cur=document.createElement('span');
    cur.className='cursor';
    termWrap.appendChild(cur);
  }
  if(reduced){ renderStatic(); } else { typeLines(); }
}

// partner form -> submits to Netlify Forms via AJAX (no backend needed)
const pf=document.getElementById('partnerForm');
if(pf){
  const success=document.getElementById('success');
  const submitBtn=pf.querySelector('.submit');
  function encode(data){
    return Object.keys(data).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(data[k])).join('&');
  }
  pf.addEventListener('submit',e=>{
    e.preventDefault();
    submitBtn.disabled=true;
    const activeLang=localStorage.getItem('a5f-lang')||'en';
    submitBtn.textContent=({en:'Sending…',ar:'جارٍ الإرسال…',es:'Enviando…',de:'Wird gesendet…'})[activeLang];
    const formData=new FormData(pf);
    fetch('/api/forms.php', {
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body: encode(Object.assign({form:'partner-application'}, Object.fromEntries(formData)))
    })
    .then(()=>{
      success.style.display='block';
      submitBtn.style.display='none';
      success.scrollIntoView({behavior:'smooth',block:'center'});
    })
    .catch(()=>{
      submitBtn.disabled=false;
      submitBtn.textContent=({en:'Submit application →',ar:'إرسال الطلب ←',es:'Enviar solicitud →',de:'Bewerbung senden →'})[activeLang];
      alert(({en:'Something went wrong sending the form. Please try again or contact us directly.',ar:'حدث خطأ أثناء إرسال النموذج. حاول مرة أخرى أو تواصل معنا مباشرة.',es:'Algo salió mal al enviar el formulario. Inténtalo de nuevo o contáctanos directamente.',de:'Beim Senden des Formulars ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.'})[activeLang]);
    });
  });
}

// A5F multilingual interface — data-driven i18n
// Translation content lives in /locales/<page>/<lang>.json. HTML uses stable data-i18n keys.
(function(){
  const current=document.querySelector('.lang-current');
  const menu=document.querySelector('.lang-menu');
  const switcher=document.querySelector('.lang-switcher');
  if(!current||!menu||!switcher) return;
  const code=current.querySelector('.lang-code');
  const path=location.pathname;
  const page=path.startsWith('/services')?'services':path.startsWith('/partners')?'partners':'home';
  const supported=['en','ar','es','de'];
  const saved=localStorage.getItem('a5f-lang')||'es';
  const lang=supported.includes(saved)?saved:'es';
  const localeCache={};

  function setHtml(key,value){
    document.querySelectorAll(`[data-i18n="${CSS.escape(key)}"]`).forEach(el=>{el.innerHTML=value;});
  }
  function applyLocale(data,lang){
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key=el.dataset.i18n;
      if(Object.prototype.hasOwnProperty.call(data,key)) el.innerHTML=data[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
      const key=el.dataset.i18nPlaceholder;
      if(Object.prototype.hasOwnProperty.call(data,key)) el.setAttribute('placeholder',data[key]);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el=>{
      const key=el.dataset.i18nAria;
      if(Object.prototype.hasOwnProperty.call(data,key)) el.setAttribute('aria-label',data[key]);
    });
    document.querySelectorAll('[data-i18n-meta]').forEach(el=>{
      const key=el.dataset.i18nMeta;
      if(Object.prototype.hasOwnProperty.call(data,key)) el.setAttribute('content',data[key]);
    });
    document.documentElement.lang=lang;
    document.documentElement.dir=lang==='ar'?'rtl':'ltr';
    code.textContent=lang.toUpperCase();
    localStorage.setItem('a5f-lang',lang);
    const titles={
      en:{home:'A5F — Digital Technology & Software Solutions',services:'A5F Services — Digital Technology & Software Solutions',partners:'A5F Partner Network — Build with A5F'},
      ar:{home:'A5F — التكنولوجيا الرقمية وحلول البرمجيات',services:'A5F — خدمات التكنولوجيا الرقمية وحلول البرمجيات',partners:'A5F — شبكة الشركاء'},
      es:{home:'A5F — Tecnología digital y soluciones de software',services:'A5F — Servicios de tecnología digital y soluciones de software',partners:'A5F — Red de socios'},
      de:{home:'A5F — Digitale Technologie & Softwarelösungen',services:'A5F — Digitale Technologie & Softwareleistungen',partners:'A5F — Partnernetzwerk'}
    };
    document.title=titles[lang][page];
  }
  async function loadLocale(lang){
    if(localeCache[lang]) return localeCache[lang];
    const response=await fetch(`/locales/${page}/${lang}.json`,{cache:'no-store',headers:{'Accept':'application/json'}});
    if(!response.ok) throw new Error(`Locale ${lang} unavailable`);
    const data=await response.json();
    localeCache[lang]=data;
    return data;
  }
  function renderTerminal(lang){
    const term=document.getElementById('term-lines');
    if(!term) return;
    const lines={
      en:[['$ a5f architect',' --system=platform','✓ architecture locked'],['$ a5f intelligence',' --agent=operations','✓ automation ready'],['$ a5f deploy',' --target=production','✓ system active']],
      ar:[['$ a5f architect',' --system=platform','✓ تم تثبيت المعمارية'],['$ a5f intelligence',' --agent=operations','✓ الأتمتة جاهزة'],['$ a5f deploy',' --target=production','✓ النظام يعمل']],
      es:[['$ a5f architect',' --system=platform','✓ arquitectura lista'],['$ a5f intelligence',' --agent=operations','✓ automatización lista'],['$ a5f deploy',' --target=production','✓ sistema activo']],
      de:[['$ a5f architect',' --system=platform','✓ Architektur bereit'],['$ a5f intelligence',' --agent=operations','✓ Automatisierung bereit'],['$ a5f deploy',' --target=production','✓ System aktiv']]
    };
    term.dataset.lines=JSON.stringify(lines[lang]);
    term.innerHTML='';
    lines[lang].forEach(l=>{
      const row=document.createElement('div');
      row.innerHTML=`<span class="k">${l[0]}</span><span class="v">${l[1]}</span><br><span class="ok">${l[2]}</span>`;
      term.appendChild(row); term.appendChild(document.createElement('br'));
    });
    const prompt=document.createElement('span'); prompt.className='muted'; prompt.textContent='$ ';
    term.appendChild(prompt); const cur=document.createElement('span'); cur.className='cursor'; term.appendChild(cur);
  }
  async function apply(lang){
    try{
      const data=await loadLocale(lang);
      applyLocale(data,lang);
      renderTerminal(lang);
    }catch(err){
      console.error('[A5F i18n]',err);
      if(lang!=='en'){
        try{const fallback=await loadLocale('en'); applyLocale(fallback,'en'); renderTerminal('en');}
        catch(_){ document.documentElement.lang='en'; document.documentElement.dir='ltr'; code.textContent='EN'; }
      }
    }
  }
  current.addEventListener('click',()=>{
    const open=switcher.classList.toggle('open');
    current.setAttribute('aria-expanded',open?'true':'false');
  });
  menu.querySelectorAll('[data-lang]').forEach(btn=>btn.addEventListener('click',()=>{
    const next=btn.dataset.lang;
    if(!supported.includes(next)) return;
    localStorage.setItem('a5f-lang',next);
    switcher.classList.remove('open');
    location.reload();
  }));
  document.addEventListener('click',e=>{if(!switcher.contains(e.target)){switcher.classList.remove('open');current.setAttribute('aria-expanded','false');}});
  apply(lang);
})();
