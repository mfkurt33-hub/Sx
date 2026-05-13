import { Schema, model, models, Document } from 'mongoose';

export interface ITransaction extends Document {
  organizationId: string;
  userId: string;
  
  type: 'payment' | 'refund' | 'chargeback' | 'subscription' | 'one_time' | 'credit_purchase';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  
  amount: {
    total: number;
    subtotal: number;
    tax: number;
    discount: number;
    currency: 'TRY' | 'USD' | 'EUR';
  };
  
  paymentMethod: {
    type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet' | 'crypto';
    provider: string; // iyzico, param, paytr, etc.
    cardBrand?: string; // visa, mastercard, etc.
    lastFourDigits?: string;
    installmentCount?: number;
  };
  
  subscription?: {
    planId: string;
    planName: string;
    billingCycle: 'monthly' | 'yearly' | 'quarterly';
    periodStart: Date;
    periodEnd: Date;
    isTrial: boolean;
  };
  
  aiCredits?: {
    creditsPurchased: number;
    creditsUsed: number;
    costPerCredit: number;
  };
  
  invoice?: {
    invoiceId: string;
    invoiceNumber: string;
    gibUuid?: string;
  };
  
  metadata: {
    ipAddress: string;
    userAgent: string;
    sessionId?: string;
    description?: string;
  };
  
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    organizationId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    
    type: {
      type: String,
      required: true,
      enum: ['payment', 'refund', 'chargeback', 'subscription', 'one_time', 'credit_purchase'],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
      index: true,
    },
    
    amount: {
      total: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      currency: { type: String, enum: ['TRY', 'USD', 'EUR'], default: 'TRY' },
    },
    
    paymentMethod: {
      type: {
        type: String,
        required: true,
        enum: ['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'crypto'],
      },
      provider: { type: String, required: true },
      cardBrand: String,
      lastFourDigits: String,
      installmentCount: Number,
    },
    
    subscription: {
      planId: String,
      planName: String,
      billingCycle: { type: String, enum: ['monthly', 'yearly', 'quarterly'] },
      periodStart: Date,
      periodEnd: Date,
      isTrial: { type: Boolean, default: false },
    },
    
    aiCredits: {
      creditsPurchased: Number,
      creditsUsed: Number,
      costPerCredit: Number,
    },
    
    invoice: {
      invoiceId: String,
      invoiceNumber: String,
      gibUuid: String,
    },
    
    metadata: {
      ipAddress: { type: String, required: true },
      userAgent: { type: String, required: true },
      sessionId: String,
      description: String,
    },
    
    error: {
      code: String,
      message: String,
      details: Schema.Types.Mixed,
    },
    
    processedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexler
TransactionSchema.index({ organizationId: 1, status: 1 });
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, status: 1 });
TransactionSchema.index({ 'invoice.invoiceNumber': 1 });
TransactionSchema.index({ createdAt: -1 });

// Virtual: İşlem başarılı mı?
TransactionSchema.virtual('isSuccessful').get(function() {
  return this.status === 'completed';
});

// Method: İşlemi tamamla
TransactionSchema.methods.complete = function() {
  this.status = 'completed';
  this.processedAt = new Date();
  return this.save();
};

// Method: İşlemi başarısız yap
TransactionSchema.methods.fail = function(errorCode: string, errorMessage: string, details?: any) {
  this.status = 'failed';
  this.error = {
    code: errorCode,
    message: errorMessage,
    details,
  };
  return this.save();
};

// Static: Başarılı işlemleri bul
TransactionSchema.statics.findSuccessful = async function(organizationId: string, startDate?: Date, endDate?: Date) {
  const query: any = { organizationId, status: 'completed' };
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }
  return await this.find(query).sort({ createdAt: -1 });
};

// Static: Toplam gelir hesaplama
TransactionSchema.statics.calculateRevenue = async function(
  organizationId: string,
  startDate: Date,
  endDate: Date
) {
  const result = await this.aggregate([
    {
      $match: {
        organizationId,
        status: 'completed',
        createdAt: { $gte: startDate, $lte: endDate },
        type: { $in: ['payment', 'subscription', 'one_time', 'credit_purchase'] },
      },
    },
    {
      $group: {
        _id: '$amount.currency',
        totalRevenue: { $sum: '$amount.total' },
        count: { $sum: 1 },
      },
    },
  ]);
  return result;
};

export const Transaction = models.Transaction || model<ITransaction>('Transaction', TransactionSchema);
