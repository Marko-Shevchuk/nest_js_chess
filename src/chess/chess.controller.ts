import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ChessService, Board } from './chess.service';
import { DatabaseService } from './database.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('chess')
export class ChessController {
  constructor(
    private readonly chessService: ChessService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get('board')
  getBoard(): Board {
    return this.chessService.getBoard();
  }

  @Post('move')
  @UseGuards(AuthGuard)
  async makeMove(
    @Body() body: { from: string; to: string },
    @Req() req,
  ): Promise<string> {
    const { from, to } = body;
    const author = req.user?.username || '';
    return this.chessService.makeMove(from, to, author);
  }

  @Post('reset')
  @UseGuards(AuthGuard)
  resetGame() {
    this.chessService.resetGame();
    return { message: 'Game has been reset.' };
  }

  @Get('game-history/:id')
  async getGameHistory(@Param('id') gameId: string) {
    const game = await this.databaseService.getGameHistory(
      parseInt(gameId, 10),
    );
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }
}
