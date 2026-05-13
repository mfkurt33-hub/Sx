import { Schema, model, models, Document } from 'mongoose';

export interface IAccount extends Document {
  organizationId: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube' | 'google_my_business' | 'whatsapp';
  platformAccountId: string;
  platformUsername: string;
  platformDisplayName?: string;
  platformProfilePicture?: string;
  platformFollowers?: number;
  platformFollowing?: number;
  platformPostsCount?: number;

  // OAuth token yönetimi ve yenileme stratejisi
  oauthCredentials: {
    accessToken: string;
    refreshToken?: string;
    tokenType: string;
    expiresAt: Date;
    scope?: string[];
    lastRefreshedAt?: Date;
    refreshAttempts?: number;
    nextRefreshAt?: Date;
    isActive: boolean;
    isExpired: boolean;
    connectionStatus: 'connected' | 'disconnected' | 'error' | 'token_expired';
    lastConnectionCheckAt?: Date;
    connectionErrorReason?: string;
    notifyOnExpiration?: boolean;
    notificationEmails?: string[];
  };

  // İstatistikler
  insights?: {
    reach?: number;
    impressions?: number;
    engagement?: number;
    engagementRate?: number;
    lastFetchedAt?: Date;
  };

  // Meta veriler
  isActive: boolean;
  connectedAt: Date;
  disconnectedAt?: Date;
  lastSyncAt?: Date;
  syncStatus?: 'idle' | 'syncing' | 'error';
  syncError?: string;

  // Cross-posting için izinler
  canCrossPost: boolean;
  allowedCrossPostPlatforms?: string[];

  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    organizationId: { type: String, required: true, index: true },
    platform: {
      type: String,
      required: true,
      enum: ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube', 'google_my_business', 'whatsapp'],
      index: true,
    },
    platformAccountId: { type: String, required: true, index: true },
    platformUsername: { type: String, required: true },
    platformDisplayName: String,
    platformProfilePicture: String,
    platformFollowers: Number,
    platformFollowing: Number,
    platformPostsCount: Number,

    // OAuth token yönetimi
    oauthCredentials: {
      accessToken: { type: String, required: true },
      refreshToken: String,
      tokenType: { type: String, default: 'Bearer' },
      expiresAt: { type: Date, required: true },
      scope: [String],
      lastRefreshedAt: Date,
      refreshAttempts: { type: Number, default: 0 },
      nextRefreshAt: Date,
      isActive: { type: Boolean, default: true },
      isExpired: { type: Boolean, default: false },
      connectionStatus: {
        type: String,
        enum: ['connected', 'disconnected', 'error', 'token_expired'],
        default: 'connected',
      },
      lastConnectionCheckAt: Date,
      connectionErrorReason: String,
      notifyOnExpiration: { type: Boolean, default: true },
      notificationEmails: [String],
    },

    insights: {
      reach: Number,
      impressions: Number,
      engagement: Number,
      engagementRate: Number,
      lastFetchedAt: Date,
    },

    isActive: { type: Boolean, default: true },
    connectedAt: { type: Date, default: Date.now },
    disconnectedAt: Date,
    lastSyncAt: Date,
    syncStatus: { type: String, enum: ['idle', 'syncing', 'error'], default: 'idle' },
    syncError: String,

    canCrossPost: { type: Boolean, default: true },
    allowedCrossPostPlatforms: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexler
AccountSchema.index({ organizationId: 1, platform: 1 });
AccountSchema.index({ organizationId: 1, platformAccountId: 1 }, { unique: true });
AccountSchema.index({ 'oauthCredentials.expiresAt': 1 });
AccountSchema.index({ 'oauthCredentials.connectionStatus': 1 });
AccountSchema.index({ 'oauthCredentials.nextRefreshAt': 1 });

// Virtual: Token süresinin dolmasına kalan süre (dakika)
AccountSchema.virtual('tokenExpiresInMinutes').get(function() {
  const now = new Date();
  const expiresAt = this.oauthCredentials.expiresAt;
  const diffMs = expiresAt.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffMs / 60000));
});

// Virtual: Token otomatik yenilenmeli mi?
AccountSchema.virtual('shouldAutoRefresh').get(function() {
  return this.tokenExpiresInMinutes <= 15 && this.oauthCredentials.isActive;
});

// Method: Token süresi doldu mu kontrolü
AccountSchema.methods.isTokenExpired = function(): boolean {
  return new Date() >= this.oauthCredentials.expiresAt;
};

// Method: Token yenileme denemesini kaydet
AccountSchema.methods.recordRefreshAttempt = function(success: boolean) {
  if (!this.oauthCredentials.refreshAttempts) {
    this.oauthCredentials.refreshAttempts = 0;
  }

  if (success) {
    this.oauthCredentials.lastRefreshedAt = new Date();
    this.oauthCredentials.refreshAttempts = 0;
    this.oauthCredentials.isExpired = false;
    this.oauthCredentials.connectionStatus = 'connected';
  } else {
    this.oauthCredentials.refreshAttempts += 1;
    if (this.oauthCredentials.refreshAttempts >= 5) {
      this.oauthCredentials.isActive = false;
      this.oauthCredentials.connectionStatus = 'error';
      this.oauthCredentials.connectionErrorReason = 'Multiple refresh attempts failed';
    }
  }
  return this.save();
};

// Static: Süresi dolmak üzere olan tokenları bul
AccountSchema.statics.findExpiringTokens = function(organizationId: string, thresholdMinutes: number = 30) {
  const thresholdTime = new Date(Date.now() + thresholdMinutes * 60000);
  return this.find({
    organizationId,
    'oauthCredentials.isActive': true,
    'oauthCredentials.expiresAt': { $lte: thresholdTime, $gt: new Date() },
  });
};

// Static: Bağlantı sorunu olan hesapları bul
AccountSchema.statics.findConnectionIssues = function(organizationId?: string) {
  const query: any = {
    'oauthCredentials.connectionStatus': { $in: ['disconnected', 'error', 'token_expired'] },
  };
  if (organizationId) {
    query.organizationId = organizationId;
  }
  return this.find(query);
};

export const Account = models.Account || model<IAccount>('Account', AccountSchema);
