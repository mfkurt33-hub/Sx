import { Schema, model, models, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;

  // Rol yönetimi
  role: 'super_admin' | 'admin' | 'manager' | 'editor' | 'viewer';
  
  // Organizasyon ilişkisi
  organizationId: string;
  organizations: Array<{
    organizationId: string;
    role: 'owner' | 'admin' | 'member';
    invitedAt: Date;
    joinedAt?: Date;
    isActive: boolean;
  }>;

  // AI kredi limiti
  aiCreditLimit: number;
  aiCreditUsed: number;

  // Tercihler
  preferences: {
    language: 'tr' | 'en';
    timezone: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyReport: boolean;
  };

  // Durum
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  // Son aktiviteler
  lastLoginAt?: Date;
  lastActiveAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: String,
    avatar: String,

    role: {
      type: String,
      enum: ['super_admin', 'admin', 'manager', 'editor', 'viewer'],
      default: 'editor',
    },

    organizationId: { type: String, required: true, index: true },
    organizations: [{
      organizationId: String,
      role: { type: String, enum: ['owner', 'admin', 'member'] },
      invitedAt: Date,
      joinedAt: Date,
      isActive: { type: Boolean, default: true },
    }],

    aiCreditLimit: { type: Number, default: 100 },
    aiCreditUsed: { type: Number, default: 0 },

    preferences: {
      language: { type: String, enum: ['tr', 'en'], default: 'tr' },
      timezone: { type: String, default: 'Europe/Istanbul' },
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true },
    },

    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    lastLoginAt: Date,
    lastActiveAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexler
UserSchema.index({ email: 1 });
UserSchema.index({ organizationId: 1, role: 1 });
UserSchema.index({ isActive: 1 });

// Virtual: Tam ad
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual: Kullanılan AI kredi yüzdesi
UserSchema.virtual('aiCreditUsagePercent').get(function() {
  if (this.aiCreditLimit === 0) return 0;
  return Math.round((this.aiCreditUsed / this.aiCreditLimit) * 100);
});

// Method: Şifre karşılaştırma
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const bcrypt = await import('bcrypt');
  return bcrypt.compare(candidatePassword, this.password);
};

// Method: Email doğrulama token'ı oluştur
UserSchema.methods.generateEmailVerificationToken = function(): string {
  const crypto = require('crypto');
  this.emailVerificationToken = crypto.createHash('sha256').update(this.email + Date.now()).digest('hex');
  return this.emailVerificationToken;
};

// Method: Şifre sıfırlama token'ı oluştur
UserSchema.methods.generateResetPasswordToken = function(): string {
  const crypto = require('crypto');
  this.resetPasswordToken = crypto.createHash('sha256').update(this.email + Date.now()).digest('hex');
  this.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 saat
  return this.resetPasswordToken;
};

// Static: Organizasyondaki kullanıcıları bul
UserSchema.statics.findByOrganization = function(organizationId: string, role?: string) {
  const query: any = { organizationId, isActive: true };
  if (role) {
    query.role = role;
  }
  return this.find(query).select('-password');
};

// Static: Aktif adminleri bul
UserSchema.statics.findActiveAdmins = function(organizationId: string) {
  return this.find({
    organizationId,
    role: { $in: ['super_admin', 'admin'] },
    isActive: true,
  }).select('-password');
};

export const User = models.User || model<IUser>('User', UserSchema);
