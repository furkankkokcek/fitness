// ============================================================
// VO₂ MAX INTERVAL — 3 seviyeli koşu bandı interval programı
// Seçilen seviyeye göre süreler ve intervaller değişir.
// Başlat → 5'ten geri sayar, sonra adımları sırayla çalıştırır.
// Her adımın son 5 saniyesinde tekrar geri sayar (sonraki adıma hazırlık).
// ============================================================

const VO2_LEVELS = [
  {
    emoji:'🟢', name:'Seviye 1', tag:'Başlangıç', color:'#4ade80',
    kcal:'160–190 kcal', zorluk:'7.5–8 / 10', egim:'%1',
    warm:{dur:300, speed:'5–6'},
    easy:{dur:180, speed:'7–8'},
    reps:4, work:{dur:120, speed:'9–10'}, rec:{dur:120, speed:'5–6'},
    cool:{dur:240, speed:'5–6'},
    not:'Hedef, yüksek yoğunlukta kaliteli süre biriktirmek. Son intervalde formun bozulmuyorsa Seviye 2\'ye geç.'
  },
  {
    emoji:'🟡', name:'Seviye 2', tag:'Orta', color:'#fbbf24',
    kcal:'180–220 kcal', zorluk:'8.5–9 / 10', egim:'%1',
    warm:{dur:300, speed:'5–6'},
    easy:{dur:180, speed:'7–8'},
    reps:4, work:{dur:120, speed:'10–12'}, rec:{dur:120, speed:'5–6'},
    cool:{dur:300, speed:'5–6'},
    not:'Çoğu kişinin hedeflemesi gereken seviye. 4×2 dakikayı aynı hızda rahat bitirip toparlanabiliyorsan Seviye 3\'e geç.'
  },
  {
    emoji:'🔴', name:'Seviye 3', tag:'İleri', color:'#f87171',
    kcal:'220–280 kcal', zorluk:'9–9.5 / 10', egim:'%1',
    warm:{dur:300, speed:'5–6'},
    easy:{dur:300, speed:'7–9'},
    reps:4, work:{dur:180, speed:'10–12+'}, rec:{dur:120, speed:'5–6'},
    cool:{dur:300, speed:'5–6'},
    not:'Her seferinde hız artırmak zorunda değilsin. VO₂ max için önemli olan yüksek yoğunlukta geçirilen kaliteli süre.'
  }
];

const VO2_TYPES = {
  warm:{label:'Isınma',      color:'#60a5fa'},
  easy:{label:'Hafif koşu',  color:'#fbbf24'},
  work:{label:'INTERVAL',    color:'#f87171'},
  rec :{label:'Toparlanma',  color:'#4ade80'},
  cool:{label:'Soğuma',      color:'#a78bfa'}
};

const VO2_CIRC = 578;

let vo2Level = 0;
let vo2Phase = 'idle';   // idle | prep | run | paused | done
let vo2StepIdx = 0, vo2Rem = 0, vo2Elapsed = 0, vo2Prep = 5, vo2Int = null;

// Seçili seviyenin adım listesini üret.
// Toparlanma intervaller *arasında* — son intervalden sonra doğrudan soğumaya geçilir.
function vo2Steps(idx){
  const L = VO2_LEVELS[idx==null ? vo2Level : idx];
  const s = [];
  s.push({t:'warm', label:'Isınma',     dur:L.warm.dur, speed:L.warm.speed});
  s.push({t:'easy', label:'Hafif koşu', dur:L.easy.dur, speed:L.easy.speed});
  for(let i=0;i<L.reps;i++){
    s.push({t:'work', label:`Interval ${i+1}/${L.reps}`, dur:L.work.dur, speed:L.work.speed});
    if(i < L.reps-1) s.push({t:'rec', label:'Toparlanma', dur:L.rec.dur, speed:L.rec.speed});
  }
  s.push({t:'cool', label:'Soğuma', dur:L.cool.dur, speed:L.cool.speed});
  return s;
}

function vo2Total(idx){ return vo2Steps(idx).reduce((a,s)=>a+s.dur,0); }

function _vo2Fmt(sec){
  sec = Math.max(0, sec);
  const m = Math.floor(sec/60), s = sec%60;
  return m + ':' + (s<10?'0':'') + s;
}

// ---------- Render ----------

