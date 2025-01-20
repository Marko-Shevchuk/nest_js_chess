import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    const { username, password } = body;
    if (!username || !password) {
      throw new BadRequestException('Username and password are required');
    }
    await this.authService.register(username, password);
    return { message: 'User registered successfully' };
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const { username, password } = body;
    const token = await this.authService.login(username, password);
    if (!token) {
      throw new BadRequestException('Invalid username or password');
    }
    return { token };
  }
}
