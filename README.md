# FitTrack

**12 haftalık progresif yüklenme antrenman takipçisi**

Tek dosyalık (HTML) bir Progressive Web App (PWA). Sunucu, build adımı ya da bağımlılık yok — `index.html` dosyasını aç, çalışır.

## Özellikler

- **12 Haftalık Program** — Push / Pull / Leg bölümleriyle progresif yüklenme planı
- **Antrenman Süresi Sayacı** — İlk hareketin ilk setine değer girilince başlar, son hareketin son seti tamamlanınca durur
- **Dinlenme Zamanlayıcısı** — 1:00 / 1:30 / 2:00 ön ayarları, sesli alarm ve bildirim
- **Plank Kronometresi** — 5 saniyelik geri sayımdan sonra çalışan stopwatch
- **PR Takibi** — Kişisel rekorlar otomatik tespit edilir
- **Streak Sayacı** — Üst üste yapılan antrenmanları sayar
- **Haftalık Özet** — Hafta tamamlanınca gün gün süre, hacim ve PR dökümü
- **Günlük Kalori Takibi** — Yiyecek ekleme ve toplam kalori hesabı
- **Bildirim Desteği** — Service Worker üzerinden push bildirim
- **Açık / Koyu Tema**
- **Tamamen Çevrimdışı** — Tüm veri `localStorage`'da, GIF'ler ve uygulama Service Worker ile cache'lenir
- **Mobil Optimize** — Standalone PWA olarak yüklenebilir

## Yapı

```
index.html        # Tüm uygulama (HTML + CSS + JS)
manifest.json     # PWA manifest
sw.js             # Service Worker (cache + bildirim)
exercises/        # Hareket GIF'leri
icons/            # PWA ikonları
```

## Veri Saklama

Tüm antrenman verisi tarayıcının `localStorage`'ında `ft_v10` anahtarı altında tutulur. Yedeklemek için ayarlar sayfasındaki dışa aktarma seçeneğini kullanabilirsin.

## Lisans

MIT
