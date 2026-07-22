const hasData=loadS();
applyProgramFromState();
buildSetup();
updTimer();
applyTheme();

if(!hasData){
  document.getElementById('first-choice').style.display='flex';
} else if(S.setupDone){
  hideOb();
  document.getElementById('first-choice').style.display='none';
  renderProgram();
  renderProgress();
  showPage('program', document.querySelectorAll('.nb')[1]);
} else {
  document.getElementById('first-choice').style.display='none';
}

document.querySelectorAll('.dtab').forEach((t,i)=>t.classList.toggle('active',i===S.currentDay));

// ═══════════════════════════════════════════════
// KALORİ TAKİBİ
// ═══════════════════════════════════════════════
