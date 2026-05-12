/**
 * MongoDB Sabitleri ve Varsayılan Ayarlar
 */

export const DEFAULT_SCHEMA_OPTIONS = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc: any, ret: any) => {
      delete ret._id
      delete ret.__v
      delete ret.isDelete
      return ret
    },
  },
}

export const DB_NAME = 'aitomanage'

export enum CollectionNames {
  ORGANIZATION = 'organization',
  ACCOUNT = 'account',
  CONTENT_POST = 'content_post',
  CONTENT_CALENDAR = 'content_calendar',
  ANALYTICS_REPORT = 'analytics_report',
  AUDIT_LOG = 'audit_log',
  BRAND_VOICE = 'brand_voice',
  COMMENT_THREAD = 'comment_thread',
}
