import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type ContentPostDocument = ContentPost & Document

/**
 * Gönderi Durumları
 */
export enum PostStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SCHEDULED = 'scheduled',
  PUBLISHING = 'publishing',
  PUBLISHED = 'published',
  FAILED = 'failed',
}

/**
 * İçerik Türleri
 */
export enum PostType {
  IMAGE = 'image',
  CAROUSEL = 'carousel',
  VIDEO = 'video',
  STORY = 'story',
  TEXT = 'text',
}

/**
 * Onay Geçmişi - Kim onayladı, kim reddetti, neden?
 */
@Schema({ _id: false })
export class ApprovalHistoryItem {
  @Prop({ required: true })
  userId: Types.ObjectId // İşlemi yapan kullanıcı

  @Prop({ required: true })
  action: 'approved' | 'rejected' | 'commented'

  @Prop({ required: true, default: Date.now })
  timestamp: Date

  @Prop({ required: false })
  comment?: string // Yorum veya ret nedeni

  @Prop({ required: false })
  revisionNumber?: number // Kaçıncı revizyon?
}

/**
 * Cross-Posting - Birden fazla platforma aynı anda gönderim için
 */
@Schema({ _id: false })
export class CrossPostInfo {
  @Prop({ required: true, default: false })
  isCrossPost: boolean // Bu bir cross-post mu?

  @Prop({ required: false, default: [] })
  targetAccountIds: Types.ObjectId[] // Hedef hesaplar (Instagram + Facebook + X vb.)

  @Prop({ required: false, default: {} })
  platformSpecificContent: Record<string, {
    caption?: string // Platforma özel başlık
    hashtags?: string[] // Platforma özel hashtag'ler
    mediaUrls?: string[] // Platforma özel medya (farklı boyutlar)
  }>
}

/**
 * Performans Tahmini - AI ile yayın öncesi tahmin
 */
@Schema({ _id: false })
export class PerformancePrediction {
  @Prop({ required: false })
  predictedLikes?: number // Tahmini beğeni

  @Prop({ required: false })
  predictedComments?: number // Tahmini yorum

  @Prop({ required: false })
  predictedShares?: number // Tahmini paylaşım

  @Prop({ required: false })
  predictedReach?: number // Tahmini erişim

  @Prop({ required: false, min: 0, max: 100 })
  viralScore?: number // Viral potansiyel skoru (0-100)

  @Prop({ required: false })
  aiSuggestions?: string[] // AI iyileştirme önerileri

  @Prop({ required: false })
  bestTimeToPost?: Date // Önerilen yayın zamanı

  @Prop({ required: false })
  confidenceScore?: number // Tahmin güven skoru (0-1)
}

/**
 * AI İşlem Geçmişi - Maliyet takibi için detaylı log
 */
@Schema({ _id: false })
export class AIProcessingLog {
  @Prop({ required: true })
  action: string // 'upscale', 'background_remove', 'studio_enhance', 'caption_generate'

  @Prop({ required: false })
  provider?: string // Kullanılan AI sağlayıcı (Replicate, OpenAI, fal.ai)

  @Prop({ required: false })
  model?: string // Kullanılan model

  @Prop({ required: false })
  promptUsed?: string // Kullanılan prompt

  @Prop({ required: false })
  originalUrl?: string // İşlenmeden önceki görsel

  @Prop({ required: false })
  processedUrl?: string // İşlendikten sonraki görsel

  @Prop({ required: false, default: 0 })
  costInCredits?: number // Maliyet (AI kredisi cinsinden)

  @Prop({ required: false, default: 0 })
  costInTL?: number // Maliyet (TL cinsinden)

  @Prop({ required: false })
  processingTimeMs?: number // İşlem süresi (ms)

  @Prop({ required: false })
  status?: 'success' | 'failed' | 'retrying'

  @Prop({ required: false })
  errorMessage?: string // Hata mesajı

  @Prop({ default: Date.now })
  processedAt: Date
}

/**
 * Şablon Bilgisi - Başarılı gönderileri şablona dönüştürme
 */
@Schema({ _id: false })
export class TemplateInfo {
  @Prop({ required: false })
  isTemplate: boolean // Bu bir şablon mu?

  @Prop({ required: false })
  templateName?: string // Şablon adı

  @Prop({ required: false })
  templateCategory?: string // Kategori (bayram, kampanya, ürün tanıtımı vb.)

