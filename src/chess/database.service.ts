import { Injectable } from '@nestjs/common';
import * as sqlite3 from 'sqlite3';

@Injectable()
export class DatabaseService {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database('./chess_game.db', (err) => {
      if (err) {
        console.error('Failed to connect to the database:', err.message);
      } else {
        console.log('Connected to the SQLite database.');
        this.initializeSchema();
      }
    });
  }

  private initializeSchema(): void {
    const dropGamesTableQuery = `DROP TABLE IF EXISTS games`;
    const dropUsersTableQuery = `DROP TABLE IF EXISTS users`;

    const createGamesTableQuery = `
      CREATE TABLE games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        winner TEXT NOT NULL,
        history TEXT NOT NULL,
        date TEXT NOT NULL
      )
    `;
    const createUserTableQuery = `
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `;

    this.db.serialize(() => {
      this.db.run(dropGamesTableQuery);
      this.db.run(dropUsersTableQuery);
      this.db.run(createGamesTableQuery);
      this.db.run(createUserTableQuery, (err) => {
        if (err) {
          console.error('Failed to create users table:', err.message);
        } else {
          console.log('Users table initialized.');
        }
      });
    });
  }
  saveGame(winner: string, history: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
          INSERT INTO games (winner, history, date)
          VALUES (?, ?, ?)
      `;
      this.db.run(
        query,
        [winner, JSON.stringify(history), new Date().toISOString()],
        (err) => {
          if (err) {
            console.error('Failed to save game:', err.message);
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  }

  getGameHistory(gameId: number): Promise<{ id: number; winner: string; history: string[]; date: string }> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM games WHERE id = ?`;
      this.db.get(query, [gameId], (err, row) => {
        if (err) {
          console.error('Failed to fetch game history:', err.message);
          reject(err);
        } else if (row) {
          const game = row as { id: number; winner: string; history: string; date: string }; // Explicitly cast row
          resolve({
            id: game.id,
            winner: game.winner,
            history: JSON.parse(game.history),
            date: game.date,
          });
        } else {
          reject(new Error('Game not found.'));
        }
      });
    });
  }

  run(query: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  get<T>(query: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }
}
