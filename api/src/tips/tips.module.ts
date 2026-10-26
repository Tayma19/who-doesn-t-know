import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterModule } from '../counters/counters.module';
import { Tip, TipSchema } from './schemas/tip.schema';
import { TipsController } from './tips.controller';
import { TipsService } from './tips.service';
import { InternalToolGuard } from './internal-tool.guard';
@Module({ 
    imports: [MongooseModule.forFeature([{ name: Tip.name, schema: TipSchema }]),
     CounterModule], 
     controllers: [TipsController], 
     providers: [TipsService, InternalToolGuard],
     exports: [TipsService] })

export class TipsModule {}
