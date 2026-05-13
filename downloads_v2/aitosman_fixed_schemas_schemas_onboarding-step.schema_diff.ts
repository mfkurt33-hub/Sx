--- aitosman_fixed_schemas/schemas/onboarding-step.schema.ts (原始)


+++ aitosman_fixed_schemas/schemas/onboarding-step.schema.ts (修改后)
import { Schema, model, models, Document } from 'mongoose';

export interface IOnboardingStep extends Document {
  organizationId: string;
  userId: string;

  // Adım bilgileri - KRİTİK DÜZELTME #07
  stepType: 'sector_selection' | 'brand_voice_setup' | 'account_connection' | 'team_invitation' | 'first_post_creation' | 'calendar_setup' | 'analytics_review';

  status: 'pending' | 'in_progress' | 'completed' | 'skipped';

  // Adım detayları
  title: string;
  description: string;
  icon?: string;
  order: number;

  // İlerleme
  progress: {
    current: number;
    total: number;
    percentage: number;
  };

  // Tamamlama bilgileri
  completedAt?: Date;
  skippedAt?: Date;

  // Yardım ve rehberlik
  helpUrl?: string;
  videoTutorialUrl?: string;
  tips?: string[];

  // Gerekli aksiyonlar
  requiredActions?: Array<{
    action: string;
    description: string;
    isCompleted: boolean;
    completedAt?: Date;
  }>;

  // Meta veriler
  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

const OnboardingStepSchema = new Schema<IOnboardingStep>(
  {
    organizationId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },

    // KRİTİK DÜZELTME #07: Guided onboarding akışı
    stepType: {
      type: String,
      required: true,
      enum: [
        'sector_selection',
        'brand_voice_setup',
        'account_connection',
        'team_invitation',
        'first_post_creation',
        'calendar_setup',
        'analytics_review',
      ],
      index: true,
    },

    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'skipped'],
      default: 'pending',
      index: true,
    },

    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: String,
    order: { type: Number, required: true },

    progress: {
      current: { type: Number, default: 0 },
      total: { type: Number, default: 1 },
      percentage: { type: Number, default: 0 },
    },

    completedAt: Date,
    skippedAt: Date,

    helpUrl: String,
    videoTutorialUrl: String,
    tips: [String],

    requiredActions: [{
      action: String,
      description: String,
      isCompleted: Boolean,
      completedAt: Date,
    }],

    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Indexler
OnboardingStepSchema.index({ organizationId: 1, userId: 1, order: 1 });
OnboardingStepSchema.index({ organizationId: 1, status: 1 });
OnboardingStepSchema.index({ userId: 1, stepType: 1 }, { unique: true });

// Method: Adımı tamamla
OnboardingStepSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  this.progress.current = this.progress.total;
  this.progress.percentage = 100;
  return this.save();
};

// Method: Adımı atla
OnboardingStepSchema.methods.skip = function() {
  this.status = 'skipped';
  this.skippedAt = new Date();
  return this.save();
};

// Method: Aksiyonu tamamla
OnboardingStepSchema.methods.completeAction = function(actionName: string) {
  if (!this.requiredActions) {
    this.requiredActions = [];
  }

  const action = this.requiredActions.find(a => a.action === actionName);
  if (action) {
    action.isCompleted = true;
    action.completedAt = new Date();
    this.progress.current = this.requiredActions.filter(a => a.isCompleted).length;
    this.progress.total = this.requiredActions.length;
    this.progress.percentage = Math.round((this.progress.current / this.progress.total) * 100);

    if (this.progress.current === this.progress.total) {
      this.status = 'completed';
      this.completedAt = new Date();
    } else if (this.progress.current > 0) {
      this.status = 'in_progress';
    }
  }

  return this.save();
};

// Static: Kullanıcının onboarding durumunu al
OnboardingStepSchema.statics.getUserOnboardingStatus = async function(organizationId: string, userId: string) {
  const steps = await this.find({ organizationId, userId }).sort({ order: 1 });

  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const skippedSteps = steps.filter(s => s.status === 'skipped').length;
  const pendingSteps = steps.filter(s => s.status === 'pending').length;

  const nextPendingStep = steps.find(s => s.status === 'pending');
  const currentInProgressStep = steps.find(s => s.status === 'in_progress');

  return {
    totalSteps,
    completedSteps,
    skippedSteps,
    pendingSteps,
    completionPercentage: Math.round((completedSteps / totalSteps) * 100),
    nextStep: nextPendingStep || null,
    currentStep: currentInProgressStep || nextPendingStep || null,
    isComplete: completedSteps + skippedSteps === totalSteps,
    steps,
  };
};

