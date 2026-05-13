--- aitosman_fixed_schemas/schemas/content-post.schema.ts (原始)


+++ aitosman_fixed_schemas/schemas/content-post.schema.ts (修改后)
import { Schema, model, models, Document } from 'mongoose';

export interface IContentPost extends Document {
  organizationId: string;

  // KRİTİK DÜZELTME #05: Cross-posting desteği - tek accountId yerine multiple
  accountIds: string[]; // Birden fazla sosyal medya hesabına gönderim

  // İçerik detayları
  content: {
    text?: string;
    media?: Array<{
      type: 'image' | 'video' | 'gif' | 'carousel';
      url: string;
      thumbnailUrl?: string;
      alt?: string;
      width?: number;
      height?: number;
      size?: number;
    }>;
    hashtags?: string[];
    mentions?: string[];
    location?: {
      name: string;
      latitude?: number;
      longitude?: number;
      platformLocationId?: string;
    };
  };

  // Platform-specific özelleştirmeler (her platform için farklı içerik)
  platformSpecificContent?: {
    instagram?: {
      caption?: string;
      firstComment?: string;
      tagUsers?: string[];
      productTags?: Array<{ productId: string; x: number; y: number }>;
    };
    facebook?: {
      message?: string;
      link?: string;
      callToAction?: { type: string; value: any };
    };
    twitter?: {
      text?: string;
      poll?: {
        question: string;
        options: string[];
        durationMinutes: number;
      };
    };
    linkedin?: {
      title?: string;
      articleUrl?: string;
      visibility?: 'public' | 'connections' | 'company';
    };
  };

  // Durum ve zamanlama
  status: 'draft' | 'scheduled' | 'pending_approval' | 'approved' | 'rejected' | 'publishing' | 'published' | 'failed' | 'archived';
  scheduledAt?: Date;
  publishedAt?: Date;

  // KRİTİK DÜZELTME #04: İçerik onay akışı geçmişi
  approvalHistory: Array<{
    action: 'submitted' | 'approved' | 'rejected' | 'revision_requested';
    userId: string;
    userName: string;
    userRole: string;
    timestamp: Date;
    comments?: string;
    revisionNumber?: number;
  }>;

  // Onay durumu
  approvalStatus?: {
    isApproved: boolean;
    approvedBy?: string;
    approvedAt?: Date;
    rejectedBy?: string;
    rejectedAt?: Date;
    rejectionReason?: string;
    revisionCount: number;
    currentRevision: number;
  };

  // Yayınlanma sonuçları (her platform için ayrı)
  publishResults?: Array<{
    accountId: string;
    platform: string;
    status: 'success' | 'failed' | 'pending';
    platformPostId?: string;
    platformPostUrl?: string;
    errorMessage?: string;
    publishedAt?: Date;
    metrics?: {
      likes?: number;
      comments?: number;
      shares?: number;
      reach?: number;
      impressions?: number;
    };
  }>;

  // AI ile oluşturulduysa
  aiGenerated?: {
    isAiGenerated: boolean;
    provider: 'replicate' | 'fal_ai' | 'modal' | 'custom_gpu';
    prompt?: string;
    model?: string;
    processingLogId?: string;
    cost?: number;
    generationTime?: number;
  };

  // Performans tahmini (#14)
  performancePrediction?: {
    predictedReach?: number;
    predictedEngagement?: number;
    predictedLikes?: number;
    predictedComments?: number;
    confidenceScore: number;
    bestPostingTime?: Date;
    recommendations?: string[];
    analyzedAt: Date;
  };

  // Etiketler ve kategoriler
  campaignId?: string;
  tags?: string[];
  category?: string;

