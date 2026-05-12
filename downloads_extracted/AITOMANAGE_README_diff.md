--- AITOMANAGE_README.md (原始)


+++ AITOMANAGE_README.md (修改后)
# AiToManage - Profesyonel Sosyal Medya Yönetim Platformu

## 🎯 Proje Hakkında

**AiToManage**, işletmelerin sosyal medya hesaplarını yapay zeka ile yönetebileceği, çok kiracılı (multi-tenant), B2B odaklı profesyonel bir SaaS platformudur.

### Kullanım Senaryosu: Salih Çetinkaya Kuyumculuk Örneği

1. **Satış Süreci**: Siz (Satış Temsilcisi) Salih Çetinkaya Kuyumculuk'a gidip platformu tanıtırsınız.
2. **Kurulum**: Salih Bey'e bir organizasyon hesabı oluşturulur.
3. **Instagram Bağlantısı**: Salih Bey, platforma OAuth 2.0 ile Instagram hesabını bağlar (kullanıcı adı/şifre gerekmez).
4. **Fotoğraf Yükleme**: Salih Bey amatör çekilmiş bir yüzük fotoğrafını yükler.
5. **AI Stüdyo**:
   - AI, fotoğrafı analiz eder
   - Arka planı temizler, ışığı düzeltir
   - Profesyonel stüdyo çekimi kalitesine dönüştürür
   - Maliyet etkin şekilde en uygun çözünürlüğü seçer
6. **İçerik Üretimi**:
   - AI, viral potansiyeli yüksek başlık önerir
   - Trend hashtag'leri otomatik ekler
   - Algoritma kurallarına uygun format seçer
7. **Otomatik Paylaşım**: Onaylandıktan sonra Instagram'da otomatik paylaşılır.
8. **AI Yorum Asistanı**:
   - Gelen yorumlar AI tarafından analiz edilir
   - Marka diline uygun yanıtlar otomatik hazırlanır
   - Salih Bey onaylarsa cevaplar gönderilir

## ✨ Temel Özellikler

### 🏢 Çok Kiracılık (Multi-Tenancy)
- Her işletme kendi verilerine sahip olur
- Organizasyon bazlı kullanıcı rolleri (Owner, Admin, Editor, Approver, Viewer)
- Veri izolasyonu ve güvenliği

### 🤝 Takım Çalışması
- Birden fazla kullanıcı aynı organizasyonda çalışabilir
- İçerik onay akışları
- Rol bazlı erişim kontrolü

### 📸 AI Görsel Stüdyosu
- Amatör fotoğrafları profesyonel kaliteye dönüştürme
- Arka plan temizleme
- Işık ve renk düzeltme
- Çözünürlük artırma (Upscale)
- Otomatik prompt oluşturma

### 📅 İçerik Takvimi
- Sürükle-bırak arayüzü
- Zamanlanmış yayınlar
- Toplu içerik yükleme

### 📊 Analitik Dashboard
- Etkileşim oranları
- Reach ve impression takibi
- ROI hesaplamaları
- PDF rapor oluşturma

### 💬 AI Yorum Asistanı
- Otomatik yorum analizi
- Marka diline uygun yanıt önerileri
- Duygu analizi (Sentiment Analysis)
- Kriz uyarıları

### 🔗 Sosyal Medya Entegrasyonları
- Instagram (Graph API)
- Facebook (Graph API)
- X/Twitter (API v2)
- LinkedIn
- TikTok

## 🛠️ Teknik Yapı

### Backend
- **Framework**: NestJS
- **Veritabanı**: MongoDB
- **Cache**: Redis
- **Queue**: BullMQ
- **Dil**: TypeScript

### Frontend
- **Framework**: Next.js 14+
- **UI**: Tailwind CSS + Shadcn/ui
- **Dil**: TypeScript
- **Dil Desteği**: Türkçe (varsayılan)

### AI Servisleri
- **Görsel İşleme**: Replicate API (Stable Diffusion, ControlNet)
- **Metin Üretimi**: OpenAI GPT-4 / Qwen
- **Vision AI**: Qwen VL (görsel analiz)

## 📦 Abonelik Planları

| Özellik | Ücretsiz | Başlangıç | Profesyonel | Kurumsal |
|---------|----------|-----------|-------------|----------|
| Fiyat | ₺0 | ₺299/ay | ₺799/ay | Özel |
| Organizasyon | 1 | 1 | 3 | Sınırsız |
| Sosyal Hesap | 3 | 10 | 25 | Sınırsız |
| Aylık Gönderi | 30 | 150 | 500 | Sınırsız |
| Takım Üyesi | 1 | 3 | 10 | Sınırsız |
| AI Görsel İyileştirme | ❌ | ✅ | ✅ | ✅ |
| Gelişmiş Analitik | ❌ | ❌ | ✅ | ✅ |
| Özel Destek | ❌ | ❌ | ❌ | ✅ |

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- MongoDB 6+
- Redis 7+
- pnpm

### Backend Kurulumu
```bash
cd project/aitoearn-backend
pnpm install
cp .env.example .env
# .env dosyasını düzenle
pnpm run start:dev
```

### Frontend Kurulumu
```bash
cd project/aitoearn-web
pnpm install
cp .env.example .env
# .env dosyasını düzenle
pnpm run dev
```

## 🔐 Güvenlik

- JWT tabanlı kimlik doğrulama
- OAuth 2.0 ile sosyal medya bağlantıları
- SSL/TLS şifreleme
- Role-based access control (RBAC)
- Audit logging

## 📱 Gelecek Özellikler

- [ ] Mobil uygulama (React Native)
- [ ] WhatsApp Business entegrasyonu
- [ ] YouTube Shorts desteği
- [ ] Canlı yayın yönetimi
- [ ] Influencer işbirlikleri modülü

## 📞 İletişim

- Web: [aitomanage.com](https://aitomanage.com)
- Email: info@aitomanage.com
- Telefon: +90 5XX XXX XX XX

---

**Not**: Bu proje, orijinal AiToEarn reposundan fork edilerek tamamen yeniden yapılandırılmıştır. Kripto/Web3 özellikleri kaldırılmış, işletme odaklı özellikler eklenmiştir.