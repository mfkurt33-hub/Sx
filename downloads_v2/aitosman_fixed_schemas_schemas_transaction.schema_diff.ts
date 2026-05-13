--- aitosman_fixed_schemas/schemas/transaction.schema.ts (原始)


+++ aitosman_fixed_schemas/schemas/transaction.schema.ts (修改后)
import { Schema, model, models, Document } from 'mongoose';

export interface ITransaction extends Document {
  organizationId: string;
  paymentProviderId: string;

  // İşlem bilgileri
  transactionType: 'payment' | 'refund' | 'chargeback' | 'subscription' | 'one_time';
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR';

  // Müşteri bilgileri
  customer: {
    id: string;
    email: string;
    name?: string;
    phone?: string;
  };

  // Ödeme yöntemi
  paymentMethod: {
    type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet';
    brand?: string;
    lastFourDigits?: string;
    installmentCount?: number;
  };

  // İşlem durumu
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  providerTransactionId?: string;

  // Hata bilgileri
  error?: {
    code: string;
    message: string;
    details?: any;
  };

  // Komisyon ve maliyetler
  commission: {
    rate: number;
    amount: number;
    installmentCommission?: number;
    totalCommission: number;
  };

  // Net tutar (komisyon düşüldükten sonra)
  netAmount: number;

  // İade bilgileri
  refund?: {
    reason: string;
    amount: number;
    refundedAt: Date;
    refundedBy: string;
  };

  // Meta veriler
  description?: string;
  metadata?: Record<string, any>;

  // Zaman damgaları
  initiatedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    organizationId: { type: String, required: true, index: true },
    paymentProviderId: { type: String, ref: 'PaymentProvider', required: true, index: true },

    transactionType: {
      type: String,
      required: true,
      enum: ['payment', 'refund', 'chargeback', 'subscription', 'one_time'],
      index: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ['TRY', 'USD', 'EUR'], default: 'TRY' },

    customer: {
      id: { type: String, required: true },
      email: { type: String, required: true },
      name: String,
      phone: String,
    },

    paymentMethod: {
      type: { type: String, enum: ['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet'] },
      brand: String,
      lastFourDigits: String,
      installmentCount: Number,
    },

    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
      index: true,
    },
    providerTransactionId: String,

    error: {
      code: String,
      message: String,
      details: Schema.Types.Mixed,
    },

    commission: {
      rate: { type: Number, required: true },
      amount: { type: Number, required: true },
      installmentCommission: Number,
      totalCommission: { type: Number, required: true },
    },

    netAmount: { type: Number, required: true },

    refund: {
      reason: String,
      amount: Number,
      refundedAt: Date,
      refundedBy: String,
    },

    description: String,
    metadata: Schema.Types.Mixed,

    initiatedAt: { type: Date, default: Date.now },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexler
TransactionSchema.index({ organizationId: 1, status: 1 });
TransactionSchema.index({ organizationId: 1, createdAt: -1 });
TransactionSchema.index({ 'customer.id': 1, createdAt: -1 });
TransactionSchema.index({ providerTransactionId: 1 }, { unique: true, sparse: true });

// Virtual: KDV dahil mi (Türkiye için)
TransactionSchema.virtual('includesVat').get(function() {
  return this.currency === 'TRY';
});

// Method: İşlemi tamamla
TransactionSchema.methods.complete = function(providerTransactionId: string) {
  this.status = 'completed';
  this.providerTransactionId = providerTransactionId;
  this.completedAt = new Date();
  return this.save();
};

// Method: İşlemi başarısız olarak işaretle
TransactionSchema.methods.fail = function(errorCode: string, errorMessage: string, details?: any) {
  this.status = 'failed';
  this.error = {
    code: errorCode,
    message: errorMessage,
    details,
  };
  this.completedAt = new Date();
  return this.save();
};

// Static: Başarısız işlemleri bul
TransactionSchema.statics.findFailedTransactions = function(organizationId: string, since?: Date) {
  const query: any = {
    organizationId,
    status: 'failed',
  };
  if (since) {
    query.createdAt = { $gte: since };
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static: Günlük toplam işlem hacmi
TransactionSchema.statics.getDailyVolume = async function(organizationId: string, date: Date) {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  const result = await this.aggregate([
    {
      $match: {
        organizationId,
        status: 'completed',
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalCommission: { $sum: '$commission.totalCommission' },
        netAmount: { $sum: '$netAmount' },
        count: { $sum: 1 },
      },
    },
  ]);

  return result[0] || { totalAmount: 0, totalCommission: 0, netAmount: 0, count: 0 };
};

export const Transaction = models.Transaction || model<ITransaction>('Transaction', TransactionSchema);