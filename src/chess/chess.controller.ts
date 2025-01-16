import { Controller, Get, Post, Body, Param, ParseIntPipe } from "@nestjs/common";
import { ChessService, Board } from './chess.service';
import { DatabaseService } from './database.service';

@Controller('chess')
export class ChessController {
  constructor(private readonly chessService: ChessService, private readonly databaseService: DatabaseService) {}

  @Get('board')
  getBoard(): Board {
    return this.chessService.getBoard();
  }

  @Post('move')
  async makeMove(@Body() body: { from: string; to: string }): Promise<string> {
    const { from, to } = body;
    return this.chessService.makeMove(from, to);
  }

  @Post('reset')
  resetGame() {
    this.chessService.resetGame();
    return { message: 'Game has been reset.' };
  }
  @Get('game/:id')
  async getGameHistory(@Param('id', ParseIntPipe) gameId: number) {
    try {
      const game = await this.databaseService.getGameHistory(gameId);
      return {
        success: true,
        game: {
          id: game.id,
          winner: game.winner,
          history: game.history,
          date: game.date,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
