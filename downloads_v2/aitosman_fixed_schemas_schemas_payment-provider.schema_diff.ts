--- aitosman_fixed_schemas/schemas/payment-provider.schema.ts (原始)


+++ aitosman_fixed_schemas/schemas/payment-provider.schema.ts (修改后)
import { Schema, model, models, Document } from 'mongoose';

export interface IPaymentProvider extends Document {
  organizationId: string;

  // KRİTİK DÜZELTME #01: Türkiye ödeme entegrasyonu
  providerType: 'stripe' | 'iyzico' | 'param' | 'paytr' | 'gvp' | 'world_pay';

  // Sağlayıcı kimlik bilgileri
  credentials: {
    apiKey?: string;
    secretKey?: string;
    merchantId?: string;
    merchantKey?: string;
    salt?: string;
    endpoint?: string;

    // Token ve erişim
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;

    // Durum
    isActive: boolean;
    isTestMode: boolean;
    lastVerifiedAt?: Date;
  };

  // Desteklenen ödeme yöntemleri
  supportedPaymentMethods: Array<{
    type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet' | 'installment';
    brand?: 'visa' | 'mastercard' | 'amex' | 'troy' | 'unionpay';
    enabled: boolean;
    minAmount?: number;
    maxAmount?: number;
    installmentOptions?: number[];
  }>;

  // Para birimi ayarları
  currency: 'TRY' | 'USD' | 'EUR';
  defaultCurrency: 'TRY';

  // Komisyon oranları
  commissionRates: {
    domesticCard: number; // Yerli kartlar için (%)
    internationalCard: number; // Yabancı kartlar için (%)
    digitalWallet: number;
    bankTransfer: number;
    installmentBase: number; // Taksit baz komisyonu
    installmentPerMonth: number; // Taksit başına ek komisyon
  };

  // Limitler
  limits: {
    minTransactionAmount: number;
    maxTransactionAmount: number;
    dailyLimit: number;
    monthlyLimit: number;
  };

  // Webhook ayarları
  webhookConfig: {
    url: string;
    secret: string;
    events: string[];
    isActive: boolean;
  };

  createdAt: Date;
  updatedAt: Date;
}

const PaymentProviderSchema = new Schema<IPaymentProvider>(
  {
    organizationId: { type: String, required: true, index: true },

    // KRİTİK DÜZELTME #01: Türkiye ödeme sağlayıcıları
    providerType: {
      type: String,
      required: true,
      enum: ['stripe', 'iyzico', 'param', 'paytr', 'gvp', 'world_pay'],
      index: true,
    },

    credentials: {
      apiKey: String,
      secretKey: String,
      merchantId: String,
      merchantKey: String,
      salt: String,
      endpoint: String,

      accessToken: String,
      refreshToken: String,
      tokenExpiresAt: Date,

      isActive: { type: Boolean, default: true },
      isTestMode: { type: Boolean, default: true },
      lastVerifiedAt: Date,
    },

    supportedPaymentMethods: [{
      type: { type: String, enum: ['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'installment'] },
      brand: { type: String, enum: ['visa', 'mastercard', 'amex', 'troy', 'unionpay'] },
      enabled: { type: Boolean, default: true },
      minAmount: Number,
      maxAmount: Number,
      installmentOptions: [Number],
    }],

    currency: { type: String, enum: ['TRY', 'USD', 'EUR'], default: 'TRY' },
    defaultCurrency: { type: String, default: 'TRY' },

    commissionRates: {
      domesticCard: { type: Number, default: 2.5 },
      internationalCard: { type: Number, default: 3.5 },
      digitalWallet: { type: Number, default: 2.0 },
      bankTransfer: { type: Number, default: 1.0 },
      installmentBase: { type: Number, default: 0 },
      installmentPerMonth: { type: Number, default: 0.5 },
    },

    limits: {
      minTransactionAmount: { type: Number, default: 1 },
      maxTransactionAmount: { type: Number, default: 500000 },
      dailyLimit: { type: Number, default: 1000000 },
      monthlyLimit: { type: Number, default: 10000000 },
    },

    webhookConfig: {
      url: String,
      secret: String,
      events: [String],
      isActive: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Indexler
PaymentProviderSchema.index({ organizationId: 1, providerType: 1 });
PaymentProviderSchema.index({ 'credentials.isActive': 1, providerType: 1 });

// Method: Test modundan canlı moda geç
PaymentProviderSchema.methods.goLive = function() {
  this.credentials.isTestMode = false;
  return this.save();
};

// Static: Aktif ödeme sağlayıcısını bul
PaymentProviderSchema.statics.findActiveProvider = function(organizationId: string, providerType?: string) {
  const query: any = {
    organizationId,
    'credentials.isActive': true,
  };
  if (providerType) {
    query.providerType = providerType;
  }
  return this.findOne(query).sort({ 'credentials.lastVerifiedAt': -1 });
};

export const PaymentProvider = models.PaymentProvider || model<IPaymentProvider>('PaymentProvider', PaymentProviderSchema);