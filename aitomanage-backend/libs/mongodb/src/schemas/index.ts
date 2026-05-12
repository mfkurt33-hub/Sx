// MongoDB Schema Index ve Export Dosyası

export * from './timestamp.schema'
export * from './organization.schema'
export * from './account.schema'
export * from './content-post.schema'
export * from './content-calendar.schema'
export * from './analytics-report.schema'
export * from './audit-log.schema'
export * from './brand-voice.schema'
export * from './comment-thread.schema'

import { Organization, OrganizationSchema } from './organization.schema'
import { Account, AccountSchema } from './account.schema'
import { ContentPost, ContentPostSchema } from './content-post.schema'
import { ContentCalendar, ContentCalendarSchema } from './content-calendar.schema'
import { AnalyticsReport, AnalyticsReportSchema } from './analytics-report.schema'
import { AuditLog, AuditLogSchema } from './audit-log.schema'
import { BrandVoice, BrandVoiceSchema } from './brand-voice.schema'
import { CommentThread, CommentThreadSchema } from './comment-thread.schema'

export const schemas = [
  { name: Organization.name, schema: OrganizationSchema },
  { name: Account.name, schema: AccountSchema },
  { name: ContentPost.name, schema: ContentPostSchema },
  { name: ContentCalendar.name, schema: ContentCalendarSchema },
  { name: AnalyticsReport.name, schema: AnalyticsReportSchema },
  { name: AuditLog.name, schema: AuditLogSchema },
  { name: BrandVoice.name, schema: BrandVoiceSchema },
  { name: CommentThread.name, schema: CommentThreadSchema },
] as const
