/**
 * V4 #05 — Otomatik Haftalık Rapor Motoru
 *
 * Her Pazartesi müşteriye geçen haftanın performans özeti emaille gönderilir.
 * BullMQ cron job + PDF oluşturma + email servisi.
 *
 * Gerekli paketler:
 *   npm install bullmq puppeteer nodemailer @types/nodemailer
 */

import mongoose, { Schema, model, models, Document } from 'mongoose';

// ─── ŞEMA ──────────────────────────────────────────────────────────────────

export interface IScheduledReport extends Document {
  organizationId: string;

  // Rapor tipi ve sıklığı
  type: 'weekly' | 'monthly' | 'quarterly';
  frequency: {
    dayOfWeek?: number;         // 0=Pazar, 1=Pazartesi (weekly için)
    dayOfMonth?: number;        // 1-28 (monthly için)
    hour: number;               // Gönderim saati (0-23)
    timezone: string;           // 'Europe/Istanbul'
  };

  // Alıcılar
  recipients: {
    email: string;
    name?: string;
    role: 'owner' | 'manager' | 'client';
    language: 'tr' | 'en';
  }[];

  // Rapor içeriği seçimi
  sections: {
    overview: boolean;          // Genel performans özeti
    topPosts: boolean;          // En iyi gönderiler
    worstPosts: boolean;        // Geliştirilmesi gereken gönderiler
    audienceGrowth: boolean;    // Takipçi büyümesi
    engagementTrend: boolean;   // Etkileşim trendi
    competitorSummary: boolean; // Rakip özeti (varsa)
    aiRecommendations: boolean; // Bu haftanın AI önerileri
    upcomingSpecialDays: boolean; // Yaklaşan özel günler
  };

  // Branding
  branding: {
    logoUrl?: string;
    primaryColor?: string;
    companyName?: string;
  };

  // Son gönderim
  lastSentAt?: Date;
  lastReportId?: string;
  nextScheduledAt?: Date;

