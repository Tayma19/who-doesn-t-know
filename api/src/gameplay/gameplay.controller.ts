import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GameplayService } from './gameplay.service';
import { AskQuestionDto } from './dto/ask-question.dto';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { SubmitDecisionDto } from './dto/submit-decision.dto';
import { SubmitVoteDto } from './dto/submit-vote.dto';
@ApiTags('gameplay')
@Controller('games')
export class GameplayController {
  constructor(private readonly gameplayService: GameplayService) {}
  @Post(':roomCode/questions')
   @ApiOperation({ summary: 'Ask a question' })
    @ApiCreatedResponse({ description: 'Question saved' })

  askQuestion(@Param('roomCode') roomCode: string, @Body() dto: AskQuestionDto) 
  { return this.gameplayService.askQuestion(roomCode, dto); }


  @Post(':roomCode/questions/:questionId/answer')
   @ApiOperation({ summary: 'Answer the pending question' })
  answerQuestion(@Param('roomCode') roomCode: string, @Param('questionId') questionId: string, @Body() dto: AnswerQuestionDto)

   { return this.gameplayService.answerQuestion(roomCode, Number(questionId), dto); }

  @Post(':roomCode/decisions')
   @ApiOperation({ summary: 'Submit a round decision' })
  submitDecision(@Param('roomCode') roomCode: string, @Body() dto: SubmitDecisionDto)

   { return this.gameplayService.submitDecision(roomCode, dto); }
   
  @Post(':roomCode/votes')
   @ApiOperation({ summary: 'Vote for a suspected hidden player' })
  submitVote(@Param('roomCode') roomCode: string, @Body() dto: SubmitVoteDto)
   { return this.gameplayService.submitVote(roomCode, dto); }
}
