import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateGameDto } from './dto/create-game.dto';
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
}