  @Prop({ required: false })
  usageCount?: number // Kaç kez kullanıldı?

  @Prop({ required: false })
  lastUsedAt?: Date // Son kullanım tarihi
}

@Schema({ timestamps: true })
export class ContentPost {
  /**
   * Organizasyon ID (Çok kiracılık için zorunlu)
   */
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId

  /**
   * Hangi sosyal medya hesabına/hesaplarına gönderilecek?
   * Cross-posting için array olarak da kullanılabilir
   */
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  accountId: Types.ObjectId

  /**
   * Cross-posting bilgileri
   */
  @Prop({ type: () => CrossPostInfo, required: false, default: {} })
  crossPostInfo: CrossPostInfo

  /**
   * Gönderiyi oluşturan kullanıcı
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdById: Types.ObjectId

  /**
   * Gönderiyi onaylayan kullanıcı (Admin/Owner)
   */
  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedById?: Types.ObjectId

  /**
   * Gönderi Tipi
   */
  @Prop({ type: String, enum: PostType, default: PostType.IMAGE })
  type: PostType

  /**
   * Gönderi Başlığı / Metni
   */
  @Prop({ required: true })
  caption: string

  /**
   * Hashtagler
   */
  @Prop([String])
  hashtags: string[]

  /**
   * Medya URL'leri
   */
  @Prop([String], { required: true })
  mediaUrls: string[]

  /**
   * İlk hammadde görseli
   */
  @Prop()
  rawMediaUrl?: string

  /**
   * Gönderi Durumu
   */
  @Prop({ type: String, enum: PostStatus, default: PostStatus.DRAFT })
  status: PostStatus

  /**
   * Planlanan Yayın Tarihi
   */
  @Prop()
  scheduledAt?: Date

  /**
   * Gerçekleşen Yayın Tarihi
   */
  @Prop()
  publishedAt?: Date

  /**
   * Sosyal Medya Platform ID'si
   */
  @Prop()
  platformPostId?: string

  /**
   * Platform Linki
   */
  @Prop()
  platformUrl?: string

  /**
   * AI İşleme Geçmişi - Maliyet takibi için
   */
  @Prop({ type: [AIProcessingLog], default: [] })
  aiProcessingHistory: AIProcessingLog[]

  /**
   * Toplam AI Maliyeti (bu gönderi için)
   */
  @Prop({ required: false, default: 0 })
  totalAiCostInCredits: number

  @Prop({ required: false, default: 0 })
  totalAiCostInTL: number

  /**
   * Onay Geçmişi
   */
  @Prop({ type: [ApprovalHistoryItem], default: [] })
  approvalHistory: ApprovalHistoryItem[]

  /**
   * Reddetme Nedeni
   */
  @Prop()
  rejectionReason?: string

  /**
   * Hata Mesajı
   */
  @Prop()
  errorMessage?: string

  /**
   * Konum Etiketi
   */
  @Prop()
  locationName?: string

  /**
   * Etiketlenen Hesaplar
   */
  @Prop([String])
  taggedUsers: string[]

  /**
   * Performans Tahmini (AI)
   */
  @Prop({ type: () => PerformancePrediction, required: false, default: {} })
  performancePrediction: PerformancePrediction

  /**
   * Şablon Bilgisi
   */
  @Prop({ type: () => TemplateInfo, required: false, default: {} })
  templateInfo: TemplateInfo

  /**
   * İstatistikler (Anlık özet)
   */
  @Prop({ default: 0 })
  commentCount: number

  @Prop({ default: 0 })
  likeCount: number

  @Prop({ default: 0 })
  saveCount: number

  @Prop({ default: 0 })
  viewCount: number

  @Prop({ default: 0 })
  shareCount: number

  @Prop({ default: 0 })
  reachCount: number
}

export const ContentPostSchema = SchemaFactory.createForClass(ContentPost)

// Indexler
ContentPostSchema.index({ organizationId: 1, status: 1 })
ContentPostSchema.index({ organizationId: 1, scheduledAt: 1 })
ContentPostSchema.index({ accountId: 1, status: 1 })
ContentPostSchema.index({ organizationId: 1, createdAt: -1 }) // Son gönderiler için
ContentPostSchema.index({ status: 1, scheduledAt: 1 }) // Zamanlanmış gönderiler için
ContentPostSchema.index({ 'templateInfo.isTemplate': 1 }) // Şablonları bulmak için
