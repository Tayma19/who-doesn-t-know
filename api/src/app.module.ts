import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { CounterModule } from './counters/counters.module';
import { GameplayModule } from './gameplay/gameplay.module';
import { TipsModule } from './tips/tips.module';
import { GamesModule } from './games/games.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),

    CounterModule,
    TipsModule,
    GameplayModule,
    GamesModule,
  ],
})
export class AppModule {}