  // İstatistikler
  stats: {
    totalSent: number;
    lastOpenedAt?: Date;
    openRate?: number;
  };

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduledReportSchema = new Schema<IScheduledReport>(
  {
    organizationId: { type: String, required: true, index: true },

    type: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly'],
      required: true,
      default: 'weekly',
    },

    frequency: {
      dayOfWeek: { type: Number, min: 0, max: 6, default: 1 }, // Pazartesi
      dayOfMonth: { type: Number, min: 1, max: 28 },
      hour: { type: Number, min: 0, max: 23, default: 9 },
      timezone: { type: String, default: 'Europe/Istanbul' },
    },

    recipients: [
      {
        email: { type: String, required: true },
        name: { type: String },
        role: { type: String, enum: ['owner', 'manager', 'client'], default: 'owner' },
        language: { type: String, enum: ['tr', 'en'], default: 'tr' },
      },
    ],

    sections: {
      overview: { type: Boolean, default: true },
      topPosts: { type: Boolean, default: true },
      worstPosts: { type: Boolean, default: false },
      audienceGrowth: { type: Boolean, default: true },
      engagementTrend: { type: Boolean, default: true },
      competitorSummary: { type: Boolean, default: false },
      aiRecommendations: { type: Boolean, default: true },
      upcomingSpecialDays: { type: Boolean, default: true },
    },

    branding: {
      logoUrl: { type: String },
      primaryColor: { type: String, default: '#7F77DD' },
      companyName: { type: String },
    },

    lastSentAt: { type: Date },
    lastReportId: { type: String },
    nextScheduledAt: { type: Date, index: true },

    stats: {
      totalSent: { type: Number, default: 0 },
      lastOpenedAt: { type: Date },
      openRate: { type: Number, min: 0, max: 100 },
    },

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

ScheduledReportSchema.index({ organizationId: 1, isActive: 1 });
ScheduledReportSchema.index({ nextScheduledAt: 1, isActive: 1 });

// Sonraki gönderim zamanını hesapla
ScheduledReportSchema.methods.calculateNextScheduled = function () {
  const now = new Date();
  const next = new Date(now);

  if (this.type === 'weekly') {
    const targetDay = this.frequency.dayOfWeek ?? 1;
    const currentDay = now.getDay();
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    next.setDate(now.getDate() + daysUntil);
  } else if (this.type === 'monthly') {
    next.setMonth(now.getMonth() + 1);
    next.setDate(this.frequency.dayOfMonth ?? 1);
  }

  next.setHours(this.frequency.hour, 0, 0, 0);
  this.nextScheduledAt = next;
  return this.save();
};

// Gönderilmesi gereken raporları getir
ScheduledReportSchema.statics.findDueReports = function () {
  return this.find({
    isActive: true,
    nextScheduledAt: { $lte: new Date() },
  });
};

export const ScheduledReport =
  models.ScheduledReport || model<IScheduledReport>('ScheduledReport', ScheduledReportSchema);

// ─── REPORT LOG (her gönderilen raporun kaydı) ─────────────────────────────

export interface IReportLog extends Document {
  organizationId: string;
  scheduledReportId: string;
  period: { start: Date; end: Date };

  pdfUrl?: string;
  htmlContent?: string;

  emailResults: {
    email: string;
    status: 'sent' | 'failed' | 'bounced';
    sentAt?: Date;
    error?: string;
  }[];

  metrics: {
    totalPosts: number;
    totalReach: number;
    totalEngagement: number;
    avgEngagementRate: number;
    followerGrowth: number;
    topPostId?: string;
  };

  generatedAt: Date;
  generationDurationMs?: number;
}

const ReportLogSchema = new Schema<IReportLog>(
  {
    organizationId: { type: String, required: true, index: true },
    scheduledReportId: { type: String, required: true, index: true },
    period: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    pdfUrl: { type: String },
    htmlContent: { type: String },
    emailResults: [
      {
        email: { type: String, required: true },
        status: { type: String, enum: ['sent', 'failed', 'bounced'], required: true },
        sentAt: { type: Date },
        error: { type: String },
      },
    ],
    metrics: {
      totalPosts: { type: Number, default: 0 },
      totalReach: { type: Number, default: 0 },
      totalEngagement: { type: Number, default: 0 },
      avgEngagementRate: { type: Number, default: 0 },
      followerGrowth: { type: Number, default: 0 },
      topPostId: { type: String },
    },
    generatedAt: { type: Date, default: Date.now },
    generationDurationMs: { type: Number },
  },
  { timestamps: false }
);

export const ReportLog = models.ReportLog || model<IReportLog>('ReportLog', ReportLogSchema);

// ─── BULLMQ JOB TANIMLARI ──────────────────────────────────────────────────

/**
 * BullMQ Queue ve Worker tanımları.
 *
 * Kurulum:
 *   npm install bullmq ioredis
 *
 * src/jobs/report.queue.ts olarak kaydet
 */
export const REPORT_QUEUE_DEFINITION = `
import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });

// Queue
export const reportQueue = new Queue('scheduled-reports', { connection });

// Cron job: Her gün saat 08:00'de çalışır, o gün için planlanan raporları gönderir
export async function scheduleReportCron() {
  await reportQueue.add(
    'check-due-reports',
    {},
    {
      repeat: { pattern: '0 8 * * *' },  // Her gün 08:00
      jobId: 'daily-report-check',
    }
  );
  console.log('📅 Rapor cron job planlandı: Her gün 08:00');
}

// Worker
export const reportWorker = new Worker(
  'scheduled-reports',
  async (job: Job) => {
    if (job.name === 'check-due-reports') {
      const { ScheduledReport } = await import('../schemas/scheduled-report.schema');
      const dueReports = await ScheduledReport.findDueReports();
      
      for (const report of dueReports) {
        await reportQueue.add('generate-report', {
          scheduledReportId: report._id.toString(),
          organizationId: report.organizationId,
        });
      }
      
      console.log(\`📊 \${dueReports.length} rapor kuyruğa eklendi\`);
    }
    
    if (job.name === 'generate-report') {
      const { scheduledReportId, organizationId } = job.data;
      // TODO: PDF oluştur ve email gönder
      // await generateAndSendReport(scheduledReportId, organizationId);
    }
  },
  { connection, concurrency: 3 }
);
`;
