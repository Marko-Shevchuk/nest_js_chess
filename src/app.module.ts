import { Module } from '@nestjs/common';
import { ChessModule } from './chess/chess.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ChessModule, AuthModule],
  controllers: [AppController],
})
export class AppModule {}
