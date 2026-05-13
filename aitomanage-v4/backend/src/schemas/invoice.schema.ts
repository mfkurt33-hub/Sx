/**
 * V4 #04 — E-Fatura & GİB Entegrasyonu
 *
 * Türkiye'de abonelik geliri alan her SaaS için yasal zorunluluk.
 * Her başarılı ödeme sonrası otomatik e-arşiv fatura oluşturur.
 *
 * Entegrasyon: GİB e-Belge Sistemi (eFatura/eArşiv)
 * Servis önerileri: İzibiz, Logo e-Fatura, Paraşüt, Luca
 */

import mongoose, { Schema, model, models, Document } from 'mongoose';

// ─── FATURA ────────────────────────────────────────────────────────────────

export interface IInvoice extends Document {
  organizationId: string;
  transactionId?: string;       // payment transaction ID ile bağlantı

  // Fatura tipi
  type: 'e_arsiv' | 'e_fatura' | 'e_smm';   // SMM: Serbest Meslek Makbuzu
  scenario: 'TICARIFATURA' | 'TEMELFATURA';

  // Fatura numarası (GİB formatı: ABC2025000000001)
  invoiceNumber: string;
  series: string;               // "ABC" gibi sabit prefix
  sequenceNumber: number;

  // Tarihler
  invoiceDate: Date;
  dueDate?: Date;
  cancelledAt?: Date;

  // Alıcı (müşteri) bilgileri
  customer: {
    organizationId: string;
    name: string;               // Şirket adı veya ad-soyad
    taxNumber?: string;         // Vergi/TC no
    taxOffice?: string;         // Vergi dairesi
    email: string;
    phone?: string;
    address: {
      street: string;
      city: string;
      district?: string;
      postalCode?: string;
      country: string;
    };
    isCompany: boolean;
  };

  // Kalemler
  lines: {
    description: string;        // "AiToManage Başlangıç Planı - Aylık"
    quantity: number;
    unitPrice: number;          // KDV hariç birim fiyat
    discountRate?: number;      // İndirim oranı (%)
    vatRate: number;            // KDV oranı (0, 1, 8, 18, 20)
    vatAmount: number;
    totalWithoutVat: number;
    totalWithVat: number;
  }[];

  // Toplamlar
  totals: {
    subtotal: number;           // KDV hariç toplam
    totalDiscount: number;
    totalVat: number;
    grandTotal: number;         // Ödenecek toplam
    currency: 'TRY' | 'USD' | 'EUR';
    exchangeRate?: number;      // TRY dışı para birimi için kur
  };

  // GİB durumu
  gib: {
    status: 'draft' | 'sending' | 'sent' | 'accepted' | 'rejected' | 'cancelled';
    uuid?: string;              // GİB tarafından atanan UUID
    ettn?: string;              // Elektronik Ticaret Takip Numarası
    sentAt?: Date;
    acceptedAt?: Date;
    rejectedAt?: Date;
    rejectionReason?: string;
    pdfUrl?: string;            // İmzalı fatura PDF URL
    xmlUrl?: string;            // UBL-TR XML URL
    qrCode?: string;            // GİB QR kodu
  };

  // Email gönderimi
  emailSent: boolean;
  emailSentAt?: Date;
  emailAddress?: string;

  // İptal/İade
  isCancelled: boolean;
  cancelReason?: string;
  originalInvoiceId?: string;   // İade faturası ise orijinal fatura ID

  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    organizationId: { type: String, required: true, index: true },
    transactionId: { type: String, index: true },

    type: {
      type: String,
      enum: ['e_arsiv', 'e_fatura', 'e_smm'],
      required: true,
      default: 'e_arsiv',
    },
    scenario: {
      type: String,
      enum: ['TICARIFATURA', 'TEMELFATURA'],
      default: 'TICARIFATURA',
    },

    invoiceNumber: { type: String, required: true, unique: true },
    series: { type: String, required: true, default: 'ATM' },
    sequenceNumber: { type: Number, required: true },

    invoiceDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date },
    cancelledAt: { type: Date },

    customer: {
      organizationId: { type: String, required: true },
      name: { type: String, required: true },
      taxNumber: { type: String },
      taxOffice: { type: String },
      email: { type: String, required: true },
      phone: { type: String },
      address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        district: { type: String },
        postalCode: { type: String },
        country: { type: String, default: 'Türkiye' },
      },
      isCompany: { type: Boolean, default: false },
    },

    lines: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true, min: 0 },
        unitPrice: { type: Number, required: true, min: 0 },
        discountRate: { type: Number, min: 0, max: 100, default: 0 },
        vatRate: { type: Number, enum: [0, 1, 8, 18, 20], default: 20 },
        vatAmount: { type: Number, required: true },
        totalWithoutVat: { type: Number, required: true },
        totalWithVat: { type: Number, required: true },
      },
    ],

    totals: {
      subtotal: { type: Number, required: true },
      totalDiscount: { type: Number, default: 0 },
      totalVat: { type: Number, required: true },
      grandTotal: { type: Number, required: true },
      currency: { type: String, enum: ['TRY', 'USD', 'EUR'], default: 'TRY' },
      exchangeRate: { type: Number },
    },

    gib: {
      status: {
        type: String,
        enum: ['draft', 'sending', 'sent', 'accepted', 'rejected', 'cancelled'],
        default: 'draft',
      },
      uuid: { type: String },
      ettn: { type: String },
      sentAt: { type: Date },
      acceptedAt: { type: Date },
      rejectedAt: { type: Date },
      rejectionReason: { type: String },
      pdfUrl: { type: String },
      xmlUrl: { type: String },
      qrCode: { type: String },
    },

    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date },
    emailAddress: { type: String },

    isCancelled: { type: Boolean, default: false, index: true },
    cancelReason: { type: String },
    originalInvoiceId: { type: String },

    notes: { type: String },
  },
  { timestamps: true }
);

// Indexler
InvoiceSchema.index({ organizationId: 1, invoiceDate: -1 });
InvoiceSchema.index({ 'gib.status': 1 });
InvoiceSchema.index({ invoiceNumber: 1 }, { unique: true });

// Fatura numarası üret: ATM2025000001
InvoiceSchema.statics.generateInvoiceNumber = async function (series = 'ATM') {
  const year = new Date().getFullYear();
  const lastInvoice = await this.findOne({ series })
    .sort({ sequenceNumber: -1 })
    .select('sequenceNumber');

  const nextSeq = (lastInvoice?.sequenceNumber ?? 0) + 1;
  const number = `${series}${year}${String(nextSeq).padStart(6, '0')}`;
  return { invoiceNumber: number, sequenceNumber: nextSeq };
};

// Abonelik ödemesinden fatura oluştur
InvoiceSchema.statics.createFromSubscription = async function ({
  organizationId,
  transactionId,
  customerData,
  planName,
  amount,
  vatRate = 20,
}: {
  organizationId: string;
  transactionId: string;
  customerData: IInvoice['customer'];
  planName: string;
  amount: number;
  vatRate?: number;
}) {
  const { invoiceNumber, sequenceNumber } = await this.generateInvoiceNumber();

  const subtotal = amount / (1 + vatRate / 100);
  const vatAmount = amount - subtotal;

  return this.create({
    organizationId,
    transactionId,
    type: 'e_arsiv',
    invoiceNumber,
    sequenceNumber,
    invoiceDate: new Date(),
    customer: customerData,
    lines: [
      {
        description: `AiToManage ${planName} - Aylık Abonelik`,
        quantity: 1,
        unitPrice: subtotal,
        vatRate,
        vatAmount,
        totalWithoutVat: subtotal,
        totalWithVat: amount,
      },
    ],
    totals: {
      subtotal,
      totalDiscount: 0,
      totalVat: vatAmount,
      grandTotal: amount,
      currency: 'TRY',
    },
    gib: { status: 'draft' },
  });
};

// GİB'e gönderilmesi bekleyenleri getir
InvoiceSchema.statics.findPendingGibSubmission = function () {
  return this.find({ 'gib.status': 'draft', isCancelled: false }).limit(50);
};

export const Invoice = models.Invoice || model<IInvoice>('Invoice', InvoiceSchema);
