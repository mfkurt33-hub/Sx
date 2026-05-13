--- aitosman_fixed_schemas/schemas/ai-credit-usage.schema.ts (原始)


+++ aitosman_fixed_schemas/schemas/ai-credit-usage.schema.ts (修改后)
import { Schema, model, models, Document } from 'mongoose';

export interface IAICreditUsage extends Document {
  organizationId: string;
  userId: string;

  // Kullanım detayları
  actionType: 'image_generation' | 'text_generation' | 'video_generation' | 'analysis' | 'recommendation';
  provider: 'replicate' | 'fal_ai' | 'modal' | 'custom_gpu' | 'openai' | 'anthropic';
  model?: string;

  // Maliyet bilgileri - KRİTİK DÜZELTME #03
  cost: {
    amount: number; // TL veya USD cinsinden maliyet
    currency: 'TRY' | 'USD';
    creditsUsed: number; // Kaç kredi tüketildi
    unitPrice: number; // Birim fiyat

    // Detaylı döküm
    breakdown?: {
      baseCost: number;
      resolutionMultiplier?: number;
      qualityMultiplier?: number;
      rushFee?: number;
    };
  };

  // İşlem detayları
  requestDetails: {
    prompt?: string;
    negativePrompt?: string;
    parameters?: Record<string, any>;
    inputImages?: string[];
    outputUrls?: string[];
  };

  // Sonuç
  status: 'processing' | 'completed' | 'failed' | 'cancelled';
  result?: {
    success: boolean;
    outputUrl?: string;
    outputUrls?: string[];
    metadata?: Record<string, any>;
    processingTimeMs?: number;
  };

  // Hata bilgisi
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };

  // Kredi limiti takibi
  creditBalanceAfter: number; // İşlemden sonra kalan kredi
  monthlyUsageTotal: number; // Aylık toplam kullanım
  monthlyLimit: number; // Aylık limit
  isLimitExceeded: boolean; // Limit aşıldı mı?

  // Faturalandırma
  billable: boolean;
  invoiceId?: string;

  createdAt: Date;
  completedAt?: Date;
}

const AICreditUsageSchema = new Schema<IAICreditUsage>(
  {
    organizationId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },

    actionType: {
      type: String,
      required: true,
      enum: ['image_generation', 'text_generation', 'video_generation', 'analysis', 'recommendation'],
      index: true,
    },
    provider: {
      type: String,
      required: true,
      enum: ['replicate', 'fal_ai', 'modal', 'custom_gpu', 'openai', 'anthropic'],
      index: true,
    },
    model: String,

    // KRİTİK DÜZELTME #03: AI maliyet takibi
    cost: {
      amount: { type: Number, required: true },
      currency: { type: String, enum: ['TRY', 'USD'], default: 'TRY' },
      creditsUsed: { type: Number, required: true },
      unitPrice: { type: Number, required: true },

      breakdown: {
        baseCost: Number,
        resolutionMultiplier: Number,
        qualityMultiplier: Number,
        rushFee: Number,
      },
    },

    requestDetails: {
      prompt: String,
      negativePrompt: String,
      parameters: Schema.Types.Mixed,
      inputImages: [String],
      outputUrls: [String],
    },

    status: {
      type: String,
      required: true,
      enum: ['processing', 'completed', 'failed', 'cancelled'],
      default: 'processing',
      index: true,
    },
    result: {
      success: Boolean,
      outputUrl: String,
      outputUrls: [String],
      metadata: Schema.Types.Mixed,
      processingTimeMs: Number,
    },

    error: {
      code: String,
      message: String,
      retryable: Boolean,
    },

    // Kredi limiti takibi
    creditBalanceAfter: Number,
    monthlyUsageTotal: Number,
    monthlyLimit: Number,
    isLimitExceeded: { type: Boolean, default: false },

    billable: { type: Boolean, default: true },
    invoiceId: String,
  },
  {
    timestamps: true,
  }
);

// Indexler
AICreditUsageSchema.index({ organizationId: 1, userId: 1, createdAt: -1 });
AICreditUsageSchema.index({ organizationId: 1, actionType: 1, createdAt: -1 });
AICreditUsageSchema.index({ organizationId: 1, provider: 1, createdAt: -1 });
AICreditUsageSchema.index({ status: 1, createdAt: -1 });
AICreditUsageSchema.index({ billable: 1, createdAt: -1 });

// Virtual: USD karşılığı (TRY ise)
AICreditUsageSchema.virtual('costInUsd').get(function() {
  if (this.cost.currency === 'USD') return this.cost.amount;
  // Basit çevrim (gerçek uygulamada API'den alınmalı)
  return this.cost.amount / 32;
});

// Method: İşlemi tamamla
AICreditUsageSchema.methods.complete = function(result: any, creditBalance: number, monthlyUsage: number, monthlyLimit: number) {
  this.status = 'completed';
  this.result = result;
  this.completedAt = new Date();
  this.creditBalanceAfter = creditBalance;
  this.monthlyUsageTotal = monthlyUsage;
  this.monthlyLimit = monthlyLimit;
  this.isLimitExceeded = monthlyUsage > monthlyLimit;
  return this.save();
};

// Method: İşlemi başarısız olarak işaretle
AICreditUsageSchema.methods.fail = function(errorCode: string, errorMessage: string, retryable: boolean = false) {
  this.status = 'failed';
  this.error = {
    code: errorCode,
    message: errorMessage,
    retryable,
  };
  this.completedAt = new Date();
  return this.save();
};

// Static: Aylık kullanım özeti
AICreditUsageSchema.statics.getMonthlyUsageSummary = async function(organizationId: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const result = await this.aggregate([
    {
      $match: {
        organizationId,
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed',
      },
    },
    {
      $group: {
        _id: '$actionType',
        totalCost: { $sum: '$cost.amount' },
        totalCreditsUsed: { $sum: '$cost.creditsUsed' },
        count: { $sum: 1 },
        avgProcessingTime: { $avg: '$result.processingTimeMs' },
      },
    },
  ]);

  const totalUsage = result.reduce((sum, item) => sum + item.totalCost, 0);
  const totalCredits = result.reduce((sum, item) => sum + item.totalCreditsUsed, 0);

  return {
    byActionType: result,
    totalCost: totalUsage,
    totalCreditsUsed: totalCredits,
    period: { year, month },
  };
};

// Static: Limit aşım riski olan kullanıcıları bul
AICreditUsageSchema.statics.findUsersNearLimit = async function(organizationId: string, thresholdPercent: number = 80) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const result = await this.aggregate([
    {
      $match: {
        organizationId,
        createdAt: { $gte: startOfMonth },
        status: 'completed',
      },
    },
    {
      $group: {
        _id: '$userId',
        totalCreditsUsed: { $sum: '$cost.creditsUsed' },
        lastUsedAt: { $max: '$createdAt' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $project: {
        userId: '$_id',
        totalCreditsUsed: 1,
        monthlyLimit: '$user.aiCreditLimit',
        usagePercent: {
          $multiply: [
            { $divide: ['$totalCreditsUsed', '$user.aiCreditLimit'] },
            100,
          ],
        },
        lastUsedAt: 1,
      },
    },
    {
      $match: {
        usagePercent: { $gte: thresholdPercent },
      },
    },
    {
      $sort: { usagePercent: -1 },
    },
  ]);

  return result;
};

export const AICreditUsage = models.AICreditUsage || model<IAICreditUsage>('AICreditUsage', AICreditUsageSchema);