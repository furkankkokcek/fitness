function showPage(name,btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  if(btn) btn.classList.add('active');
  if(name==='program') renderProgram();
  if(name==='progress') renderProgress();
  if(name==='profile') renderProfile();
  if(name==='setup') buildSetup();
}

function hideOb(){ document.getElementById('ob').style.display='none'; }

function toggleTheme(){
  S.theme = S.theme==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme', S.theme);
  const tog = document.getElementById('cfg-theme-toggle');
  if(tog) tog.checked = S.theme==='light';
  saveS();
}

function openSettingsModal(){
  const tog = document.getElementById('cfg-theme-toggle');
  if(tog) tog.checked = S.theme === 'light';
  const notifTog = document.getElementById('cfg-notif-toggle');
  if(notifTog) notifTog.checked = !!(S.notifEnabled && Notification.permission === 'granted');
  const notifInfo = document.getElementById('notif-info');
  if(notifInfo) notifInfo.style.display = notifTog?.checked ? 'block' : 'none';
  document.getElementById('settings-overlay').classList.add('open');
}

function closeSettingsModal(){
  document.getElementById('settings-overlay').classList.remove('open');
}

function toggleThemeFromToggle(el){
  S.theme = el.checked ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', S.theme);
  saveS();
}

async function toggleNotifSetting(el){
  const info = document.getElementById('notif-info');
  if(el.checked){
    const perm = await Notification.requestPermission();
    if(perm !== 'granted'){
      el.checked = false;
      if(info) info.style.display='none';
      return;
    }
    S.notifEnabled = true;
    if(info) info.style.display='block';
  } else {
    S.notifEnabled = false;
    if(info) info.style.display='none';
  }
  saveS();
}

function applyTheme(){
  document.documentElement.setAttribute('data-theme', S.theme||'dark');
  const tog=document.getElementById('cfg-theme-toggle');
  if(tog) tog.checked = (S.theme||'dark')==='light';
}

function onGenderChange(){
  const g=document.getElementById('prof-gender')?.value;
  const hipRow=document.getElementById('hip-row');
  if(hipRow) hipRow.style.display=(g==='female')?'block':'none';
  calcCalories();
}

function onOnbGenderChange(){
  const g=document.getElementById('onb-gender')?.value;
  const hipRow=document.getElementById('onb-hip-row');
  if(hipRow) hipRow.style.display=(g==='female')?'block':'none';
}

function calcNavyFat(gender, heightCm, waistCm, neckCm, hipCm){
  if(!heightCm||!waistCm||!neckCm) return null;
  let fat=null;
  if(gender==='male'){
    const val = waistCm - neckCm;
    if(val<=0) return null;
    fat = 495 / (1.0324 - 0.19077*Math.log10(val) + 0.15456*Math.log10(heightCm)) - 450;
  } else if(gender==='female'){
    if(!hipCm) return null;
    const val = waistCm + hipCm - neckCm;
    if(val<=0) return null;
    fat = 495 / (1.29579 - 0.35004*Math.log10(val) + 0.22100*Math.log10(heightCm)) - 450;
  }
  if(fat===null||isNaN(fat)||fat<2||fat>70) return null;
  return Math.round(fat*10)/10;
}

