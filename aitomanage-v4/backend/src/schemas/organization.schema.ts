import { Schema, model, models, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  logo?: string;
  website?: string;

  // Sektör bilgisi
  sector: string;
  industry?: string;
  size: '1-10' | '11-50' | '51-200' | '201-500' | '500+';

  // Marka sesi ve tercihler
  brandVoice: {
    tone: 'professional' | 'friendly' | 'humorous' | 'inspirational' | 'educational' | 'promotional';
    style: string[];
    keywords: string[];
    avoidWords: string[];
    description?: string;
  };

  // Abonelik
  subscription: {
    plan: 'free' | 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired' | 'trial';
    startDate: Date;
    endDate?: Date;
    trialEndsAt?: Date;
    autoRenew: boolean;
    maxUsers: number;
    maxSocialAccounts: number;
    aiCreditsPerMonth: number;
  };

  // İletişim
  contact: {
    email: string;
    phone?: string;
    address: {
      street?: string;
      city?: string;
      district?: string;
      postalCode?: string;
      country: string;
    };
  };

  // Sosyal medya hesapları
  socialAccounts: Array<{
    platform: string;
    accountId: string;
    username: string;
    isConnected: boolean;
    connectedAt?: Date;
  }>;

  // Takım üyeleri
  teamMembers: Array<{
    userId: string;
    email: string;
    name: string;
    role: 'owner' | 'admin' | 'member';
    invitedAt: Date;
    joinedAt?: Date;
    isActive: boolean;
  }>;

  // Ayarlar
  settings: {
    defaultLanguage: 'tr' | 'en';
    timezone: string;
    currency: 'TRY' | 'USD';
    invoiceEmail: string;
    autoPublish: boolean;
    requireApproval: boolean;
  };

  // Durum
  isActive: boolean;
  isVerified: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    slug: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true,
      trim: true,
      index: true,
    },
    logo: String,
    website: String,

    sector: { type: String, required: true },
    industry: String,
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
      default: '1-10',
    },

    brandVoice: {
      tone: {
        type: String,
        enum: ['professional', 'friendly', 'humorous', 'inspirational', 'educational', 'promotional'],
        default: 'professional',
      },
      style: [String],
      keywords: [String],
      avoidWords: [String],
      description: String,
    },

    subscription: {
      plan: {
        type: String,
        enum: ['free', 'starter', 'professional', 'enterprise'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'cancelled', 'expired', 'trial'],
        default: 'trial',
      },
      startDate: { type: Date, default: Date.now },
      endDate: Date,
      trialEndsAt: Date,
      autoRenew: { type: Boolean, default: true },
      maxUsers: { type: Number, default: 3 },
      maxSocialAccounts: { type: Number, default: 5 },
      aiCreditsPerMonth: { type: Number, default: 100 },
    },

    contact: {
      email: { type: String, required: true },
      phone: String,
      address: {
        street: String,
        city: String,
        district: String,
        postalCode: String,
        country: { type: String, default: 'Turkey' },
      },
    },

    socialAccounts: [{
      platform: String,
      accountId: String,
      username: String,
      isConnected: { type: Boolean, default: false },
      connectedAt: Date,
    }],

    teamMembers: [{
      userId: String,
      email: String,
      name: String,
      role: { type: String, enum: ['owner', 'admin', 'member'] },
      invitedAt: Date,
      joinedAt: Date,
      isActive: { type: Boolean, default: true },
    }],

    settings: {
      defaultLanguage: { type: String, enum: ['tr', 'en'], default: 'tr' },
      timezone: { type: String, default: 'Europe/Istanbul' },
      currency: { type: String, enum: ['TRY', 'USD'], default: 'TRY' },
      invoiceEmail: String,
      autoPublish: { type: Boolean, default: false },
      requireApproval: { type: Boolean, default: true },
    },

    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexler
OrganizationSchema.index({ slug: 1 });
OrganizationSchema.index({ 'subscription.plan': 1 });
OrganizationSchema.index({ 'subscription.status': 1 });
OrganizationSchema.index({ isActive: 1 });

// Virtual: Kalan gün (trial veya subscription)
OrganizationSchema.virtual('daysRemaining').get(function() {
  const endDate = this.subscription.trialEndsAt || this.subscription.endDate;
  if (!endDate) return null;
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
});

// Virtual: Abonelik aktif mi?
OrganizationSchema.virtual('isSubscriptionActive').get(function() {
  const now = new Date();
  if (this.subscription.status !== 'active' && this.subscription.status !== 'trial') return false;
  if (this.subscription.endDate && now > this.subscription.endDate) return false;
  return true;
});

// Method: Takım üyesi ekle
OrganizationSchema.methods.addTeamMember = function(email: string, name: string, role: 'admin' | 'member') {
  const member = {
    userId: '',
    email,
    name,
    role,
    invitedAt: new Date(),
    isActive: true,
  };
  this.teamMembers.push(member);
  return this.save();
};

// Method: Sosyal medya hesabı bağla
OrganizationSchema.methods.connectSocialAccount = function(platform: string, accountId: string, username: string) {
  const existing = this.socialAccounts.find(acc => acc.platform === platform && acc.accountId === accountId);
  if (existing) {
    existing.isConnected = true;
    existing.connectedAt = new Date();
    existing.username = username;
  } else {
    this.socialAccounts.push({
      platform,
      accountId,
      username,
      isConnected: true,
      connectedAt: new Date(),
    });
  }
  return this.save();
};

// Static: Aktif organizasyonları bul
OrganizationSchema.statics.findActive = function(plan?: string) {
  const query: any = { isActive: true };
  if (plan) {
    query['subscription.plan'] = plan;
  }
  return this.find(query);
};

// Static: Trial süresi bitmek üzere olan organizasyonları bul
OrganizationSchema.statics.findExpiringTrials = function(daysThreshold: number = 3) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
  
  return this.find({
    isActive: true,
    'subscription.status': 'trial',
    'subscription.trialEndsAt': { $lte: thresholdDate, $gt: new Date() },
  });
};

export const Organization = models.Organization || model<IOrganization>('Organization', OrganizationSchema);
