import { Prop, Schema } from '@nestjs/mongoose'

@Schema({ _id: false })
export class WithTimestampSchema {
  @Prop({ default: () => new Date() })
  createdAt: Date

  @Prop({ default: () => new Date() })
  updatedAt: Date
}
