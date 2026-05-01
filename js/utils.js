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

function getKgAt(exId, weekIdx){
  const m=S.maxes[exId]; if(!m) return 0;
  let kg=m.kg;
  for(let w=0;w<weekIdx;w++){ if(exCompletedInWeek(exId,w)) kg=mround25(kg+(m.inc||0)); }
  return mround25(kg);
}

function exCompletedInWeek(exId, weekIdx){
  const wk='w'+weekIdx;
  for(let d=0;d<3;d++){
    if(DAYS[d].includes(exId)){
      const val=S.weekData[wk]?.['d'+d]?.[exId];
      if(!val) return false;
      // Yeni format objeyse ve hedefe ulaşıldıysa true dön
      if(typeof val === 'object') {
          return val.targetMet === true;
      }
      // Geriye dönük uyumluluk
      return val === true;
    }
  }
  return false;
}

