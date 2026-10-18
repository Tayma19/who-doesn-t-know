import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameDocument } from '../src/gameplay/schemas/question.schema.ts';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('SeedDevGame');

  const app = await NestFactory.createApplicationContext(AppModule);

  const gameModel = app.get<Model<GameDocument>>(getModelToken('Game'));

  await gameModel.deleteMany({ roomCode: 'TEST1' });
  logger.log('Deleted existing TEST1 game');

  await gameModel.create({
    roomCode: 'TEST1',
    status: 'questioning',
    roundNumber: 1,
    decisionNumber: 1,
    votingNumber: 1,
    players: ['p_test1', 'p_test2', 'p_test3', 'p_test4', 'p_test5'],
    hiddenPlayerRef: 'p_test4',
    tip: 'This player loves to write backend code',
    currentTurnIndex: 0,
    turnsCompletedInRound: 0,
    pendingQuestionId: null,
    currentDecisions: [],
    currentVotes: [],
    lastVoteTie: [],
  });

  logger.log(
    'Successfully seeded Game TEST1 in questioning, round 1, with 5 players.',
  );

  await app.close();
}

bootstrap();