function renderVo2(){
  const tabs = document.getElementById('vo2-tabs');
  if(!tabs) return;
  tabs.innerHTML = VO2_LEVELS.map((L,i)=>`
    <button class="vo2-tab${i===vo2Level?' on':''}" onclick="selectVo2Level(${i})" style="${i===vo2Level?`border-color:${L.color};color:${L.color}`:''}">
      <span class="vo2-tab-emoji">${L.emoji}</span>
      <span class="vo2-tab-name">${L.name}</span>
      <span class="vo2-tab-tag">${L.tag}</span>
    </button>`).join('');

  const L = VO2_LEVELS[vo2Level];
  const meta = document.getElementById('vo2-meta');
  if(meta){
    meta.innerHTML = `
      <div class="vo2-meta-item"><div class="vo2-meta-val">${Math.round(vo2Total()/60)} dk</div><div class="vo2-meta-lbl">Toplam</div></div>
      <div class="vo2-meta-item"><div class="vo2-meta-val">${L.egim}</div><div class="vo2-meta-lbl">Eğim</div></div>
      <div class="vo2-meta-item"><div class="vo2-meta-val">${L.kcal.replace(' kcal','')}</div><div class="vo2-meta-lbl">Kalori</div></div>
      <div class="vo2-meta-item"><div class="vo2-meta-val">${L.zorluk.replace(' / 10','')}</div><div class="vo2-meta-lbl">Zorluk /10</div></div>`;
  }

  const plan = document.getElementById('vo2-plan');
  if(plan){
    plan.innerHTML = vo2Steps().map((s,i)=>`
      <div class="vo2-step" id="vo2-step-${i}">
        <span class="vo2-dot" style="background:${VO2_TYPES[s.t].color}"></span>
        <span class="vo2-step-label">${s.label}</span>
        <span class="vo2-step-speed">${s.speed} km/s</span>
        <span class="vo2-step-dur">${_vo2Fmt(s.dur)}</span>
      </div>`).join('');
  }

  const note = document.getElementById('vo2-level-note');
  if(note) note.textContent = L.not;

  _vo2Paint();
}

function selectVo2Level(i){
  if(i===vo2Level && vo2Phase!=='idle') return;
  vo2Level = i;
  resetVo2();
  renderVo2();
}

function _vo2Cur(){ return vo2Steps()[vo2StepIdx]; }

function _vo2Paint(){
  const disp = document.getElementById('vo2-disp');
  if(!disp) return;
  const st    = document.getElementById('vo2-status');
  const sp    = document.getElementById('vo2-speed');
  const ring  = document.getElementById('vo2-ring');
  const total = document.getElementById('vo2-total');
  const steps = vo2Steps();
  const tot   = vo2Total();

  // Aktif adım vurgusu
  steps.forEach((s,i)=>{
    const el = document.getElementById('vo2-step-'+i);
    if(!el) return;
    const active = (vo2Phase==='run'||vo2Phase==='paused') && i===vo2StepIdx;
    el.classList.toggle('on', active);
    el.classList.toggle('done', (vo2Phase==='done') || ((vo2Phase==='run'||vo2Phase==='paused') && i<vo2StepIdx));
    if(active) el.style.borderColor = VO2_TYPES[s.t].color;
    else el.style.borderColor = '';
  });

  if(vo2Phase==='idle'){
    disp.textContent = _vo2Fmt(steps[0].dur);
    disp.style.color = 'var(--text)';
    st.textContent = 'HAZIR';
    sp.textContent = `${steps[0].label} · ${steps[0].speed} km/s`;
    ring.setAttribute('stroke-dashoffset', 0);
    ring.style.stroke = VO2_TYPES[steps[0].t].color;
    total.textContent = `0:00 / ${_vo2Fmt(tot)}`;
    return;
  }

  if(vo2Phase==='prep'){
    disp.textContent = vo2Prep;
    disp.style.color = 'var(--warn)';
    st.textContent = 'HAZIRLAN!';
    sp.textContent = `Sırada: ${steps[0].label} · ${steps[0].speed} km/s`;
    ring.setAttribute('stroke-dashoffset', VO2_CIRC*(1-vo2Prep/5));
    ring.style.stroke = 'var(--warn)';
    total.textContent = `0:00 / ${_vo2Fmt(tot)}`;
    return;
  }

  if(vo2Phase==='done'){
    disp.textContent = '✓';
    disp.style.color = 'var(--success)';
    st.textContent = 'TAMAMLANDI! 💪';
    sp.textContent = `${VO2_LEVELS[vo2Level].name} · ${_vo2Fmt(tot)}`;
    ring.setAttribute('stroke-dashoffset', 0);
    ring.style.stroke = 'var(--success)';
    total.textContent = `${_vo2Fmt(tot)} / ${_vo2Fmt(tot)}`;
    return;
  }

  // run | paused
  const cur = steps[vo2StepIdx];
  const nxt = steps[vo2StepIdx+1];
  if(vo2Rem<=5 && vo2Rem>0 && nxt){
    // Adım sonu geri sayımı — sıradaki intervale hazırlık
    disp.textContent = vo2Rem;
    disp.style.color = 'var(--warn)';
    st.textContent = `SIRADA: ${nxt.label.toLocaleUpperCase('tr-TR')}`;
    sp.textContent = `${nxt.speed} km/s`;
  } else {
    disp.textContent = _vo2Fmt(vo2Rem);
    disp.style.color = 'var(--text)';
    st.textContent = vo2Phase==='paused' ? 'DURAKLATILDI' : cur.label.toLocaleUpperCase('tr-TR');
    sp.textContent = `${cur.speed} km/s${nxt?` · sırada ${nxt.label}`:' · son adım'}`;
  }
  ring.setAttribute('stroke-dashoffset', VO2_CIRC*(1-vo2Rem/cur.dur));
  ring.style.stroke = VO2_TYPES[cur.t].color;
  total.textContent = `${_vo2Fmt(vo2Elapsed)} / ${_vo2Fmt(tot)}`;
}

