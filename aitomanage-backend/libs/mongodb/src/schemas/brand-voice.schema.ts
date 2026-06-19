import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type BrandVoiceDocument = BrandVoice & Document

/**
 * İçerik Kategorileri
 */
export enum ContentCategory {
  PRODUCT_SHOWCASE = 'product_showcase', // Ürün tanıtımı
  PROMOTION = 'promotion', // Kampanya/İndirim
  EDUCATIONAL = 'educational', // Eğitici içerik
  BEHIND_THE_SCENES = 'behind_the_scenes', // Perde arkası
  CUSTOMER_STORY = 'customer_story', // Müşteri hikayesi
  INDUSTRY_NEWS = 'industry_news', // Sektör haberleri
  MOTIVATIONAL = 'motivational', // Motive edici
  ENTERTAINMENT = 'entertainment', // Eğlence
  EVENT = 'event', // Etkinlik
  HOLIDAY = 'holiday', // Tatil/Özel gün
}

/**
 * Ton Seçenekleri
 */
export enum ToneType {
  PROFESSIONAL = 'professional', // Profesyonel
  CASUAL = 'casual', // Samimi
  HUMOROUS = 'humorous', // Mizahi
  INSPIRATIONAL = 'inspirational', // İlham verici
  URGENT = 'urgent', // Acil
  FRIENDLY = 'friendly', // Arkadaşça
  AUTHORITATIVE = 'authoritative', // Otoriter
  EMPATHETIC = 'empathetic', // Empatik
}

/**
 * Rakip Hesap Bilgisi
 */
@Schema({ _id: false })
export class CompetitorAccount {
  @Prop({ required: true })
  name: string // Rakip marka adı

  @Prop({ required: false })
  instagramHandle?: string // Instagram kullanıcı adı

  @Prop({ required: false })
  facebookPage?: string // Facebook sayfası

  @Prop({ required: false })
  twitterHandle?: string // Twitter kullanıcı adı

  @Prop({ required: false })
  linkedInUrl?: string // LinkedIn profili

  @Prop({ required: false })
  tiktokHandle?: string // TikTok kullanıcı adı

  @Prop({ required: false })
  website?: string // Web sitesi

  @Prop({ required: false })
  notes?: string // Notlar
}

/**
 * Yasaklı Kelimeler / Konular
 */
@Schema({ _id: false })
export class ContentRestriction {
  @Prop({ required: true })
  word: string // Yasaklı kelime veya ifade

  @Prop({ required: false, default: 'exact' })
  type: 'exact' | 'contains' | 'regex' // Eşleşme tipi

  @Prop({ required: false })
  reason?: string // Neden yasaklandı?

  @Prop({ required: true, default: true })
  isActive: boolean // Aktif mi?
}

/**
* AI Prompt Şablonu - Marka sesi için özelleştirilmiş prompt'lar
*/
@Schema({ _id: false })
export class PromptTemplate {
  @Prop({ required: true })
  name: string // Şablon adı (örn: "Ürün Tanıtımı Caption")

  @Prop({ required: true })
  category: ContentCategory // Kategori

  @Prop({ required: true })
  template: string // Prompt şablonu ({product}, {feature} gibi değişkenler içerebilir)

  @Prop({ required: false })
  examples?: string[] // Örnek çıktılar

  @Prop({ required: true, default: true })
  isActive: boolean
}

@Schema({ timestamps: true })
export class BrandVoice {
  /**
   * Organizasyon ID
   */
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId

  /**
   * Marka Adı
   */
  @Prop({ required: true })
  brandName: string

  /**
   * Marka Açıklaması
   */
  @Prop({ required: true })
  description: string // Marka nedir, ne yapar?

  /**
   * Sektör
   */
  @Prop({ required: true })
  industry: string // Kuyumculuk, restoran, teknoloji vb.

  /**
   * Hedef Kitle
   */
  @Prop({ required: false })
  targetAudience?: string // Kimlere hitap ediyor? (örn: "25-45 yaş, orta-üst gelir")

