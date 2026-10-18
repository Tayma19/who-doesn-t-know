import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Tip, TipDocument } from "./schemas/tip.schema";
import { Model } from "mongoose";
import { CounterService } from "../counters/counters.service";
import { SEED_TIPS } from "./tips.seed";


@Injectable()

export class TipsService implements OnModuleInit {
  private readonly logger = new Logger(TipsService.name);

  constructor(
    @InjectModel(Tip.name)
    private readonly model: Model<TipDocument>,
    private readonly counterService: CounterService,
  ) {}

  async onModuleInit(): Promise<void> {
    const existingCount = await this.model.countDocuments();

    if (existingCount > 0) {
      return;
    }

    const tips = [];

    for (const seedTip of SEED_TIPS) {
      tips.push({
        id: await this.counterService.next('tips'),
        text: seedTip.text,
        category: seedTip.category,
        active: true,
      });
    }

    await this.model.insertMany(tips, { ordered: true });

    this.logger.log(`Seeded ${tips.length} secret tips`);
  }
}