let S = {
  maxes:{}, weekData:{}, currentWeek:0, currentDay:0, setupDone:false,
  profile:{kg:0,cm:0,age:0,gender:''},
  weeklyWeights:{},
  explanations:{},
  setDrafts:{},
  streak:{count:0, lastDate:''},
  prs:{},
  workoutSessions:{},
  exerciseSwaps:{},
  nutrition:{ customFoods:{}, dailyLog:{}, goal:2000 },
  theme:'dark',
  notifEnabled: false
};

let changeCount=0;
function saveS(){
  localStorage.setItem('ft_v10', JSON.stringify(S));
  changeCount++;
  if(changeCount>=50){
    changeCount=0;
    setTimeout(()=>{ if(confirm('💾 50 değişiklik yapıldı. Yedek almak ister misin?')) exportData(); },200);
  }
}
function loadS(){ try{ const d=localStorage.getItem('ft_v10')||localStorage.getItem('ft_v9')||localStorage.getItem('ft_v8'); if(d){S=JSON.parse(d); if(!S.exerciseSwaps) S.exerciseSwaps={}; return true;}}catch(e){} return false; }

function saveDraft(exId, w, d, setIdx, val){
  if(!S.setDrafts) S.setDrafts={};
  const key=`w${w}_d${d}_${exId}`;
  if(!S.setDrafts[key]) S.setDrafts[key]={};
  if(val===''||val===null) delete S.setDrafts[key][`s${setIdx}`];
  else {
    S.setDrafts[key][`s${setIdx}`]=val;
    startWorkoutIfNeeded(w, d);
  }
  saveS();
}

