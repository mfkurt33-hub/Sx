/**
 * V4 #09 — KVKK Veri Saklama Politikası
 *
 * 6698 sayılı KVKK (Kişisel Verilerin Korunması Kanunu) uyumluluğu.
 * Türkiye'de kişisel veri işleyen her SaaS için zorunlu.
 *
 * Kapsar:
 * - Hangi veri kaç gün saklanır
 * - Otomatik imha cron job'u
 * - Kullanıcı "verilerimi indir" talebi (veri taşınabilirliği)
 * - Silme talebi işleme
 * - İşleme kayıtları
 */

import mongoose, { Schema, model, models, Document } from 'mongoose';

// ─── VERİ KATEGORİLERİ VE SAKLAMA SÜRELERİ ────────────────────────────────

export const DATA_RETENTION_POLICIES = {
  // Kullanıcı verileri
  user_profile: { retentionDays: 365 * 3, legalBasis: 'Sözleşme gereği' },
  user_activity_logs: { retentionDays: 90, legalBasis: 'Meşru menfaat' },

  // İçerik verileri
  published_posts: { retentionDays: 365 * 2, legalBasis: 'Sözleşme gereği' },
  draft_posts: { retentionDays: 90, legalBasis: 'Sözleşme gereği' },
  ai_generated_content: { retentionDays: 365, legalBasis: 'Sözleşme gereği' },

  // Analitik veriler
  analytics_reports: { retentionDays: 365 * 2, legalBasis: 'Meşru menfaat' },
  engagement_data: { retentionDays: 365, legalBasis: 'Meşru menfaat' },

  // Finansal veriler (yasal zorunluluk: 10 yıl)
  invoices: { retentionDays: 365 * 10, legalBasis: 'Yasal zorunluluk (VUK)' },
  transactions: { retentionDays: 365 * 10, legalBasis: 'Yasal zorunluluk (VUK)' },

  // Güvenlik
  audit_logs: { retentionDays: 365 * 2, legalBasis: 'Güvenlik / Yasal zorunluluk' },
  login_history: { retentionDays: 90, legalBasis: 'Güvenlik' },

  // İletişim verileri
  comment_threads: { retentionDays: 365, legalBasis: 'Sözleşme gereği' },
  whatsapp_logs: { retentionDays: 180, legalBasis: 'Sözleşme gereği' },
  crisis_alerts: { retentionDays: 365, legalBasis: 'Meşru menfaat' },
} as const;

export type DataCategory = keyof typeof DATA_RETENTION_POLICIES;

// ─── VERİ SAKLAMA POLİTİKASI ŞEMASI ────────────────────────────────────────

export interface IDataRetentionPolicy extends Document {
  organizationId: string;

  // Organizasyona özel politika ayarları
  customPolicies: {
    category: DataCategory;
    retentionDays: number;      // Organizasyon varsayılanı override edebilir
    reason?: string;
  }[];

  // Son imha çalıştırma
  lastPurgeRunAt?: Date;
  nextPurgeScheduledAt?: Date;

  // İstatistikler
  purgeHistory: {
    runAt: Date;
    category: string;
    recordsDeleted: number;
    durationMs: number;
  }[];

  // KVKK görevlisi bilgisi
  dpoInfo?: {
    name: string;
    email: string;
    phone?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const DataRetentionPolicySchema = new Schema<IDataRetentionPolicy>(
  {
    organizationId: { type: String, required: true, unique: true, index: true },

    customPolicies: [
      {
        category: { type: String, required: true },
        retentionDays: { type: Number, required: true, min: 1 },
        reason: { type: String },
      },
    ],

    lastPurgeRunAt: { type: Date },
    nextPurgeScheduledAt: { type: Date, index: true },

    purgeHistory: [
      {
        runAt: { type: Date, required: true },
        category: { type: String, required: true },
        recordsDeleted: { type: Number, default: 0 },
        durationMs: { type: Number },
      },
    ],

    dpoInfo: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },
  },
  { timestamps: true }
);

export const DataRetentionPolicy =
  models.DataRetentionPolicy ||
  model<IDataRetentionPolicy>('DataRetentionPolicy', DataRetentionPolicySchema);

// ─── VERİ TALEBİ (KVKK Madde 11) ─────────────────────────────────────────

export interface IDataRequest extends Document {
  organizationId: string;
  userId: string;
  requestedByEmail: string;

