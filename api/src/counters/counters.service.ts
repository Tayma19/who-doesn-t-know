import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel, ModelDefinition } from '@nestjs/mongoose';
import { Counter, CounterDocument } from './schemas/counter.schema';
import { Model } from 'mongoose';

@Injectable()
export class CounterService {
  constructor(
    @InjectModel(Counter.name)
    private readonly model: Model<CounterDocument>,
  ) {}

  async next(name: string): Promise<number> {
    const sequenceName = name.trim();

    if (!sequenceName) {
      throw new BadRequestException('Counter name is required');
    }

    const counter = await this.model.findOneAndUpdate(
      { name: sequenceName },
      { $inc: { seq: 1 } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    if (!counter) {
      throw new Error(`Failed to generate counter value for ${sequenceName}`);
    }

    return counter.seq;
  }
}
