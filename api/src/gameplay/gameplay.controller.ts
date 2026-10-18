import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GameplayService } from './gameplay.service';
import { AskQuestionDto } from './dto/ask-question.dto';
import { SubmitDecisionDto } from './dto/submit-decision.dto';

@ApiTags('gameplay')
@Controller('games')
export class GameplayController {
  constructor(private readonly gameplayService: GameplayService) {}

  @ApiOperation({ summary: 'Ask a question (T3)' })
  @Post(':roomCode/questions')
  askQuestion(
    @Param('roomCode') roomCode: string,
    @Body() dto: AskQuestionDto,
  ) {
    return this.gameplayService.askQuestion(roomCode, dto);
  }
  @ApiOperation({ summary: 'Submit a round decision (continue or vote) (T5)' })
  @Post(':roomCode/decisions')
  submitDecision(
    @Param('roomCode') roomCode: string,
    @Body() dto: SubmitDecisionDto,
  ) {
    return this.gameplayService.submitDecision(roomCode, dto);
  }
}
