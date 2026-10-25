import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterModule } from '../counters/counters.module';
import { GameplayModule } from '../gameplay/gameplay.module';
import { RoundDecision, RoundDecisionSchema } from '../gameplay/schemas/round-decision.schema';
import { SuspectVote, SuspectVoteSchema } from '../gameplay/schemas/suspect-vote.schema';
import { Tip, TipSchema } from '../tips/schemas/tip.schema';
import { Game, GameSchema } from './schemas/game.schema';
import { Player, PlayerSchema } from './schemas/player.schema';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
@Module({
  imports: [MongooseModule.forFeature([
    { name: Game.name, schema: GameSchema }, { name: Player.name, schema: PlayerSchema },
    { name: Tip.name, schema: TipSchema }, { name: RoundDecision.name, schema: RoundDecisionSchema },
    { name: SuspectVote.name, schema: SuspectVoteSchema },
  ]), CounterModule, GameplayModule],
  controllers: [GamesController], providers: [GamesService], exports: [GamesService],
})
export class GamesModule {}
