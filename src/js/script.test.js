import { createNewPiece, isValidMove, mergePiece, clearLines, rotatePiece, gameBoard } from './script.js';
import { describe, test, expect, beforeEach } from 'vitest';

describe('Tetris Game Functions', () => {
  let testBoard;
  
  beforeEach(() => {
    testBoard = Array(20).fill().map(() => Array(10).fill(0));
  });

  describe('createNewPiece', () => {
    test('should create a piece with valid properties', () => {
      const piece = createNewPiece();
      expect(piece).toHaveProperty('shape');
      expect(piece).toHaveProperty('color');
      expect(piece).toHaveProperty('x', Math.floor(10/2) - Math.floor(piece.shape[0].length/2));
      expect(piece).toHaveProperty('y', 0);
    });
  });

  describe('isValidMove', () => {
    test('should allow valid movement', () => {
      const piece = { shape: [[1]], x: 5, y: 5 };
      expect(isValidMove(piece, 5, 5, testBoard)).toBe(true);
    });

    test('should detect wall collisions', () => {
      const piece = { shape: [[1]], x: -1, y: 0 };
      expect(isValidMove(piece, -1, 0, testBoard)).toBe(false);
    });

    test('should detect piece collisions', () => {
      testBoard[5][5] = '#ffffff';
      const piece = { shape: [[1]], x: 0, y: 0 };
      expect(isValidMove(piece, 5, 5, testBoard)).toBe(false);
    });
  });

  describe('mergePiece', () => {
    test('should merge piece into board', () => {
      const piece = { 
        shape: [[1]], 
        x: 5, 
        y: 5,
        color: '#ff0000'
      };
      mergePiece(testBoard, piece);
      expect(testBoard[5][5]).toBe('#ff0000');
    });
  });

  describe('clearLines', () => {
    test('should clear completed lines', () => {
      // Create a full line at bottom
      testBoard[19] = Array(10).fill('#ffffff');
      const linesCleared = clearLines(testBoard);
      expect(linesCleared).toBe(1);
      expect(testBoard[19].every(cell => cell === 0)).toBe(true);
    });
  });

  describe('rotatePiece', () => {
    test('should rotate piece correctly', () => {
      const original = [[1,0], [1,1]];
      const rotated = rotatePiece(original);
      expect(rotated).toEqual([[1,1], [1,0]]);
    });
  });
});