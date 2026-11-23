# Kariyer Pusulası

**Kariyer Pusulası**, adayların **hedef rol**, **deneyim seviyesi** (`Stajyer`, `Yeni Mezun`, `Junior`, `Mid-Level`, `Senior`, `Kariyer Değişimi`) ve varsa **iş ilanı / özgeçmiş** bilgilerine göre dinamik ve **sıralı mülakat simülasyonu** gerçekleştiren; her yanıttan sonra **STAR metoduna** dayalı yapılandırılmış geri bildirim sunan; CV geliştirme, yetkinlik boşluğu (skill gap), portfolyo projesi, eğitim/kurs ve hobi odaklı ücretsiz topluluk etkinliği önerileri üreten yapay zekâ destekli kariyer ve mülakat koçudur.

**Canlı Uygulama (Render):** [https://kariyer-ve-m-lakat-ko-u.onrender.com/](https://kariyer-ve-m-lakat-ko-u.onrender.com/)

---

## Temel Özellikler ve Kriterler

### 1. Rol ve Seviye Odaklı Dinamik Sıralı Mülakat
- Sorular tek seferde listelenmez; adayın profiline ve seviyesine göre **sırayla (tek tek)** sorulur.
- Adayın verdiği cevabın derinliğine göre sistem gerek gördüğünde **derinleştirici takip sorusu (follow-up)** yöneltir.
- Boş, çok kısa veya yetersiz girdilerde kullanıcıyı nazik ve yönlendirici uyarılarla doğru cevaba teşvik eder.

### 2. STAR Metoduna Dayalı Geri Bildirim, CV ve Yetkinlik Analizi
- Her mülakat yanıtının ardından çıktı şu net yapıda sunulur:
  - **Güçlü Yönler**
  - **Eksik Kalan Noktalar**
  - **STAR Metodu Çerçevesi** (`Durum · Görev · Eylem · Sonuç`)
  - **"Daha Güçlü Nasıl Söylenebilirdi?"** örnek yanıtı
- **CV / Profil Geliştirme & Yetkinlik Boşluğu (Skill Gap) Analizi**: Hedef rol beklentileri ile adayın mevcut profili karşılaştırılarak önceliklendirilmiş eksikler, somut CV madde önerileri ve uygulanabilir portfolyo/proje fikirleri üretilir.

### 3. Zayıf Yetkinliklere Göre Gerekçeli Kurs ve Kaynak Önerileri
- Mülakat sırasında zayıf kaldığı tespit edilen yetkinliklere (örneğin iletişim netliği, sunum, veri analizi, araç/teknoloji derinliği) ve hedef role göre somut eğitim/kaynak türleri önerilir.
- Her öneride **neden bu kaynağın seçildiği ve hangi açığı kapatacağı** açıkça belirtilir; platform/alan mantığı ve doğrudan arama anahtar kelimeleri paylaşılır.
- **Google Search Grounding (`gemini-4-hydrogen` + `googleSearch`)** desteğiyle güncel eğitim platformları doğrulanır ve doğrulanan web bağlantıları listelenir.

### 4. İlgi Alanları ve Hobilere Göre Ücretsiz Etkinlik ve Topluluk Önerileri
- Kullanıcının ilgi alanlarına ve hobilerine göre ücretsiz atölyeler, seminerler, kulüp/topluluk buluşmaları veya açık etkinlik formatları önerilir.
- Her öneri, adayın kariyerindeki **Sosyal Beceri**, **Üretkenlik** veya **İş-Yaşam Dengesi** katkısına bağlanır.
- Emin olunmayan güncel tarih, kontenjan veya bağlantı uydurulmaz; gerektiğinde kullanıcıdan **şehir** ve **katılım formatı (Çevrimiçi / Yüz Yüze / Hibrit)** bilgisi istenir.

---

## Canlı Demo ve Telefona Kurulum (PWA / Ana Ekrana Ekle)

Uygulama Render üzerinde yayındadır ve masaüstü ile mobil tarayıcılardan doğrudan kullanılabilir:

1. **Canlı Web Adresini Açma:**
   - Tarayıcınızdan **[https://kariyer-ve-m-lakat-ko-u.onrender.com/](https://kariyer-ve-m-lakat-ko-u.onrender.com/)** adresini açın.
   - *(Ücretsiz Render planında servis 15 dakika kullanılmadığında uyku moduna geçer; ilk açılışta uyanması 30–50 saniye sürebilir.)*

2. **Android (Chrome) Üzerinden Telefona Kurulum:**
   - Web adresini Google Chrome ile açın.
   - Sağ üst köşedeki **üç nokta (`⋮`)** menüsüne dokunun.
   - **"Ana ekrana ekle"** (veya **"Uygulamayı yükle"**) seçeneğine basın ve onaylayın.
   - Uygulama ana ekranınıza simge olarak eklenir ve tam ekran mobil deneyimiyle açılır.

3. **iPhone / iPad (Safari) Üzerinden Telefona Kurulum:**
   - Web adresini **Safari** tarayıcısı ile açın.
   - Alt çubuktaki **Paylaş (`□↑`)** simgesine dokunun.
   - Aşağı kaydırıp **"Ana Ekrana Ekle"** seçeneğine dokunun ve sağ üstten **"Ekle"** deyin.

---

## Yerel Kurulum ve Çalıştırma

### Gereksinimler
- **Node.js 22+** (`package.json` içindeki `engines` ayarı ile uyumlu)
- Geçerli bir **Google Gemini API Anahtarı** (`GEMINI_API_KEY`)

### Adım Adım Kurulum

1. **Depoyu klonlayın ve klasöre girin:**
   ```bash
   git clone <depo-adresi>
   cd <proje-klasoru>
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Ortam değişkenleri dosyasını oluşturun:**
   ```bash
   cp .env.example .env
   ```
   Oluşturduğunuz `.env` dosyasını açıp kendi Gemini API anahtarınızı ekleyin:
   ```env
   GEMINI_API_KEY="kendi_gemini_api_anahtariniz"
   APP_URL="http://localhost:3000"
   PORT="3000"
   ```

4. **Uygulamayı geliştirme modunda başlatın:**
   ```bash
   npm run dev
   ```
   Tarayıcınızdan `http://localhost:3000` adresine giderek uygulamayı kullanabilirsiniz.

### Faydalı Komutlar

| Komut | Açıklama |
| :--- | :--- |
| `npm run dev` | Express arka uç + Vite geliştirme sunucusunu port `3000` üzerinde başlatır |
| `npm run lint` | `tsc --noEmit` ile TypeScript tip kontrolünü çalıştırır |
| `npm test` | `src/utils/*.test.ts` birim testlerini çalıştırır |
| `npm run build` | Üretim arayüz paketini `dist/` dizinine derler |
| `NODE_ENV=production npm start` | Derlenmiş uygulamayı üretim modunda başlatır |

---

## Render Üzerinde Yayınlama (Özet)

- **Build Command:** `npm install --include=dev && npm run build`
- **Start Command:** `NODE_ENV=production npm start`
- **Environment Variables:** `GEMINI_API_KEY` (kendi anahtarınız) ve `NODE_ENV=production`

---

## Güvenlik Notu

- **API Anahtarlarını Koda Gömmeyin:** `GEMINI_API_KEY` yalnızca sunucu tarafında (`server.ts`) `process.env.GEMINI_API_KEY` üzerinden okunur; tarayıcı/istemci tarafındaki kodlara veya `README.md` / `.env.example` gibi dosyalara kesinlikle yazılmamalıdır.
- **`.env` Dosyasını Koruyun:** Gerçek API anahtarınızı barındıran `.env` dosyası `.gitignore` içinde tanımlı `.env*` kuralı sayesinde GitHub’a gönderilmez (`!.env.example` şablonu hariç).
- **Canlı Ortamlar:** Render veya AI Studio gibi barındırma platformlarında anahtarınızı yalnızca platformun **Environment Variables / Secrets** panelinden tanımlayın.

---

## Mimari Özeti

```text
├── .github/workflows/ci.yml        # Otomatik lint, test ve build CI hattı
├── server.ts                       # Express API, Gemini (@google/genai) ve Google Search Grounding
├── src/
│   ├── App.tsx                     # Ana çalışma alanı ve sekme durum yönetimi
│   ├── components/                 # Modüler arayüz bileşenleri (Profil, Mülakat, Analiz, Kurs, Etkinlik)
│   ├── data/presets.ts             # Örnek aday profilleri
│   ├── services/coachApi.ts        # İstemci API çağrı katmanı
│   ├── types/career.ts             # Paylaşılan TypeScript tipleri
│   └── utils/                      # Saf doğrulama, ilerleme ve grounding yardımcıları + birim testleri
├── .env.example                    # Ortam değişkeni şablonu
├── .gitignore
├── LICENSE
└── package.json
```
