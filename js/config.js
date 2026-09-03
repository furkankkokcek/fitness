// ============================================================
// AI AYARLARI — kalori sekmesindeki AI öğün analizi
// Model değiştirmek gerektiğinde tek yer burası.
// ============================================================

// Metin (besin listesi) analizi modeli
const AI_MEAL_MODEL = 'openai/gpt-oss-120b';

// Fotoğraf analizi modeli — gpt-oss-120b görsel girdi kabul etmediği için
// tabak fotoğrafı analizi ayrı bir vision modeliyle yapılır.
const AI_MEAL_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

// Groq API anahtarı kullanıcıdan alınır (AI modalindeki alan) ve
// S.groqKey içinde localStorage'da saklanır. Uygulama statik olarak
// yayınlandığı için anahtar koda GÖMÜLMEZ — buraya yazılan bir anahtar
// uygulamayı açan herkes tarafından okunabilir olurdu.
function groqKey(){
  return (typeof S !== 'undefined' && S && S.groqKey) ? String(S.groqKey).trim() : '';
}