function calcCalories(){
  const kg=parseFloat(document.getElementById('prof-kg')?.value)||0;
  const cm=parseFloat(document.getElementById('prof-cm')?.value)||0;
  const age=parseInt(document.getElementById('prof-age')?.value)||0;
  const gender=document.getElementById('prof-gender')?.value||'';
  const waist=parseFloat(document.getElementById('prof-waist')?.value)||0;
  const neck=parseFloat(document.getElementById('prof-neck')?.value)||0;
  const hip=parseFloat(document.getElementById('prof-hip')?.value)||0;

  if(kg>0&&cm>0&&age>0&&gender){
    let bmr=0;
    if(gender==='male') bmr=10*kg + 6.25*cm - 5*age + 5;
    else bmr=10*kg + 6.25*cm - 5*age - 161;
    const maint=Math.round(bmr*1.55);
    const cut=Math.round(bmr*1.55*0.85);
    document.getElementById('cal-min').textContent=Math.round(bmr);
    document.getElementById('cal-maint').textContent=maint;
    document.getElementById('cal-cut').textContent=cut;
    document.getElementById('calorie-display').style.display='block';
  } else {
    document.getElementById('calorie-display').style.display='none';
  }

  const fatEl=document.getElementById('fat-display');
  if(!fatEl) return;
  const fat=calcNavyFat(gender, cm, waist, neck, hip);
  if(fat!==null&&kg>0){
    const fatKg=(kg*fat/100).toFixed(1);
    const leanKg=(kg*(1-fat/100)).toFixed(1);
    document.getElementById('fat-pct').textContent=fat+'%';
    document.getElementById('fat-kg').textContent=fatKg;
    document.getElementById('lean-kg').textContent=leanKg;
    fatEl.style.display='block';
  } else {
    fatEl.style.display='none';
  }
}

function saveProfile(){
  const kg=parseFloat(document.getElementById('prof-kg')?.value)||0;
  const cm=parseFloat(document.getElementById('prof-cm')?.value)||0;
  const age=parseInt(document.getElementById('prof-age')?.value)||0;
  const gender=document.getElementById('prof-gender')?.value||'';
  const waist=parseFloat(document.getElementById('prof-waist')?.value)||0;
  const neck=parseFloat(document.getElementById('prof-neck')?.value)||0;
  const hip=parseFloat(document.getElementById('prof-hip')?.value)||0;
  S.profile={...S.profile,kg,cm,age,gender,waist,neck,hip};
  if(kg>0 && Object.keys(S.weeklyWeights).length===0){
    for(let i=0;i<13;i++) S.weeklyWeights[i]=kg;
  }
  saveS();
  renderProfile();
  alert('✓ Profil kaydedildi!');
}

function renderProfile(){
  const p=S.profile||{};
  if(p.kg) document.getElementById('prof-kg').value=p.kg;
  if(p.cm) document.getElementById('prof-cm').value=p.cm;
  if(p.age) document.getElementById('prof-age').value=p.age;
  if(p.gender) document.getElementById('prof-gender').value=p.gender;
  if(p.waist) document.getElementById('prof-waist').value=p.waist;
  if(p.neck) document.getElementById('prof-neck').value=p.neck;
  if(p.hip) document.getElementById('prof-hip').value=p.hip;
  const hipRow=document.getElementById('hip-row');
  if(hipRow) hipRow.style.display=(p.gender==='female')?'block':'none';
  if(p.photo){
    document.getElementById('photo-preview').style.backgroundImage=`url(${p.photo})`;
    document.getElementById('photo-preview').innerHTML='';
    document.getElementById('remove-photo-btn').style.display='block';
  } else {
    document.getElementById('photo-preview').style.backgroundImage='none';
    document.getElementById('photo-preview').innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.5" style="width:40px;height:40px;"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>';
    document.getElementById('remove-photo-btn').style.display='none';
  }
  calcCalories();
}

function uploadPhoto(event){
  const file=event.target.files?.[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    const photoData=e.target.result;
    S.profile.photo=photoData;
    saveS();
    renderProfile();
  };
  reader.readAsDataURL(file);
  event.target.value='';
}

function removePhoto(){
  if(!confirm('Fotoğrafı silmek istediğine emin misin?')) return;
  if(S.profile) S.profile.photo=null;
  saveS();
  renderProfile();
  alert('✓ Fotoğraf silindi!');
}

