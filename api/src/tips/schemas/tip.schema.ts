import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type TipDocument = Tip & Document;
@Schema({ collection: 'secret_tips', versionKey: false })
export class Tip {
  @Prop({ required: true, unique: true, index: true, min: 1 })
  id: number;

  @Prop({ required: true, trim: true })
  text: string;

  @Prop({ required: true, trim: true })
  category: string;

  @Prop({ required: true, default: true, index: true })
  active: boolean;
}

export const TipSchema = SchemaFactory.createForClass(Tip);