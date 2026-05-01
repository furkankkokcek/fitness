# FitTrack

**12 haftalık progresif yüklenme antrenman takipçisi**

![FitTrack Uygulama Ekranları](https://raw.githubusercontent.com/furkankkokcek/fitness/main/assets/preview.jpg)

Progressive Web App (PWA). Sunucu, build adımı ya da bağımlılık yok — doğrudan tarayıcıda çalışır.

## Özellikler

- **12 Haftalık Program** — Gün 1 / 2 / 3 bölümleriyle progresif yüklenme planı
- **Antrenman Süresi Sayacı** — İlk hareketin ilk setine değer girilince başlar, son set tamamlanınca durur
- **Dinlenme Zamanlayıcısı** — 1:00 / 1:30 / 2:00 ön ayarları, sesli alarm ve bildirim
- **Plank Kronometresi** — 5 saniyelik geri sayımdan sonra çalışan stopwatch
- **PR Takibi** — Kişisel rekorlar otomatik tespit edilir
- **Streak Sayacı** — Üst üste yapılan antrenmanları sayar
- **Haftalık Özet & Rapor** — Hafta tamamlanınca gün gün süre, hacim ve PR dökümü
- **Günlük Kalori Takibi** — Manuel giriş, barkod arama, AI yapıştır ve fotoğraf ile besin ekleme
- **Önceki Hafta Referansı** — Set inputlarının placeholder'ı bir önceki haftanın değerlerini gösterir
- **Hareket Değiştirme** — Her hareket için o haftaya özel alternatif seçilebilir
- **Bildirim Desteği** — Service Worker üzerinden push bildirim
- **Açık / Koyu Tema**
- **Dışa / İçe Aktar** — JSON yedek alma ve geri yükleme
- **Tamamen Çevrimdışı** — Tüm veri `localStorage`'da, uygulama Service Worker ile cache'lenir
- **Mobil Optimize** — Standalone PWA olarak yüklenebilir (iOS + Android)

## Proje Yapısı

```
fitness/
├── index.html                  # Minimal HTML shell
├── manifest.json               # PWA manifest
├── sw.js                       # Service Worker (root'ta olmalı)
│
├── css/
│   ├── base.css                # CSS değişkenleri, reset, html/body
│   ├── app.css                 # Nav, sayfalar, input/buton genel stilleri
│   └── components/
│       ├── modal.css           # .mo, .ms, .ob genel modal stilleri
│       ├── nutrition.css       # Kalori / besin ekranı stilleri
│       ├── program.css         # Program / set / hareket kart stilleri
│       ├── progress.css        # İlerleme grafikleri stilleri
│       ├── settings.css        # Ayarlar modal, toggle stilleri
│       └── timer.css           # Zamanlayıcı ekranı stilleri
│
├── js/
│   ├── data.js                 # Sabit veriler: EX, DAYS, EXERCISE_GIFS
│   ├── store.js                # State (S), saveS, loadS, saveDraft
│   ├── utils.js                # Yardımcı fonksiyonlar
│   ├── api.js                  # HTTP yardımcıları (fetchWithRetry)
│   ├── init.js                 # Uygulama başlatma / bootstrap
│   ├── sw-register.js          # Service Worker kaydı
│   └── components/
│       ├── nutrition.js        # Kalori & besin takibi
│       ├── profile.js          # Profil, tema, ayarlar, içe/dışa aktarma
│       ├── program-helpers.js  # Streak, PR, haftalık özet/rapor
│       ├── program.js          # Program ekranı, set girişleri, gün tamamlama
│       ├── progress.js         # İlerleme grafikleri
│       ├── setup.js            # Kurulum ekranı, başlangıç değerleri
│       ├── swap.js             # Hareket değiştirme modalı
│       └── timer.js            # Dinlenme zamanlayıcısı & plank kronometresi
│
├── assets/
│   ├── preview.png             # Uygulama ekran görüntüsü (README)
│   └── icons/
│       ├── icon-192.png        # PWA ikonu
│       └── icon-512.png        # PWA ikonu (splash screen)
│
└── exercises/                  # Hareket GIF'leri (GitHub raw URL üzerinden yüklenir)
```

## Veri Saklama

Tüm antrenman verisi tarayıcının `localStorage`'ında `ft_v10` anahtarı altında tutulur. Ayarlar → Veri Yönetimi bölümünden JSON olarak yedekleyip geri yükleyebilirsin.

## Yerel Geliştirme

```bash
cd fitness
python3 -m http.server 8000
# http://localhost:8000 adresini aç
```

## Sürüm Yönetimi

`main` branch'e her merge sonrası GitHub Actions otomatik olarak patch versiyonu artırır (`v2.0.X`). Versiyon `index.html` içindeki `Sürüm X.X.X` etiketinden okunur.

## Lisans

MIT
