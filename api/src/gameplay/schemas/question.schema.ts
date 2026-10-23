import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Question {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Game' })
  gameId: Types.ObjectId;

  @Prop({ required: true })
  round: number;

  @Prop({ required: true })
  askerRef: string;

  @Prop({ required: true })
  targetRef: string;

  @Prop({ required: true })
  text: string;

  @Prop({ default: null })
  answer: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
