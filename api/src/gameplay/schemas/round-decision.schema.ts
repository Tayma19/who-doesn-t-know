import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type RoundDecisionDocument = RoundDecision & Document;
@Schema({ collection: 'round_decisions', versionKey: false })
export class RoundDecision {
  @Prop({ required: true, unique: true, min: 1 }) id: number;
  @Prop({ required: true, index: true, min: 1 }) gameId: number;
  @Prop({ required: true, min: 1 }) decisionNumber: number;
  @Prop({ required: true, min: 1 }) playerRef: number;
  @Prop({ required: true, enum: ['continue', 'vote'] }) choice: 'continue' | 'vote';
  @Prop({ required: true, default: Date.now }) submittedAt: Date;
}
export const RoundDecisionSchema = SchemaFactory.createForClass(RoundDecision);
RoundDecisionSchema.index({ gameId: 1, decisionNumber: 1, playerRef: 1 }, { unique: true });
