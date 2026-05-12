# AiToManage Backend - MongoDB Schemas

Türkiye odaklı, B2B SaaS sosyal medya yönetim platformu için MongoDB şema tanımları.

## 🎯 Claude'un 20 Önerisi ile Yapılan İyileştirmeler

### Kritik Düzeltmeler (✅ Tamamlandı)

1. **✅ Türkiye'ye Özel Ödeme Entegrasyonu**
   - `Organization` şemasına `PaymentProvider` enum'u eklendi (iyzico, Param, Stripe)
   - iyzico ve Param için müşteri/abonelik anahtarları alanları eklendi

2. **✅ OAuth Token Yönetimi**
   - `Account` şemasına `OAuthTokenInfo` embedded schema eklendi
   - `tokenExpiresAt`, `lastRefreshedAt`, `refreshAttempts` alanları
   - Bağlantı kopunca bildirim için `NotificationSettings`

3. **✅ AI İşlem Maliyeti Takibi**
   - `ContentPost` şemasına `AIProcessingLog` detaylandırıldı
   - `costInCredits`, `costInTL`, `provider`, `model` alanları
   - Toplam maliyet takibi: `totalAiCostInCredits`, `totalAiCostInTL`

### Yüksek Öncelikli Geliştirmeler (✅ Tamamlandı)

4. **✅ İçerik Onay Akışı**
   - `ApprovalHistoryItem` embedded schema
   - Kim onayladı/reddetti, neden, kaç revizyon?

5. **✅ Cross-Posting Mimarisi**
   - `CrossPostInfo` embedded schema
   - `targetAccountIds` dizisi ile çoklu platform desteği
   - Platforma özel içerik (`platformSpecificContent`)

6. **✅ AI Görsel Servis Fallback**
   - `AIProcessingLog.provider` ve `.model` alanları
   - Retry stratejisi için `status: 'retrying'`

7. **✅ Müşteri Onboarding Akışı**
   - `OnboardingStatus` embedded schema
   - 5 adımlı guided setup takibi

8. **✅ Yorum Yönetimi Şeması**
   - Yeni `CommentThread` şeması oluşturuldu
   - Duygu analizi, AI yanıt önerileri, kriz tespiti

### Orta Öncelikli (✅ Tamamlandı)

9. **✅ Satış Temsilcisi/Ajans Katmanı**
   - `ResellerInfo` embedded schema
   - Komisyon oranı ve toplam kazanç takibi

10. **✅ Multi-Tenant Sızıntı Riski**
    - Tüm şemalarda zorunlu `organizationId` alanı
    - Indexler ile organizasyon bazlı sorgu optimizasyonu

11. **✅ Akıllı Zamanlama Önerisi**
    - `PerformancePrediction` embedded schema
    - `bestTimeToPost`, `predictedLikes`, `viralScore`

12. **✅ Otomatik Rapor Gönderimi Hazır Altyapı**
    - `AnalyticsReport` şemasında `emailedToClient`, `sentToEmails`
    - BullMQ job entegrasyonu için hazır alanlar

13. **✅ Performans Tahmini**
    - `PerformancePrediction` ile yayın öncesi AI tahmini
    - Viral skor ve iyileştirme önerileri

### Değer Artırıcı Özellikler (✅ Tamamlandı)

14. **✅ İçerik Kütüphanesi ve Şablon Sistemi**
    - `TemplateInfo` embedded schema
    - Başarılı gönderileri şablona dönüştürme

15. **✅ Rakip Analizi**
    - `BrandVoice.competitors` dizisi
    - `CompetitorComparison` analytics raporlarında

16. **✅ WhatsApp Business Hazırlığı**
    - `AccountType.WHATSAPP_BUSINESS`
    - `GOOGLE_MY_BUSINESS` desteği

17. **✅ Müşteriye Raporlama Portalı**
    - `AnalyticsReport.viewCount`, `lastViewedAt`
    - Shareable PDF rapor altyapısı

### Ekstra İyileştirmeler (Benim Eklediklerim)

18. **✅ KVKK Uyumluluğu**
    - `KVKKCompliance` embedded schema
    - Açık rıza kayıtları, IP adresi, tarih

19. **✅ Audit Log**
    - Detaylı işlem geçmişi
    - Şüpheli aktivite tespiti, risk skoru

20. **✅ Content Calendar**
    - Hatırlatmalar, tekrarlayan etkinlikler
    - WhatsApp bildirim desteği

## 📦 Şemalar

| Schema | Açıklama |
|--------|----------|
| `Organization` | Çok kiracılık, abonelik, ödeme, KVKK, onboarding |
| `Account` | Sosyal medya hesapları, OAuth token yönetimi |
| `ContentPost` | Gönderiler, cross-posting, AI maliyet, onay geçmişi |
| `ContentCalendar` | İçerik takvimi, hatırlatmalar |
| `AnalyticsReport` | Analitik raporlar, AI içgörüler, rakip karşılaştırma |
| `AuditLog` | Denetim logları, güvenlik |
| `BrandVoice` | Marka sesi, prompt şablonları, yasaklı kelimeler |
| `CommentThread` | Yorum yönetimi, duygu analizi, AI yanıtlar |

## 🚀 Kurulum

```bash
cd aitomanage-backend/libs/mongodb
pnpm install
pnpm run build
```

## 📝 Kullanım

```typescript
import { Organization, Account, ContentPost } from '@aitomanage/mongodb'

// Organizasyon oluşturma
const org = new Organization()
org.name = 'Salih Çetinkaya Kuyumculuk'
org.subscription.paymentProvider = PaymentProvider.IYZICO
org.kvkkCompliance.termsAccepted = true
```

## 🔐 Güvenlik Notları

- Tüm sorgularda `organizationId` filtresi zorunludur
- OAuth token'lar şifrelenmelidir (application layer)
- Audit log her kritik işlemde yazılmalıdır
- KVKK açık rızası olmadan veri işlenmemelidir
