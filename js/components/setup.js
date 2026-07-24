function setDayCount(n){
  S.dayCount=n;
  if(S.currentDay>=n) S.currentDay=n-1;
  saveS();
  buildSetup();
  if(typeof renderProgram==='function') renderProgram();
}

// ── PROGRAM SİHİRBAZI ──────────────────────────────────
let _wiz=null;
function _initWiz(){
  if(_wiz) return;
  const cp=S.customProgram;
  _wiz={
    split: cp?cp.split:'default',
    days: cp?cp.days:(S.dayCount||3),
    difficulty: cp?cp.difficulty:'intermediate',
    gender: cp?cp.gender:((S.profile&&S.profile.gender)?S.profile.gender:'male'),
  };
}
// Sihirbaz seçimini anında uygula (state + DAYS)
function _applyWiz(){
  if(_wiz.split==='default'){
    useDefaultProgram();
    S.dayCount=_wiz.days; saveS();
  } else {
    const gender=(S.profile&&S.profile.gender)||'';
    generateAndApply({split:_wiz.split, days:_wiz.days, difficulty:_wiz.difficulty, gender});
  }
}
function _refreshAfterWiz(){
  buildSetup();
  if(typeof renderProgram==='function') renderProgram();
  if(typeof renderProgress==='function') renderProgress();
}
function setWizSplit(s){
  _initWiz(); _wiz.split=s;
  const valid=validDaysForSplit(s);
  if(!valid.includes(_wiz.days)) _wiz.days=valid[0];
  _applyWiz(); _refreshAfterWiz();
}
function setWizDays(n){ _initWiz(); _wiz.days=n; _applyWiz(); _refreshAfterWiz(); }
function setWizDiff(d){ _initWiz(); _wiz.difficulty=d; _applyWiz(); _refreshAfterWiz(); }
function _seg(active,cb,label){
  return `<button type="button" onclick="${cb}" style="flex:1;border:1px solid var(--border);cursor:pointer;font-family:var(--fb);font-size:13px;font-weight:600;padding:9px 4px;border-radius:8px;background:${active?'var(--accent)':'var(--bg3)'};color:${active?'#000':'var(--text)'}">${label}</button>`;
}
function _wizardHtml(){
  _initWiz();
  const splits=[['default','Varsayılan'],['fullbody','Full Body'],['upperlower','Upper/Lower'],['ppl','Push/Pull/Legs']];
  const validDays=validDaysForSplit(_wiz.split);
  const diffs=[['beginner','Başlangıç'],['intermediate','Orta'],['advanced','İleri']];
  const isDef=_wiz.split==='default';
  return `<div class="ec" style="margin-bottom:14px">
    <div class="gt" style="font-family:var(--fa);font-size:18px;margin-bottom:12px">PROGRAM SİHİRBAZI</div>
    <div class="lbl" style="margin-bottom:6px">Bölünme tipi</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">
      ${splits.map(([v,l])=>_seg(_wiz.split===v,`setWizSplit('${v}')`,l)).join('')}
    </div>
    <div class="lbl" style="margin-bottom:6px">Haftalık gün sayısı</div>
    <div style="display:flex;gap:6px;margin-bottom:${isDef?'8px':'12px'}">
      ${validDays.map(n=>_seg(_wiz.days===n,`setWizDays(${n})`,n)).join('')}
    </div>
    ${isDef
      ? `<div style="font-size:11px;color:var(--muted);line-height:1.5;margin-bottom:12px">Varsayılan Superhero programı (3 antrenman şablonu). 3'ten fazla gün seçersen şablonlar döngüyle tekrarlanır (Gün 4 = Gün 1 ...).</div>`
      : `<div class="lbl" style="margin-bottom:6px">Zorluk</div>
         <div style="display:flex;gap:6px;margin-bottom:12px">${diffs.map(([v,l])=>_seg(_wiz.difficulty===v,`setWizDiff('${v}')`,l)).join('')}</div>
         <div style="font-size:11px;color:var(--muted);line-height:1.5;margin-bottom:4px">${((S.profile&&S.profile.gender)==='female')?'Profilin kadın olduğu için alt vücut/bacak günlerine ekstra glute hacmi eklenir. ':''}Hareketler zorluk ve bölünmeye göre otomatik seçilir; aşağıdan alternatifle değiştirebilirsin.</div>`}
    <div style="font-size:11px;color:var(--accent);line-height:1.5;margin-top:8px">Seçim anında uygulanır. Aşağıdaki günlerden ağırlıkları ayarlayıp <b>Programı Oluştur →</b> ile kaydet.</div>
  </div>`;
}

function _weightCardHtml(ex, di){
  const sv=S.maxes[ex.id];
  const rmKg=sv?.rmKg||'', rmReps=sv?.rmReps||'';
  const u=sv?.unit||'kg';
  const defInc=(sv && sv.inc!==undefined)?sv.inc:(u==='lbs'?5:2.5);
  return `<div class="ec">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:6px">
      <div class="en" style="margin:0;flex:1;min-width:0">${ex.name}</div>
      <button class="btn bo" onclick="showGif('${ex.id}')" style="padding:6px 10px;font-size:12px;width:auto;white-space:nowrap">📹 Nasıl Yapılır?</button>
      <button class="btn bo" onclick="removeExFromDay(${di},'${ex.id}')" title="Çıkar" style="padding:6px 10px;font-size:13px;width:auto;color:var(--danger);border-color:rgba(248,113,113,.4)">✕</button>
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
    <div class="lbl" style="margin-bottom:5px">Birim</div>
    <div id="unit-${ex.id}" data-unit="${u}" style="display:inline-flex;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:2px;margin-bottom:10px">
      <button type="button" data-unit="kg" onclick="setExUnit('${ex.id}','kg')" style="border:none;cursor:pointer;font-family:var(--fb);font-size:13px;font-weight:600;padding:5px 18px;border-radius:6px;background:${u==='kg'?'var(--accent)':'transparent'};color:${u==='kg'?'#000':'var(--muted)'}">kg</button>
      <button type="button" data-unit="lbs" onclick="setExUnit('${ex.id}','lbs')" style="border:none;cursor:pointer;font-family:var(--fb);font-size:13px;font-weight:600;padding:5px 18px;border-radius:6px;background:${u==='lbs'?'var(--accent)':'transparent'};color:${u==='lbs'?'#000':'var(--muted)'}">lbs</button>
    </div>
    <div class="lbl" style="margin-bottom:6px">1 Tekrar Max Hesabı <span style="color:var(--muted);font-weight:400;text-transform:none;letter-spacing:0">(opsiyonel — başlangıcı otomatik doldurur)</span></div>
    <div class="g2" style="margin-bottom:8px">
      <div><div class="lbl" id="rmkglbl-${ex.id}">Ağırlık (${u})</div>
        <input type="number" id="rmkg-${ex.id}" class="no-spin" placeholder="ör. 60" min="0" step="0.5" value="${rmKg}"
          oninput="calcStart('${ex.id}',${ex.rmMult})"/></div>
      <div><div class="lbl">Tekrar sayısı</div>
        <input type="number" id="rmrep-${ex.id}" class="no-spin" placeholder="ör. 8" min="1" max="30" step="1" value="${rmReps}"
          oninput="calcStart('${ex.id}',${ex.rmMult})"/></div>
    </div>
    <div><div class="lbl" id="startlbl-${ex.id}">Başlangıç ağırlığı (${u})</div>
      <input type="number" id="start-${ex.id}" class="no-spin" placeholder="ör. 40" min="0" step="0.5" value="${sv?.kg??''}" style="margin-bottom:10px;font-weight:700;color:var(--accent)" onblur="snapStart('${ex.id}')"/>
    </div>
    <div><div class="lbl" id="inclbl-${ex.id}">Haftalık artış (${u})</div>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="btn bo" type="button" onclick="decrementInc('${ex.id}')" style="flex:0 0 44px;padding:8px">−</button>
        <input type="number" id="inc-${ex.id}" class="no-spin" placeholder="ör. 2.5" min="0" step="0.5" value="${defInc}" style="text-align:center;flex:1"/>
        <button class="btn bp" type="button" onclick="incrementInc('${ex.id}')" style="flex:0 0 44px;padding:8px">+</button>
      </div>
    </div>
  </div>`;
}

function _bwCardHtml(ex, di){
  const sv=S.maxes[ex.id];
  return `<div class="ec">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:6px">
      <div class="en" style="margin:0;flex:1;min-width:0">${ex.name}</div>
      <button class="btn bo" onclick="showGif('${ex.id}')" style="padding:6px 10px;font-size:12px;width:auto;white-space:nowrap">📹 Nasıl Yapılır?</button>
      <button class="btn bo" onclick="removeExFromDay(${di},'${ex.id}')" title="Çıkar" style="padding:6px 10px;font-size:13px;width:auto;color:var(--danger);border-color:rgba(248,113,113,.4)">✕</button>
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
}

