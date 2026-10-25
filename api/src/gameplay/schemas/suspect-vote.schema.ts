import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type SuspectVoteDocument = SuspectVote & Document;
@Schema({ collection: 'suspect_votes', versionKey: false })
export class SuspectVote {
  @Prop({ required: true, unique: true, min: 1 }) id: number;
  @Prop({ required: true, index: true, min: 1 }) gameId: number;
  @Prop({ required: true, min: 1 }) votingNumber: number;
  @Prop({ required: true, min: 1 }) voterRef: number;
  @Prop({ required: true, min: 1 }) suspectRef: number;
  @Prop({ required: true, default: Date.now }) submittedAt: Date;
}
export const SuspectVoteSchema = SchemaFactory.createForClass(SuspectVote);
SuspectVoteSchema.index({ gameId: 1, votingNumber: 1, voterRef: 1 }, { unique: true });
