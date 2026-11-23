# Kariyer Pusulası — Yapay Zekâ Destekli Kariyer ve Mülakat Koçu

**Kariyer Pusulası**, adayların hedefledikleri rol ve deneyim seviyesine göre dinamik, **sıralı** (soru-cevap-takip döngülü) mülakat simülasyonu sunan; her yanıttan sonra **STAR metodu** ile yapılandırılmış geri bildirim veren; CV geliştirme, yetkinlik boşluğu (skill gap), portfolyo projesi, eğitim/kurs ve hobi odaklı ücretsiz topluluk etkinliği önerileri hazırlayan tam yığın (full-stack) bir kariyer koçluğu uygulamasıdır.

Öneriler, **Gemini (`gemini-4-hydrogen`)** ve **Google Search Grounding** (`googleSearch`) desteğiyle güncel web kaynaklarıyla doğrulanır; uydurma tarih, kontenjan veya sahte URL üretilmez.

---

## Temel Özellikler

- **Aday Profili ve Akıllı Doğrulama**: Hedef rol, deneyim seviyesi (`Stajyer`, `Yeni Mezun`, `Junior`, `Mid-Level`, `Senior`, `Kariyer Değişimi`), iş ilanı metni, özgeçmiş özeti, ilgi alanları/hobiler, şehir ve etkinlik formatı (`Çevrimiçi`, `Yüz Yüze`, `Hibrit`) alınır. Eksik veya çok kısa girdilerde alan bazlı yönlendirmeler sunulur. Hızlı test için 3 hazır profil şablonu içerir.
- **Sıralı Mülakat Simülasyonu**: Sorular tek seferde listelenmez; her aşamada tek bir soru yöneltilir. Adayın cevabına göre:
  - **Güçlü Yönler** ve **Eksik Kalan Noktalar** listelenir.
  - Cevap **STAR Metodu (Durum / Görev / Eylem / Sonuç)** çerçevesiyle yeniden yapılandırılır.
  - **"Daha Güçlü Nasıl Söylenebilirdi?"** örnek yanıtı sunulur.
  - Gerekli görüldüğünde **derinleştirici takip sorusu (follow-up)** açılır.
  - Tespit edilen zayıf yetkinlikler oturum boyunca toplanarak eğitim önerilerine aktarılır.
- **CV / Profil Geliştirme, Yetkinlik Boşluğu & Portfolyo Önerileri**: Hedef rol beklentileri ile adayın profilini karşılaştırarak öncelikli yetkinlik açıklarını, somut CV madde örneklerini ve uygulanabilir portfolyo projelerini üretir.
- **Yetkinlik Odaklı Kurs ve Eğitim Önerileri**: Mülakatta veya profil analizinde öne çıkan eksiklere yönelik kurs/eğitim türlerini, neden seçildiğini (hangi açığı kapatacağını), platform/alan mantığını ve arama anahtar kelimelerini sunar.
- **Hobi ve İlgi Alanı Odaklı Ücretsiz Etkinlik & Topluluklar**: Hobileri kariyerdeki **Sosyal Beceri**, **Üretkenlik** veya **İş-Yaşam Dengesi** katkısına bağlayan ücretsiz atölye, seminer ve topluluk formatları önerir. Şehir veya format eksikse kullanıcıdan ilgili detayı ister.
- **Google Arama ile Doğrulanmış Kaynaklar**: Analiz, kurs ve topluluk önerilerinde `groundingMetadata.groundingChunks` üzerinden doğrulanan bağlantılar tıklanabilir kaynak listesi olarak gösterilir.

---

## Teknoloji Yığını

| Katman | Teknoloji |
| :--- | :--- |
| **Arayüz** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons |
| **Derleyici** | Vite 8 (`@tailwindcss/vite`, `@vitejs/plugin-react`) |
| **Sunucu** | Node.js 22+, Express 4, `tsx` |
| **Yapay Zekâ** | `@google/genai` (`gemini-4-hydrogen` + `googleSearch` Grounding, `gemini-3.1-flash-lite` yedek model) |
| **Test** | Node.js yerleşik test koşucusu (`node:test` + `tsx`) |

---

