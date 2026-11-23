# Katkıda Bulunma Rehberi

**Kariyer Pusulası** projesine katkıda bulunmak istediğiniz için teşekkürler.

## Geliştirme Akışı

1. Depoyu fork edin ve yeni bir dal (branch) oluşturun:
   ```bash
   git checkout -b feat/yeni-ozellik
   ```
2. Bağımlılıkları yükleyin ve `.env.example` dosyasından `.env` oluşturun.
3. Değişikliklerinizi yaparken:
   - İş mantığı fonksiyonlarını `src/utils/` altında saf (pure) modüller olarak tutun ve `*.test.ts` dosyalarıyla test edin.
   - Gemini API çağrılarını yalnızca sunucu tarafında (`server.ts`) tutun; kesinlikle API anahtarlarını istemci koduna veya commit'lere eklemeyin.
4. Pull Request açmadan önce aşağıdaki kontrollerin tamamının geçtiğinden emin olun:
   ```bash
   npm run lint
   npm test
   npm run build
   ```
5. Değişikliklerinizi açıklayan net bir PR açıklaması ile gönderin.
