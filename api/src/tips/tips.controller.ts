import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTipDto } from './dto/create-tip.dto';
import { UpdateTipDto } from './dto/update-tip.dto';
import { InternalToolGuard } from './internal-tool.guard';
import { TipsService } from './tips.service';

@ApiTags('tips')
@Controller('tips')
@UseGuards(InternalToolGuard)
export class TipsController {
  constructor(private readonly tips: TipsService) {}

  @Get()
  @ApiOperation({ summary: 'List secret tips for internal tooling' })
  @ApiHeader({ name: 'x-internal-token', required: true })
  list() {
    return this.tips.list();
  }

  @Post()
  @ApiOperation({ summary: 'Create a secret tip' })
  @ApiHeader({ name: 'x-internal-token', required: true })
  create(@Body() dto: CreateTipDto) {
    return this.tips.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a secret tip' })
  @ApiHeader({ name: 'x-internal-token', required: true })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTipDto) {
    return this.tips.update(id, dto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a secret tip' })
  @ApiHeader({ name: 'x-internal-token', required: true })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.tips.deactivate(id);
  }
}