function _repeatChip(ex, di){
  return `<div class="ec" style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;gap:8px">
    <div class="en" style="margin:0;font-size:14px;flex:1;min-width:0">${ex.name}</div>
    <span style="font-size:11px;color:var(--muted);white-space:nowrap">✓ ayarlandı</span>
    <button class="btn bo" onclick="removeExFromDay(${di},'${ex.id}')" title="Çıkar" style="padding:4px 9px;font-size:12px;width:auto;color:var(--danger);border-color:rgba(248,113,113,.4)">✕</button>
  </div>`;
}

function buildSetup(){
  const el=document.getElementById('setup-list');
  const isCustom=!!S.customProgram;
  const dc=dayCount();
  const seen=new Set();
  const daysHtml = DAYS.map((_ignored,di)=>{
    const ids = dayIds(di);
    let label;
    if(isCustom){ label=`${ids.length} hareket`; }
    else if(dc>3){ const u=[]; for(let dd=0; dd<dc; dd++){ if(dd%DAYS.length===di) u.push(dd+1); } label=`Gün ${u.join(', ')}`; }
    else { label=`${ids.length} hareket`; }
    const cards = ids.map(id=>{
      const ex=EX[id]; if(!ex) return '';
      if(seen.has(id)) return _repeatChip(ex, di);
      seen.add(id);
      return ex.hasWeight ? _weightCardHtml(ex, di) : _bwCardHtml(ex, di);
    }).join('');
    return `<div style="margin-bottom:8px">
      <div class="gh" onclick="toggleG('g-d${di}')">
        <div class="gt">GÜN ${di+1}</div>
        <div style="font-size:12px;color:var(--muted);flex:1;margin-left:8px">${label}</div>
        <span id="g-d${di}-ch">▸</span>
      </div>
      <div class="gb" id="g-d${di}">${cards}
        <button type="button" class="btn bo" onclick="openAddExModal(${di})" style="width:100%;margin-top:4px;border-style:dashed">+ Hareket Ekle</button>
      </div>
    </div>`;
  }).join('');
  el.innerHTML = _wizardHtml() + daysHtml;
}

