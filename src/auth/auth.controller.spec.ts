import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseService } from '../chess/database.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: jest.Mocked<AuthService>;
  let databaseServiceMock: jest.Mocked<DatabaseService>;
  let jwtServiceMock: jest.Mocked<JwtService>;

  beforeEach(async () => {
    databaseServiceMock = {} as any;

    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    } as any;
    authServiceMock = {
      register: jest.fn(),
      login: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    authServiceMock.register.mockResolvedValue(undefined);
    authServiceMock.login.mockResolvedValue('mock-jwt-token');

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: DatabaseService,
          useValue: databaseServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should throw BadRequestException if username or password is missing', async () => {
      await expect(
        controller.register({ username: '', password: '' }),
      ).rejects.toThrowError(
        new BadRequestException('Username and password are required'),
      );

      await expect(
        controller.register({ username: 'test', password: '' }),
      ).rejects.toThrowError(
        new BadRequestException('Username and password are required'),
      );

      await expect(
        controller.register({ username: '', password: 'password' }),
      ).rejects.toThrowError(
        new BadRequestException('Username and password are required'),
      );
    });

    it('should call AuthService.register and return a success message', async () => {
      const username = 'testuser';
      const password = 'password123';

      const result = await controller.register({ username, password });

      expect(authServiceMock.register).toHaveBeenCalledWith(username, password);
      expect(result).toEqual({ message: 'User registered successfully' });
    });
  });

  describe('login', () => {
    it('should throw BadRequestException if login fails', async () => {
      const username = 'testuser';
      const password = 'password123';

      authServiceMock.login.mockResolvedValue(null); // Simulating failed login (invalid credentials)

      await expect(
        controller.login({ username, password }),
      ).rejects.toThrowError(
        new BadRequestException('Invalid username or password'),
      );
    });

    it('should call AuthService.login and return a token', async () => {
      const username = 'testuser';
      const password = 'password123';
      const token = 'mock-jwt-token';

      authServiceMock.login.mockResolvedValue(token); // Mock a successful login

      const result = await controller.login({ username, password });

      expect(authServiceMock.login).toHaveBeenCalledWith(username, password);
      expect(result).toEqual({ token });
    });
  });
});