// ---------- Timer ----------

function _vo2Buzz(pattern){ if(navigator.vibrate) navigator.vibrate(pattern); }

function _vo2Tick(){
  const steps = vo2Steps();

  if(vo2Phase==='prep'){
    vo2Prep--;
    if(vo2Prep>0){
      _vo2Buzz(60);
      _vo2Paint();
    } else {
      vo2Phase='run';
      vo2StepIdx=0;
      vo2Rem=steps[0].dur;
      vo2Elapsed=0;
      _vo2Buzz([200,100,200]);
      if(typeof playAlarmSound==='function') playAlarmSound();
      _vo2Paint();
    }
    return;
  }

  if(vo2Phase!=='run') return;

  vo2Rem--;
  vo2Elapsed++;

  if(vo2Rem>0){
    if(vo2Rem<=5) _vo2Buzz(60);
    _vo2Paint();
    return;
  }

  // Adım bitti
  if(vo2StepIdx < steps.length-1){
    vo2StepIdx++;
    vo2Rem = steps[vo2StepIdx].dur;
    _vo2Buzz([200,100,200]);
    if(typeof playAlarmSound==='function') playAlarmSound();
    _vo2Paint();
  } else {
    clearInterval(vo2Int); vo2Int=null;
    vo2Phase='done';
    _vo2Buzz([300,120,300,120,300]);
    if(typeof playAlarmSound==='function') playAlarmSound();
    if(typeof sendNotification==='function') sendNotification();
    document.getElementById('vo2-btn').textContent='TEKRAR';
    _vo2Paint();
  }
}

function toggleVo2(){
  const btn = document.getElementById('vo2-btn');
  if(vo2Phase==='idle' || vo2Phase==='done'){
    vo2Phase='prep'; vo2Prep=5; vo2StepIdx=0; vo2Elapsed=0; vo2Rem=0;
    btn.textContent='DURAKLAT';
    _vo2Buzz(60);
    clearInterval(vo2Int);
    vo2Int=setInterval(_vo2Tick,1000);
    _vo2Paint();
  } else if(vo2Phase==='prep' || vo2Phase==='run'){
    clearInterval(vo2Int); vo2Int=null;
    if(vo2Phase==='prep'){ resetVo2(); return; }
    vo2Phase='paused';
    btn.textContent='DEVAM';
    _vo2Paint();
  } else if(vo2Phase==='paused'){
    vo2Phase='run';
    btn.textContent='DURAKLAT';
    clearInterval(vo2Int);
    vo2Int=setInterval(_vo2Tick,1000);
    _vo2Paint();
  }
}

function resetVo2(){
  clearInterval(vo2Int); vo2Int=null;
  vo2Phase='idle'; vo2StepIdx=0; vo2Rem=0; vo2Elapsed=0; vo2Prep=5;
  const btn=document.getElementById('vo2-btn');
  if(btn) btn.textContent='BAŞLAT';
  _vo2Paint();
}

if(document.getElementById('vo2-tabs')) renderVo2();
