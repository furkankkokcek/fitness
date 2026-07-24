function limitDecimals(v,d){
  if(!v) return v;
  const parts=v.toString().split('.');
  if(parts.length>1&&parts[1].length>d) return parts[0]+'.'+parts[1].slice(0,d);
  return v;
}

// DOĞRU TÜRKÇE BÜYÜK HARF FONKSİYONU
function normalizeUppercaseText(text) {
  if (!text) return "";
  return text.toLocaleUpperCase('tr-TR').replace(/İ/g, 'I');
}

function updateProgWeekWeight(val){
  const kg=parseFloat(parseFloat(val).toFixed(2))||0;
  if(kg<=0) return;
  const w=S.currentWeek;
  if(!S.weeklyWeights) S.weeklyWeights={};
  const prev=S.weeklyWeights[w-1]||S.profile?.kg||0;
  S.weeklyWeights[w]=kg;
  saveS();
  const diffEl=document.getElementById('prog-weight-diff');
  if(diffEl&&prev>0){
    const diff=(kg-prev).toFixed(1);
    const sign=diff>0?'+':'';
    diffEl.textContent=sign+diff+' kg';
    diffEl.style.color=diff>0?'var(--danger)':diff<0?'var(--success)':'var(--muted)';
  }
}

function renderProgWeightTracker(){
  const wrap=document.getElementById('prog-weight-wrap');
  if(!wrap) return;
  const hasProfile=S.profile&&S.profile.kg>0;
  if(!hasProfile){ wrap.style.display='none'; return; }
  wrap.style.display='block';
  if(!S.weeklyWeights) S.weeklyWeights={};
  if(Object.keys(S.weeklyWeights).length===0){
    // 13 HAFTA (Deload dahil) için alan oluşturulur
    for(let i=0;i<13;i++) S.weeklyWeights[i]=S.profile.kg;
  }
  const w=S.currentWeek;
  const kg=S.weeklyWeights[w]||S.profile.kg;
  const inp=document.getElementById('prog-week-weight');
  if(inp) inp.value=kg.toFixed(2);
  const prev=S.weeklyWeights[w-1]||S.profile.kg;
  const diff=(kg-prev).toFixed(1);
  const diffEl=document.getElementById('prog-weight-diff');
  if(diffEl&&w>0){
    const sign=diff>0?'+':'';
    diffEl.textContent=sign+diff+' kg';
    diffEl.style.color=diff>0?'var(--danger)':diff<0?'var(--success)':'var(--muted)';
  } else if(diffEl){
    diffEl.textContent='';
  }
}

function mround25(v){return Math.round(v / 2.5) * 2.5;}

// ── AĞIRLIK BİRİMİ (hareket bazında kg/lbs) ─────────────
const LBS_PER_KG = 2.20462;
// Bir hareketin birimi; kayıtlı değeri yoksa varsayılan 'kg' (geriye dönük uyumluluk)
function exUnit(exId){ return (S.maxes && S.maxes[exId] && S.maxes[exId].unit) || 'kg'; }
// Yuvarlama: kg → 2.5 adım (plaka mantığı); lbs → yuvarlama yok (yalnızca ondalık temizliği)
function wRound(v, unit){
  if(unit==='lbs') return Math.round(v*100)/100;
  return Math.round(v/2.5)*2.5;
}
// Hacim/tonaj hesapları için ortak birime (kg) çevir
function toKg(v, unit){ return unit==='lbs' ? v/LBS_PER_KG : v; }
// Bar ağırlığı (tek taraf plaka hesabı için)
function barWeight(unit){ return unit==='lbs' ? 45 : 20; }

function getKgAt(exId, weekIdx){
  const m=S.maxes[exId]; if(!m) return 0;
  const u=m.unit||'kg';
  let kg=m.kg;
  for(let w=0;w<weekIdx;w++){ if(exCompletedInWeek(exId,w)) kg=wRound(kg+(m.inc||0), u); }
  return wRound(kg, u);
}

// ── HAFTALIK GÜN SAYISI (kullanıcı ayarlı, varsayılan 3) ──
function dayCount(){ return Math.max(1, S.dayCount || 3); }
// Bir gün indeksinin egzersiz listesi — varsayılan programda şablonlar döngüyle tekrarlanır
function dayIds(d){ return DAYS[d % DAYS.length]; }

function exCompletedInWeek(exId, weekIdx){
  const wk='w'+weekIdx;
  const n=dayCount();
  let found=false;
  // Egzersiz birden fazla güne düşebilir (döngü); herhangi birinde hedefe ulaşıldıysa hafta tamam sayılır
  for(let d=0;d<n;d++){
    if(!dayIds(d).includes(exId)) continue;
    found=true;
    const val=S.weekData[wk]?.['d'+d]?.[exId];
    if(!val) continue;
    if(typeof val === 'object'){ if(val.targetMet===true) return true; }
    else if(val===true) return true;
  }
  return false;
}