// Bir güne hareket ekleme/çıkarma (S.dayEdits[di] = düzenlenmiş liste)
function removeExFromDay(di, exId){
  const cur = dayIds(di).slice().filter(x=>x!==exId);
  S.dayEdits[di] = cur;
  saveS();
  buildSetup();
  if(typeof renderProgram==='function') renderProgram();
  if(typeof renderProgress==='function') renderProgress();
}
function addExToDay(di, exId){
  const cur = dayIds(di).slice();
  if(!cur.includes(exId)) cur.push(exId);
  S.dayEdits[di] = cur;
  saveS();
  closeAddExModal();
  buildSetup();
  if(typeof renderProgram==='function') renderProgram();
  if(typeof renderProgress==='function') renderProgress();
}
const _MUSCLE_LABELS = {
  chest:'Göğüs', back_v:'Sırt', back_h:'Sırt', shoulders:'Omuz', shoulders_side:'Omuz (yan)',
  biceps:'Biceps', triceps:'Triceps', quads:'Bacak (ön)', hinge:'Bacak (arka)', glutes:'Kalça', core:'Karın'
};
function openAddExModal(di){
  closeAddExModal();
  const inDay = new Set(dayIds(di));
  // Kas grubuna göre grupla, güne ekli olanları hariç tut
  const groups = {};
  Object.values(EX).forEach(ex=>{
    if(inDay.has(ex.id)) return;
    const g = _MUSCLE_LABELS[ex.muscle] || 'Diğer';
    (groups[g] = groups[g] || []).push(ex);
  });
  const order = ['Göğüs','Sırt','Omuz','Omuz (yan)','Biceps','Triceps','Bacak (ön)','Bacak (arka)','Kalça','Karın','Diğer'];
  const keys = Object.keys(groups).sort((a,b)=>{ const ia=order.indexOf(a), ib=order.indexOf(b); return (ia<0?99:ia)-(ib<0?99:ib); });
  const body = keys.map(g=>`
    <div style="margin-bottom:12px">
      <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-weight:700;margin-bottom:6px">${g}</div>
      ${groups[g].map(ex=>`<button type="button" onclick="addExToDay(${di},'${ex.id}')" style="display:flex;justify-content:space-between;align-items:center;width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:11px 12px;margin-bottom:6px;cursor:pointer;color:var(--text);font-family:var(--fb);font-size:14px;text-align:left">
        <span>${ex.name}</span>
        <span style="color:var(--accent);font-weight:700;font-size:18px;line-height:1">+</span>
      </button>`).join('')}
    </div>`).join('') || '<div style="color:var(--muted);text-align:center;padding:20px">Eklenecek başka hareket yok.</div>';
  const modal=document.createElement('div');
  modal.id='add-ex-modal';
  modal.className='mo open';
  modal.onclick=e=>{ if(e.target===modal) closeAddExModal(); };
  modal.innerHTML=`<div class="ms" style="max-height:80vh;overflow-y:auto">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <div class="mt2" style="margin:0">GÜN ${di+1} — HAREKET EKLE</div>
      <button onclick="closeAddExModal()" style="background:var(--bg3);border:none;color:var(--muted);width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:16px">✕</button>
    </div>
    ${body}
  </div>`;
  document.body.appendChild(modal);
}
function closeAddExModal(){ const m=document.getElementById('add-ex-modal'); if(m) m.remove(); }

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

