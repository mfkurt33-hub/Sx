/**
 * V4 #03 — Reseller / Ajans Şeması
 *
 * Dijital ajansların birden fazla müşteri işletmesini
 * tek panel üzerinden yönetmesini ve komisyon kazanmasını sağlar.
 */

import mongoose, { Schema, model, models, Document } from 'mongoose';

// ─── RESELLER ──────────────────────────────────────────────────────────────

export interface IReseller extends Document {
  // Temel bilgiler
  userId: string;               // Ajansın platform user ID'si
  organizationId: string;       // Ajansın kendi organizasyonu (platform hesabı)

  businessName: string;         // Ajans/firma adı
  contactEmail: string;
  contactPhone?: string;
  website?: string;

  // White-label ayarları
  whiteLabel: {
    isEnabled: boolean;
    brandName?: string;         // Müşterilere gösterilen marka adı
    logoUrl?: string;
    primaryColor?: string;
    customDomain?: string;      // app.ajansadi.com gibi
    supportEmail?: string;
  };

  // Komisyon yapısı
  commission: {
    model: 'percentage' | 'flat_fee' | 'hybrid';
    percentage?: number;        // %15 gibi
    flatFee?: number;           // Sabit TL tutarı
    currency: 'TRY' | 'USD';
    billingCycle: 'monthly' | 'quarterly' | 'yearly';
    minimumPayout: number;      // Minimum ödeme eşiği
  };

  // Müşteri havuzu
  clients: {
    organizationId: string;
    addedAt: Date;
    status: 'active' | 'suspended' | 'churned';
    plan: string;
    monthlyRevenue: number;
    commissionEarned: number;
  }[];

  // Fatura özeti (aylık hesaplama)
  billingHistory: {
    period: string;             // "2025-01"
    totalRevenue: number;
    commissionAmount: number;
    clientCount: number;
    isPaid: boolean;
    paidAt?: Date;
    invoiceUrl?: string;
  }[];

  // Sınırlar ve yetkiler
  limits: {
    maxClients: number;
    canCreateSubResellers: boolean;
    canSetCustomPricing: boolean;
    canAccessClientAnalytics: boolean;
  };

  // Durum
  status: 'pending' | 'active' | 'suspended' | 'terminated';
  approvedAt?: Date;
  approvedBy?: string;
  suspendedAt?: Date;
  suspendReason?: string;

  // Banka / ödeme bilgileri
  payoutInfo: {
    iban?: string;
    bankName?: string;
    accountHolder?: string;
    taxNumber?: string;         // Vergi numarası (fatura için)
  };

  createdAt: Date;
  updatedAt: Date;
}

const ResellerSchema = new Schema<IReseller>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    organizationId: { type: String, required: true, unique: true, index: true },

    businessName: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String },
    website: { type: String },

    whiteLabel: {
      isEnabled: { type: Boolean, default: false },
      brandName: { type: String },
      logoUrl: { type: String },
      primaryColor: { type: String, default: '#7F77DD' },
      customDomain: { type: String },
      supportEmail: { type: String },
    },

    commission: {
      model: { type: String, enum: ['percentage', 'flat_fee', 'hybrid'], default: 'percentage' },
      percentage: { type: Number, min: 0, max: 50, default: 20 },
      flatFee: { type: Number, min: 0 },
      currency: { type: String, enum: ['TRY', 'USD'], default: 'TRY' },
      billingCycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
      minimumPayout: { type: Number, default: 500 },
    },

    clients: [
      {
        organizationId: { type: String, required: true },
        addedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['active', 'suspended', 'churned'], default: 'active' },
        plan: { type: String },
        monthlyRevenue: { type: Number, default: 0 },
        commissionEarned: { type: Number, default: 0 },
      },
    ],

    billingHistory: [
      {
        period: { type: String, required: true },
        totalRevenue: { type: Number, default: 0 },
        commissionAmount: { type: Number, default: 0 },
        clientCount: { type: Number, default: 0 },
        isPaid: { type: Boolean, default: false },
        paidAt: { type: Date },
        invoiceUrl: { type: String },
      },
    ],

    limits: {
      maxClients: { type: Number, default: 50 },
      canCreateSubResellers: { type: Boolean, default: false },
      canSetCustomPricing: { type: Boolean, default: false },
      canAccessClientAnalytics: { type: Boolean, default: true },
    },

    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'terminated'],
      default: 'pending',
      index: true,
    },

    approvedAt: { type: Date },
    approvedBy: { type: String },
    suspendedAt: { type: Date },
    suspendReason: { type: String },

    payoutInfo: {
      iban: { type: String },
      bankName: { type: String },
      accountHolder: { type: String },
      taxNumber: { type: String },
    },
  },
  { timestamps: true }
);

// Aktif müşteri sayısı
ResellerSchema.virtual('activeClientCount').get(function () {
  return this.clients.filter((c) => c.status === 'active').length;
});

// Bu ay toplam komisyon
ResellerSchema.virtual('currentMonthCommission').get(function () {
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const billing = this.billingHistory.find((b) => b.period === period);
  return billing?.commissionAmount ?? 0;
});

// Yeni müşteri ekle
ResellerSchema.methods.addClient = async function (
  organizationId: string,
  plan: string,
  monthlyRevenue: number
) {
  const exists = this.clients.find((c: any) => c.organizationId === organizationId);
  if (exists) throw new Error('Bu organizasyon zaten müşteriniz');

  if (this.clients.filter((c: any) => c.status === 'active').length >= this.limits.maxClients) {
    throw new Error(`Maksimum müşteri limitine (${this.limits.maxClients}) ulaştınız`);
  }

  this.clients.push({
    organizationId,
    addedAt: new Date(),
    status: 'active',
    plan,
    monthlyRevenue,
    commissionEarned: 0,
  });

  return this.save();
};

// Aylık komisyon hesapla ve kaydet
ResellerSchema.methods.calculateMonthlyCommission = async function (period: string) {
  const activeClients = this.clients.filter((c: any) => c.status === 'active');
  const totalRevenue = activeClients.reduce((sum: number, c: any) => sum + c.monthlyRevenue, 0);

  let commissionAmount = 0;
  if (this.commission.model === 'percentage') {
    commissionAmount = (totalRevenue * (this.commission.percentage ?? 20)) / 100;
  } else if (this.commission.model === 'flat_fee') {
    commissionAmount = (this.commission.flatFee ?? 0) * activeClients.length;
  } else {
    // hybrid
    commissionAmount =
      (totalRevenue * (this.commission.percentage ?? 10)) / 100 +
      (this.commission.flatFee ?? 0) * activeClients.length;
  }

  const existing = this.billingHistory.find((b: any) => b.period === period);
  if (existing) {
    existing.totalRevenue = totalRevenue;
    existing.commissionAmount = commissionAmount;
    existing.clientCount = activeClients.length;
  } else {
    this.billingHistory.push({
      period,
      totalRevenue,
      commissionAmount,
      clientCount: activeClients.length,
      isPaid: false,
    });
  }

  return this.save();
};

// Static: Ödeme bekleyen resellerları getir
ResellerSchema.statics.findPendingPayouts = function () {
  return this.find({
    status: 'active',
    'billingHistory': {
      $elemMatch: { isPaid: false, commissionAmount: { $gt: 0 } },
    },
  });
};

export const Reseller = models.Reseller || model<IReseller>('Reseller', ResellerSchema);