// Static: Organizasyon için onboarding şablonu oluştur
OnboardingStepSchema.statics.createOnboardingTemplate = async function(organizationId: string, userId: string, sector?: string) {
  const baseSteps = [
    {
      stepType: 'sector_selection',
      title: 'Sektörünüzü Seçin',
      description: 'İşletmenizin sektörünü seçerek size özel öneriler almaya başlayın.',
      icon: '🏪',
      order: 1,
      tips: ['Doğru sektör seçimi AI önerilerini iyileştirir'],
      requiredActions: [
        { action: 'select_sector', description: 'Sektörünüzü seçin', isCompleted: false },
      ],
    },
    {
      stepType: 'brand_voice_setup',
      title: 'Marka Sesinizi Tanımlayın',
      description: 'Markanızın iletişim tarzını belirleyerek AI\'nın sizi doğru temsil etmesini sağlayın.',
      icon: '🎯',
      order: 2,
      tips: ['Ton, stil ve anahtar kelimeleri doldurun'],
      requiredActions: [
        { action: 'define_tone', description: 'İletişim tonunuzu belirleyin', isCompleted: false },
        { action: 'add_keywords', description: 'Anahtar kelimeler ekleyin', isCompleted: false },
      ],
    },
    {
      stepType: 'account_connection',
      title: 'Sosyal Medya Hesaplarınızı Bağlayın',
      description: 'Instagram, Facebook, LinkedIn gibi hesaplarınızı bağlayarak içerik yayınlamaya başlayın.',
      icon: '🔗',
      order: 3,
      tips: ['En az bir hesap bağlamanız gerekiyor'],
      requiredActions: [
        { action: 'connect_first_account', description: 'İlk sosyal medya hesabınızı bağlayın', isCompleted: false },
      ],
    },
    {
      stepType: 'team_invitation',
      title: 'Takım Arkadaşlarınızı Davet Edin',
      description: 'Takım arkadaşlarınızı ekleyerek birlikte çalışmaya başlayın.',
      icon: '👥',
      order: 4,
      tips: ['Rol bazlı erişim ayarlayabilirsiniz'],
      requiredActions: [
        { action: 'invite_team_member', description: 'Bir takım arkadaşı davet edin', isCompleted: false },
      ],
    },
    {
      stepType: 'first_post_creation',
      title: 'İlk İçeriğinizi Oluşturun',
      description: 'AI destekli araçlarla ilk içeriğinizi oluşturun ve yayınlayın.',
      icon: '✨',
      order: 5,
      tips: ['AI görsel stüdyosunu deneyin'],
      requiredActions: [
        { action: 'create_post', description: 'Bir içerik oluşturun', isCompleted: false },
      ],
    },
    {
      stepType: 'calendar_setup',
      title: 'İçerik Takviminizi Planlayın',
      description: 'Önümüzdeki haftalar için içerik planı yapın.',
      icon: '📅',
      order: 6,
      tips: ['Otomatik zamanlama özelliğini kullanın'],
      requiredActions: [
        { action: 'schedule_post', description: 'Bir içeriği zamanlayın', isCompleted: false },
      ],
    },
    {
      stepType: 'analytics_review',
      title: 'Analitikleri İnceleyin',
      description: 'Performans metriklerinizi takip ederek stratejinizi optimize edin.',
      icon: '📊',
      order: 7,
      tips: ['Haftalık raporları inceleyin'],
      requiredActions: [
        { action: 'view_analytics', description: 'Analitik panelini ziyaret edin', isCompleted: false },
      ],
    },
  ];

  const createdSteps = await this.insertMany(
    baseSteps.map(step => ({
      ...step,
      organizationId,
      userId,
      progress: { current: 0, total: step.requiredActions?.length || 1, percentage: 0 },
    }))
  );

  return createdSteps;
};

export const OnboardingStep = models.OnboardingStep || model<IOnboardingStep>('OnboardingStep', OnboardingStepSchema);