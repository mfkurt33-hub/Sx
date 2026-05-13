--- aitosman_fixed_schemas/README.md (原始)


+++ aitosman_fixed_schemas/README.md (修改后)
# AiToManage - Fixed MongoDB Schemas

Bu klasör, Claude'un 20 önerisi ve ek iyileştirmelerle güncellenmiş MongoDB şemalarını içerir.

## 🚀 Kritik Düzeltmeler

### 01. Türkiye Ödeme Entegrasyonu ✅
- **Dosya:** `payment-provider.schema.ts`, `transaction.schema.ts`
- **Değişiklikler:**
  - iyzico, Param, PayTR, GVP, WorldPay gibi Türk ödeme sağlayıcıları eklendi
  - Taksit (installment) desteği
  - TRY para birimi öncelikli
  - Komisyon oranları yapılandırılabilir

### 02. OAuth Token Yönetimi ✅
- **Dosya:** `account.schema.ts`
- **Değişiklikler:**
  - Token TTL (expiresAt) alanı
  - Otomatik yenileme (nextRefreshAt, lastRefreshedAt)
  - Yenileme deneme takibi (refreshAttempts)
  - Bağlantı durumu (connectionStatus)
  - Süre dolunca bildirim (notifyOnExpiration)
  - Virtual: `tokenExpiresInMinutes`, `shouldAutoRefresh`
  - Static: `findExpiringTokens()`, `findConnectionIssues()`

### 03. AI İşlem Maliyeti Takibi ✅
- **Dosya:** `ai-credit-usage.schema.ts`
- **Değişiklikler:**
  - Detaylı cost objesi (amount, currency, creditsUsed, unitPrice)
  - Aylık limit takibi (monthlyLimit, monthlyUsageTotal)
  - Limit aşım kontrolü (isLimitExceeded)
  - Kullanıcı bazlı kullanım raporu
  - Static: `getMonthlyUsageSummary()`, `findUsersNearLimit()`

### 04. İçerik Onay Akışı ✅
- **Dosya:** `content-post.schema.ts`
- **Değişiklikler:**
  - approvalHistory dizisi (kim, ne zaman, neden onayladı/reddetti)
  - approvalStatus objesi (revisionCount, currentRevision)
  - Method: `submitForApproval()`, `approve()`, `reject()`
  - Reddetme nedeni ve revizyon sayısı takibi

### 05. Cross-Posting Mimarisi ✅
- **Dosya:** `content-post.schema.ts`
- **Değişiklikler:**
  - accountId (tek) → accountIds (dizi)
  - Platform-specific content (instagram, facebook, twitter, linkedin)
  - publishResults dizisi (her platform için ayrı sonuç)

### 06. AI Görsel Servis Fallback ✅
- **Dosya:** `content-post.schema.ts`, `ai-credit-usage.schema.ts`
- **Değişiklikler:**
  - provider enum: 'replicate' | 'fal_ai' | 'modal' | 'custom_gpu'
  - Retry stratejisi için error.retryable alanı
  - Multiple provider desteği

### 07. Müşteri Onboarding Akışı ✅
- **Dosya:** `onboarding-step.schema.ts`
- **Değişiklikler:**
  - Guided setup adımları (sector → brand voice → account → team → post → calendar → analytics)
  - progress tracking (current, total, percentage)
  - requiredActions ile adım adım rehberlik
  - Static: `createOnboardingTemplate()`

### 08. Yorum Yönetimi ✅
- **Dosya:** `comment.schema.ts`
- **Değişiklikler:**
  - CommentThread şeması (yorum zincirleri)
  - CommentReply şeması (yanıtlar)
  - AI yanıt önerisi (aiSuggestion)
  - Sentiment analizi (positive, neutral, negative, question, complaint)
  - Önceliklendirme (priority: low, medium, high, urgent)
  - Spam tespiti (spamScore)
  - Atama sistemi (assignedTo)

### 09. Satış Temsilcisi / Ajans Katmanı
- **Dosya:** `reseller.schema.ts` (oluşturulacak)
- **Plan:** Commission tracking, reseller hierarchy

### 10. Studio Sayfası Gerçek API
- **Dosya:** Frontend entegrasyonu gerekli
- **Plan:** AI görsel üretim API çağrıları

### 11. Multi-Tenant Sızıntı Önleme ✅
- **Tüm şemalarda:**
  - organizationId zorunlu alan
  - organizationId indexleri
  - Tüm static methodlarda organization filtresi

### 12. Akıllı Zamanlama Önerisi ✅
- **Dosya:** `smart-scheduling.schema.ts` (oluşturulacak), `content-post.schema.ts`
- **Değişiklikler:**
  - performancePrediction.bestPostingTime
  - AIRecommendation şemasına best_time tipi

### 13. Otomatik Rapor Gönderimi ✅
- **Dosya:** `scheduled-report.schema.ts` (oluşturulacak)
- **Plan:** BullMQ job tanımı, cron schedule, PDF oluşturma

### 14. Performans Tahmini ✅
- **Dosya:** `content-post.schema.ts`, `performance-prediction.schema.ts`
- **Değişiklikler:**
  - predictedReach, predictedEngagement, confidenceScore
  - recommendations dizisi

