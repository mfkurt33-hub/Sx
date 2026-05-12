--- project/aitoearn-backend/libs/mongodb/src/schemas/audit-log.schema.ts (原始)


+++ project/aitoearn-backend/libs/mongodb/src/schemas/audit-log.schema.ts (修改后)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

/**
 * İşlem Türleri (Action Types)
 * Sistemde yapılan her önemli işlem loglanır.
 */
export enum ActionType {
  // Kullanıcı İşlemleri
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_REGISTER = 'user_register',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',

  // Organizasyon İşlemleri
  ORG_CREATE = 'org_create',
  ORG_UPDATE = 'org_update',
  ORG_DELETE = 'org_delete',
  ORG_MEMBER_INVITE = 'org_member_invite',
  ORG_MEMBER_ACCEPT = 'org_member_accept',
  ORG_MEMBER_REMOVE = 'org_member_remove',
  ORG_MEMBER_ROLE_CHANGE = 'org_member_role_change',

  // Sosyal Medya Hesap İşlemleri
  ACCOUNT_CONNECT = 'account_connect',
  ACCOUNT_DISCONNECT = 'account_disconnect',
  ACCOUNT_REFRESH = 'account_refresh',

  // İçerik İşlemleri
  CONTENT_CREATE = 'content_create',
  CONTENT_UPDATE = 'content_update',
  CONTENT_DELETE = 'content_delete',
  CONTENT_SCHEDULE = 'content_schedule',
  CONTENT_PUBLISH = 'content_publish',
  CONTENT_APPROVE = 'content_approve',
  CONTENT_REJECT = 'content_reject',

  // AI İşlemleri
  AI_IMAGE_GENERATE = 'ai_image_generate',
  AI_IMAGE_ENHANCE = 'ai_image_enhance',
  AI_CAPTION_GENERATE = 'ai_caption_generate',
  AI_HASHTAG_SUGGEST = 'ai_hashtag_suggest',
  AI_COMMENT_REPLY = 'ai_comment_reply',

  // Analitik ve Raporlama
  ANALYTICS_VIEW = 'analytics_view',
  REPORT_GENERATE = 'report_generate',
  REPORT_EXPORT = 'report_export',

  // Faturalandırma
  BILLING_SUBSCRIBE = 'billing_subscribe',
  BILLING_CANCEL = 'billing_cancel',
  BILLING_PAYMENT = 'billing_payment',
  BILLING_INVOICE_DOWNLOAD = 'billing_invoice_download',

  // Ayarlar
  SETTINGS_UPDATE = 'settings_update',
  BRAND_VOICE_UPDATE = 'brand_voice_update',
}

/**
 * Önem Seviyeleri
 * INFO: Normal işlemler
 * WARNING: Dikkat gerektiren durumlar
 * ERROR: Hatalar
 * CRITICAL: Kritik güvenlik olayları
 */
export enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * IP ve Cihaz Bilgisi
 */
@Schema({ _id: false })
export class DeviceInfo {
  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop()
  deviceType?: 'desktop' | 'mobile' | 'tablet';

  @Prop()
  browser?: string;

  @Prop()
  os?: string;

  @Prop()
  city?: string;

  @Prop()
  country?: string;
}

/**
 * Değişiklik Detayı
 * Eski ve yeni değerleri tutar (Opsiyonel - hassas veriler için)
 */
@Schema({ _id: false })
export class ChangeDetails {
  @Prop()
  field: string;

  @Prop()
  oldValue?: any;

  @Prop()
  newValue?: any;
}

@Schema({ timestamps: true })
export class AuditLog {
  /**
   * Organizasyon ID (Çok kiracılık için zorunlu)
   */
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  /**
   * İşlemi Yapan Kullanıcı
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  /**
   * Kullanıcı Adı (Snapshot - kullanıcı silinse bile görünsün)
   */
  @Prop({ required: true })
  userName: string;

  /**
   * Kullanıcı Email'i (Snapshot)
   */
  @Prop({ required: true })
  userEmail: string;

  /**
   * İşlem Türü
   */
  @Prop({ type: String, enum: ActionType, required: true, index: true })
  action: ActionType;

  /**
   * İşlem Açıklaması (İnsan tarafından okunabilir)
   * Örn: "Ahmet Yılmaz, 'Yüzük Koleksiyonu' gönderisini onayladı"
   */
  @Prop({ required: true })
  description: string;

  /**
   * Önem Seviyesi
   */
  @Prop({ type: String, enum: LogLevel, default: LogLevel.INFO })
  level: LogLevel;

  /**
   * Hedef Kaynak Türü
   * Örn: 'ContentPost', 'Account', 'Organization'
   */
  @Prop()
  resourceType?: string;

  /**
   * Hedef Kaynak ID'si
   */
  @Prop({ type: Types.ObjectId })
  resourceId?: Types.ObjectId;

  /**
   * Ek Meta Veriler (JSON)
   * İşlemle ilgili ek bilgiler
   */
  @Prop()
  metadata?: any;

  /**
   * Değişiklik Detayları
   * Hangi alanlar değişti?
   */
  @Prop({ type: [ChangeDetails], default: [] })
  changes: ChangeDetails[];

  /**
   * Cihaz ve IP Bilgisi
   */
  @Prop({ type: DeviceInfo })
  deviceInfo: DeviceInfo;

  /**
   * Başarılı mı?
   */
  @Prop({ default: true })
  success: boolean;

  /**
   * Hata Mesajı (Eğer başarısız olduysa)
   */
  @Prop()
  errorMessage?: string;

  /**
   * İşlem Süresi (ms)
   */
  @Prop()
  durationMs?: number;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexler: Sorgu performansı için
AuditLogSchema.index({ organizationId: 1, createdAt: -1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1 });