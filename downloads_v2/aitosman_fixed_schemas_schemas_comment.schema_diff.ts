--- aitosman_fixed_schemas/schemas/comment.schema.ts (原始)


+++ aitosman_fixed_schemas/schemas/comment.schema.ts (修改后)
import { Schema, model, models, Document } from 'mongoose';

export interface ICommentThread extends Document {
  organizationId: string;
  postId: string; // İçerik post ID'si
  platformAccountId: string;

  // Platform bilgileri
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok';
  platformCommentId: string;
  platformParentCommentId?: string; // Yanıt ise parent ID

  // Yorum içeriği
  content: {
    text: string;
    media?: Array<{
      type: 'image' | 'video' | 'gif';
      url: string;
    }>;
    mentions?: string[];
  };

  // Yorum yapan kullanıcı
  author: {
    platformUserId: string;
    username: string;
    displayName?: string;
    profilePicture?: string;
    isVerified?: boolean;
    followerCount?: number;
  };

  // Durum ve öncelik
  status: 'new' | 'in_review' | 'replied' | 'hidden' | 'reported' | 'spam' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sentiment: 'positive' | 'neutral' | 'negative' | 'question' | 'complaint';

  // AI yanıt önerisi - KRİTİK DÜZELTME #08
  aiSuggestion?: {
    suggestedReply: string;
    confidence: number;
    tone: 'professional' | 'friendly' | 'apologetic' | 'enthusiastic';
    generatedAt: Date;
    model: string;
  };

  // Atama
  assignedTo?: string; // Kullanıcı ID
  assignedAt?: Date;

  // Yanıtlar
  replyCount: number;
  replies?: string[]; // CommentReply ID'leri

  // Moderasyon
  isHidden: boolean;
  hiddenAt?: Date;
  hiddenBy?: string;
  hideReason?: string;

  isSpam: boolean;
  spamScore?: number;

  isReported: boolean;
  reportCount?: number;

  // Etkileşimler
  likes?: number;
  repliesOnPlatform?: number;

  // Meta veriler
  language?: string;
  tags?: string[];

  createdAt: Date;
  updatedAt: Date;
  lastActivityAt?: Date;
}