  // Meta veriler
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContentPostSchema = new Schema<IContentPost>(
  {
    organizationId: { type: String, required: true, index: true },

    // KRİTİK DÜZELTME #05: Cross-posting
    accountIds: [{ type: String, ref: 'Account', required: true }],

    content: {
      text: String,
      media: [{
        type: { type: String, enum: ['image', 'video', 'gif', 'carousel'] },
        url: { type: String, required: true },
        thumbnailUrl: String,
        alt: String,
        width: Number,
        height: Number,
        size: Number,
      }],
      hashtags: [String],
      mentions: [String],
      location: {
        name: String,
        latitude: Number,
        longitude: Number,
        platformLocationId: String,
      },
    },

    // Platform-specific içerik
    platformSpecificContent: {
      instagram: {
        caption: String,
        firstComment: String,
        tagUsers: [String],
        productTags: [{
          productId: String,
          x: Number,
          y: Number,
        }],
      },
      facebook: {
        message: String,
        link: String,
        callToAction: Object,
      },
      twitter: {
        text: String,
        poll: {
          question: String,
          options: [String],
          durationMinutes: Number,
        },
      },
      linkedin: {
        title: String,
        articleUrl: String,
        visibility: { type: String, enum: ['public', 'connections', 'company'] },
      },
    },

    status: {
      type: String,
      enum: ['draft', 'scheduled', 'pending_approval', 'approved', 'rejected', 'publishing', 'published', 'failed', 'archived'],
      default: 'draft',
      index: true,
    },
    scheduledAt: Date,
    publishedAt: Date,

    // KRİTİK DÜZELTME #04: Onay geçmişi
    approvalHistory: [{
      action: { type: String, enum: ['submitted', 'approved', 'rejected', 'revision_requested'] },
      userId: String,
      userName: String,
      userRole: String,
      timestamp: { type: Date, default: Date.now },
      comments: String,
      revisionNumber: Number,
    }],

    // Onay durumu
    approvalStatus: {
      isApproved: { type: Boolean, default: false },
      approvedBy: String,
      approvedAt: Date,
      rejectedBy: String,
      rejectedAt: Date,
      rejectionReason: String,
      revisionCount: { type: Number, default: 0 },
      currentRevision: { type: Number, default: 1 },
    },

    // Yayınlanma sonuçları
    publishResults: [{
      accountId: String,
      platform: String,
      status: { type: String, enum: ['success', 'failed', 'pending'] },
      platformPostId: String,
      platformPostUrl: String,
      errorMessage: String,
      publishedAt: Date,
      metrics: {
        likes: Number,
        comments: Number,
        shares: Number,
        reach: Number,
        impressions: Number,
      },
    }],

    // AI ile oluşturulduysa
    aiGenerated: {
      isAiGenerated: Boolean,
      provider: { type: String, enum: ['replicate', 'fal_ai', 'modal', 'custom_gpu'] },
      prompt: String,
      model: String,
      processingLogId: String,
      cost: Number,
      generationTime: Number,
    },

    // KRİTİK DÜZELTME #14: Performans tahmini
    performancePrediction: {
      predictedReach: Number,
      predictedEngagement: Number,
      predictedLikes: Number,
      predictedComments: Number,
      confidenceScore: Number,
      bestPostingTime: Date,
      recommendations: [String],
      analyzedAt: { type: Date, default: Date.now },
    },

    campaignId: String,
    tags: [String],
    category: String,

    createdBy: { type: String, required: true },
    updatedBy: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexler - Multi-tenant sızıntı önleme (#11)
ContentPostSchema.index({ organizationId: 1, status: 1 });
ContentPostSchema.index({ organizationId: 1, scheduledAt: 1 });
ContentPostSchema.index({ organizationId: 1, publishedAt: 1 });
ContentPostSchema.index({ organizationId: 1, campaignId: 1 });
ContentPostSchema.index({ accountIds: 1 });
ContentPostSchema.index({ 'approvalStatus.isApproved': 1 });
ContentPostSchema.index({ status: 1, scheduledAt: 1 }); // Yayınlanacak postları bulmak için

// Virtual: Toplam etkileşim
ContentPostSchema.virtual('totalEngagement').get(function() {
  if (!this.publishResults || this.publishResults.length === 0) return 0;
  return this.publishResults.reduce((total, result) => {
    const metrics = result.metrics || {};
    return total + (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0);
  }, 0);
});

// Method: Onaya gönder
ContentPostSchema.methods.submitForApproval = function(userId: string, userName: string, userRole: string) {
  this.status = 'pending_approval';
  this.approvalHistory.push({
    action: 'submitted',
    userId,
    userName,
    userRole,
    timestamp: new Date(),
  });
  return this.save();
};

// Method: Onayla
ContentPostSchema.methods.approve = function(userId: string, userName: string, userRole: string, comments?: string) {
  this.status = 'approved';
  this.approvalStatus = {
    ...this.approvalStatus,
    isApproved: true,
    approvedBy: userId,
    approvedAt: new Date(),
  };
  this.approvalHistory.push({
    action: 'approved',
    userId,
    userName,
    userRole,
    timestamp: new Date(),
    comments,
  });
  return this.save();
};

// Method: Reddet
ContentPostSchema.methods.reject = function(
  userId: string,
  userName: string,
  userRole: string,
  reason: string,
  requestRevision: boolean = true
) {
  this.status = requestRevision ? 'pending_approval' : 'rejected';
  this.approvalStatus = {
    ...this.approvalStatus,
    isApproved: false,
    rejectedBy: userId,
    rejectedAt: new Date(),
    rejectionReason: reason,
    revisionCount: (this.approvalStatus?.revisionCount || 0) + 1,
  };
  this.approvalHistory.push({
    action: 'rejected',
    userId,
    userName,
    userRole,
    timestamp: new Date(),
    comments: reason,
    revisionNumber: this.approvalStatus.revisionCount,
  });
  return this.save();
};

// Static: Onay bekleyen postları bul
ContentPostSchema.statics.findPendingApproval = function(organizationId: string) {
  return this.find({
    organizationId,
    status: 'pending_approval',
  }).sort({ 'approvalHistory.timestamp': -1 });
};

// Static: Yayınlanacak postları bul
ContentPostSchema.statics.findScheduledToPublish = function(organizationId: string) {
  const now = new Date();
  return this.find({
    organizationId,
    status: 'scheduled',
    scheduledAt: { $lte: now },
  });
};

export const ContentPost = models.ContentPost || model<IContentPost>('ContentPost', ContentPostSchema);