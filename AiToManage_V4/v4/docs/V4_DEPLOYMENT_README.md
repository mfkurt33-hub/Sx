# AiToManage V4 — Kurulum ve Deployment Rehberi

## 📁 V4 Dosya Yapısı

```
v4/
├── schemas/
│   ├── reseller.schema.ts          #03 — Ajans/bayi katmanı
│   ├── invoice.schema.ts           #04 — E-fatura + GİB
│   ├── scheduled-report.schema.ts  #05 — Haftalık rapor motoru
│   ├── client-portal.schema.ts     #06 — Müşteri portalı
│   ├── content-template.schema.ts  #08 — İçerik şablon kütüphanesi
│   └── data-retention.schema.ts    #09 — KVKK politikası
├── services/
│   └── image-enhance.service.ts    #07 — Studio gerçek AI
├── scripts/
│   ├── migrate-businessid-to-organizationid.ts  #01 — businessId → organizationId
│   └── seed-special-days.ts                     #02 — Global özel gün verisi
└── config/
    ├── .env.example                #10 — Tüm environment değişkenleri
    └── docker-compose.yml          #10 — Servis altyapısı
```

---

## 🚀 Hızlı Başlangıç

### 1. Depoyu klonla ve bağımlılıkları yükle

```bash
git clone https://github.com/yourorg/aitomanage.git
cd aitomanage
cp v4/config/.env.example .env
# .env dosyasını düzenle — ZORUNLU alanları doldur
npm install
```

### 2. Servisleri başlat

```bash
# MongoDB + Redis + Backend + Frontend
docker compose -f v4/config/docker-compose.yml up -d

# Durumu kontrol et
docker compose ps
```

### 3. V4 Migration'ları çalıştır

```bash
# businessId → organizationId düzeltmesi (V3 şemalarından gelen)
npx ts-node v4/scripts/migrate-businessid-to-organizationid.ts

# Türkiye özel günleri seed verisi
npx ts-node v4/scripts/seed-special-days.ts

# Kuyumculuk içerik şablonları seed
npx ts-node v4/scripts/seed-content-templates.ts
```

### 4. Uygulamayı başlat

```bash
# Development
npm run dev

# Production
npm run build && npm start
```

---

## ✅ Kurulum Kontrol Listesi

### Zorunlu (bunlar olmadan başlamaz)

- [ ] `MONGODB_URI` — MongoDB bağlantı dizesi
- [ ] `REDIS_URL` — Redis (BullMQ için)
- [ ] `NEXTAUTH_SECRET` — En az 32 karakter
- [ ] `REPLICATE_API_TOKEN` — Studio AI özelliği
- [ ] `IYZICO_API_KEY` + `IYZICO_SECRET_KEY` — Ödeme

### Önemli (bazı özellikler çalışmaz)

- [ ] `FAL_KEY` — Replicate fallback
- [ ] `OPENAI_API_KEY` — AI caption üretimi
- [ ] `META_APP_ID` + `META_APP_SECRET` — Instagram/Facebook
- [ ] `SMTP_*` — Email bildirimleri

### Opsiyonel (gelişmiş özellikler)

- [ ] `WHATSAPP_*` — WhatsApp bot
- [ ] `EFATURA_*` — Otomatik e-fatura (launch öncesi tamamla)
- [ ] `SENTRY_DSN` — Hata takibi
- [ ] `PUSHER_*` — Gerçek zamanlı bildirimler

---

## 🔄 V3 → V4 Migration Notları

### Kırıcı Değişiklikler

| V3 | V4 | Etkilenen Koleksiyonlar |
|----|-----|------------------------|
| `businessId` | `organizationId` | whatsapp-bot, qr-menu, crisis-detector, voice-assistant, competitor-analysis, brand-consistency, cultural-calendar |
| `SpecialDay` tenant-specific | `isGlobal: true` global + tenant özel | cultural-calendar |

### Migration Komutu

```bash
# Önce backup al!
mongodump --uri="$MONGODB_URI" --out=./backup/$(date +%Y%m%d)

# Migrasyonu çalıştır
MONGODB_URI=your_uri npx ts-node v4/scripts/migrate-businessid-to-organizationid.ts
```

---

## 📦 Yeni Bağımlılıklar (V4)

```bash
# AI servisleri
npm install replicate @fal-ai/serverless-client

# Queue sistemi
npm install bullmq ioredis

# PDF oluşturma (haftalık rapor)
npm install puppeteer

# Email
npm install nodemailer @types/nodemailer
# veya
npm install resend

# Şifreleme (portal token)
# Node.js built-in crypto kullanılıyor, ek paket gerektirmez
```

---

## 🏗️ Servis Mimarisi

```
                    ┌─────────────────┐
                    │   Next.js App   │ :3000
                    │   (Frontend)    │
                    └────────┬────────┘
                             │ API çağrıları
                    ┌────────▼────────┐
                    │  NestJS Backend │ :3001
                    │   (REST API)    │
                    └──┬──────────┬───┘
                       │          │
              ┌────────▼─┐    ┌───▼──────────┐
              │ MongoDB  │    │    Redis     │
              │  :27017  │    │   :6379      │
              └──────────┘    └──────┬───────┘
                                     │
                            ┌────────▼────────┐
                            │  BullMQ Worker  │
                            │  (Arka plan     │
                            │   işlemleri)    │
                            └─────────────────┘
```

### BullMQ Queue'ları

| Queue | Açıklama | Cron |
|-------|----------|------|
| `scheduled-reports` | Haftalık rapor üretimi | Her gün 08:00 |
| `data-purge` | KVKK veri imhası | Her gün 02:00 |
| `token-refresh` | OAuth token yenileme | Her saat |
| `invoice-submit` | GİB e-fatura gönderimi | Her 15 dakika |

---

## 🔒 Güvenlik Kontrol Listesi

- [ ] `.env` dosyası `.gitignore`'da
- [ ] Production'da `NODE_ENV=production`
- [ ] MongoDB'de IP whitelist açık
- [ ] Redis şifresi ayarlı
- [ ] HTTPS sertifikası (Let's Encrypt)
- [ ] Rate limiting aktif
- [ ] Sentry veya benzeri hata takibi aktif
- [ ] Audit log şeması etkin
- [ ] KVKK veri saklama policy şeması kurulu

---

## 🇹🇷 Türkiye Uyumluluk Kontrol Listesi

- [ ] İyzico veya Param ödeme entegrasyonu (Stripe tek başına yetersiz)
- [ ] E-arşiv fatura entegrasyonu (`invoice.schema.ts`)
- [ ] KVKK veri saklama politikası (`data-retention.schema.ts`)
- [ ] Açık rıza kayıtları (`ConsentRecord`)
- [ ] Kullanıcı veri indirme ve silme talebi (`DataRequest`)
- [ ] Veri güvenliği bildirimi (BTK'ya kayıt gerekebilir)
- [ ] Kültürel takvim seed verisi yüklü

---

## 📞 Yardım ve Destek

- Dokümantasyon: `/docs`
- API referansı: `http://localhost:3001/api` (Swagger)
- Sorunlar: GitHub Issues
