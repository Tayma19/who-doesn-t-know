import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateGameDto } from './dto/create-game.dto';
import { JoinGameDto } from './dto/join-game.dto';
import { PlayerActionDto } from './dto/player-action.dto';
import { GamesService } from './games.service';
@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}
  @Post() @ApiOperation({ summary: 'Create a game and its host player' }) createGame(@Body() dto: CreateGameDto) { return this.gamesService.createGame(dto); }
  @Post('join') @ApiOperation({ summary: 'Join an existing lobby' }) joinGame(@Body() dto: JoinGameDto) { return this.gamesService.joinGame(dto); }
  @Post(':roomCode/start') @ApiOperation({ summary: 'Start the game as host' }) startGame(@Param('roomCode') roomCode: string, @Body() dto: PlayerActionDto) { return this.gamesService.startGame(roomCode, dto.playerId); }
  @Get(':roomCode/state') @ApiOperation({ summary: 'Get public game state' }) getState(@Param('roomCode') roomCode: string) { return this.gamesService.getState(roomCode); }
  @Get(':roomCode/me') @ApiOperation({ summary: 'Get this player’s private role' }) @ApiQuery({ name: 'playerId', required: true }) getMe(@Param('roomCode') roomCode: string, @Query('playerId') playerId: string) { return this.gamesService.getMe(roomCode, playerId); }
}
