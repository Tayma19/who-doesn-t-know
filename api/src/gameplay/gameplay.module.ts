import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterModule } from '../counters/counters.module';
import { Game, GameSchema } from '../games/schemas/game.schema';
import { Player, PlayerSchema } from '../games/schemas/player.schema';
import { Question, QuestionSchema } from './schemas/question.schema';
import { RoundDecision, RoundDecisionSchema } from './schemas/round-decision.schema';
import { SuspectVote, SuspectVoteSchema } from './schemas/suspect-vote.schema';
import { GameplayController } from './gameplay.controller';
import { GameplayService } from './gameplay.service';
import { GameplayReadService } from './gameplay-read.service';
@Module({
  imports: [MongooseModule.forFeature([
    { name: Game.name, schema: GameSchema }, { name: Player.name, schema: PlayerSchema },
    { name: Question.name, schema: QuestionSchema }, { name: RoundDecision.name, schema: RoundDecisionSchema },
    { name: SuspectVote.name, schema: SuspectVoteSchema },
  ]), CounterModule],
  controllers: [GameplayController], providers: [GameplayService, GameplayReadService], exports: [GameplayReadService],
})
export class GameplayModule {}
