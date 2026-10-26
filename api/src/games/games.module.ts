import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameplayModule } from '../gameplay/gameplay.module';
import { CounterModule } from '../counters/counters.module';
import { Tip, TipSchema } from '../tips/schemas/tip.schema';
import { Game, GameSchema } from './schemas/game.schema';
import { Player, PlayerSchema } from './schemas/player.schema';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { StateBuilder } from './state.builder';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Game.name, schema: GameSchema },
      { name: Player.name, schema: PlayerSchema },
      { name: Tip.name, schema: TipSchema },
    ]),
    CounterModule,
    GameplayModule,
  ],
  controllers: [GamesController],
  providers: [GamesService, StateBuilder],
  exports: [GamesService],
})
export class GamesModule {}
