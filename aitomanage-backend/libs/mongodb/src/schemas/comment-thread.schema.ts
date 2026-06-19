import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type CommentThreadDocument = CommentThread & Document

/**
 * Yorum Durumu
 */
export enum CommentStatus {
  PENDING = 'pending', // AI yanıt önerisi bekliyor
  APPROVED = 'approved', // Yanıt onaylandı ve gönderildi
  REJECTED = 'rejected', // Yanıt reddedildi
  IGNORED = 'ignored', // Yorum görmezden gelindi
  FLAGGED = 'flagged', // Kriz/olumsuz yorum - dikkat gerekli
}

/**
 * Duygu Analizi Sonucu
 */
@Schema({ _id: false })
export class SentimentAnalysis {
  @Prop({ required: false, enum: ['positive', 'neutral', 'negative', 'angry'], default: 'neutral' })
  sentiment: 'positive' | 'neutral' | 'negative' | 'angry'

  @Prop({ required: false, min: 0, max: 1 })
  confidenceScore?: number // Güven skoru (0-1)

  @Prop({ required: false })
  keywords?: string[] // Anahtar kelimeler

  @Prop({ required: false })
  isCrisis?: boolean // Kriz durumu mu? (örn: şikayet, tehdit)
}

/**
 * AI Yanıt Önerisi
 */
@Schema({ _id: false })
export class AIResponseSuggestion {
  @Prop({ required: false })
  suggestedText?: string // AI tarafından önerilen yanıt

  @Prop({ required: false })
  tone?: string // Ton (profesyonel, samimi, özür dileyici vb.)

  @Prop({ required: false })
  generatedAt?: Date // Öneri oluşturulma tarihi

  @Prop({ required: false })
  model?: string // Kullanılan AI modeli
}

/**
 * Yanıt Geçmişi
 */
@Schema({ _id: false })
export class ResponseHistoryItem {
  @Prop({ required: true })
  userId?: Types.ObjectId // Yanıtı gönderen kullanıcı

  @Prop({ required: false })
  responseText?: string // Gönderilen yanıt

  @Prop({ required: false })
  sentAt?: Date // Gönderilme tarihi

  @Prop({ required: false })
  platformResponseId?: string // Platformdan dönen yanıt ID

  @Prop({ required: false })
  isAIGenerated?: boolean // AI tarafından mı oluşturuldu?
}

/**
 * Yorum Thread (Konu) - Instagram/Facebook/Twitter yorumları için
 */
@Schema({ timestamps: true })
export class CommentThread {
  /**
   * Organizasyon ID
   */
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId

  /**
   * İlgili Gönderi ID
   */
  @Prop({ type: Types.ObjectId, ref: 'ContentPost', required: true, index: true })
  postId: Types.ObjectId

  /**
   * Hesap ID
   */
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  accountId: Types.ObjectId

  /**
   * Platform Yorum ID'si
   */
  @Prop({ required: true, index: true })
  platformCommentId: string

  /**
   * Platform Tipi
   */
  @Prop({ required: true, enum: ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube'] })
  platform: string

  /**
   * Yorumu Yapan Kullanıcı Bilgileri
   */
  @Prop({ required: false })
  commenterUsername?: string

  @Prop({ required: false })
  commenterName?: string

  @Prop({ required: false })
  commenterAvatar?: string

  @Prop({ required: false })
  commenterPlatformId?: string

  /**
   * Yorum Metni
   */
  @Prop({ required: true })
  text: string

  /**
   * Üst Yorum ID'si (Eğer bu bir yanıt ise)
   */
  @Prop({ type: Types.ObjectId, ref: 'CommentThread', default: null })
  parentCommentId?: Types.ObjectId | null

  /**
   * Yanıtlanan Kullanıcı (Eğer birine yanıt ise)
   */
  @Prop({ required: false })
  replyToUsername?: string

  /**
   * Yorum Durumu
   */
  @Prop({ required: true, enum: CommentStatus, default: CommentStatus.PENDING })
  status: CommentStatus

  /**
   * Duygu Analizi
   */
  @Prop({ type: () => SentimentAnalysis, required: false, default: {} })
  sentimentAnalysis: SentimentAnalysis

  /**
   * AI Yanıt Önerisi
   */
  @Prop({ type: () => AIResponseSuggestion, required: false, default: {} })
  aiSuggestion: AIResponseSuggestion

  /**
   * Yanıt Geçmişi
   */
  @Prop({ type: [ResponseHistoryItem], default: [] })
  responseHistory: ResponseHistoryItem[]

  /**
   * Yorum Tarihleri
   */
  @Prop({ required: true })
  platformCreatedAt: Date // Platformdaki orijinal yorum tarihi

  /**
   * Etkileşimler
   */
  @Prop({ required: false, default: 0 })
  likeCount: number

  @Prop({ required: false, default: 0 })
  replyCount: number

  /**
   * Gizlendi mi? (Spam veya uygunsuz içerik)
   */
  @Prop({ required: true, default: false })
  isHidden: boolean

  /**
   * Spam olarak işaretlendi mi?
   */
  @Prop({ required: true, default: false })
  isSpam: boolean

  /**
   * Önemli/Yıldızlı yorum mu?
   */
  @Prop({ required: true, default: false })
  isStarred: boolean // Müşteri tarafından önemli olarak işaretlendi mi?

  /**
   * Atanan Kullanıcı (Bu yorumu kim yanıtlayacak?)
   */
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedTo?: Types.ObjectId | null

  /**
   * Etiketler (Kategoriler)
   */
  @Prop([String])
  tags: string[] // 'soru', 'şikayet', 'teşekkür', 'sipariş', vb.

  /**
   * Son işlem tarihi
   */
  @Prop({ required: false })
  lastActionAt?: Date
}

export const CommentThreadSchema = SchemaFactory.createForClass(CommentThread)

// Indexler
CommentThreadSchema.index({ organizationId: 1, postId: 1 })
CommentThreadSchema.index({ organizationId: 1, status: 1 })
CommentThreadSchema.index({ organizationId: 1, platformCreatedAt: -1 }) // Son yorumlar için
CommentThreadSchema.index({ platformCommentId: 1 })
CommentThreadSchema.index({ 'sentimentAnalysis.isCrisis': 1 }) // Kriz yorumlarını bulmak için
CommentThreadSchema.index({ status: 1, assignedTo: 1 }) // Atanmamış yorumlar için
CommentThreadSchema.index({ tags: 1 })
