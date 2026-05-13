import { Schema, model, models, Document } from 'mongoose';

export interface IAICreditUsage extends Document {
  organizationId: string;
  userId: string;

  // Kullanım detayları
  actionType: 'image_generation' | 'text_generation' | 'video_generation' | 'analysis' | 'recommendation';
  provider: 'replicate' | 'fal_ai' | 'modal' | 'custom_gpu' | 'openai' | 'anthropic';
  model?: string;

  // Maliyet bilgileri
  cost: {
    amount: number;
    currency: 'TRY' | 'USD';
    creditsUsed: number;
    unitPrice: number;
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
  creditBalanceAfter: number;
  monthlyUsageTotal: number;
  monthlyLimit: number;
  isLimitExceeded: boolean;

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

    // AI maliyet takibi
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

  const totalUsage = result.reduce((sum: number, item: any) => sum + item.totalCost, 0);
  const totalCredits = result.reduce((sum: number, item: any) => sum + item.totalCreditsUsed, 0);

  return {
    byActionType: result,
    totalCost: totalUsage,
    totalCreditsUsed: totalCredits,
    period: { year, month },
  };
};

export const AICreditUsage = models.AICreditUsage || model<IAICreditUsage>('AICreditUsage', AICreditUsageSchema);
