import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterModule } from '../counters/counters.module';
import { GameplayReadStub } from '../gameplay/gameplay-read.stub';
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
  ],
  controllers: [GamesController],
  providers: [GamesService, StateBuilder, GameplayReadStub],
  exports: [GamesService],
})
export class GamesModule {}
