// ── STREAK ──────────────────────────────────────────────
function todayStr(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function updateStreak(w, d){
  if(!S.streak) S.streak={count:0, lastDate:'', completedSessions:[]};
  if(!S.streak.completedSessions) S.streak.completedSessions=[];
  const key=`w${w}_d${d}`;
  if(S.streak.completedSessions.includes(key)) return; // bu gün zaten sayıldı
  S.streak.completedSessions.push(key);
  S.streak.count=(S.streak.count||0)+1;
  S.streak.lastDate=todayStr();
}

// ── PR (KİŞİSEL REKOR) ──────────────────────────────────
function checkAndUpdatePR(exId, w, d, totalReps){
  const ex=EX[exId];
  if(!S.prs) S.prs={};
  if(ex.hasWeight){
    const kg=getKgAt(exId,w);
    const prev=S.prs[exId]?.kg||0;
    if(kg>prev){ S.prs[exId]={kg, week:w, day:d, date:todayStr()}; return true; }
  } else if(ex.repType==='max' && totalReps>0){
    const prev=S.prs[exId]?.reps||0;
    if(totalReps>prev){ S.prs[exId]={reps:totalReps, week:w, day:d, date:todayStr()}; return true; }
  }
  return false;
}
function showPRToast(exId){
  const ex=EX[exId];
  const name=normalizeUppercaseText(getDisplayName(ex));
  const pr=S.prs[exId];
  const val=ex.hasWeight ? `${pr?.kg} kg` : (ex.id==='g3_pl'||ex.name==='Plank') ? `${pr?.reps} sn` : `${pr?.reps} tekrar`;
  let toast=document.getElementById('pr-toast');
  if(!toast){ toast=document.createElement('div'); toast.id='pr-toast'; document.body.appendChild(toast); }
  toast.innerHTML=`🏆 KİŞİSEL REKOR! ${name} — ${val}`;
  toast.style.cssText=`position:fixed;top:24px;left:50%;transform:translateX(-50%);background:var(--accent);color:#000;font-family:var(--fa);font-size:15px;letter-spacing:.5px;padding:10px 20px;border-radius:50px;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.4);transition:opacity .4s`;
  toast.style.opacity='1';
  clearTimeout(toast._t);
  toast._t=setTimeout(()=>{toast.style.opacity='0';},3000);
}

// ── ANTRENMAN SÜRESİ ────────────────────────────────────
function workoutKey(w,d){ return `w${w}_d${d}`; }
function startWorkoutIfNeeded(w,d){
  const key=workoutKey(w,d);
  if(!S.workoutSessions) S.workoutSessions={};
  if(!S.workoutSessions[key]?.start){
    S.workoutSessions[key]={start:Date.now(), end:null};
    saveS();
  }
}
function finishWorkout(w,d){
  const key=workoutKey(w,d);
  if(!S.workoutSessions) S.workoutSessions={};
  if(S.workoutSessions[key]?.start && !S.workoutSessions[key]?.end){
    S.workoutSessions[key].end=Date.now();
  }
}
function workoutDuration(w,d){
  const s=S.workoutSessions?.[workoutKey(w,d)];
  if(!s?.start) return null;
  const end=s.end||Date.now();
  const ms=end-s.start;
  // Stale: no end set and started more than 6 hours ago → invalid session
  if(!s.end && ms>6*60*60*1000) return null;
  const min=Math.floor(ms/60000), sec=Math.floor((ms%60000)/1000);
  return `${min}d ${sec}s`;
}
function resetWorkoutSession(w,d){
  const key=workoutKey(w,d);
  if(S.workoutSessions?.[key]) delete S.workoutSessions[key];
}

// ── HAFTALIK ÖZET ────────────────────────────────────────
function allWeekDaysDone(w){
  return [0,1,2].every(d=>{
    const dk='d'+d;
    return DAYS[d].every(id=> S.weekData['w'+w]?.[dk]?.[id] !== undefined);
  });
}
function showWeeklySummary(w){
  const existing=document.getElementById('weekly-summary-modal');
  if(existing) existing.remove();

  let totalVol=0, prList=[];
  const dayNames=['Gün 1','Gün 2','Gün 3'];

  let daysHtml='';
  [0,1,2].forEach(d=>{
    const dur=workoutDuration(w,d);
    let dayVol=0;
    DAYS[d].forEach(id=>{
      const ex=EX[id]; if(!ex.hasWeight) return;
      const kg=getKgAt(id,w);
      const val=S.weekData['w'+w]?.['d'+d]?.[id];
      if(!val) return;
      let reps=0;
      for(let i=1;i<=ex.sets;i++) reps+=parseInt(val['s'+i]||0);
      dayVol+=Math.round(kg*reps);
    });
    totalVol+=dayVol;
    daysHtml+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
      <span style="font-family:var(--fa);font-size:14px;letter-spacing:.5px;color:var(--text)">${dayNames[d]}</span>
      <span style="font-size:12px;color:var(--muted)">${dur?`⏱ ${dur}`:''}</span>
      <span style="font-size:13px;font-weight:600;color:var(--accent)">${dayVol.toLocaleString()} kg</span>
    </div>`;
  });

  // PR'lar
  Object.entries(S.prs||{}).forEach(([id,pr])=>{
    if(pr.week===w) prList.push(`🏆 ${normalizeUppercaseText(getDisplayName(EX[id]))} — ${pr.kg} kg`);
  });

  const modal=document.createElement('div');
  modal.id='weekly-summary-modal';
  modal.className='mo open';
  modal.innerHTML=`
    <div class="ms">
      <div style="text-align:center;font-size:40px;margin-bottom:4px">🎯</div>
      <div class="mt2" style="text-align:center">HAFTA ${w+1} TAMAMLANDI!</div>
      <div class="msub" style="text-align:center">Haftanın özeti</div>
      <div style="margin:16px 0">${daysHtml}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg3);border-radius:10px;padding:12px 16px;margin-bottom:${prList.length?'12px':'16px'}">
        <span style="font-size:13px;color:var(--muted)">Toplam Hacim</span>
        <span style="font-family:var(--fa);font-size:22px;color:var(--accent)">${totalVol.toLocaleString()} kg</span>
      </div>
      ${prList.length?`<div style="background:rgba(232,255,71,.08);border:1px solid rgba(232,255,71,.2);border-radius:10px;padding:10px 14px;margin-bottom:16px;font-size:12px;line-height:1.8">${prList.join('<br>')}</div>`:''}
      <div style="display:flex;gap:8px">
        <button class="btn bp" style="flex:1" onclick="exportData();document.getElementById('weekly-summary-modal').remove()">💾 Yedek Al</button>
        <button class="btn bo" style="flex:1" onclick="document.getElementById('weekly-summary-modal').remove()">Kapat</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

// ── HAFTALIK RAPOR ───────────────────────────────────────
function openWeeklyReport(){
  const existing=document.getElementById('weekly-report-modal');
  if(existing) existing.remove();

  const w=S.currentWeek;
  const dayTypes=['Gün 1','Gün 2','Gün 3'];
  const dayIcons=['🔴','🔵','🟢'];

  // Her gün için veri topla
  let totalVol=0, totalTimeMs=0, completedDays=0;
  const days=[0,1,2].map(d=>{
    const data=S.weekData?.['w'+w]?.['d'+d];
    const hasSome=data && Object.keys(data).length>0;
    if(!hasSome) return {done:false,vol:0,dur:null};
    completedDays++;
    let dayVol=0;
    DAYS[d].forEach(id=>{
      const ex=EX[id]; if(!ex.hasWeight) return;
      const kg=getKgAt(id,w);
      const val=data[id]; if(!val) return;
      let reps=0;
      for(let i=1;i<=ex.sets;i++) reps+=parseInt(val['s'+i]||0);
      dayVol+=Math.round(kg*reps);
    });
    totalVol+=dayVol;
    const sess=S.workoutSessions?.[workoutKey(w,d)];
    if(sess?.start && sess?.end) totalTimeMs+=sess.end-sess.start;
    return {done:true, vol:dayVol, dur:workoutDuration(w,d)};
  });

  // PR'lar bu hafta
  const prs=[];
  Object.entries(S.prs||{}).forEach(([id,pr])=>{
    if(pr.week!==w) return;
    const ex=EX[id]; if(!ex) return;
    const name=normalizeUppercaseText(getDisplayName(ex));
    const val=ex.hasWeight?`${pr.kg} kg`:
              (ex.repType==='max'?`${pr.reps} tekrar`:`${pr.reps} tekrar`);
    prs.push({name,val});
  });

  // Kilo değişimi
  const curWt=S.weeklyWeights?.[w];
  const prevWt=w>0?(S.weeklyWeights?.[w-1]||S.profile?.kg):S.profile?.kg;
  const wtDiff=(curWt&&prevWt)?(curWt-prevWt):null;

  // Streak
  const streak=S.streak?.count||0;

  // Toplam süre
  const totalMin=Math.floor(totalTimeMs/60000);
  const totalTimeStr=totalMin>0?`${totalMin} dk`:'—';

  // Motivasyon
  const pct=completedDays/3;
  const [moji,msg]=pct===1?['🔥','Muhteşem hafta! 3/3 antrenman tamamlandı.']:
                   pct>=0.67?['💪','İyi gidiyorsun! Haftayı güçlü bitir.']:
                   pct>0?['⚡','Her adım önemli, devam et!']:
                   ['📅','Bu hafta henüz antrenman yok.'];

  // Gün satırları
  const dayRows=days.map((d,i)=>`
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
      <span style="font-size:16px">${dayIcons[i]}</span>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600;color:${d.done?'var(--text)':'var(--muted)'};font-family:var(--fb)">${dayTypes[i]}</div>
        ${d.dur?`<div style="font-size:11px;color:var(--muted);margin-top:1px">⏱ ${d.dur}</div>`:''}
      </div>
      ${d.done
        ?`<div style="text-align:right">
            <div style="font-size:13px;font-weight:700;color:var(--accent);font-family:var(--fd)">${d.vol.toLocaleString()} kg</div>
            <div style="font-size:10px;color:var(--muted);margin-top:1px">hacim</div>
          </div>`
        :`<div style="font-size:11px;color:var(--muted)">—</div>`
      }
    </div>`).join('');

  // PR bölümü
  const prHtml=prs.length?`
    <div style="background:rgba(232,255,71,.07);border:1px solid rgba(232,255,71,.2);border-radius:12px;padding:12px 14px;margin-bottom:14px">
      <div style="font-size:11px;color:var(--accent);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">🏆 Bu Haftanın PR'ları</div>
      ${prs.map(p=>`<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;margin-bottom:4px">
        <span style="color:var(--text)">${p.name}</span>
        <span style="font-weight:700;color:var(--accent)">${p.val}</span>
      </div>`).join('')}
    </div>`:'';

  // Kilo bölümü
  const wtHtml=curWt?`
    <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:12px 16px;margin-bottom:14px">
      <div>
        <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-weight:600">Vücut Kilosu</div>
        <div style="font-size:22px;font-family:var(--fd);color:var(--text);margin-top:2px">${curWt} kg</div>
      </div>
      ${wtDiff!==null?`<div style="text-align:right">
        <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-weight:600">Değişim</div>
        <div style="font-size:20px;font-family:var(--fd);margin-top:2px;color:${wtDiff<0?'var(--success)':wtDiff>0?'var(--danger)':'var(--muted)'}">
          ${wtDiff>0?'+':''}${wtDiff.toFixed(1)} kg
        </div>
      </div>`:''}
    </div>`:'';

  const modal=document.createElement('div');
  modal.id='weekly-report-modal';
  modal.className='mo open';
  modal.onclick=e=>{ if(e.target===modal) modal.remove(); };
  modal.innerHTML=`
    <div class="ms" style="padding:20px">

      <!-- Başlık -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div>
          <div style="font-family:var(--fa);font-size:20px;letter-spacing:1px;color:var(--accent)">HAFTA ${w+1} <span style="color:var(--muted);font-size:14px">/ 12</span></div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px">${moji} ${msg}</div>
        </div>
        <button onclick="document.getElementById('weekly-report-modal').remove()"
          style="background:var(--bg3);border:none;color:var(--muted);width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center">✕</button>
      </div>

      <!-- Özet kartlar -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:12px 8px;text-align:center">
          <div style="font-family:var(--fd);font-size:26px;color:${completedDays===3?'var(--accent)':'var(--text)'}">${completedDays}/3</div>
          <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-top:3px">Gün</div>
        </div>
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:12px 8px;text-align:center">
          <div style="font-family:var(--fd);font-size:${totalMin>99?'20':'26'}px;color:var(--text)">${totalTimeStr}</div>
          <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-top:3px">Süre</div>
        </div>
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:12px 8px;text-align:center">
          <div style="font-family:var(--fd);font-size:${streak>99?'20':'26'}px;color:var(--success)">${streak}</div>
          <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-top:3px">Streak</div>
        </div>
      </div>

      <!-- Gün detayları -->
      <div style="margin-bottom:14px">${dayRows}</div>

      <!-- Toplam hacim -->
      <div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg3);border:2px solid var(--border);border-radius:12px;padding:12px 16px;margin-bottom:14px">
        <span style="font-size:13px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">Toplam Hacim</span>
        <span style="font-family:var(--fd);font-size:24px;color:var(--accent)">${totalVol.toLocaleString()} kg</span>
      </div>

      ${wtHtml}
      ${prHtml}

      <button class="btn bo" style="width:100%" onclick="document.getElementById('weekly-report-modal').remove()">Kapat</button>
    </div>`;
  document.body.appendChild(modal);
}

