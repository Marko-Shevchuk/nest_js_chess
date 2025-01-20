import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { Response } from 'express';
import { join } from 'path';

describe('AppController', () => {
  let appController: AppController;
  let res: Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = module.get<AppController>(AppController);
    res = {
      sendFile: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('serveRoot', () => {
    it('should serve the root index.html', () => {
      const filePath = join(__dirname, '..', 'html', 'index.html');
      appController.serveRoot(res);
      expect(res.sendFile).toHaveBeenCalledWith(filePath);
    });
  });

  describe('serveHistoryWithoutId', () => {
    it('should return a 400 status and a no game ID message', () => {
      appController.serveHistoryWithoutId(res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        'No game ID provided. Use /history/:id to view a specific game.',
      );
    });
  });

  describe('serveHistoryWithId', () => {
    it('should serve the history.html file when given an id', () => {
      const filePath = join(__dirname, '..', 'html', 'history.html');
      appController.serveHistoryWithId(res);
      expect(res.sendFile).toHaveBeenCalledWith(filePath);
    });
  });

  describe('serveLoginPage', () => {
    it('should serve the login.html file', () => {
      const filePath = join(__dirname, '..', 'html', 'login.html');
      appController.serveLoginPage(res);
      expect(res.sendFile).toHaveBeenCalledWith(filePath);
    });
  });

  describe('serveRegisterPage', () => {
    it('should serve the register.html file', () => {
      const filePath = join(__dirname, '..', 'html', 'register.html');
      appController.serveRegisterPage(res);
      expect(res.sendFile).toHaveBeenCalledWith(filePath);
    });
  });
});
