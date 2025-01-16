import { Module } from '@nestjs/common';
import { ChessModule } from './chess/chess.module';
import { AppController } from './app.controller';

@Module({
  imports: [ChessModule],
  controllers: [AppController],
})
export class AppModule {}
