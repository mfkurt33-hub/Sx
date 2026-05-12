--- project/aitoearn-backend/libs/mongodb/src/schemas/organization-member.schema.ts (原始)


+++ project/aitoearn-backend/libs/mongodb/src/schemas/organization-member.schema.ts (修改后)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { DEFAULT_SCHEMA_OPTIONS } from '../mongodb.constants'
import { WithTimestampSchema } from './timestamp.schema'

/**
 * Üye Rolleri
 */
export enum OrganizationMemberRole {
  OWNER = 'owner', // Tam yetki - organizasyonu silebilir, üyeleri yönetebilir, faturalandırma
  ADMIN = 'admin', // Tüm içerik ve hesap yönetimi
  EDITOR = 'editor', // İçerik oluşturur, düzenler, taslak kaydeder
  APPROVER = 'approver', // Taslakları onaylar/reddeder
  VIEWER = 'viewer', // Sadece görüntüler, analitik görür
}

/**
 * Üye Durumu
 */
export enum OrganizationMemberStatus {
  ACTIVE = 'active', // Aktif üye
  INVITED = 'invited', // Davet gönderildi, henüz kabul etmedi
  DEACTIVATED = 'deactivated', // Hesap devre dışı bırakıldı
}

/**
 * Özel İzinler (Rol bazlı varsayılan izinlerin üzerine yazılabilir)
 */
@Schema({ _id: false })
export class MemberPermissions {
  @Prop({ required: false, default: true })
  canCreateContent: boolean // İçerik oluşturabilir mi?

  @Prop({ required: false, default: false })
  canPublishContent: boolean // İçerik yayınlayabilir mi?

  @Prop({ required: false, default: false })
  canApproveContent: boolean // İçerik onaylayabilir mi?

  @Prop({ required: false, default: false })
  canManageAccounts: boolean // Sosyal medya hesaplarını yönetebilir mi?

  @Prop({ required: false, default: false })
  canViewAnalytics: boolean // Analitikleri görebilir mi?

  @Prop({ required: false, default: false })
  canManageBilling: boolean // Faturalandırmayı yönetebilir mi?

  @Prop({ required: false, default: false })
  canManageMembers: boolean // Üyeleri yönetebilir mi?

  @Prop({ required: false, default: false })
  canManageSettings: boolean // Organizasyon ayarlarını yönetebilir mi?

  @Prop({ required: false, default: false })
  canUseAIImageEnhancement: boolean // AI görsel iyileştirmeyi kullanabilir mi?
}

/**
 * Organizasyon Üyesi Ana Şeması
 */
@Schema({ ...DEFAULT_SCHEMA_OPTIONS, collection: 'organization_member' })
export class OrganizationMember extends WithTimestampSchema {
  id: string

  @Prop({ required: true, index: true })
  organizationId: string // Organizasyon ID

  @Prop({ required: true, index: true })
  userId: string // Kullanıcı ID

  @Prop({ required: true, enum: OrganizationMemberRole, default: OrganizationMemberRole.VIEWER })
  role: OrganizationMemberRole // Rol

  @Prop({ required: true, enum: OrganizationMemberStatus, default: OrganizationMemberStatus.ACTIVE })
  status: OrganizationMemberStatus // Durum

  @Prop({ type: () => MemberPermissions, required: false })
  customPermissions?: MemberPermissions // Özel izinler

  @Prop({ required: false })
  invitedBy?: string // Kim tarafından davet edildi? (userId)

  @Prop({ required: false })
  inviteToken?: string // Davet token'ı (unique)

  @Prop({ required: false })
  inviteExpiresAt?: Date // Davet son kullanma tarihi

  @Prop({ required: false })
  joinedAt?: Date // Katılım tarihi

  @Prop({ required: false })
  lastActiveAt?: Date // Son aktif olduğu tarih

  @Prop({ required: true, default: false })
  isDelete: boolean // Silindi mi?
}

export const OrganizationMemberSchema = SchemaFactory.createForClass(OrganizationMember)

// Bir kullanıcı bir organizasyonda sadece bir kez olabilir
OrganizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true, partialFilterExpression: { isDelete: false } })

// Invite token için unique index
OrganizationMemberSchema.index({ inviteToken: 1 }, { unique: true, sparse: true })