  /**
   * Marka Kişiliği
   */
  @Prop({ required: false, default: [] })
  personality: string[] // (örn: ["güvenilir", "yenilikçi", "müşteri odaklı"])

  /**
   * Varsayılan Ton
   */
  @Prop({ required: false, enum: ToneType, default: ToneType.PROFESSIONAL })
  defaultTone: ToneType

  /**
   * Ton Ayarları (Kategori bazlı ton değişiklikleri)
   */
  @Prop({
    required: false,
    default: {},
    type: Map,
    of: String
  })
  toneByCategory: Map<string, ToneType> // Hangi kategoride hangi ton?

  /**
   * Anahtar Kelimeler (Sık kullanılan kelimeler)
   */
  @Prop([String])
  keywords: string[]

  /**
   * Yasaklı Kelimeler
   */
  @Prop({ type: [ContentRestriction], default: [] })
  restrictedWords: ContentRestriction[]

  /**
   * Örnek Metinler (AI eğitimi için)
   */
  @Prop([String])
  sampleTexts: string[] // Başarılı bulunmuş eski gönderiler, web sitesi metinleri vb.

  /**
   * Emoji Kullanım Tercihi
   */
  @Prop({ required: true, default: 'moderate' })
  emojiUsage: 'none' | 'minimal' | 'moderate' | 'heavy'

  /**
   * Hashtag Stratejisi
   */
  @Prop({ required: false, default: {} })
  hashtagStrategy: {
    minCount?: number // Minimum hashtag sayısı
    maxCount?: number // Maximum hashtag sayısı
    brandedHashtags?: string[] // Markaya özel hashtag'ler
    industryHashtags?: string[] // Sektöre özgü hashtag'ler
    avoidHashtags?: string[] // Kullanılmaması gereken hashtag'ler
  }

  /**
   * Rakipler
   */
  @Prop({ type: [CompetitorAccount], default: [] })
  competitors: CompetitorAccount[]

  /**
   * AI Prompt Şablonları
   */
  @Prop({ type: [PromptTemplate], default: [] })
  promptTemplates: PromptTemplate[]

  /**
   * Görsel Stil Rehberi
   */
  @Prop({ required: false })
  visualStyleGuide?: {
    primaryColors?: string[] // Ana renkler (hex kodları)
    secondaryColors?: string[] // İkincil renkler
    fonts?: string[] // Kullanılan fontlar
    filterPreference?: string // Filtre tercihi (doğal, sıcak, soğuk vb.)
    compositionStyle?: string // Kompozisyon stili (minimalist, yoğun vb.)
    logoPlacement?: string // Logo yerleşimi
  }

  /**
   * İçerik Pilierları (Temalar)
   */
  @Prop([String])
  contentPillars: string[] // (örn: ["Ürün Kalitesi", "Müşteri Memnuniyeti", "Sürdürülebilirlik"])

  /**
   * Call-to-Action Tercihleri
   */
  @Prop([String])
  preferredCTAs: string[] // (örn: ["Şimdi Al", "Detaylı Bilgi", "Bizi Arayın", "Mağazayı Ziyaret Et"])

  /**
   * Özel Talimatlar
   */
  @Prop({ required: false })
  specialInstructions?: string // AI için ek talimatlar (örn: "Asla fiyat verme", "Her zaman TL kullan")

  /**
   * Son Güncelleme Tarihi
   */
  @Prop({ required: false })
  lastUsedAt?: Date // En son ne zaman kullanıldı?

  /**
   * Kullanım Sayısı
   */
  @Prop({ required: false, default: 0 })
  usageCount: number // Kaç AI işleminde kullanıldı?
}

export const BrandVoiceSchema = SchemaFactory.createForClass(BrandVoice)

// Indexler
BrandVoiceSchema.index({ organizationId: 1 })
BrandVoiceSchema.index({ industry: 1 })
BrandVoiceSchema.index({ 'restrictedWords.isActive': 1 })