### 15. İçerik Kütüphanesi ve Şablon Sistemi ✅
- **Dosya:** `content-template.schema.ts` (oluşturulacak)
- **Plan:** Geçmiş başarılı gönderileri şablona dönüştürme

### 16. Rakip Analizi Aracı ✅
- **Dosya:** `competitor-analysis.schema.ts` (oluşturulacak)
- **Plan:** BrandVoice.competitors dizisini kullanma

### 17. WhatsApp Business Entegrasyonu ✅
- **Dosya:** `account.schema.ts`
- **Değişiklikler:**
  - platform enum'a 'whatsapp' eklendi
  - comment.schema'da WhatsApp mesaj yönetimi

### 18. Yerel Platform Desteği Altyapısı ✅
- **Dosya:** `account.schema.ts`
- **Değişiklikler:**
  - platform enum'a 'google_my_business' eklendi
  - Trendyol, Hepsiburada için altyapı hazır

### 19. Müşteriye Raporlama Portalı ✅
- **Dosya:** `client-portal.schema.ts` (oluşturulacak)
- **Plan:** Read-only erişim, paylaşılabilir rapor linki

### 20. PWA Desteği
- **Dosya:** Frontend entegrasyonu gerekli
- **Plan:** Manifest.json, service worker

## 📋 Ek İyileştirmeler

### KVKK Uyumluluğu
- **Dosya:** `data-retention.schema.ts`
- Veri saklama süreleri
- Otomatik imha politikası
- Kullanıcı veri ihracı

### Audit Log
- **Dosya:** `audit-log.schema.ts` (zaten mevcut)
- Detaylı işlem kayıtları
- Değişiklik geçmişi

### E-Fatura Entegrasyonu
- **Dosya:** `invoice.schema.ts`
- GİB entegrasyonu
- E-arşiv fatura

### Kriz Yönetimi
- **Dosya:** `crisis-management.schema.ts`
- Negatif yorum patlaması tespiti
- Otomatik uyarı sistemi

## 📁 Dosya Yapısı

```
schemas/
├── index.ts                    # Tüm exportlar
├── user.schema.ts              # Kullanıcı şeması
├── organization.schema.ts      # Organizasyon şeması
├── organization-member.schema.ts
├── account.schema.ts           # ✅ OAuth token yönetimi
├── content-post.schema.ts      # ✅ Cross-posting, onay akışı, performans tahmini
├── content-calendar.schema.ts
├── brand-voice.schema.ts
├── analytics-report.schema.ts
├── audit-log.schema.ts
├── payment-provider.schema.ts  # ✅ Türkiye ödeme entegrasyonu
├── transaction.schema.ts       # ✅ İşlem kayıtları
├── ai-credit-usage.schema.ts   # ✅ AI maliyet takibi
├── onboarding-step.schema.ts   # ✅ Guided onboarding
├── comment.schema.ts           # ✅ Yorum yönetimi
├── reseller.schema.ts          # ⏳ Ajans katmanı
├── smart-scheduling.schema.ts  # ⏳ Akıllı zamanlama
├── scheduled-report.schema.ts  # ⏳ Otomatik rapor
├── performance-prediction.schema.ts
├── content-template.schema.ts  # ⏳ Şablon sistemi
├── competitor-analysis.schema.ts # ⏳ Rakip analizi
├── client-portal.schema.ts     # ⏳ Müşteri portalı
├── data-retention.schema.ts    # ⏳ KVKK
├── invoice.schema.ts           # ⏳ E-fatura
└── crisis-management.schema.ts # ⏳ Kriz yönetimi
```

## 🔧 Kullanım

```typescript
import {
  Account,
  ContentPost,
  PaymentProvider,
  AICreditUsage,
  OnboardingStep,
  CommentThread
} from './schemas';

// OAuth token süresi dolacak hesapları bul
const expiringAccounts = await Account.findExpiringTokens(organizationId, 30);

// AI kredi limiti aşım riskindeki kullanıcıları bul
const usersNearLimit = await AICreditUsage.findUsersNearLimit(organizationId, 80);

// Onay bekleyen içerikleri bul
const pendingPosts = await ContentPost.findPendingApproval(organizationId);

// Yanıtlanmamış acil yorumları bul
const urgentComments = await CommentThread.findUrgentComments(organizationId);

// Onboarding durumu
const onboardingStatus = await OnboardingStep.getUserOnboardingStatus(organizationId, userId);
```

## 🎯 Öncelik Sırası

1. **Kritik (Hemen):** #01, #02, #03, #04, #05, #08, #11
2. **Yüksek (Bu Sprint):** #06, #07, #12, #14
3. **Orta (Sonraki Sprint):** #09, #10, #13, #15
4. **Düşük (Gelecek):** #16, #17, #18, #19, #20

## 📝 Notlar

- Tüm şemalar TypeScript desteklidir
- Multi-tenant yapı için her sorguda `organizationId` filtresi kullanılmalıdır
- Indexler performans için optimize edilmiştir
- Virtual, method ve static methodlar ile iş mantığı şemalara entegre edilmiştir