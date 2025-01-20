import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';
export interface Piece {
  type: string;
  color: string; // 'w' for white, 'b' for black
}

export type Square = Piece | null;

export type Board = Square[][];

@Injectable()
export class ChessService {
  private board: Board;
  private currentTurn: 'w' | 'b';
  private moveHistory: string[];

  constructor(private readonly databaseService: DatabaseService) {
    this.resetGame();
  }

  resetGame(): void {
    this.board = this.initializeBoard();
    this.currentTurn = 'w';
    this.moveHistory = [];
  }

  async makeMove(
    from: string,
    to: string,
    author: string = '',
  ): Promise<string> {
    const fromPos = this.convertToIndices(from);
    const toPos = this.convertToIndices(to);

    if (!fromPos || !toPos) {
      return 'Invalid square.';
    }

    const piece = this.board[fromPos.row][fromPos.col];

    if (!piece) {
      return 'No piece at the selected square.';
    }

    if (piece.color !== this.currentTurn) {
      return `It is not ${piece.color === 'w' ? 'white' : 'black'}'s turn.`;
    }

    if (!this.isValidMove(fromPos, toPos, piece)) {
      return 'Invalid move.';
    }

    const move = `${piece.color === 'w' ? 'White' : 'Black'}: ${from} -> ${to}${author ? ` by ${author}` : ''}`;
    this.moveHistory.push(move);

    const targetSquare = this.board[toPos.row][toPos.col];
    if (
      targetSquare &&
      targetSquare.type === 'k' &&
      targetSquare.color !== piece.color
    ) {
      const winner = piece.color === 'w' ? 'White' : 'Black';

      await this.databaseService.saveGame(winner, this.moveHistory);
      this.resetGame();

      return `${winner} wins by capturing the king! The game has been reset.`;
    }

    // Move the piece
    this.board[toPos.row][toPos.col] = { ...piece };
    this.board[fromPos.row][fromPos.col] = null;

    // Switch turn
    this.currentTurn = this.currentTurn === 'w' ? 'b' : 'w';

    return `Move made: ${from} -> ${to}`;
  }
  getBoard(): Board {
    return this.board;
  }
  private isValidMove(
    from: { row: number; col: number },
    to: { row: number; col: number },
    piece: Piece,
  ): boolean {
    const targetSquare = this.board[to.row][to.col];
    if (targetSquare && targetSquare.color === piece.color) {
      return false;
    }

    switch (piece.type) {
      case 'p':
        return this.isValidPawnMove(from, to, piece);
      case 'r':
        return this.isValidRookMove(from, to);
      case 'n':
        return this.isValidKnightMove(from, to);
      case 'b':
        return this.isValidBishopMove(from, to);
      case 'q':
        return this.isValidQueenMove(from, to);
      case 'k':
        return this.isValidKingMove(from, to);
      default:
        return false;
    }
  }
  private isValidRookMove(
    from: { row: number; col: number },
    to: { row: number; col: number },
  ): boolean {
    if (from.row !== to.row && from.col !== to.col) {
      return false;
    }

    return this.isPathClear(from, to);
  }

  private isValidKnightMove(
    from: { row: number; col: number },
    to: { row: number; col: number },
  ): boolean {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  }

  private isValidBishopMove(
    from: { row: number; col: number },
    to: { row: number; col: number },
  ): boolean {
    if (Math.abs(to.row - from.row) !== Math.abs(to.col - from.col)) {
      return false;
    }

    return this.isPathClear(from, to);
  }

  private isValidQueenMove(
    from: { row: number; col: number },
    to: { row: number; col: number },
  ): boolean {
    return this.isValidRookMove(from, to) || this.isValidBishopMove(from, to);
  }

  private isValidKingMove(
    from: { row: number; col: number },
    to: { row: number; col: number },
  ): boolean {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);

    if (rowDiff <= 1 && colDiff <= 1) {
      return true;
    }

    // TODO: Add castling logic here in the future
    return false;
  }
  private isValidPawnMove(
    from: { row: number; col: number },
    to: { row: number; col: number },
    piece: Piece,
  ): boolean {
    const direction = piece.color === 'w' ? -1 : 1;
    const startRow = piece.color === 'w' ? 6 : 1;

    if (
      to.row === from.row + direction &&
      to.col === from.col &&
      !this.board[to.row][to.col]
    ) {
      return true;
    }

    if (
      from.row === startRow &&
      to.row === from.row + 2 * direction &&
      to.col === from.col &&
      !this.board[to.row][to.col] &&
      !this.board[from.row + direction][to.col]
    ) {
      return true;
    }

    if (
      to.row === from.row + direction &&
      Math.abs(to.col - from.col) === 1 &&
      this.board[to.row][to.col] &&
      this.board[to.row][to.col]?.color !== piece.color
    ) {
      return true;
    }
    return false;
  }

  private isPathClear(
    from: { row: number; col: number },
    to: { row: number; col: number },
  ): boolean {
    const rowStep = Math.sign(to.row - from.row);
    const colStep = Math.sign(to.col - from.col);
    let currentRow = from.row + rowStep;
    let currentCol = from.col + colStep;

    while (currentRow !== to.row || currentCol !== to.col) {
      if (this.board[currentRow][currentCol]) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }

    return true;
  }

  private convertToIndices(
    square: string,
  ): { row: number; col: number } | null {
    if (!/^[a-h][1-8]$/.test(square)) {
      return null;
    }
    const col = square.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - parseInt(square[1], 10);
    return { row, col };
  }

  private initializeBoard(): Board {
    Array(8).fill(null);
    return [
      // Black pieces
      [
        { type: 'r', color: 'b' },
        { type: 'n', color: 'b' },
        { type: 'b', color: 'b' },
        { type: 'q', color: 'b' },
        { type: 'k', color: 'b' },
        { type: 'b', color: 'b' },
        { type: 'n', color: 'b' },
        { type: 'r', color: 'b' },
      ],
      Array(8)
        .fill(null)
        .map(() => ({ type: 'p', color: 'b' })), // Black pawns
      ...Array(4)
        .fill(null)
        .map(() => Array(8).fill(null)), // Empty rows
      Array(8)
        .fill(null)
        .map(() => ({ type: 'p', color: 'w' })), // White pawns
      [
        { type: 'r', color: 'w' },
        { type: 'n', color: 'w' },
        { type: 'b', color: 'w' },
        { type: 'q', color: 'w' },
        { type: 'k', color: 'w' },
        { type: 'b', color: 'w' },
        { type: 'n', color: 'w' },
        { type: 'r', color: 'w' },
      ],
    ];
  }
}
