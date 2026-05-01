function buildSetup(){
  const el=document.getElementById('setup-list');
  const dayNames=["Gün 1","Gün 2","Gün 3"];
  el.innerHTML = DAYS.map((dayIds,di)=>{
    const weightExs = dayIds.map(id=>EX[id]).filter(e=>e.hasWeight);
    const bwExs = dayIds.map(id=>EX[id]).filter(e=>!e.hasWeight);
    return `
    <div style="margin-bottom:8px">
      <div class="gh" onclick="toggleG('g-d${di}')">
        <div class="gt">${dayNames[di].toLocaleUpperCase('tr-TR')}</div>
        <div style="font-size:12px;color:var(--muted);flex:1;margin-left:8px">${dayIds.length} hareket</div>
        <span id="g-d${di}-ch">▸</span>
      </div>
      <div class="gb" id="g-d${di}">
        ${weightExs.map(ex=>{
          const sv=S.maxes[ex.id];
          const rmKg=sv?.rmKg||'', rmReps=sv?.rmReps||'';
          const startKg=sv?.kg ? `${sv.kg} kg` : '—';
          return `<div class="ec">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <div class="en" style="margin:0">${ex.name}</div>
              <button class="btn bo" onclick="showGif('${ex.id}')" style="padding:6px 12px;font-size:12px;width:auto">📹 Nasıl Yapılır?</button>
            </div>
            <div class="esch">${ex.scheme}</div>
            <div class="lbl" style="margin-bottom:5px">Alternatif (opsiyonel)</div>
            <select id="alt-${ex.id}" style="margin-bottom:8px" onchange="toggleCustom('${ex.id}',this.value)">
              <option value="-1" ${!sv||sv.altIdx<0?'selected':''}>— Orijinal (${ex.name})</option>
              ${ex.alts.map((a,i)=>`<option value="${i}" ${sv?.altIdx===i?'selected':''}>${a}</option>`).join('')}
              <option value="custom" ${sv?.altIdx==='custom'?'selected':''}>✏️ Özel hareket gir...</option>
            </select>
            <input type="text" id="custom-${ex.id}" placeholder="Hareket adını yaz..." maxlength="60"
              style="margin-bottom:10px;display:${sv?.altIdx==='custom'?'block':'none'}"
              value="${sv?.customName||''}"/>
            <div class="lbl" style="margin-bottom:6px">1 Tekrar Max Hesabı</div>
            <div class="g2" style="margin-bottom:6px">
              <div><div class="lbl">Ağırlık (kg)</div>
                <input type="number" id="rmkg-${ex.id}" class="no-spin" placeholder="ör. 60" min="0" step="0.5" value="${rmKg}"
                  oninput="calcStart('${ex.id}',${ex.rmMult})"/></div>
              <div><div class="lbl">Tekrar sayısı</div>
                <input type="number" id="rmrep-${ex.id}" class="no-spin" placeholder="ör. 8" min="1" max="30" step="1" value="${rmReps}"
                  oninput="calcStart('${ex.id}',${ex.rmMult})"/></div>
            </div>
            <div id="calc-${ex.id}" style="font-size:13px;padding:8px 12px;background:var(--bg3);border-radius:8px;margin-bottom:10px;display:${sv?.kg?'flex':'none'};align-items:center;justify-content:space-between">
              <span style="color:var(--muted)">Başlangıç ağırlığı</span>
              <span style="font-size:16px;font-weight:700;color:var(--accent)" id="calcval-${ex.id}">${startKg}</span>
            </div>
            <div><div class="lbl">Haftalık artış (kg)</div>
              <div style="display:flex;gap:8px;align-items:center">
                <button class="btn bo" type="button" onclick="decrementInc('${ex.id}')" style="flex:0 0 44px;padding:8px">−</button>
                <input type="number" id="inc-${ex.id}" class="no-spin" placeholder="ör. 2.5" min="0" step="0.5" value="${(typeof sv!=='undefined' && typeof sv.inc!=='undefined')?sv.inc:2.5}" style="text-align:center;flex:1"/>
                <button class="btn bp" type="button" onclick="incrementInc('${ex.id}')" style="flex:0 0 44px;padding:8px">+</button>
              </div>
            </div>
          </div>`;
        }).join('')}
        ${bwExs.map(ex=>{
          const sv=S.maxes[ex.id];
          return `<div class="ec">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <div class="en" style="margin:0">${ex.name}</div>
              <button class="btn bo" onclick="showGif('${ex.id}')" style="padding:6px 12px;font-size:12px;width:auto">📹 Nasıl Yapılır?</button>
            </div>
            <div class="esch">${ex.scheme}</div>
            <div class="lbl" style="margin-bottom:5px">Alternatif (opsiyonel)</div>
            <select id="alt-${ex.id}" style="margin-bottom:8px" onchange="toggleCustom('${ex.id}',this.value)">
              <option value="-1" ${!sv||sv.altIdx<0?'selected':''}>— Orijinal (${ex.name})</option>
              ${ex.alts.map((a,i)=>`<option value="${i}" ${sv?.altIdx===i?'selected':''}>${a}</option>`).join('')}
              <option value="custom" ${sv?.altIdx==='custom'?'selected':''}>✏️ Özel hareket gir...</option>
            </select>
            <input type="text" id="custom-${ex.id}" placeholder="Hareket adını yaz..." maxlength="60"
              style="margin-bottom:10px;display:${sv?.altIdx==='custom'?'block':'none'}"
              value="${sv?.customName||''}"/>
            <div style="font-size:12px;color:var(--muted);padding:8px 12px;background:var(--bg3);border-radius:8px">Vücut ağırlığı — giriş gerekmez</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');
}

function toggleG(id){
  const el=document.getElementById(id),ch=document.getElementById(id+'-ch');
  el.classList.toggle('open');
  ch.textContent=el.classList.contains('open')?'▾':'▸';
}

function showGif(exId){
  const ex = EX[exId];
  if(!ex) return;
  
  let displayName = ex.name;
  let altIdx = -1;
  let customName = '';
  
  const altSelectEl = document.getElementById('alt-' + exId);
  if(altSelectEl) {
    const altVal = altSelectEl.value;
    const customEl = document.getElementById('custom-' + exId);
    if(altVal === 'custom' && customEl) {
      customName = customEl.value.trim();
      displayName = customName || ex.name;
    } else if(altVal !== '-1' && !isNaN(parseInt(altVal))) {
      altIdx = parseInt(altVal);
      displayName = ex.alts[altIdx] || ex.name;
    }
  } else {
    const sv = S.maxes[exId];
    if(sv?.altIdx !== undefined && sv.altIdx !== null) {
      if(sv.altIdx === 'custom') {
        displayName = sv.customName || ex.name;
      } else if(sv.altIdx >= 0 && ex.alts) {
        displayName = ex.alts[sv.altIdx];
      }
    }
  }
  
  if(displayName !== ex.name && !EXERCISE_GIFS[displayName]) {
    alert(`"${displayName}" için GIF bulunamadı.`);
    return;
  }
  
  const gifUrl = EXERCISE_GIFS[displayName];
  if(!gifUrl) {
    alert(`"${displayName}" için GIF bulunamadı.`);
    return;
  }
  
  const modal = document.getElementById('gif-modal');
  const ms = modal?.querySelector('.ms');
  const isSmallContext = !!document.getElementById('alt-'+exId) || document.getElementById('page-setup')?.classList.contains('active') || document.getElementById('page-profile')?.classList.contains('active');
  if(ms){
    if(isSmallContext){ ms.style.maxWidth = '380px'; ms.style.width = '90%'; }
    else { ms.style.maxWidth = '700px'; ms.style.width = '90%'; }
  }

  document.getElementById('gif-title').textContent = displayName + ' — Nasıl Yapılır?';
  document.getElementById('gif-img').src = gifUrl;
  modal.classList.add('open');
}

function closeGifModal(){
  document.getElementById('gif-modal').classList.remove('open');
  document.getElementById('gif-img').src='';
}

function calcStart(exId, mult){
  const kg=parseFloat(document.getElementById('rmkg-'+exId)?.value)||0;
  const reps=parseInt(document.getElementById('rmrep-'+exId)?.value)||0;
  const calcEl=document.getElementById('calc-'+exId);
  const valEl=document.getElementById('calcval-'+exId);
  if(kg>0&&reps>0){
    const orm=kg+(kg*reps*0.0333);
    const start = mround25(orm * mult);
    if(valEl) valEl.textContent=start+' kg';
    if(calcEl) calcEl.style.display='flex';
  } else {
    if(calcEl) calcEl.style.display='none';
  }
}

function incrementInc(exId){
  const el=document.getElementById('inc-'+exId);
  if(!el) return;
  const cur=parseFloat(el.value)||0;
  el.value = Math.round((cur + 0.5) * 10) / 10;
}

function decrementInc(exId){
  const el=document.getElementById('inc-'+exId);
  if(!el) return;
  const cur=parseFloat(el.value)||0;
  el.value = Math.max(0, Math.round((cur - 0.5) * 10) / 10);
}

function toggleCustom(exId, val){
  const el=document.getElementById('custom-'+exId);
  if(el) el.style.display=(val==='custom')?'block':'none';
}

function saveAndStart(){
  let missing=false;
  Object.values(EX).filter(e=>e.hasWeight).forEach(ex=>{
    const rmkgEl=document.getElementById('rmkg-'+ex.id);
    const rmrepEl=document.getElementById('rmrep-'+ex.id);
    const incEl=document.getElementById('inc-'+ex.id);
    const altEl=document.getElementById('alt-'+ex.id);
    const customEl=document.getElementById('custom-'+ex.id);
    if(!rmkgEl) return;
    const rmKg=parseFloat(rmkgEl.value);
    const rmReps=parseInt(rmrepEl?.value)||0;
    const inc=parseFloat(incEl?.value);
    const altVal=altEl?.value??'-1';
    const altIdx=altVal==='custom'?'custom':parseInt(altVal);
    const customName=customEl?.value.trim()||'';
    if(isNaN(rmKg)||rmKg<=0||rmReps<=0){missing=true;return;}
    const orm=rmKg+(rmKg*rmReps*0.0333);
    const kg = mround25(orm * ex.rmMult);
    S.maxes[ex.id]={kg, inc:isNaN(inc)?0:inc, altIdx, customName, rmKg, rmReps};
  });
  if(missing){alert('Lütfen tüm hareketler için ağırlık ve tekrar sayısı gir!');return;}
  
  Object.values(EX).filter(e=>!e.hasWeight).forEach(ex=>{
    const altEl=document.getElementById('alt-'+ex.id);
    const customEl=document.getElementById('custom-'+ex.id);
    if(altEl){
      const altVal=altEl.value??'-1';
      const altIdx=altVal==='custom'?'custom':parseInt(altVal);
      const customName=customEl?.value.trim()||'';
      S.maxes[ex.id]={altIdx, customName};
    }
  });
  
  const kg=parseFloat(document.getElementById('setup-kg')?.value)||0;
  const cm=parseFloat(document.getElementById('setup-cm')?.value)||0;
  const age=parseInt(document.getElementById('setup-age')?.value)||0;
  const gender=document.getElementById('setup-gender')?.value||'';
  if(kg>0||cm>0||age>0||gender){
    S.profile={kg,cm,age,gender};
    if(kg>0 && Object.keys(S.weeklyWeights).length===0){
      for(let i=0;i<13;i++) S.weeklyWeights[i]=kg;
    }
  }
  
  S.setupDone=true; saveS();
  renderProgram(); renderProgress();
  showPage('program',document.querySelectorAll('.nb')[1]);
}

function getDisplayName(ex){
  const m=S.maxes[ex.id];
  if(!m||m.altIdx===undefined||m.altIdx===null) return ex.name;
  if(m.altIdx==='custom') return m.customName||ex.name;
  if(m.altIdx<0) return ex.name;
  return ex.alts[m.altIdx]||ex.name;
}

