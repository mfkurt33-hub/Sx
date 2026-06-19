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
 * Ödeme Sağlayıcı Tipi - Türkiye için iyzico ve Param desteği
 */
export enum PaymentProvider {
  STRIPE = 'stripe',
  IYZICO = 'iyzico',
  PARAM = 'param',
}

/**
 * Satış Temsilcisi / Ajans Bilgileri
 */
@Schema({ _id: false })
export class ResellerInfo {
  @Prop({ required: false })
  resellerId?: string // Satış temsilcisi veya ajans ID

  @Prop({ required: false, default: 0 })
  commissionRate?: number // Komisyon oranı (%)

  @Prop({ required: false, default: 0 })
  totalCommissionEarned?: number // Toplam kazanılan komisyon (TL)
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

  @Prop({ required: false, default: [] })
  competitors: string[] // Rakip marka adları
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

  @Prop({ required: true, default: 100 })
  aiCreditsPerMonth: number // Aylık AI kredisi limiti

  @Prop({ required: true, default: false })
  aiImageEnhancement: boolean // AI görsel iyileştirme özelliği

  @Prop({ required: true, default: false })
  advancedAnalytics: boolean // Gelişmiş analitik

  @Prop({ required: true, default: false })
  whiteLabel: boolean // White-label raporlama (Kurumsal)
}

/**
 * Abonelik Bilgileri - Türkiye ödeme sağlayıcıları ile
 */
@Schema({ _id: false })
export class Subscription {
  @Prop({ required: true, enum: OrganizationPlanType, default: OrganizationPlanType.FREE })
  plan: OrganizationPlanType

  // Stripe (Uluslararası müşteriler için)
  @Prop({ required: false })
  stripeCustomerId?: string

  @Prop({ required: false })
  stripeSubscriptionId?: string

  // iyzico (Türkiye için)
  @Prop({ required: false })
  iyzicoCustomerKey?: string

  @Prop({ required: false })
  iyzicoSubscriptionKey?: string

  // Param (Türkiye alternatif)
  @Prop({ required: false })
  paramCustomerId?: string

  @Prop({ required: false })
  paramOrderId?: string

  // Ortak alanlar
  @Prop({ required: false, enum: PaymentProvider, default: PaymentProvider.STRIPE })
  paymentProvider: PaymentProvider

  @Prop({ required: false })
  currentPeriodStart?: Date

  @Prop({ required: false })
  currentPeriodEnd?: Date

  @Prop({ required: true, default: false })
  cancelAtPeriodEnd: boolean

  @Prop({ required: false })
  cancelledAt?: Date

  @Prop({ required: false })
  lastPaymentDate?: Date

  @Prop({ required: false })
  nextBillingDate?: Date
}

/**
 * KVKK Uyumluluk Bilgileri
 */
@Schema({ _id: false })
export class KVKKCompliance {
  @Prop({ required: false, default: false })
  termsAccepted: boolean // Kullanım koşulları kabul edildi mi?

  @Prop({ required: false, default: false })
  privacyPolicyAccepted: boolean // Gizlilik politikası kabul edildi mi?

  @Prop({ required: false, default: false })
  dataProcessingConsent: boolean // Veri işleme izni

  @Prop({ required: false, default: false })
  marketingConsent: boolean // Pazarlama izni

  @Prop({ required: false })
  acceptedAt?: Date // Kabul tarihi

  @Prop({ required: false })
  ip_address?: string // Kabul edilen IP adresi
}

/**
 * Onboarding Durumu
 */
@Schema({ _id: false })
export class OnboardingStatus {
  @Prop({ required: true, default: false })
  industrySelected: boolean // Sektör seçildi mi?

  @Prop({ required: true, default: false })
  accountConnected: boolean // Sosyal medya hesabı bağlandı mı?

  @Prop({ required: true, default: false })
  brandVoiceCompleted: boolean // Marka sesi dolduruldu mu?

  @Prop({ required: true, default: false })
  firstPostCreated: boolean // İlk gönderi oluşturuldu mu?

  @Prop({ required: true, default: false })
  teamMemberInvited: boolean // Takım üyesi davet edildi mi?

  @Prop({ required: true, default: 0 })
  completedSteps: number // Tamamlanan adım sayısı (0-5)

  @Prop({ required: true, default: false })
  isCompleted: boolean // Onboarding tamamlandı mı?
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
  phone: string // Telefon numarası (Türkiye formatı)

  @Prop({ required: false, default: '' })
  taxNumber: string // Vergi numarası (Türkiye için)

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

  @Prop({ type: () => ResellerInfo, required: false, default: {} })
  resellerInfo: ResellerInfo // Satış temsilcisi / ajans bilgileri

  @Prop({ type: () => KVKKCompliance, required: false, default: {} })
  kvkkCompliance: KVKKCompliance // KVKK uyumluluk bilgileri

  @Prop({ type: () => OnboardingStatus, required: false, default: {} })
  onboardingStatus: OnboardingStatus // Onboarding durumu

  @Prop({ required: true, default: 0 })
  usedStorage: number // Kullanılan depolama (Bytes)

  @Prop({ required: true, default: 500 * 1024 * 1024 })
  totalStorage: number // Toplam depolama (Bytes)

  @Prop({ required: true, default: 0 })
  usedAiCredits: number // Kullanılan AI kredisi (bu ay)

  @Prop({ required: false, index: true })
  ownerId: string // Sahip kullanıcı ID

  @Prop({ required: true, default: false })
  isDelete: boolean // Silindi mi?
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization)

// Slug için unique index
OrganizationSchema.index({ slug: 1 }, { unique: true, sparse: true })
// Owner ID için index
OrganizationSchema.index({ ownerId: 1 })
// Sektör bazlı filtreleme için index
OrganizationSchema.index({ industry: 1 })
