if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('sw.js', { scope: '/fitness/' })
    .then(reg => {
      console.log('✅ Service Worker başarıyla kaydedildi:', reg.scope);
      // Güncellemeleri kontrol et
      reg.onupdatefound = () => {
        const newWorker = reg.installing;
        newWorker.onstatechange = () => {
          if (newWorker.state === 'activated') {
            console.log('✅ Service Worker güncellendi');
          }
        };
      };
      // Düzenli olarak güncellemeleri kontrol et
      setInterval(() => reg.update(), 60000);
    })
    .catch(err => {
      console.error('❌ Service Worker kaydedilemedi:', err);
    });
  
  // Kontrol: Service Worker aktif mi?
  navigator.serviceWorker.ready.then(() => {
    console.log('✅ Service Worker hazır');
    // Bildirim izni kontrol et
    if ('Notification' in window) {
      console.log('Bildirim durumu:', Notification.permission);
    }
  }).catch(err => {
    console.error('❌ Service Worker hazır olmadı:', err);
  });
} else {
  console.warn('⚠️  Bu tarayıcı Service Worker desteklemiyor');
}
