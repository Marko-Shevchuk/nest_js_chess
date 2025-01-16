import { Module } from '@nestjs/common';
import { ChessService } from './chess.service';
import { ChessController } from './chess.controller';
import { DatabaseService } from './database.service';

@Module({
  controllers: [ChessController],
  providers: [ChessService, DatabaseService],
})
export class ChessModule {}
