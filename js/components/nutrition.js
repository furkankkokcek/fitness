function kalDateKey(){ return todayStr(); }
function getKalDay(dateKey){
  if(!S.nutrition) S.nutrition={customFoods:{},dailyLog:{},goal:2000};
  if(!S.nutrition.dailyLog[dateKey]) S.nutrition.dailyLog[dateKey]={meals:{sabah:[],ogle:[],aksam:[],ara:[]},date:dateKey};
  return S.nutrition.dailyLog[dateKey];
}
function kalTotals(dateKey){
  const day=getKalDay(dateKey);
  let kcal=0,protein=0,carb=0,fat=0;
  Object.values(day.meals).forEach(items=>items.forEach(f=>{
    kcal+=f.kcal||0; protein+=f.protein||0; carb+=f.carb||0; fat+=f.fat||0;
  }));
  return {kcal:Math.round(kcal),protein:Math.round(protein),carb:Math.round(carb),fat:Math.round(fat)};
}

const MEAL_NAMES={sabah:'☀️ Sabah',ogle:'🌤 Öğle',aksam:'🌙 Akşam',ara:'🍎 Ara Öğün'};
const MEAL_ADD_LABELS={sabah:'SABAH ÖĞÜNÜ EKLE',ogle:'ÖĞLE ÖĞÜNÜ EKLE',aksam:'AKŞAM ÖĞÜNÜ EKLE',ara:'ARA ÖĞÜN EKLE'};

