import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document} from 'mongoose';

export type GameDocument = Game & Document; 

export const GAME_STATUSES = [
  'lobby',
  'questioning',
  'decision',
  'voting',
  'finished',
] as const;

export type GameStatus = (typeof GAME_STATUSES)[number];

@Schema({ collection: 'games', versionKey: false })
export class Game {
  @Prop({ required: true, unique: true, index: true, min: 1 })
  id: number;

  @Prop({ required: true, uppercase: true, match: /^[A-Z0-9]{5}$/ })
  roomCode: string;

  @Prop({ required: true, enum: GAME_STATUSES, default: 'lobby' })
  status: GameStatus;

  @Prop({ required: true, default: 0, min: 0 })
  roundNumber: number;

  @Prop({ required: true, min: 1 })
  hostRef: number;

  @Prop({ min: 1, default: null })
  hiddenPlayerRef: number | null;

  @Prop({ min: 1, default: null })
  secretTipId: number | null;

  @Prop({ type: [Number], default: [] })
  turnOrder: number[];

  @Prop({ required: true, default: 0, min: 0 })
  currentTurnIndex: number;

  @Prop({ required: true, default: 0, min: 0 })
  turnsCompletedInRound: number;

  @Prop({ min: 1, default: null })
  pendingQuestionId: number | null;

  @Prop({ required: true, default: 0, min: 0 })
  decisionNumber: number;

  @Prop({ required: true, default: 0, min: 0 })
  votingNumber: number;

  @Prop({ default: null })
  lastDecisionOutcome: string | null;

  @Prop({ default: false })
  lastVoteTie: boolean;

  @Prop({ min: 1, default: null })
  winner: number | null;

  @Prop({ min: 1, default: null })
  accusedRef: number | null;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

export const GameSchema = SchemaFactory.createForClass(Game);

GameSchema.index({ roomCode: 1, status: 1 });
