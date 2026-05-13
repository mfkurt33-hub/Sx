/**
 * V4 #06 — Müşteri Portalı & Paylaşılabilir Rapor
 *
 * Ajans, müşteri işletmeye read-only erişim sağlar.
 * Müşteri şifre gerektirmeden token ile giriş yapabilir.
 * Paylaşılabilir link ile belirli raporlar paylaşılabilir.
 */

import mongoose, { Schema, model, models, Document } from 'mongoose';
import crypto from 'crypto';

// ─── MÜŞTERİ PORTAL ERİŞİMİ ────────────────────────────────────────────────

export interface IClientPortal extends Document {
  organizationId: string;       // Müşteri organizasyon ID
  resellerOrganizationId?: string; // Ajansın organizasyon ID (varsa)

  // Erişim token
  accessToken: string;          // UUID benzeri güvenli token
  tokenExpiresAt?: Date;        // null = süresi dolmaz
  lastAccessAt?: Date;

  // İzinler
  permissions: {
    viewAnalytics: boolean;
    viewPosts: boolean;
    viewCalendar: boolean;
    viewCompetitorAnalysis: boolean;
    downloadReports: boolean;
    viewAiRecommendations: boolean;
  };

  // Erişim kanalı
  accessType: 'full_portal' | 'report_only' | 'dashboard_only';
  customWelcomeMessage?: string;

  // Branding (ajansın markasıyla gösterilebilir)
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    companyName?: string;
    hidePoweredBy?: boolean;
  };

  isActive: boolean;
  revokedAt?: Date;
  revokeReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

const ClientPortalSchema = new Schema<IClientPortal>(
  {
    organizationId: { type: String, required: true, index: true },
    resellerOrganizationId: { type: String, index: true },

    accessToken: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(32).toString('hex'),
    },
    tokenExpiresAt: { type: Date },
    lastAccessAt: { type: Date },

    permissions: {
      viewAnalytics: { type: Boolean, default: true },
      viewPosts: { type: Boolean, default: true },
      viewCalendar: { type: Boolean, default: false },
      viewCompetitorAnalysis: { type: Boolean, default: false },
      downloadReports: { type: Boolean, default: true },
      viewAiRecommendations: { type: Boolean, default: false },
    },

    accessType: {
      type: String,
      enum: ['full_portal', 'report_only', 'dashboard_only'],
      default: 'dashboard_only',
    },
    customWelcomeMessage: { type: String },

    branding: {
      logoUrl: { type: String },
      primaryColor: { type: String },
      companyName: { type: String },
      hidePoweredBy: { type: Boolean, default: false },
    },

    isActive: { type: Boolean, default: true, index: true },
    revokedAt: { type: Date },
    revokeReason: { type: String },
  },
  { timestamps: true }
);

// Token geçerli mi kontrolü
ClientPortalSchema.virtual('isTokenValid').get(function () {
  if (!this.isActive) return false;
  if (!this.tokenExpiresAt) return true;
  return new Date() < this.tokenExpiresAt;
});

// Portal URL oluştur
ClientPortalSchema.virtual('portalUrl').get(function () {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.aitoManage.com';
  return `${baseUrl}/portal/${this.accessToken}`;
});

// Token ile portal bul ve doğrula
ClientPortalSchema.statics.findByToken = async function (token: string) {
  const portal = await this.findOne({ accessToken: token, isActive: true });
  if (!portal) return null;
  if (portal.tokenExpiresAt && new Date() > portal.tokenExpiresAt) return null;

  // Son erişim güncelle
  portal.lastAccessAt = new Date();
  await portal.save();

  return portal;
};

// Token yenile
ClientPortalSchema.methods.regenerateToken = async function () {
  this.accessToken = crypto.randomBytes(32).toString('hex');
  return this.save();
};

// Erişimi iptal et
ClientPortalSchema.methods.revoke = async function (reason?: string) {
  this.isActive = false;
  this.revokedAt = new Date();
  this.revokeReason = reason;
  return this.save();
};

export const ClientPortal =
  models.ClientPortal || model<IClientPortal>('ClientPortal', ClientPortalSchema);

// ─── PAYLAŞILABILIR RAPOR LİNKİ ────────────────────────────────────────────

export interface ISharedReport extends Document {
  organizationId: string;
  reportLogId?: string;         // Belirli bir rapor logu

  // Paylaşım ayarları
  shareToken: string;
  title: string;
  description?: string;

  // İzinler
  period: { start: Date; end: Date };
  sections: string[];           // Hangi bölümler gösterilsin

  // Güvenlik
  isPasswordProtected: boolean;
  passwordHash?: string;
  expiresAt?: Date;
  maxViews?: number;
  viewCount: number;

  // Branding
  showBranding: boolean;

  isActive: boolean;
  createdAt: Date;
}

const SharedReportSchema = new Schema<ISharedReport>(
  {
    organizationId: { type: String, required: true, index: true },
    reportLogId: { type: String },

    shareToken: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(16).toString('hex'),
    },
    title: { type: String, required: true },
    description: { type: String },

    period: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    sections: [{ type: String }],

    isPasswordProtected: { type: Boolean, default: false },
    passwordHash: { type: String },
    expiresAt: { type: Date },
    maxViews: { type: Number },
    viewCount: { type: Number, default: 0 },

    showBranding: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Paylaşım URL oluştur
SharedReportSchema.virtual('shareUrl').get(function () {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.aitoManage.com';
  return `${baseUrl}/share/${this.shareToken}`;
});

// Görüntüleme sayısını artır
SharedReportSchema.methods.recordView = async function () {
  this.viewCount += 1;
  if (this.maxViews && this.viewCount >= this.maxViews) {
    this.isActive = false;
  }
  return this.save();
};

export const SharedReport =
  models.SharedReport || model<ISharedReport>('SharedReport', SharedReportSchema);
