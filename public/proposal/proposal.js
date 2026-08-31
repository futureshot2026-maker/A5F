(function(){
const dict={en:{back:'Lead Center',engine:'Proposal Engine',eyebrow:'A5F / COMMERCIAL SYSTEM',title:'Proposal Engine.',lead:'Turn the approved blueprint into a client-ready proposal without rewriting the brief.',edit:'Edit inputs',print:'Print / PDF',email:'Email proposal',clientPortal:'Client Portal',confidential:'CONFIDENTIAL',projectProposal:'PROJECT PROPOSAL',preparedBy:'Prepared by A5F',executive:'01 / EXECUTIVE SUMMARY',scope:'02 / SCOPE',architecture:'03 / ARCHITECTURE',modules:'04 / DELIVERY MODULES',opportunities:'05 / OPPORTUNITIES',delivery:'06 / DELIVERY PLAN',timeline:'Target timeline',status:'Lead status',priority:'Priority',score:'Lead score',commercial:'07 / COMMERCIAL FRAMEWORK',commercialTitle:'A structured engagement, ready for final pricing.',commercialText:'The proposal intentionally keeps pricing flexible until scope, delivery milestones and commercial terms are approved.',estimate:'Estimated project value',next:'08 / NEXT STEP',nextTitle:'Confirm scope and schedule a working session.',nextText:'Once the scope is approved, A5F can turn this proposal into a delivery plan, milestones and project kickoff.',prepared:'A5F',projectWorkspace:'Project Workspace'},ar:{back:'مركز العملاء',engine:'محرك العروض',eyebrow:'A5F / النظام التجاري',title:'محرك العروض.',lead:'حوّل المخطط المعتمد إلى عرض احترافي جاهز للعميل دون إعادة كتابة الملخص.',edit:'تعديل البيانات',print:'طباعة / PDF',email:'إرسال العرض',clientPortal:'بوابة العميل',confidential:'سري',projectProposal:'عرض مشروع',preparedBy:'إعداد A5F',executive:'01 / الملخص التنفيذي',scope:'02 / النطاق',architecture:'03 / المعمارية',modules:'04 / وحدات التنفيذ',opportunities:'05 / الفرص',delivery:'06 / خطة التنفيذ',timeline:'الجدول المستهدف',status:'حالة العميل',priority:'الأولوية',score:'تقييم العميل',commercial:'07 / الإطار التجاري',commercialTitle:'تعاون منظم وجاهز للتسعير النهائي.',commercialText:'يبقى التسعير مرنًا حتى اعتماد النطاق ومراحل التنفيذ والشروط التجارية.',estimate:'القيمة التقديرية للمشروع',next:'08 / الخطوة التالية',nextTitle:'اعتماد النطاق وجدولة جلسة عمل.',nextText:'بعد اعتماد النطاق، تستطيع A5F تحويل هذا العرض إلى خطة تنفيذ ومراحل وبداية مشروع.',prepared:'A5F',projectWorkspace:'مساحة عمل المشروع'},es:{back:'Centro de leads',engine:'Motor de propuestas',eyebrow:'A5F / SISTEMA COMERCIAL',title:'Motor de propuestas.',lead:'Convierte el blueprint aprobado en una propuesta lista para el cliente.',edit:'Editar datos',print:'Imprimir / PDF',email:'Enviar propuesta',clientPortal:'Portal del cliente',confidential:'CONFIDENCIAL',projectProposal:'PROPUESTA DE PROYECTO',preparedBy:'Preparado por A5F',executive:'01 / RESUMEN EJECUTIVO',scope:'02 / ALCANCE',architecture:'03 / ARQUITECTURA',modules:'04 / MÓDULOS',opportunities:'05 / OPORTUNIDADES',delivery:'06 / PLAN DE ENTREGA',timeline:'Calendario objetivo',status:'Estado del lead',priority:'Prioridad',score:'Puntuación',commercial:'07 / MARCO COMERCIAL',commercialTitle:'Un compromiso estructurado, listo para el precio final.',commercialText:'El precio se mantiene flexible hasta aprobar alcance, hitos y condiciones comerciales.',estimate:'Valor estimado del proyecto',next:'08 / SIGUIENTE PASO',nextTitle:'Confirmar alcance y programar una sesión de trabajo.',nextText:'Una vez aprobado el alcance, A5F puede convertir esta propuesta en un plan de entrega y kickoff.',prepared:'A5F',projectWorkspace:'Espacio de trabajo del proyecto'},de:{back:'Lead Center',engine:'Angebots-Engine',eyebrow:'A5F / COMMERCIAL SYSTEM',title:'Angebots-Engine.',lead:'Den freigegebenen Blueprint ohne erneutes Schreiben in ein kundenfertiges Angebot verwandeln.',edit:'Daten bearbeiten',print:'Drucken / PDF',email:'Angebot senden',clientPortal:'Kundenportal',confidential:'VERTRAULICH',projectProposal:'PROJEKTANGEBOT',preparedBy:'Erstellt von A5F',executive:'01 / EXECUTIVE SUMMARY',scope:'02 / UMFANG',architecture:'03 / ARCHITEKTUR',modules:'04 / LIEFERMODULE',opportunities:'05 / CHANCEN',delivery:'06 / LIEFERPLAN',timeline:'Zielzeitplan',status:'Lead-Status',priority:'Priorität',score:'Lead-Score',commercial:'07 / KOMMERZIELLER RAHMEN',commercialTitle:'Strukturiertes Engagement, bereit für die finale Preisgestaltung.',commercialText:'Die Preisgestaltung bleibt flexibel, bis Umfang, Meilensteine und Konditionen bestätigt sind.',estimate:'Geschätzter Projektwert',next:'08 / NÄCHSTER SCHRITT',nextTitle:'Umfang bestätigen und Arbeitssitzung planen.',nextText:'Nach Freigabe des Umfangs erstellt A5F einen Lieferplan, Meilensteine und den Projektstart.',prepared:'A5F',projectWorkspace:'Projekt-Arbeitsbereich'}};
let lang=localStorage.getItem('a5f-lang')||'es'; if(!dict[lang])lang='es';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function apply(){const d=dict[lang];document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.getElementById('lang').textContent=lang.toUpperCase();document.querySelectorAll('[data-i18n]').forEach(e=>e.textContent=d[e.dataset.i18n]||e.textContent);document.title='A5F — '+d.engine;}
function money(n){return new Intl.NumberFormat(lang==='ar'?'ar-SA':'en-US',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(n)||0)}
function getLead(){
 const id=localStorage.getItem('a5f-proposal-lead');
 const leads=JSON.parse(localStorage.getItem('a5f-leads')||'[]');
 const selected=leads.find(x=>x.id===id);
 if(selected)return selected;
 const b=JSON.parse(localStorage.getItem('a5f-last-blueprint')||'null');
 if(!b)return leads[0]||null;
 const key=b.generatedAt||JSON.stringify(b);
 let lead=leads.find(x=>(x.blueprint?.generatedAt||x.blueprintKey||'')===key);
 if(!lead){
   lead={id:'lead-'+Date.now().toString(36),createdAt:new Date().toISOString(),name:'',email:'',company:'',role:'',project:b.brief||'',status:'NEW',value:'',notes:b.problem||'',priority:'MEDIUM',blueprint:b,blueprintKey:key,activities:[{at:new Date().toISOString(),text:'Blueprint opened in Proposal Engine'}]};
   leads.unshift(lead);localStorage.setItem('a5f-leads',JSON.stringify(leads));
 }
 localStorage.setItem('a5f-proposal-lead',lead.id);
 return lead;
}
function render(){const x=getLead();if(!x){document.getElementById('pProject').textContent='No lead selected';return}const b=x.blueprint||JSON.parse(localStorage.getItem('a5f-last-blueprint')||'{}');
const projectName=String((b.brief||x.project||'A5F Project')||'A5F Project').trim();
document.getElementById('pProject').textContent=projectName;
document.getElementById('pClient').textContent=[x.name,x.company,x.email].filter(Boolean).join(' · ')||'Project stakeholder';
document.getElementById('pDate').textContent=new Intl.DateTimeFormat(lang,{dateStyle:'long'}).format(new Date());
document.getElementById('pSummary').textContent=b.outcome||'A focused digital engagement designed around the stated business outcome.';
document.getElementById('pProblem').textContent=b.problem||x.notes||'';
document.getElementById('pArchitecture').textContent=b.architecture||'Modular digital platform';
document.getElementById('pComplexity').textContent=(b.complexity||'MEDIUM')+' complexity';
document.getElementById('pTimeline').textContent=b.timeline||'TBD';
document.getElementById('pStatus').textContent=x.status||'NEW';
document.getElementById('pPriority').textContent=x.priority||'MEDIUM';
document.getElementById('pScore').textContent=score(x)+'/100';
document.getElementById('pValue').textContent=money(x.value);
list('pScope',b.scope?[b.scope]:[]);
list('pModules',b.modules||[]);
list('pOpps',b.opportunities||[]);
const subject=`A5F Proposal — ${projectName}`;
const body=buildEmail({...x,project:projectName},b);
document.getElementById('email').href=`mailto:${x.email||'hello@a5f.net'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;}
function list(id,arr){document.getElementById(id).innerHTML=(arr||[]).filter(Boolean).map(v=>`<li>${esc(v)}</li>`).join('')||'<li>—</li>'}
function score(x){let n=25;if(x.company)n+=10;if(x.email)n+=10;if(Number(x.value)>=50000)n+=20;else if(Number(x.value)>=10000)n+=12;if(x.project?.length>80)n+=10;if(x.notes?.length>80)n+=10;if(x.status==='QUALIFIED')n+=10;if(x.status==='PROPOSAL')n+=5;if(x.priority==='HIGH')n+=5;if(x.priority==='CRITICAL')n+=10;return Math.min(100,n)}
function buildEmail(x,b){return [`Project: ${x.project||b.brief||''}`,`Client: ${x.name||''}`,`Company: ${x.company||''}`,'',`Outcome: ${b.outcome||''}`,`Problem: ${b.problem||''}`,`Architecture: ${b.architecture||''}`,`Complexity: ${b.complexity||''}`,`Timeline: ${b.timeline||''}`,'',`Modules: ${(b.modules||[]).join(', ')}`,`Opportunities: ${(b.opportunities||[]).join(', ')}`,'','Prepared by A5F — hello@a5f.net'].join('\n')}
document.getElementById('print').onclick=()=>window.print();document.getElementById('edit').onclick=()=>{const id=localStorage.getItem('a5f-proposal-lead');window.location.href='/dashboard/'+(id?'#'+id:'')};document.getElementById('lang').onclick=()=>{const o=['en','ar','es','de'];lang=o[(o.indexOf(lang)+1)%4];localStorage.setItem('a5f-lang',lang);apply();render()};apply();render();
})();
