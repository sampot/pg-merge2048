import { describe, expect, it } from "vitest";
import {
  applyMove,
  canMove,
  emptyBoard,
  maxTile,
  move,
  newGame,
  spawnTile,
} from "./game.js";

describe("slide merge", () => {
  it("merges equal tiles left", () => {
    const board = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const res = move(board, "left");
    expect(res.board[0]).toEqual([4, 0, 0, 0]);
    expect(res.scoreGain).toBe(4);
    expect(res.moved).toBe(true);
  });

  it("does not chain-merge in one move", () => {
    const board = [
      [2, 2, 4, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const res = move(board, "left");
    expect(res.board[0]).toEqual([4, 4, 0, 0]);
  });

  it("moves up", () => {
    const board = [
      [0, 0, 0, 0],
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const res = move(board, "up");
    expect(res.board[0][0]).toBe(4);
  });
});

describe("game flow", () => {
  it("newGame has two tiles", () => {
    const g = newGame(() => 0);
    const count = g.board.flat().filter((v) => v !== 0).length;
    expect(count).toBe(2);
  });

  it("spawn prefers 2", () => {
    const board = emptyBoard(4);
    const { spawned } = spawnTile(board, () => 0.5);
    expect(spawned.value).toBe(2);
  });

  it("detects no moves", () => {
    const board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];
    expect(canMove(board)).toBe(false);
  });

  it("applyMove updates score", () => {
    let state = {
      board: [
        [2, 2, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      score: 0,
      won: false,
      over: false,
      wonOnce: false,
    };
    const { state: next, changed } = applyMove(state, "left", () => 0);
    expect(changed).toBe(true);
    expect(next.score).toBe(4);
    expect(maxTile(next.board)).toBeGreaterThanOrEqual(4);
  });
});
