(function(){
  const form=document.getElementById('huntForm'), status=document.getElementById('status'), empty=document.getElementById('empty'), out=document.getElementById('resultContent');
  function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function list(a){return Array.isArray(a)?a.map(x=>'<li>'+esc(x)+'</li>').join(''):''}
  form.addEventListener('submit',async e=>{
    e.preventDefault(); status.textContent='Researching businesses…'; empty.classList.add('hidden'); out.classList.add('hidden');
    const fd=new FormData(form); const body={location:fd.get('location'),category:fd.get('category'),limit:Number(fd.get('limit')),signals:{noWebsite:fd.has('noWebsite'),reviews:fd.has('reviews'),mobile:fd.has('mobile'),booking:fd.has('booking')}};
    try{
      const r=await fetch('/api/business-agent.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const data=await r.json(); if(!r.ok) throw new Error(data.error||'Agent failed');
      const prospects=data.prospects||[]; status.textContent=`Completed · ${prospects.length} prospects`; 
      out.innerHTML='<div class="result-top"><div><div class="k">RUN COMPLETE</div><h3 style="margin:8px 0 0;font-size:28px">'+esc(data.location)+' · '+esc(data.category)+'</h3></div><div class="score">'+esc(data.summary?.hot||0)+' HOT</div></div>'+
        '<div class="cards">'+prospects.map((p,i)=>'<article class="card"><div style="display:flex;justify-content:space-between;gap:10px"><b>#'+(i+1)+' · '+esc(p.category||data.category)+'</b><span class="badge">'+esc(p.priority||'LEAD')+'</span></div><h3>'+esc(p.name)+'</h3><p>'+esc(p.address||'')+'</p><p><strong>Score: '+esc(p.score)+'/100</strong> · '+esc(p.rating||'—')+' ★ · '+esc(p.reviewCount||0)+' reviews</p><p>'+esc(p.summary||'')+'</p><div class="ai-points"><b>WHY</b><ul>'+list(p.reasons)+'</ul></div><div class="ai-points"><b>RECOMMENDATION</b><p>'+esc(p.recommendation||'')+'</p></div><div class="actions"><button class="btn secondary" type="button" data-copy="'+esc(p.outreach||'')+'">Copy outreach</button><button class="btn" type="button" data-blueprint="'+esc(p.name)+'">Website blueprint</button></div></article>').join('')+'</div>';
      out.classList.remove('hidden'); out.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>navigator.clipboard?.writeText(b.dataset.copy).then(()=>{b.textContent='Copied';}));
    }catch(err){status.textContent='Error: '+err.message; empty.classList.remove('hidden');}
  });
})();
