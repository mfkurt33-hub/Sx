import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type ContentCalendarDocument = ContentCalendar & Document

/**
 * Takvim Etkinlik Tipi
 */
export enum CalendarEventType {
  POST = 'post', // Normal gönderi
  STORY = 'story', // Hikaye
  CAMPAIGN = 'campaign', // Kampanya
  HOLIDAY = 'holiday', // Tatil/Özel gün
  DEADLINE = 'deadline', // İçerik teslim tarihi
  MEETING = 'meeting', // Toplantı
  REMINDER = 'reminder', // Hatırlatma
}

/**
 * Takvim Etkinliği - İçerik takvimi ve planlama için
 */
@Schema({ timestamps: true })
export class ContentCalendar {
  /**
   * Organizasyon ID (Çok kiracılık için zorunlu)
   */
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId

  /**
   * İlgili Gönderi ID (Eğer bir gönderi ile ilişkiliyse)
   */
  @Prop({ type: Types.ObjectId, ref: 'ContentPost', default: null })
  postId?: Types.ObjectId | null

  /**
   * Etkinlik Tipi
   */
  @Prop({ required: true, enum: CalendarEventType, default: CalendarEventType.POST })
  eventType: CalendarEventType

  /**
   * Başlık / Ad
   */
  @Prop({ required: true })
  title: string

  /**
   * Açıklama
   */
  @Prop({ required: false })
  description?: string

  /**
   * Başlangıç Tarihi/Saati
   */
  @Prop({ required: true, index: true })
  startDate: Date

  /**
   * Bitiş Tarihi/Saati (Eğer varsa)
   */
  @Prop({ required: false })
  endDate?: Date

  /**
   * İlgili Hesaplar
   */
  @Prop([{ type: Types.ObjectId, ref: 'Account' }])
  accountIds: Types.ObjectId[]

  /**
   * Oluşturan Kullanıcı
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdById: Types.ObjectId

  /**
   * Renk (Takvim görünümü için)
   */
  @Prop({ required: false, default: '#3B82F6' })
  color: string

  /**
   * Etiketler
   */
  @Prop([String])
  tags: string[]

  /**
   * Hatırlatma Ayarları
   */
  @Prop({ required: false, default: [] })
  reminders: {
    type: 'email' | 'push' | 'whatsapp'
    minutesBefore: number
    sent?: boolean
    sentAt?: Date
  }[]

  /**
   * Tekrarlama Ayarları (RRule formatında)
   */
  @Prop({ required: false })
  recurrenceRule?: string // iCal RRule formatı (örn: FREQ=WEEKLY;BYDAY=MO,WE,FR)

  /**
   * Tamamlandı mı?
   */
  @Prop({ required: true, default: false })
  isCompleted: boolean

  /**
   * Tamamlanma Tarihi
   */
  @Prop({ required: false })
  completedAt?: Date

  /**
   * Öncelik Seviyesi
   */
  @Prop({ required: false, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  priority: 'low' | 'medium' | 'high' | 'urgent'

  /**
   * Ek Dosyalar / Referanslar
   */
  @Prop([String])
  attachments: string[] // Dosya URL'leri

  /**
   * Özel Meta Veriler
   */
  @Prop({ required: false, type: Object })
  metadata?: Record<string, any>
}

export const ContentCalendarSchema = SchemaFactory.createForClass(ContentCalendar)

// Indexler
ContentCalendarSchema.index({ organizationId: 1, startDate: 1 })
ContentCalendarSchema.index({ organizationId: 1, endDate: 1 })
ContentCalendarSchema.index({ organizationId: 1, eventType: 1 })
ContentCalendarSchema.index({ postId: 1 })
ContentCalendarSchema.index({ organizationId: 1, 'reminders.sent': 1 }) // Gönderilmemiş hatırlatmalar için