function curUnit(exId){
  return document.getElementById('unit-'+exId)?.dataset.unit || S.maxes[exId]?.unit || 'kg';
}

function setExUnit(exId, unit){
  const seg=document.getElementById('unit-'+exId);
  if(seg){
    seg.dataset.unit=unit;
    seg.querySelectorAll('button').forEach(b=>{
      const on=b.dataset.unit===unit;
      b.style.background=on?'var(--accent)':'transparent';
      b.style.color=on?'#000':'var(--muted)';
    });
  }
  const rl=document.getElementById('rmkglbl-'+exId); if(rl) rl.textContent='Ağırlık ('+unit+')';
  const sl=document.getElementById('startlbl-'+exId); if(sl) sl.textContent='Başlangıç ağırlığı ('+unit+')';
  const il=document.getElementById('inclbl-'+exId); if(il) il.textContent='Haftalık artış ('+unit+')';
  // Kullanıcı özel değer girmediyse artış varsayılanını birime göre güncelle (kg:2.5 ↔ lbs:5)
  const incEl=document.getElementById('inc-'+exId);
  if(incEl){
    const cur=parseFloat(incEl.value);
    if(!incEl.value || cur===2.5 || cur===5){ incEl.value = unit==='lbs'?5:2.5; }
  }
  const ex=EX[exId];
  if(ex) calcStart(exId, ex.rmMult);
}

// Başlangıç input'undan çıkınca değeri birim ızgarasına oturt (kg → 2.5, lbs → yuvarlama yok).
// Böylece kaydedilen/gösterilen değer input'takiyle birebir aynı olur.
function snapStart(exId){
  const el=document.getElementById('start-'+exId);
  if(!el || !el.value) return;
  const v=parseFloat(el.value);
  if(isNaN(v)||v<=0) return;
  el.value = wRound(v, curUnit(exId));
}

// 1RM (ağırlık+tekrar) girildiğinde başlangıç ağırlığı input'unu otomatik doldurur.
// Kullanıcı bu değeri elle değiştirebilir.
function calcStart(exId, mult){
  const unit=curUnit(exId);
  const wt=parseFloat(document.getElementById('rmkg-'+exId)?.value)||0;
  const reps=parseInt(document.getElementById('rmrep-'+exId)?.value)||0;
  const startEl=document.getElementById('start-'+exId);
  if(startEl && wt>0 && reps>0){
    const orm=wt+(wt*reps*0.0333);
    startEl.value = wRound(orm * mult, unit);
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
    const startEl=document.getElementById('start-'+ex.id);
    const rmkgEl=document.getElementById('rmkg-'+ex.id);
    const rmrepEl=document.getElementById('rmrep-'+ex.id);
    const incEl=document.getElementById('inc-'+ex.id);
    const altEl=document.getElementById('alt-'+ex.id);
    const customEl=document.getElementById('custom-'+ex.id);
    if(!startEl) return;
    const unit=curUnit(ex.id);
    const rawStart=parseFloat(startEl.value);
    if(isNaN(rawStart)||rawStart<=0){missing=true;return;}
    const kg=wRound(rawStart, unit);
    // 1RM alanları artık opsiyonel — sadece referans olarak saklanır
    const rmKg=parseFloat(rmkgEl?.value)||0;
    const rmReps=parseInt(rmrepEl?.value)||0;
    const inc=parseFloat(incEl?.value);
    const altVal=altEl?.value??'-1';
    const altIdx=altVal==='custom'?'custom':parseInt(altVal);
    const customName=customEl?.value.trim()||'';
    S.maxes[ex.id]={kg, inc:isNaN(inc)?0:inc, altIdx, customName, rmKg, rmReps, unit};
  });
  if(missing){alert('Lütfen tüm hareketler için başlangıç ağırlığı gir!');return;}
  
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

