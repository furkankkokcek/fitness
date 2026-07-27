// ═══════════════════════════════════════════════════════════
// PROGRAM ÜRETECİ — kişiye özel antrenman programı oluşturur
// Bölünme (Full Body / Upper-Lower / Push-Pull-Legs), gün sayısı,
// zorluk ve cinsiyet vurgusuna göre günlük egzersizleri seçer.
// Tüm hareketler mevcut GIF kütüphanesine dayanır (data.js).
// ═══════════════════════════════════════════════════════════

// 1) Mevcut hareketlere kas grubu / rol / ekipman etiketi ekle
//    role: 'compound' | 'iso' | 'core' ; free: serbest ağırlık mı?
const EX_TAGS = {
  g1_cp:['chest','compound',false],   g2_cp:['chest','compound',false],
  g3_cf:['chest','iso',false],
  g1_spm:['shoulders','compound',false], g3_sp:['shoulders','compound',false],
  g2_lr:['shoulders_side','iso',true],
  g1_lpd:['back_v','compound',false], g2_pu:['back_v','compound',false],
  g3_br:['back_h','compound',true],
  g2_idc:['biceps','iso',true],
  g3_cpd:['triceps','iso',false],
  g2_lp:['quads','compound',false],   g3_lp:['quads','compound',false],
  g1_le:['quads','iso',false],
  g1_rdl:['hinge','compound',true],
  g1_cr:['core','core',false], g2_lgr:['core','core',false], g3_pl:['core','core',false],
};
Object.entries(EX_TAGS).forEach(([id,[m,r,f]])=>{
  if(EX[id]){ EX[id].muscle=m; EX[id].role=r; EX[id].free=f; }
});

