(function(){
  const supported=['en','ar','es','de'];
  let lang=localStorage.getItem('a5f-lang')||'es';
  if(!supported.includes(lang)) lang='es';
  const state={step:1,brief:'',problem:'',audience:'',outcome:'',connect:[],scope:'',timeline:''};
  const cache={};
  const form=document.getElementById('architectForm');
  const steps=[...document.querySelectorAll('.question-step')];
  const stepbar=document.getElementById('stepbar');
  const next=document.getElementById('next'),back=document.getElementById('back'),build=document.getElementById('build');
  const switcher=document.querySelector('.lang-switcher'),current=document.querySelector('.lang-current');
  const errorBox=document.getElementById('architectError');
  let activeLocale=null;

  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  async function locale(l){
    if(cache[l]) return cache[l];
    const r=await fetch(`/architect/${l}.json`,{cache:'no-cache'});
    if(!r.ok) throw Error('locale');
    return cache[l]=await r.json();
  }
  function setError(key){
    if(!errorBox) return;
    errorBox.textContent=activeLocale?.[key]||activeLocale?.required||'';
    errorBox.hidden=false;
    errorBox.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function clearError(){if(errorBox){errorBox.hidden=true;errorBox.textContent='';}}
  function getPath(obj,path){return path.split('.').reduce((v,k)=>v==null?undefined:v[k],obj)}
  function apply(data){
    activeLocale=data;
    document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;const v=getPath(data,k);if(v!=null)el.innerHTML=v});
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{const k=el.dataset.i18nPlaceholder;const v=getPath(data,k);if(v!=null)el.placeholder=v});
    document.querySelectorAll('[data-i18n-aria]').forEach(el=>{const k=el.dataset.i18nAria;const v=getPath(data,k);if(v!=null)el.setAttribute('aria-label',v)});
    document.documentElement.lang=lang;
    document.documentElement.dir=lang==='ar'?'rtl':'ltr';
    document.querySelector('.lang-code').textContent=lang.toUpperCase();
    document.querySelector('.meta-lang').textContent=lang.toUpperCase();
    document.title=data.pageTitle||'A5F Project Architect';
    renderChoices(data);
    renderStepbar(data);
    render();
    // If a blueprint is already visible, rebuild it in the newly selected language.
    // User-entered project text remains unchanged; generated labels, modules,
    // opportunities, architecture and delivery content follow the active locale.
    const visibleBlueprint=document.getElementById('blueprint');
    if(visibleBlueprint && !visibleBlueprint.hidden && state.brief && state.problem && state.audience && state.outcome && state.scope && state.timeline){
      buildBlueprint();
    }
    if(document.getElementById('projectBriefData')) populateBriefForm();
  }
  function renderStepbar(data){
    const keys=['step1','step2','step3','step4','step5'];
    stepbar.innerHTML=keys.map((k,i)=>`<button type="button" class="${i+1===state.step?'active':''}" data-goto="${i+1}">${esc(data[k])}</button>`).join('');
    stepbar.querySelectorAll('button').forEach(b=>b.onclick=()=>{
      saveInputs(); const n=+b.dataset.goto;
      if(n<state.step){state.step=n;clearError();render();}
      else if(validateTo(n-1)){state.step=n;clearError();render();}
    });
  }
  function choices(id,items,multi=false,key=id){
    const wrap=document.getElementById(id); if(!wrap)return;
    const selected=multi?(state[key]||[]):[state[key]];
    wrap.innerHTML=items.map((x,i)=>`<div class="choice"><input id="${id}-${i}" name="${id}" type="${multi?'checkbox':'radio'}" value="${esc(x)}" ${selected.includes(x)?'checked':''}><label for="${id}-${i}">${esc(x)}</label></div>`).join('');
    wrap.querySelectorAll('input').forEach(inp=>inp.onchange=()=>{
      if(multi) state[key]=[...wrap.querySelectorAll('input:checked')].map(x=>x.value);
      else state[key]=inp.value;
      clearError();
    });
  }
  function renderChoices(data){
    choices('audience',data.audience,false,'audience');
    choices('outcomes',data.outcomes,false,'outcome');
    choices('connect',data.connect,true,'connect');
    choices('scope',data.scope,false,'scope');
    choices('timelines',data.timelines,false,'timeline');
    document.getElementById('brief').value=state.brief;
    document.getElementById('problem').value=state.problem;
  }
  function validateTo(target){
    if(target>=1 && !state.brief.trim()){setError('requiredBrief');return false;}
    if(target>=2 && !state.problem.trim()){setError('requiredProblem');return false;}
    if(target>=3 && !state.audience){setError('requiredAudience');return false;}
    if(target>=4 && !state.outcome){setError('requiredOutcome');return false;}
    if(target>=4 && !state.connect.length){setError('requiredConnect');return false;}
    if(target>=5 && !state.scope){setError('requiredScope');return false;}
    if(target>=5 && !state.timeline){setError('requiredTimeline');return false;}
    return true;
  }
  function render(){
    steps.forEach(s=>s.classList.toggle('active',+s.dataset.step===state.step));
    const final=state.step===5;
    next.hidden=final; build.hidden=!final;
    back.style.visibility=state.step===1?'hidden':'visible';
    stepbar.querySelectorAll('button').forEach(b=>b.classList.toggle('active',+b.dataset.goto===state.step));
  }
  function saveInputs(){state.brief=document.getElementById('brief').value.trim();state.problem=document.getElementById('problem').value.trim();}
  next.onclick=()=>{saveInputs();if(validateTo(state.step)){state.step=Math.min(5,state.step+1);clearError();render();}};
  back.onclick=()=>{saveInputs();state.step=Math.max(1,state.step-1);clearError();render();};

  form.addEventListener('submit',e=>{e.preventDefault();saveInputs();if(!validateTo(5))return;buildBlueprint();});

  function includesAny(value,patterns){return patterns.some(p=>new RegExp(p,'i').test(value));}
  function buildBlueprint(){
    const data=activeLocale||{};
    const a=state.audience.toLowerCase(),o=state.outcome.toLowerCase(),scope=state.scope.toLowerCase(),connect=state.connect.join(' ').toLowerCase();
    let architecture=data.blueprint?.architectures?.default||'Modular digital platform';
    let modules=[...(data.blueprint?.modules?.default||[])];
    let opps=[...(data.blueprint?.opportunities?.default||[])];
    let complexity=data.blueprint?.complexity?.medium||'MEDIUM';

    if(includesAny(a,['internal','intern','interno','interno','intern','داخلي'])) modules=[...(data.blueprint?.modules?.internal||modules)];
    else if(includesAny(a,['customer','cliente','kunden','عميل','عملاء'])) modules=[...(data.blueprint?.modules?.customer||modules)];
    else if(includesAny(a,['partner','partners','partenaire','شرك'])) modules=[...(data.blueprint?.modules?.partner||modules)];
    else if(includesAny(a,['field','campo','feld','ميداني'])) modules=[...(data.blueprint?.modules?.field||modules)];

    if(includesAny(o,['reduce','manual','reducir','manuelle','تقليل','يدوي'])) opps=[...(data.blueprint?.opportunities?.automation||opps)];
    else if(includesAny(o,['product','launch','producto','produkt','منتج','إطلاق'])) opps=[...(data.blueprint?.opportunities?.product||opps)];
    else if(includesAny(o,['customer','experience','experiencia','erfahrung','تجرب'])) opps=[...(data.blueprint?.opportunities?.experience||opps)];
    else if(includesAny(o,['connect','fragment','conectar','verbinden','ربط'])) opps=[...(data.blueprint?.opportunities?.integration||opps)];

    if(includesAny(scope,['enterprise','empresarial','enterprise','مؤسسي'])){complexity=data.blueprint?.complexity?.high||'HIGH';architecture=data.blueprint?.architectures?.enterprise||architecture;if(!modules.includes(data.blueprint?.governance))modules.push(data.blueprint.governance);}
    else if(includesAny(scope,['mvp','focused','enfocado','fokussiert','مركز'])){complexity=data.blueprint?.complexity?.focused||'FOCUSED';architecture=data.blueprint?.architectures?.mvp||architecture;modules=modules.slice(0,4);}
    else complexity=data.blueprint?.complexity?.medium||complexity;

    if(connect) opps=[...new Set([...opps,...(includesAny(connect,['crm','sales','ventas','vertrieb','مبيعات'])?(data.blueprint?.integrationHints?.crm||[]):[]),...(includesAny(connect,['api','integrations','integraciones','integrationen','واجه'])?(data.blueprint?.integrationHints?.api||[]):[])])];

    const delivery=data.blueprint?.delivery||[];
    document.getElementById('bpTitle').textContent=state.brief.slice(0,100)||data.blueprint?.fallbackTitle||'A5F Blueprint';
    document.getElementById('bpArchitecture').textContent=architecture;
    document.getElementById('bpArchitectureText').textContent=state.problem.slice(0,220)+(state.problem.length>220?'…':'');
    document.getElementById('bpModules').innerHTML=modules.map(x=>`<li>${esc(x)}</li>`).join('');
    document.getElementById('bpOpps').innerHTML=[...new Set(opps)].map(x=>`<li>${esc(x)}</li>`).join('');
    document.getElementById('bpDelivery').innerHTML=delivery.map(x=>`<li>${esc(x)}</li>`).join('');
    document.getElementById('bpComplexity').textContent=complexity;
    document.getElementById('bpTimeline').textContent=state.timeline;

    const blueprint={...state,language:lang,generatedAt:new Date().toISOString(),architecture,modules,opportunities:[...new Set(opps)],complexity};
    localStorage.setItem('a5f-last-blueprint',JSON.stringify(blueprint));
    const subject=data.emailSubject||'A5F Project Blueprint';
    const body=[
      `${data.emailLabels?.project||'Project'}: ${state.brief}`,
      `${data.emailLabels?.problem||'Problem'}: ${state.problem}`,
      `${data.emailLabels?.audience||'Audience'}: ${state.audience}`,
      `${data.emailLabels?.outcome||'Outcome'}: ${state.outcome}`,
      `${data.emailLabels?.connections||'Connections'}: ${state.connect.join(', ')}`,
      `${data.emailLabels?.scope||'Scope'}: ${state.scope}`,
      `${data.emailLabels?.timeline||'Timeline'}: ${state.timeline}`,
      '',
      `${data.emailLabels?.architecture||'Recommended architecture'}: ${architecture}`,
      `${data.emailLabels?.complexity||'Complexity'}: ${complexity}`
    ].join('\n');
    const cta=document.querySelector('.bp-cta .btn');
    if(cta) cta.href=`mailto:hello@a5f.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const out=document.getElementById('blueprint');
    out.hidden=false;
    populateBriefForm();
    out.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function populateBriefForm(){
    const brief=document.getElementById('projectBriefData'); if(!brief)return;
    const data=activeLocale||{};
    brief.value=[
      `${data.emailLabels?.project||'Project'}: ${state.brief}`,
      `${data.emailLabels?.problem||'Problem'}: ${state.problem}`,
      `${data.emailLabels?.audience||'Audience'}: ${state.audience}`,
      `${data.emailLabels?.outcome||'Outcome'}: ${state.outcome}`,
      `${data.emailLabels?.connections||'Connections'}: ${state.connect.join(', ')}`,
      `${data.emailLabels?.scope||'Scope'}: ${state.scope}`,
      `${data.emailLabels?.timeline||'Timeline'}: ${state.timeline}`
    ].join('\n');
  }

  // Project brief: Netlify Forms AJAX submission.
  // The form itself is static HTML so Netlify can detect it at deploy time.
  // Submission is URL-encoded to Netlify's root endpoint, then we redirect
  // to a real static success page.
  const briefForm=document.getElementById('projectBriefForm');
  if(briefForm){
    briefForm.addEventListener('submit',async e=>{
      e.preventDefault();
      saveInputs();
      if(!validateTo(5)) return;
      buildBlueprint();

      const data=activeLocale||{};
      const submit=briefForm.querySelector('[type="submit"]');
      const status=document.getElementById('briefStatus');
      const fallback=document.getElementById('briefEmailFallback');

      const formData=new FormData(briefForm);
      formData.set('form-name','project-brief');
      formData.set('language',lang);
      formData.set('project',state.brief);
      formData.set('problem',state.problem);
      formData.set('audience',state.audience);
      formData.set('outcome',state.outcome);
      formData.set('connections',state.connect.join(', '));
      formData.set('scope',state.scope);
      formData.set('timeline',state.timeline);
      formData.set('architecture',document.getElementById('bpArchitecture')?.textContent||'');
      formData.set('complexity',document.getElementById('bpComplexity')?.textContent||'');
      formData.set('modules',Array.from(document.querySelectorAll('#bpModules li')).map(x=>x.textContent).join(' | '));
      formData.set('opportunities',Array.from(document.querySelectorAll('#bpOpps li')).map(x=>x.textContent).join(' | '));
      formData.set('delivery',Array.from(document.querySelectorAll('#bpDelivery li')).map(x=>x.textContent).join(' | '));

      if(status){
        status.hidden=false;
        status.className='brief-status';
        status.textContent=data.sending||'Sending…';
      }
      if(submit) submit.disabled=true;

      const encodedBody=encodeURIComponent(document.getElementById('projectBriefData')?.value||'');
      const encodedSubject=encodeURIComponent(data.emailSubject||'A5F Project Blueprint');
      if(fallback) fallback.href=`mailto:hello@a5f.net?subject=${encodedSubject}&body=${encodedBody}`;

      // Persist the generated lead in the same Supabase-backed Lead Center.
      // Netlify Forms remains the email/notification path, while this call
      // makes the Lead Center independent from the form integration.
      try{
        const leadPayload={
          name:briefForm.elements.name?.value||'',
          email:briefForm.elements.email?.value||'',
          company:briefForm.elements.company?.value||'',
          role:briefForm.elements.role?.value||'',
          project:state.brief,
          status:'NEW',
          value:'',
          notes:state.problem,
          priority:'MEDIUM',
          blueprint:JSON.parse(localStorage.getItem('a5f-last-blueprint')||'null'),
          blueprintKey:JSON.parse(localStorage.getItem('a5f-last-blueprint')||'null')?.generatedAt||'',
          activities:[{at:new Date().toISOString(),text:'Lead submitted from Project Architect'}]
        };
        const leadResponse=await fetch('/api/leads.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(leadPayload)});
        if(!leadResponse.ok){const problem=await leadResponse.text();throw new Error(problem||`Lead API failed: ${leadResponse.status}`);}
      }catch(leadError){
        console.warn('Supabase Lead Center sync failed; Netlify Form will still be submitted.',leadError);
      }

      try{
        const response=await fetch('/api/forms.php',{
          method:'POST',
          headers:{'Content-Type':'application/x-www-form-urlencoded'},
          body:new URLSearchParams(Object.assign({form:'project-brief'}, Object.fromEntries(formData))).toString()
        });
        if(!response.ok) throw new Error(`Form submission failed: ${response.status}`);
        window.location.assign('/architect/sent/');
      }catch(err){
        console.error('Netlify form submission failed',err);
        if(status){
          status.hidden=false;
          status.textContent=data.sendError||'We could not send the brief. Please try again or email hello@a5f.net.';
        }
        if(fallback) fallback.hidden=false;
        if(submit) submit.disabled=false;
      }
    });
  }

  document.getElementById('reset').onclick=()=>{
    Object.assign(state,{step:1,brief:'',problem:'',audience:'',outcome:'',connect:[],scope:'',timeline:''});
    document.getElementById('blueprint').hidden=true;clearError();renderChoices(activeLocale);render();window.scrollTo({top:0,behavior:'smooth'});
  };
  const menuButton=document.querySelector('.menu-btn');
  const navList=document.getElementById('nav-list');
  if(menuButton && navList){
    menuButton.onclick=()=>{
      const open=navList.classList.toggle('open');
      menuButton.setAttribute('aria-expanded',open?'true':'false');
    };
    navList.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      navList.classList.remove('open');
      menuButton.setAttribute('aria-expanded','false');
    }));
  }
  current.onclick=()=>{const o=switcher.classList.toggle('open');current.setAttribute('aria-expanded',o?'true':'false')};
  switcher.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{lang=b.dataset.lang;localStorage.setItem('a5f-lang',lang);switcher.classList.remove('open');locale(lang).then(apply).catch(()=>setError('localeError'));});
  document.addEventListener('click',e=>{if(!switcher.contains(e.target)){switcher.classList.remove('open');current.setAttribute('aria-expanded','false')}});
  locale(lang).then(apply).catch(()=>setError('localeError'));
})();
