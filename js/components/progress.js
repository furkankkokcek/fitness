function buildExChart(weeks){
  const W=320, H=72, PAD=8;
  const doneWks=weeks.filter(w=>w.done);
  if(doneWks.length<2) return '';
  const kgs=doneWks.map(w=>w.kg);
  const minKg=Math.min(...kgs), maxKg=Math.max(...kgs);
  const range=maxKg-minKg||1;
  const xStep=(W-PAD*2)/(weeks.length-1);
  const pts=weeks.map((wk,i)=>{
    const x=PAD+i*xStep;
    const y=wk.done ? H-PAD-((wk.kg-minKg)/range)*(H-PAD*2) : null;
    return {x,y,wk};
  });
  // polyline only through done points
  const donePts=pts.filter(p=>p.y!==null);
  const polyline=donePts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const dots=donePts.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="${p.wk.cur?'#e8ff47':'#4ade80'}"/>`).join('');
  const labels=`<text x="${donePts[0].x.toFixed(1)}" y="${H}" fill="#666" font-size="9" text-anchor="middle">${minKg}kg</text>
    <text x="${donePts[donePts.length-1].x.toFixed(1)}" y="${(donePts[donePts.length-1].y-6).toFixed(1)}" fill="#e8ff47" font-size="9" text-anchor="middle">${donePts[donePts.length-1].wk.kg}kg</text>`;
  return `<svg width="100%" viewBox="0 0 ${W} ${H}" style="margin-top:10px;overflow:visible">
    <polyline points="${polyline}" fill="none" stroke="#4ade80" stroke-width="2" stroke-linejoin="round"/>
    ${dots}${labels}
  </svg>`;
}

function renderProgress(){
  const el=document.getElementById('progress-content');
  if(!S.setupDone||!Object.keys(S.maxes).length){
    el.innerHTML='<div style="color:var(--muted);font-size:14px;text-align:center;padding:2rem">Önce kurulum yap.</div>';
    return;
  }
  let html='';

  html+=`<div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:10px">Ağırlık Takibi</div>`;
  const seen=new Set();
  DAYS.flat().forEach(id=>{
    const ex=EX[id];
    if(!ex.hasWeight||seen.has(id)||!S.maxes[id]) return;
    seen.add(id);
    const name=normalizeUppercaseText(getDisplayName(ex));
    const inc=S.maxes[id].inc;
    const weeks=Array.from({length:12},(_,i)=>({
      w:i, kg:getKgAt(id,i),
      done:exCompletedInWeek(id,i),
      cur:i===S.currentWeek
    }));
    html+=`<div class="pec">
      <div class="pen">${name} <span style="font-size:11px;color:var(--muted);font-weight:400">+${inc}kg/hafta</span></div>
      <div class="wscroll">
        ${weeks.map(wk=>`
          <div class="wkcell">
            <div style="font-size:9px;color:${wk.cur?'var(--accent)':'var(--muted)'};margin-bottom:4px;font-weight:${wk.cur?700:400}">${wk.w+1}</div>
            <div class="wkbox" style="background:${wk.done?'rgba(74,222,128,.12)':wk.cur?'rgba(232,255,71,.08)':'var(--bg3)'};border-color:${wk.done?'rgba(74,222,128,.3)':wk.cur?'rgba(232,255,71,.3)':'var(--border)'}">
              <div class="wkkg" style="color:${wk.done?'var(--success)':wk.cur?'var(--accent)':'var(--text)'}">${wk.kg}</div>
              <div style="font-size:9px;color:var(--muted)">kg</div>
            </div>
          </div>`).join('')}
      </div>
      ${buildExChart(weeks)}
    </div>`;
  });

  const maxExIds = [...new Set(DAYS.flat().filter(id=>EX[id].repType==='max'))];
  if(maxExIds.length){
    html+=`<div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin:18px 0 10px">Max Tekrar Takibi</div>`;
    maxExIds.forEach(id=>{
      const ex=EX[id];
      const name=normalizeUppercaseText(getDisplayName(ex));
      const dayIdx=DAYS.findIndex(d=>d.includes(id));
      const dk='d'+dayIdx;
      const weeks=Array.from({length:12},(_,i)=>{
        const wk='w'+i;
        const val=S.weekData[wk]?.[dk]?.[id];
        let total=0, sets=[];
        if(val&&typeof val==='object'){
          for(let k=1; k<=ex.sets; k++){
              let sVal = val['s'+k]||0;
              sets.push(sVal);
              total += sVal;
          }
        }
        return {w:i, total, sets, done:!!val, cur:i===S.currentWeek};
      });
      const isPlank = ex.id==='g3_pl';
      const unit = isPlank ? 'saniye' : 'tekrar';
      html+=`<div class="pec">
        <div class="pen">${name} <span style="font-size:11px;color:var(--muted);font-weight:400">toplam ${unit}</span></div>
        <div class="wscroll">
          ${weeks.map(wk=>`
            <div class="wkcell">
              <div style="font-size:9px;color:${wk.cur?'var(--accent)':'var(--muted)'};margin-bottom:4px;font-weight:${wk.cur?700:400}">${wk.w+1}</div>
              <div class="wkbox" style="background:${wk.done?'rgba(74,222,128,.12)':wk.cur?'rgba(232,255,71,.08)':'var(--bg3)'};border-color:${wk.done?'rgba(74,222,128,.3)':wk.cur?'rgba(232,255,71,.3)':'var(--border)'}">
                <div class="wkkg" style="color:${wk.done?'var(--success)':wk.cur?'var(--accent)':'var(--text)'}">${wk.done?wk.total:'—'}</div>
              </div>
            </div>`).join('')}
        </div>
        ${(weeks[S.currentWeek] && weeks[S.currentWeek].done) ? `<div style="font-size:12px;color:var(--muted);margin-top:8px">Bu hafta: ${weeks[S.currentWeek].sets.join(' + ')} = <b style="color:var(--text)">${weeks[S.currentWeek].total} ${unit}</b></div>` : ''}
      </div>`;
    });
  }

  if(S.profile?.kg>0){
    if(!S.weeklyWeights||Object.keys(S.weeklyWeights).length===0){
      for(let i=0;i<13;i++) S.weeklyWeights[i]=S.profile.kg;
    }
    const startKg=S.weeklyWeights[0]||S.profile.kg;
    const curKg=S.weeklyWeights[S.currentWeek]||S.profile.kg;
    const totalDiff=Math.round((curKg-startKg)*10)/10;
    const diffSign=totalDiff>0?'+':'';
    const diffColor=totalDiff>0?'var(--danger)':totalDiff<0?'var(--success)':'var(--muted)';

    html+=`<div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin:18px 0 10px">Kilo Takibi</div>`;
    html+=`<div class="pec" style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div class="pen" style="margin:0">Haftalık Kilo</div>
        <div style="font-size:13px;font-weight:600;color:${diffColor}">${diffSign}${totalDiff} kg başlangıçtan</div>
      </div>
      <div class="wscroll">
        ${Array.from({length:13},(_,i)=>{
          const kg=(S.weeklyWeights[i]||S.profile.kg).toFixed(2);
          const isCur=i===S.currentWeek;
          const hasDiff=i>0;
          const prevKg=S.weeklyWeights[i-1]||S.profile.kg;
          const diff=hasDiff?Math.round((parseFloat(kg)-prevKg)*10)/10:0;
          const dColor=diff>0?'var(--danger)':diff<0?'var(--success)':'var(--muted)';
          const dSign=diff>0?'+':'';
          return `<div class="wkcell" style="width:54px">
            <div style="font-size:9px;color:${isCur?'var(--accent)':'var(--muted)'};margin-bottom:4px;font-weight:${isCur?700:400}">H${i+1}</div>
            <div class="wkbox" style="background:${isCur?'rgba(232,255,71,.08)':'var(--bg3)'};border-color:${isCur?'var(--accent)':'var(--border)'}">
              <div class="wkkg" style="color:${isCur?'var(--accent)':'var(--text)'};font-size:12px">${kg}</div>
              <div style="font-size:8px;color:${hasDiff?dColor:'var(--muted)'};">${hasDiff?(dSign+diff):''}</div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  el.innerHTML=html;
}

