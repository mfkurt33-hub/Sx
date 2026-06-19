import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types, Schema as MongooseSchema } from 'mongoose'
import { DEFAULT_SCHEMA_OPTIONS } from '../mongodb.constants'
import { WithTimestampSchema } from './timestamp.schema'

export type AccountDocument = Account & Document

/**
 * Hesap Tipi - Desteklenen Sosyal Medya Platformları
 */
export enum AccountType {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  TIKTOK = 'tiktok',
  YOUTUBE = 'youtube',
  PINTEREST = 'pinterest',
  GOOGLE_MY_BUSINESS = 'google_my_business', // Türkiye KOBİ'leri için önemli
  WHATSAPP_BUSINESS = 'whatsapp_business', // Türkiye için kritik
}

/**
 * Hesap Durumu
 */
export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TOKEN_EXPIRED = 'token_expired',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

/**
 * OAuth Token Yönetimi - Kritik güvenlik ve yenileme stratejisi
 */
@Schema({ _id: false })
export class OAuthTokenInfo {
  @Prop({ required: false })
  accessToken?: string

  @Prop({ required: false })
  refreshToken?: string

  @Prop({ required: false })
  tokenExpiresAt?: Date // Token ne zaman sona eriyor?

  @Prop({ required: false })
  lastRefreshedAt?: Date // Son yenileme tarihi

  @Prop({ required: false, default: 0 })
  refreshAttempts?: number // Ardışık yenileme denemeleri (brute force koruması)

  @Prop({ required: false })
  lastError?: string // Son hata mesajı

  @Prop({ required: false })
  lastErrorAt?: Date // Son hata tarihi
}

/**
 * Platform-Spesifik Meta Veriler
 */
@Schema({ _id: false })
export class PlatformMetadata {
  @Prop({ required: false })
  platformUserId?: string // Platformdaki kullanıcı ID

  @Prop({ required: false })
  platformUsername?: string // Platform kullanıcı adı

  @Prop({ required: false, default: 0 })
  followersCount?: number // Takipçi sayısı

  @Prop({ required: false, default: 0 })
  followingCount?: number // Takip edilen sayısı

  @Prop({ required: false, default: 0 })
  postsCount?: number // Toplam gönderi sayısı

  @Prop({ required: false })
  profileUrl?: string // Profil linki

  @Prop({ required: false })
  bio?: string // Biyografi

  @Prop({ required: false })
  lastSyncedAt?: Date // Son senkronizasyon tarihi
}

/**
 * Bildirim Ayarları - Bağlantı kopunca bildirim için
 */
@Schema({ _id: false })
export class NotificationSettings {
  @Prop({ required: true, default: true })
  notifyOnTokenExpiry: boolean // Token süresi dolmak üzereyken bildir

  @Prop({ required: true, default: true })
  notifyOnConnectionLost: boolean // Bağlantı kopunca bildir

  @Prop({ required: true, default: true })
  notifyOnPublishSuccess: boolean // Yayın başarılı olduğunda bildir

  @Prop({ required: true, default: true })
  notifyOnPublishFailure: boolean // Yayın başarısız olduğunda bildir

  @Prop({ required: false, default: [] })
  notificationEmails: string[] // Bildirim gönderilecek e-postalar
}

@Schema({ ...DEFAULT_SCHEMA_OPTIONS, collection: 'account' })
export class Account extends WithTimestampSchema {
  id: string

  @Prop({ type: MongooseSchema.Types.String })
  _id: string

  @Prop({
    required: true,
    type: String,
    index: true,
    default: '',
  })
  userId: string

  @Prop({
    required: true,
    type: String,
    index: true,
  })
  organizationId: string // Organizasyon ID - çok kiracılı yapı için

  @Prop({
    required: true,
    enum: AccountType,
    index: true,
  })
  type: AccountType

  @Prop({
    required: true,
    index: true,
  })
  uid: string // Platform-specific user ID

  @Prop({
    required: false,
    index: true,
  })
  account: string // Kullanıcı adı / handle

  @Prop({
    required: false,
  })
  avatar?: string

  @Prop({
    required: true,
  })
  nickname: string // Görünen ad

  @Prop({
    required: true,
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
    index: true,
  })
  status: AccountStatus

  // OAuth Token Yönetimi
  @Prop({ type: () => OAuthTokenInfo, required: false, default: {} })
  oauthToken: OAuthTokenInfo

  // Platform Meta Verileri
  @Prop({ type: () => PlatformMetadata, required: false, default: {} })
  platformMetadata: PlatformMetadata

  // Bildirim Ayarları
  @Prop({ type: () => NotificationSettings, required: false, default: {} })
  notificationSettings: NotificationSettings

  @Prop({ required: true, default: false })
  isAutoCommentEnabled: boolean // AI otomatik yorum yanıtlama açık mı?

  @Prop({ required: true, default: false })
  isAutoPublishEnabled: boolean // Otomatik yayın açık mı?

  @Prop({ type: String, required: true })
  groupId: string

  @Prop({ required: true, default: 1 })
  rank: number

  @Prop({ type: String, default: null })
  relayAccountRef: string | null

  @Prop({ required: false })
  connectionErrorReason?: string // Bağlantı hatası nedeni

  @Prop({ required: false })
  lastConnectionCheck?: Date // Son bağlantı kontrolü
}

export const AccountSchema = SchemaFactory.createForClass(Account)

// Indexler
AccountSchema.index({ type: 1, uid: 1 }, { unique: true })
AccountSchema.index({ organizationId: 1, type: 1, uid: 1 }, { unique: true }) // Organizasyon bazlı unique index
AccountSchema.index({ organizationId: 1, status: 1 }) // Organizasyondaki aktif hesaplar için
AccountSchema.index({ userId: 1 })
AccountSchema.index({ 'oauthToken.tokenExpiresAt': 1 }) // Token süresi dolacakları bulmak için
