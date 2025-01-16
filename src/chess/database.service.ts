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
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS games (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             winner TEXT NOT NULL,
                                             history TEXT NOT NULL,
                                             date TEXT NOT NULL
        )
    `;
    this.db.run(createTableQuery, (err) => {
      if (err) {
        console.error('Failed to initialize database schema:', err.message);
      }
    });
  }

  saveGame(winner: string, history: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
          INSERT INTO games (winner, history, date)
          VALUES (?, ?, ?)
      `;
      this.db.run(query, [winner, JSON.stringify(history), new Date().toISOString()], (err) => {
        if (err) {
          console.error('Failed to save game:', err.message);
          reject(err);
        } else {
          resolve();
        }
      });
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
          resolve({
            id: row.id,
            winner: row.winner,
            history: JSON.parse(row.history),
            date: row.date,
          });
        } else {
          reject(new Error('Game not found.'));
        }
      });
    });
  }
}
