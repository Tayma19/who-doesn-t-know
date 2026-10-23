import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CounterService } from '../counters/counters.service';
import { CreateGameDto } from './dto/create-game.dto';
import { Game, GameDocument } from './schemas/game.schema';
import { Player, PlayerDocument } from './schemas/player.schema';
import { generatePlayerId, generateRoomCode } from './utils/codes';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);
  private static readonly ROOM_CODE_ATTEMPTS = 10;

  constructor(
    @InjectModel(Game.name)
    private readonly gameModel: Model<GameDocument>,
    @InjectModel(Player.name)
    private readonly playerModel: Model<PlayerDocument>,
    private readonly counterService: CounterService,
  ) {}

  async createGame(createGameDto: CreateGameDto) {
    const displayName = createGameDto.displayName.trim();
    const normalizedName = displayName.toLowerCase();
    const roomCode = await this.reserveRoomCode();
    const gameId = await this.counterService.next('games');
    const playerRef = await this.counterService.next('players');
    const playerId = generatePlayerId();

    await this.gameModel.create({
      id: gameId,
      roomCode,
      status: 'lobby',
      hostRef: playerRef,
      roundNumber: 0,
      turnOrder: [],
      currentTurnIndex: 0,
      turnsCompletedInRound: 0,
      decisionNumber: 0,
      votingNumber: 0,
    });

    await this.playerModel.create({
      id: playerRef,
      gameId,
      displayName,
      normalizedName,
      tempId: playerId,
      isHost: true,
    });

    this.logger.log(`Game created: room code ${roomCode}`);

    return {
      gameId,
      roomCode,
      playerId,
      playerRef,
    };
  }

  private async reserveRoomCode(): Promise<string> {
    for (
      let attempt = 0;
      attempt < GamesService.ROOM_CODE_ATTEMPTS;
      attempt += 1
    ) {
      const roomCode = generateRoomCode();
      const existingGame = await this.gameModel.exists({
        roomCode,
        status: { $ne: 'finished' },
      });

      if (!existingGame) {
        return roomCode;
      }
    }

    throw new ConflictException('Could not generate a unique room code');
  }
}
