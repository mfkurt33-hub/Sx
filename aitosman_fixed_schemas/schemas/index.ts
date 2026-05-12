/**
 * AiToManage - Fixed MongoDB Schemas
 * 
 * Bu şemalar Claude'un 20 önerisi ve ek iyileştirmelerle güncellenmiştir.
 * 
 * KRİTİK DÜZELTMELER:
 * 01. Türkiye ödeme entegrasyonu (iyzico/Param) eklendi
 * 02. OAuth token yönetimi ve yenileme stratejisi eklendi
 * 03. AI işlem maliyeti takibi ve kredi limiti eklendi
 * 04. İçerik onay akışı geçmişi (ApprovalHistory) eklendi
 * 05. Cross-posting desteği (accountIds dizisi) eklendi
 * 06. AI görsel servis fallback mekanizması eklendi
 * 07. Müşteri onboarding akışı (OnboardingStep) eklendi
 * 08. Yorum yönetimi şeması (CommentThread, CommentReply) eklendi
 * 09. Satış temsilcisi/ajans katmanı (Reseller, Commission) eklendi
 * 10. Studio sayfası için gerçek API entegrasyon hazırlığı
 * 11. Multi-tenant sızıntı önleme (organizationId zorunlu filtreleme)
 * 12. Akıllı zamanlama önerisi (SmartScheduling) eklendi
 * 13. Otomatik rapor gönderimi (ScheduledReport) eklendi
 * 14. Performans tahmini (PerformancePrediction) eklendi
 * 15. İçerik kütüphanesi ve şablon sistemi (ContentTemplate) eklendi
 * 16. Rakip analizi aracı (CompetitorAnalysis) eklendi
 * 17. WhatsApp Business entegrasyonu hazırlığı
 * 18. Yerel platform desteği altyapısı
 * 19. Müşteriye raporlama portalı (ClientPortalAccess) eklendi
 * 20. PWA desteği için mobil öncelikli yapı
 * 
 * EK İYİLEŞTİRMELER:
 * - KVKK uyumluluğu (veri saklama ve imha politikaları)
 * - Detaylı Audit Log sistemi
 * - Türkçe yerelleştirme desteği
 * - E-fatura entegrasyonu
 * - Kriz yönetimi modülü
 */

export { User, IUser } from './user.schema';
export { Organization, IOrganization } from './organization.schema';
export { OrganizationMember, IOrganizationMember } from './organization-member.schema';
export { Account, IAccount } from './account.schema';
export { ContentPost, IContentPost } from './content-post.schema';
export { ContentCalendar, IContentCalendar } from './content-calendar.schema';
export { BrandVoice, IBrandVoice } from './brand-voice.schema';
export { AnalyticsReport, IAnalyticsReport } from './analytics-report.schema';
export { AuditLog, IAuditLog } from './audit-log.schema';

// Yeni eklenen şemalar
export { PaymentProvider, IPaymentProvider } from './payment-provider.schema';
export { Transaction, ITransaction } from './transaction.schema';
export { AICreditUsage, IAICreditUsage } from './ai-credit-usage.schema';
export { OnboardingStep, IOnboardingStep } from './onboarding-step.schema';
export { CommentThread, ICommentThread, CommentReply, ICommentReply } from './comment.schema';
export { Reseller, IReseller, Commission, ICommission } from './reseller.schema';
export { SmartScheduling, ISmartScheduling } from './smart-scheduling.schema';
export { ScheduledReport, IScheduledReport } from './scheduled-report.schema';
export { PerformancePrediction, IPerformancePrediction } from './performance-prediction.schema';
export { ContentTemplate, IContentTemplate } from './content-template.schema';
export { CompetitorAnalysis, ICompetitorAnalysis } from './competitor-analysis.schema';
export { ClientPortalAccess, IClientPortalAccess } from './client-portal.schema';
export { DataRetention, IDataRetention } from './data-retention.schema'; // KVKK
export { Invoice, IInvoice } from './invoice.schema'; // E-fatura
export { CrisisManagement, ICrisisManagement } from './crisis-management.schema';

// Index tanımları
export * from './index';
