import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type QuestionDocument = Question & Document;
@Schema({ collection: 'questions', versionKey: false })
export class Question {
  @Prop({ required: true, unique: true, min: 1 }) id: number;
  @Prop({ required: true, index: true, min: 1 }) gameId: number;
  @Prop({ required: true, min: 1 }) round: number;
  @Prop({ required: true, min: 1 }) askerRef: number;
  @Prop({ required: true, min: 1 }) targetRef: number;
  @Prop({ required: true, trim: true }) text: string;
  @Prop({ default: null, trim: true }) answer: string | null;
  @Prop({ required: true, default: Date.now }) askedAt: Date;
  @Prop({ default: null }) answeredAt: Date | null;
}
export const QuestionSchema = SchemaFactory.createForClass(Question);
QuestionSchema.index({ gameId: 1, id: 1 }, { unique: true });
QuestionSchema.index({ gameId: 1, askedAt: 1 });