const CommentThreadSchema = new Schema<ICommentThread>(
  {
    organizationId: { type: String, required: true, index: true },
    postId: { type: String, required: true, index: true },
    platformAccountId: { type: String, required: true, index: true },

    platform: {
      type: String,
      required: true,
      enum: ['instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'tiktok'],
      index: true,
    },
    platformCommentId: { type: String, required: true, index: true },
    platformParentCommentId: String,

    content: {
      text: { type: String, required: true },
      media: [{
        type: { type: String, enum: ['image', 'video', 'gif'] },
        url: String,
      }],
      mentions: [String],
    },

    author: {
      platformUserId: { type: String, required: true },
      username: { type: String, required: true },
      displayName: String,
      profilePicture: String,
      isVerified: Boolean,
      followerCount: Number,
    },

    status: {
      type: String,
      enum: ['new', 'in_review', 'replied', 'hidden', 'reported', 'spam', 'archived'],
      default: 'new',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'question', 'complaint'],
      index: true,
    },

    // KRİTİK DÜZELTME #08: AI yanıt önerisi
    aiSuggestion: {
      suggestedReply: String,
      confidence: Number,
      tone: { type: String, enum: ['professional', 'friendly', 'apologetic', 'enthusiastic'] },
      generatedAt: Date,
      model: String,
    },

    assignedTo: String,
    assignedAt: Date,

    replyCount: { type: Number, default: 0 },
    replies: [{ type: String, ref: 'CommentReply' }],

    isHidden: { type: Boolean, default: false },
    hiddenAt: Date,
    hiddenBy: String,
    hideReason: String,

    isSpam: { type: Boolean, default: false },
    spamScore: Number,

    isReported: { type: Boolean, default: false },
    reportCount: Number,

    likes: Number,
    repliesOnPlatform: Number,

    language: String,
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Indexler
CommentThreadSchema.index({ organizationId: 1, status: 1 });
CommentThreadSchema.index({ organizationId: 1, sentiment: 1 });
CommentThreadSchema.index({ organizationId: 1, priority: 1 });
CommentThreadSchema.index({ platformAccountId: 1, createdAt: -1 });
CommentThreadSchema.index({ 'author.platformUserId': 1 });
CommentThreadSchema.index({ status: 1, priority: -1, createdAt: -1 }); // Inbox sıralaması için

// Virtual: Yanıtlanmalı mı?
CommentThreadSchema.virtual('needsResponse').get(function() {
  return this.status === 'new' ||
         (this.status === 'in_review' && !this.assignedTo) ||
         this.sentiment === 'complaint' ||
         this.sentiment === 'question';
});

// Method: Yanıt önerisi oluştur
CommentThreadSchema.methods.generateAIReply = function(suggestedReply: string, confidence: number, tone: string, model: string) {
  this.aiSuggestion = {
    suggestedReply,
    confidence,
    tone: tone as any,
    generatedAt: new Date(),
    model,
  };
  return this.save();
};

// Static: Acil yanıt gerektiren yorumları bul
CommentThreadSchema.statics.findUrgentComments = function(organizationId: string) {
  return this.find({
    organizationId,
    $or: [
      { sentiment: 'complaint' },
      { sentiment: 'question' },
      { priority: 'urgent' },
      { priority: 'high' },
    ],
    status: { $in: ['new', 'in_review'] },
  }).sort({ priority: -1, createdAt: 1 });
};

// Static: Yanıtlanmamış yorumları bul
CommentThreadSchema.statics.findUnansweredComments = function(organizationId: string, accountId?: string) {
  const query: any = {
    organizationId,
    status: { $in: ['new', 'in_review'] },
  };
  if (accountId) {
    query.platformAccountId = accountId;
  }
  return this.find(query).sort({ createdAt: 1 });
};

export const CommentThread = models.CommentThread || model<ICommentThread>('CommentThread', CommentThreadSchema);


// ============================================
// Comment Reply Schema
// ============================================

export interface ICommentReply extends Document {
  threadId: string;
  organizationId: string;

  // Yanıt içeriği
  content: {
    text: string;
    media?: Array<{
      type: 'image' | 'video';
      url: string;
    }>;
  };

  // Yanıtlayan
  replier: {
    type: 'ai' | 'human';
    userId?: string;
    userName?: string;
    aiModel?: string;
  };

  // Platform bilgileri
  platformReplyId?: string;
  publishedAt?: Date;
  publishStatus?: 'pending' | 'published' | 'failed';
  publishError?: string;

  // Onay durumu
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const CommentReplySchema = new Schema<ICommentReply>(
  {
    threadId: { type: String, ref: 'CommentThread', required: true, index: true },
    organizationId: { type: String, required: true, index: true },

    content: {
      text: { type: String, required: true },
      media: [{
        type: { type: String, enum: ['image', 'video'] },
        url: String,
      }],
    },

    replier: {
      type: { type: String, enum: ['ai', 'human'], required: true },
      userId: String,
      userName: String,
      aiModel: String,
    },

    platformReplyId: String,
    publishedAt: Date,
    publishStatus: {
      type: String,
      enum: ['pending', 'published', 'failed'],
      default: 'pending',
    },
    publishError: String,

    requiresApproval: { type: Boolean, default: true },
    approvedBy: String,
    approvedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexler
CommentReplySchema.index({ threadId: 1, createdAt: 1 });
CommentReplySchema.index({ organizationId: 1, 'replier.type': 1 });

// Method: Yanıtı yayınla
CommentReplySchema.methods.publish = function(platformReplyId: string) {
  this.publishStatus = 'published';
  this.platformReplyId = platformReplyId;
  this.publishedAt = new Date();
  return this.save();
};

// Method: Onayla
CommentReplySchema.methods.approve = function(userId: string) {
  this.approvedBy = userId;
  this.approvedAt = new Date();
  this.requiresApproval = false;
  return this.save();
};

export const CommentReply = models.CommentReply || model<ICommentReply>('CommentReply', CommentReplySchema);