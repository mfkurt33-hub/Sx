import { Schema, model, models, Document } from 'mongoose';

export interface IPaymentProvider extends Document {
  organizationId: string;
  name: string;
  type: 'iyzico' | 'param' | 'paytr' | 'gvp' | 'worldpay' | 'stripe' | 'paypal';
  isActive: boolean;
  isDefault: boolean;
  
  credentials: {
    apiKey: string;
    secretKey: string;
    merchantId?: string;
    terminalId?: string;
    [key: string]: string | undefined;
  };
  
  config: {
    supportedCards: string[];
    installments: Array<{
      bank: string;
      counts: number[];
    }>;
    commissionRate: number;
    minAmount: number;
    maxAmount: number;
    currency: 'TRY' | 'USD' | 'EUR';
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const PaymentProviderSchema = new Schema<IPaymentProvider>(
  {
    organizationId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['iyzico', 'param', 'paytr', 'gvp', 'worldpay', 'stripe', 'paypal'],
    },
    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    
    credentials: {
      apiKey: { type: String, required: true },
      secretKey: { type: String, required: true },
      merchantId: String,
      terminalId: String,
    },
    
    config: {
      supportedCards: [{ type: String }],
      installments: [{
        bank: String,
        counts: [Number],
      }],
      commissionRate: { type: Number, default: 0 },
      minAmount: { type: Number, default: 0 },
      maxAmount: { type: Number, default: 999999 },
      currency: { type: String, enum: ['TRY', 'USD', 'EUR'], default: 'TRY' },
    },
  },
  {
    timestamps: true,
  }
);

// Indexler
PaymentProviderSchema.index({ organizationId: 1, isActive: 1 });
PaymentProviderSchema.index({ type: 1 });

// Static: Aktif ödeme sağlayıcılarını bul
PaymentProviderSchema.statics.findActiveProviders = async function(organizationId: string) {
  return await this.find({ organizationId, isActive: true }).sort({ isDefault: -1 });
};

// Static: Varsayılan ödeme sağlayıcısını bul
PaymentProviderSchema.statics.findDefaultProvider = async function(organizationId: string) {
  return await this.findOne({ organizationId, isDefault: true, isActive: true });
};

export const PaymentProvider = models.PaymentProvider || model<IPaymentProvider>('PaymentProvider', PaymentProviderSchema);
