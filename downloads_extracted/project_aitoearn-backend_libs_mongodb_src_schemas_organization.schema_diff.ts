--- project/aitoearn-backend/libs/mongodb/src/schemas/organization.schema.ts (原始)


+++ project/aitoearn-backend/libs/mongodb/src/schemas/organization.schema.ts (修改后)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { DEFAULT_SCHEMA_OPTIONS } from '../mongodb.constants'
import { WithTimestampSchema } from './timestamp.schema'

/**
 * Organizasyon Plan Tipleri
 */
export enum OrganizationPlanType {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

/**
 * Organizasyon Durumu
 */
export enum OrganizationStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

/**
 * Marka Sesi Ayarları
 */
@Schema({ _id: false })
export class BrandVoice {
  @Prop({ required: false, default: '' })
  tone: string // Ton (profesyonel, samimi, mizahi vb.)

  @Prop({ required: false, default: '' })
  style: string // Stil (hikaye anlatıcı, bilgilendirici vb.)

  @Prop({ required: false, default: [] })
  keywords: string[] // Anahtar kelimeler

  @Prop({ required: false, default: '' })
  description: string // Marka açıklaması

  @Prop({ required: false, default: [] })
  sampleTexts: string[] // Örnek metinler (AI eğitimi için)
}

/**
 * Kullanım Limitleri
 */
@Schema({ _id: false })
export class UsageLimits {
  @Prop({ required: true, default: 3 })
  maxSocialAccounts: number // Maksimum sosyal medya hesabı

  @Prop({ required: true, default: 30 })
  maxPostsPerMonth: number // Aylık maksimum gönderi

  @Prop({ required: true, default: 5 })
  maxTeamMembers: number // Maksimum takım üyesi

  @Prop({ required: true, default: 1 })
  maxOrganizations: number // Maksimum organizasyon sayısı

  @Prop({ required: true, default: false })
  aiImageEnhancement: boolean // AI görsel iyileştirme özelliği

  @Prop({ required: true, default: false })
  advancedAnalytics: boolean // Gelişmiş analitik
}

/**
 * Abonelik Bilgileri
 */
@Schema({ _id: false })
export class Subscription {
  @Prop({ required: true, enum: OrganizationPlanType, default: OrganizationPlanType.FREE })
  plan: OrganizationPlanType

  @Prop({ required: false })
  stripeCustomerId?: string

  @Prop({ required: false })
  stripeSubscriptionId?: string

  @Prop({ required: false })
  currentPeriodStart?: Date

  @Prop({ required: false })
  currentPeriodEnd?: Date

  @Prop({ required: true, default: false })
  cancelAtPeriodEnd: boolean

  @Prop({ required: false })
  cancelledAt?: Date
}

/**
 * Organizasyon Ana Şeması
 */
@Schema({ ...DEFAULT_SCHEMA_OPTIONS, collection: 'organization' })
export class Organization extends WithTimestampSchema {
  id: string

  @Prop({ required: true })
  name: string // İşletme adı (örn: Salih Çetinkaya Kuyumculuk)

  @Prop({ required: false, default: '' })
  slug: string // URL dostu isim (unique)

  @Prop({ required: false, default: '' })
  description: string // İşletme açıklaması

  @Prop({ required: false, default: '' })
  industry: string // Sektör (kuyumculuk, restoran, teknoloji vb.)

  @Prop({ required: false, default: '' })
  website: string // Web sitesi

  @Prop({ required: false, default: '' })
  logo: string // Logo URL

  @Prop({ required: false, default: '' })
  coverImage: string // Kapak görseli

  @Prop({ required: true, enum: OrganizationStatus, default: OrganizationStatus.ACTIVE })
  status: OrganizationStatus

  @Prop({ type: () => BrandVoice, required: false, default: {} })
  brandVoice: BrandVoice // Marka sesi ayarları

  @Prop({ type: () => UsageLimits, required: false })
  customLimits?: UsageLimits // Özel limitler (enterprise için)

  @Prop({ type: () => Subscription, required: false, default: {} })
  subscription: Subscription // Abonelik bilgileri

  @Prop({ required: true, default: 0 })
  usedStorage: number // Kullanılan depolama (Bytes)

  @Prop({ required: true, default: 500 * 1024 * 1024 })
  totalStorage: number // Toplam depolama (Bytes)

  @Prop({ required: false, index: true })
  ownerId: string // Sahip kullanıcı ID

  @Prop({ required: true, default: false })
  isDelete: boolean // Silindi mi?
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization)

// Slug için unique index
OrganizationSchema.index({ slug: 1 }, { unique: true, sparse: true })