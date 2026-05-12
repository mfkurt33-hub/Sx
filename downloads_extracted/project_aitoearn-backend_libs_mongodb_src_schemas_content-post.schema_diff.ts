--- project/aitoearn-backend/libs/mongodb/src/schemas/content-post.schema.ts (原始)


+++ project/aitoearn-backend/libs/mongodb/src/schemas/content-post.schema.ts (修改后)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContentPostDocument = ContentPost & Document;

/**
 * Gönderi Durumları
 * DRAFT: Taslak (Henüz kimse görmedi)
 * PENDING_APPROVAL: Onay bekliyor (Editör gönderdi, Patron bakacak)
 * APPROVED: Onaylandı (Yayınlanmaya hazır)
 * REJECTED: Reddedildi (Düzenleme gerekir)
 * SCHEDULED: Zamanlandı (Belirli bir saatte yayınlanacak)
 * PUBLISHING: Yayınlanıyor (API'ye gönderildi)
 * PUBLISHED: Yayınlandı
 * FAILED: Yayınlanamadı (Hata oluştu)
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
 * IMAGE: Tek görsel
 * CAROUSEL: Birden fazla görsel/video
 * VIDEO: Reels/TikTok/Shorts
 * STORY: 24 saatlik hikaye
 * TEXT: Sadece metin (Twitter/LinkedIn)
 */
export enum PostType {
  IMAGE = 'image',
  CAROUSEL = 'carousel',
  VIDEO = 'video',
  STORY = 'story',
  TEXT = 'text',
}

/**
 * AI İşlem Geçmişi
 * Görselin nasıl değiştirildiğini tutar (Maliyet takibi ve geri alma için)
 */
@Schema({ _id: false })
export class AIProcessingLog {
  @Prop({ required: true })
  action: string; // 'upscale', 'background_remove', 'studio_enhance'

  @Prop()
  promptUsed?: string; // Kullanılan prompt

  @Prop()
  originalUrl?: string; // İşlenmeden önceki görsel

  @Prop()
  processedUrl?: string; // İşlendikten sonraki görsel

  @Prop()
  cost?: number; // API maliyeti (TL veya Kredi)

  @Prop({ default: Date.now })
  processedAt: Date;
}

@Schema({ timestamps: true })
export class ContentPost {
  /**
   * Organizasyon ID (Çok kiracılık için zorunlu)
   * Her veri bu ID ile izole edilir.
   */
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  /**
   * Hangi sosyal medya hesabına gönderilecek?
   */
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  accountId: Types.ObjectId;

  /**
   * Gönderiyi oluşturan kullanıcı
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdById: Types.ObjectId;

  /**
   * Gönderiyi onaylayan kullanıcı (Admin/Owner)
   */
  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedById?: Types.ObjectId;

  /**
   * Gönderi Tipi (Resim, Video, Story vb.)
   */
  @Prop({ type: String, enum: PostType, default: PostType.IMAGE })
  type: PostType;

  /**
   * Gönderi Başlığı / Metni
   * AI tarafından önerilen, kullanıcı tarafından düzenlenebilen metin.
   */
  @Prop({ required: true })
  caption: string;

  /**
   * Hashtagler (Array olarak tutulur)
   * AI trend analizine göre otomatik eklenir.
   */
  @Prop([String])
  hashtags: string[];

  /**
   * Medya URL'leri
   * Tek resim, carousel veya video için dizi.
   * S3 veya Cloudinary URL'leri buraya gelir.
   */
  @Prop([String], { required: true })
  mediaUrls: string[];

  /**
   * İlk hammadde görseli (Kullanıcının çektiği amatör fotoğraf)
   * Arşivleme ve karşılaştırma için saklanır.
   */
  @Prop()
  rawMediaUrl?: string;

  /**
   * Gönderi Durumu (Taslak, Onayda, Yayınlandı vb.)
   */
  @Prop({ type: String, enum: PostStatus, default: PostStatus.DRAFT })
  status: PostStatus;

  /**
   * Planlanan Yayın Tarihi
   * Boşsa hemen yayınlanır veya taslak kalır.
   */
  @Prop()
  scheduledAt?: Date;

  /**
   * Gerçekleşen Yayın Tarihi
   */
  @Prop()
  publishedAt?: Date;

  /**
   * Sosyal Medya Platform ID'si
   * Yayınlandıktan sonra Instagram/Twitter'dan dönen ID (Silme/düzenleme için gerekir)
   */
  @Prop()
  platformPostId?: string;

  /**
   * Platform Linki
   * Yayınlandıktan sonra oluşan public link (instagram.com/p/xyz...)
   */
  @Prop()
  platformUrl?: string;

  /**
   * AI İşleme Geçmişi
   * Fotoğrafın hangi aşamalardan geçtiğini tutar.
   */
  @Prop({ type: [AIProcessingLog], default: [] })
  aiProcessingHistory: AIProcessingLog[];

  /**
   * Reddetme Nedeni
   * Eğer onaylanmazsa, yönetici nedenini buraya yazar.
   */
  @Prop()
  rejectionReason?: string;

  /**
   * Hata Mesajı
   * Yayınlanırken bir hata oluşursa buraya yazılır.
   */
  @Prop()
  errorMessage?: string;

  /**
   * Konum Etiketi (Instagram için)
   * Örn: "Mersin Çarşısı"
   */
  @Prop()
  locationName?: string;

  /**
   * Etiketlenen Hesaplar
   * Örn: [@model_hesabi, @tasarimci]
   */
  @Prop([String])
  taggedUsers: string[];

  /**
   * Yorum Sayısı (Anlık özet - Detaylı analitik raporda da tutulur)
   */
  @Prop({ default: 0 })
  commentCount: number;

  /**
   * Beğeni Sayısı
   */
  @Prop({ default: 0 })
  likeCount: number;

  /**
   * Kaydetme Sayısı
   */
  @Prop({ default: 0 })
  saveCount: number;

  /**
   * Görüntülenme Sayısı (Reach/Impression)
   */
  @Prop({ default: 0 })
  viewCount: number;
}

export const ContentPostSchema = SchemaFactory.createForClass(ContentPost);

// Indexler: Performans için organizasyon ve duruma göre indeksleme
ContentPostSchema.index({ organizationId: 1, status: 1 });
ContentPostSchema.index({ organizationId: 1, scheduledAt: 1 });
ContentPostSchema.index({ accountId: 1, status: 1 });