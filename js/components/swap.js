function getSwap(exId, w, d){
  return S.exerciseSwaps?.['w'+w]?.['d'+d]?.[exId] || null;
}
function getSwapName(ex, w, d){
  const sw=getSwap(ex.id, w, d);
  if(!sw) return null;
  if(sw.altIdx==='custom') return (sw.customName||'').trim()||null;
  if(typeof sw.altIdx==='number' && ex.alts && ex.alts[sw.altIdx]) return ex.alts[sw.altIdx];
  return null;
}
function setSwap(exId, w, d, altIdx, customName){
  if(!S.exerciseSwaps) S.exerciseSwaps={};
  const wk='w'+w, dk='d'+d;
  if(!S.exerciseSwaps[wk]) S.exerciseSwaps[wk]={};
  if(!S.exerciseSwaps[wk][dk]) S.exerciseSwaps[wk][dk]={};
  if(altIdx==='custom'){
    S.exerciseSwaps[wk][dk][exId]={altIdx:'custom', customName:(customName||'').trim()};
  } else {
    S.exerciseSwaps[wk][dk][exId]={altIdx:Number(altIdx)};
  }
  saveS();
}
function clearSwap(exId, w, d){
  const wk='w'+w, dk='d'+d;
  if(S.exerciseSwaps?.[wk]?.[dk]){
    delete S.exerciseSwaps[wk][dk][exId];
    if(Object.keys(S.exerciseSwaps[wk][dk]).length===0) delete S.exerciseSwaps[wk][dk];
    if(Object.keys(S.exerciseSwaps[wk]||{}).length===0) delete S.exerciseSwaps[wk];
  }
  saveS();
}
function openSwapModal(exId, w, d){
  const ex=EX[exId];
  if(!ex) return;
  const cur=getSwap(exId, w, d);
  const existing=document.getElementById('swap-modal');
  if(existing) existing.remove();

  const setupName=getDisplayName(ex); // kurulum seçimi (setup alt veya ex.name)
  const isCustomActive=cur && cur.altIdx==='custom';

  // "orijinal" aktiflik: cur yoksa, ya da cur'ın sonucu setupName ile aynıysa
  function isOrigActive(){
    if(!cur) return true;
    if(cur.altIdx==='custom') return (cur.customName||'')=== setupName;
    if(typeof cur.altIdx==='number') return ex.alts?.[cur.altIdx]===setupName;
    return false;
  }

  // Benzersiz seçenek listesi oluştur
  const seen=new Set([setupName]);
  let optsHtml=`<button type="button" class="swap-opt${isOrigActive()?' active':''}" data-alt="orig">
    <span class="swap-opt-name">${normalizeUppercaseText(setupName)}</span>
    <span class="swap-opt-tag">kurulum seçimi</span>
  </button>`;

  // ex.name setupName'den farklıysa ayrıca göster
  if(ex.name!==setupName && !seen.has(ex.name)){
    seen.add(ex.name);
    const isBaseActive=cur && cur.altIdx==='custom' && (cur.customName||'')=== ex.name;
    optsHtml+=`<button type="button" class="swap-opt${isBaseActive?' active':''}" data-alt="base">
      <span class="swap-opt-name">${normalizeUppercaseText(ex.name)}</span>
      <span class="swap-opt-tag">asıl hareket</span>
    </button>`;
  }

  // Alt listesi — kurulum seçimiyle çakışanları atla
  (ex.alts||[]).forEach((altName, i)=>{
    if(seen.has(altName)) return;
    seen.add(altName);
    const isActive=cur && cur.altIdx===i;
    optsHtml+=`<button type="button" class="swap-opt${isActive?' active':''}" data-alt="${i}">
      <span class="swap-opt-name">${normalizeUppercaseText(altName)}</span>
    </button>`;
  });

  const customInputVal=isCustomActive ? (cur.customName||'').replace(/"/g,'&quot;') : '';

  const modal=document.createElement('div');
  modal.id='swap-modal';
  modal.className='mo open';
  modal.innerHTML=`
    <div class="ms">
      <div class="mt2">HAREKETI DEGISTIR</div>
      <div class="msub">Sadece <b>Hafta ${w+1} · Gün ${d+1}</b> için geçerli. Sonraki haftalarda kurulum seçimine döner.</div>
      <div class="swap-list">${optsHtml}</div>
      <div class="lbl" style="margin-top:14px">Diğer (kendin yaz)</div>
      <input id="swap-custom-input" type="text" placeholder="ör. Incline Hammer Press" value="${customInputVal}" style="margin-bottom:14px"/>
      <div class="mbtns">
        <button class="btn bo" onclick="document.getElementById('swap-modal').remove()">İptal</button>
        <button class="btn bp" onclick="confirmSwap('${exId}',${w},${d})">Kaydet</button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  modal.querySelectorAll('.swap-opt').forEach(b=>{
    b.addEventListener('click',()=>{
      modal.querySelectorAll('.swap-opt').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      const inp=document.getElementById('swap-custom-input');
      if(inp) inp.value='';
    });
  });
  document.getElementById('swap-custom-input')?.addEventListener('input',()=>{
    modal.querySelectorAll('.swap-opt').forEach(x=>x.classList.remove('active'));
  });
}
function confirmSwap(exId, w, d){
  const modal=document.getElementById('swap-modal');
  if(!modal) return;
  const sel=modal.querySelector('.swap-opt.active');
  const customVal=(document.getElementById('swap-custom-input')?.value||'').trim();
  if(customVal){
    setSwap(exId, w, d, 'custom', customVal);
  } else if(sel){
    const v=sel.getAttribute('data-alt');
    if(v==='orig'){ clearSwap(exId, w, d); }
    else if(v==='base'){ setSwap(exId, w, d, 'custom', EX[exId]?.name||''); }
    else { setSwap(exId, w, d, parseInt(v,10)); }
  } else {
    clearSwap(exId, w, d);
  }
  modal.remove();
  renderProgram();
}

function toggleExpl(exId,el){
  const content=document.getElementById('expl-content-'+exId);
  const arrow=document.getElementById('expl-arrow-'+exId);
  if(content){
    content.style.display=content.style.display==='none'?'block':'none';
    if(arrow) arrow.textContent=content.style.display==='none'?'▸':'▾';
  }
}

function saveExplanation(exId, w, d, text){
  if(!S.explanations) S.explanations={};
  S.explanations['w'+w+'_d'+d+'_'+exId]=(text||'').trim();
  saveS();
}
function getExplanation(exId, w, d){
  if(!S.explanations) return '';
  // Yeni format önce, yoksa eski global format (geriye dönük uyum)
  return S.explanations['w'+w+'_d'+d+'_'+exId] ?? S.explanations[exId] ?? '';
}
