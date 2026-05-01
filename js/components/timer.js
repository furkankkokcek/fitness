let tTot=90,tRem=90,tInt=null,tRun=false;
const CIRC=578;

function setPreset(s,btn){
  document.querySelectorAll('.pb').forEach(b=>b.classList.remove('ap'));
  btn.classList.add('ap');
  if(!tRun){
    tTot=s; tRem=s;
    document.getElementById('t-btn').textContent='BAŞLAT';
    updTimer();
  } else {
    tTot=s;
  }
}
// Service Worker üzerinden bildirim gönder (Android'de daha güvenilir)
function sendNotification() {
  try {
    if (!("Notification" in window)) {
      console.warn("⚠️ Notification API desteklenmiyor");
      return;
    }
    
    if (Notification.permission === "granted") {
      // Service Worker var ve aktifse, bundan gönder
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification("FitTrack ⏱️", {
            body: "Dinlenme süresi doldu! Yeni sete hazır mısın? 💪",
            icon: "/fitness/icons/icon-192.png",
            badge: "/fitness/icons/icon-192.png",
            tag: "timer-complete",
            requireInteraction: false,
            vibrate: [200, 100, 200, 100, 200]
          }).catch(err => {
            console.error("SW Notification hatası:", err);
            // Fallback: doğrudan göster
            new Notification("FitTrack ⏱️", {
              body: "Dinlenme süresi doldu! Yeni sete hazır mısın? 💪"
            });
          });
        }).catch(err => {
          console.error("SW ready hatası:", err);
          // Fallback: doğrudan göster
          new Notification("FitTrack ⏱️", {
            body: "Dinlenme süresi doldu! Yeni sete hazır mısın? 💪"
          });
        });
      } else {
        // Fallback: Service Worker yoksa doğrudan göster
        new Notification("FitTrack ⏱️", {
          body: "Dinlenme süresi doldu! Yeni sete hazır mısın? 💪"
        });
      }
    } else {
      console.log("Bildirim izni yok");
    }
  } catch(e) {
    console.error("Bildirim gönderme hatası:", e);
  }
}

// Web Audio API ile lokal beep sesi üret (mobilde güvenilir)
function playAlarmSound() {
  try {
    const audioContext = window.audioContext || new (window.AudioContext || window.webkitAudioContext)();
    window.audioContext = audioContext;
    
    const now = audioContext.currentTime;
    const beepPattern = [
      { start: now, duration: 0.2 },
      { start: now + 0.3, duration: 0.2 },
      { start: now + 0.6, duration: 0.3 }
    ];
    
    beepPattern.forEach(beep => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.value = 1000;
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0.3, beep.start);
      gain.gain.exponentialRampToValueAtTime(0.01, beep.start + beep.duration);
      
      osc.start(beep.start);
      osc.stop(beep.start + beep.duration);
    });
    console.log("✅ Ses çalındı");
  } catch(e) {
    console.error("Ses çalma hatası:", e);
  }
}
function updTimer(){
  const m = Math.floor(tRem/60), s = tRem%60;
  
  // Ekrandaki süreyi güncelle
  document.getElementById('t-disp').textContent = m + ':' + (s<10 ? '0' : '') + s;
  
  // Halka animasyonunu ve rengini güncelle
  document.getElementById('t-ring').setAttribute('stroke-dashoffset', CIRC*(1-tRem/tTot));
  document.getElementById('t-ring').style.stroke = tRem<=10 ? '#f87171' : '#e8ff47';
  
  // Durum metnini güncelle (0 olduğunda "SÜRE BİTTİ!" yazacak şekilde ayarladım)
  document.getElementById('t-status').textContent = tRun 
    ? (tRem<=10 ? 'HAZIR OL!' : 'DİNLENİYORSUN') 
    : 'HAZIR';
}

