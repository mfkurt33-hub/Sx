--- project/aitoearn-backend/libs/mongodb/src/schemas/content-calendar.schema.ts (原始)


+++ project/aitoearn-backend/libs/mongodb/src/schemas/content-calendar.schema.ts (修改后)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContentCalendarDocument = ContentCalendar & Document;

/**
 * Takvim Etkinlik Türleri
 * POST: Normal gönderi
 * STORY: Hikaye
 * REEL: Reels/Shorts/TikTok
 * LIVE: Canlı yayın planı
 */
export enum CalendarEventType {
  POST = 'post',
  STORY = 'story',
  REEL = 'reel',
  LIVE = 'live',
}

@Schema({ timestamps: true })
export class ContentCalendar {
  /**
   * Organizasyon ID (Çok kiracılık için zorunlu)
   */
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  /**
   * İlgili Gönderi ID'si (ContentPost'a referans)
   * Eğer bu bir taslak veya planlanmış gönderiyse, ContentPost ID'si buraya gelir.
   */
  @Prop({ type: Types.ObjectId, ref: 'ContentPost' })
  postId?: Types.ObjectId;

  /**
   * Hangi sosyal medya hesabı için?
   */
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  accountId: Types.ObjectId;

  /**
   * Etkinlik Başlığı (Takvimde görünen kısa başlık)
   * Örn: "Yüzük Koleksiyonu Lansmanı"
   */
  @Prop({ required: true })
  title: string;

  /**
   * Etkinlik Açıklaması (İç notlar)
   * Sadece takım üyeleri görür, müşterilere görünmez.
   * Örn: "Bu gönderide yeni gelen elmas yüzükleri tanıtıyoruz, fiyat aralığı..."
   */
  @Prop()
  description?: string;

  /**
   * Etkinlik Türü
   */
  @Prop({ type: String, enum: CalendarEventType, default: CalendarEventType.POST })
  eventType: CalendarEventType;

  /**
   * Planlanan Tarih ve Saat
   * Takvimde bu tarihte gösterilir.
   */
  @Prop({ required: true, index: true })
  scheduledDate: Date;

  /**
   * Bitiş Tarihi (Opsiyonel)
   * Özellikle kampanyalar veya çok günlük etkinlikler için.
   */
  @Prop()
  endDate?: Date;

  /**
   * Renk Etiketi
   * Takvimde görsel ayırt etme için.
   * Örn: "blue" (Ürün), "red" (Kampanya), "green" (Eğlence)
   */
  @Prop({ default: 'blue' })
  colorCode: string;

  /**
   * Kampanya ID'si
   * Eğer bu gönderi bir kampanyaya aitse.
   */
  @Prop({ type: Types.ObjectId })
  campaignId?: Types.ObjectId;

  /**
   * Hatırlatma Ayarları
   * Yayınlanmadan önce kaç dakika/saat önce bildirim gönderilecek?
   */
  @Prop({ default: 30 })
  reminderMinutesBefore: number;

  /**
   * Tekrarlama Bilgisi
   * Örn: Her hafta aynı gün, her ay ilk gün vb.
   * Basit tekrarlar için: 'daily', 'weekly', 'monthly'
   * Karmaşık tekrarlar için JSON string (RRULE formatı)
   */
  @Prop()
  recurrenceRule?: string;

  /**
   * Oluşturan Kullanıcı
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdById: Types.ObjectId;

  /**
   * Durum
   * PLANNED: Planlandı
   * IN_PROGRESS: Hazırlanıyor
   * COMPLETED: Tamamlandı/Yayınlandı
   * CANCELLED: İptal edildi
   */
  @Prop({ type: String, default: 'planned' })
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';

  /**
   * Platform Hedefleri
   * Hangi platformlarda yayınlanacak? (Çapraz paylaşım için)
   */
  @Prop([String])
  targetPlatforms: string[]; // ['instagram', 'facebook', 'linkedin']
}

export const ContentCalendarSchema = SchemaFactory.createForClass(ContentCalendar);

// Indexler: Takvim sorguları için optimize edilmiş
ContentCalendarSchema.index({ organizationId: 1, scheduledDate: 1 });
ContentCalendarSchema.index({ accountId: 1, scheduledDate: 1 });
ContentCalendarSchema.index({ status: 1, scheduledDate: 1 });