function renderKalori(){
  if(!S.nutrition) S.nutrition={customFoods:{},dailyLog:{},goal:2000};
  const dk=kalDateKey();
  const day=getKalDay(dk);
  const tot=kalTotals(dk);
  const goal=S.nutrition.goal||2000;
  const pct=Math.min(100,Math.round((tot.kcal/goal)*100));
  const fillColor=pct>100?'var(--danger)':pct>80?'var(--warn)':'var(--accent)';

  let html=`
  <div style="background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:12px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div>
        <div style="font-family:var(--fa);font-size:32px;color:${fillColor};letter-spacing:1px;line-height:1">${tot.kcal}</div>
        <div style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:5px">/ ${goal} kcal hedef <button onclick="openKalGoalEditor()" style="background:none;border:none;color:var(--muted);cursor:pointer;padding:0;font-size:12px;line-height:1;opacity:.7">✏️</button></div>
      </div>
      <div style="text-align:right">
        <div style="font-size:11px;color:var(--muted)">kalan</div>
        <div style="font-family:var(--fa);font-size:26px;color:var(--text)">${Math.max(0,goal-tot.kcal)}</div>
      </div>
    </div>
    <div class="kal-goal-bar"><div class="kal-goal-fill" style="width:${pct}%;background:${fillColor}"></div></div>
    <div class="kal-macro-bar" style="margin-top:12px;margin-bottom:0">
      <div class="kal-macro"><div class="kal-macro-val" style="color:#60a5fa">${tot.protein}g</div><div class="kal-macro-lbl">Protein</div></div>
      <div class="kal-macro"><div class="kal-macro-val" style="color:#fb923c">${tot.carb}g</div><div class="kal-macro-lbl">Karbonhidrat</div></div>
      <div class="kal-macro"><div class="kal-macro-val" style="color:#a78bfa">${tot.fat}g</div><div class="kal-macro-lbl">Yağ</div></div>
    </div>
  </div>
  <div style="text-align:center;margin-bottom:12px">
    <button onclick="openAiMealModal()" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:12px;padding:10px 28px;font-size:14px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:7px;letter-spacing:.3px">✨ AI Öğün Analizi</button>
  </div>`;

  // Öğün bölümleri
  Object.entries(MEAL_NAMES).forEach(([key,label])=>{
    const items=day.meals[key]||[];
    const mKcal=Math.round(items.reduce((s,f)=>s+(f.kcal||0),0));
    html+=`<div class="meal-section">
      <div class="meal-header" onclick="toggleMeal('${key}')">
        <div>
          <div class="meal-title">${label}</div>
          ${mKcal>0?`<div class="meal-kcal">${mKcal} kcal</div>`:'<div class="meal-kcal">Boş</div>'}
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <button class="meal-add-btn" onclick="event.stopPropagation();openAddFood('${key}','${dk}')">+</button>
          <span id="meal-arrow-${key}" style="color:var(--muted);font-size:18px;transition:transform .2s">›</span>
        </div>
      </div>
      <div class="meal-body" id="meal-body-${key}">
        ${items.length===0?`<div style="font-size:12px;color:var(--muted);padding:4px 0">Henüz besin eklenmedi</div>`:
          items.map((f,i)=>`
          <div class="food-item">
            <div style="flex:1">
              <div class="food-item-name">${f.name}</div>
              <div class="food-item-detail">${f.amount}${f.unit} · P:${f.protein||0}g · K:${f.carb||0}g · Y:${f.fat||0}g</div>
            </div>
            <div class="food-item-kcal">${Math.round(f.kcal)} kcal</div>
            <button class="food-del" onclick="deleteFoodItem('${key}','${dk}',${i})">✕</button>
          </div>`).join('')}
      </div>
    </div>`;
  });

  // Geçmiş günler
  const logKeys=Object.keys(S.nutrition.dailyLog).sort().reverse().filter(k=>k!==dk).slice(0,14);
  if(logKeys.length>0){
    html+=`<div style="margin-top:16px;font-family:var(--fa);font-size:18px;letter-spacing:.5px;margin-bottom:8px">GEÇMİŞ GÜNLER</div>`;
    logKeys.forEach(k=>{
      const t=kalTotals(k);
      const [y,m,d]=k.split('-');
      html+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;margin-bottom:6px;cursor:pointer" onclick="openPastDayDetail('${k}')">
        <span style="font-size:13px;font-weight:600;color:var(--text)">${d}/${m}/${y}</span>
        <span style="font-size:11px;color:var(--muted)">P:${t.protein}g K:${t.carb}g Y:${t.fat}g</span>
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-family:var(--fa);font-size:16px;color:var(--accent)">${t.kcal} kcal</span>
          <span style="color:var(--muted);font-size:18px">›</span>
        </div>
      </div>`;
    });
  }

  document.getElementById('kalori-content').innerHTML=html;
}

function toggleMeal(key){
  const body=document.getElementById('meal-body-'+key);
  const arrow=document.getElementById('meal-arrow-'+key);
  const open=body.classList.toggle('open');
  if(arrow) arrow.style.transform=open?'rotate(90deg)':'';
}

function deleteFoodItem(mealKey,dateKey,idx){
  const day=getKalDay(dateKey);
  day.meals[mealKey].splice(idx,1);
  saveS(); renderKalori();
}

function openKalGoalEditor(){
  const g=prompt('Günlük kalori hedefiniz (kcal):',S.nutrition.goal||2000);
  if(g && !isNaN(parseInt(g))){ S.nutrition.goal=parseInt(g); saveS(); renderKalori(); }
}

function openPastDayDetail(k){
  const existing=document.getElementById('past-day-modal');
  if(existing) existing.remove();
  const [y,m,d]=k.split('-');
  const t=kalTotals(k);
  const pastDay=S.nutrition.dailyLog[k];
  let mealsHtml=''; let hasAny=false;
  Object.entries(MEAL_NAMES).forEach(([mk,label])=>{
    const items=pastDay?.meals?.[mk]||[];
    if(!items.length) return;
    hasAny=true;
    const mKcal=Math.round(items.reduce((s,f)=>s+(f.kcal||0),0));
    mealsHtml+=`<div style="margin-bottom:14px">
      <div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">${label} · ${mKcal} kcal</div>`;
    items.forEach(f=>{
      mealsHtml+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
        <div><div style="font-size:13px;font-weight:500">${f.name}</div>
        <div style="font-size:11px;color:var(--muted)">${f.amount}${f.unit} · P:${f.protein||0}g · K:${f.carb||0}g · Y:${f.fat||0}g</div></div>
        <div style="font-size:13px;font-weight:600;color:var(--accent);flex-shrink:0;margin-left:8px">${Math.round(f.kcal)} kcal</div>
      </div>`;
    });
    mealsHtml+=`</div>`;
  });
  if(!hasAny) mealsHtml=`<div style="font-size:13px;color:var(--muted);text-align:center;padding:20px 0">Besin kaydı yok</div>`;
  const modal=document.createElement('div');
  modal.id='past-day-modal';
  modal.className='mo open';
  modal.innerHTML=`
    <div class="ms">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div class="mt2" style="margin:0">${d}/${m}/${y}</div>
        <button onclick="document.getElementById('past-day-modal').remove()" style="background:var(--bg3);border:1px solid var(--border);color:var(--muted);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center">✕</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;text-align:center;margin-bottom:16px;padding:12px;background:var(--bg3);border-radius:10px">
        <div><div style="font-size:20px;font-weight:700;color:var(--accent)">${t.kcal}</div><div style="font-size:10px;color:var(--muted)">kcal</div></div>
        <div><div style="font-size:20px;font-weight:700;color:#60a5fa">${t.protein}g</div><div style="font-size:10px;color:var(--muted)">Protein</div></div>
        <div><div style="font-size:20px;font-weight:700;color:#fb923c">${t.carb}g</div><div style="font-size:10px;color:var(--muted)">Karb</div></div>
        <div><div style="font-size:20px;font-weight:700;color:#a78bfa">${t.fat}g</div><div style="font-size:10px;color:var(--muted)">Yağ</div></div>
      </div>
      <div style="overflow-y:auto;max-height:55vh">${mealsHtml}</div>
    </div>`;
  modal.addEventListener('click',e=>{if(e.target===modal) modal.remove();});
  document.body.appendChild(modal);
}

// ── BESIN EKLEME MODALİ ────────────────────────
let _addFoodMeal='', _addFoodDate='', _activeFoodTab='search', _searchResults=[], _pendingFood=null;

function openAddFood(mealKey,dateKey){
  _addFoodMeal=mealKey; _addFoodDate=dateKey; _activeFoodTab='search'; _searchResultsHTML='';
  let modal=document.getElementById('add-food-modal');
  if(!modal){ modal=document.createElement('div'); modal.id='add-food-modal'; modal.className='mo add-food-modal'; document.body.appendChild(modal); }
  modal.innerHTML=`
    <div class="ms">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div style="font-family:var(--fa);font-size:20px">${MEAL_ADD_LABELS[mealKey]||mealKey}</div>
        <button onclick="document.getElementById('add-food-modal').style.display='none'" style="background:none;border:none;color:var(--muted);font-size:22px;cursor:pointer">✕</button>
      </div>
      <div class="food-tab" style="grid-template-columns:repeat(6,1fr)">
        <div class="food-tab-btn active" id="ftab-search" onclick="switchFoodTab('search')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 2px"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Ara
        </div>
        <div class="food-tab-btn" id="ftab-recent" onclick="switchFoodTab('recent')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 2px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Önceki
        </div>
        <div class="food-tab-btn" id="ftab-saved" onclick="switchFoodTab('saved')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 2px"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Kayıtlı
        </div>
        <div class="food-tab-btn" id="ftab-tarif" onclick="switchFoodTab('tarif')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 2px"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>Tarif
        </div>
        <div class="food-tab-btn" id="ftab-photo" onclick="switchFoodTab('photo')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 2px"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>Foto
        </div>
        <div class="food-tab-btn" id="ftab-ai" onclick="switchFoodTab('ai')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 2px"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>Yapıştır
        </div>
      </div>
      <div id="food-tab-content"></div>
    </div>`;
  modal.style.display='flex';
  renderFoodTab('search');
}

function switchFoodTab(tab){
  _activeFoodTab=tab;
  ['search','recent','saved','tarif','photo','ai'].forEach(t=>{
    document.getElementById('ftab-'+t)?.classList.toggle('active',t===tab);
  });
  renderFoodTab(tab);
}

function renderFoodTab(tab){
  const el=document.getElementById('food-tab-content');
  if(!el) return;
  if(tab==='search') renderSearchTab(el);
  else if(tab==='recent') renderRecentTab(el);
  else if(tab==='saved') renderSavedTab(el);
  else if(tab==='tarif') renderTarifTab(el);
  else if(tab==='ai') renderAiPasteTab(el);
  else renderPhotoTab(el);
}

// ── TARİF / PORSİYONLAMA SEKMESİ ──
function renderTarifTab(el){
  el.innerHTML=`
    <div style="font-size:12px;color:var(--muted);margin-bottom:10px">Tarif veya yemeğin toplam makrolarını gir, kaç porsiyon yediğini belirt.</div>
    <div>
      <div class="lbl">Yemek Adı</div>
      <input id="tarif-name" type="text" placeholder="örn: Mercimek Çorbası" style="margin-bottom:8px"/>
      <div class="lbl">Toplam Makrolar (tüm tarif)</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <div><div class="lbl">Kalori (kcal)</div><input id="tarif-kcal" type="number" placeholder="1200" oninput="updateTarifPreview()"/></div>
        <div><div class="lbl">Protein (g)</div><input id="tarif-protein" type="number" placeholder="60" oninput="updateTarifPreview()"/></div>
        <div><div class="lbl">Karbonhidrat (g)</div><input id="tarif-carb" type="number" placeholder="140" oninput="updateTarifPreview()"/></div>
        <div><div class="lbl">Yağ (g)</div><input id="tarif-fat" type="number" placeholder="30" oninput="updateTarifPreview()"/></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        <div><div class="lbl">Toplam Porsiyon</div><input id="tarif-total" type="number" value="4" min="1" oninput="updateTarifPreview()"/></div>
        <div><div class="lbl">Yediğim Porsiyon</div><input id="tarif-eaten" type="number" value="1" min="0.25" step="0.25" oninput="updateTarifPreview()"/></div>
      </div>
      <div id="tarif-preview" style="display:none;background:var(--bg3);border-radius:10px;padding:12px;margin-bottom:10px;text-align:center">
        <div style="font-size:11px;color:var(--muted);margin-bottom:4px">1 porsiyon</div>
        <div style="font-family:var(--fa);font-size:28px;color:var(--accent)" id="tarif-prev-kcal">—</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px" id="tarif-prev-macros"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <button class="btn bo" onclick="saveTarifFood(false)">💾 Kaydet</button>
        <button class="btn bp" onclick="saveTarifFood(true)">✅ Kaydet ve Ekle</button>
      </div>
    </div>`;
}

function updateTarifPreview(){
  const kcal=parseFloat(document.getElementById('tarif-kcal')?.value)||0;
  const protein=parseFloat(document.getElementById('tarif-protein')?.value)||0;
  const carb=parseFloat(document.getElementById('tarif-carb')?.value)||0;
  const fat=parseFloat(document.getElementById('tarif-fat')?.value)||0;
  const total=parseFloat(document.getElementById('tarif-total')?.value)||1;
  const eaten=parseFloat(document.getElementById('tarif-eaten')?.value)||1;
  if(!kcal) return;
  const ratio=eaten/total;
  const prev=document.getElementById('tarif-preview');
  if(prev) prev.style.display='block';
  const pk=document.getElementById('tarif-prev-kcal');
  const pm=document.getElementById('tarif-prev-macros');
  if(pk) pk.textContent=`${Math.round(kcal*ratio)} kcal`;
  if(pm) pm.textContent=`P:${Math.round(protein*ratio*10)/10}g · K:${Math.round(carb*ratio*10)/10}g · Y:${Math.round(fat*ratio*10)/10}g`;
}

function buildTarifFood(){
  const name=document.getElementById('tarif-name')?.value?.trim()||'Ev Yemeği';
  const kcal=parseFloat(document.getElementById('tarif-kcal')?.value)||0;
  const protein=parseFloat(document.getElementById('tarif-protein')?.value)||0;
  const carb=parseFloat(document.getElementById('tarif-carb')?.value)||0;
  const fat=parseFloat(document.getElementById('tarif-fat')?.value)||0;
  const total=parseFloat(document.getElementById('tarif-total')?.value)||1;
  const eaten=parseFloat(document.getElementById('tarif-eaten')?.value)||1;
  if(!kcal){ alert('Kalori zorunlu'); return null; }
  const ratio=eaten/total;
  const label=eaten===1?'1 porsiyon':`${eaten} porsiyon`;
  return {name:`${name} (${label})`,amount:eaten,unit:'porsiyon',
    kcal:Math.round(kcal*ratio),
    protein:Math.round(protein*ratio*10)/10,
    carb:Math.round(carb*ratio*10)/10,
    fat:Math.round(fat*ratio*10)/10,
    addedAt:Date.now()};
}

function addTarifFood(){
  const f=buildTarifFood(); if(!f) return;
  addFoodToMeal(_addFoodMeal,_addFoodDate,f);
}

function saveTarifFood(andAdd=false){
  const f=buildTarifFood(); if(!f) return;
  const name=document.getElementById('tarif-name')?.value?.trim()||'Ev Yemeği';
  const kcal=parseFloat(document.getElementById('tarif-kcal')?.value)||0;
  const protein=parseFloat(document.getElementById('tarif-protein')?.value)||0;
  const carb=parseFloat(document.getElementById('tarif-carb')?.value)||0;
  const fat=parseFloat(document.getElementById('tarif-fat')?.value)||0;
  const id='cf_'+Date.now();
  S.nutrition.customFoods[id]={name,amount:1,unit:'porsiyon',
    kcal,protein,carb,fat,
    kcal100:kcal,protein100:protein,carb100:carb,fat100:fat,baseLabel:'1 porsiyon'};
  saveS();
  if(andAdd) addFoodToMeal(_addFoodMeal,_addFoodDate,f);
  else { alert('✅ Tarif kaydedildi!'); switchFoodTab('saved'); }
}


function renderRecentTab(el){
  const seen=new Set(), items=[];
  Object.values(S.nutrition?.dailyLog||{}).sort((a,b)=>(b.date||'').localeCompare(a.date||'')).forEach(day=>{
    Object.values(day.meals||{}).forEach(mealItems=>{
      [...mealItems].reverse().forEach(f=>{
        const key=f.name.toLowerCase();
        if(!seen.has(key)){ seen.add(key); items.push(f); }
      });
    });
  });
  if(!items.length){
    el.innerHTML=`<div style="font-size:12px;color:var(--muted);text-align:center;padding:20px 0">Daha önce eklenen besin yok</div>`;
    return;
  }
  window._recentFoods=items.slice(0,30);
  el.innerHTML=window._recentFoods.map((f,i)=>`
    <div class="search-result-item" onclick="selectRecentFood(${i})">
      <div class="search-result-name">${f.name} <span style="font-weight:400;color:var(--muted)">${f.amount}${f.unit}</span></div>
      <div class="search-result-macros">🔥 ${Math.round(f.kcal)} kcal &nbsp;·&nbsp; P:${f.protein}g &nbsp;·&nbsp; K:${f.carb}g &nbsp;·&nbsp; Y:${f.fat}g</div>
    </div>`).join('');
}
function selectRecentFood(i){ showFoodConfirm({...window._recentFoods[i]}, false); }

// ── ARAMA: OpenFoodFacts ──
let _searchResultsHTML='';

function renderSearchTab(el){
  el.innerHTML=`
    <div style="display:flex;gap:8px;margin-bottom:10px">
      <input id="food-search-input" type="text" placeholder="örn: ayran, tavuk göğsü, yumurta" style="flex:1" onkeydown="if(event.key==='Enter')doFoodSearch()"/>
      <button class="btn bp" style="width:auto;padding:0 16px;flex-shrink:0" onclick="doFoodSearch()">Ara</button>
    </div>
    <div id="food-search-results">${_searchResultsHTML||'<div style="font-size:12px;color:var(--muted);text-align:center;padding:20px 0">Arama yapın</div>'}</div>`;
}


async function doFoodSearch(){
  const q=document.getElementById('food-search-input')?.value?.trim();
  if(!q) return;
  const res=document.getElementById('food-search-results');
  const ql=q.toLowerCase();

  // Kayıtlı besinlerde ara
  const savedMatches=Object.entries(S.nutrition?.customFoods||{})
    .filter(([,f])=>f.name.toLowerCase().includes(ql)).slice(0,5);

  // Önceki besinlerde ara
  const seen=new Set(), recentItems=[];
  Object.values(S.nutrition?.dailyLog||{})
    .sort((a,b)=>(b.date||'').localeCompare(a.date||''))
    .forEach(day=>{
      Object.values(day.meals||{}).forEach(mealItems=>{
        [...mealItems].reverse().forEach(f=>{
          const key=f.name.toLowerCase();
          if(!seen.has(key)&&key.includes(ql)){ seen.add(key); recentItems.push(f); }
        });
      });
    });
  const recentMatches=recentItems.slice(0,5);
  window._localRecentSearchResults=recentMatches;

  // Lokal sonuçlar HTML
  let localHTML='';
  if(savedMatches.length){
    localHTML+=`<div class="search-section-hdr">💾 Kayıtlı</div>`;
    localHTML+=savedMatches.map(([id,f])=>`
      <div class="search-result-item" onclick="selectSavedFoodForSearch('${id}')">
        <div class="search-result-name">${f.name}</div>
        <div class="search-result-macros">🔥 ${f.kcal100} kcal &nbsp;·&nbsp; P:${f.protein100}g &nbsp;·&nbsp; K:${f.carb100}g &nbsp;·&nbsp; Y:${f.fat100}g <span style="color:var(--muted2)">/100g</span></div>
      </div>`).join('');
  }
  if(recentMatches.length){
    localHTML+=`<div class="search-section-hdr"${savedMatches.length?' style="margin-top:10px"':''}>🕐 Önceki</div>`;
    localHTML+=recentMatches.map((f,i)=>`
      <div class="search-result-item" onclick="selectLocalRecentForSearch(${i})">
        <div class="search-result-name">${f.name} <span style="font-weight:400;color:var(--muted)">${f.amount}${f.unit}</span></div>
        <div class="search-result-macros">🔥 ${Math.round(f.kcal)} kcal &nbsp;·&nbsp; P:${f.protein}g &nbsp;·&nbsp; K:${f.carb}g &nbsp;·&nbsp; Y:${f.fat}g</div>
      </div>`).join('');
  }

  const hasLocal=savedMatches.length||recentMatches.length;
  res.innerHTML=(hasLocal?localHTML:'')+
    `<div${hasLocal?' style="margin-top:10px"':''}>`+
    `<div class="search-section-hdr">🌐 Besin Veritabanı</div>`+
    `<div id="api-search-section"><div style="text-align:center;padding:12px 0;color:var(--muted);font-size:13px">⏳ Aranıyor...</div></div>`+
    `</div>`;

  try{
    const endpoints=[
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=20&fields=product_name,product_name_tr,nutriments,serving_size,serving_quantity,brands`,
      `https://world.openfoodfacts.net/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=20&fields=product_name,product_name_tr,nutriments,serving_size,serving_quantity,brands`
    ];
    let data=null;
    for(const url of endpoints){
      try{ const resp=await fetchWithRetry(url,3,600); data=await resp.json(); break; }catch(e){ continue; }
    }
    if(!data) throw new Error('Tüm sunucular meşgul');

    const products=(data.products||[]).filter(p=>{
      const n=p.nutriments;
      return p.product_name&&(n?.['energy-kcal_100g']>0||n?.['energy-kcal']>0)&&n?.proteins_100g>=0;
    });

    const apiEl=document.getElementById('api-search-section');
    if(!apiEl) return;

    if(!products.length){
      apiEl.innerHTML=`<div style="color:var(--muted);font-size:13px;padding:10px 0;text-align:center">Sonuç bulunamadı. Farklı bir kelime veya İngilizce deneyin (örn: chicken breast).</div>`;
      _searchResultsHTML=res.innerHTML; return;
    }
    _searchResults=products.map(p=>{
      const n=p.nutriments;
      const rawName=p.product_name_tr||p.product_name||'Bilinmeyen';
      const brand=p.brands?` (${p.brands.split(',')[0].trim()})` :'';
      const name=rawName+brand;
      const servingQty=parseFloat(p.serving_quantity)||100;
      const unit=(p.serving_size||'').match(/ml|mL/i)?'ml':'g';
      const ratio=servingQty/100;
      const kcal100=n['energy-kcal_100g']||Math.round((n['energy-kcal']||0)/ratio)||0;
      return {name,amount:servingQty,unit,
        kcal:Math.round(kcal100*ratio),
        protein:Math.round((n.proteins_100g||0)*ratio*10)/10,
        carb:Math.round((n.carbohydrates_100g||0)*ratio*10)/10,
        fat:Math.round((n.fat_100g||0)*ratio*10)/10,
        kcal100,protein100:n.proteins_100g||0,carb100:n.carbohydrates_100g||0,fat100:n.fat_100g||0
      };
    });
    apiEl.innerHTML=_searchResults.map((f,i)=>`
      <div class="search-result-item" onclick="selectSearchResult(${i})">
        <div class="search-result-name">${f.name} <span style="font-weight:400;color:var(--muted)">${f.amount}${f.unit}</span></div>
        <div class="search-result-macros">🔥 ${f.kcal} kcal &nbsp;·&nbsp; P:${f.protein}g &nbsp;·&nbsp; K:${f.carb}g &nbsp;·&nbsp; Y:${f.fat}g</div>
      </div>`).join('');
    _searchResultsHTML=res.innerHTML;
  }catch(e){
    const apiEl=document.getElementById('api-search-section');
    if(apiEl) apiEl.innerHTML=`<div style="text-align:center;padding:12px 0">
      <div style="color:var(--danger);font-size:13px;margin-bottom:8px">⚠️ ${e.message==='Tüm sunucular meşgul'?'Sunucu şu an meşgul (503). Birkaç saniye bekleyip tekrar deneyin.':'Bağlantı hatası. İnternet bağlantınızı kontrol edin.'}</div>
      <button class="btn bo" style="font-size:12px" onclick="doFoodSearch()">🔄 Tekrar Dene</button>
    </div>`;
    _searchResultsHTML=res.innerHTML;
  }
}

function selectSavedFoodForSearch(id){
  const f=S.nutrition?.customFoods?.[id]; if(!f) return;
  showFoodConfirm({name:f.name,amount:100,unit:'g',kcal:f.kcal100,protein:f.protein100,carb:f.carb100,fat:f.fat100},false);
}
function selectLocalRecentForSearch(i){
  const f=window._localRecentSearchResults?.[i]; if(f) showFoodConfirm({...f},false);
}

function selectSearchResult(i){
  const f=_searchResults[i];
  showFoodConfirm(f, false);
}

// ── KAYITLI BESINLER SEKMESİ ──
function renderSavedTab(el){
  const foods=Object.entries(S.nutrition?.customFoods||{});
  el.innerHTML=`
    <button class="btn bo" style="margin-bottom:10px;font-size:13px" onclick="openManualFoodForm()">+ Yeni Besin Kaydet</button>
    ${foods.length===0?`<div style="font-size:12px;color:var(--muted);text-align:center;padding:20px 0">Kayıtlı besin yok</div>`:
      foods.map(([id,f])=>`
        <div class="saved-food-item">
          <div style="flex:1;cursor:pointer" onclick="selectSavedFood('${id}')">
            <div style="font-size:13px;font-weight:600">${f.name}</div>
            <div style="font-size:11px;color:var(--muted)">${f.baseLabel||'100'+(f.unit||'g')} başına · ${f.kcal100||Math.round(f.kcal)} kcal · P:${f.protein100||f.protein}g K:${f.carb100||f.carb}g Y:${f.fat100||f.fat}g</div>
          </div>
          <button style="background:none;border:none;color:var(--accent);font-size:14px;cursor:pointer;padding:4px 6px" onclick="openEditSavedFood('${id}')">✏️</button>
          <button style="background:none;border:none;color:var(--danger);font-size:14px;cursor:pointer;padding:4px 6px" onclick="deleteSavedFood('${id}')">🗑</button>
        </div>`).join('')}`;
}

function openEditSavedFood(id){
  const f=S.nutrition?.customFoods?.[id]; if(!f) return;
  const el=document.getElementById('food-tab-content');
  el.innerHTML=`
    <div style="font-size:12px;color:var(--muted);margin-bottom:10px">Kayıtlı besini güncelle</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <div class="lbl">Besin Adı</div>
      <input id="ef-name" type="text" value="${f.name}"/>
      <div class="lbl">Değerler (g/ml → 100 başına · adet/porsiyon → 1 adet başına)</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div><div class="lbl">Kalori (kcal)</div><input id="ef-kcal" type="number" value="${f.kcal100||f.kcal}"/></div>
        <div><div class="lbl">Protein (g)</div><input id="ef-protein" type="number" value="${f.protein100||f.protein}"/></div>
        <div><div class="lbl">Karbonhidrat (g)</div><input id="ef-carb" type="number" value="${f.carb100||f.carb}"/></div>
        <div><div class="lbl">Yağ (g)</div><input id="ef-fat" type="number" value="${f.fat100||f.fat}"/></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div><div class="lbl">Birim</div>
          <select id="ef-unit"><option value="g" ${f.unit==='g'?'selected':''}>gram (g)</option><option value="ml" ${f.unit==='ml'?'selected':''}>mililitre (ml)</option><option value="adet" ${f.unit==='adet'?'selected':''}>adet</option><option value="porsiyon" ${f.unit==='porsiyon'?'selected':''}>porsiyon</option></select></div>
        <div><div class="lbl">Varsayılan Miktar</div><input id="ef-amount" type="number" value="${f.amount}"/></div>
      </div>
      <button class="btn bp" style="margin-top:4px" onclick="saveEditedFood('${id}')">💾 Güncelle</button>
      <button class="btn bo" style="margin-top:0" onclick="switchFoodTab('saved')">İptal</button>
    </div>`;
}

function saveEditedFood(id){
  const name=document.getElementById('ef-name')?.value?.trim();
  const kcal100=parseFloat(document.getElementById('ef-kcal')?.value)||0;
  const protein100=parseFloat(document.getElementById('ef-protein')?.value)||0;
  const carb100=parseFloat(document.getElementById('ef-carb')?.value)||0;
  const fat100=parseFloat(document.getElementById('ef-fat')?.value)||0;
  const unit=document.getElementById('ef-unit')?.value||'g';
  const amount=parseFloat(document.getElementById('ef-amount')?.value)||100;
  if(!name||!kcal100){ alert('İsim ve kalori zorunlu'); return; }
  const isCountUnit = unit==='adet'||unit==='porsiyon';
  const ratio = isCountUnit ? amount : amount/100;
  const baseLabel = isCountUnit ? '1 '+unit : '100'+unit;
  S.nutrition.customFoods[id]={name,amount,unit,
    kcal:Math.round(kcal100*ratio),protein:Math.round(protein100*ratio*10)/10,
    carb:Math.round(carb100*ratio*10)/10,fat:Math.round(fat100*ratio*10)/10,
    kcal100,protein100,carb100,fat100,baseLabel};
  saveS();
  switchFoodTab('saved');
}

function selectSavedFood(id){
  const f=S.nutrition?.customFoods?.[id];
  if(f) showFoodConfirm({...f}, false);
}

function deleteSavedFood(id){
  if(confirm('Bu besini kayıtlardan silmek istiyor musunuz?')){ delete S.nutrition.customFoods[id]; saveS(); renderSavedTab(document.getElementById('food-tab-content')); }
}

function openManualFoodForm(){
  const el=document.getElementById('food-tab-content');
  el.innerHTML=`
    <div style="display:flex;flex-direction:column;gap:8px">
      <div class="lbl">Besin Adı</div>
      <input id="mf-name" type="text" placeholder="örn: Sütaş Ayran 200ml"/>
      <div class="lbl">Değerler (g/ml → 100 başına · adet/porsiyon → 1 adet başına)</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div><div class="lbl">Kalori (kcal)</div><input id="mf-kcal" type="number" placeholder="örn: 45"/></div>
        <div><div class="lbl">Protein (g)</div><input id="mf-protein" type="number" placeholder="örn: 3.5"/></div>
        <div><div class="lbl">Karbonhidrat (g)</div><input id="mf-carb" type="number" placeholder="örn: 4.5"/></div>
        <div><div class="lbl">Yağ (g)</div><input id="mf-fat" type="number" placeholder="örn: 1.5"/></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div><div class="lbl">Birim</div>
          <select id="mf-unit"><option value="g">gram (g)</option><option value="ml">mililitre (ml)</option><option value="adet">adet</option></select></div>
        <div><div class="lbl">Miktar</div><input id="mf-amount" type="number" placeholder="örn: 200"/></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px">
        <button class="btn bp" onclick="saveManualFood(false)">💾 Kaydet</button>
        <button class="btn bp" onclick="saveManualFood(true)">✅ Kaydet ve Ekle</button>
      </div>
      <button class="btn bo" style="margin-top:8px" onclick="switchFoodTab('saved')">İptal</button>
    </div>`;
}

function saveManualFood(andAdd=false){
  const name=document.getElementById('mf-name')?.value?.trim();
  const kcal100=parseFloat(document.getElementById('mf-kcal')?.value)||0;
  const protein100=parseFloat(document.getElementById('mf-protein')?.value)||0;
  const carb100=parseFloat(document.getElementById('mf-carb')?.value)||0;
  const fat100=parseFloat(document.getElementById('mf-fat')?.value)||0;
  const unit=document.getElementById('mf-unit')?.value||'g';
  const amount=parseFloat(document.getElementById('mf-amount')?.value)||100;
  if(!name||!kcal100){ alert('İsim ve kalori zorunlu'); return; }
  const isCountUnit = unit==='adet'||unit==='porsiyon';
  const ratio = isCountUnit ? amount : amount/100;
  const baseLabel = isCountUnit ? '1 '+unit : '100'+unit;
  const food={name,amount,unit,kcal:Math.round(kcal100*ratio),protein:Math.round(protein100*ratio*10)/10,carb:Math.round(carb100*ratio*10)/10,fat:Math.round(fat100*ratio*10)/10,
    kcal100,protein100,carb100,fat100,baseLabel};
  const id='cf_'+Date.now();
  S.nutrition.customFoods[id]=food;
  saveS();
  if(andAdd) showFoodConfirm(food, true);
  else { alert('✅ Besin kaydedildi!'); switchFoodTab('saved'); }
}

// ── FOTOĞRAF SEKMESİ ──
function renderPhotoTab(el){
  el.innerHTML=`
    <div class="photo-upload-area" onclick="document.getElementById('food-photo-input').click()">
      <div style="font-size:40px;margin-bottom:8px">📷</div>
      <div style="font-size:14px;font-weight:600">Besin fotoğrafı yükle</div>
      <div style="font-size:11px;color:var(--muted);margin-top:4px">Etiket, tabak veya ürün fotoğrafı</div>
    </div>
    <input type="file" id="food-photo-input" accept="image/*" style="display:none" onchange="analyzePhoto(this)"/>
    <div id="photo-result"></div>`;
}
// ── AI YAPISTIR SEKMESİ ──
function renderAiPasteTab(el){
  el.innerHTML=`
    <div style="font-size:12px;color:var(--muted);margin-bottom:10px;line-height:1.5">ChatGPT veya Claude yanıtını yapıştır — besin değerleri otomatik ayrıştırılır.</div>
    <textarea id="ai-paste-input"
      placeholder="Örn:\nTavuk göğsü 100g\nKalori: 165 kcal\nProtein: 31g\nKarbonhidrat: 0g\nYağ: 3.6g"
      style="width:100%;min-height:130px;background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:10px;font-size:13px;resize:vertical;font-family:var(--fb);line-height:1.5;outline:none;box-sizing:border-box"
      oninput="parseAiPaste()"></textarea>
    <div id="ai-parse-result" style="display:none;margin-top:10px">
      <div style="font-size:12px;color:var(--muted);margin-bottom:8px;font-weight:600">Ayrıştırılan bilgiler — düzenleyebilirsin</div>
      <div style="margin-bottom:8px">
        <div class="lbl">Besin Adı</div>
        <input id="ai-name" type="text" placeholder="Yemek adı"/>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <div><div class="lbl">Birim</div>
          <select id="ai-unit"><option value="g">gram (g)</option><option value="ml">mililitre (ml)</option><option value="adet">adet</option></select></div>
        <div><div class="lbl">Miktar</div>
          <input id="ai-amount" type="number" placeholder="100" min="1" max="9999" value="100"/></div>
      </div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:8px">Değerler girilen miktara aittir</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div><div class="lbl">Kalori (kcal)</div><input id="ai-kcal" type="number" placeholder="0"/></div>
        <div><div class="lbl">Protein (g)</div><input id="ai-protein" type="number" placeholder="0"/></div>
        <div><div class="lbl">Karbonhidrat (g)</div><input id="ai-carb" type="number" placeholder="0"/></div>
        <div><div class="lbl">Yağ (g)</div><input id="ai-fat" type="number" placeholder="0"/></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <button class="btn bo" onclick="saveAiFood(false)">💾 Kaydet</button>
        <button class="btn bp" onclick="saveAiFood(true)">✅ Kaydet ve Ekle</button>
      </div>
    </div>
    <div id="ai-parse-empty" style="display:none;margin-top:10px;color:var(--muted);font-size:13px;text-align:center;padding:16px;background:var(--bg3);border-radius:10px">
      ⚠️ Besin değeri bulunamadı — farklı bir format dene
    </div>`;
}

function parseAiPaste(){
  const raw=document.getElementById('ai-paste-input')?.value||'';
  const resEl=document.getElementById('ai-parse-result');
  const emptyEl=document.getElementById('ai-parse-empty');
  if(!raw.trim()){ resEl.style.display='none'; emptyEl.style.display='none'; return; }

  // Markdown bold/italic/code işaretlerini soy, sonra parse et
  const text=raw.replace(/\*\*/g,'').replace(/[*_`]/g,'');

  // ~45g, ≈33g, 33–35g, 33-35g: tilde/yaklaşık + aralık ortası
  const NUM='[~≈]?\\s*([\\d]+(?:[.,][\\d]+)?)(?:\\s*[–—\\-]\\s*([\\d]+(?:[.,][\\d]+)?))?';

  function findNum(patterns){
    for(const re of patterns){
      const m=text.match(re);
      if(m){
        const n1=parseFloat(m[1].replace(',','.'));
        if(isNaN(n1)) continue;
        if(m[2]){ const n2=parseFloat(m[2].replace(',','.')); if(!isNaN(n2)) return Math.round((n1+n2)/2*10)/10; }
        return n1;
      }
    }
    return null;
  }

  const kcal=findNum([
    new RegExp('(?:kalori|enerji|energy|calories?)\\s*[:\\|\\-]?\\s*'+NUM+'\\s*(?:kcal)?','i'),
    new RegExp(NUM+'\\s*kcal','i'),
  ]);
  const protein=findNum([
    new RegExp('protein\\s*[:\\|\\-]?\\s*'+NUM+'\\s*g','i'),
    new RegExp('protein\\s*[:\\|\\-]?\\s*'+NUM,'i'),
  ]);
  const carb=findNum([
    new RegExp('(?:karbonhidrat|toplam karbonhidrat|karb|carbohydrates?|kh)\\s*[:\\|\\-]?\\s*'+NUM+'\\s*g','i'),
    new RegExp('(?:karbonhidrat|karb|carb|kh)\\s*[:\\|\\-]?\\s*'+NUM,'i'),
  ]);
  const fat=findNum([
    new RegExp('(?:ya[gğ]|fat|lipid|toplam ya[gğ])\\s*[:\\|\\-]?\\s*'+NUM+'\\s*g','i'),
    new RegExp('(?:ya[gğ]|fat)\\s*[:\\|\\-]?\\s*'+NUM,'i'),
  ]);

  // Porsiyon miktarı ve birimini metinden çıkar
  let amount=100, detectedUnit='g';
  const amountPatterns=[
    [/porsiyon\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*ml/i,'ml'],
    [/porsiyon\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*g/i,'g'],
    [/miktar\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*ml/i,'ml'],
    [/miktar\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*g/i,'g'],
    [/serving\s*(?:size)?\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*ml/i,'ml'],
    [/serving\s*(?:size)?\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*g/i,'g'],
    [/(\d+(?:[.,]\d+)?)\s*ml\b/i,'ml'],
    [/(\d+(?:[.,]\d+)?)\s*(?:gr(?:am)?|g)\b/i,'g'],
    [/(\d+(?:[.,]\d+)?)\s*adet\b/i,'adet'],
  ];
  for(const [re,unit] of amountPatterns){
    const m=text.match(re);
    if(m){ const v=parseFloat(m[1].replace(',','.')); if(!isNaN(v)&&v>0){ amount=v; detectedUnit=unit; break; } }
  }

  let name='';
  const skipRe=/kalori|enerji|protein|karbonhidrat|karb\b|ya[gğ]\b|kcal|lif|fiber|sodyum|sodium|şeker|sugar|kalsiyum|demir|toplam/i;
  const lines=text.split('\n').map(l=>l.trim()).filter(l=>l.length>1);
  for(const line of lines){
    const clean=line.replace(/^[*#>\-•|]+\s*/,'').replace(/[*_`]+/g,'').trim();
    if(!clean||clean.length<2||clean.length>100) continue;
    if(/^\d/.test(clean)) continue;
    if(skipRe.test(clean)) continue;
    name=clean;
    break;
  }

  const found=kcal!==null||protein!==null||carb!==null||fat!==null;
  resEl.style.display=found?'block':'none';
  emptyEl.style.display=!found?'block':'none';
  if(found){
    document.getElementById('ai-name').value=name;
    document.getElementById('ai-unit').value=detectedUnit;
    document.getElementById('ai-amount').value=amount;
    document.getElementById('ai-kcal').value=kcal!==null?kcal:'';
    document.getElementById('ai-protein').value=protein!==null?protein:'';
    document.getElementById('ai-carb').value=carb!==null?carb:'';
    document.getElementById('ai-fat').value=fat!==null?fat:'';
  }
}

function saveAiFood(andAdd){
  const name=document.getElementById('ai-name').value.trim();
  const unit=document.getElementById('ai-unit')?.value||'g';
  const amount=parseFloat(document.getElementById('ai-amount').value)||100;
  const kcal=parseFloat(document.getElementById('ai-kcal').value)||0;
  const protein=parseFloat(document.getElementById('ai-protein').value)||0;
  const carb=parseFloat(document.getElementById('ai-carb').value)||0;
  const fat=parseFloat(document.getElementById('ai-fat').value)||0;
  if(!name){alert('Besin adı girin');return;}
  if(!kcal){alert('Kalori değeri girin');return;}
  const isCountUnit=unit==='adet'||unit==='porsiyon';
  const ratio=isCountUnit?amount:amount/100;
  const baseLabel=isCountUnit?'1 '+unit:'100'+unit;
  const kcal100=Math.round(kcal/ratio);
  const protein100=Math.round(protein/ratio*10)/10;
  const carb100=Math.round(carb/ratio*10)/10;
  const fat100=Math.round(fat/ratio*10)/10;
  const id='cf_'+Date.now();
  if(!S.nutrition) S.nutrition={};
  if(!S.nutrition.customFoods) S.nutrition.customFoods={};
  S.nutrition.customFoods[id]={name,amount,unit,kcal,protein,carb,fat,kcal100,protein100,carb100,fat100,baseLabel};
  saveS();
  if(andAdd){
    const food={name,amount,unit,kcal,protein,carb,fat,kcal100,protein100,carb100,fat100,baseLabel};
    showFoodConfirm(food,false);
  } else {
    alert('✅ Kaydedildi!');
    switchFoodTab('saved');
  }
}

function saveFood(food){
  const db = JSON.parse(localStorage.getItem("foods") || "[]");
  db.push(food);
  localStorage.setItem("foods", JSON.stringify(db));
}
function manualAddFood(){
  const food = {
    name: document.getElementById('f_name').value,
    amount: 100,
    unit: "g",
    kcal: Number(document.getElementById('f_kcal').value),
    protein: Number(document.getElementById('f_protein').value),
    carb: Number(document.getElementById('f_carb').value),
    fat: Number(document.getElementById('f_fat').value),
  };

  _pendingFood = food;
  addPendingPhotoFood();
}

async function analyzePhoto(input){
  const file = input.files[0];
  if(!file) return;

  const res = document.getElementById('photo-result');
  res.innerHTML = `<div style="text-align:center;padding:16px;color:var(--muted);font-size:13px">🔍 Analiz ediliyor...</div>`;

  try{
    const formData = new FormData();
    formData.append('file', file);

    const resp = await fetch('https://api.calorieninjas.com/v1/imagetextnutrition', {
      method: 'POST',
      headers: {
        'X-Api-Key': 'WhqzUJab0B7ugI+QqMQ4pQ==9FpXn3H9ZBmz6dko'
      },
      body: formData
    });

    const data = await resp.json();

    // 👇 API bazen boş dönebiliyor
    if(!data.items || data.items.length === 0){
      throw new Error("Yiyecek bulunamadı");
    }

    // 👇 ilk item alıyoruz
    const item = data.items[0];

    const food = {
      name: item.name || "Bilinmeyen",
      amount: item.serving_size_g || 100,
      unit: "g",
      kcal: item.calories || 0,
      protein: item.protein_g || 0,
      carb: item.carbohydrates_total_g || 0,
      fat: item.fat_total_g || 0
    };

    _pendingFood = food;

    res.innerHTML = `
      <div style="background:var(--bg3);border-radius:12px;padding:14px;margin-bottom:10px">
        <div style="font-size:14px;font-weight:600;margin-bottom:6px">${food.name}</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;text-align:center">
          <div><div style="font-size:18px;color:var(--accent)">${Math.round(food.kcal)}</div><div style="font-size:10px;color:var(--muted)">kcal</div></div>
          <div><div style="font-size:18px;color:#60a5fa">${food.protein}g</div><div style="font-size:10px;color:var(--muted)">protein</div></div>
          <div><div style="font-size:18px;color:#fb923c">${food.carb}g</div><div style="font-size:10px;color:var(--muted)">karb</div></div>
          <div><div style="font-size:18px;color:#a78bfa">${food.fat}g</div><div style="font-size:10px;color:var(--muted)">yağ</div></div>
        </div>
        <div style="font-size:11px;color:var(--muted);margin-top:8px">${food.amount}${food.unit}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <button class="btn bp" onclick="addPendingPhotoFood()">✓ Ekle</button>
        <button class="btn bp" onclick="savePendingAndAdd()">✅ Kaydet ve Ekle</button>
      </div>`;

  }catch(e){
  console.error(e);

  res.innerHTML = `
    <div style="background:var(--bg3);border-radius:12px;padding:12px;margin-bottom:10px">
      <div style="font-size:13px;color:var(--danger);margin-bottom:8px">
        ⚠️ Otomatik analiz başarısız (limit doldu)
      </div>

      <input id="f_name" placeholder="Ürün adı" class="inp">
      <input id="f_kcal" placeholder="Kalori" class="inp">
      <input id="f_protein" placeholder="Protein" class="inp">
      <input id="f_carb" placeholder="Karbonhidrat" class="inp">
      <input id="f_fat" placeholder="Yağ" class="inp">

      <button class="btn bp" onclick="manualAddFood()">Ekle</button>
    </div>
  `;
}

}

function addPendingPhotoFood(){
  if(!_pendingFood) return;
  addFoodToMeal(_addFoodMeal,_addFoodDate,{..._pendingFood});
}
function savePendingAndAdd(){
  if(!_pendingFood) return;
  const f=_pendingFood;
  const id='cf_'+Date.now();
  const ratio=f.amount/100;
  S.nutrition.customFoods[id]={...f,kcal100:Math.round(f.kcal/ratio),protein100:Math.round(f.protein/ratio*10)/10,carb100:Math.round(f.carb/ratio*10)/10,fat100:Math.round(f.fat/ratio*10)/10};
  saveS();
  addFoodToMeal(_addFoodMeal,_addFoodDate,{..._pendingFood});
}

// ── BESIN ONAY / MİKTAR SEÇME ──
let _confirmFood=null, _confirmBaseKcal=0, _confirmBaseAmount=1;
function showFoodConfirm(food, fromManual){
  _confirmFood=food;
  _confirmBaseKcal=food.kcal;
  _confirmBaseAmount=food.amount||1;
  const el=document.getElementById('food-tab-content');
  el.innerHTML=`
    <div style="background:var(--bg3);border-radius:12px;padding:14px;margin-bottom:12px">
      <div style="font-size:14px;font-weight:600;margin-bottom:4px">${food.name}</div>
      <div style="font-size:12px;color:var(--muted)">🔥 ${Math.round(food.kcal)} kcal · P:${food.protein}g · K:${food.carb}g · Y:${food.fat}g (${food.amount}${food.unit})</div>
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:8px;margin-bottom:6px">
      <div>
        <div class="lbl">Miktar (${food.unit})</div>
        <input id="confirm-amount" type="number" value="${food.amount}" step="any" min="0" oninput="updateConfirmKcal()"/>
      </div>
      <div>
        <div class="lbl">Adet</div>
        <input id="confirm-adet" type="number" value="1" min="0" step="any" oninput="updateConfirmKcal()"/>
      </div>
    </div>
    <div id="confirm-kcal-preview" style="text-align:center;font-family:var(--fa);font-size:24px;color:var(--accent);margin-bottom:12px">${Math.round(food.kcal)} kcal</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <button class="btn bp" onclick="confirmAddFood()">✓ Ekle</button>
      <button class="btn bo" onclick="renderFoodTab(_activeFoodTab)">‹ Geri</button>
    </div>`;
}

function updateConfirmKcal(){
  const newAmount=parseFloat(document.getElementById('confirm-amount')?.value ?? '') || 0;
  const adet=parseFloat(document.getElementById('confirm-adet')?.value ?? '') || 1;
  const newKcal=Math.round(_confirmBaseKcal*(newAmount/_confirmBaseAmount)*adet);
  const el=document.getElementById('confirm-kcal-preview');
  if(el) el.textContent=newKcal+' kcal';
}

function confirmAddFood(){
  const food=_confirmFood; if(!food) return;
  const amountEl=document.getElementById('confirm-amount');
  const adetEl=document.getElementById('confirm-adet');
  const newAmount=parseFloat(amountEl?.value ?? '') || _confirmBaseAmount;
  const adet=Math.max(0.01, parseFloat(adetEl?.value ?? '') || 1);
  const ratio=(newAmount/_confirmBaseAmount)*adet;
  const f={
    name: adet>1 ? `${food.name} ×${adet}` : food.name,
    amount:Math.round(newAmount*adet*10)/10, unit:food.unit,
    kcal:Math.round(food.kcal*ratio),
    protein:Math.round(food.protein*ratio*10)/10,
    carb:Math.round(food.carb*ratio*10)/10,
    fat:Math.round(food.fat*ratio*10)/10,
    addedAt:Date.now()
  };
  addFoodToMeal(_addFoodMeal,_addFoodDate,f);
}

function addFoodToMeal(mealKey,dateKey,food){
  const day=getKalDay(dateKey);
  day.meals[mealKey].push(food);
  saveS();
  document.getElementById('add-food-modal').style.display='none';
  renderKalori();
  // İlgili öğünü aç
  setTimeout(()=>{ const b=document.getElementById('meal-body-'+mealKey); if(b&&!b.classList.contains('open')) toggleMeal(mealKey); },100);
}

// ── AI ÖĞÜN ANALİZİ ──
let _aiMealItems=[];

function openAiMealModal(){
  let modal=document.getElementById('ai-meal-modal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='ai-meal-modal';
    modal.className='mo add-food-modal';
    document.body.appendChild(modal);
  }
  const savedKey=S.claudeKey||'';
  modal.innerHTML=`
    <div class="ms">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div style="font-family:var(--fa);font-size:16px;letter-spacing:.5px">✨ AI ÖĞÜN ANALİZİ</div>
        <button onclick="document.getElementById('ai-meal-modal').style.display='none'" style="background:none;border:none;color:var(--muted);font-size:22px;cursor:pointer">✕</button>
      </div>
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">
          <div class="lbl" style="margin:0">Claude API Anahtarı</div>
          <a href="https://console.anthropic.com/settings/keys" target="_blank" style="font-size:11px;color:var(--accent);text-decoration:none">Nasıl alınır? ↗</a>
        </div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:8px">console.anthropic.com → API Keys → Create Key</div>
        <input id="ai-claude-key" type="password" placeholder="sk-ant-api03-..." value="${savedKey}" style="width:100%;background:var(--bg3);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:10px 12px;font-size:14px;box-sizing:border-box;font-family:monospace;letter-spacing:.5px"/>
        <button id="ai-key-save-btn" class="btn bo" style="width:100%;margin-top:6px;font-size:13px" onclick="saveClaudeKey()">Kaydet</button>
      </div>
      <div class="lbl">Besinler (her satıra bir tane)</div>
      <textarea id="ai-meal-input" rows="6" style="width:100%;resize:vertical;background:var(--bg3);color:var(--text);border:1px solid var(--border);border-radius:10px;padding:10px;font-size:13px;box-sizing:border-box;font-family:inherit" placeholder="60 gr çiğ basmati pirinç&#10;20 gr tereyağ&#10;100 gr haşlanmış brokoli&#10;170 gr çiğ tavuk göğsü&#10;200 gr kaymaksız yoğurt"></textarea>
      <button class="btn bp" style="margin-top:8px" onclick="analyzeAiMealQuery()">🔍 Analiz Et</button>
      <div id="ai-meal-results"></div>
    </div>`;
  modal.style.display='flex';
}

function saveClaudeKey(){
  const key=document.getElementById('ai-claude-key')?.value?.trim()||'';
  S.claudeKey=key;
  saveS();
  const btn=document.getElementById('ai-key-save-btn');
  if(btn){ btn.textContent='✓ Kaydedildi'; btn.style.color='var(--accent)'; setTimeout(()=>{ btn.textContent='Kaydet'; btn.style.color=''; },1800); }
}

async function analyzeAiMealQuery(){
  saveClaudeKey();
  const key=S.claudeKey;
  if(!key){alert('Önce Claude API anahtarı girin');return;}
  const query=document.getElementById('ai-meal-input')?.value?.trim();
  if(!query){alert('Besin listesi girin');return;}
  const res=document.getElementById('ai-meal-results');
  res.innerHTML='<div style="text-align:center;padding:20px;color:var(--muted)">⏳ Analiz ediliyor...</div>';
  try{
    const resp=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'x-api-key':key,
        'anthropic-version':'2023-06-01',
        'anthropic-dangerous-direct-browser-access':'true'
      },
      body:JSON.stringify({
        model:'claude-haiku-4-5-20251001',
        max_tokens:1024,
        system:'Sen bir beslenme uzmanısın. Kullanıcının verdiği besin listesindeki her madde için makro besin değerlerini hesapla. YALNIZCA geçerli JSON formatında yanıt ver, başka hiçbir şey yazma. Format: {"items":[{"name":"besin adı","amount":miktar,"unit":"birim","kcal":kalori,"protein":protein_g,"carb":karbonhidrat_g,"fat":yag_g}]}. Sayıları 1 ondalık basamağa yuvarla. Değerleri belirtilen miktar için hesapla. Besin adlarını Türkçe yaz.',
        messages:[{role:'user',content:query}]
      })
    });
    if(!resp.ok){
      const err=await resp.json().catch(()=>({}));
      throw new Error(err?.error?.message||'API hatası: '+resp.status);
    }
    const data=await resp.json();
    const raw=data.content?.[0]?.text||'{}';
    const cleaned=raw.replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'').trim();
    const parsed=JSON.parse(cleaned);
    if(!parsed.items?.length){
      res.innerHTML='<div style="color:var(--muted);font-size:13px;text-align:center;padding:16px;background:var(--bg3);border-radius:10px;margin-top:10px">Besin verisi alınamadı.</div>';
      return;
    }
    _aiMealItems=parsed.items.map(item=>({
      name:String(item.name||''),
      amount:parseFloat(item.amount)||100,
      unit:String(item.unit||'g'),
      kcal:Math.round(parseFloat(item.kcal)||0),
      protein:Math.round((parseFloat(item.protein)||0)*10)/10,
      carb:Math.round((parseFloat(item.carb)||0)*10)/10,
      fat:Math.round((parseFloat(item.fat)||0)*10)/10,
    }));
    const tot=_aiMealItems.reduce((a,f)=>({kcal:a.kcal+f.kcal,protein:a.protein+f.protein,carb:a.carb+f.carb,fat:a.fat+f.fat}),{kcal:0,protein:0,carb:0,fat:0});
    let html='<div style="margin-top:12px">';
    _aiMealItems.forEach(f=>{
      html+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:var(--bg3);border-radius:8px;margin-bottom:6px">
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f.name}</div>
          <div style="font-size:11px;color:var(--muted)">${f.amount}${f.unit} · P:${f.protein}g · K:${f.carb}g · Y:${f.fat}g</div>
        </div>
        <div style="font-family:var(--fa);font-size:14px;color:var(--accent);margin-left:10px;white-space:nowrap">${f.kcal} kcal</div>
      </div>`;
    });
    html+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:var(--accent);border-radius:8px;margin-top:2px;color:#fff">
      <div style="font-size:13px;font-weight:700">TOPLAM</div>
      <div style="font-size:11px">P:${Math.round(tot.protein)}g · K:${Math.round(tot.carb)}g · Y:${Math.round(tot.fat)}g</div>
      <div style="font-family:var(--fa);font-size:15px;font-weight:700">${Math.round(tot.kcal)} kcal</div>
    </div>`;
    html+=`<div style="margin-top:12px">
      <div class="lbl">Öğün seç</div>
      <select id="ai-meal-select" style="width:100%;background:var(--bg3);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:8px;margin-bottom:8px;box-sizing:border-box">
        <option value="sabah">☀️ Sabah</option>
        <option value="ogle" selected>🌤 Öğle</option>
        <option value="aksam">🌙 Akşam</option>
        <option value="ara">🍎 Ara Öğün</option>
      </select>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <button class="btn bp" onclick="addAiMealItems()">✓ Öğüne Ekle</button>
        <button class="btn bo" onclick="saveAiMealItems()">💾 Kaydet</button>
      </div>
    </div></div>`;
    res.innerHTML=html;
  }catch(e){
    res.innerHTML=`<div style="color:var(--danger);font-size:13px;text-align:center;padding:16px;margin-top:10px">Hata oluştu: ${e.message}</div>`;
  }
}

