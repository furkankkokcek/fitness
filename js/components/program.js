function updSetTotalDynamic(exId, numSets){
    let total = 0;
    for(let i=1; i<=numSets; i++){
        total += parseInt(document.getElementById(`s${i}-${exId}`)?.value) || 0;
    }
    const ex=EX[exId];
    const unit = ex?.repType==='max' ? (exId==='g3_pl' ? 'sn' : 'top') : 'tekrar';
    const el=document.getElementById('total-'+exId);
    if(el) el.textContent=total>0?`Toplam: ${total} ${unit}`:'Toplam: —';
}

function saveDynamicDone(exId, w, d, numSets){
    let setsData = {};
    let allFilled = true;
    let allTargetReached = true;
    let total = 0;
    const ex=EX[exId];
    
    // Egzersiz tipine göre hedefleri belirliyoruz
    let rangeMax = ex.reps;
    if (ex.repType === 'range') {
        const match = ex.scheme.match(/-(\d+)/);
        if (match && match[1]) {
            rangeMax = parseInt(match[1]);
        }
    }

    for(let i=1; i<=numSets; i++){
        const val = parseInt(document.getElementById(`s${i}-${exId}`)?.value) || 0;
        setsData[`s${i}`] = val;
        total += val;
        if(val === 0) allFilled = false;
        
        if (ex.repType === 'fixed') {
            if (val < ex.reps) allTargetReached = false;
        } else if (ex.repType === 'range') {
            if (val < rangeMax) allTargetReached = false;
        } else if (ex.repType === 'plus') {
            // ARTIK SON SETTE 6 YERİNE 5 (ex.reps) İSTENİYOR
            if (val < ex.reps) allTargetReached = false;
        }
    }

    if(ex.repType === 'max') {
        if(total === 0){ alert('En az 1 sete tekrar sayısı gir!'); return; }
        allTargetReached = true; 
    } else {
        if(!allFilled){ 
            if(!confirm('Bazı setleri boş bıraktın veya sıfır girdin. Yine de kaydetmek istiyor musun? (Hedefe ulaşılamadığı için haftaya ağırlık artmayacak)')) return; 
        }
    }

    setsData.targetMet = allTargetReached;

    const wk='w'+w,dk='d'+d;
    if(!S.weekData[wk]) S.weekData[wk]={};
    if(!S.weekData[wk][dk]) S.weekData[wk][dk]={};
    // İlk hareket kaydediliyorsa antrenmanı başlat
    const wasEmpty2 = Object.keys(S.weekData[wk][dk]).length === 0;
    S.weekData[wk][dk][exId] = setsData;
    if(wasEmpty2) startWorkoutIfNeeded(w,d);
    
    saveS(); renderProgram(); renderProgress();

    // Günün tüm egzersizleri tamamlandı mı kontrol et
    const dayExIds = dayIds(d);
    const doneMap = S.weekData['w'+w]?.['d'+d] || {};
    const allDone = dayExIds.every(id => doneMap[id] !== undefined);
    if(allDone) showDayCompleteDialog(w, d);
}