// 2) Kütüphaneye yeni hareketler ekle (hepsi mevcut GIF'lere dayanır)
const NEW_EX = {
  lib_dbbench:    {name:'Dumbbell Bench Press',        muscle:'chest',         role:'compound', free:true,  rmMult:0.85*0.70, sets:3, reps:8,  scheme:'3×8-12',  repType:'range', hasWeight:true,  alts:['Chest Press Machine','Smith Machine Bench','Cable Chest Press']},
  lib_smithbench: {name:'Smith Machine Bench',         muscle:'chest',         role:'compound', free:false, rmMult:0.85*0.72, sets:3, reps:8,  scheme:'3×6-10',  repType:'range', hasWeight:true,  alts:['Chest Press Machine','Dumbbell Bench Press']},
  lib_cablefly:   {name:'Cable Fly',                   muscle:'chest',         role:'iso',      free:false, rmMult:0.85*0.55, sets:3, reps:12, scheme:'3×12-15', repType:'range', hasWeight:true,  alts:['Chest Fly Machine','Dumbbell Fly','Pec Deck']},
  lib_dbrow:      {name:'Dumbbell Row',                muscle:'back_h',        role:'compound', free:true,  rmMult:0.85*0.65, sets:3, reps:10, scheme:'3×8-12',  repType:'range', hasWeight:true,  alts:['Barbell Row','Cable Seated Row','T-Bar Row']},
  lib_cablerow:   {name:'Cable Seated Row',            muscle:'back_h',        role:'compound', free:false, rmMult:0.85*0.60, sets:3, reps:12, scheme:'3×10-14', repType:'range', hasWeight:true,  alts:['Barbell Row','Dumbbell Row','T-Bar Row']},
  lib_dbohp:      {name:'Dumbbell OHP',                muscle:'shoulders',     role:'compound', free:true,  rmMult:0.85*0.60, sets:3, reps:10, scheme:'3×8-12',  repType:'range', hasWeight:true,  alts:['Shoulder Press Machine','Arnold Press','Smith Machine Shoulder']},
  lib_cablelat:   {name:'Cable Lateral Raise',         muscle:'shoulders_side',role:'iso',      free:false, rmMult:0.85*0.45, sets:3, reps:14, scheme:'3×12-15', repType:'range', hasWeight:true,  alts:['Lateral Raises','Machine Lateral Raise','Upright Row']},
  lib_bbcurl:     {name:'Barbell Curl',                muscle:'biceps',        role:'iso',      free:true,  rmMult:0.85*0.75, sets:3, reps:10, scheme:'3×8-12',  repType:'range', hasWeight:true,  alts:['Incline Dumbbell Curl','Hammer Curl','Cable Curl']},
  lib_hammer:     {name:'Hammer Curl',                 muscle:'biceps',        role:'iso',      free:true,  rmMult:0.85*0.75, sets:3, reps:10, scheme:'3×8-12',  repType:'range', hasWeight:true,  alts:['Barbell Curl','Incline Dumbbell Curl','Cable Curl']},
  lib_ohtri:      {name:'Overhead Triceps Extension',  muscle:'triceps',       role:'iso',      free:true,  rmMult:0.85*0.70, sets:3, reps:10, scheme:'3×8-12',  repType:'range', hasWeight:true,  alts:['Cable Pushdown','Dumbbell Kickback','Bench Dips']},
  lib_benchdip:   {name:'Bench Dips',                  muscle:'triceps',       role:'iso',      free:false, rmMult:0,         sets:3, reps:0,  scheme:'3×max',   repType:'max',   hasWeight:false, alts:['Cable Pushdown','Overhead Triceps Extension']},
  lib_hack:       {name:'Hack Squat',                  muscle:'quads',         role:'compound', free:false, rmMult:0.85*0.72, sets:3, reps:8,  scheme:'3×8-12',  repType:'range', hasWeight:true,  alts:['Leg Press','Smith Machine Squat','Goblet Squat']},
  lib_goblet:     {name:'Goblet Squat',                muscle:'quads',         role:'compound', free:true,  rmMult:0.85*0.55, sets:3, reps:10, scheme:'3×10-12', repType:'range', hasWeight:true,  alts:['Leg Press','Hack Squat','Smith Machine Squat']},
  lib_sldl:       {name:'Stiff-Leg Deadlift',         muscle:'hinge',         role:'compound', free:true,  rmMult:0.85*0.60, sets:3, reps:8,  scheme:'3×8-10',  repType:'range', hasWeight:true,  alts:['Romanian DL','Cable Pull-Through','DB Romanian DL']},
  lib_pullthrough:{name:'Cable Pull-Through',          muscle:'glutes',        role:'compound', free:false, rmMult:0.85*0.50, sets:3, reps:12, scheme:'3×12-15', repType:'range', hasWeight:true,  alts:['Romanian DL','Step-Up with Knee Drive']},
  lib_stepup:     {name:'Step-Up with Knee Drive',     muscle:'glutes',        role:'iso',      free:true,  rmMult:0.85*0.40, sets:3, reps:10, scheme:'3×10-12', repType:'range', hasWeight:true,  alts:['Cable Pull-Through','Goblet Squat']},
  lib_cablecrunch:{name:'Cable Crunch',                muscle:'core',          role:'core',     free:false, rmMult:0,         sets:3, reps:0,  scheme:'3×max',   repType:'max',   hasWeight:false, alts:['Crunch','Decline Crunch','Ab Wheel']},
  lib_hanging:    {name:'Hanging Knee Raise',          muscle:'core',          role:'core',     free:false, rmMult:0,         sets:3, reps:0,  scheme:'3×max',   repType:'max',   hasWeight:false, alts:['Leg Raises','Reverse Crunch','Flutter Kicks']},
  // Havuzu büyütmek için ek hareketler (hepsinin GIF'i mevcut) — üretilen programlarda tekrarı azaltır
  lib_machlat:    {name:'Machine Lateral Raise',       muscle:'shoulders_side',role:'iso',      free:false, rmMult:0.85*0.50, sets:3, reps:14, scheme:'3×12-15', repType:'range', hasWeight:true,  alts:['Lateral Raises','Cable Lateral Raise']},
  lib_uprightrow: {name:'Upright Row',                 muscle:'shoulders_side',role:'iso',      free:true,  rmMult:0.85*0.55, sets:3, reps:12, scheme:'3×10-12', repType:'range', hasWeight:true,  alts:['Lateral Raises','Cable Lateral Raise']},
  lib_tke:        {name:'Terminal Knee Extension',     muscle:'quads',         role:'iso',      free:false, rmMult:0.85*0.45, sets:3, reps:14, scheme:'3×12-15', repType:'range', hasWeight:true,  alts:['Leg Extension','Sissy Squat']},
  lib_dbrdl:      {name:'DB Romanian DL',              muscle:'hinge',         role:'compound', free:true,  rmMult:0.85*0.55, sets:3, reps:10, scheme:'3×8-12',  repType:'range', hasWeight:true,  alts:['Romanian DL','Stiff-Leg Deadlift']},
  lib_tbar:       {name:'T-Bar Row',                   muscle:'back_h',        role:'compound', free:true,  rmMult:0.85*0.65, sets:3, reps:10, scheme:'3×8-12',  repType:'range', hasWeight:true,  alts:['Barbell Row','Dumbbell Row','Cable Seated Row']},
  lib_dbfly:      {name:'Dumbbell Fly',                muscle:'chest',         role:'iso',      free:true,  rmMult:0.85*0.45, sets:3, reps:12, scheme:'3×10-15', repType:'range', hasWeight:true,  alts:['Chest Fly Machine','Cable Fly','Pec Deck']},
  lib_pecdeck:    {name:'Pec Deck',                    muscle:'chest',         role:'iso',      free:false, rmMult:0.85*0.55, sets:3, reps:14, scheme:'3×12-15', repType:'range', hasWeight:true,  alts:['Chest Fly Machine','Cable Fly','Dumbbell Fly']},
  lib_cablecurl:  {name:'Cable Curl',                  muscle:'biceps',        role:'iso',      free:false, rmMult:0.85*0.60, sets:3, reps:12, scheme:'3×10-15', repType:'range', hasWeight:true,  alts:['Barbell Curl','Incline Dumbbell Curl','Hammer Curl']},
  lib_dbkick:     {name:'Dumbbell Kickback',           muscle:'triceps',       role:'iso',      free:true,  rmMult:0.85*0.40, sets:3, reps:14, scheme:'3×12-15', repType:'range', hasWeight:true,  alts:['Cable Pushdown','Overhead Triceps Extension','Bench Dips']},
  lib_arnold:     {name:'Arnold Press',                muscle:'shoulders',     role:'compound', free:true,  rmMult:0.85*0.55, sets:3, reps:10, scheme:'3×8-12',  repType:'range', hasWeight:true,  alts:['Dumbbell OHP','Shoulder Press Machine','Smith Machine Shoulder']},
  lib_landmine:   {name:'Landmine Press',              muscle:'shoulders',     role:'compound', free:true,  rmMult:0.85*0.55, sets:3, reps:10, scheme:'3×8-12',  repType:'range', hasWeight:true,  alts:['Dumbbell OHP','Arnold Press','Smith Machine Shoulder']},
  lib_smithsquat: {name:'Smith Machine Squat',         muscle:'quads',         role:'compound', free:false, rmMult:0.85*0.70, sets:3, reps:8,  scheme:'3×6-10',  repType:'range', hasWeight:true,  alts:['Leg Press','Hack Squat','Goblet Squat']},
  lib_cablepress: {name:'Cable Chest Press',           muscle:'chest',         role:'compound', free:false, rmMult:0.85*0.60, sets:3, reps:10, scheme:'3×8-12',  repType:'range', hasWeight:true,  alts:['Chest Press Machine','Dumbbell Bench Press','Smith Machine Bench']},
};
Object.entries(NEW_EX).forEach(([id,e])=>{ EX[id]={id, gifUrl:'', alts:[], ...e}; });

