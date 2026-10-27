import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CounterService } from '../counters/counters.service';

import { Tip, TipDocument } from './schemas/tip.schema';
import { SEED_TIPS } from './tips.seed';
import { CreateTipDto } from './dto/create-tip.dto';
import { UpdateTipDto } from './dto/update-tip.dto';

@Injectable()
export class TipsService implements OnModuleInit {
  private readonly logger = new Logger(TipsService.name);

  constructor(
    @InjectModel(Tip.name)
    private readonly model: Model<TipDocument>,

    private readonly counter: CounterService,
  ) {}

  async onModuleInit() {
    if (await this.model.countDocuments()) {
      return;
    }

    const tips = [];

    for (const tip of SEED_TIPS) {
      tips.push({
        id: await this.counter.next('tips'),
        ...tip,
        active: true,
      });
    }

    await this.model.insertMany(tips);

    this.logger.log(
      `Seeded ${tips.length} secret tips in ${
        new Set(tips.map((t) => t.category)).size
      } categories.`,
    );
  }

  async list() {
    return this.model.find().sort({ id: 1 }).lean().exec();
  }

  async create(dto: CreateTipDto) {
    const id = await this.counter.next('tips');

    return this.model.create({
      id,
      text: dto.text.trim(),
      category: dto.category,
      active: true,
    });
  }

  async update(id: number, dto: UpdateTipDto) {
    const tip = await this.model
      .findOneAndUpdate(
        { id },
        {
          $set: {
            ...(dto.text !== undefined ? { text: dto.text.trim() } : {}),
            ...(dto.category !== undefined ? { category: dto.category } : {}),
          },
        },
        { new: true },
      )
      .lean()
      .exec();

    if (!tip) {
      throw new NotFoundException('Tip not found.');
    }

    return tip;
  }

  async deactivate(id: number) {
    const tip = await this.model
      .findOneAndUpdate({ id }, { $set: { active: false } }, { new: true })
      .lean()
      .exec();

    if (!tip) {
      throw new NotFoundException('Tip not found.');
    }

    return tip;
  }
}