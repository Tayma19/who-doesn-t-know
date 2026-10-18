import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterModule } from '../counters/counters.module';
import { Tip, TipSchema } from './schemas/tip.schema';
import { TipsService } from './tips.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Tip.name,
        schema: TipSchema,
      },
    ]),
    CounterModule,
  ],
  providers: [TipsService],
  exports: [TipsService],
})
export class TipsModule {}