function addAiMealItems(){
  const mealKey=document.getElementById('ai-meal-select')?.value||'ogle';
  if(!_aiMealItems.length) return;
  const dk=kalDateKey();
  const day=getKalDay(dk);
  _aiMealItems.forEach(f=>day.meals[mealKey].push({...f,addedAt:Date.now()}));
  saveS();
  document.getElementById('ai-meal-modal').style.display='none';
  renderKalori();
  setTimeout(()=>{const b=document.getElementById('meal-body-'+mealKey);if(b&&!b.classList.contains('open'))toggleMeal(mealKey);},100);
}

function saveAiMealItems(){
  if(!_aiMealItems.length) return;
  if(!S.nutrition) S.nutrition={};
  if(!S.nutrition.customFoods) S.nutrition.customFoods={};
  _aiMealItems.forEach(f=>{
    const id='cf_'+Date.now()+'_'+Math.random().toString(36).slice(2,5);
    const ratio=f.amount/100;
    S.nutrition.customFoods[id]={
      name:f.name, amount:f.amount, unit:'g',
      kcal:f.kcal, protein:f.protein, carb:f.carb, fat:f.fat,
      kcal100:Math.round(f.kcal/ratio),
      protein100:Math.round(f.protein/ratio*10)/10,
      carb100:Math.round(f.carb/ratio*10)/10,
      fat100:Math.round(f.fat/ratio*10)/10,
      baseLabel:'100g',
    };
  });
  saveS();
  alert('✅ '+_aiMealItems.length+' besin kayıtlara eklendi!');
  document.getElementById('ai-meal-modal').style.display='none';
}
