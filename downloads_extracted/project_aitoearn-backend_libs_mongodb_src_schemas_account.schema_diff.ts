--- project/aitoearn-backend/libs/mongodb/src/schemas/account.schema.ts (原始)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AccountType } from '@yikart/common'
import { Schema as MongooseSchema } from 'mongoose'

import { DEFAULT_SCHEMA_OPTIONS } from '../mongodb.constants'
import { WithTimestampSchema } from './timestamp.schema'

export enum AccountStatus {
  NORMAL = 1,
  ABNORMAL = 0,
}

export enum ClientType {
  WEB = 'web',
  APP = 'app',
}

@Schema({ ...DEFAULT_SCHEMA_OPTIONS, collection: 'account' })
export class Account extends WithTimestampSchema {
  @Prop({ type: MongooseSchema.Types.String })
  _id: string

  id: string

  @Prop({
    required: true,
    type: String,
    index: true,
    default: '',
  })
  userId: string

  @Prop({
    required: true,
    enum: AccountType,
    index: true,
  })
  type: AccountType

  @Prop({
    required: true,
    index: true,
  })
  uid: string

  @Prop({
    required: false,
    index: true,
  })
  account: string

  @Prop({
    required: false,
    type: Date,
    index: true,
  })
  loginTime?: Date

  @Prop({
    required: false,
  })
  avatar?: string

  @Prop({
    required: true,
  })
  nickname: string

  @Prop({
    required: false,
    enum: ClientType,
  })
  clientType?: ClientType

  @Prop({
    required: false,
    type: String,
  })
  loginCookie: string

  @Prop({
    required: false,
    type: String,
  })
  access_token: string

  @Prop({
    required: false,
    type: String,
  })
  refresh_token: string

  @Prop({
    required: false,
    type: String,
    default: '',
  })
  token: string

  @Prop({
    required: true,
    default: 0,
  })
  fansCount: number

  @Prop({
    required: true,
    default: 0,
  })
  readCount: number

  @Prop({
    required: true,
    default: 0,
  })
  likeCount: number

  @Prop({
    required: true,
    default: 0,
  })
  collectCount: number

  @Prop({
    required: true,
    default: 0,
  })
  forwardCount: number

  @Prop({
    required: true,
    default: 0,
  })
  commentCount: number

  @Prop({
    required: false,
    type: Date,
  })
  lastStatsTime?: Date

  @Prop({
    required: true,
    default: 0,
  })
  workCount: number

  @Prop({
    required: true,
    default: 0,
  })
  income: number

  @Prop({ type: String, required: true })
  groupId: string

  @Prop({
    required: true,
    default: AccountStatus.NORMAL,
    index: true,
  })
  status: AccountStatus

  @Prop({ type: String, required: false })
  channelId: string

  @Prop({
    required: true,
    type: Number,
    default: 1,
  })
  rank: number

  @Prop({ type: String, default: null })
  relayAccountRef: string | null
}

export const AccountSchema = SchemaFactory.createForClass(Account)
AccountSchema.index({ type: 1, uid: 1 }, { unique: true })

+++ project/aitoearn-backend/libs/mongodb/src/schemas/account.schema.ts (修改后)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AccountType } from '@yikart/common'
import { Schema as MongooseSchema } from 'mongoose'

import { DEFAULT_SCHEMA_OPTIONS } from '../mongodb.constants'
import { WithTimestampSchema } from './timestamp.schema'

export enum AccountStatus {
  NORMAL = 1,
  ABNORMAL = 0,
}

export enum ClientType {
  WEB = 'web',
  APP = 'app',
}

@Schema({ ...DEFAULT_SCHEMA_OPTIONS, collection: 'account' })
export class Account extends WithTimestampSchema {
  @Prop({ type: MongooseSchema.Types.String })
  _id: string

  id: string

  @Prop({
    required: true,
    type: String,
    index: true,
    default: '',
  })
  userId: string

  @Prop({
    required: true,
    type: String,
    index: true,
  })
  organizationId: string // Organizasyon ID - çok kiracılı yapı için

  @Prop({
    required: true,
    enum: AccountType,
    index: true,
  })
  type: AccountType

  @Prop({
    required: true,
    index: true,
  })
  uid: string

  @Prop({
    required: false,
    index: true,
  })
  account: string

  @Prop({
    required: false,
    type: Date,
    index: true,
  })
  loginTime?: Date

  @Prop({
    required: false,
  })
  avatar?: string

  @Prop({
    required: true,
  })
  nickname: string

  @Prop({
    required: false,
    enum: ClientType,
  })
  clientType?: ClientType

  @Prop({
    required: false,
    type: String,
  })
  loginCookie: string

  @Prop({
    required: false,
    type: String,
  })
  access_token: string

  @Prop({
    required: false,
    type: String,
  })
  refresh_token: string

  @Prop({
    required: false,
    type: String,
    default: '',
  })
  token: string

  @Prop({
    required: true,
    default: 0,
  })
  fansCount: number

  @Prop({
    required: true,
    default: 0,
  })
  readCount: number

  @Prop({
    required: true,
    default: 0,
  })
  likeCount: number

  @Prop({
    required: true,
    default: 0,
  })
  collectCount: number

  @Prop({
    required: true,
    default: 0,
  })
  forwardCount: number

  @Prop({
    required: true,
    default: 0,
  })
  commentCount: number

  @Prop({
    required: false,
    type: Date,
  })
  lastStatsTime?: Date

  @Prop({
    required: true,
    default: 0,
  })
  workCount: number

  @Prop({
    required: true,
    default: 0,
  })
  income: number

  @Prop({ type: String, required: true })
  groupId: string

  @Prop({
    required: true,
    default: AccountStatus.NORMAL,
    index: true,
  })
  status: AccountStatus

  @Prop({ type: String, required: false })
  channelId: string

  @Prop({
    required: true,
    type: Number,
    default: 1,
  })
  rank: number

  @Prop({ type: String, default: null })
  relayAccountRef: string | null

  @Prop({ required: false, default: false })
  isAutoCommentEnabled: boolean // AI otomatik yorum yanıtlama açık mı?

  @Prop({ required: false, default: false })
  isAutoPublishEnabled: boolean // Otomatik yayın açık mı?
}

export const AccountSchema = SchemaFactory.createForClass(Account)
AccountSchema.index({ type: 1, uid: 1 }, { unique: true })
AccountSchema.index({ organizationId: 1, type: 1, uid: 1 }, { unique: true }) // Organizasyon bazlı unique index