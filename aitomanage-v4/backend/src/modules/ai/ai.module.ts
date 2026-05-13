import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AICreditUsage, AICreditUsageSchema } from '../../schemas/ai-credit-usage.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: AICreditUsage.name, schema: AICreditUsageSchema }])],
  exports: [MongooseModule],
})
export class AiModule {}
