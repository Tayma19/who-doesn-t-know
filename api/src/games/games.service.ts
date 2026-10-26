import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { randomInt } from 'node:crypto';
import { Model } from 'mongoose';
import { CounterService } from '../counters/counters.service';
import { GameplayReadService } from '../gameplay/gameplay-read.service';
import { CreateGameDto } from './dto/create-game.dto';
import { JoinGameDto } from './dto/join-game.dto';

import { PlayerActionDto } from './dto/player-action.dto';
import { PrivateRoleQueryDto } from './dto/private-role-query.dto';
import { StateBuilder } from './state.builder';
import { Tip, TipDocument } from '../tips/schemas/tip.schema';
import { Game, GameDocument } from './schemas/game.schema';
import { Player, PlayerDocument } from './schemas/player.schema';
import { RoundDecision, RoundDecisionDocument } from '../gameplay/schemas/round-decision.schema';
import { SuspectVote, SuspectVoteDocument } from '../gameplay/schemas/suspect-vote.schema';
import { generatePlayerId, generateRoomCode } from './utils/codes';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);
  private static readonly ROOM_CODE_ATTEMPTS = 10;
  private static readonly MAX_PLAYERS = 10;

  constructor(
    @InjectModel(Game.name)
    private readonly gameModel: Model<GameDocument>,
    @InjectModel(Player.name)
    private readonly playerModel: Model<PlayerDocument>,

    @InjectModel(Tip.name)
    private readonly tipModel: Model<TipDocument>,
    private readonly counterService: CounterService,
    private readonly stateBuilder: StateBuilder,
  )

  async joinGame(joinGameDto: JoinGameDto) {
    const roomCode = joinGameDto.roomCode.trim().toUpperCase();
    const displayName = joinGameDto.displayName.trim();
    const normalizedName = displayName.toLowerCase();
    const game = await this.gameModel.findOne({ roomCode });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.status !== 'lobby') {
      throw new ConflictException('Game is no longer accepting players');
    }

    const playerCount = await this.playerModel.countDocuments({
      gameId: game.id,
    });

    if (playerCount >= GamesService.MAX_PLAYERS) {
      throw new ConflictException('Game is full');
    }

    const existingPlayer = await this.playerModel.exists({
      gameId: game.id,
      normalizedName,
    });

    if (existingPlayer) {
      throw new ConflictException('Display name is already used in this game');
    }

    const playerRef = await this.counterService.next('players');
    const playerId = generatePlayerId();

    await this.playerModel.create({
      id: playerRef,
      gameId: game.id,
      displayName,
      normalizedName,
      tempId: playerId,
      isHost: false,
    });

    return {
      gameId: game.id,
      roomCode: game.roomCode,
      playerId,
      playerRef,
    };
  }

  async startGame(roomCode: string, playerActionDto: PlayerActionDto) {
    const normalizedRoomCode = roomCode.trim().toUpperCase();
    const game = await this.gameModel.findOne({ roomCode: normalizedRoomCode });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.status !== 'lobby') {
      throw new ConflictException('Game has already started');
    }

    const player = await this.playerModel.findOne({
      gameId: game.id,
      tempId: playerActionDto.playerId,
    });

    if (!player) {
      throw new NotFoundException('Player not found in this game');
    }

    if (!player.isHost) {
      throw new ConflictException('Only the host can start the game');
    }

    const players = await this.playerModel
      .find({ gameId: game.id })
      .sort({ id: 1 })
      .lean();

    const playersNeeded = 4 - players.length;

    if (playersNeeded > 0) {
      throw new BadRequestException(`${playersNeeded} more players needed`);
    }

    const activeTips = await this.tipModel.find({ active: true }).lean();

    if (activeTips.length === 0) {
      throw new BadRequestException('No active tip available');
    }

    const hiddenPlayer = players[randomInt(players.length)];
    const secretTip = activeTips[randomInt(activeTips.length)];
    const turnOrder = this.shuffle(players.map(({ id }) => id));

    const startedGame = await this.gameModel.findOneAndUpdate(
      { id: game.id, status: 'lobby' },
      {
        $set: {
          status: 'questioning',
          roundNumber: 1,
          hiddenPlayerRef: hiddenPlayer.id,
          secretTipId: secretTip.id,
          turnOrder,
          currentTurnIndex: 0,
          turnsCompletedInRound: 0,
          decisionNumber: 1,
          votingNumber: 1,
        },
      },
      { new: true },
    );

    if (!startedGame) {
      throw new ConflictException('Game has already started');
    }

    this.logger.log(`Game started with ${players.length} players`);

    return {
      gameId: startedGame.id,
      roomCode: startedGame.roomCode,
      status: startedGame.status,
      playerCount: players.length,
    };
  }

  async getPrivateRoleView(
    roomCode: string,
    privateRoleQueryDto: PrivateRoleQueryDto,
  ) {
    const normalizedRoomCode = roomCode.trim().toUpperCase();
    const game = await this.gameModel.findOne({ roomCode: normalizedRoomCode });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const player = await this.playerModel.findOne({
      gameId: game.id,
      tempId: privateRoleQueryDto.playerId,
    });

    if (!player) {
      throw new NotFoundException('Player not found in this game');
    }

    const actionFlags = {
      hasDecided: false,
      hasVoted: false,
    };

    if (game.status === 'lobby') {
      return {
        role: 'waiting',
        secretTip: null,
        ...actionFlags,
      };
    }

    const isHiddenPlayer = game.hiddenPlayerRef === player.id;

    if (isHiddenPlayer) {
      return {
        role: 'hidden',
        secretTip: null,
        ...actionFlags,
      };
    }

    if (!game.secretTipId) {
      throw new NotFoundException('Secret tip not found for this game');
    }

    const secretTip = await this.tipModel
      .findOne({ id: game.secretTipId })
      .lean();

    if (!secretTip) {
      throw new NotFoundException('Secret tip not found for this game');
    }

    return {
      role: 'informed',
      secretTip: secretTip.text,
      ...actionFlags,
    };
  }

  async getPublicState(roomCode: string) {
    const normalizedRoomCode = roomCode.trim().toUpperCase();
    const game = await this.gameModel.findOne({ roomCode: normalizedRoomCode });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return this.stateBuilder.build(game);
  }

  private shuffle<T>(items: T[]): T[] {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = randomInt(index + 1);
      [shuffled[index], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[index],
      ];
    }

    return shuffled;
  }


=======
  private async findGame(roomCode: string) {
    const game = await this.gameModel.findOne({ roomCode: roomCode.trim().toUpperCase() }).exec();
    if (!game) throw new NotFoundException('Game not found');
    return game;
  }
>>>>>>> origin/tayma
  private async reserveRoomCode(): Promise<string> {
    for (let attempt = 0; attempt < GamesService.ROOM_CODE_ATTEMPTS; attempt += 1) {
      const roomCode = generateRoomCode();
      if (!(await this.gameModel.exists({ roomCode, status: { $ne: 'finished' } }))) return roomCode;
    }
    throw new ConflictException('Could not generate a unique room code');
  }
}
