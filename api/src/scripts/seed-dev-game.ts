import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';

import { AppModule } from '../app.module';

import { Game, GameDocument } from '../games/schemas/game.schema';
import { Player, PlayerDocument } from '../games/schemas/player.schema';
import { Tip, TipDocument } from '../tips/schemas/tip.schema';

import {
  Question,
  QuestionDocument,
} from '../gameplay/schemas/question.schema';
import {
  RoundDecision,
  RoundDecisionDocument,
} from '../gameplay/schemas/round-decision.schema';
import {
  SuspectVote,
  SuspectVoteDocument,
} from '../gameplay/schemas/suspect-vote.schema';

async function bootstrap() {
  const logger = new Logger('SeedDevGame');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const gameModel = app.get<Model<GameDocument>>(getModelToken(Game.name));
    const playerModel = app.get<Model<PlayerDocument>>(
      getModelToken(Player.name),
    );
    const tipModel = app.get<Model<TipDocument>>(getModelToken(Tip.name));
    const questionModel = app.get<Model<QuestionDocument>>(
      getModelToken(Question.name),
    );
    const decisionModel = app.get<Model<RoundDecisionDocument>>(
      getModelToken(RoundDecision.name),
    );
    const voteModel = app.get<Model<SuspectVoteDocument>>(
      getModelToken(SuspectVote.name),
    );

    const old = await gameModel
      .findOne({ roomCode: 'TEST1' })
      .lean()
      .exec();

    if (old && !process.argv.includes('--reset')) {
      throw new Error(
        'TEST1 already exists. Rerun with --reset to recreate the seed.',
      );
    }

    if (old) {
      await Promise.all([
        playerModel.deleteMany({ gameId: old.id }),
        questionModel.deleteMany({ gameId: old.id }),
        decisionModel.deleteMany({ gameId: old.id }),
        voteModel.deleteMany({ gameId: old.id }),
        gameModel.deleteOne({ id: old.id }),
      ]);
    }

    const tip = await tipModel
      .findOne({ active: true })
      .sort({ id: 1 })
      .lean()
      .exec();

    if (!tip) {
      throw new Error('No active secret tip exists.');
    }

    const gameId = 900001;

    const players = [1, 2, 3, 4, 5].map((n) => ({
      id: 900000 + n,
      gameId,
      displayName: ['Taima', 'Ali', 'Alaa', 'Nawar', 'Yazan'][n - 1],
      normalizedName: ['taima', 'ali', 'alaa', 'nawar', 'yazan'][n - 1],
      tempId: `p_test${n}`,
      isHost: n === 1,
    }));

    await playerModel.insertMany(players);

    await gameModel.create({
      id: gameId,
      roomCode: 'TEST1',
      status: 'questioning',
      roundNumber: 1,
      hostRef: 900001,
      hiddenPlayerRef: 900004,
      secretTipId: tip.id,
      turnOrder: players.map((p) => p.id),
      currentTurnIndex: 0,
      turnsCompletedInRound: 0,
      pendingQuestionId: null,
      decisionNumber: 1,
      votingNumber: 1,
    });

    logger.log(
      'Seeded TEST1 in questioning, round 1, with 5 players. Fixed player ids: p_test1 to p_test5.',
    );
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});