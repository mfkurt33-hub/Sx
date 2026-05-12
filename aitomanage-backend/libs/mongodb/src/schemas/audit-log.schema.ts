import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type AuditLogDocument = AuditLog & Document

/**
 * İşlem Türleri
 */
export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  APPROVE = 'approve',
  REJECT = 'reject',
  PUBLISH = 'publish',
  SCHEDULE = 'schedule',
  CONNECT_ACCOUNT = 'connect_account',
  DISCONNECT_ACCOUNT = 'disconnect_account',
  INVITE_MEMBER = 'invite_member',
  REMOVE_MEMBER = 'remove_member',
  CHANGE_ROLE = 'change_role',
  PAYMENT = 'payment',
  EXPORT_DATA = 'export_data',
  AI_PROCESS = 'ai_process',
}

/**
 * Entity Türleri (Hangi varlık üzerinde işlem yapıldı?)
 */
export enum EntityType {
  ORGANIZATION = 'organization',
  USER = 'user',
  ACCOUNT = 'account',
  CONTENT_POST = 'content_post',
  COMMENT = 'comment',
  ANALYTICS_REPORT = 'analytics_report',
  CALENDAR_EVENT = 'calendar_event',
  TEMPLATE = 'template',
  BRAND_VOICE = 'brand_voice',
  SUBSCRIPTION = 'subscription',
}

/**
 * Değişiklik Detayı
 */
@Schema({ _id: false })
export class ChangeDetail {
  @Prop({ required: false })
  field?: string // Hangi alan değişti?

  @Prop({ required: false })
  oldValue?: any // Önceki değer

  @Prop({ required: false })
  newValue?: any // Yeni değer
}

/**
 * IP ve Cihaz Bilgileri
 */
@Schema({ _id: false })
export class DeviceInfo {
  @Prop({ required: false })
  ipAddress?: string

  @Prop({ required: false })
  userAgent?: string

  @Prop({ required: false })
  deviceType?: 'desktop' | 'mobile' | 'tablet'

  @Prop({ required: false })
  browser?: string

  @Prop({ required: false })
  os?: string

  @Prop({ required: false })
  country?: string

  @Prop({ required: false })
  city?: string
}

@Schema({ timestamps: true })
export class AuditLog {
  /**
   * Organizasyon ID (Çok kiracılık için zorunlu)
   */
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId

  /**
   * İşlemi Yapan Kullanıcı
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId

  /**
   * Kullanıcı Adı (Snapshot - kullanıcı silinse bile görünsün)
   */
  @Prop({ required: true })
  userName: string

  /**
   * Kullanıcı E-postası (Snapshot)
   */
  @Prop({ required: true })
  userEmail: string

  /**
   * İşlem Türü
   */
  @Prop({ required: true, enum: ActionType, index: true })
  action: ActionType

  /**
   * Entity Türü (Hangi varlık üzerinde işlem yapıldı?)
   */
  @Prop({ required: true, enum: EntityType, index: true })
  entityType: EntityType

  /**
   * Entity ID (İşlem yapılan varlığın ID'si)
   */
  @Prop({ required: true, index: true })
  entityId: string

  /**
   * Entity Adı (Snapshot - silinse bile görünsün)
   */
  @Prop({ required: false })
  entityName?: string

  /**
   * İşlem Başarılı mı?
   */
  @Prop({ required: true, default: true })
  isSuccess: boolean

  /**
   * Hata Mesajı (Eğer başarısızsa)
   */
  @Prop({ required: false })
  errorMessage?: string

  /**
   * Değişiklik Detayları
   */
  @Prop({ type: [ChangeDetail], default: [] })
  changes: ChangeDetail[]

  /**
   * IP ve Cihaz Bilgileri
   */
  @Prop({ type: () => DeviceInfo, required: false, default: {} })
  deviceInfo: DeviceInfo

  /**
   * Ek Meta Veriler
   */
  @Prop({ required: false, type: Object })
  metadata?: Record<string, any>

  /**
   * İşlem Notu (Kullanıcı tarafından girilen açıklama)
   */
  @Prop({ required: false })
  userNote?: string

  /**
   * Risk Skoru (Şüpheli aktivite tespiti için)
   */
  @Prop({ required: false, min: 0, max: 100, default: 0 })
  riskScore: number

  /**
   * Şüpheli Aktivite mi?
   */
  @Prop({ required: true, default: false })
  isSuspicious: boolean

  /**
   * İncelendi mi?
   */
  @Prop({ required: true, default: false })
  isReviewed: boolean

  /**
   * İnceleyen Admin
   */
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  reviewedBy?: Types.ObjectId | null

  /**
   * İnceleme Notu
   */
  @Prop({ required: false })
  reviewNotes?: string
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog)

// Indexler
AuditLogSchema.index({ organizationId: 1, createdAt: -1 }) // Organizasyon bazlı son işlemler
AuditLogSchema.index({ userId: 1, createdAt: -1 }) // Kullanıcı bazlı son işlemler
AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 }) // Entity bazlı geçmiş
AuditLogSchema.index({ action: 1, createdAt: -1 }) // İşlem türü bazlı
AuditLogSchema.index({ isSuccess: 1, createdAt: -1 }) // Başarısız işlemler için
AuditLogSchema.index({ isSuspicious: 1, isReviewed: 1 }) // Şüpheli ve incelenmemiş işlemler için
AuditLogSchema.index({ 'deviceInfo.ipAddress': 1 }) // IP bazlı sorgular için
