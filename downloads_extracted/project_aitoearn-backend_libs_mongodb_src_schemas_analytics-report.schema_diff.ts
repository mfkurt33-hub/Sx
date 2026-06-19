--- project/aitoearn-backend/libs/mongodb/src/schemas/analytics-report.schema.ts (原始)


+++ project/aitoearn-backend/libs/mongodb/src/schemas/analytics-report.schema.ts (修改后)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnalyticsReportDocument = AnalyticsReport & Document;

/**
 * Rapor Türleri
 * DAILY: Günlük özet
 * WEEKLY: Haftalık özet
 * MONTHLY: Aylık detaylı rapor
 * CAMPAIGN: Kampanya özel raporu
 * POST_PERFORMANCE: Tek gönderi performansı
 */
export enum ReportType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CAMPAIGN = 'campaign',
  POST_PERFORMANCE = 'post_performance',
}

/**
 * Platform Metrikleri
 * Her platform için genel metrikler
 */
@Schema({ _id: false })
export class PlatformMetrics {
  @Prop({ default: 0 })
  followers: number; // Toplam takipçi sayısı

  @Prop({ default: 0 })
  following: number; // Takip edilen sayısı

  @Prop({ default: 0 })
  posts: number; // Toplam gönderi sayısı

  @Prop({ default: 0 })
  impressions: number; // Gösterim sayısı

  @Prop({ default: 0 })
  reach: number; // Erişim (unique kullanıcı)

  @Prop({ default: 0 })
  engagement: number; // Toplam etkileşim (like + comment + share + save)

  @Prop({ default: 0 })
  engagementRate: number; // Etkileşim oranı (%)

  @Prop({ default: 0 })
  profileViews: number; // Profil görüntülemeleri

  @Prop({ default: 0 })
  websiteClicks: number; // Web sitesi tıklamaları

  @Prop({ default: 0 })
  shares: number; // Paylaşım sayısı

  @Prop({ default: 0 })
  saves: number; // Kaydetme sayısı

  @Prop({ default: 0 })
  comments: number; // Yorum sayısı

  @Prop({ default: 0 })
  likes: number; // Beğeni sayısı

  @Prop({ default: 0 })
  videoViews: number; // Video izlenmeleri
}

/**
 * En İyi Performans Gösteren Gönderiler
 */
@Schema({ _id: false })
export class TopPost {
  @Prop({ required: true })
  postId: Types.ObjectId;

  @Prop()
  platformPostId?: string;

  @Prop({ required: true })
  caption: string;

  @Prop({ required: true })
  mediaUrl: string;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  comments: number;

  @Prop({ default: 0 })
  engagementRate: number;

  @Prop({ required: true })
  publishedAt: Date;
}

/**
 * Büyüme İstatistikleri
 */
@Schema({ _id: false })
export class GrowthStats {
  @Prop({ default: 0 })
  followerGrowth: number; // Yeni takipçi sayısı

  @Prop({ default: 0 })
  followerGrowthRate: number; // Büyüme oranı (%)

  @Prop({ default: 0 })
  engagementGrowth: number; // Etkileşim artışı

  @Prop({ default: 0 })
  reachGrowth: number; // Erişim artışı
}

/**
 * Öneriler (AI tarafından oluşturulan)
 */
@Schema({ _id: false })
export class AIRecommendation {
  @Prop({ required: true })
  type: 'best_time' | 'content_type' | 'hashtag' | 'caption_style';

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  confidenceScore?: number; // Güven skoru (0-1)
}

@Schema({ timestamps: true })
export class AnalyticsReport {
  /**
   * Organizasyon ID (Çok kiracılık için zorunlu)
   */
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  /**
   * Hangi sosyal medya hesabı için?
   */
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true, index: true })
  accountId: Types.ObjectId;

  /**
   * Rapor Türü
   */
  @Prop({ type: String, enum: ReportType, required: true })
  reportType: ReportType;

  /**
   * Rapor Dönemi Başlangıcı
   */
  @Prop({ required: true })
  startDate: Date;

  /**
   * Rapor Dönemi Bitişi
   */
  @Prop({ required: true })
  endDate: Date;

  /**
   * Platform Adı
   * instagram, facebook, twitter, linkedin, tiktok
   */
  @Prop({ required: true })
  platform: string;

  /**
   * Genel Metrikler
   */
  @Prop({ type: PlatformMetrics, default: () => ({}) })
  metrics: PlatformMetrics;

  /**
   * Büyüme İstatistikleri
   */
  @Prop({ type: GrowthStats, default: () => ({}) })
  growthStats: GrowthStats;

  /**
   * En İyi Performans Gösteren Gönderiler (Top 5)
   */
  @Prop({ type: [TopPost], default: [] })
  topPosts: TopPost[];

  /**
   * En Kötü Performans Gösteren Gönderiler (Top 5)
   */
  @Prop({ type: [TopPost], default: [] })
  worstPosts: TopPost[];

  /**
   * AI Önerileri
   * "En iyi paylaşım saati 19:00-21:00 arası"
   * "Video içerikleri %30 daha fazla etkileşim alıyor"
   */
  @Prop({ type: [AIRecommendation], default: [] })
  aiRecommendations: AIRecommendation[];

  /**
   * Rapor Oluşturulma Tarihi
   */
  @Prop({ default: Date.now })
  generatedAt: Date;

  /**
   * Raporu Oluşturan (Sistem veya Kullanıcı)
   */
  @Prop({ type: Types.ObjectId, ref: 'User' })
  generatedBy?: Types.ObjectId;

  /**
   * Rapor PDF URL'si
   * Eğer PDF olarak dışa aktarıldıysa, dosya yolu.
   */
  @Prop()
  pdfUrl?: string;

  /**
   * Rapor Email ile Gönderildi mi?
   */
  @Prop({ default: false })
  emailedToClient: boolean;

  /**
   * Email Gönderilme Tarihi
   */
  @Prop()
  emailedAt?: Date;

  /**
   * Notlar (Kullanıcı tarafından eklenen)
   */
  @Prop()
  notes?: string;
}

export const AnalyticsReportSchema = SchemaFactory.createForClass(AnalyticsReport);

// Indexler: Rapor sorguları için optimize edilmiş
AnalyticsReportSchema.index({ organizationId: 1, accountId: 1, reportType: 1, startDate: -1 });
AnalyticsReportSchema.index({ organizationId: 1, platform: 1, startDate: -1 });