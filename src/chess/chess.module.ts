import { Module } from '@nestjs/common';
import { ChessController } from './chess.controller';
import { ChessService } from './chess.service';
import { DatabaseService } from './database.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ChessController],
  providers: [ChessService, DatabaseService],
})
export class ChessModule {}
