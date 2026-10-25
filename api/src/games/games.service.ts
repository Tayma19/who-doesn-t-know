import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CounterService } from '../counters/counters.service';
import { GameplayReadService } from '../gameplay/gameplay-read.service';
import { CreateGameDto } from './dto/create-game.dto';
import { JoinGameDto } from './dto/join-game.dto';
import { Game, GameDocument } from './schemas/game.schema';
import { Player, PlayerDocument } from './schemas/player.schema';
import { Tip, TipDocument } from '../tips/schemas/tip.schema';
import { RoundDecision, RoundDecisionDocument } from '../gameplay/schemas/round-decision.schema';
import { SuspectVote, SuspectVoteDocument } from '../gameplay/schemas/suspect-vote.schema';
import { generatePlayerId, generateRoomCode } from './utils/codes';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);
  private static readonly ROOM_CODE_ATTEMPTS = 10;
  static readonly MIN_PLAYERS = 4;
  static readonly MAX_PLAYERS = 10;
  constructor(
    @InjectModel(Game.name) private readonly gameModel: Model<GameDocument>,
    @InjectModel(Player.name) private readonly playerModel: Model<PlayerDocument>,
    @InjectModel(Tip.name) private readonly tipModel: Model<TipDocument>,
    @InjectModel(RoundDecision.name) private readonly decisionModel: Model<RoundDecisionDocument>,
    @InjectModel(SuspectVote.name) private readonly voteModel: Model<SuspectVoteDocument>,
    private readonly counter: CounterService,
    private readonly reads: GameplayReadService,
  ) {}
  async createGame(dto: CreateGameDto) {
    const displayName = dto.displayName.trim();
    const gameId = await this.counter.next('games');
    const playerRef = await this.counter.next('players');
    const roomCode = await this.reserveRoomCode();
    const playerId = generatePlayerId();
    await this.gameModel.create({ id: gameId, roomCode, status: 'lobby', roundNumber: 0, hostRef: playerRef, turnOrder: [], currentTurnIndex: 0, turnsCompletedInRound: 0, pendingQuestionId: null, decisionNumber: 0, votingNumber: 0 });
    try {
      await this.playerModel.create({ id: playerRef, gameId, displayName, normalizedName: displayName.toLowerCase(), tempId: playerId, isHost: true });
    } catch (error) { await this.gameModel.deleteOne({ id: gameId }); throw error; }
    this.logger.log(`Game created: room code ${roomCode}.`);
    return { gameId, roomCode, playerId, playerRef };
  }
  async joinGame(dto: JoinGameDto) {
    const game = await this.findGame(dto.roomCode);
    if (game.status !== 'lobby') throw new ConflictException('This game has already started.');
    const playerCount = await this.playerModel.countDocuments({ gameId: game.id });
    if (playerCount >= GamesService.MAX_PLAYERS) throw new ConflictException('This game is full.');
    const displayName = dto.displayName.trim();
    const normalizedName = displayName.toLowerCase();
    if (await this.playerModel.exists({ gameId: game.id, normalizedName })) throw new ConflictException('Display name already used.');
    const playerRef = await this.counter.next('players');
    const playerId = generatePlayerId();
    try { await this.playerModel.create({ id: playerRef, gameId: game.id, displayName, normalizedName, tempId: playerId, isHost: false }); }
    catch (error: any) { if (error?.code === 11000) throw new ConflictException('Display name already used.'); throw error; }
    return { gameId: game.id, roomCode: game.roomCode, playerId, playerRef };
  }
  async startGame(roomCode: string, playerId: string) {
    const game = await this.findGame(roomCode);
    if (game.status !== 'lobby') throw new ConflictException('Game is not in the lobby.');
    const player = await this.playerModel.findOne({ gameId: game.id, tempId: playerId });
    if (!player) throw new ConflictException('Player is not in this game.');
    if (!player.isHost) throw new ConflictException('Only the host can start the game.');
    const players = await this.playerModel.find({ gameId: game.id }).sort({ id: 1 }).exec();
    if (players.length < GamesService.MIN_PLAYERS) throw new BadRequestException(`${GamesService.MIN_PLAYERS - players.length} more players needed`);
    const tips = await this.tipModel.find({ active: true }).select('id').lean().exec();
    if (!tips.length) throw new ConflictException('No active secret tips are available.');
    const turnOrder = players.map((p) => p.id);
    for (let i = turnOrder.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [turnOrder[i], turnOrder[j]] = [turnOrder[j], turnOrder[i]]; }
    const hidden = players[Math.floor(Math.random() * players.length)];
    const tip = tips[Math.floor(Math.random() * tips.length)];
    const changed = await this.gameModel.updateOne({ id: game.id, status: 'lobby' }, { $set: { status: 'questioning', roundNumber: 1, hiddenPlayerRef: hidden.id, secretTipId: tip.id, turnOrder, currentTurnIndex: 0, turnsCompletedInRound: 0, decisionNumber: 1, votingNumber: 1, pendingQuestionId: null, lastDecisionOutcome: null, lastVoteTie: null } });
    if (!changed.modifiedCount) throw new ConflictException('Game has already started.');
    this.logger.log(`Game started: room code ${game.roomCode}, ${players.length} players.`);
    return { ok: true as const };
  }
  async getMe(roomCode: string, playerId: string) {
    const game = await this.findGame(roomCode);
    const player = await this.playerModel.findOne({ gameId: game.id, tempId: playerId }).lean().exec();
    if (!player) throw new NotFoundException('Player not found in this game.');
    const role = game.status === 'lobby' ? 'waiting' : player.id === game.hiddenPlayerRef ? 'hidden' : 'informed';
    const tip = role === 'informed' && game.secretTipId ? await this.tipModel.findOne({ id: game.secretTipId }).select('text').lean().exec() : null;
    const [hasDecided, hasVoted] = await Promise.all([
      game.decisionNumber > 0 ? this.decisionModel.exists({ gameId: game.id, decisionNumber: game.decisionNumber, playerRef: player.id }) : false,
      game.votingNumber > 0 ? this.voteModel.exists({ gameId: game.id, votingNumber: game.votingNumber, voterRef: player.id }) : false,
    ]);
    return { playerRef: player.id, displayName: player.displayName, isHost: player.isHost, role, secretTip: tip?.text ?? null, hasDecided: !!hasDecided, hasVoted: !!hasVoted };
  }
  async getState(roomCode: string) {
    const game = await this.findGame(roomCode);
    const [players, log, pendingQuestion, decisionProgress, votingProgress] = await Promise.all([
      this.playerModel.find({ gameId: game.id }).sort({ id: 1 }).lean().exec(),
      this.reads.getLog(game.id), this.reads.getPendingQuestion(game.id),
      this.reads.getDecisionProgress(game), this.reads.getVotingProgress(game),
    ]);
    const publicPlayers = players.map((p) => ({ ref: p.id, displayName: p.displayName, isHost: p.isHost }));
    const currentPlayerRef = game.status === 'questioning' && game.turnOrder.length ? game.turnOrder[game.currentTurnIndex] ?? null : null;
    const nextPlayerRef = game.status === 'questioning' && game.turnOrder.length ? game.turnOrder[(game.currentTurnIndex + 1) % game.turnOrder.length] ?? null : null;
    let result: any = null;
    if (game.status === 'finished' && game.winner && game.hiddenPlayerRef && game.secretTipId && game.accusedRef) {
      const [tip, voteCounts] = await Promise.all([this.tipModel.findOne({ id: game.secretTipId }).select('text').lean().exec(), this.reads.getVoteCounts(game.id, game.votingNumber)]);
      result = { winner: game.winner, hiddenPlayerRef: game.hiddenPlayerRef, secretTip: tip?.text ?? '', accusedRef: game.accusedRef, voteCounts };
    }
    return {
      gameId: game.id, roomCode: game.roomCode, status: game.status, roundNumber: game.roundNumber, hostRef: game.hostRef,
      players: publicPlayers, minPlayers: GamesService.MIN_PLAYERS, playersNeeded: Math.max(0, GamesService.MIN_PLAYERS - players.length),
      turnOrder: game.turnOrder, currentPlayerRef, nextPlayerRef, turnsCompletedInRound: game.turnsCompletedInRound,
      turnsRemainingInRound: game.status === 'questioning' ? Math.max(0, players.length - game.turnsCompletedInRound) : 0,
      pendingQuestion, log,
      decision: { submittedCount: decisionProgress.submittedCount, totalPlayers: players.length, lastOutcome: game.lastDecisionOutcome },
      voting: { submittedCount: votingProgress.submittedCount, totalPlayers: players.length, lastTie: game.lastVoteTie }, result,
    };
  }
  private async findGame(roomCode: string) {
    const game = await this.gameModel.findOne({ roomCode: roomCode.trim().toUpperCase() }).exec();
    if (!game) throw new NotFoundException('Game not found');
    return game;
  }
  private async reserveRoomCode(): Promise<string> {
    for (let attempt = 0; attempt < GamesService.ROOM_CODE_ATTEMPTS; attempt += 1) {
      const roomCode = generateRoomCode();
      if (!(await this.gameModel.exists({ roomCode, status: { $ne: 'finished' } }))) return roomCode;
    }
    throw new ConflictException('Could not generate a unique room code');
  }
}