function exportData(){
  const data={version:11,state:S,timestamp:Date.now()};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  const now=new Date();
  const dateStr=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const timeStr=`${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;
  a.download=`fittrack-backup-${dateStr}_${timeStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function showImportPicker(){
  const el=document.getElementById('import-file')||document.getElementById('import-file-setup');
  if(el) el.click();
}

function importData(e){
  const file=e.target.files?.[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{
    try{
      const data=JSON.parse(ev.target.result);
      if(!data.state||!data.state.maxes){
        alert('Geçersiz yedek dosyası!');
        return;
      }
      S=data.state;
      // Eski yedeklerden eksik olabilecek alanları garantiye al
      if(!S.exerciseSwaps) S.exerciseSwaps={};
      if(!S.explanations) S.explanations={};
      if(!S.setDrafts) S.setDrafts={};
      if(!S.prs) S.prs={};
      if(!S.streak) S.streak={count:0,lastDate:''};
      if(!S.workoutSessions) S.workoutSessions={};
      if(!S.weeklyWeights) S.weeklyWeights={};
      if(!S.nutrition) S.nutrition={customFoods:{},dailyLog:{},goal:2000};
      if(!S.nutrition.customFoods) S.nutrition.customFoods={};
      if(!S.nutrition.dailyLog) S.nutrition.dailyLog={};
      if(!S.nutrition.goal) S.nutrition.goal=2000;
      if(!S.profile) S.profile={kg:0,cm:0,age:0,gender:''};
      if(!S.theme) S.theme='dark';
      if(S.notifEnabled===undefined) S.notifEnabled=false;
      applyTheme();
      saveS();
      buildSetup();
      if(S.setupDone){
        renderProgram();
        renderProgress();
        document.getElementById('first-choice').style.display='none';
        hideOb();
        showPage('program',document.querySelectorAll('.nb')[1]);
      } else {
        document.getElementById('first-choice').style.display='none';
        hideOb();
        showPage('setup',document.querySelectorAll('.nb')[0]);
      }
      alert('✓ Yedek başarıyla yüklendi!');
    }catch(err){
      alert('Dosya okunamadı: '+err.message);
    }
  };
  reader.readAsText(file);
  e.target.value='';
}

function startFresh(){
  document.getElementById('first-choice').style.display='none';
  document.getElementById('profile-setup-modal').classList.add('open');
}

function saveProfileSetup(){
  const kg=parseFloat(document.getElementById('onb-kg')?.value)||0;
  const cm=parseFloat(document.getElementById('onb-cm')?.value)||0;
  const age=parseInt(document.getElementById('onb-age')?.value)||0;
  const gender=document.getElementById('onb-gender')?.value||'';
  const waist=parseFloat(document.getElementById('onb-waist')?.value)||0;
  const neck=parseFloat(document.getElementById('onb-neck')?.value)||0;
  const hip=parseFloat(document.getElementById('onb-hip')?.value)||0;

  if(kg>0||cm>0||age>0||gender){
    S.profile={kg,cm,age,gender,waist,neck,hip};
    if(kg>0){
      for(let i=0;i<13;i++) S.weeklyWeights[i]=kg;
    }
    saveS();
  }
  document.getElementById('profile-setup-modal').classList.remove('open');
  document.getElementById('ob').style.display='none';
  document.getElementById('first-choice').style.display='none';
  showPage('setup', document.querySelectorAll('.nb')[0]);
  alert('✓ Bilgileriniz kaydedildi! Hareketlerin ayarlarına başla.');
}

function skipProfileSetup(){
  document.getElementById('profile-setup-modal').classList.remove('open');
  document.getElementById('ob').style.display='none';
  document.getElementById('first-choice').style.display='none';
  showPage('setup', document.querySelectorAll('.nb')[0]);
}

function resetAllData(){
  if(!confirm('⚠️ Tüm antrenman verilerini, ağırlıkları ve açıklamaları silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!')) return;
  const profile = S.profile;
  const theme = S.theme;
  S = {
    maxes:{}, weekData:{}, currentWeek:0, currentDay:0, setupDone:false,
    profile:profile,
    weeklyWeights:{},
    explanations:{},
    exerciseSwaps:{},
    theme:theme
  };
  saveS();
  buildSetup();
  renderProgram();
  renderProgress();
  showPage('setup', document.querySelectorAll('.nb')[0]);
  alert('✓ Tüm veriler sıfırlandı! Kurulumdan başlayabilirsiniz.');
}

