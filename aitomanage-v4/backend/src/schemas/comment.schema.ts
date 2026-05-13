import { Schema, model, models, Document } from 'mongoose';

export interface ICommentThread extends Document {
  organizationId: string;
  postId: string;
  platformAccountId: string;

  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok';
  platformCommentId: string;
  platformParentCommentId?: string;

  content: {
    text: string;
    media?: Array<{
      type: 'image' | 'video' | 'gif';
      url: string;
    }>;
    mentions?: string[];
  };

  author: {
    platformUserId: string;
    username: string;
    displayName?: string;
    profilePicture?: string;
    isVerified?: boolean;
    followerCount?: number;
  };

  status: 'new' | 'in_review' | 'replied' | 'hidden' | 'reported' | 'spam' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sentiment: 'positive' | 'neutral' | 'negative' | 'question' | 'complaint';

  aiSuggestion?: {
    suggestedReply: string;
    confidence: number;
    tone: 'professional' | 'friendly' | 'apologetic' | 'enthusiastic';
    generatedAt: Date;
    model: string;
  };

  assignedTo?: string;
  assignedAt?: Date;

  replyCount: number;
  replies?: string[];

  isHidden: boolean;
  hiddenAt?: Date;
  hiddenBy?: string;
  hideReason?: string;

  isSpam: boolean;
  spamScore?: number;

  isReported: boolean;
  reportCount?: number;

  likes?: number;
  repliesOnPlatform?: number;

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

CommentThreadSchema.index({ organizationId: 1, status: 1 });
CommentThreadSchema.index({ organizationId: 1, sentiment: 1 });
CommentThreadSchema.index({ organizationId: 1, priority: 1 });
CommentThreadSchema.index({ platformAccountId: 1, createdAt: -1 });
CommentThreadSchema.index({ 'author.platformUserId': 1 });
CommentThreadSchema.index({ status: 1, priority: -1, createdAt: -1 });

CommentThreadSchema.virtual('needsResponse').get(function() {
  return this.status === 'new' ||
         (this.status === 'in_review' && !this.assignedTo) ||
         this.sentiment === 'complaint' ||
         this.sentiment === 'question';
});

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

CommentThreadSchema.statics.findUrgentComments = async function(organizationId: string) {
  return await this.find({
    organizationId,
    $or: [
      { priority: 'urgent' },
      { sentiment: 'complaint', status: { $ne: 'replied' } },
    ],
  }).sort({ priority: -1, createdAt: -1 });
};

CommentThreadSchema.statics.findPendingResponses = async function(organizationId: string) {
  return await this.find({
    organizationId,
    status: { $in: ['new', 'in_review'] },
  }).sort({ priority: -1, createdAt: -1 });
};

export const CommentThread = models.CommentThread || model<ICommentThread>('CommentThread', CommentThreadSchema);