## Proje Yapısı

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml                  # Otomatik lint, birim test ve derleme CI hattı
├── src/
│   ├── assets/images/              # Yerel görsel varlıklar (portre ve çalışma alanı kapağı)
│   ├── components/
│   │   ├── CareerAnalysisView.tsx  # CV iyileştirme, skill gap tablosu ve portfolyo önerileri
│   │   ├── CoursesView.tsx         # Zayıf yetkinlik odaklı kurs ve arama anahtarları
│   │   ├── EventsCommunityView.tsx # Hobi, şehir ve format odaklı topluluk etkinlikleri
│   │   ├── GroundedSourcesList.tsx # Google Search Grounding doğrulama bağlantıları
│   │   ├── InterviewCoachView.tsx  # Sıralı mülakat, STAR değerlendirmesi ve takip sorusu
│   │   ├── ProfileSetupView.tsx    # Profil kurulum formu, doğrulama ve hazır şablonlar
│   │   └── TopBar.tsx              # Üç bölgeli ana üst gezinme çubuğu
│   ├── data/
│   │   └── presets.ts              # Örnek aday profil şablonları
│   ├── services/
│   │   └── coachApi.ts             # Sunucu `/api/*` uç noktaları için istemci servisi
│   ├── types/
│   │   └── career.ts               # Paylaşılan TypeScript arayüzleri
│   ├── utils/
│   │   ├── grounding.ts            # Grounding URL temizleme ve tekilleştirme yardımcıları
│   │   ├── grounding.test.ts       # Grounding birim testleri
│   │   ├── validation.ts           # Form, mülakat yanıtı ve ilerleme hesaplama mantığı
│   │   └── validation.test.ts      # Doğrulama ve ilerleme birim testleri
│   ├── App.tsx                     # Ana uygulama durum yönetimi ve sekme koordinasyonu
│   ├── index.css                   # Tailwind CSS v4 ve tipografi tanımları
│   └── main.tsx                    # React giriş noktası
├── .env.example                    # Örnek ortam değişkenleri şablonu
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
├── index.html
├── metadata.json
├── package.json
├── server.ts                       # Express sunucusu, Gemini API rotaları ve Vite entegrasyonu
├── tsconfig.json
└── vite.config.ts
```

---

## Kurulum ve Yerel Çalıştırma

### Ön Koşullar

- **Node.js 22+** (yerleşik TypeScript desteği ve `node:test` için önerilir)
- Geçerli bir **Google Gemini API Anahtarı** (`GEMINI_API_KEY`)

### 1. Depoyu Klonlayın ve Bağımlılıkları Yükleyin

```bash
git clone <depo-adresi>
cd <proje-klasoru>
npm install
```

### 2. Ortam Değişkenlerini Yapılandırın

`.env.example` dosyasını `.env` olarak kopyalayın ve kendi API anahtarınızı ekleyin:

```bash
cp .env.example .env
```

`.env` içeriği:

```env
GEMINI_API_KEY="kendi_gemini_api_anahtariniz"
APP_URL="http://localhost:3000"
PORT="3000"
```

> **Güvenlik Notu:** `GEMINI_API_KEY` yalnızca sunucu tarafında (`server.ts`) kullanılır; tarayıcı paketine gömülmez ve `.env` dosyası `.gitignore` ile hariç tutulur.

### 3. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışır.

---

## Komutlar

| Komut | Açıklama |
| :--- | :--- |
| `npm run dev` | Express API + Vite geliştirme sunucusunu port `3000` üzerinde başlatır |
| `npm run lint` | `tsc --noEmit` ile tüm TypeScript tip denetimini çalıştırır |
| `npm test` | `src/utils/*.test.ts` birim testlerini çalıştırır |
| `npm run build` | Üretim arayüz paketini `dist/` klasörüne derler |
| `npm start` | Üretim modunda (`NODE_ENV=production npm start`) sunucuyu başlatır |

---

## Sunucu API Uç Noktaları

| Yöntem | Yol | Açıklama |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Sunucu durumu ve `GEMINI_API_KEY` yapılandırma kontrolü |
| `POST` | `/api/interview/start` | Aday profiline göre oturum planı ve ilk mülakat sorusunu üretir |
| `POST` | `/api/interview/evaluate` | Adayın yanıtını STAR metoduyla değerlendirir, gerekirse takip sorusu önerir |
| `POST` | `/api/interview/next` | Önceki yanıtlara göre sıradaki ana mülakat sorusunu üretir |
| `POST` | `/api/career/analyze` | Google Search Grounding destekli CV, skill gap ve portfolyo analizi üretir |
| `POST` | `/api/career/courses` | Zayıf yetkinliklere göre Google Search Grounding destekli kurs önerileri üretir |
| `POST` | `/api/career/events` | Hobi, şehir ve formata göre ücretsiz etkinlik/topluluk önerileri üretir |

---

## Katkıda Bulunma

Katkı süreci için [CONTRIBUTING.md](CONTRIBUTING.md) dosyasına göz atabilirsiniz.

## Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.