// Orijinal set/tekrar şemalarını sakla (varsayılan program bunları kullanır).
// Üretilen programlar kendi şemalarını alır; varsayılana dönünce buradan geri yüklenir.
const _EX_ORIG = {};
Object.keys(EX).forEach(id=>{ _EX_ORIG[id]={sets:EX[id].sets, reps:EX[id].reps, scheme:EX[id].scheme, repType:EX[id].repType}; });
function _restoreSchemes(){ Object.keys(_EX_ORIG).forEach(id=>{ if(EX[id]) Object.assign(EX[id], _EX_ORIG[id]); }); }
function _applySchemes(schemes){ if(!schemes) return; Object.entries(schemes).forEach(([id,s])=>{ if(EX[id]) Object.assign(EX[id], s); }); }

// Üretilen program için hareket bazında set/tekrar şeması (zorluk + role göre)
function _genScheme(ex, diff){
  if(!ex.hasWeight || ex.role==='core'){
    return {sets:3, reps:0, scheme:'3×max', repType:'max'};
  }
  const compound = ex.role==='compound';
  const sets = diff==='advanced' ? 4 : 3;
  let lo, hi;
  if(compound){
    if(diff==='advanced'){ lo=5; hi=8; }
    else if(diff==='beginner'){ lo=8; hi=12; }
    else { lo=6; hi=10; }
  } else {
    if(diff==='advanced'){ lo=8; hi=12; }
    else { lo=10; hi=15; }
  }
  return {sets, reps:lo, scheme:`${sets}×${lo}-${hi}`, repType:'range'};
}