  type:
    | 'access'          // Verilerimi görmek istiyorum
    | 'portability'     // Verilerimi indirmek istiyorum
    | 'deletion'        // Verilerimi silin
    | 'correction'      // Verilerimi düzeltin
    | 'restriction'     // İşlemeyi kısıtlayın
    | 'objection';      // İşlemeye itiraz ediyorum

  status: 'pending' | 'processing' | 'completed' | 'rejected';
  description?: string;

  // KVKK: 30 gün içinde yanıtlanmalı
  requestedAt: Date;
  deadlineAt: Date;
  processedAt?: Date;
  processedBy?: string;

  // Yanıt
  response?: {
    message: string;
    downloadUrl?: string;       // Veri dışa aktarma linki
    downloadExpiresAt?: Date;
    rejectionReason?: string;
  };

  ipAddress?: string;
  userAgent?: string;

  createdAt: Date;
  updatedAt: Date;
}

const DataRequestSchema = new Schema<IDataRequest>(
  {
    organizationId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    requestedByEmail: { type: String, required: true },

    type: {
      type: String,
      required: true,
      enum: ['access', 'portability', 'deletion', 'correction', 'restriction', 'objection'],
    },

    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'rejected'],
      default: 'pending',
      index: true,
    },
    description: { type: String },

    requestedAt: { type: Date, default: Date.now },
    deadlineAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
    },
    processedAt: { type: Date },
    processedBy: { type: String },

    response: {
      message: { type: String },
      downloadUrl: { type: String },
      downloadExpiresAt: { type: Date },
      rejectionReason: { type: String },
    },

    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

// Deadline'ı geçen bekleyen talepleri getir
DataRequestSchema.statics.findOverdue = function () {
  return this.find({
    status: { $in: ['pending', 'processing'] },
    deadlineAt: { $lt: new Date() },
  });
};

export const DataRequest =
  models.DataRequest || model<IDataRequest>('DataRequest', DataRequestSchema);

// ─── AÇIK RIZA KAYDI ──────────────────────────────────────────────────────

export interface IConsentRecord extends Document {
  organizationId: string;
  userId: string;
  email: string;

  consents: {
    type: 'terms' | 'privacy' | 'marketing' | 'analytics' | 'cookies';
    isGranted: boolean;
    grantedAt?: Date;
    revokedAt?: Date;
    version: string;            // Politika versiyonu
    ipAddress?: string;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const ConsentRecordSchema = new Schema<IConsentRecord>(
  {
    organizationId: { type: String, required: true, index: true },
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: true },

    consents: [
      {
        type: {
          type: String,
          enum: ['terms', 'privacy', 'marketing', 'analytics', 'cookies'],
          required: true,
        },
        isGranted: { type: Boolean, required: true },
        grantedAt: { type: Date },
        revokedAt: { type: Date },
        version: { type: String, required: true },
        ipAddress: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const ConsentRecord =
  models.ConsentRecord || model<IConsentRecord>('ConsentRecord', ConsentRecordSchema);

// ─── PURGE CRON JOB TANIMI ────────────────────────────────────────────────

export const PURGE_CRON_DEFINITION = `
// src/jobs/data-purge.job.ts
// Çalıştır: Her gün gece 02:00'de
// BullMQ pattern: '0 2 * * *'

import { DATA_RETENTION_POLICIES } from '../schemas/data-retention.schema';

export async function runDataPurge(organizationId?: string) {
  const results: Record<string, number> = {};

  for (const [category, policy] of Object.entries(DATA_RETENTION_POLICIES)) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

    // Her koleksiyona uygun filtre uygula
    // Örnek: posts
    // const deleted = await ContentPost.deleteMany({
    //   organizationId,
    //   createdAt: { $lt: cutoffDate },
    //   status: 'archived'
    // });
    // results[category] = deleted.deletedCount;
  }

  return results;
}
`;
