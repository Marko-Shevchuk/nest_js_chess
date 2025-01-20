import { Controller, Get, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  @Get()
  serveRoot(@Res() res: Response) {
    res.sendFile(join(__dirname, '..', 'html', 'index.html'));
  }

  @Get('history')
  serveHistoryWithoutId(@Res() res: Response) {
    res
      .status(400)
      .send('No game ID provided. Use /history/:id to view a specific game.');
  }

  @Get('history/:id')
  serveHistoryWithId(@Res() res: Response) {
    res.sendFile(join(__dirname, '..', 'html', 'history.html'));
  }

  @Get('login')
  serveLoginPage(@Res() res: Response) {
    res.sendFile(join(__dirname, '..', 'html', 'login.html'));
  }
  @Get('register')
  serveRegisterPage(@Res() res: Response) {
    res.sendFile(join(__dirname, '..', 'html', 'register.html'));
  }
}
