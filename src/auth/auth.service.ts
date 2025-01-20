import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../chess/database.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

interface User {
  id: number;
  username: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string): Promise<string> {
    const query = `SELECT * FROM users WHERE username = ?`;
    const user = await this.databaseService.get<User>(query, [username]);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const payload = { id: user.id, username: user.username };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });
    return token;
  }

  async register(username: string, password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
    await this.databaseService.run(query, [username, hashedPassword]);
  }
}
