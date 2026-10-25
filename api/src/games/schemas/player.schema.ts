import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type PlayerDocument = Player & Document;
@Schema({ collection: 'players', versionKey: false })
export class Player {
  @Prop({ required: true, unique: true, index: true, min: 1 }) id: number;
  @Prop({ required: true, index: true, min: 1 }) gameId: number;
  @Prop({ required: true, trim: true }) displayName: string;
  @Prop({ required: true, trim: true }) normalizedName: string;
  @Prop({ required: true, unique: true, trim: true }) tempId: string;
  @Prop({ required: true, default: false }) isHost: boolean;
  @Prop({ required: true, default: Date.now }) joinedAt: Date;
}
export const PlayerSchema = SchemaFactory.createForClass(Player);
PlayerSchema.index({ gameId: 1, normalizedName: 1 }, { unique: true });
PlayerSchema.index({ gameId: 1 });