function toggleTimer(){
  if(tRun){clearInterval(tInt);tRun=false;document.getElementById('t-btn').textContent='DEVAM';}
  else{
    if(tRem<=0){ tRem=tTot; }
    tRun=true;document.getElementById('t-btn').textContent='DURAKLAT';
    tInt=setInterval(()=>{
      tRem--;updTimer();
      if(tRem<=0){
        clearInterval(tInt);tRun=false;
        document.getElementById('t-btn').textContent='BAŞLAT';
        document.getElementById('t-status').textContent='SÜRE BİTTİ! 💪';
        
        // Vibrasyon
        if(navigator.vibrate)navigator.vibrate([200,100,200,100,200]);
        
        // Ses çal
        playAlarmSound();
        
        // Bildirim gönder
        sendNotification();
        
        tRem=tTot;
        updTimer();
      }
    },1000);
  }
  updTimer();
}
function ensureNotificationPermission() {
  return new Promise((resolve) => {
    if (!("Notification" in window)) {
      console.warn("⚠️ Notification API desteklenmiyor");
      resolve(false);
      return;
    }

    if (Notification.permission === "granted") {
      resolve(true);
      return;
    }

    if (Notification.permission === "denied") {
      console.log("Bildirim izni reddedilmiş");
      resolve(false);
      return;
    }

    // İzin iste
    Notification.requestPermission().then(permission => {
      resolve(permission === "granted");
    }).catch(e => {
      console.error("Bildirim izni istenemedi:", e);
      resolve(false);
    });
  });
}

function resetTimer(){clearInterval(tInt);tRun=false;tRem=tTot;document.getElementById('t-btn').textContent='BAŞLAT';updTimer();}

// Bildirim izni iste
if(document.getElementById('notify-btn')){
  document.getElementById('notify-btn').addEventListener('click', () => {
    ensureNotificationPermission().then(granted => {
      if(granted) {
        console.log('✅ Bildirim izni verildi');
        alert('✅ Bildirimler açıldı!');
      } else {
        console.log('❌ Bildirim izni reddedildi');
      }
    });
  });
}

// ============================================================
// PLANK KRONOMETRESİ — 5'ten geri say, sonra say
// ============================================================
let plankPhase='idle'; // idle | countdown | running
let plankCount=5, plankSec=0, plankInt=null;

function togglePlank(){
  if(plankPhase==='idle'){
    // Geri sayım başlat
    plankPhase='countdown';
    plankCount=5;
    document.getElementById('plank-display').textContent=plankCount;
    document.getElementById('plank-display').style.color='var(--warn)';
    document.getElementById('plank-status').textContent='HAZIRLAN!';
    document.getElementById('plank-btn').textContent='DURDUR';
    plankInt=setInterval(()=>{
      plankCount--;
      if(plankCount>0){
        document.getElementById('plank-display').textContent=plankCount;
        if(navigator.vibrate) navigator.vibrate(50);
      } else {
        // Geri sayım bitti — asıl kronometre başla
        clearInterval(plankInt);
        plankPhase='running';
        plankSec=0;
        document.getElementById('plank-display').style.color='var(--accent)';
        document.getElementById('plank-status').textContent='PLANK!';
        document.getElementById('plank-display').textContent='0:00';
        if(navigator.vibrate) navigator.vibrate([200,100,200]);
        plankInt=setInterval(()=>{
          plankSec++;
          const m=Math.floor(plankSec/60), s=plankSec%60;
          document.getElementById('plank-display').textContent=m+':'+(s<10?'0':'')+s;
        },1000);
      }
    },1000);
  } else {
    // Durdur
    clearInterval(plankInt);
    const wasSec=plankSec;
    plankPhase='idle';
    if(wasSec>0){
      document.getElementById('plank-status').textContent='TAMAMLANDI! 💪';
      document.getElementById('plank-btn').textContent='TEKRAR';
      if(navigator.vibrate) navigator.vibrate([200,100,200,100,200]);
      playAlarmSound();
    } else {
      resetPlank();
    }
  }
}

function resetPlank(){
  clearInterval(plankInt);
  plankPhase='idle'; plankCount=5; plankSec=0;
  document.getElementById('plank-display').textContent='5';
  document.getElementById('plank-display').style.color='var(--accent)';
  document.getElementById('plank-status').textContent='HAZIR';
  document.getElementById('plank-btn').textContent='BAŞLAT';
}

// Bildirim izni iste
if(document.getElementById('notify-btn')){
  document.getElementById('notify-btn').addEventListener('click', () => {
    ensureNotificationPermission().then(granted => {
      if(granted) {
        console.log('✅ Bildirim izni verildi');
        alert('✅ Bildirimler açıldı!');
      } else {
        console.log('❌ Bildirim izni reddedildi');
      }
    });
  });
}