// 3) Bölünme → günlük "slot" şablonları (öncelik sırasıyla)
const _GEN_SLOT = {
  chest_c:['chest','compound'], chest_i:['chest','iso'],
  back_v:['back_v','compound'], back_h:['back_h','compound'],
  sho_c:['shoulders','compound'], sho_s:['shoulders_side','iso'],
  bi:['biceps','iso'], tri:['triceps','iso'],
  quad_c:['quads','compound'], quad_i:['quads','iso'],
  hinge:['hinge','compound'], glute:['glutes',null], core:['core',null],
};
const _GEN_TPL = {
  push:    ['chest_c','sho_c','chest_i','tri','sho_s','tri'],
  pull:    ['back_v','back_h','bi','sho_s','back_h','bi'],
  legs:    ['quad_c','hinge','quad_i','glute','core','quad_c'],
  upper:   ['chest_c','back_h','sho_c','bi','tri','back_v'],
  lower:   ['quad_c','hinge','quad_i','glute','core','hinge'],
  fullbody:['quad_c','chest_c','back_h','sho_c','core','hinge'],
};

// 4) Havuzdan hareket seç — önce program genelinde hiç kullanılmamışı, sonra gün-içi
//    kullanılmamışı, en son (havuz tükenmişse) rotasyonla tekrarı seçer.
let _genRot = {}, _genUsed = new Set();
function _genPick(muscle, role, usedInDay, bias){
  let pool = Object.values(EX).filter(e=> e.muscle===muscle && (role? e.role===role : true));
  if(!pool.length) return null;
  if(bias==='machine')      pool = pool.slice().sort((a,b)=> (a.free?1:0)-(b.free?1:0));
  else if(bias==='free')    pool = pool.slice().sort((a,b)=> (b.free?1:0)-(a.free?1:0));
  const key = muscle+':'+(role||'');
  const start = _genRot[key]||0;
  // 1. tercih: gün içinde VE program genelinde kullanılmamış (tekrarı en aza indir)
  for(let i=0;i<pool.length;i++){
    const c = pool[(start+i)%pool.length];
    if(!usedInDay.has(c.id) && !_genUsed.has(c.id)){ _genRot[key]=(start+i+1)%pool.length; usedInDay.add(c.id); _genUsed.add(c.id); return c.id; }
  }
  // 2. tercih: gün içinde kullanılmamış (program genelinde tekrar olabilir)
  for(let i=0;i<pool.length;i++){
    const c = pool[(start+i)%pool.length];
    if(!usedInDay.has(c.id)){ _genRot[key]=(start+i+1)%pool.length; usedInDay.add(c.id); _genUsed.add(c.id); return c.id; }
  }
  const c = pool[start%pool.length]; _genRot[key]=(start+1)%pool.length; return c.id;
}