function showDayCompleteDialog(w, d){
  const existing = document.getElementById('day-complete-modal');
  if(existing) existing.remove();

  const sess = S.workoutSessions?.[workoutKey(w,d)];
  let timeInfo = '';
  if(sess?.start){
    const startTime = new Date(sess.start);
    const hh = String(startTime.getHours()).padStart(2,'0');
    const mm = String(startTime.getMinutes()).padStart(2,'0');
    const dur = workoutDuration(w,d);
    const sc = S.streak?.count || 0;
    const streakTxt = sc >= 1 ? `&nbsp;·&nbsp; 🔥 <b style="color:var(--accent)">${sc} antrenman serisi</b>` : '';
    timeInfo = `<div style="margin:10px 0 4px;font-size:13px;color:var(--muted)">⏰ <b style="color:var(--text)">${hh}:${mm}</b> başladı &nbsp;·&nbsp; ⏱ <b style="color:var(--accent)">${dur||'—'}</b>${streakTxt}</div>`;
  }

  const modal = document.createElement('div');
  modal.id = 'day-complete-modal';
  modal.className = 'mo open';
  modal.innerHTML = `
    <div class="ms" style="text-align:center">
      <div style="font-size:48px;margin-bottom:8px">🏆</div>
      <div class="mt2">GÜNÜ TAMAMLADIN!</div>
      <div class="msub">Harika iş! Tüm egzersizleri bitirdin.</div>
      ${timeInfo}
      <div class="mbtns" style="margin-top:14px">
        <button class="btn bp" onclick="exportData();document.getElementById('day-complete-modal').remove()">💾 Yedek Al</button>
        <button class="btn bo" onclick="document.getElementById('day-complete-modal').remove()">Hayır, Geç</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function autoSaveSets(exId, w, d, numSets){
  const ex = EX[exId];
  let setsData = {};
  let allFilled = true;
  let allTargetReached = true;
  let total = 0;

  let rangeMax = ex.reps;
  if(ex.repType === 'range'){
    const match = ex.scheme.match(/-(\d+)/);
    if(match && match[1]) rangeMax = parseInt(match[1]);
  }

  for(let i=1; i<=numSets; i++){
    const val = parseInt(document.getElementById(`s${i}-${exId}`)?.value) || 0;
    setsData[`s${i}`] = val;
    total += val;
    if(val === 0) allFilled = false;
    if(ex.repType === 'fixed' && val < ex.reps) allTargetReached = false;
    else if(ex.repType === 'range' && val < rangeMax) allTargetReached = false;
    else if(ex.repType === 'plus' && val < ex.reps) allTargetReached = false;
  }

  if(ex.repType === 'max'){
    if(!allFilled) return;
    allTargetReached = true;
  } else {
    if(!allFilled) return; // tüm setler dolmadan kaydetme
  }

  setsData.targetMet = allTargetReached;
  const wk='w'+w, dk='d'+d;
  if(!S.weekData[wk]) S.weekData[wk]={};
  if(!S.weekData[wk][dk]) S.weekData[wk][dk]={};
  S.weekData[wk][dk][exId] = setsData;
  startWorkoutIfNeeded(w,d);
  if(S.setDrafts) delete S.setDrafts[`w${w}_d${d}_${exId}`];

  // PR kontrolü — sadece hedef tam karşılandıysa
  const isPR = allTargetReached ? checkAndUpdatePR(exId, w, d, total) : false;

  saveS(); renderProgram(); renderProgress();

  if(isPR) showPRToast(exId);

  const dayExIds = dayIds(d);
  const doneMap = S.weekData['w'+w]?.['d'+d] || {};
  const allDone = dayExIds.every(id => doneMap[id] !== undefined);
  if(allDone){
    updateStreak(w,d);
    finishWorkout(w,d);
    saveS();
    renderProgram(); // done-banner'ı güncelle
    if(allWeekDaysDone(w)){
      setTimeout(()=>showWeeklySummary(w), 300);
    } else {
      showDayCompleteDialog(w, d);
    }
  }
}

function undoDone(exId,w,d){
  const wk='w'+w,dk='d'+d;
  // Geri almadan önce gün tamam mıydı kontrol et
  const wasDayDone = dayIds(d).every(id => S.weekData[wk]?.[dk]?.[id] !== undefined);
  if(S.weekData[wk]?.[dk]) delete S.weekData[wk][dk][exId];
  // Tüm egzersizler silindiyse antrenman süresini sıfırla
  const remaining=Object.keys(S.weekData[wk]?.[dk]||{}).length;
  if(remaining===0) resetWorkoutSession(w,d);
  // Gün tamamlanmışsa streak'i düzelt
  if(wasDayDone){
    if(!S.streak) S.streak={count:0,completedSessions:[]};
    if(!S.streak.completedSessions) S.streak.completedSessions=[];
    const undoIdx = w*3+d;
    // Bu seansı ve sonrasındakileri sil (zincir kırıldı)
    S.streak.completedSessions = S.streak.completedSessions.filter(k=>{
      const m=k.match(/w(\d+)_d(\d+)/);
      if(!m) return false;
      return parseInt(m[1])*3+parseInt(m[2]) < undoIdx;
    });
    S.streak.count = S.streak.completedSessions.length;
  }
  saveS(); renderProgram(); renderProgress();
}

function buildDayTabs(w){
  const cont=document.getElementById('day-tabs');
  if(!cont) return;
  const n=dayCount();
  cont.style.gridTemplateColumns=`repeat(${n},1fr)`;
  let changed=false, html='';
  for(let di=0; di<n; di++){
    const dayDone = w<12 && dayIds(di).every(id=> S.weekData['w'+w]?.['d'+di]?.[id] !== undefined);
    const active = di===S.currentDay ? ' active' : '';
    const fs = n>4 ? 'font-size:11px;padding:9px 2px' : '';
    html+=`<div class="dtab${active}" id="dtab-${di}" onclick="changeDay(${di},this)" style="color:${dayDone?'var(--success)':''};${fs}">${dayDone?'✅ ':''}GÜN ${di+1}</div>`;
    if(dayDone){
      const key=`w${w}_d${di}`;
      if(!S.streak.completedSessions.includes(key)){
        S.streak.completedSessions.push(key);
        S.streak.count=S.streak.completedSessions.length;
        changed=true;
      }
    }
  }
  cont.innerHTML=html;
  if(changed) saveS();
}

function renderProgram(){
  if(S.currentDay>=dayCount()) S.currentDay=dayCount()-1;
  const w=S.currentWeek, d=S.currentDay;
  const wk='w'+w, dk='d'+d;

  document.getElementById('week-disp').textContent='H'+(w+1);
  document.getElementById('btn-prev').disabled=w<=0;
  
  // 13. Haftaya (İndeks 12) izin veriyoruz
  document.getElementById('btn-next').disabled=w>=12; 
  
  // Progress Bar %100 limitli
  const pct=Math.min(100, Math.round(((w+1)/13)*100));
  document.getElementById('prog-pct').textContent=pct+'%';
  document.getElementById('prog-fill').style.width=pct+'%';

  renderProgWeightTracker();

  // ── GÜN sekmeleri (kullanıcı ayarlı sayıda) + tamamlanma ikonu + streak senkronizasyonu ──
  if(!S.streak) S.streak={count:0,completedSessions:[]};
  if(!S.streak.completedSessions) S.streak.completedSessions=[];
  buildDayTabs(w);

  // ==========================================
  // 13. HAFTA (DELOAD / DİNLENME HAFTASI)
  // ==========================================
  if(w === 12) {
     // Dinlenme haftasında üst menüleri ve sekmeleri gizle
     document.querySelector('.dtabs').style.display = 'none';
     document.querySelector('.sr').style.display = 'none';
     
     let html = `
     <div style="text-align:center; padding:20px; background:var(--bg2); border-radius:var(--radius); border:1px solid var(--accent); margin-bottom:20px;">
       <h1 style="font-family:var(--fa); color:var(--accent); font-size:32px; letter-spacing:1px; margin-bottom:10px;">TEBRİKLER! 💪</h1>
       <p style="font-family:var(--fb); line-height:1.6; font-size:15px; color:var(--text);">
         12 döngüyü tamamladın ve dinlenme haftasına ulaştın.<br>
         Bu hafta yalnızca 2 gün, hafif antrenmanlar yapacaksın ve bol bol dinleneceksin. 😴<br><br>
         <small style="color:var(--muted)">Hafta 12'de yapabildiğin en son ağırlık ve tekrarları bir kenara not etmeyi unutma.</small>
       </p>
     </div>`;

     const deloadDays = [
       { title: "GÜN 1", exercises: ["g2_lp", "g1_cp", "g2_pu"] },
       { title: "GÜN 2", exercises: ["g3_sp", "g1_rdl", "g3_br"] }
     ];

     deloadDays.forEach((day, dayIdx) => {
       html += `<h2 style="font-family:var(--fa); margin:24px 0 12px; color:var(--text); font-size:24px; letter-spacing:1px;">${day.title}</h2>`;
       
       day.exercises.forEach(exId => {
         const ex = EX[exId];
         const name = normalizeUppercaseText(getDisplayName(ex));
         let weightText = "Vücut Ağırlığı";
         
         if (ex.hasWeight) {
            // 12. Haftanın (indeks 11) ağırlığını çekip %70'ini hesaplıyoruz
            const u = exUnit(exId);
            const lastWeight = getKgAt(exId, 11) || 0;
            const deloadWeight = wRound(lastWeight * 0.7, u);
            weightText = `${deloadWeight} ${u}`;
         }
         
         html += `
         <div class="xc" style="background:var(--bg3); padding:15px; border-radius:var(--radius); margin-bottom:10px; border-left:4px solid var(--accent)">
           <div class="xname">${name}</div>
           <div style="color:var(--muted); font-size:14px; font-weight:500;">
             3 Set × 5 Tekrar <span style="margin:0 8px; color:var(--border);">|</span> <span style="color:var(--accent); font-weight:600;">Hedef: ${weightText}</span>
           </div>
         </div>`;
       });

       if(dayIdx === 1) {
         html += `
         <div style="margin-top:28px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:20px">
           <div style="font-family:var(--fa);font-size:22px;color:var(--accent);letter-spacing:1px;margin-bottom:14px">PROGRAMI TAMAMLADIKTAN SONRA NE YAPMALIYIM?</div>
           <p style="font-size:14px;color:var(--text);line-height:1.7;margin-bottom:14px">Superhero programı 12 haftalık olarak tasarlanmış olsa da, çok daha uzun süreler verim alınarak yapılabilecek bir programdır. Progressive overload prensibini sağlayarak, ağırlık ve tekrar sayılarını optimize ederek kendi içinde sürekli yenilenen bir yapıya sahiptir.</p>
           <p style="font-size:14px;color:var(--text);line-height:1.7;margin-bottom:14px">12 haftalık antrenman sürecine <strong style="color:var(--accent)">"cycle"</strong> denir. Cycle sonuna geldiğinde program sana bir aktif dinlenme haftası sunar. Bu haftada yalnızca 2 defa, normalde çalıştığın ağırlıkların çok daha hafifleriyle antrenman yapacaksın. Bu haftayı pas geçme — kaslarının onarımı için oldukça değerli!</p>

           <div style="border-top:1px solid var(--border);margin:18px 0"></div>
           <div style="font-family:var(--fa);font-size:18px;color:var(--text);letter-spacing:.5px;margin-bottom:12px">Dinlenme haftasını tamamladım, şimdi ne olacak?</div>
           <p style="font-size:14px;color:var(--text);line-height:1.7;margin-bottom:16px">Önünde 2 seçenek var:</p>

           <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px">
             <div style="font-family:var(--fa);font-size:16px;color:var(--accent);margin-bottom:8px">SEÇENEK 1 — Temiz Başlangıç</div>
             <p style="font-size:13px;color:var(--text);line-height:1.65">Son 2 haftası çok yorucu geçtiyse veya kaslarının iyi bir dinlenmeye ihtiyacı olduğunu hissediyorsan yeni döngüye temiz başla. <strong style="color:var(--text)">12. haftada ulaştığın maksimum ağırlık ve tekrar sayılarını</strong> Kurulum sekmesine gir — formülasyon gerisini halleder, daha yüksek ağırlıklarla devam edersin.</p>
           </div>

           <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px">
             <div style="font-family:var(--fa);font-size:16px;color:var(--accent);margin-bottom:8px">SEÇENEK 2 — 10. Hafta Ağırlıklarıyla Başla</div>
             <p style="font-size:13px;color:var(--text);line-height:1.65">Son 2 hafta çok yorucu geçmediyse ve ağırlıkların artmaya devam edebileceğini düşünüyorsan, <strong style="color:var(--text)">tamamladığın döngünün 10. haftasındaki ağırlıkları</strong> Kurulum sekmesine gir. Bu sayede yeni döngünün 3. haftasından itibaren üzerine koyarak devam edebilirsin.</p>
           </div>
         </div>`;
       }
     });

     document.getElementById('ex-list').innerHTML = html;
     return; // Normal hafta programını basmamak için işlemi durdur
  } 
  // Normal haftalarda sekmeleri görünür yap
  else {
     document.querySelector('.dtabs').style.display = 'grid';
     document.querySelector('.sr').style.display = 'grid';
  }
  // ==========================================


  const exs=getDayExs(d);
  const doneMap=S.weekData[wk]?.[dk]||{};

  let totalSets=0,totalVol=0;
  exs.forEach(ex=>{
    totalSets+=ex.sets;
    if(ex.hasWeight){ const kg=toKg(getKgAt(ex.id,w), exUnit(ex.id)); totalVol+=kg*ex.sets*ex.reps; }
  });
  document.getElementById('s-ex').textContent=exs.length;
  document.getElementById('s-sets').textContent=totalSets;
  document.getElementById('s-vol').textContent=(totalVol/1000).toFixed(1);

  const allDone=exs.every(ex=>doneMap[ex.id]);
  let html='';
  if(allDone&&exs.length>0){
    const dur=workoutDuration(w,d);
    const sc=S.streak?.count||0;
    const sess=S.workoutSessions?.[workoutKey(w,d)];
    let startTxt='';
    if(sess?.start){
      const st=new Date(sess.start);
      startTxt=`${String(st.getHours()).padStart(2,'0')}:${String(st.getMinutes()).padStart(2,'0')}`;
    }
    const metaItems=[
      startTxt?`⏰ ${startTxt}`:'',
      dur?`⏱ ${dur}`:'',
      sc>=1?`🔥 ${sc} seri`:''
    ].filter(Boolean).join(' &nbsp;·&nbsp; ');
    html+=`<div class="done-banner"><div style="font-family:var(--fa);font-size:30px;color:var(--success)">GÜN TAMAM! 🏆</div><div style="font-size:13px;color:var(--muted);margin-top:4px">Harika antrenman!</div>${metaItems?`<div style="font-size:12px;color:var(--accent);margin-top:8px;font-weight:600">${metaItems}</div>`:''}</div>`;
  }

  exs.forEach((ex, exIdx)=>{
    const done=!!doneMap[ex.id];
    // YENİ FONT VE BÜYÜK HARF UYGULAMASI BURADA
    const swapName=getSwapName(ex, w, d);
    const isSwapped=!!swapName;
    const displayName=swapName||getDisplayName(ex);
    const name=normalizeUppercaseText(displayName);
    const origName=normalizeUppercaseText(getDisplayName(ex));

    const u=exUnit(ex.id);
    let wtxt='',badge='',bcls='',kg=0;
    if(ex.hasWeight){
      const m=S.maxes[ex.id];
      if(!m){wtxt=`— ${u} gir`;badge='GİRİLMEDİ';bcls='bsame';}
      else{
        kg=getKgAt(ex.id,w);
        const prevKg=w>0?getKgAt(ex.id,w-1):kg;
        wtxt=`${kg} ${u}`;
        if(w===0){badge='BAŞLANGIÇ';bcls='bnew';}
        else if(kg>prevKg){badge=`+${wRound(kg-prevKg,u)}${u}`;bcls='bup';}
        else{badge='AYNI';bcls='bsame';}
      }
    } else {
      wtxt='Vücut ağırlığı'; badge='MAX'; bcls='bmax';
    }

    let warmupHtml='';
    let altLoadingText='';
    if(ex.hasWeight && kg>0){
      const bar=barWeight(u);
      const brOff=u==='lbs'?25:10;
      if(ex.id==='g1_rdl'){ altLoadingText=` (${(kg-bar)/2} ${u})`; }
      else if(ex.id==='g2_lp'||ex.id==='g3_lp'||ex.id==='g3_sp'){ altLoadingText=` (${kg/2} ${u})`; }
      else if(ex.id==='g3_br'){ altLoadingText=` (${(kg-brOff)/2} ${u})`; }
    }

    if(altLoadingText && ex.hasWeight){
      wtxt=`${kg} ${u}<span style="font-size:13px;color:var(--muted);font-weight:400">${altLoadingText}</span>`;
    }

    if(ex.hasWeight && kg>0){
      const isDay2PullUps=(d%3===1 && exIdx===2);
      if(!isDay2PullUps){
        let sets=[];
        if(exIdx===0){ sets=[{mult:0.60,label:'Isınma 1'},{mult:0.70,label:'Isınma 2'},{mult:0.85,label:'Isınma 3'}]; } 
        else if(exIdx===1||exIdx===2){ sets=[{mult:0.60,label:'Isınma 1'},{mult:0.85,label:'Isınma 2'}]; }
        if(sets.length){
          warmupHtml=`<div style="margin-top:10px;padding:10px 12px;background:var(--bg3);border-radius:10px;border:1px solid var(--border)">
            <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:8px">Isınma Setleri</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${sets.map(s=>{
                const wkg=wRound(kg*s.mult, u);
                const bar=barWeight(u);
                const brOff=u==='lbs'?25:10;
                let altLoading='';
                if(ex.id==='g1_rdl') altLoading=` (${wRound((wkg-bar)/2, u)} ${u})`;
                else if(ex.id==='g2_lp'||ex.id==='g3_lp'||ex.id==='g3_sp') altLoading=` (${wRound(wkg/2, u)} ${u})`;
                else if(ex.id==='g3_br') altLoading=` (${wRound((wkg-brOff)/2, u)} ${u})`;
                return `<div style="flex:1;min-width:70px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:7px 8px;text-align:center">
                  <div style="font-size:16px;font-weight:600;color:var(--warn)">${wkg} ${u}</div>
                  <div style="font-size:12px;color:var(--muted);font-weight:400"">${altLoading}</div>
                </div>`;
              }).join('')}
            </div>
          </div>`;
        }
      }
    }

    let bottomSection='';
    if(done){
      const savedSets = typeof doneMap[ex.id]==='object' ? doneMap[ex.id] : {};
      let setDisplays = [];
      let totalReps = 0;
      for(let i=1; i<=ex.sets; i++){
         const val = savedSets['s'+i];
         setDisplays.push(val !== undefined ? val : '-');
         totalReps += (parseInt(val) || 0);
      }
      
      const statusHtml = (ex.repType !== 'max' && savedSets.targetMet === false)
          ? `<div style="font-size:13px;color:var(--warn);font-weight:600">✓ Kaydedildi (Ağırlık sabit)</div>`
          : `<div style="font-size:13px;color:var(--success);font-weight:600">✓ Hedef Tamamlandı</div>`;

      const unit = ex.repType==='max'
        ? (ex.id==='g3_pl' ? 'sn' : 'top')
        : 'tekrar';
      bottomSection=`
        <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center">
          <div>
            ${statusHtml}
            <div style="font-size:12px;color:var(--muted);margin-top:2px">${setDisplays.join(' + ')} = <b style="color:var(--text)">${totalReps} ${unit}</b></div>
          </div>
          <button class="btn-undo" onclick="undoDone('${ex.id}',${w},${d})">↩ Geri al</button>
        </div>`;
    } else {
      let inputsHtml = `<div class="set-inputs" id="sets-${ex.id}">`;
      const prevWeekSets = w > 0 ? (S.weekData?.['w'+(w-1)]?.['d'+d]?.[ex.id] || null) : null;
      for(let i=1; i<=ex.sets; i++){
         const draftVal = (S.setDrafts?.[`w${w}_d${d}_${ex.id}`]?.[`s${i}`]) ?? '';
         const prevVal = prevWeekSets?.['s'+i];
         const ph = prevVal !== undefined && prevVal !== '' ? prevVal : (ex.reps>0 ? ex.reps : '—');
         inputsHtml += `
          <div class="set-inp-wrap">
            <div class="set-inp-lbl">Set ${i}</div>
            <input class="set-inp" type="number" id="s${i}-${ex.id}" placeholder="${ph}" min="0" max="999" step="1" value="${draftVal}" oninput="updSetTotalDynamic('${ex.id}', ${ex.sets});saveDraft('${ex.id}',${w},${d},${i},this.value)" onblur="autoSaveSets('${ex.id}',${w},${d},${ex.sets})"/>
          </div>`;
      }
      inputsHtml += `</div><div class="set-total" id="total-${ex.id}">Toplam: —</div>`;
      if(ex.id==='g3_pl') inputsHtml+=`<div style="font-size:11px;color:var(--muted);margin-top:2px">saniye olarak gir</div>`;
      bottomSection = inputsHtml;
    }

    html+=`
      <div class="xc${done?' done':''}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;gap:8px">
          <div class="xname">${name}</div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
            <span class="badge ${bcls}">${badge}</span>
            ${isSwapped?`<span class="badge bswap">DEGISTIRILDI</span>`:''}
          </div>
        </div>
        ${isSwapped?`<div class="xorig">↳ Yerine: ${origName}</div>`:''}
        <div class="xw">${wtxt}</div>
        <div class="xsch">
          ${ex.scheme}${
            ex.repType === 'range'
              ? (['g1_lpd','g3_cf'].includes(ex.id) ? ' (RPE 8)' : ' (RPE 9)')
              : ''
          }
        </div>
        <div class="xact">
          <button type="button" class="xact-btn" onclick="showGif('${ex.id}')">
            📹 Nasıl Yapılır?
          </button>
          <button type="button" class="xact-btn" onclick="toggleExpl('${ex.id}',this)">
            <span id="expl-arrow-${ex.id}">▸</span> Açıklama
          </button>
          <button type="button" class="xact-btn${isSwapped?' swapped':''}" onclick="openSwapModal('${ex.id}',${w},${d})">
            🔄 ${isSwapped?'Değiştirildi':'Değiştir'}
          </button>
        </div>
        <div id="expl-content-${ex.id}" style="display:none;margin-top:8px;margin-bottom:8px">
          <textarea id="expl-text-${ex.id}" placeholder="${exNotePlaceholder(ex.id,w,d)}" style="width:100%;min-height:60px;background:var(--bg3);border:1px solid var(--border);color:var(--text);font-family:var(--fb);font-size:13px;padding:10px;border-radius:8px;outline:none;resize:none;-webkit-appearance:none" oninput="saveExplanation('${ex.id}',${w},${d},this.value)">${getExplanation(ex.id,w,d)}</textarea>
        </div>
        ${warmupHtml}
        ${bottomSection}
      </div>`;
  });

  document.getElementById('ex-list').innerHTML=html||'<div style="color:var(--muted);font-size:14px;text-align:center;padding:2rem">Önce kurulum sayfasından ağırlıklarını gir.</div>';
}

function changeWeek(delta){
  S.currentWeek=Math.max(0,Math.min(12,S.currentWeek+delta));
  saveS(); renderProgram();
}

function changeDay(d,el){
  S.currentDay=d; saveS();
  document.querySelectorAll('.dtab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active'); renderProgram();
}
