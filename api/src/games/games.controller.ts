import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateGameDto } from './dto/create-game.dto';
import { JoinGameDto } from './dto/join-game.dto';
import { PlayerActionDto } from './dto/player-action.dto';
import { PrivateRoleQueryDto } from './dto/private-role-query.dto';
import { GamesService } from './games.service';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a game and its host player' })
  @ApiCreatedResponse({
    description: 'Game and host player created successfully',
  })
  createGame(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.createGame(createGameDto);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join a game in the lobby' })
  @ApiCreatedResponse({
    description: 'Player joined the game successfully',
  })
  joinGame(@Body() joinGameDto: JoinGameDto) {
    return this.gamesService.joinGame(joinGameDto);
  }

  @Post(':roomCode/start')
  @ApiOperation({ summary: 'Start a lobby game as its host' })
  @ApiCreatedResponse({
    description: 'Game started successfully',
  })
  startGame(
    @Param('roomCode') roomCode: string,
    @Body() playerActionDto: PlayerActionDto,
  ) {
    return this.gamesService.startGame(roomCode, playerActionDto);
  }

  @Get(':roomCode/me')
  @ApiOperation({ summary: 'Get the private role view for a player' })
  @ApiQuery({
    name: 'playerId',
    required: true,
    description: 'Private player ID requesting the role view',
  })
  getPrivateRoleView(
    @Param('roomCode') roomCode: string,
    @Query() privateRoleQueryDto: PrivateRoleQueryDto,
  ) {
    return this.gamesService.getPrivateRoleView(roomCode, privateRoleQueryDto);
  }

  @Get(':roomCode/state')
  @ApiOperation({ summary: 'Get the public state of a game' })
  @ApiOkResponse({ description: 'Public game state returned successfully' })
  getPublicState(@Param('roomCode') roomCode: string) {
    return this.gamesService.getPublicState(roomCode);
  }
}