// 5) Program üret → gün başına egzersiz-id listesi
function generateProgram(cfg){
  const split = cfg.split, days = Math.max(3, cfg.days||3);
  const diff = cfg.difficulty || 'intermediate';
  const gender = cfg.gender || '';
  const count = diff==='beginner' ? 4 : diff==='advanced' ? 6 : 5;
  const bias  = diff==='beginner' ? 'machine' : diff==='advanced' ? 'free' : '';
  const typeOf = d => split==='ppl'        ? ['push','pull','legs'][d%3]
                    : split==='upperlower' ? (d%2===0?'upper':'lower')
                    : 'fullbody';
  _genRot = {}; _genUsed = new Set();
  const out = [];
  for(let d=0; d<days; d++){
    const type = typeOf(d);
    let slots = _GEN_TPL[type].slice();
    let cnt = count;
    // Kadın vurgusu: alt vücut/bacak günlerine ekstra glute + set
    if(gender==='female' && (type==='legs' || type==='lower')){
      const gi = slots.indexOf('glute');
      slots.splice(gi+1, 0, 'glute');
      cnt = count + 1;
    }
    slots = slots.slice(0, cnt);
    const used = new Set(), ids = [];
    slots.forEach(sk=>{ const [m,r]=_GEN_SLOT[sk]; const id=_genPick(m,r,used,bias); if(id) ids.push(id); });
    out.push(ids);
  }
  return out;
}

// 6) State ile programı uygula / varsayılana dön
function applyProgramFromState(){
  _restoreSchemes();
  if(S.customProgram && Array.isArray(S.customProgram.generatedDays) && S.customProgram.generatedDays.length){
    DAYS = S.customProgram.generatedDays.map(a=>a.slice());
    S.dayCount = DAYS.length;
    _applySchemes(S.customProgram.schemes);
  } else {
    DAYS = DEFAULT_DAYS.map(a=>a.slice());
  }
}
function generateAndApply(cfg){
  const gen = generateProgram(cfg);
  const diff = cfg.difficulty||'intermediate';
  const schemes = {};
  new Set(gen.flat()).forEach(id=>{ if(EX[id]) schemes[id]=_genScheme(EX[id], diff); });
  S.customProgram = {split:cfg.split, days:gen.length, difficulty:cfg.difficulty, gender:cfg.gender, generatedDays:gen, schemes};
  DAYS = gen.map(a=>a.slice());
  S.dayCount = gen.length;
  S.dayEdits = {}; // yeni program = temiz gün listeleri
  if(S.currentDay>=S.dayCount) S.currentDay=0;
  _restoreSchemes();
  _applySchemes(schemes);
  saveS();
}
function useDefaultProgram(){
  S.customProgram = null;
  DAYS = DEFAULT_DAYS.map(a=>a.slice());
  _restoreSchemes();
  S.dayEdits = {}; // varsayılana dönünce gün düzenlemeleri temizlenir
  if(!S.dayCount || S.dayCount<3) S.dayCount=3;
  saveS();
}
// Geçerli haftalık gün sayıları (tüm bölünmeler için 3-5)
function validDaysForSplit(split){ return split==='default' ? [3,4,5] : [3,4,5,6,7]; }